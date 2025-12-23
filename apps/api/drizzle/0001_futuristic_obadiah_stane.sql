CREATE TABLE "course_materials" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"file_url" text,
	"mime_type" varchar(256),
	"size_bytes" integer,
	"original_filename" text,
	"url" text,
	"favicon_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;