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
// import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { authMiddleware } from "../middleware/auth";
import {
  requireCourseDraft,
  requireCourseUpdateAllowed,
} from "../middleware/courseStatus";

const router = Router();

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get("/:uuid/dashboard-analytics", getCourseDashboardAnalytics);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  authMiddleware,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post("/:uuid/clone", authMiddleware, cloneCourse);
router.get("/:uuid/share-link", authMiddleware, getCourseShareLink);
router.post(
  "/:uuid/share-link/regenerate",
  authMiddleware,
  regenerateCourseShareLink,
);
router.put(
  "/:uuid",
  authMiddleware,
  validate(CourseUpdateRequestSchema),
  requireCourseUpdateAllowed("uuid"),
  updateCourse,
);
router.delete("/:uuid", authMiddleware, deleteCourse);

export default router;
