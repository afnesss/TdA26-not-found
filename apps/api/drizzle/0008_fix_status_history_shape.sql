UPDATE "courses"
SET "status_history" = COALESCE("status_history"->'events', '[]'::jsonb)
WHERE "status_history" IS NULL
   OR jsonb_typeof("status_history") = 'object';
