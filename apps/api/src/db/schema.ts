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
import { LocalizedField, LocalizedQuestion, StatusHistoryEvent } from "../schemas";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  username: varchar("username", { length: 64 }).notNull(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("users_organization_username_unique").on(
    t.organizationId,
    t.username,
  ),
]);

export const courseStatusEnum = [
  "draft",
  "planned",
  "live",
  "paused",
  "archived",
] as const;

export const organizationStatusEnum = [
  "waiting",
  "onboarding",
  "active",
] as const;

export const organizationRequestStatusEnum = [
  "pending",
  "approved",
  "rejected",
] as const;

export const organizations = pgTable("organizations", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  country: varchar("country", { length: 128 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  address: text("address").notNull(),
  postalCode: varchar("postal_code", { length: 32 }).notNull(),
  region: varchar("region", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  ownerName: varchar("owner_name", { length: 256 }).notNull(),
  contactEmail: varchar("contact_email", { length: 256 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationRequests = pgTable("organization_requests", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  country: varchar("country", { length: 128 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  address: text("address").notNull(),
  postalCode: varchar("postal_code", { length: 32 }).notNull(),
  region: varchar("region", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  ownerName: varchar("owner_name", { length: 256 }).notNull(),
  contactEmail: varchar("contact_email", { length: 256 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNote: text("admin_note"),
  decisionAt: timestamp("decision_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.uuid, { onDelete: "cascade" })
    .notNull(),
  sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
  name: varchar("name", { length: 256 }).notNull(),
  nameI18n: jsonb("name_i18n").$type<LocalizedField>().notNull().default({}),
  description: text("description"),
  descriptionI18n: jsonb("description_i18n")
    .$type<LocalizedField>()
    .notNull()
    .default({}),
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
    sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
    name: varchar("name", { length: 256 }).notNull(),
    nameI18n: jsonb("name_i18n").$type<LocalizedField>().notNull().default({}),
    description: text("description"),
    descriptionI18n: jsonb("description_i18n")
      .$type<LocalizedField>()
      .notNull()
      .default({}),
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
  sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
  type: varchar("type", { length: 50 }).notNull(), // 'file' or 'url'
  name: varchar("name", { length: 256 }).notNull(),
  nameI18n: jsonb("name_i18n").$type<LocalizedField>().notNull().default({}),
  description: text("description"),
  descriptionI18n: jsonb("description_i18n")
    .$type<LocalizedField>()
    .notNull()
    .default({}),
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
  sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
  title: varchar("title", { length: 256 }).notNull(),
  titleI18n: jsonb("title_i18n").$type<LocalizedField>().notNull().default({}),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("beginner"),
  questions: jsonb("questions").notNull(), // Stores Question[]
  questionsI18n: jsonb("questions_i18n")
    .$type<LocalizedQuestion[]>()
    .notNull()
    .default([]),
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
  sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
  type: varchar("type", { length: 20 }).notNull(), // 'manual' or 'system'
  message: text("message").notNull(),
  messageI18n: jsonb("message_i18n")
    .$type<LocalizedField>()
    .notNull()
    .default({}),
  edited: boolean("edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ShopOrderItemSnapshot = {
  merchItemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export const merchItems = pgTable(
  "merch_items",
  {
    uuid: uuid("uuid").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull(),
    sourceLocale: varchar("source_locale", { length: 2 }).notNull().default("en"),
    name: varchar("name", { length: 256 }).notNull(),
    nameI18n: jsonb("name_i18n").$type<LocalizedField>().notNull().default({}),
    description: text("description"),
    descriptionI18n: jsonb("description_i18n")
      .$type<LocalizedField>()
      .notNull()
      .default({}),
    imageUrl: text("image_url"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    purchaseMode: varchar("purchase_mode", { length: 16 })
      .notNull()
      .default("money"),
    xpCost: integer("xp_cost"),
    voucherDiscountPercent: integer("voucher_discount_percent"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("merch_items_slug_unique").on(t.slug),
    check("merch_items_unit_price_non_negative", sql`${t.unitPriceCents} >= 0`),
    check(
      "merch_items_purchase_mode_allowed",
      sql`${t.purchaseMode} in ('money', 'xp')`,
    ),
    check("merch_items_xp_cost_positive", sql`${t.xpCost} is null or ${t.xpCost} > 0`),
    check(
      "merch_items_voucher_discount_percent_range",
      sql`${t.voucherDiscountPercent} is null or (${t.voucherDiscountPercent} > 0 and ${t.voucherDiscountPercent} <= 100)`,
    ),
  ],
);

export const shopOrders = pgTable(
  "shop_orders",
  {
    uuid: uuid("uuid").defaultRandom().primaryKey(),
    contactEmail: varchar("contact_email", { length: 320 }).notNull(),
    items: jsonb("items").$type<ShopOrderItemSnapshot[]>().notNull(),
    promoCode: varchar("promo_code", { length: 64 }),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    check("shop_orders_subtotal_non_negative", sql`${t.subtotalCents} >= 0`),
    check("shop_orders_discount_non_negative", sql`${t.discountCents} >= 0`),
    check("shop_orders_total_non_negative", sql`${t.totalCents} >= 0`),
  ],
);

export const promoCodes = pgTable(
  "promo_codes",
  {
    uuid: uuid("uuid").defaultRandom().primaryKey(),
    code: varchar("code", { length: 64 }).notNull(),
    discountType: varchar("discount_type", { length: 16 }).notNull(),
    discountValue: integer("discount_value").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isUsed: boolean("is_used").notNull().default(false),
    xpRedemptionRef: varchar("xp_redemption_ref", { length: 128 }),
    usedInOrderId: uuid("used_in_order_id").references(() => shopOrders.uuid, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    usedAt: timestamp("used_at"),
  },
  (t) => [
    uniqueIndex("promo_codes_code_unique").on(t.code),
    check("promo_codes_discount_value_positive", sql`${t.discountValue} > 0`),
    check(
      "promo_codes_discount_type_allowed",
      sql`${t.discountType} in ('fixed', 'percent')`,
    ),
    check(
      "promo_codes_percent_limit",
      sql`(${t.discountType} <> 'percent') OR (${t.discountValue} <= 100)`,
    ),
  ],
);
