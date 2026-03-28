ALTER TABLE "course_session_participants" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_session_participants" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;