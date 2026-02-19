import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

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
  const token = jwt.sign({ username }, jwtSecret);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "OK" });
}

export async function logout(req: Request, res: Response) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Odhlášení proběhlo úspěšně" });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Nejste oprávněni" });
  res.json({ username: req.user.username });
}
