import crypto from "crypto";
import type { Request, Response } from "express";
import pino from "pino";
import pinoHttp from "pino-http";

const level =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = pino({
  level,
});

const getRoutePath = (req: Request) => {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }
  return req.originalUrl?.split("?")[0] ?? req.url;
};

export const httpLogger = pinoHttp({
  logger,
  genReqId: (_req: Request, res: Response) => {
    const id = crypto.randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: () => "HTTP request completed",
  customErrorMessage: () => "HTTP request failed",
  autoLogging: {
    ignore: (req: Request) => {
      const path = (req as Request).originalUrl?.split("?")[0] ?? "";
      return path === "/health" || path.startsWith("/uploads");
    },
  },
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.originalUrl?.split("?")[0] ?? req.url,
      route: getRoutePath(req as Request),
      remoteAddress: req.ip,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
  },
  customProps: (req: Request) => ({
    userId: (req as { user?: { username?: string } }).user?.username ?? null,
  }),
});
