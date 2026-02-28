ALTER TABLE "course_materials" ADD COLUMN "download_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "copy_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "open_count" integer DEFAULT 0 NOT NULL;
