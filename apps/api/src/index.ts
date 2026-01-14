import cors from "cors";
import express from "express";
// import session from "express-session";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import materialRoutes from "./routes/materialRoutes";
import quizRoutes from "./routes/quizRoutes";
import feedRoutes from "./routes/feedRoutes";
import { seed } from "./db/seed";
import path from "path";

const app = express();
const port = process.env.PORT;
// const sessionSecret = process.env.SESSION_SECRET;

if (!port) {
  throw new Error("PORT is undefined or is not set in .env file");
}

// if (!sessionSecret) {
//   throw new Error("SESSION_SECRET in undefined or is not set in .env file");
// }

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Skip body parsing for multipart requests (handled by multer)
app.use((req, res, next) => {
  if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "50mb" })(req, res, next);
});

// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

app.get("/", (req, res) => {
  res.json({ organization: "Student Cyber Games" });
});

// Serve static files from uploads directory
// Caddy strips /api, so request to /api/uploads/... becomes /uploads/... here
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// app.use("/auth", authRoutes);
app.use("/courses/:courseId/materials", materialRoutes);
app.use("/courses/:courseId/quizzes", quizRoutes);
app.use("/courses/:courseId/feed", feedRoutes);
app.use("/courses", courseRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Došlo k chybě serveru" });
  }
);

async function start() {
  try {
    await seed();
  } catch (error: any) {
    if (error?.code === "42P07" || error?.cause?.code === "42P07") {
      console.warn(
        "Migration warning: table already exists — continuing startup."
      );
    } else {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  try {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
