import { randomBytes } from "crypto";
import type { Request } from "express";

const SHARE_TOKEN_BYTES = 24;

export const generateCourseShareToken = () =>
  randomBytes(SHARE_TOKEN_BYTES).toString("base64url");

const getPublicAppUrl = () => {
  const publicAppUrl = process.env.PUBLIC_APP_URL?.trim();

  if (!publicAppUrl) {
    return null;
  }

  return publicAppUrl.replace(/\/+$/, "");
};

const getRequestBaseUrl = (req: Request) => {
  const publicAppUrl = getPublicAppUrl();
  if (publicAppUrl) {
    return publicAppUrl;
  }

  const protoHeader = req.get("x-forwarded-proto");
  const protocol = protoHeader?.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");

  if (!host) {
    throw new Error("Request host header is missing");
  }

  return `${protocol}://${host}`;
};

export const buildCourseShareUrl = (req: Request, token: string) =>
  `${getRequestBaseUrl(req)}/share/course/${token}`;
