-- Pitch booking system tables

CREATE TABLE IF NOT EXISTS "pitch" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "formats" TEXT NOT NULL, -- JSON array string e.g. '["11v11","9v9"]'
  "description" TEXT,
  "active" INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "booking_request" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "teamName" TEXT NOT NULL,
  "date" TEXT NOT NULL, -- YYYY-MM-DD
  "timeStart" TEXT NOT NULL, -- HH:MM
  "timeEnd" TEXT NOT NULL,   -- HH:MM
  "format" TEXT NOT NULL,    -- 11v11 | 9v9 | 7v7 | 5v5
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending | approved | declined
  "declineReason" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_booking_request_userId" ON "booking_request" ("userId");
CREATE INDEX IF NOT EXISTS "idx_booking_request_date" ON "booking_request" ("date");
CREATE INDEX IF NOT EXISTS "idx_booking_request_status" ON "booking_request" ("status");

CREATE TABLE IF NOT EXISTS "booking" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "requestId" TEXT REFERENCES "booking_request"("id") ON DELETE SET NULL,
  "pitchId" TEXT NOT NULL REFERENCES "pitch"("id"),
  "date" TEXT NOT NULL,      -- YYYY-MM-DD
  "timeStart" TEXT NOT NULL, -- HH:MM
  "timeEnd" TEXT NOT NULL,   -- HH:MM
  "teamName" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_booking_pitchId_date" ON "booking" ("pitchId", "date");
CREATE INDEX IF NOT EXISTS "idx_booking_date" ON "booking" ("date");

-- Seed pitches
INSERT OR IGNORE INTO "pitch" ("id", "name", "formats", "active") VALUES
  ('pitch_1', 'Pitch 1', '["11v11"]', 1),
  ('pitch_2', 'Pitch 2', '["11v11","9v9"]', 1),
  ('pitch_3', 'Pitch 3', '["11v11","9v9"]', 1),
  ('pitch_4', 'Pitch 4', '["11v11","7v7"]', 1),
  ('pitch_5', 'Pitch 5', '["9v9","7v7"]', 1),
  ('pitch_6', 'Pitch 6', '["7v7"]', 1),
  ('pitch_7', 'Pitch 7', '["5v5"]', 1),
  ('pitch_8', 'Pitch 8', '["5v5"]', 1);
