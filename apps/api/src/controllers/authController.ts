import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { AuthRequest } from "../types/auth";

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: TOKEN_MAX_AGE_MS,
});

const issueAuthCookie = (
  res: Response,
  payload: { sub?: string; username: string; role: "lecturer" | "student" },
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Server misconfiguration");
  }

  const token = jwt.sign(payload, jwtSecret, { expiresIn: "30d" });
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

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

  try {
    issueAuthCookie(res, {
      sub: `lecturer:${String(username)}`,
      username: String(username),
      role: "lecturer",
    });
  } catch (_error) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  res.json({
    user: {
      id: "lecturer",
      username: String(username),
      role: "lecturer",
      xp: 0,
      level: 1,
    },
  });
}

export async function studentUpsertLogin(req: Request, res: Response) {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    return res.status(400).json({ message: "Vyplňte prosím jméno a heslo" });
  }

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.passwordHash,
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Nesprávné přihlašovací údaje" });
      }

      issueAuthCookie(res, {
        sub: existingUser.uuid,
        username: existingUser.username,
        role: "student",
      });

      return res.json({
        user: {
          id: existingUser.uuid,
          username: existingUser.username,
          role: existingUser.role,
          xp: existingUser.xp,
          level: existingUser.level,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        role: "student",
      })
      .returning();

    issueAuthCookie(res, {
      sub: newUser.uuid,
      username: newUser.username,
      role: "student",
    });

    return res.status(201).json({
      user: {
        id: newUser.uuid,
        username: newUser.username,
        role: newUser.role,
        xp: newUser.xp,
        level: newUser.level,
      },
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ message: "Uživatelské jméno je již obsazené" });
    }
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function logout(req: Request, res: Response) {
  const { maxAge: _maxAge, ...cookieOptions } = getCookieOptions();
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: "Odhlášení proběhlo úspěšně" });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Nejste oprávněni" });

  if (req.user.role === "lecturer") {
    return res.json({
      id: "lecturer",
      username: req.user.username,
      role: "lecturer",
      xp: 0,
      level: 1,
    });
  }

  if (!req.user.id) {
    return res.status(401).json({ error: "Neplatná relace" });
  }

  const [student] = await db
    .select({
      id: users.uuid,
      username: users.username,
      role: users.role,
      xp: users.xp,
      level: users.level,
    })
    .from(users)
    .where(eq(users.uuid, req.user.id))
    .limit(1);

  if (!student) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.status(401).json({ error: "Relace vypršela" });
  }

  return res.json(student);
}
