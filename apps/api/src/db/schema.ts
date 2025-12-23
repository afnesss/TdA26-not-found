import { pgTable, text, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core";

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

export const courseMaterials = pgTable("course_materials", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .references(() => courses.uuid, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'file' or 'url'
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  // For file
  fileUrl: text("file_url"),
  mimeType: varchar("mime_type", { length: 256 }),
  sizeBytes: integer("size_bytes"),
  originalFilename: text("original_filename"),
  // For URL
  url: text("url"),
  faviconUrl: text("favicon_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
