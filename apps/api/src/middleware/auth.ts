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
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("strict" as const),
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

type CookieOptions = ReturnType<typeof getAdminCookieOptions>;
type SupportedAuthActorType = AuthActorType | "legacy_user";
type AuthCookieConfig = {
  name: string;
  options: CookieOptions;
};
type ExtractedToken =
  | {
      token: string;
      source: "authorization";
    }
  | {
      token: string;
      source: "cookie";
      cookie: AuthCookieConfig;
    };

const ADMIN_COOKIE_CONFIG: AuthCookieConfig = {
  name: ADMIN_AUTH_COOKIE,
  options: getAdminCookieOptions(),
};

const ORG_COOKIE_CONFIG: AuthCookieConfig = {
  name: ORG_AUTH_COOKIE,
  options: getOrgCookieOptions(),
};

const LEGACY_COOKIE_CONFIG: AuthCookieConfig = {
  name: LEGACY_AUTH_COOKIE,
  options: getLegacyCookieOptions(),
};

const clearAuthCookieAndRespond = (
  req: AuthRequest,
  res: Response,
  cookieName: string,
  cookieOptions: CookieOptions,
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

const getBearerToken = (req: AuthRequest) => {
  const authorizationHeader = req.header("authorization");
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim() || null;
};

const extractToken = (
  req: AuthRequest,
  cookieConfigs: AuthCookieConfig[],
): ExtractedToken | null => {
  const bearerToken = getBearerToken(req);
  if (bearerToken) {
    return {
      token: bearerToken,
      source: "authorization",
    };
  }

  for (const cookieConfig of cookieConfigs) {
    const token = req.cookies?.[cookieConfig.name];
    if (token) {
      return {
        token,
        source: "cookie",
        cookie: cookieConfig,
      };
    }
  }

  return null;
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

const verifyToken = (token: string) => {
  const payload = jwt.verify(token, getJwtSecret());
  if (
    typeof payload === "string" ||
    typeof payload !== "object" ||
    payload === null
  ) {
    return null;
  }

  return mapPayloadToUser(payload as jwt.JwtPayload);
};

const matchesOrganizationScope = (req: AuthRequest, user: AuthUser) => {
  const requestOrgSlug =
    req.organization?.slug || String(req.params.orgSlug ?? "").trim() || null;
  const requestOrganizationId = req.organization?.uuid ?? null;

  if (!requestOrgSlug && !requestOrganizationId) {
    return true;
  }

  if (
    user.actorType !== "organization_admin" &&
    user.actorType !== "organization_user"
  ) {
    return true;
  }

  if (
    requestOrganizationId &&
    user.organizationId !== requestOrganizationId
  ) {
    return false;
  }

  if (requestOrgSlug && user.orgSlug !== requestOrgSlug) {
    return false;
  }

  return true;
};

const handleUnauthorized = (
  req: AuthRequest,
  res: Response,
  extractedToken?: ExtractedToken | null,
) => {
  if (extractedToken?.source === "cookie") {
    clearAuthCookieAndRespond(
      req,
      res,
      extractedToken.cookie.name,
      extractedToken.cookie.options,
    );
    return;
  }

  res.status(401).json({ message: getApiMessage(req, "unauthorized") });
};

const createAuthMiddleware =
  (
    cookieConfigs: AuthCookieConfig[],
    expectedActorTypes: SupportedAuthActorType[],
  ) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const extractedToken = extractToken(req, cookieConfigs);
    if (!extractedToken) {
      res.status(401).json({ message: getApiMessage(req, "unauthorized") });
      return;
    }

    try {
      const user = verifyToken(extractedToken.token);
      if (
        !user ||
        !expectedActorTypes.includes(user.actorType) ||
        !matchesOrganizationScope(req, user)
      ) {
        handleUnauthorized(req, res, extractedToken);
        return;
      }

      req.user = user;
      next();
    } catch {
      handleUnauthorized(req, res, extractedToken);
    }
  };

export const adminAuthMiddleware = createAuthMiddleware(
  [ADMIN_COOKIE_CONFIG],
  ["platform_admin"],
);

export const organizationAuthMiddleware = createAuthMiddleware(
  [ORG_COOKIE_CONFIG],
  ["organization_admin"],
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
  return createAuthMiddleware([LEGACY_COOKIE_CONFIG, ORG_COOKIE_CONFIG], [
    "legacy_user",
    "organization_admin",
    "organization_user",
  ])(req, res, next);
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  return createAuthMiddleware([LEGACY_COOKIE_CONFIG], [
    "legacy_user",
    "organization_user",
  ])(req, res, next);
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
