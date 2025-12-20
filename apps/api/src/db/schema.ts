import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseMaterials = pgTable("course_materials", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.uuid, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(), // 'link' or 'file'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Link-specific
  url: text("url"),
  // File-specific
  fileContent: text("file_content"),
  mimeType: varchar("mime_type", { length: 100 }),
  originalFilename: varchar("original_filename", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
