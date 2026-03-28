ALTER TABLE "merch_items"
  ADD COLUMN IF NOT EXISTS "purchase_mode" varchar(16) DEFAULT 'money' NOT NULL;

ALTER TABLE "merch_items"
  ADD COLUMN IF NOT EXISTS "xp_cost" integer;

ALTER TABLE "merch_items"
  ADD COLUMN IF NOT EXISTS "voucher_discount_percent" integer;

DO $$ BEGIN
  ALTER TABLE "merch_items"
    ADD CONSTRAINT "merch_items_purchase_mode_allowed"
    CHECK ("merch_items"."purchase_mode" in ('money', 'xp'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "merch_items"
    ADD CONSTRAINT "merch_items_xp_cost_positive"
    CHECK ("merch_items"."xp_cost" is null or "merch_items"."xp_cost" > 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "merch_items"
    ADD CONSTRAINT "merch_items_voucher_discount_percent_range"
    CHECK (
      "merch_items"."voucher_discount_percent" is null
      or (
        "merch_items"."voucher_discount_percent" > 0
        and "merch_items"."voucher_discount_percent" <= 100
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
