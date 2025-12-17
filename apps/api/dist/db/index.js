"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env file");
}
const client = new pg_1.Pool({
    connectionString: connectionString,
});
exports.db = (0, node_postgres_1.drizzle)(client);
