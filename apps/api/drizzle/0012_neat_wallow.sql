CREATE TABLE IF NOT EXISTS "organization_requests" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"country" varchar(128) NOT NULL,
	"city" varchar(128) NOT NULL,
	"address" text NOT NULL,
	"postal_code" varchar(32) NOT NULL,
	"region" varchar(128) NOT NULL,
	"type" varchar(64) NOT NULL,
	"owner_name" varchar(256) NOT NULL,
	"contact_email" varchar(256) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"decision_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"country" varchar(128) NOT NULL,
	"city" varchar(128) NOT NULL,
	"address" text NOT NULL,
	"postal_code" varchar(32) NOT NULL,
	"region" varchar(128) NOT NULL,
	"type" varchar(64) NOT NULL,
	"owner_name" varchar(256) NOT NULL,
	"contact_email" varchar(256) NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"password_hash" varchar(256) NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_unique" ON "organizations" ("slug");
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN IF NOT EXISTS "copy_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "course_materials" ADD COLUMN IF NOT EXISTS "open_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "organization_id" uuid;
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "share_token" varchar(128);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "share_token_updated_at" timestamp;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM "organizations"
		WHERE "slug" = 'tda'
	) THEN
		INSERT INTO "organizations" (
			"name",
			"slug",
			"country",
			"city",
			"address",
			"postal_code",
			"region",
			"type",
			"owner_name",
			"contact_email",
			"status",
			"password_hash",
			"must_change_password"
		)
		VALUES (
			'TdA',
			'tda',
			'Czech Republic',
			'Brno',
			'Veveří 95',
			'602 00',
			'Central Europe',
			'HO',
			'TdA Platform',
			'admin@tda-app.com',
			'active',
			'$2b$10$325zi1Kpc7EPkLlwUcFWW.GiI/e0FUiIcbrKQ/zdlIDX.bcklYdTC',
			false
		);
	END IF;
END $$;
--> statement-breakpoint
UPDATE "courses"
SET "organization_id" = "organizations"."uuid"
FROM "organizations"
WHERE "courses"."organization_id" IS NULL
  AND "organizations"."slug" = 'tda';
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'courses_organization_id_organizations_uuid_fk'
	) THEN
		ALTER TABLE "courses"
		ADD CONSTRAINT "courses_organization_id_organizations_uuid_fk"
		FOREIGN KEY ("organization_id")
		REFERENCES "public"."organizations"("uuid")
		ON DELETE cascade
		ON UPDATE no action;
	END IF;
END $$;
