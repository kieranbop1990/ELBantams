import { ensureTables } from "../lib/ensure-tables";
import { type Env, json } from "../lib/api-helpers";

type ContactRow = {
  id: string;
  role: string;
  name: string;
  email: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);

  const url = new URL(context.request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const league = url.searchParams.get("league") ?? "";

  if (!slug) {
    return json({ contacts: [] });
  }

  // If league is provided, match exactly; otherwise match any league for that slug
  const query = league
    ? `SELECT utr.id, utr.role, u.name, u.email
       FROM user_team_role utr
       JOIN "user" u ON utr.userId = u.id
       WHERE utr.teamSlug = ? AND utr.teamLeague = ? AND utr.role IN ('coach', 'manager')
       ORDER BY utr.role ASC, u.name ASC`
    : `SELECT utr.id, utr.role, u.name, u.email
       FROM user_team_role utr
       JOIN "user" u ON utr.userId = u.id
       WHERE utr.teamSlug = ? AND utr.role IN ('coach', 'manager')
       ORDER BY utr.role ASC, u.name ASC`;

  const stmt = league
    ? context.env.DB.prepare(query).bind(slug, league)
    : context.env.DB.prepare(query).bind(slug);

  const rows = await stmt.all<ContactRow>();

  return json({ contacts: rows.results });
};
