import { Router } from "express";
import {
  createModule,
  deleteModule,
  getModuleByUuid,
  getModules,
  reorderModules,
  updateModule,
} from "../controllers/moduleController";
import { scopedAuthMiddleware } from "../middleware/auth";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";
import { validate } from "../middleware/validate";
import {
  requireCourseDraft,
  requireModuleUpdateAllowed,
} from "../middleware/courseStatus";
import {
  ModuleCreateRequestSchema,
  ModuleReorderRequestSchema,
  ModuleUpdateRequestSchema,
} from "../schemas/module";

const router = Router({ mergeParams: true });

router.get("/", getModules);
router.get("/:moduleId", getModuleByUuid);
router.post(
  "/",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(ModuleCreateRequestSchema),
  requireCourseDraft(),
  createModule,
);
router.put(
  "/reorder",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(ModuleReorderRequestSchema),
  requireCourseDraft(),
  reorderModules,
);
router.put(
  "/:moduleId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(ModuleUpdateRequestSchema),
  requireModuleUpdateAllowed(),
  updateModule,
);
router.delete(
  "/:moduleId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  requireCourseDraft(),
  deleteModule,
);

export default router;
