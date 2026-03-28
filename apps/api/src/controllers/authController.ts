import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";
import {
  ADMIN_AUTH_COOKIE,
  ORG_AUTH_COOKIE,
  getAdminCookieOptions,
  getOrgCookieOptions,
} from "../middleware/auth";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Vyplňte prosím jméno a heslo" });
    return;
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    res.status(401).json({ error: "Nesprávné přihlašovací údaje" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  const token = jwt.sign({ actorType: "platform_admin", username }, jwtSecret);

  res.cookie(ADMIN_AUTH_COOKIE, token, getAdminCookieOptions());

  res.json({ message: "OK" });
}

export async function logoutAdmin(_req: Request, res: Response) {
  res.clearCookie(ADMIN_AUTH_COOKIE, getAdminCookieOptions());
  res.json({ message: "Odhlášení proběhlo úspěšně" });
}

export async function logoutOrganization(_req: Request, res: Response) {
  res.clearCookie(ORG_AUTH_COOKIE, getOrgCookieOptions());
  res.json({ message: "Odhlášení proběhlo úspěšně" });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user || req.user.actorType !== "platform_admin") {
    return res.status(401).json({ error: "Nejste oprávněni" });
  }

  res.json({
    actorType: "platform_admin",
    username: req.user.username,
  });
}
