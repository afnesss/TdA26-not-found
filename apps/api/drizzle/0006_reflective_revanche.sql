ALTER TABLE "courses" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "status_history" jsonb DEFAULT '{"events":[]}'::jsonb;