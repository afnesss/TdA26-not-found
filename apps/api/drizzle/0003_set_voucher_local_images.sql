UPDATE "merch_items"
SET "image_url" = CASE
  WHEN "slug" = 'platform-water-bottle' THEN '/api/uploads/12345.png'
  WHEN "slug" = 'platform-notebook' THEN '/api/uploads/5678.png'
  ELSE "image_url"
END
WHERE "slug" IN ('platform-water-bottle', 'platform-notebook');
