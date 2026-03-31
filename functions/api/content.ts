import { createAuth } from "../lib/auth";
import { ensureTables } from "../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return json({ error: "Not authenticated" }, { status: 401 });

  const role = (session.user as Record<string, unknown>).role;
  if (role !== "admin") return json({ error: "Admin access required" }, { status: 403 });

  const body = (await context.request.json()) as { file: string; content: unknown };
  const { file, content } = body;

  if (!file || content === undefined) {
    return json({ error: "file and content required" }, { status: 400 });
  }

  const db = context.env.DB;
  const ts = Date.now();

  try {
    if (file === "website/public/data/news.json") {
      const { items } = content as {
        items: Array<{
          title: string;
          text: string;
          body?: string | null;
          link: string;
          linkText: string;
          sections?: string[] | null;
        }>;
      };

      const stmts: D1PreparedStatement[] = [db.prepare("DELETE FROM news_item")];
      for (const item of items ?? []) {
        stmts.push(
          db.prepare(
            `INSERT INTO news_item (id, title, text, body, link, linkText, sections, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `news_${crypto.randomUUID()}`,
            item.title ?? "",
            item.text ?? "",
            item.body ?? null,
            item.link ?? "#",
            item.linkText ?? "Read More",
            item.sections?.length ? JSON.stringify(item.sections) : null,
            ts,
            ts
          )
        );
      }
      await db.batch(stmts);
      return json({ ok: true });
    }

    if (file === "website/public/data/committee.json") {
      const { committee } = content as {
        committee: Array<{ role: string; name: string; contact: string }>;
      };

      const stmts: D1PreparedStatement[] = [db.prepare("DELETE FROM committee_member")];
      for (let i = 0; i < (committee ?? []).length; i++) {
        const member = committee[i];
        stmts.push(
          db.prepare(
            `INSERT INTO committee_member (id, role, name, contact, sortOrder, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `committee_${crypto.randomUUID()}`,
            member.role ?? "",
            member.name ?? "TBC",
            member.contact ?? "TBC",
            i,
            ts,
            ts
          )
        );
      }
      await db.batch(stmts);
      return json({ ok: true });
    }

    if (file === "website/public/data/teams.json") {
      const { sections } = content as {
        sections: Array<{
          id: string; // sectionKey in the frontend (e.g. "robins")
          name: string;
          subtitle: string;
          icon: string;
          logo?: string | null;
          teams: Array<{
            name: string;
            description: string;
            manager: string;
            coach: string;
            contact: string;
            photo?: string | null;
            slug?: string | null;
            sidebar?: boolean;
            managerLabel?: string | null;
            coachLabel?: string | null;
          }>;
        }>;
      };

      // Delete teams before sections to respect the foreign key constraint
      const stmts: D1PreparedStatement[] = [
        db.prepare("DELETE FROM team"),
        db.prepare("DELETE FROM team_section"),
      ];

      for (let si = 0; si < (sections ?? []).length; si++) {
        const section = sections[si];
        const sectionId = `section_${crypto.randomUUID()}`;
        stmts.push(
          db.prepare(
            `INSERT INTO team_section (id, sectionKey, name, subtitle, icon, logo, sortOrder, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            sectionId,
            section.id,
            section.name,
            section.subtitle ?? "",
            section.icon ?? "fa-shield-alt",
            section.logo || null,
            si,
            ts,
            ts
          )
        );

        for (let ti = 0; ti < (section.teams ?? []).length; ti++) {
          const team = section.teams[ti];
          stmts.push(
            db.prepare(
              `INSERT INTO team (id, sectionId, name, description, manager, coach, contact, photo, slug, sidebar, managerLabel, coachLabel, sortOrder, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              `team_${crypto.randomUUID()}`,
              sectionId,
              team.name ?? "",
              team.description ?? "",
              team.manager ?? "TBC",
              team.coach ?? "TBC",
              team.contact ?? "TBC",
              team.photo || null,
              team.slug || null,
              team.sidebar ? 1 : 0,
              team.managerLabel || null,
              team.coachLabel || null,
              ti,
              ts,
              ts
            )
          );
        }
      }

      await db.batch(stmts);
      return json({ ok: true });
    }

    return json({ error: "Invalid file path" }, { status: 400 });
  } catch (err) {
    return json({ error: "Failed to save", details: String(err) }, { status: 500 });
  }
};
