import { createAuth } from "./auth";
import { ensureTables } from "./ensure-tables";

export interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
}

export function json(res: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(res), {
    ...(init ?? {}),
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export function nowMs(): number {
  return Date.now();
}

export function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function requireAdmin(context: EventContext<Env, string, unknown>) {
  await ensureTables(context.env.DB);
  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) {
    return {
      error: json({ error: "Not authenticated" }, { status: 401 }),
    } as const;
  }
  const role = (session.user as Record<string, unknown>).role;
  if (role !== "admin") {
    return {
      error: json({ error: "Admin access required" }, { status: 403 }),
    } as const;
  }
  return { session } as const;
}

export async function requireManagerOrAdmin(context: EventContext<Env, string, unknown>) {
  await ensureTables(context.env.DB);
  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) {
    return {
      error: json({ error: "Not authenticated" }, { status: 401 }),
    } as const;
  }
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "manager") {
    return {
      error: json({ error: "Manager or admin access required" }, { status: 403 }),
    } as const;
  }
  return { session, role } as const;
}

export async function requireAuth(context: EventContext<Env, string, unknown>) {
  await ensureTables(context.env.DB);
  const baseURL = context.env.BETTER_AUTH_URL ?? new URL(context.request.url).origin;
  const auth = createAuth(context.env, { baseURL });
  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) {
    return {
      error: json({ error: "Not authenticated" }, { status: 401 }),
    } as const;
  }
  return { session, role: (session.user as Record<string, unknown>).role as string } as const;
}
