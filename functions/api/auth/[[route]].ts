import { Hono } from "hono";
import { createAuth } from "../../lib/auth";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.all("/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env);
};
