import { Router } from "express";
import {
  createModule,
  deleteModule,
  getModuleByUuid,
  getModules,
  reorderModules,
  updateModule,
} from "../controllers/moduleController";
import { authMiddleware } from "../middleware/auth";
import { writeLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
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
  writeLimiter,
  validate(ModuleCreateRequestSchema),
  createModule,
);
router.put(
  "/:moduleId",
  authMiddleware,
  writeLimiter,
  validate(ModuleUpdateRequestSchema),
  updateModule,
);
router.put(
  "/reorder",
  authMiddleware,
  writeLimiter,
  validate(ModuleReorderRequestSchema),
  reorderModules,
);
router.delete("/:moduleId", authMiddleware, writeLimiter, deleteModule);

export default router;
