import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// export const users = pgTable("users", {
//   uuid: uuid("uuid").defaultRandom().primaryKey(),
//   username: varchar("username", { length: 256 }).notNull().unique(),
//   passwordHash: varchar("password_hash", { length: 256 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

export const courses = pgTable("courses", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
