ALTER TABLE "shop_orders"
  ADD COLUMN "customer_type" varchar(16) NOT NULL DEFAULT 'guest',
  ADD COLUMN "customer_name" varchar(256),
  ADD COLUMN "organization_name" varchar(256),
  ADD COLUMN "interface_language" varchar(8);

ALTER TABLE "shop_orders"
  ADD CONSTRAINT "shop_orders_customer_type_allowed"
  CHECK ("shop_orders"."customer_type" in ('guest', 'lecturer', 'student'));
