import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { authMiddleware } from "../middleware/auth";
import { requireCourseDraft } from "../middleware/courseStatus";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);

router.post(
  "/",
  authMiddleware,
  validate(QuizSchema),
  requireCourseDraft(),
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
  requireCourseDraft(),
  quizController.updateQuiz,
);
router.delete(
  "/:quizId",
  authMiddleware,
  requireCourseDraft(),
  quizController.deleteQuiz,
);

router.post(
  "/:quizId/submit",
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
