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
import { CourseCreateRequestSchema, CourseUpdateRequestSchema } from "../schemas/course";

const router = Router();

router.get("/", getAllCourses);
router.get("/:uuid", getCourseByUuid);

router.post("/", validate(CourseCreateRequestSchema), createCourse);
router.put("/:uuid", validate(CourseUpdateRequestSchema), updateCourse);
router.delete("/:uuid", deleteCourse);

export default router;
