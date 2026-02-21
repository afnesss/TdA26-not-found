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
import { writeLimiter } from "../middleware/rateLimiter";
import { authMiddleware } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.get("/stream", streamFeed);
router.get("/:cursor", getFeed);
router.get("/", getFeed);

router.post(
  "/",
  authMiddleware,
  writeLimiter,
  validate(FeedCreateRequestSchema),
  createPost,
);
router.put(
  "/:postId",
  authMiddleware,
  writeLimiter,
  validate(FeedUpdateRequestSchema),
  updatePost,
);
router.delete("/:postId", authMiddleware, writeLimiter, deletePost);

export default router;
