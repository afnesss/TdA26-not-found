CREATE TABLE "course_session_participants" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_sessions" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_submissions" ADD COLUMN "participant_id" uuid;--> statement-breakpoint
ALTER TABLE "course_session_participants" ADD CONSTRAINT "course_session_participants_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_session_participants" ADD CONSTRAINT "course_session_participants_session_id_course_sessions_uuid_fk" FOREIGN KEY ("session_id") REFERENCES "public"."course_sessions"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_session_participants_session_nickname_unique" ON "course_session_participants" USING btree ("session_id","nickname");--> statement-breakpoint
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_participant_id_course_session_participants_uuid_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."course_session_participants"("uuid") ON DELETE set null ON UPDATE no action;
