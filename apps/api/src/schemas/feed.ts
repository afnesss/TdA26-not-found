import { z } from "zod";

export const FeedItemSchema = z.object({
  uuid: z.string().uuid(),
  type: z.enum(["manual", "system"]),
  message: z.string(),
  edited: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const FeedCreateRequestSchema = z.object({
  message: z.string(),
});

export const FeedUpdateRequestSchema = z.object({
  message: z.string().optional(),
  edited: z.boolean().optional(),
});

export type FeedItem = z.infer<typeof FeedItemSchema>;
export type FeedCreateRequest = z.infer<typeof FeedCreateRequestSchema>;
export type FeedUpdateRequest = z.infer<typeof FeedUpdateRequestSchema>;
