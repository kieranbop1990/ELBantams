import { type Env, json, requireAuth } from "../lib/api-helpers";

type UserTeamRoleRow = {
  id: string;
  teamSlug: string;
  teamLeague: string;
  teamName: string;
  role: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await requireAuth(context);
  if ("error" in result) return result.error;
  const { session } = result;

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
