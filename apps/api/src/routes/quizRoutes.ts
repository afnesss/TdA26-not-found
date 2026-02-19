import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { quizSubmitLimiter, writeLimiter } from "../middleware/rateLimiter";
import { authMiddleware } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);

router.post(
  "/",
  authMiddleware,
  validate(QuizSchema),
  quizController.createQuiz,
);
router.get(
  "/:quizId/analytics",
  authMiddleware,
  quizController.getQuizAnalytics,
);

router.get("/:quizId", quizController.getQuiz);

router.put(
  "/:quizId",
  authMiddleware,
  validate(QuizSchema),
  quizController.updateQuiz,
);
router.delete("/:quizId", authMiddleware, quizController.deleteQuiz);

router.post(
  "/:quizId/submit",
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
