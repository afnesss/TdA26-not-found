import bcrypt from "bcryptjs";
import { and, desc, eq, ne } from "drizzle-orm";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import {
  organizationRequests,
  organizations,
  courses,
  users,
} from "../db/schema";
import { AuthRequest } from "../types/auth";
import {
  LEGACY_AUTH_COOKIE,
  ORG_AUTH_COOKIE,
  getLegacyCookieOptions,
  getOrgCookieOptions,
} from "../middleware/auth";
import { logger } from "../utils/logger";

const toOrganizationSelect = {
  uuid: organizations.uuid,
  name: organizations.name,
  slug: organizations.slug,
  country: organizations.country,
  city: organizations.city,
  address: organizations.address,
  postalCode: organizations.postalCode,
  region: organizations.region,
  type: organizations.type,
  ownerName: organizations.ownerName,
  contactEmail: organizations.contactEmail,
  status: organizations.status,
  mustChangePassword: organizations.mustChangePassword,
  createdAt: organizations.createdAt,
  updatedAt: organizations.updatedAt,
} as const;

const toOrganizationRequestSelect = {
  uuid: organizationRequests.uuid,
  name: organizationRequests.name,
  slug: organizationRequests.slug,
  country: organizationRequests.country,
  city: organizationRequests.city,
  address: organizationRequests.address,
  postalCode: organizationRequests.postalCode,
  region: organizationRequests.region,
  type: organizationRequests.type,
  ownerName: organizationRequests.ownerName,
  contactEmail: organizationRequests.contactEmail,
  status: organizationRequests.status,
  adminNote: organizationRequests.adminNote,
  decisionAt: organizationRequests.decisionAt,
  createdAt: organizationRequests.createdAt,
  updatedAt: organizationRequests.updatedAt,
} as const;

const getOrgDefaultPassword = () =>
  process.env.ORG_DEFAULT_PASSWORD || "TdA26!";
const getOrgUserDefaultPassword = () =>
  process.env.ORG_USER_DEFAULT_PASSWORD || getOrgDefaultPassword();

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

const normalizeOrganizationSlug = (value: string) => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "organizace";
};

const getUniqueOrganizationSlug = async (name: string) => {
  const baseSlug = normalizeOrganizationSlug(name);
  let attempt = 1;

  while (true) {
    const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const [existingOrg, existingRequest] = await Promise.all([
      db
        .select({ uuid: organizations.uuid })
        .from(organizations)
        .where(eq(organizations.slug, candidate)),
      db
        .select({
          uuid: organizationRequests.uuid,
          status: organizationRequests.status,
        })
        .from(organizationRequests)
        .where(
          and(
            eq(organizationRequests.slug, candidate),
            ne(organizationRequests.status, "rejected"),
          ),
        ),
    ]);

    if (!existingOrg[0] && !existingRequest[0]) {
      return candidate;
    }

    attempt += 1;
  }
};

