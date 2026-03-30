import { Hono } from "hono";
import { createAuth } from "../../lib/auth";
import { ensureTables } from "../../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.all("/api/auth/*", async (c) => {
  if (!c.env.DB) {
    return c.json({ error: "D1 database not bound" }, 500);
  }
  if (!c.env.BETTER_AUTH_SECRET) {
    return c.json({ error: "BETTER_AUTH_SECRET not set" }, 500);
  }
  try {
    await ensureTables(c.env.DB);
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  } catch (e) {
    return c.json({ error: "Auth error", details: String(e) }, 500);
  }
});

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env);
};
