import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Rate limit exceeded. Please try again later" },
  standardHeaders: true,
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many write operations, please slow down." },
  standardHeaders: true,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many file uploads from this IP, please try again later.",
  },
  standardHeaders: true,
});

export const quizSubmitLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many quiz submission attempts, please try again later.",
  },
  standardHeaders: true,
});
