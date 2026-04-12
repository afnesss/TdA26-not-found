import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";
import { logger } from "../utils/logger";
import { getApiMessage } from "../utils/apiMessages";
import {
  LEGACY_AUTH_COOKIE,
  ADMIN_AUTH_COOKIE,
  ORG_AUTH_COOKIE,
  getAdminCookieOptions,
  getLegacyCookieOptions,
  getOrgCookieOptions,
} from "../middleware/auth";

const getPlatformAdminCredentials = () => {
  const username =
    process.env.ADMIN_USERNAME?.trim() || "CHANGE_ME_ADMIN_USERNAME";
  const password = process.env.ADMIN_PASSWORD || "CHANGE_ME_ADMIN_PASSWORD";

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    logger.warn(
      "ADMIN_USERNAME/ADMIN_PASSWORD not set, using placeholder fallback credentials",
    );
  }

  return { username, password };
};

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      error: getApiMessage(req, "adminCredentialsRequired"),
    });
    return;
  }

  const adminCredentials = getPlatformAdminCredentials();
  if (
    username !== adminCredentials.username ||
    password !== adminCredentials.password
  ) {
    res.status(401).json({ error: getApiMessage(req, "invalidCredentials") });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  const token = jwt.sign({ actorType: "platform_admin", username }, jwtSecret);

  res.cookie(ADMIN_AUTH_COOKIE, token, getAdminCookieOptions());

  res.json({
    token,
    actorType: "platform_admin",
    username,
  });
}

export async function logoutAdmin(req: Request, res: Response) {
  res.clearCookie(ADMIN_AUTH_COOKIE, getAdminCookieOptions());
  res.json({ message: getApiMessage(req, "logoutSuccess") });
}

export async function logoutOrganization(req: Request, res: Response) {
  res.clearCookie(ORG_AUTH_COOKIE, getOrgCookieOptions());
  res.clearCookie(LEGACY_AUTH_COOKIE, getLegacyCookieOptions());
  res.json({ message: getApiMessage(req, "logoutSuccess") });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user || req.user.actorType !== "platform_admin") {
    return res.status(401).json({ error: getApiMessage(req, "unauthorized") });
  }

  res.json({
    actorType: "platform_admin",
    username: req.user.username,
  });
}
