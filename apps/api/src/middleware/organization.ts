import { and, eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { courses, organizations } from "../db/schema";
import { AuthRequest } from "../types/auth";
import { logger } from "../utils/logger";

type LoadOrganizationOptions = {
  allowStatuses?: string[];
};

const respondOrganizationInactive = (
  res: Response,
  organizationStatus: string,
) =>
  res.status(403).json({
    message: "Organizace není dostupná",
    code: "ORG_INACTIVE",
    organizationStatus,
  });

export const loadOrganization =
  (options?: LoadOrganizationOptions) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgSlug = String(req.params.orgSlug ?? "").trim();
      if (!orgSlug) {
        return res.status(400).json({ message: "Chybí slug organizace" });
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
        return res.status(404).json({ message: "Organizace nebyla nalezena" });
      }

      if (
        options?.allowStatuses &&
        !options.allowStatuses.includes(organization.status)
      ) {
        return respondOrganizationInactive(res, organization.status);
      }

      req.organization = organization;
      next();
    } catch (error) {
      logger.error({ err: error }, "Failed to load organization");
      return res.status(500).json({ message: "Došlo k chybě serveru" });
    }
  };

export const requirePlatformAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.actorType !== "platform_admin") {
    return res.status(403).json({ message: "Přístup pouze pro správce platformy" });
  }

  return next();
};

export const requireOrganizationAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.actorType !== "organization_admin") {
    return res
      .status(403)
      .json({ message: "Přístup pouze pro správce organizace" });
  }

  if (
    req.organization &&
    req.user.organizationId !== req.organization.uuid &&
    req.user.orgSlug !== req.organization.slug
  ) {
    return res.status(403).json({ message: "Přístup do jiné organizace není povolen" });
  }

  return next();
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
  if (req.organization?.mustChangePassword) {
    return res.status(403).json({
      message: "Nejprve změňte výchozí heslo organizace",
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
      return res.status(400).json({ message: "Chybí identifikátor kurzu nebo organizace" });
    }

    const [course] = await db
      .select({ uuid: courses.uuid })
      .from(courses)
      .where(
        and(eq(courses.uuid, courseId), eq(courses.organizationId, organizationId)),
      );

    if (!course) {
      return res.status(404).json({ message: "Kurz nebyl nalezen" });
    }

    return next();
  } catch (error) {
    logger.error({ err: error }, "Failed to validate organization course access");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
};
