import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { quizSubmitLimiter, writeLimiter } from "../middleware/rateLimiter";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);
router.post("/", validate(QuizSchema), quizController.createQuiz);
router.get("/:quizId/analytics", quizController.getQuizAnalytics);
router.get("/:quizId", quizController.getQuiz);
router.put("/:quizId", validate(QuizSchema), quizController.updateQuiz);
router.delete("/:quizId", quizController.deleteQuiz);
router.post(
  "/:quizId/submit",
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