export async function createOrganizationRequest(req: Request, res: Response) {
  try {
    const payload = req.body;
    const generatedSlug = await getUniqueOrganizationSlug(String(payload.name));
    const normalizedEmail = String(payload.contactEmail).trim().toLowerCase();

    const [created] = await db
      .insert(organizationRequests)
      .values({
        ...payload,
        slug: generatedSlug,
        contactEmail: normalizedEmail,
      })
      .returning(toOrganizationRequestSelect);

    return res.status(201).json({
      requestId: created.uuid,
      status: created.status,
      trackingUrl: `/organization-request/${created.uuid}`,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to create organization request");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationRequestStatus(
  req: Request,
  res: Response,
) {
  try {
    const { requestId } = req.params;
    const [request] = await db
      .select(toOrganizationRequestSelect)
      .from(organizationRequests)
      .where(eq(organizationRequests.uuid, requestId));

    if (!request) {
      return res.status(404).json({ message: "Žádost nebyla nalezena" });
    }

    return res.json({
      requestId: request.uuid,
      status: request.status,
      name: request.name,
      slug: request.slug,
      country: request.country,
      city: request.city,
      address: request.address,
      postalCode: request.postalCode,
      region: request.region,
      type: request.type,
      ownerName: request.ownerName,
      contactEmail: request.contactEmail,
      messageKey: request.status,
      adminNote: request.status === "rejected" ? request.adminNote ?? undefined : undefined,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch organization request status");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function listOrganizationRequests(_req: Request, res: Response) {
  try {
    const items = await db
      .select(toOrganizationRequestSelect)
      .from(organizationRequests)
      .orderBy(desc(organizationRequests.createdAt), desc(organizationRequests.uuid));

    return res.json(items);
  } catch (error) {
    logger.error({ err: error }, "Failed to list organization requests");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationRequestById(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const [request] = await db
      .select(toOrganizationRequestSelect)
      .from(organizationRequests)
      .where(eq(organizationRequests.uuid, requestId));

    if (!request) {
      return res.status(404).json({ message: "Žádost nebyla nalezena" });
    }

    return res.json(request);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch organization request");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function approveOrganizationRequest(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const adminNote = String(req.body?.adminNote ?? "").trim() || null;

    const [request] = await db
      .select(toOrganizationRequestSelect)
      .from(organizationRequests)
      .where(eq(organizationRequests.uuid, requestId));

    if (!request) {
      return res.status(404).json({ message: "Žádost nebyla nalezena" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Žádost už byla zpracována" });
    }

    const [existingOrg] = await db
      .select({ uuid: organizations.uuid })
      .from(organizations)
      .where(eq(organizations.slug, request.slug));

    if (existingOrg) {
      return res.status(409).json({ message: "Organizace s tímto slugem už existuje" });
    }

    const passwordHash = await bcrypt.hash(getOrgDefaultPassword(), 10);
    const lecturerPasswordHash = await bcrypt.hash(getOrgUserDefaultPassword(), 10);

    const result = await db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizations)
        .values({
          name: request.name,
          slug: request.slug,
          country: request.country,
          city: request.city,
          address: request.address,
          postalCode: request.postalCode,
          region: request.region,
          type: request.type,
          ownerName: request.ownerName,
          contactEmail: request.contactEmail,
          status: "onboarding",
          passwordHash,
          mustChangePassword: true,
        })
        .returning(toOrganizationSelect);

      const [updatedRequest] = await tx
        .update(organizationRequests)
        .set({
          status: "approved",
          adminNote,
          decisionAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(organizationRequests.uuid, requestId))
        .returning(toOrganizationRequestSelect);

      await tx.insert(users).values({
        organizationId: organization.uuid,
        username: "lecturer",
        role: "lecturer",
        passwordHash: lecturerPasswordHash,
      });

      return { organization, request: updatedRequest };
    });

    return res.json({
      request: result.request,
      organization: result.organization,
      delivery: {
        contactEmail: result.organization.contactEmail,
        organizationUrl: `/${result.organization.slug}`,
        loginUrl: `/${result.organization.slug}/login`,
        temporaryPassword: getOrgDefaultPassword(),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to approve organization request");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function rejectOrganizationRequest(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const adminNote = String(req.body?.adminNote ?? "").trim();

    if (!adminNote) {
      return res.status(400).json({ message: "Při zamítnutí uveďte poznámku" });
    }

    const [request] = await db
      .select({ uuid: organizationRequests.uuid, status: organizationRequests.status })
      .from(organizationRequests)
      .where(eq(organizationRequests.uuid, requestId));

    if (!request) {
      return res.status(404).json({ message: "Žádost nebyla nalezena" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Žádost už byla zpracována" });
    }

    const [updated] = await db
      .update(organizationRequests)
      .set({
        status: "rejected",
        adminNote,
        decisionAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizationRequests.uuid, requestId))
      .returning(toOrganizationRequestSelect);

    return res.json(updated);
  } catch (error) {
    logger.error({ err: error }, "Failed to reject organization request");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function listOrganizations(_req: Request, res: Response) {
  try {
    const items = await db
      .select(toOrganizationSelect)
      .from(organizations)
      .orderBy(desc(organizations.createdAt), desc(organizations.uuid));

    return res.json(items);
  } catch (error) {
    logger.error({ err: error }, "Failed to list organizations");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  try {
    const { orgId } = req.params;
    const payload = req.body ?? {};

    if (payload.contactEmail) {
      payload.contactEmail = String(payload.contactEmail).trim().toLowerCase();
    }

    const [updated] = await db
      .update(organizations)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(organizations.uuid, orgId))
      .returning(toOrganizationSelect);

    if (!updated) {
      return res.status(404).json({ message: "Organizace nebyla nalezena" });
    }

    return res.json(updated);
  } catch (error) {
    logger.error({ err: error }, "Failed to update organization");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationPublicInfo(req: AuthRequest, res: Response) {
  if (!req.organization) {
    return res.status(404).json({ message: "Organizace nebyla nalezena" });
  }

  return res.json({
    ...req.organization,
  });
}

export async function loginOrganization(req: AuthRequest, res: Response) {
  try {
    const mode = String(req.body?.mode ?? "").trim();
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");
    const organization = req.organization;

    if (!organization) {
      return res.status(404).json({ message: "Organizace nebyla nalezena" });
    }

    const [fullOrganization] = await db
      .select({
        uuid: organizations.uuid,
        slug: organizations.slug,
        name: organizations.name,
        status: organizations.status,
        mustChangePassword: organizations.mustChangePassword,
        passwordHash: organizations.passwordHash,
      })
      .from(organizations)
      .where(eq(organizations.uuid, organization.uuid));

    if (!fullOrganization) {
      return res.status(404).json({ message: "Organizace nebyla nalezena" });
    }

    if (!["onboarding", "active"].includes(fullOrganization.status)) {
      return res.status(403).json({ message: "Organizace ještě není dostupná" });
    }

    const isAdminLogin = mode === "admin" || (!mode && !username);
    if (!isAdminLogin) {
      if (!username) {
        return res.status(400).json({ message: "Zadejte uživatelské jméno" });
      }

      let [user] = await db
        .select({
          id: users.uuid,
          username: users.username,
          role: users.role,
          xp: users.xp,
          level: users.level,
          passwordHash: users.passwordHash,
        })
        .from(users)
        .where(
          and(
            eq(users.organizationId, fullOrganization.uuid),
            eq(users.username, username),
          ),
        )
        .limit(1);

      if (!user && mode === "student") {
        const passwordHash = await bcrypt.hash(password, 10);
        const [createdStudent] = await db
          .insert(users)
          .values({
            organizationId: fullOrganization.uuid,
            username,
            role: "student",
            passwordHash,
          })
          .returning({
            id: users.uuid,
            username: users.username,
            role: users.role,
            xp: users.xp,
            level: users.level,
            passwordHash: users.passwordHash,
          });

        user = createdStudent;
      }

      if (!user) {
        return res.status(401).json({ message: "Nesprávné přihlašovací údaje" });
      }

      const normalizedRole =
        user.role === "lecturer" || user.role === "student" ? user.role : null;
      if (!normalizedRole) {
        return res.status(403).json({ message: "Nepodporovaná role účtu" });
      }

      if (
        (mode === "lecturer" || mode === "student") &&
        normalizedRole !== mode
      ) {
        return res.status(403).json({ message: "Tento účet neodpovídá zvolenému režimu" });
      }

      const isValidUserPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidUserPassword) {
        return res.status(401).json({ message: "Nesprávné přihlašovací údaje" });
      }

      const token = jwt.sign(
        {
          actorType: "organization_user",
          id: user.id,
          username: user.username,
          role: normalizedRole,
          organizationId: fullOrganization.uuid,
          orgSlug: fullOrganization.slug,
        },
        getJwtSecret(),
      );

      res.clearCookie(ORG_AUTH_COOKIE, getOrgCookieOptions());
      res.cookie(LEGACY_AUTH_COOKIE, token, getLegacyCookieOptions());
      const studentProgress =
        normalizedRole === "student"
          ? { xp: user.xp, level: user.level }
          : {};
      return res.json({
        actorType: "organization_user",
        id: user.id,
        username: user.username,
        role: normalizedRole,
        ...studentProgress,
        organizationId: fullOrganization.uuid,
        orgSlug: fullOrganization.slug,
        organizationName: fullOrganization.name,
      });
    }

    const isValid = await bcrypt.compare(password, fullOrganization.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Nesprávné přihlašovací údaje" });
    }

    const token = jwt.sign(
      {
        actorType: "organization_admin",
        organizationId: fullOrganization.uuid,
        orgSlug: fullOrganization.slug,
      },
      getJwtSecret(),
    );

    res.clearCookie(LEGACY_AUTH_COOKIE, getLegacyCookieOptions());
    res.cookie(ORG_AUTH_COOKIE, token, getOrgCookieOptions());
    return res.json({
      actorType: "organization_admin",
      organizationId: fullOrganization.uuid,
      orgSlug: fullOrganization.slug,
      organizationName: fullOrganization.name,
      mustChangePassword: fullOrganization.mustChangePassword,
      status: fullOrganization.status,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to login organization");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationAuthMe(req: AuthRequest, res: Response) {
  try {
    const organization = req.organization;
    if (!organization || !req.user) {
      return res.status(401).json({ message: "Nejste oprávněni" });
    }

    if (
      req.user.actorType === "organization_admin" &&
      req.user.organizationId === organization.uuid
    ) {
      return res.json({
        actorType: "organization_admin",
        organizationId: organization.uuid,
        orgSlug: organization.slug,
        organizationName: organization.name,
        mustChangePassword: organization.mustChangePassword,
        status: organization.status,
      });
    }

    if (
      req.user.actorType === "organization_user" &&
      req.user.organizationId === organization.uuid &&
      req.user.orgSlug === organization.slug
    ) {
      const [currentUser] = await db
        .select({
          id: users.uuid,
          username: users.username,
          role: users.role,
          xp: users.xp,
          level: users.level,
        })
        .from(users)
        .where(
          and(
            eq(users.uuid, req.user.id),
            eq(users.organizationId, organization.uuid),
          ),
        )
        .limit(1);

      if (!currentUser) {
        res.clearCookie(LEGACY_AUTH_COOKIE, getLegacyCookieOptions());
        return res.status(401).json({ message: "Relace vypršela" });
      }

      const normalizedRole =
        currentUser.role === "lecturer" || currentUser.role === "student"
          ? currentUser.role
          : "student";
      const studentProgress =
        normalizedRole === "student"
          ? { xp: currentUser.xp, level: currentUser.level }
          : {};

      return res.json({
        actorType: "organization_user",
        organizationId: organization.uuid,
        orgSlug: organization.slug,
        organizationName: organization.name,
        id: currentUser.id,
        username: currentUser.username,
        role: normalizedRole,
        ...studentProgress,
      });
    }

    return res.status(401).json({ message: "Nejste oprávněni" });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch organization auth me");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function changeOrganizationPassword(
  req: AuthRequest,
  res: Response,
) {
  try {
    const organization = req.organization;
    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");

    if (
      !organization ||
      req.user?.actorType !== "organization_admin" ||
      req.user.organizationId !== organization.uuid
    ) {
      return res.status(401).json({ message: "Nejste oprávněni" });
    }

    const [fullOrganization] = await db
      .select({
        uuid: organizations.uuid,
        slug: organizations.slug,
        name: organizations.name,
        passwordHash: organizations.passwordHash,
      })
      .from(organizations)
      .where(eq(organizations.uuid, organization.uuid));

    if (!fullOrganization) {
      return res.status(404).json({ message: "Organizace nebyla nalezena" });
    }

    const isValid = await bcrypt.compare(currentPassword, fullOrganization.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Aktuální heslo není správné" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const [updated] = await db
      .update(organizations)
      .set({
        passwordHash,
        mustChangePassword: false,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(organizations.uuid, organization.uuid))
      .returning(toOrganizationSelect);

    return res.json({
      actorType: "organization_admin",
      organizationId: organization.uuid,
      orgSlug: organization.slug,
      organizationName: organization.name,
      mustChangePassword: updated.mustChangePassword,
      status: updated.status,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to change organization password");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationsPublicDirectory(
  _req: Request,
  res: Response,
) {
  try {
    const items = await db
      .select({
        uuid: organizations.uuid,
        name: organizations.name,
        slug: organizations.slug,
        city: organizations.city,
        country: organizations.country,
        region: organizations.region,
        type: organizations.type,
      })
      .from(organizations)
      .where(eq(organizations.status, "active"))
      .orderBy(desc(organizations.createdAt));

    return res.json(items);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch organizations directory");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function getOrganizationSummaryForCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const [course] = await db
      .select({
        courseId: courses.uuid,
        orgSlug: organizations.slug,
      })
      .from(courses)
      .innerJoin(organizations, eq(organizations.uuid, courses.organizationId))
      .where(eq(courses.uuid, courseId));

    if (!course) {
      return res.status(404).json({ message: "Kurz nebyl nalezen" });
    }

    return res.json(course);
  } catch (error) {
    logger.error({ err: error }, "Failed to resolve course organization");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}
