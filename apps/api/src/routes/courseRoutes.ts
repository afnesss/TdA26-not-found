import { Router } from "express";
import {
  getAllCourses,
  getCourseByUuid,
  getCourseDashboardAnalytics,
  createCourse,
  cloneCourse,
  updateCourse,
  deleteCourse,
  getCourseShareLink,
  regenerateCourseShareLink,
  streamCourses,
} from "../controllers/courseController";
import {
  getCourseSessionOverview,
  getCourseSessionLeaderboard,
} from "../controllers/sessionController";
// import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { scopedAuthMiddleware } from "../middleware/auth";
import {
  requireCourseDraft,
  requireCourseUpdateAllowed,
} from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

const router = Router();

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get("/:uuid/dashboard-analytics", getCourseDashboardAnalytics);
router.get(
  "/:uuid/session/overview",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  getCourseSessionOverview,
);
router.get(
  "/:uuid/session/leaderboard",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  getCourseSessionLeaderboard,
);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post(
  "/:uuid/clone",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  cloneCourse,
);
router.get(
  "/:uuid/share-link",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  getCourseShareLink,
);
router.post(
  "/:uuid/share-link/regenerate",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  regenerateCourseShareLink,
);
router.put(
  "/:uuid",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(CourseUpdateRequestSchema),
  requireCourseUpdateAllowed("uuid"),
  updateCourse,
);
router.delete(
  "/:uuid",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  deleteCourse,
);

export default router;
