import type { NextFunction, Request, Response } from "express";
import { DEFAULT_LOCALE, normalizeLocale } from "../utils/i18n";

export type RequestWithLocale = Request & { locale?: "cs" | "en" };

export function localeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestedLocale = normalizeLocale(
    req.header("x-locale") ?? req.query.locale ?? DEFAULT_LOCALE,
  );

  (req as RequestWithLocale).locale = requestedLocale;
  res.locals.locale = requestedLocale;
  next();
}
