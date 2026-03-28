import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthActorType, AuthRequest, AuthUser } from "../types/auth";

export const ADMIN_AUTH_COOKIE = "admin_token";
export const ORG_AUTH_COOKIE = "org_token";

const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
});

export const getAdminCookieOptions = () => ({
  ...getBaseCookieOptions(),
  path: "/api",
});

export const getOrgCookieOptions = () => ({
  ...getBaseCookieOptions(),
  path: "/api/orgs",
});

const clearAuthCookieAndRespond = (
  res: Response,
  cookieName: string,
  cookieOptions: ReturnType<typeof getAdminCookieOptions>,
) => {
  res.clearCookie(cookieName, cookieOptions);
  res.status(401).json({ message: "Relace vypršela" });
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

const mapPayloadToUser = (payload: jwt.JwtPayload): AuthUser | null => {
  const actorType = String(payload.actorType ?? "");

  if (actorType === "platform_admin" && typeof payload.username === "string") {
    return {
      actorType: "platform_admin",
      username: String(payload.username),
    };
  }

  if (
    actorType === "organization_admin" &&
    typeof payload.organizationId === "string" &&
    typeof payload.orgSlug === "string"
  ) {
    return {
      actorType: "organization_admin",
      organizationId: String(payload.organizationId),
      orgSlug: String(payload.orgSlug),
    };
  }

  return null;
};

const createAuthMiddleware =
  (
    cookieName: string,
    cookieOptions: ReturnType<typeof getAdminCookieOptions>,
    expectedActorType: AuthActorType,
  ) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.[cookieName];
    if (!token) {
      res.status(401).json({ message: "Nejste oprávnění" });
      return;
    }

    try {
      const payload = jwt.verify(token, getJwtSecret());

      if (typeof payload === "string" || typeof payload !== "object" || payload === null) {
        clearAuthCookieAndRespond(res, cookieName, cookieOptions);
        return;
      }

      const user = mapPayloadToUser(payload as jwt.JwtPayload);
      if (!user || user.actorType !== expectedActorType) {
        clearAuthCookieAndRespond(res, cookieName, cookieOptions);
        return;
      }

      req.user = user;
      next();
    } catch {
      clearAuthCookieAndRespond(res, cookieName, cookieOptions);
    }
  };

export const adminAuthMiddleware = createAuthMiddleware(
  ADMIN_AUTH_COOKIE,
  getAdminCookieOptions(),
  "platform_admin",
);

export const organizationAuthMiddleware = createAuthMiddleware(
  ORG_AUTH_COOKIE,
  getOrgCookieOptions(),
  "organization_admin",
);

export const scopedAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.organization || req.params.orgSlug) {
    return organizationAuthMiddleware(req, res, next);
  }

  return adminAuthMiddleware(req, res, next);
};
