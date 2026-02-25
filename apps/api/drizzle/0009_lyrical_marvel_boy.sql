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
ALTER TABLE "course_materials" ADD COLUMN "module_id" uuid;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "module_id" uuid;--> statement-breakpoint
WITH "source_courses" AS (
	SELECT DISTINCT "course_id" FROM "course_materials"
	UNION
	SELECT DISTINCT "course_id" FROM "quizzes"
),
"inserted_modules" AS (
	INSERT INTO "course_modules" ("course_id", "name", "description", "status", "position")
	SELECT
		"source_courses"."course_id",
		'Migrated module',
		'Auto-created for existing records during module migration',
		'passive',
		1
	FROM "source_courses"
	RETURNING "uuid", "course_id"
)
UPDATE "course_materials" AS "cm"
SET "module_id" = "inserted_modules"."uuid"
FROM "inserted_modules"
WHERE "cm"."course_id" = "inserted_modules"."course_id";--> statement-breakpoint
UPDATE "quizzes" AS "q"
SET "module_id" = "cm"."module_id"
FROM "course_materials" AS "cm"
WHERE "q"."course_id" = "cm"."course_id"
  AND "cm"."module_id" IS NOT NULL;--> statement-breakpoint
UPDATE "quizzes" AS "q"
SET "module_id" = "inserted_modules"."uuid"
FROM (
	SELECT "m"."uuid", "m"."course_id"
	FROM "course_modules" AS "m"
	WHERE "m"."position" = 1
) AS "inserted_modules"
WHERE "q"."module_id" IS NULL
  AND "q"."course_id" = "inserted_modules"."course_id";--> statement-breakpoint
ALTER TABLE "course_materials" ALTER COLUMN "module_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "module_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_modules_course_position_unique" ON "course_modules" USING btree ("course_id","position");--> statement-breakpoint
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_materials" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "course_id";
