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
import {
  getCourseSessionOverview,
  getCourseSessionLeaderboard,
} from "../controllers/sessionController";
import { organizationScopedAuthMiddleware } from "../middleware/auth";
import { requireCourseUpdateAllowed } from "../middleware/courseStatus";
import { validate } from "../middleware/validate";
import {
  CourseCreateRequestSchema,
  CourseUpdateRequestSchema,
} from "../schemas/course";
import { requireCourseDraft } from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationMember,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

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
router.get(
  "/export-all",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  exportAllCourses,
);
router.get(
  "/:uuid/export",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  exportCourse,
);
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
  "/import",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  importUpload.single("file"),
  importCourse,
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
