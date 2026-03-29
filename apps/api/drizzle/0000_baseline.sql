CREATE TABLE "course_materials" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"file_url" text,
	"mime_type" varchar(256),
	"size_bytes" integer,
	"original_filename" text,
	"url" text,
	"favicon_url" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"copy_count" integer DEFAULT 0 NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_session_participants" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
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
CREATE TABLE "courses" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"share_token" varchar(128),
	"share_token_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"scheduled_for" timestamp,
	"status_history" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
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
CREATE TABLE "merch_items" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"image_url" text,
	"unit_price_cents" integer NOT NULL,
	"purchase_mode" varchar(16) DEFAULT 'money' NOT NULL,
	"xp_cost" integer,
	"voucher_discount_percent" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merch_items_unit_price_non_negative" CHECK ("merch_items"."unit_price_cents" >= 0),
	CONSTRAINT "merch_items_purchase_mode_allowed" CHECK ("merch_items"."purchase_mode" in ('money', 'xp')),
	CONSTRAINT "merch_items_xp_cost_positive" CHECK ("merch_items"."xp_cost" is null or "merch_items"."xp_cost" > 0),
	CONSTRAINT "merch_items_voucher_discount_percent_range" CHECK ("merch_items"."voucher_discount_percent" is null or ("merch_items"."voucher_discount_percent" > 0 and "merch_items"."voucher_discount_percent" <= 100))
);
--> statement-breakpoint
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
CREATE TABLE "promo_codes" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"discount_type" varchar(16) NOT NULL,
	"discount_value" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"xp_redemption_ref" varchar(128),
	"used_in_order_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	CONSTRAINT "promo_codes_discount_value_positive" CHECK ("promo_codes"."discount_value" > 0),
	CONSTRAINT "promo_codes_discount_type_allowed" CHECK ("promo_codes"."discount_type" in ('fixed', 'percent')),
	CONSTRAINT "promo_codes_percent_limit" CHECK (("promo_codes"."discount_type" <> 'percent') OR ("promo_codes"."discount_value" <= 100))
);
--> statement-breakpoint
CREATE TABLE "quiz_submissions" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"user_id" uuid,
	"participant_id" uuid,
	"score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"difficulty" varchar(20) DEFAULT 'beginner' NOT NULL,
	"questions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_orders" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_email" varchar(320) NOT NULL,
	"items" jsonb NOT NULL,
	"promo_code" varchar(64),
	"subtotal_cents" integer NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shop_orders_subtotal_non_negative" CHECK ("shop_orders"."subtotal_cents" >= 0),
	CONSTRAINT "shop_orders_discount_non_negative" CHECK ("shop_orders"."discount_cents" >= 0),
	CONSTRAINT "shop_orders_total_non_negative" CHECK ("shop_orders"."total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
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
--> statement-breakpoint
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_session_participants" ADD CONSTRAINT "course_session_participants_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_session_participants" ADD CONSTRAINT "course_session_participants_session_id_course_sessions_uuid_fk" FOREIGN KEY ("session_id") REFERENCES "public"."course_sessions"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_uuid_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_used_in_order_id_shop_orders_uuid_fk" FOREIGN KEY ("used_in_order_id") REFERENCES "public"."shop_orders"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quiz_id_quizzes_uuid_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_user_id_users_uuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_participant_id_course_session_participants_uuid_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."course_session_participants"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_module_id_course_modules_uuid_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_session_participants_session_nickname_unique" ON "course_session_participants" USING btree ("session_id","nickname");--> statement-breakpoint
CREATE UNIQUE INDEX "course_session_participants_participant_token_unique" ON "course_session_participants" USING btree ("participant_token");--> statement-breakpoint
CREATE UNIQUE INDEX "merch_items_slug_unique" ON "merch_items" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "course_modules_course_position_unique" ON "course_modules" USING btree ("course_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "promo_codes_code_unique" ON "promo_codes" USING btree ("code");