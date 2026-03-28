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

export const users = pgTable("users", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  shareToken: varchar("share_token", { length: 128 }),
  shareTokenUpdatedAt: timestamp("share_token_updated_at"),
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
  downloadCount: integer("download_count").notNull().default(0),
  copyCount: integer("copy_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .references(() => modules.uuid, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("beginner"),
  questions: jsonb("questions").notNull(), // Stores Question[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseSessions = pgTable("course_sessions", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .references(() => courses.uuid, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'closed'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseSessionParticipants = pgTable(
  "course_session_participants",
  {
    uuid: uuid("uuid").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.uuid, { onDelete: "cascade" })
      .notNull(),
    sessionId: uuid("session_id")
      .references(() => courseSessions.uuid, { onDelete: "cascade" })
      .notNull(),
    participantToken: uuid("participant_token").defaultRandom().notNull(),
    nickname: varchar("nickname", { length: 64 }).notNull(),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("course_session_participants_session_nickname_unique").on(
      t.sessionId,
      t.nickname,
    ),
    uniqueIndex("course_session_participants_participant_token_unique").on(
      t.participantToken,
    ),
  ],
);

export const quizSubmissions = pgTable("quiz_submissions", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.uuid, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.uuid, {
    onDelete: "set null",
  }),
  participantId: uuid("participant_id").references(
    () => courseSessionParticipants.uuid,
    {
      onDelete: "set null",
    },
  ),
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
