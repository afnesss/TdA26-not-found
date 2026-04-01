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
import { organizationScopedAuthMiddleware } from "../middleware/auth";
import {
  requireCourseDraft,
  requireCourseUpdateAllowed,
} from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationMember,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

const router = Router();

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get("/:uuid/dashboard-analytics", getCourseDashboardAnalytics);
router.get(
  "/:uuid/session/overview",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationMember(["lecturer", "student"]),
  requireScopedOrganizationPasswordChanged,
  getCourseSessionOverview,
);
router.get(
  "/:uuid/session/leaderboard",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationMember(["lecturer", "student"]),
  requireScopedOrganizationPasswordChanged,
  getCourseSessionLeaderboard,
);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post(
  "/:uuid/clone",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  cloneCourse,
);
router.get(
  "/:uuid/share-link",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  getCourseShareLink,
);
router.post(
  "/:uuid/share-link/regenerate",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  regenerateCourseShareLink,
);
router.put(
  "/:uuid",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(CourseUpdateRequestSchema),
  requireCourseUpdateAllowed("uuid"),
  updateCourse,
);
router.delete(
  "/:uuid",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  deleteCourse,
);

export default router;
