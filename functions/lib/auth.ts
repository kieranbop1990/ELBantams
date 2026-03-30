import { betterAuth } from "better-auth";

export function createAuth(env: { DB: D1Database; BETTER_AUTH_SECRET: string }) {
  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "member",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const count = await env.DB
              .prepare('SELECT COUNT(*) as c FROM "user"')
              .first<{ c: number }>();
            if (count && count.c === 1) {
              await env.DB
                .prepare('UPDATE "user" SET role = ? WHERE id = ?')
                .bind("admin", user.id)
                .run();
            }
          },
        },
      },
    },
  });
}
