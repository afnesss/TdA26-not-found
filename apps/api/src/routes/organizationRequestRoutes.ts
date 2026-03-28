import { Router } from "express";
import {
  createOrganizationRequest,
  getOrganizationRequestStatus,
  getOrganizationsPublicDirectory,
} from "../controllers/organizationController";
import { validate } from "../middleware/validate";
import { OrganizationCreateRequestSchema } from "../schemas";

const router = Router();

router.get("/", getOrganizationsPublicDirectory);
router.post("/", validate(OrganizationCreateRequestSchema), createOrganizationRequest);
router.get("/:requestId", getOrganizationRequestStatus);

export default router;
