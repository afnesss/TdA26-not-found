CREATE TABLE "organization_requests" (
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
CREATE TABLE "organizations" (
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
DO $$
DECLARE
  fallback_org_id uuid;
BEGIN
  SELECT "uuid"
  INTO fallback_org_id
  FROM "organizations"
  ORDER BY "created_at" ASC
  LIMIT 1;

  IF fallback_org_id IS NULL THEN
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
    ) VALUES (
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
      '$2b$10$IEvru76cTkp71N5d082OHe11DRDFJAGQ25FGGJ3Ql3Zn0cd2ebhXu',
      false
    )
    RETURNING "uuid" INTO fallback_org_id;
  END IF;

  UPDATE "courses"
  SET "organization_id" = fallback_org_id
  WHERE "organization_id" IS NULL;
END $$;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_organization_id_organizations_uuid_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("uuid") ON DELETE cascade ON UPDATE no action;
