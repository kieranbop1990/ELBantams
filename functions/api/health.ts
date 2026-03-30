interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  GITHUB_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const checks: Record<string, unknown> = {};
  const db = context.env.DB;

  // Check D1 binding
  checks.d1_bound = !!db;
  checks.d1_type = typeof db;

  // Check env vars
  checks.has_auth_secret = !!context.env.BETTER_AUTH_SECRET;
  checks.auth_secret_length = context.env.BETTER_AUTH_SECRET?.length ?? 0;
  checks.has_github_token = !!context.env.GITHUB_TOKEN;

  if (db) {
    // Show existing tables
    try {
      const tables = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all<{ name: string }>();
      checks.tables = tables.results.map((r) => r.name);
    } catch (e) {
      checks.tables_error = String(e);
    }

    // Show what's in _migrations
    try {
      const rows = await db
        .prepare("SELECT name, applied_at FROM _migrations")
        .all<{ name: string; applied_at: number }>();
      checks.migrations = rows.results;
    } catch (e) {
      checks.migrations_error = String(e);
    }

    // Try creating a test table directly and report the result
    try {
      const result = await db.exec(`CREATE TABLE IF NOT EXISTS "_health_test" ("id" TEXT PRIMARY KEY NOT NULL)`);
      checks.exec_test = { success: true, result };
    } catch (e) {
      checks.exec_test = { success: false, error: String(e) };
    }

    // Check tables again after test
    try {
      const tables = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all<{ name: string }>();
      checks.tables_after_test = tables.results.map((r) => r.name);
    } catch (e) {
      checks.tables_after_test_error = String(e);
    }

    // Clean up test table
    try {
      await db.exec(`DROP TABLE IF EXISTS "_health_test"`);
    } catch {
      // ignore cleanup errors
    }

    // Try creating the user table directly right now
    try {
      const result = await db.exec(`CREATE TABLE IF NOT EXISTS "user" ("id" TEXT PRIMARY KEY NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE, "emailVerified" INTEGER NOT NULL DEFAULT 0, "image" TEXT, "role" TEXT NOT NULL DEFAULT 'member', "createdAt" INTEGER NOT NULL, "updatedAt" INTEGER NOT NULL)`);
      checks.user_table_exec = { success: true, result };
    } catch (e) {
      checks.user_table_exec = { success: false, error: String(e) };
    }

    // Final table check
    try {
      const tables = await db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all<{ name: string }>();
      checks.tables_final = tables.results.map((r) => r.name);
    } catch (e) {
      checks.tables_final_error = String(e);
    }
  }

  return new Response(JSON.stringify(checks, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
