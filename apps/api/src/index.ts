import cors from "cors";
import express from "express";
import session from "express-session";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import { seed } from "./db/seed";

const app = express();
const port = process.env.PORT;
const sessionSecret = process.env.SESSION_SECRET;

if (!port) {
  throw new Error("PORT is undefined or is not set in .env file");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET in undefined or is not set in .env file");
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.get("/", (req, res) => {
  res.json({ organization: "Student Cyber Games" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

async function start() {
  try {
    await seed();
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
