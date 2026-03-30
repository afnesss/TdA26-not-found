UPDATE "merch_items"
SET "image_url" = CASE
  WHEN "slug" = 'platform-water-bottle' THEN 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80'
  WHEN "slug" = 'platform-notebook' THEN 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80'
  ELSE "image_url"
END
WHERE "slug" IN ('platform-water-bottle', 'platform-notebook');
