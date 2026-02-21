import { time } from "console";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { StatusHistoryEvent } from "../schemas";
import { sql } from "drizzle-orm";

// export const users = pgTable("users", {
//   uuid: uuid("uuid").defaultRandom().primaryKey(),
//   username: varchar("username", { length: 256 }).notNull().unique(),
//   passwordHash: varchar("password_hash", { length: 256 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

export const courseStatusEnum = [
  "draft",
  "planned",
  "live",
  "paused",
  "archived",
] as const;

export const courses = pgTable("courses", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  startedAt: timestamp("started_at"),
  scheduledFor: timestamp("scheduled_for"),
  status_history: jsonb("status_history")
    .$type<StatusHistoryEvent[]>()
    .default([]),
});

export const modules = pgTable(
  "course_modules",
  {
    uuid: uuid("uuid").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.uuid, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("passive"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("course_modules_course_position_unique").on(
      t.courseId,
      t.position,
    ),
    check("course_modules_position_positive", sql`${t.position} > 0`),
  ],
);

export const courseMaterials = pgTable("course_materials", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .references(() => modules.uuid, { onDelete: "cascade" })
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

export const quizzes = pgTable("quizzes", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .references(() => modules.uuid, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  questions: jsonb("questions").notNull(), // Stores Question[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizSubmissions = pgTable("quiz_submissions", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.uuid, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  answers: jsonb("answers").notNull(), // Stores QuizAnswer[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedItems = pgTable("feed_items", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .references(() => courses.uuid, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'manual' or 'system'
  message: text("message").notNull(),
  edited: boolean("edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
