import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { authMiddleware, requireRole } from "../middleware/auth";
import { requireCourseDraft } from "../middleware/courseStatus";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);

router.post(
  "/",
  authMiddleware,
  requireRole("lecturer"),
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.createQuiz,
);
router.get(
  "/:quizId/analytics",
  authMiddleware,
  requireRole("lecturer"),
  quizController.getQuizAnalytics,
);

router.get("/:quizId", quizController.getQuiz);

router.put(
  "/:quizId",
  authMiddleware,
  requireRole("lecturer"),
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.updateQuiz,
);
router.delete(
  "/:quizId",
  authMiddleware,
  requireRole("lecturer"),
  requireCourseDraft(),
  quizController.deleteQuiz,
);

router.post(
  "/:quizId/submit",
  authMiddleware,
  requireRole("student"),
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
