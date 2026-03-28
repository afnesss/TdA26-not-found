CREATE TABLE IF NOT EXISTS "users" (
  "uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" varchar(64) NOT NULL,
  "password_hash" varchar(256) NOT NULL,
  "role" varchar(20) DEFAULT 'student' NOT NULL,
  "xp" integer DEFAULT 0 NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE("username")
);

ALTER TABLE "quiz_submissions"
  ADD COLUMN IF NOT EXISTS "user_id" uuid;

DO $$
BEGIN
  ALTER TABLE "quiz_submissions"
    ADD CONSTRAINT "quiz_submissions_user_id_users_uuid_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("uuid")
    ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
