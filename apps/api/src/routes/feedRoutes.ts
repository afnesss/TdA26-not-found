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

const router = Router({ mergeParams: true });

router.get("/", getFeed);
router.post("/", validate(FeedCreateRequestSchema), createPost);
router.put("/:postId", validate(FeedUpdateRequestSchema), updatePost);
router.delete("/:postId", deletePost);
router.get("/stream", streamFeed);

export default router;
