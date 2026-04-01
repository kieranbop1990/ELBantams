import { type Env, json, requireAdmin } from "../../lib/api-helpers";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const users = await context.env.DB
    .prepare('SELECT id, name, email, role, createdAt FROM "user" ORDER BY createdAt ASC')
    .all<UserRow>();

  return json({ users: users.results });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result) return result.error;

  const body = await context.request.json() as { userId?: string; role?: string };
  const { userId, role } = body;

  if (!userId || !role) {
    return json({ error: "userId and role required" }, { status: 400 });
  }

  const validRoles = ["member", "admin", "manager"];
  if (!validRoles.includes(role)) {
    return json({ error: "Invalid role. Must be 'member', 'admin', or 'manager'" }, { status: 400 });
  }

  await context.env.DB
    .prepare('UPDATE "user" SET role = ? WHERE id = ?')
    .bind(role, userId)
    .run();

  return json({ ok: true });
};
