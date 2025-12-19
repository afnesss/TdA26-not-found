import { Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const user = await db.select().from(users).where(eq(users.username, username));

  if (user.length === 0) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);

  if (!isValidPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.user = { uuid: user[0].uuid, username: user[0].username };

  res.json({ user: { uuid: user[0].uuid, username: user[0].username } });
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
}

export async function me(req: Request, res: Response) {
  if (!req.session.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({ user: req.session.user });
}
