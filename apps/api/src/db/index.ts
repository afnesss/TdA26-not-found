import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env file");
}

const client = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(client);
