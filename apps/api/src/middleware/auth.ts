import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

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

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("username" in payload)
    ) {
      clearAuthCookieAndRespond(res, cookieOptions);
      return;
    }
    req.user = { username: String((payload as jwt.JwtPayload).username) };
    next();
  } catch (error) {
    clearAuthCookieAndRespond(res, cookieOptions);
  }
}
