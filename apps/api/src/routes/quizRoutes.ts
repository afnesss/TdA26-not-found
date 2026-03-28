import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { scopedAuthMiddleware } from "../middleware/auth";
import { requireCourseDraft } from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);

router.post(
  "/",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.createQuiz,
);
router.get(
  "/:quizId/analytics",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  quizController.getQuizAnalytics,
);

router.get("/:quizId", quizController.getQuiz);

router.put(
  "/:quizId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.updateQuiz,
);
router.delete(
  "/:quizId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  requireCourseDraft(),
  quizController.deleteQuiz,
);

router.post(
  "/:quizId/submit",
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
