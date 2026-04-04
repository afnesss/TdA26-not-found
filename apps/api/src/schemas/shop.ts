import { z } from "zod";
import {
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
} from "./i18n";

export const ShopCartItemInputSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const ShopCatalogItemSchema = z.object({
  uuid: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().nullable().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  imageUrl: z.string().nullable().optional(),
  unitPriceCents: z.number().int().nonnegative(),
  purchaseMode: z.enum(["money", "xp"]).default("money"),
  xpCost: z.number().int().positive().nullable().optional(),
  voucherDiscountPercent: z.number().int().min(1).max(100).nullable().optional(),
}).merge(LocalizedEntityMetaSchema);

export const ShopPromoValidateRequestSchema = z.object({
  code: z.string().trim().min(1).max(64),
  items: z.array(ShopCartItemInputSchema).min(1).max(50),
});

export const ShopPromoValidateResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  message: z.string().optional(),
});

export const ShopCreateOrderRequestSchema = z.object({
  contactEmail: z.string().trim().email().max(320),
  items: z.array(ShopCartItemInputSchema).min(1).max(50),
  promoCode: z.string().trim().max(64).optional().nullable(),
});

export const ShopOrderItemSnapshotSchema = z.object({
  merchItemId: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().nonnegative(),
  lineTotalCents: z.number().int().nonnegative(),
});

export const ShopOrderSchema = z.object({
  orderId: z.string().uuid(),
  contactEmail: z.string().email(),
  items: z.array(ShopOrderItemSnapshotSchema),
  appliedPromoCode: z.string().nullable(),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  createdAt: z.date().or(z.string().datetime()),
});

export const ShopVoucherPurchaseRequestSchema = z.object({
  merchItemId: z.string().uuid(),
});

export const ShopVoucherPurchaseResponseSchema = z.object({
  code: z.string(),
  discountPercent: z.number().int().min(1).max(100),
  xpCost: z.number().int().positive(),
  remainingXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
});

export type ShopCartItemInput = z.infer<typeof ShopCartItemInputSchema>;
export type ShopCatalogItem = z.infer<typeof ShopCatalogItemSchema>;
export type ShopPromoValidateRequest = z.infer<
  typeof ShopPromoValidateRequestSchema
>;
export type ShopPromoValidateResponse = z.infer<
  typeof ShopPromoValidateResponseSchema
>;
export type ShopCreateOrderRequest = z.infer<typeof ShopCreateOrderRequestSchema>;
export type ShopOrder = z.infer<typeof ShopOrderSchema>;
export type ShopVoucherPurchaseRequest = z.infer<
  typeof ShopVoucherPurchaseRequestSchema
>;
export type ShopVoucherPurchaseResponse = z.infer<
  typeof ShopVoucherPurchaseResponseSchema
>;
