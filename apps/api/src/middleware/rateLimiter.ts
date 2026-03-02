import rateLimit from "express-rate-limit";

const shouldSkipRateLimit =
  process.env.DISABLE_RATE_LIMIT === "true" ||
  process.env.NODE_ENV !== "production";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Rate limit exceeded. Please try again later" },
  standardHeaders: true,
  skip: () => shouldSkipRateLimit,
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many write operations, please slow down." },
  standardHeaders: true,
  skip: () => shouldSkipRateLimit,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many file uploads from this IP, please try again later.",
  },
  standardHeaders: true,
  skip: () => shouldSkipRateLimit,
});

export const quizSubmitLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many quiz submission attempts, please try again later.",
  },
  standardHeaders: true,
  skip: () => shouldSkipRateLimit,
});
