import { Router } from "express";
import {
  createModule,
  deleteModule,
  getModuleByUuid,
  getModules,
  reorderModules,
  updateModule,
} from "../controllers/moduleController";
import { authMiddleware, requireRole } from "../middleware/auth";
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
  authMiddleware,
  requireRole("lecturer"),
  validate(ModuleCreateRequestSchema),
  requireCourseDraft(),
  createModule,
);
router.put(
  "/reorder",
  authMiddleware,
  requireRole("lecturer"),
  validate(ModuleReorderRequestSchema),
  requireCourseDraft(),
  reorderModules,
);
router.put(
  "/:moduleId",
  authMiddleware,
  requireRole("lecturer"),
  validate(ModuleUpdateRequestSchema),
  requireModuleUpdateAllowed(),
  updateModule,
);
router.delete(
  "/:moduleId",
  authMiddleware,
  requireRole("lecturer"),
  requireCourseDraft(),
  deleteModule,
);

export default router;
