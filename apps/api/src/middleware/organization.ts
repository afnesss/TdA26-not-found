import { and, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { courses, organizations } from "../db/schema";
import { AuthRequest } from "../types/auth";
import { logger } from "../utils/logger";
import { getApiMessage } from "../utils/apiMessages";

type LoadOrganizationOptions = {
  allowStatuses?: string[];
};

const respondOrganizationInactive = (
  req: AuthRequest,
  res: Response,
  organizationStatus: string,
) =>
  res.status(403).json({
    message: getApiMessage(req, "orgInactive"),
    code: "ORG_INACTIVE",
    organizationStatus,
  });

export const loadOrganization =
  (options?: LoadOrganizationOptions) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgSlug = String(req.params.orgSlug ?? "").trim();
      if (!orgSlug) {
        return res
          .status(400)
          .json({ message: getApiMessage(req, "orgMissingSlug") });
      }

      const [organization] = await db
        .select({
          uuid: organizations.uuid,
          slug: organizations.slug,
          name: organizations.name,
          country: organizations.country,
          city: organizations.city,
          address: organizations.address,
          postalCode: organizations.postalCode,
          region: organizations.region,
          type: organizations.type,
          ownerName: organizations.ownerName,
          status: organizations.status,
          contactEmail: organizations.contactEmail,
          mustChangePassword: organizations.mustChangePassword,
        })
        .from(organizations)
        .where(eq(organizations.slug, orgSlug));

      if (!organization) {
        return res
          .status(404)
          .json({ message: getApiMessage(req, "orgNotFound") });
      }

      if (
        options?.allowStatuses &&
        !options.allowStatuses.includes(organization.status)
      ) {
        return respondOrganizationInactive(req, res, organization.status);
      }

      req.organization = organization;
      next();
    } catch (error) {
      logger.error({ err: error }, "Failed to load organization");
      return res
        .status(500)
        .json({ message: getApiMessage(req, "serverError") });
    }
  };

export const requirePlatformAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.actorType !== "platform_admin") {
    return res
      .status(403)
      .json({ message: getApiMessage(req, "platformAdminOnly") });
  }

  return next();
};

export const requireOrganizationAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res
      .status(403)
      .json({ message: getApiMessage(req, "orgAdminOnly") });
  }

  if (req.user.actorType === "organization_admin") {
    if (
      req.organization &&
      req.user.organizationId !== req.organization.uuid &&
      req.user.orgSlug !== req.organization.slug
    ) {
      return res
        .status(403)
        .json({ message: getApiMessage(req, "crossOrgForbidden") });
    }

    return next();
  }

  if (
    req.user.actorType === "organization_user" &&
    req.user.role === "lecturer"
  ) {
    if (
      req.organization &&
      req.user.organizationId !== req.organization.uuid &&
      req.user.orgSlug !== req.organization.slug
    ) {
      return res
        .status(403)
        .json({ message: getApiMessage(req, "crossOrgForbidden") });
    }

    return next();
  }

  return res.status(403).json({ message: getApiMessage(req, "orgAdminOnly") });
};

export const requireScopedOrganizationAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.organization) {
    return next();
  }

  return requireOrganizationAdmin(req, res, next);
};

export const requireOrganizationPasswordChanged = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.actorType === "organization_user") {
    return next();
  }

  if (req.organization?.mustChangePassword) {
    return res.status(403).json({
      message: getApiMessage(req, "orgPasswordChangeRequired"),
      code: "ORG_PASSWORD_CHANGE_REQUIRED",
    });
  }

  return next();
};

export const requireScopedOrganizationPasswordChanged = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.organization) {
    return next();
  }

  return requireOrganizationPasswordChanged(req, res, next);
};

export const requireScopedOrganizationUser =
  (allowedRoles?: Array<"lecturer" | "student">) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return next();
    }

    if (req.user?.actorType !== "organization_user") {
      return res
        .status(403)
        .json({ message: getApiMessage(req, "orgUserOnly") });
    }

    if (
      req.user.organizationId !== req.organization.uuid ||
      req.user.orgSlug !== req.organization.slug
    ) {
      return res
        .status(403)
        .json({ message: getApiMessage(req, "crossOrgForbidden") });
    }

    if (allowedRoles && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: getApiMessage(req, "insufficientPermissions"),
      });
    }

    return next();
  };

export const requireScopedOrganizationMember =
  (allowedRoles?: Array<"lecturer" | "student">) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return next();
    }

    if (req.user?.actorType === "organization_admin") {
      if (
        req.user.organizationId !== req.organization.uuid &&
        req.user.orgSlug !== req.organization.slug
      ) {
        return res
          .status(403)
          .json({ message: getApiMessage(req, "crossOrgForbidden") });
      }

      return next();
    }

    return requireScopedOrganizationUser(allowedRoles)(req, res, next);
  };

export const requireCourseBelongsToOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId =
      String(req.params.uuid ?? "") || String(req.params.courseId ?? "");
    const organizationId = req.organization?.uuid;

    if (!courseId || !organizationId) {
      return res
        .status(400)
        .json({ message: getApiMessage(req, "courseOrOrgIdMissing") });
    }

    const [course] = await db
      .select({ uuid: courses.uuid })
      .from(courses)
      .where(
        and(eq(courses.uuid, courseId), eq(courses.organizationId, organizationId)),
      );

    if (!course) {
      return res
        .status(404)
        .json({ message: getApiMessage(req, "courseNotFound") });
    }

    return next();
  } catch (error) {
    logger.error({ err: error }, "Failed to validate organization course access");
    return res
      .status(500)
      .json({ message: getApiMessage(req, "serverError") });
  }
};
