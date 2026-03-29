import { betterAuth } from "better-auth";

export function createAuth(env: { DB: D1Database; BETTER_AUTH_SECRET: string }) {
  return betterAuth({
    database: {
      type: "sqlite",
      url: "", // unused with D1, but required by config
    },
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
  });
}
