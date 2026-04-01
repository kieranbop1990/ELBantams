import { createAuth } from "../lib/auth";
import { ensureTables } from "../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

type UserTeamRoleRow = {
  id: string;
  teamSlug: string;
  teamLeague: string;
  teamName: string;
  role: string;
};

function json(res: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(res), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);
  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({ headers: context.request.headers });

  if (!session) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  const rows = await context.env.DB
    .prepare(
      `SELECT id, teamSlug, teamLeague, teamName, role
       FROM user_team_role
       WHERE userId = ?
       ORDER BY teamName ASC`
    )
    .bind(userId)
    .all<UserTeamRoleRow>();

  return json({ teams: rows.results });
};
