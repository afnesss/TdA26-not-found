import { Router } from "express";
import multer from "multer";
import {
  cloneCourse,
  createCourse,
  deleteCourse,
  exportCourse,
  exportAllCourses,
  getAllCourses,
  getCourseByUuid,
  getCourseDashboardAnalytics,
  getCourseShareLink,
  importCourse,
  regenerateCourseShareLink,
  streamCourses,
  updateCourse,
} from "../controllers/courseController";
import { authMiddleware } from "../middleware/auth";
import { requireCourseUpdateAllowed } from "../middleware/courseStatus";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";

const router = Router();

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 150 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const hasJsonExtension = file.originalname.toLowerCase().endsWith(".json");
    const isJsonMime =
      file.mimetype === "application/json" ||
      file.mimetype === "text/json" ||
      file.mimetype === "application/octet-stream";

    if (hasJsonExtension || isJsonMime) {
      cb(null, true);
      return;
    }

    cb(new Error("Nepodporovaný formát zálohy"));
  },
});

router.get("/stream", streamCourses);
router.get("/", getAllCourses);
router.get("/export-all", authMiddleware, exportAllCourses);
router.get("/:uuid/export", authMiddleware, exportCourse);
router.get("/:uuid/dashboard-analytics", getCourseDashboardAnalytics);
router.get("/:uuid", getCourseByUuid);

router.post(
  "/",
  authMiddleware,
  validate(CourseCreateRequestSchema),
  createCourse,
);
router.post("/import", authMiddleware, importUpload.single("file"), importCourse);
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
