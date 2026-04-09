import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthActorType, AuthRequest, AuthUser } from "../types/auth";
import { getApiMessage } from "../utils/apiMessages";

export const ADMIN_AUTH_COOKIE = "admin_token";
export const ORG_AUTH_COOKIE = "org_token";
export const LEGACY_AUTH_COOKIE = "token";

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

export const getLegacyCookieOptions = () => ({
  ...getBaseCookieOptions(),
  path: "/api",
});

const clearAuthCookieAndRespond = (
  req: AuthRequest,
  res: Response,
  cookieName: string,
  cookieOptions: ReturnType<typeof getAdminCookieOptions>,
) => {
  res.clearCookie(cookieName, cookieOptions);
  res.status(401).json({ message: getApiMessage(req, "sessionExpired") });
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

  if (
    actorType === "organization_user" &&
    typeof payload.id === "string" &&
    typeof payload.username === "string" &&
    typeof payload.role === "string" &&
    typeof payload.organizationId === "string" &&
    typeof payload.orgSlug === "string"
  ) {
    return {
      actorType: "organization_user",
      id: String(payload.id),
      username: String(payload.username),
      role:
        payload.role === "lecturer" || payload.role === "student"
          ? payload.role
          : "student",
      organizationId: String(payload.organizationId),
      orgSlug: String(payload.orgSlug),
    };
  }

  if (
    typeof payload.id === "string" &&
    typeof payload.username === "string" &&
    typeof payload.role === "string"
  ) {
    return {
      actorType: "legacy_user",
      id: String(payload.id),
      username: String(payload.username),
      role: String(payload.role),
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
      res.status(401).json({ message: getApiMessage(req, "unauthorized") });
      return;
    }

    try {
      const payload = jwt.verify(token, getJwtSecret());

      if (
        typeof payload === "string" ||
        typeof payload !== "object" ||
        payload === null
      ) {
        clearAuthCookieAndRespond(req, res, cookieName, cookieOptions);
        return;
      }

      const user = mapPayloadToUser(payload as jwt.JwtPayload);
      if (!user || user.actorType !== expectedActorType) {
        clearAuthCookieAndRespond(req, res, cookieName, cookieOptions);
        return;
      }

      req.user = user;
      next();
    } catch {
      clearAuthCookieAndRespond(req, res, cookieName, cookieOptions);
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

export const organizationScopedAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.cookies?.[LEGACY_AUTH_COOKIE]) {
    return authMiddleware(req, res, next);
  }

  if (req.cookies?.[ORG_AUTH_COOKIE]) {
    return organizationAuthMiddleware(req, res, next);
  }

  return authMiddleware(req, res, next);
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[LEGACY_AUTH_COOKIE];
  if (!token) {
    res.status(401).json({ message: getApiMessage(req, "unauthorized") });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (
      typeof payload === "string" ||
      typeof payload !== "object" ||
      payload === null
    ) {
      clearAuthCookieAndRespond(
        req,
        res,
        LEGACY_AUTH_COOKIE,
        getAdminCookieOptions(),
      );
      return;
    }

    const user = mapPayloadToUser(payload as jwt.JwtPayload);
    if (
      !user ||
      (user.actorType !== "legacy_user" &&
        user.actorType !== "organization_user")
    ) {
      clearAuthCookieAndRespond(
        req,
        res,
        LEGACY_AUTH_COOKIE,
        getAdminCookieOptions(),
      );
      return;
    }

    req.user = user;
    next();
  } catch {
    clearAuthCookieAndRespond(
      req,
      res,
      LEGACY_AUTH_COOKIE,
      getAdminCookieOptions(),
    );
  }
};

export const requireRole =
  (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      !req.user ||
      (req.user.actorType !== "legacy_user" &&
        req.user.actorType !== "organization_user") ||
      req.user.role !== role
    ) {
      res.status(403).json({
        message: getApiMessage(req, "insufficientPermissions"),
      });
      return;
    }

    next();
  };
