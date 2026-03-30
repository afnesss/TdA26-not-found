import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { validate } from "../middleware/validate";
import { QuizSchema, QuizSubmitRequestSchema } from "../schemas/quiz";
import { authMiddleware, organizationScopedAuthMiddleware } from "../middleware/auth";
import { requireCourseDraft } from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationUser,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

const router = Router({ mergeParams: true });

router.get("/", quizController.getQuizzes);

router.post(
  "/",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.createQuiz,
);
router.get(
  "/:quizId/analytics",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  quizController.getQuizAnalytics,
);

router.get("/:quizId", quizController.getQuiz);

router.put(
  "/:quizId",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(QuizSchema),
  requireCourseDraft(),
  quizController.updateQuiz,
);
router.delete(
  "/:quizId",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  requireCourseDraft(),
  quizController.deleteQuiz,
);

router.post(
  "/:quizId/submit",
  authMiddleware,
  requireScopedOrganizationUser(["student"]),
  validate(QuizSubmitRequestSchema),
  quizController.submitQuiz,
);

export default router;
