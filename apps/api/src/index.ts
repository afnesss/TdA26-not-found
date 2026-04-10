import cors from "cors";
import express from "express";
// import session from "express-session";
import authRoutes from "./routes/authRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminOrganizationRoutes from "./routes/adminOrganizationRoutes";
import courseShareRoutes from "./routes/courseShareRoutes";
import organizationRequestRoutes from "./routes/organizationRequestRoutes";
import orgRoutes from "./routes/orgRoutes";
import shopRoutes from "./routes/shopRoutes";
import { seed } from "./db/seed";
import path from "path";
import cookieParser from "cookie-parser";
import { localeMiddleware } from "./middleware/locale";
import {
  startIntervalScheduler,
  stopIntervalScheduler,
} from "./utils/courseScheduler";
import { httpLogger, logger } from "./utils/logger";

const app = express();
const port = process.env.PORT;

if (!port) {
  throw new Error("PORT is undefined or is not set in .env file");
}

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());
app.set("trust proxy", 1);

// Strip /api prefix when present (e.g. Render deployments without Caddy)
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/")) {
    req.url = req.url.slice(4);
  }
  next();
});

app.use(httpLogger);
app.use(localeMiddleware);

// Skip body parsing for multipart requests (handled by multer)
app.use((req, res, next) => {
  if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "50mb" })(req, res, next);
});

app.get("/", (req, res) => {
  res.json({ organization: "Student Cyber Games" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Serve static files from uploads directory
// Caddy strips /api, so request to /api/uploads/... becomes /uploads/... here
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use("/admin", adminOrganizationRoutes);
app.use("/organization-requests", organizationRequestRoutes);
app.use("/orgs", orgRoutes);
app.use("/course-share", courseShareRoutes);
app.use("/shop", shopRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const requestId = (req as { id?: string }).id ?? "unknown";
    logger.error({ err, requestId }, "Unhandled error");
    res.status(500).json({ message: "Došlo k chybě serveru" });
  },
);

async function start() {
  try {
    await seed();
  } catch (error: any) {
    if (error?.code === "42P07" || error?.cause?.code === "42P07") {
      logger.warn(
        "Migration warning: table already exists — continuing startup.",
      );
    } else {
      logger.error({ err: error }, "Failed to start server");
      process.exit(1);
    }
  }

  try {
    const server = app.listen(port, () => {
      logger.info(`Server is listening on port ${port}`);
    });
    startIntervalScheduler();

    const shutdown = (signal: string) => {
      logger.info(`[shutdown] Received ${signal}, stopping gracefully...`);
      stopIntervalScheduler();
      server.close((err) => {
        if (err) {
          logger.error({ err }, "[shutdown] Error while closing server");
          process.exit(1);
        }
        logger.info("[shutdown] HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    stopIntervalScheduler();
    process.exit(1);
  }
}

start();
