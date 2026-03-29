import { Router } from "express";
import {
  getOrganizationPublicInfo,
} from "../controllers/organizationController";
import {
  loadOrganization,
  requireCourseBelongsToOrganization,
} from "../middleware/organization";
import courseRoutes from "./courseRoutes";
import moduleRoutes from "./moduleRoutes";
import materialRoutes from "./materialRoutes";
import quizRoutes from "./quizRoutes";
import feedRoutes from "./feedRoutes";
import orgAuthRoutes from "./orgAuthRoutes";

const router = Router({ mergeParams: true });

router.use("/:orgSlug/auth", orgAuthRoutes);

router.get(
  "/:orgSlug/status",
  loadOrganization({ allowStatuses: ["onboarding", "active"] }),
  getOrganizationPublicInfo,
);

router.get(
  "/:orgSlug",
  loadOrganization({ allowStatuses: ["active"] }),
  getOrganizationPublicInfo,
);

router.use(
  "/:orgSlug/courses",
  loadOrganization({ allowStatuses: ["active"] }),
  courseRoutes,
);

router.use(
  "/:orgSlug/courses/:courseId/modules",
  loadOrganization({ allowStatuses: ["active"] }),
  requireCourseBelongsToOrganization,
  moduleRoutes,
);

router.use(
  "/:orgSlug/courses/:courseId/modules/:moduleId/materials",
  loadOrganization({ allowStatuses: ["active"] }),
  requireCourseBelongsToOrganization,
  materialRoutes,
);

router.use(
  "/:orgSlug/courses/:courseId/modules/:moduleId/quizzes",
  loadOrganization({ allowStatuses: ["active"] }),
  requireCourseBelongsToOrganization,
  quizRoutes,
);

router.use(
  "/:orgSlug/courses/:courseId/feed",
  loadOrganization({ allowStatuses: ["active"] }),
  requireCourseBelongsToOrganization,
  feedRoutes,
);

export default router;
