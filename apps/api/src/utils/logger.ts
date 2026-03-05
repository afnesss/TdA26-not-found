import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const shouldLog = (level: "debug" | "info" | "warn" | "error") => {
  const configured =
    (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error" | undefined) ??
    (process.env.NODE_ENV === "production" ? "info" : "debug");
  const order = ["debug", "info", "warn", "error"] as const;
  return order.indexOf(level) >= order.indexOf(configured);
};

const log = (level: "debug" | "info" | "warn" | "error", ...args: unknown[]) => {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  console[level](`[${ts}]`, ...args);
};

export const logger = {
  debug: (...args: unknown[]) => log("debug", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
};

const shouldIgnorePath = (req: Request) => {
  const path = req.originalUrl?.split("?")[0] ?? "";
  return path === "/health" || path.startsWith("/uploads");
};

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  if (shouldIgnorePath(req)) return next();

  const start = Date.now();
  const requestId =
    req.header("x-request-id") ??
    (typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  res.setHeader("x-request-id", requestId);
  (req as Request & { id?: string }).id = requestId;

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level](
      "HTTP",
      req.method,
      req.originalUrl?.split("?")[0] ?? req.url,
      res.statusCode,
      `${durationMs}ms`,
      `id=${requestId}`,
    );
  });

  next();
};
