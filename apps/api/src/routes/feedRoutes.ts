import { Router } from "express";
import {
  getFeed,
  createPost,
  updatePost,
  deletePost,
  streamFeed,
} from "../controllers/feedController";
import { validate } from "../middleware/validate";
import {
  FeedCreateRequestSchema,
  FeedUpdateRequestSchema,
} from "../schemas/feed";
import { authMiddleware } from "../middleware/auth";
import { requireCourseLiveOrDraft } from "../middleware/courseStatus";

const router = Router({ mergeParams: true });

router.get("/stream", streamFeed);
router.get("/:cursor", getFeed);
router.get("/", getFeed);

router.post(
  "/",
  authMiddleware,
  validate(FeedCreateRequestSchema),
  requireCourseLiveOrDraft(),
  createPost,
);
router.put(
  "/:postId",
  authMiddleware,
  validate(FeedUpdateRequestSchema),
  requireCourseLiveOrDraft(),
  updatePost,
);
router.delete(
  "/:postId",
  authMiddleware,
  requireCourseLiveOrDraft(),
  deletePost,
);

export default router;

