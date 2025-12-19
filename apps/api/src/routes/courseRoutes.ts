import { Router } from "express";
import {
  getAllCourses,
  getCourseByUuid,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", getAllCourses);
router.get("/:uuid", getCourseByUuid);

router.post("/", authMiddleware, createCourse);
router.put("/:uuid", authMiddleware, updateCourse);
router.delete("/:uuid", authMiddleware, deleteCourse);

export default router;
