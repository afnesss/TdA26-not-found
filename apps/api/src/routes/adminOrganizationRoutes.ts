import { Router } from "express";
import {
  approveOrganizationRequest,
  deleteOrganization,
  getOrganizationRequestById,
  listOrganizationRequests,
  listOrganizations,
  rejectOrganizationRequest,
  updateOrganization,
} from "../controllers/organizationController";
import { listAdminShopOrders } from "../controllers/shopController";
import { adminAuthMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/organization";
import { validate } from "../middleware/validate";
import {
  OrganizationRequestDecisionSchema,
  OrganizationUpdateSchema,
} from "../schemas";

const router = Router();

router.use(adminAuthMiddleware, requirePlatformAdmin);

router.get("/organization-requests", listOrganizationRequests);
router.get("/organization-requests/:requestId", getOrganizationRequestById);
router.post(
  "/organization-requests/:requestId/approve",
  validate(OrganizationRequestDecisionSchema),
  approveOrganizationRequest,
);
router.post(
  "/organization-requests/:requestId/reject",
  validate(OrganizationRequestDecisionSchema),
  rejectOrganizationRequest,
);

router.get("/organizations", listOrganizations);
router.get("/orders", listAdminShopOrders);
router.put(
  "/organizations/:orgId",
  validate(OrganizationUpdateSchema),
  updateOrganization,
);
router.delete("/organizations/:orgId", deleteOrganization);

export default router;
