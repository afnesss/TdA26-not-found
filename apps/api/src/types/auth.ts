import { Request } from "express";

export type AuthUser = {
  username: string;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};
