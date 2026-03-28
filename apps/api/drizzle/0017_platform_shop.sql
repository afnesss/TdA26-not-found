CREATE TABLE IF NOT EXISTS "merch_items" (
  "uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(128) NOT NULL,
  "name" varchar(256) NOT NULL,
  "description" text,
  "image_url" text,
  "unit_price_cents" integer NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "shop_orders" (
  "uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "contact_email" varchar(320) NOT NULL,
  "items" jsonb NOT NULL,
  "promo_code" varchar(64),
  "subtotal_cents" integer NOT NULL,
  "discount_cents" integer DEFAULT 0 NOT NULL,
  "total_cents" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "promo_codes" (
  "uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(64) NOT NULL,
  "discount_type" varchar(16) NOT NULL,
  "discount_value" integer NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_used" boolean DEFAULT false NOT NULL,
  "xp_redemption_ref" varchar(128),
  "used_in_order_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "used_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "merch_items_slug_unique" ON "merch_items" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "promo_codes_code_unique" ON "promo_codes" ("code");

DO $$ BEGIN
  ALTER TABLE "promo_codes"
    ADD CONSTRAINT "promo_codes_used_in_order_id_shop_orders_uuid_fk"
    FOREIGN KEY ("used_in_order_id")
    REFERENCES "public"."shop_orders"("uuid")
    ON DELETE set null
    ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "merch_items"
    ADD CONSTRAINT "merch_items_unit_price_non_negative"
    CHECK ("merch_items"."unit_price_cents" >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "shop_orders"
    ADD CONSTRAINT "shop_orders_subtotal_non_negative"
    CHECK ("shop_orders"."subtotal_cents" >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "shop_orders"
    ADD CONSTRAINT "shop_orders_discount_non_negative"
    CHECK ("shop_orders"."discount_cents" >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "shop_orders"
    ADD CONSTRAINT "shop_orders_total_non_negative"
    CHECK ("shop_orders"."total_cents" >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "promo_codes"
    ADD CONSTRAINT "promo_codes_discount_value_positive"
    CHECK ("promo_codes"."discount_value" > 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "promo_codes"
    ADD CONSTRAINT "promo_codes_discount_type_allowed"
    CHECK ("promo_codes"."discount_type" in ('fixed', 'percent'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "promo_codes"
    ADD CONSTRAINT "promo_codes_percent_limit"
    CHECK (
      ("promo_codes"."discount_type" <> 'percent')
      OR ("promo_codes"."discount_value" <= 100)
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
