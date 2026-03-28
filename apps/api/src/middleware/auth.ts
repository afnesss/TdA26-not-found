import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthRole } from "../types/auth";

const clearAuthCookieAndRespond = (
  res: Response,
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
  },
) => {
  res.clearCookie("token", cookieOptions);
  res.status(401).json({ message: "Relace vypršela" });
};

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: "Nejste oprávnění­" });
    return;
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: "Server misconfiguration" });
      return;
    }

    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") {
      clearAuthCookieAndRespond(res, cookieOptions);
      return;
    }

    const username =
      typeof payload?.username === "string" ? payload.username : null;
    const role = typeof payload?.role === "string" ? payload.role : null;
    const sub = typeof payload?.sub === "string" ? payload.sub : null;

    if (!username || (role !== "lecturer" && role !== "student")) {
      clearAuthCookieAndRespond(res, cookieOptions);
      return;
    }

    if (role === "student" && !sub) {
      clearAuthCookieAndRespond(res, cookieOptions);
      return;
    }

    req.user = {
      id: role === "student" ? sub : null,
      username,
      role,
    };
    next();
  } catch (error) {
    clearAuthCookieAndRespond(res, cookieOptions);
  }
}

export const requireRole =
  (requiredRole: AuthRole): RequestHandler =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Nejste oprávnění" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Nemáte dostatečná oprávnění" });
    }

    return next();
  };
