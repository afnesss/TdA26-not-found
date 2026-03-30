ALTER TABLE "users" ADD COLUMN "organization_id" uuid;--> statement-breakpoint

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

  UPDATE "users"
  SET "organization_id" = fallback_org_id
  WHERE "organization_id" IS NULL;
END $$;--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_uuid_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_organization_username_unique" ON "users" USING btree ("organization_id","username");
