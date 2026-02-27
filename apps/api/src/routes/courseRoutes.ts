import { Router } from "express";
import {
  getAllCourses,
  getCourseByUuid,
  createCourse,
  cloneCourse,
  updateCourse,
  deleteCourse,
  streamCourses,
} from "../controllers/courseController";
// import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { writeLimiter } from "../middleware/rateLimiter";
import { authMiddleware } from "../middleware/auth";
import {
  requireCourseDraft,
  requireCourseUpdateAllowed,
} from "../middleware/courseStatus";

const router = Router();

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  authMiddleware,
  writeLimiter,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post("/:uuid/clone", authMiddleware, writeLimiter, cloneCourse);
router.put(
  "/:uuid",
  authMiddleware,
  writeLimiter,
  validate(CourseUpdateRequestSchema),
  requireCourseUpdateAllowed("uuid"),
  updateCourse,
);
router.delete("/:uuid", authMiddleware, writeLimiter, deleteCourse);

export default router;
