import { z } from 'zod'
import { LocalizedEntityMetaSchema, LocalizedFieldSchema } from './i18n'

export const ShopCartItemInputSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})

export const ShopCatalogItemSchema = z.object({
  uuid: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().nullable().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  imageUrl: z.string().nullable().optional(),
  unitPriceCents: z.number().int().nonnegative(),
  purchaseMode: z.enum(['money', 'xp']).default('money'),
  xpCost: z.number().int().positive().nullable().optional(),
  voucherDiscountPercent: z.number().int().min(1).max(100).nullable().optional(),
}).merge(LocalizedEntityMetaSchema)

export const ShopPromoValidateRequestSchema = z.object({
  code: z.string().trim().min(1).max(64),
  items: z.array(ShopCartItemInputSchema).min(1),
})

export const ShopPromoValidateResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  message: z.string().optional(),
})

export const ShopOrderItemSnapshotSchema = z.object({
  merchItemId: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().nonnegative(),
  lineTotalCents: z.number().int().nonnegative(),
})

export const ShopCreateOrderRequestSchema = z.object({
  contactEmail: z.string().trim().email().max(320),
  customerType: z.enum(['guest', 'lecturer', 'student']).default('guest'),
  customerName: z.string().trim().min(1).max(256).optional().nullable(),
  organizationName: z.string().trim().min(1).max(256).optional().nullable(),
  interfaceLanguage: z.string().trim().min(2).max(8).optional().nullable(),
  items: z.array(ShopCartItemInputSchema).min(1),
  promoCode: z.string().trim().max(64).optional().nullable(),
})

export const ShopOrderSchema = z.object({
  orderId: z.string().uuid(),
  contactEmail: z.string().email(),
  customerType: z.enum(['guest', 'lecturer', 'student']),
  customerName: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  interfaceLanguage: z.string().nullable().optional(),
  items: z.array(ShopOrderItemSnapshotSchema),
  appliedPromoCode: z.string().nullable(),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime().or(z.date()),
})

export const AdminShopOrderSchema = z.object({
  orderId: z.string().uuid(),
  contactEmail: z.string().email(),
  customerType: z.enum(['guest', 'lecturer', 'student']),
  customerName: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  interfaceLanguage: z.string().nullable().optional(),
  items: z.array(ShopOrderItemSnapshotSchema),
  appliedPromoCode: z.string().nullable(),
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime().or(z.date()),
})

export const ShopVoucherPurchaseRequestSchema = z.object({
  merchItemId: z.string().uuid(),
})

export const ShopVoucherPurchaseResponseSchema = z.object({
  code: z.string(),
  discountPercent: z.number().int().min(1).max(100),
  xpCost: z.number().int().positive(),
  remainingXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  alreadyActive: z.boolean().optional(),
})

export type ShopCartItemInput = z.infer<typeof ShopCartItemInputSchema>
export type ShopCatalogItem = z.infer<typeof ShopCatalogItemSchema>
export type ShopPromoValidateRequest = z.infer<
  typeof ShopPromoValidateRequestSchema
>
export type ShopPromoValidateResponse = z.infer<
  typeof ShopPromoValidateResponseSchema
>
export type ShopCreateOrderRequest = z.infer<typeof ShopCreateOrderRequestSchema>
export type ShopOrder = z.infer<typeof ShopOrderSchema>
export type AdminShopOrder = z.infer<typeof AdminShopOrderSchema>
export type ShopVoucherPurchaseRequest = z.infer<
  typeof ShopVoucherPurchaseRequestSchema
>
export type ShopVoucherPurchaseResponse = z.infer<
  typeof ShopVoucherPurchaseResponseSchema
>
