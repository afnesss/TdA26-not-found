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
import { organizationScopedAuthMiddleware } from "../middleware/auth";
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
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(FeedCreateRequestSchema),
  requireCourseLiveOrDraft(),
  createPost,
);
router.put(
  "/:postId",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  validate(FeedUpdateRequestSchema),
  requireCourseLiveOrDraft(),
  updatePost,
);
router.delete(
  "/:postId",
  organizationScopedAuthMiddleware,
  requireScopedOrganizationAdmin,
  requireScopedOrganizationPasswordChanged,
  requireCourseLiveOrDraft(),
  deletePost,
);

export default router;
