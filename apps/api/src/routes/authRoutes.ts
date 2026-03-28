import { Router } from "express";
import {
  login,
  me,
  logout,
  studentUpsertLogin,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/student/upsert-login", studentUpsertLogin);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
