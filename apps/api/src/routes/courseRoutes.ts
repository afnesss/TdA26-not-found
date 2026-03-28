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
  getCourseSessionLeaderboard,
  getCourseSessionOverview,
} from "../controllers/sessionController";
// import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  requireCourseUpdateAllowed,
} from "../middleware/courseStatus";

const router = Router();

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get(
  "/:uuid/dashboard-analytics",
  authMiddleware,
  requireRole("lecturer"),
  getCourseDashboardAnalytics,
);
router.get("/:uuid/session/leaderboard", getCourseSessionLeaderboard);
router.get(
  "/:uuid/session/overview",
  authMiddleware,
  requireRole("lecturer"),
  getCourseSessionOverview,
);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  authMiddleware,
  requireRole("lecturer"),
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post("/:uuid/clone", authMiddleware, requireRole("lecturer"), cloneCourse);
router.get(
  "/:uuid/share-link",
  authMiddleware,
  requireRole("lecturer"),
  getCourseShareLink,
);
router.post(
  "/:uuid/share-link/regenerate",
  authMiddleware,
  requireRole("lecturer"),
  regenerateCourseShareLink,
);
router.put(
  "/:uuid",
  authMiddleware,
  requireRole("lecturer"),
  validate(CourseUpdateRequestSchema),
  requireCourseUpdateAllowed("uuid"),
  updateCourse,
);
router.delete("/:uuid", authMiddleware, requireRole("lecturer"), deleteCourse);

export default router;
