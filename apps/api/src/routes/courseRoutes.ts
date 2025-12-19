import { Router, Request, Response, NextFunction } from "express";
import {
  getAllCourses,
  getCourseByUuid,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
import {
  getMaterialsByCourse,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
} from "../controllers/materialController";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import multer from "multer";

const router = Router();

// Multer error handler middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: "File size exceeds 30MB limit" });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  } else if (err) {
    res.status(400).json({ message: err.message });
    return;
  }
  next();
};

// Optional multer middleware - doesn't fail if no file
const optionalUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Course routes
router.get("/", getAllCourses);
router.get("/:courseId", getCourseByUuid);
router.post("/", authMiddleware, createCourse);
router.put("/:courseId", authMiddleware, updateCourse);
router.delete("/:courseId", authMiddleware, deleteCourse);

// Material routes
router.get("/:courseId/materials", getMaterialsByCourse);
router.post("/:courseId/materials", authMiddleware, optionalUpload, createMaterial);
router.get("/:courseId/materials/:materialId/download", downloadMaterial);
router.put("/:courseId/materials/:materialId", authMiddleware, optionalUpload, updateMaterial);
router.delete("/:courseId/materials/:materialId", authMiddleware, deleteMaterial);

export default router;
