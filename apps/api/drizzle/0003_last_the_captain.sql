CREATE TABLE "feed_items" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;