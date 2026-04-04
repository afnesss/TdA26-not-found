import { z } from "zod";
import {
  LocaleSchema,
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
} from "./i18n";

export const FeedItemSchema = z.object({
  uuid: z.string().uuid(),
  type: z.enum(["manual", "system"]),
  message: z.string(),
  messageI18n: LocalizedFieldSchema.optional(),
  resolvedLocale: LocaleSchema.optional(),
  isFallback: z.boolean().optional(),
  edited: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
}).merge(LocalizedEntityMetaSchema);

export const FeedCreateRequestSchema = z.object({
  sourceLocale: LocaleSchema.default("en"),
  message: z.string(),
  messageI18n: LocalizedFieldSchema.optional(),
});

export const FeedUpdateRequestSchema = z.object({
  sourceLocale: LocaleSchema.optional(),
  message: z.string().optional(),
  messageI18n: LocalizedFieldSchema.optional(),
  edited: z.boolean().optional(),
});

export type FeedItem = z.infer<typeof FeedItemSchema>;
export type FeedCreateRequest = z.infer<typeof FeedCreateRequestSchema>;
export type FeedUpdateRequest = z.infer<typeof FeedUpdateRequestSchema>;
