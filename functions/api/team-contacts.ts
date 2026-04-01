import { ensureTables } from "../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

type ContactRow = {
  id: string;
  role: string;
  name: string;
  email: string;
};

function json(res: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(res), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const url = new URL(context.request.url);
  const slug = url.searchParams.get("slug") ?? "";

  if (!slug) {
    return json({ contacts: [] });
  }

  const rows = await context.env.DB
    .prepare(`
      SELECT utr.id, utr.role, u.name, u.email
      FROM user_team_role utr
      JOIN "user" u ON utr.userId = u.id
      WHERE utr.teamSlug = ? AND utr.role IN ('coach', 'manager')
      ORDER BY utr.role ASC, u.name ASC
    `)
    .bind(slug)
    .all<ContactRow>();

  return json({ contacts: rows.results });
};
