UPDATE "quizzes" SET "difficulty" = 'easy' WHERE "difficulty" IS NULL;
ALTER TABLE "quizzes" ALTER COLUMN "difficulty" SET DEFAULT 'easy';
ALTER TABLE "quizzes" ALTER COLUMN "difficulty" SET NOT NULL;
