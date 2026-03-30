import { createAuth } from "../lib/auth";
import { ensureTables } from "../lib/ensure-tables";

interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  await ensureTables(context.env.DB);
  const auth = createAuth(context.env);
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as Record<string, unknown>).role ?? "member",
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
