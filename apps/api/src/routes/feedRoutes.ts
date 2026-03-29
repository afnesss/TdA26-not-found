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
import { scopedAuthMiddleware } from "../middleware/auth";
import { requireCourseLiveOrDraft } from "../middleware/courseStatus";
import {
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
} from "../middleware/organization";

const router = Router({ mergeParams: true });

router.get("/stream", streamFeed);
router.get("/:cursor", getFeed);
router.get("/", getFeed);

router.post(
  "/",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(FeedCreateRequestSchema),
  requireCourseLiveOrDraft(),
  createPost,
);
router.put(
  "/:postId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(FeedUpdateRequestSchema),
  requireCourseLiveOrDraft(),
  updatePost,
);
router.delete(
  "/:postId",
  scopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  requireCourseLiveOrDraft(),
  deletePost,
);

export default router;
