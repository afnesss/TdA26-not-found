CREATE TABLE "course_modules" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'passive' NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_modules_position_positive" CHECK ("course_modules"."position" > 0)
);
--> statement-breakpoint
ALTER TABLE "course_materials" DROP CONSTRAINT "course_materials_course_id_courses_uuid_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_course_id_courses_uuid_fk";
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN "module_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "module_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_modules_course_position_unique" ON "course_modules" USING btree ("course_id","position");--> statement-breakpoint
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_materials" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "course_id";