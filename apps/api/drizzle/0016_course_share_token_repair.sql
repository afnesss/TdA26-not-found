ALTER TABLE "courses"
  ADD COLUMN IF NOT EXISTS "share_token" varchar(128);

ALTER TABLE "courses"
  ADD COLUMN IF NOT EXISTS "share_token_updated_at" timestamp;
