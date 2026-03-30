import { Router } from "express";
import { logoutOrganization } from "../controllers/authController";
import {
  changeOrganizationPassword,
  getOrganizationAuthMe,
  loginOrganization,
} from "../controllers/organizationController";
import {
  organizationAuthMiddleware,
  organizationScopedAuthMiddleware,
} from "../middleware/auth";
import {
  loadOrganization,
  requireOrganizationAdmin,
} from "../middleware/organization";
import { validate } from "../middleware/validate";
import {
  OrganizationAuthLoginSchema,
  OrganizationChangePasswordSchema,
} from "../schemas";

const router = Router({ mergeParams: true });

router.post(
  "/login",
  loadOrganization({ allowStatuses: ["onboarding", "active"] }),
  validate(OrganizationAuthLoginSchema),
  loginOrganization,
);
router.post("/logout", logoutOrganization);
router.get(
  "/me",
  loadOrganization({ allowStatuses: ["onboarding", "active"] }),
  organizationScopedAuthMiddleware,
  getOrganizationAuthMe,
);
router.post(
  "/change-password",
  loadOrganization({ allowStatuses: ["onboarding", "active"] }),
  organizationAuthMiddleware,
  requireOrganizationAdmin,
  validate(OrganizationChangePasswordSchema),
  changeOrganizationPassword,
);

export default router;
