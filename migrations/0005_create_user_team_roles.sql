CREATE TABLE IF NOT EXISTS "user_team_role" (
  "id"        TEXT    PRIMARY KEY NOT NULL,
  "userId"    TEXT    NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "teamSlug"  TEXT    NOT NULL,
  "teamName"  TEXT    NOT NULL,
  "role"      TEXT    NOT NULL CHECK("role" IN ('coach', 'manager', 'subscriber')),
  "createdAt" INTEGER NOT NULL,
  UNIQUE("userId", "teamSlug")
);
CREATE INDEX IF NOT EXISTS "idx_user_team_role_userId"   ON "user_team_role" ("userId");
CREATE INDEX IF NOT EXISTS "idx_user_team_role_teamSlug" ON "user_team_role" ("teamSlug");
