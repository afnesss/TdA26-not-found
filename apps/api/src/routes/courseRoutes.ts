import { Router } from "express";
import {
  getAllCourses,
  getCourseByUuid,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
// import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { writeLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/", getAllCourses);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  writeLimiter,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.put(
  "/:uuid",
  writeLimiter,
  validate(CourseUpdateRequestSchema),
  updateCourse,
);
router.delete("/:uuid", writeLimiter, deleteCourse);

export default router;
