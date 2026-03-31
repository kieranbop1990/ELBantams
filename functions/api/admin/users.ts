import { createAuth } from "../../lib/auth";
import { ensureTables } from "../../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

async function requireAdmin(context: EventContext<Env, string, unknown>) {
  await ensureTables(context.env.DB);
  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return { error: new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })};
  }

  const role = (session.user as Record<string, unknown>).role;
  if (role !== "admin") {
    return { error: new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })};
  }

  return { session };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result && result.error) return result.error;

  const users = await context.env.DB
    .prepare('SELECT id, name, email, role, createdAt FROM "user" ORDER BY createdAt ASC')
    .all<UserRow>();

  return new Response(JSON.stringify({ users: users.results }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const result = await requireAdmin(context);
  if ("error" in result && result.error) return result.error;

  const body = await context.request.json() as { userId?: string; role?: string };
  const { userId, role } = body;

  if (!userId || !role) {
    return new Response(JSON.stringify({ error: "userId and role required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validRoles = ["member", "admin", "manager"];
  if (!validRoles.includes(role)) {
    return new Response(JSON.stringify({ error: "Invalid role. Must be 'member', 'admin', or 'manager'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await context.env.DB
    .prepare('UPDATE "user" SET role = ? WHERE id = ?')
    .bind(role, userId)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
