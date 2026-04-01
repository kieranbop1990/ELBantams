import { type Env, json, requireAuth } from "../lib/api-helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await requireAuth(context);
  if ("error" in result) return result.error;
  const { session } = result;

  return json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as Record<string, unknown>).role ?? "member",
    },
  });
};
