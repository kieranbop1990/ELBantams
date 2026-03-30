import { createAuth } from "../../lib/auth";
import { ensureTables } from "../../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

interface LiveFixture {
  id: string;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  team: string;
  home_away: "home" | "away";
  division: string;
}

interface ClubFeed {
  fixtures: LiveFixture[];
}

function inferFormat(teamName: string): string {
  if (/under.?(6|7|8|9)\b/i.test(teamName) || /\bu(6|7|8|9)\b/i.test(teamName)) return "5v5";
  if (/under.?(10|11|12)\b/i.test(teamName) || /\bu(10|11|12)\b/i.test(teamName)) return "9v9";
  return "11v11";
}

function addTwoHours(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String(Math.min(h + 2, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const auth = createAuth(context.env);
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return json({ error: "Not authenticated" }, { status: 401 });

  const role = (session.user as Record<string, unknown>).role;
  if (role !== "admin") return json({ error: "Admin access required" }, { status: 403 });

  const body = await context.request.json() as { clubFeedSlug?: string };
  const { clubFeedSlug } = body;
  if (!clubFeedSlug) return json({ error: "clubFeedSlug is required" }, { status: 400 });

  const feedRes = await fetch(
    `https://raw.githubusercontent.com/adamsuk/fulltimeCalendar/main/feeds/clubs/${clubFeedSlug}.json`
  );
  if (!feedRes.ok) return json({ error: "Failed to fetch club fixture feed" }, { status: 502 });

  const feed = await feedRes.json() as ClubFeed;
  const today = new Date().toISOString().slice(0, 10);

  const homeFixtures = (feed.fixtures ?? []).filter(
    f => f.home_away === "home" && f.date >= today && f.time && f.time !== "00:00" && f.team
  );

  if (homeFixtures.length === 0) {
    return json({ ok: true, created: 0, skipped: 0 });
  }

  const ts = Date.now();
  let created = 0;
  let skipped = 0;

  for (const fixture of homeFixtures) {
    const existing = await context.env.DB
      .prepare("SELECT id FROM booking_request WHERE teamName = ? AND date = ? AND timeStart = ?")
      .bind(fixture.team, fixture.date, fixture.time)
      .first<{ id: string }>();

    if (existing) { skipped++; continue; }

    await context.env.DB
      .prepare(
        `INSERT INTO booking_request (id, userId, teamName, date, timeStart, timeEnd, format, notes, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
      )
      .bind(
        `req_${crypto.randomUUID()}`,
        session.user.id,
        fixture.team,
        fixture.date,
        fixture.time,
        addTwoHours(fixture.time),
        inferFormat(fixture.team),
        `Auto-imported · ${fixture.division}`,
        ts,
        ts
      )
      .run();

    created++;
  }

  return json({ ok: true, created, skipped });
};
