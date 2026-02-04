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

const router = Router({ mergeParams: true });

router.get("/", getFeed);
router.post("/", writeLimiter, validate(FeedCreateRequestSchema), createPost);
router.put(
  "/:postId",
  writeLimiter,
  validate(FeedUpdateRequestSchema),
  updatePost,
);
router.delete("/:postId", writeLimiter, deletePost);
router.get("/stream", streamFeed);

export default router;
