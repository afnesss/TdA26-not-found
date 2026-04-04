ALTER TABLE "courses"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "name_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "description_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "courses"
SET
  "source_locale" = 'cs',
  "name_i18n" = jsonb_build_object('cs', "name"),
  "description_i18n" = CASE
    WHEN "description" IS NULL OR length(trim("description")) = 0 THEN '{}'::jsonb
    ELSE jsonb_build_object('cs', "description")
  END;

ALTER TABLE "course_modules"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "name_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "description_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "course_modules"
SET
  "source_locale" = 'cs',
  "name_i18n" = jsonb_build_object('cs', "name"),
  "description_i18n" = CASE
    WHEN "description" IS NULL OR length(trim("description")) = 0 THEN '{}'::jsonb
    ELSE jsonb_build_object('cs', "description")
  END;

ALTER TABLE "course_materials"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "name_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "description_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "course_materials"
SET
  "source_locale" = 'cs',
  "name_i18n" = jsonb_build_object('cs', "name"),
  "description_i18n" = CASE
    WHEN "description" IS NULL OR length(trim("description")) = 0 THEN '{}'::jsonb
    ELSE jsonb_build_object('cs', "description")
  END;

ALTER TABLE "quizzes"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "title_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "questions_i18n" jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE "quizzes"
SET
  "source_locale" = 'cs',
  "title_i18n" = jsonb_build_object('cs', "title");

ALTER TABLE "feed_items"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "message_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "feed_items"
SET
  "source_locale" = 'cs',
  "message_i18n" = jsonb_build_object('cs', "message");

ALTER TABLE "merch_items"
  ADD COLUMN "source_locale" varchar(2) NOT NULL DEFAULT 'en',
  ADD COLUMN "name_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "description_i18n" jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE "merch_items"
SET
  "source_locale" = 'cs',
  "name_i18n" = jsonb_build_object('cs', "name"),
  "description_i18n" = CASE
    WHEN "description" IS NULL OR length(trim("description")) = 0 THEN '{}'::jsonb
    ELSE jsonb_build_object('cs', "description")
  END;
