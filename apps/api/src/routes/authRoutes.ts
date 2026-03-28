import { Router } from "express";
import { login, logoutAdmin, me } from "../controllers/authController";
import { adminAuthMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logoutAdmin);
router.get("/me", adminAuthMiddleware, me);

export default router;
