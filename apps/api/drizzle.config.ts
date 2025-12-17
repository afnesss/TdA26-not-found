import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const config: Config = {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};

export default config;
