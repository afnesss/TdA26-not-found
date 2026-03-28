import { Request } from "express";

export type AuthRole = "lecturer" | "student";

export type AuthUser = {
  id: string | null;
  username: string;
  role: AuthRole;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};
