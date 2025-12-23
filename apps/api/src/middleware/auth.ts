import { Request, Response, NextFunction } from "express";

// declare module "express-session" {
//   interface SessionData {
//     user?: { uuid: string; username: string };
//   }
// }

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // if (!req.session.user) {
  //   res.status(401).json({ error: "Unauthorized" });
  //   return;
  // }
  next();
}