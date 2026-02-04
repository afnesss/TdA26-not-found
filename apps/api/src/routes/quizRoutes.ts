import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { quizSubmitLimiter, writeLimiter } from "../middleware/rateLimiter";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);
router.post("/", writeLimiter, validate(QuizSchema), quizController.createQuiz);
router.get("/:quizId/analytics", writeLimiter, quizController.getQuizAnalytics);
router.get("/:quizId", quizController.getQuiz);
router.put(
  "/:quizId",
  writeLimiter,
  validate(QuizSchema),
  quizController.updateQuiz,
);
router.delete("/:quizId", writeLimiter, quizController.deleteQuiz);
router.post(
  "/:quizId/submit",
  quizSubmitLimiter,
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
