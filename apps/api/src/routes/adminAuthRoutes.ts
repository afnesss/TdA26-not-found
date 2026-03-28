import { Router } from "express";
import { login, logoutAdmin, me } from "../controllers/authController";
import { adminAuthMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/organization";
import { validate } from "../middleware/validate";
import { AdminLoginSchema } from "../schemas";

const router = Router();

router.post("/login", validate(AdminLoginSchema), login);
router.post("/logout", logoutAdmin);
router.get("/me", adminAuthMiddleware, requirePlatformAdmin, me);

export default router;
