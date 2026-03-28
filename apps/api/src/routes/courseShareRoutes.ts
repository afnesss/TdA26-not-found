import { Router } from "express";
import { resolveCourseShareLink } from "../controllers/courseController";

const router = Router();

router.get("/:token", resolveCourseShareLink);

export default router;
