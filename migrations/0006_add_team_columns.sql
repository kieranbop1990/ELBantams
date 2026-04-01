-- Add teamSlug and teamLeague to booking_request and booking tables

ALTER TABLE "booking_request" ADD COLUMN "teamSlug" TEXT;
ALTER TABLE "booking_request" ADD COLUMN "teamLeague" TEXT;

ALTER TABLE "booking" ADD COLUMN "teamSlug" TEXT;
ALTER TABLE "booking" ADD COLUMN "teamLeague" TEXT;

CREATE INDEX IF NOT EXISTS "idx_booking_request_teamSlug" ON "booking_request" ("teamSlug", "teamLeague");
CREATE INDEX IF NOT EXISTS "idx_booking_teamSlug" ON "booking" ("teamSlug", "teamLeague");