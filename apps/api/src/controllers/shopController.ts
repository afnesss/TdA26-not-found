import { and, asc, eq, inArray } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db";
import { merchItems, promoCodes, shopOrders, users } from "../db/schema";
import type { ShopCartItemInput } from "../schemas";
import { AuthRequest } from "../types/auth";
import { logger } from "../utils/logger";

type ResolvedCartLine = {
  merchItemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type PromoCodeRecord = {
  uuid: string;
  code: string;
  discountType: string;
  discountValue: number;
};

const XP_PER_LEVEL = 100;
const VOUCHER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

class ShopValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const normalizePromoCode = (code: string) => code.trim().toUpperCase();
const generateRandomCodeChunk = (length = 8) =>
  Array.from({ length }, () => {
    const index = Math.floor(Math.random() * VOUCHER_CODE_ALPHABET.length);
    return VOUCHER_CODE_ALPHABET[index];
  }).join("");

const generateVoucherPromoCode = (discountPercent: number) =>
  normalizePromoCode(`XP${discountPercent}-${generateRandomCodeChunk(8)}`);

const calculateSubtotal = (items: ResolvedCartLine[]) =>
  items.reduce((sum, item) => sum + item.lineTotalCents, 0);

const calculateDiscountCents = (
  promo: PromoCodeRecord,
  subtotalCents: number,
) => {
  if (subtotalCents <= 0) {
    return 0;
  }

  if (promo.discountType === "percent") {
    const percentDiscount = Math.floor(
      (subtotalCents * promo.discountValue) / 100,
    );
    return Math.min(subtotalCents, Math.max(0, percentDiscount));
  }

  return Math.min(subtotalCents, Math.max(0, promo.discountValue));
};

const resolveCartItems = async (
  inputItems: ShopCartItemInput[],
  queryable: typeof db,
): Promise<ResolvedCartLine[]> => {
  const quantityByItemId = new Map<string, number>();

  for (const item of inputItems) {
    quantityByItemId.set(
      item.itemId,
      (quantityByItemId.get(item.itemId) ?? 0) + item.quantity,
    );
  }

  const itemIds = Array.from(quantityByItemId.keys());
  if (itemIds.length === 0) {
    throw new ShopValidationError("Košík je prázdný.");
  }

  const catalogItems = await queryable
    .select({
      uuid: merchItems.uuid,
      name: merchItems.name,
      unitPriceCents: merchItems.unitPriceCents,
      active: merchItems.active,
      purchaseMode: merchItems.purchaseMode,
    })
    .from(merchItems)
    .where(
      and(
        inArray(merchItems.uuid, itemIds),
        eq(merchItems.active, true),
        eq(merchItems.purchaseMode, "money"),
      ),
    );

  if (catalogItems.length !== itemIds.length) {
    throw new ShopValidationError(
      "Některé položky v košíku už nejsou dostupné.",
    );
  }

  const catalogById = new Map(catalogItems.map((item) => [item.uuid, item]));

  return itemIds.map((itemId) => {
    const catalogItem = catalogById.get(itemId);
    const quantity = quantityByItemId.get(itemId) ?? 0;

    if (!catalogItem || quantity <= 0) {
      throw new ShopValidationError("Neplatná položka v košíku.");
    }

    const lineTotalCents = catalogItem.unitPriceCents * quantity;

    return {
      merchItemId: catalogItem.uuid,
      name: catalogItem.name,
      quantity,
      unitPriceCents: catalogItem.unitPriceCents,
      lineTotalCents,
    };
  });
};

const createUniqueVoucherPromoCode = async (
  queryable: typeof db,
  discountPercent: number,
  xpRedemptionRef: string,
) => {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateCode = generateVoucherPromoCode(discountPercent);

    try {
      await queryable.insert(promoCodes).values({
        code: candidateCode,
        discountType: "percent",
        discountValue: discountPercent,
        isActive: true,
        isUsed: false,
        xpRedemptionRef,
      });
      return candidateCode;
    } catch (error: any) {
      if (error?.code === "23505") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to generate unique promo code");
};

const findPromoCode = async (code: string, queryable: typeof db) => {
  const [promo] = await queryable
    .select({
      uuid: promoCodes.uuid,
      code: promoCodes.code,
      discountType: promoCodes.discountType,
      discountValue: promoCodes.discountValue,
      isUsed: promoCodes.isUsed,
      isActive: promoCodes.isActive,
    })
    .from(promoCodes)
    .where(eq(promoCodes.code, code))
    .limit(1);

  if (!promo || !promo.isActive || promo.isUsed) {
    return null;
  }

  return {
    uuid: promo.uuid,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
  } satisfies PromoCodeRecord;
};

export async function getShopCatalog(_req: Request, res: Response) {
  const items = await db
    .select({
      uuid: merchItems.uuid,
      slug: merchItems.slug,
      name: merchItems.name,
      description: merchItems.description,
      imageUrl: merchItems.imageUrl,
      unitPriceCents: merchItems.unitPriceCents,
      purchaseMode: merchItems.purchaseMode,
      xpCost: merchItems.xpCost,
      voucherDiscountPercent: merchItems.voucherDiscountPercent,
    })
    .from(merchItems)
    .where(eq(merchItems.active, true))
    .orderBy(asc(merchItems.createdAt), asc(merchItems.name));

  res.json(items);
}

export async function purchaseShopVoucherWithXp(
  req: AuthRequest,
  res: Response,
) {
  if (
    !req.user ||
    req.user.actorType !== "organization_user" ||
    req.user.role !== "student"
  ) {
    return res.status(401).json({ message: "Nejste oprávnění" });
  }

  const studentId = req.user.id;

  try {
    const { merchItemId } = req.body as { merchItemId: string };

    const result = await db.transaction(async (tx) => {
      const queryable = tx as unknown as typeof db;

      const [currentUser] = await tx
        .select({
          uuid: users.uuid,
          xp: users.xp,
        })
        .from(users)
        .where(eq(users.uuid, studentId))
        .limit(1);

      if (!currentUser) {
        throw new ShopValidationError("Relace vypršela.", 401);
      }

      const [voucherItem] = await tx
        .select({
          uuid: merchItems.uuid,
          purchaseMode: merchItems.purchaseMode,
          active: merchItems.active,
          xpCost: merchItems.xpCost,
          voucherDiscountPercent: merchItems.voucherDiscountPercent,
        })
        .from(merchItems)
        .where(
          and(
            eq(merchItems.uuid, merchItemId),
            eq(merchItems.active, true),
            eq(merchItems.purchaseMode, "xp"),
          ),
        )
        .limit(1);

      if (!voucherItem) {
        throw new ShopValidationError("Voucher nebyl nalezen.", 404);
      }

      const xpCost = voucherItem.xpCost ?? 0;
      const discountPercent = voucherItem.voucherDiscountPercent ?? 0;

      if (xpCost <= 0 || discountPercent <= 0) {
        throw new ShopValidationError("Voucher není správně nastaven.", 500);
      }

      if (currentUser.xp < xpCost) {
        throw new ShopValidationError("Nemáte dostatek XP pro nákup voucheru.");
      }

      const remainingXp = currentUser.xp - xpCost;
      const nextLevel = Math.floor(remainingXp / XP_PER_LEVEL) + 1;

      const [updatedUser] = await tx
        .update(users)
        .set({
          xp: remainingXp,
          level: nextLevel,
        })
        .where(eq(users.uuid, currentUser.uuid))
        .returning({
          xp: users.xp,
          level: users.level,
        });

      if (!updatedUser) {
        throw new Error("Failed to update XP balance");
      }

      const xpRedemptionRef = `voucher:${voucherItem.uuid}:${currentUser.uuid}:${Date.now()}`;
      const code = await createUniqueVoucherPromoCode(
        queryable,
        discountPercent,
        xpRedemptionRef,
      );

      return {
        code,
        discountPercent,
        xpCost,
        remainingXp: updatedUser.xp,
        level: updatedUser.level,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ShopValidationError) {
      return res.status(error.status).json({ message: error.message });
    }

    logger.error({ err: error }, "Failed to purchase XP voucher");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function validateShopPromoCode(req: Request, res: Response) {
  try {
    const { code, items } = req.body as {
      code: string;
      items: ShopCartItemInput[];
    };

    const resolvedItems = await resolveCartItems(items, db);
    const subtotalCents = calculateSubtotal(resolvedItems);
    const normalizedCode = normalizePromoCode(code);
    const promo = await findPromoCode(normalizedCode, db);

    if (!promo) {
      return res.json({
        valid: false,
        code: normalizedCode,
        subtotalCents,
        discountCents: 0,
        totalCents: subtotalCents,
        message: "Promo kód je neplatný nebo již použitý.",
      });
    }

    const discountCents = calculateDiscountCents(promo, subtotalCents);
    const totalCents = Math.max(0, subtotalCents - discountCents);

    return res.json({
      valid: true,
      code: promo.code,
      subtotalCents,
      discountCents,
      totalCents,
    });
  } catch (error) {
    if (error instanceof ShopValidationError) {
      return res.status(error.status).json({ message: error.message });
    }

    logger.error({ err: error }, "Failed to validate promo code");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}

export async function createShopOrder(req: Request, res: Response) {
  try {
    const { contactEmail, items, promoCode } = req.body as {
      contactEmail: string;
      items: ShopCartItemInput[];
      promoCode?: string | null;
    };

    const normalizedPromoCode = promoCode
      ? normalizePromoCode(promoCode)
      : undefined;

    const createdOrder = await db.transaction(async (tx) => {
      const queryable = tx as unknown as typeof db;
      const resolvedItems = await resolveCartItems(items, queryable);
      const subtotalCents = calculateSubtotal(resolvedItems);

      let appliedPromoCode: string | null = null;
      let discountCents = 0;
      let consumedPromoUuid: string | null = null;

      if (normalizedPromoCode) {
        const [consumedPromo] = await tx
          .update(promoCodes)
          .set({
            isUsed: true,
            usedAt: new Date(),
          })
          .where(
            and(
              eq(promoCodes.code, normalizedPromoCode),
              eq(promoCodes.isActive, true),
              eq(promoCodes.isUsed, false),
            ),
          )
          .returning({
            uuid: promoCodes.uuid,
            code: promoCodes.code,
            discountType: promoCodes.discountType,
            discountValue: promoCodes.discountValue,
          });

        if (!consumedPromo) {
          throw new ShopValidationError(
            "Promo kód je neplatný nebo již použitý.",
          );
        }

        discountCents = calculateDiscountCents(consumedPromo, subtotalCents);
        appliedPromoCode = consumedPromo.code;
        consumedPromoUuid = consumedPromo.uuid;
      }

      const totalCents = Math.max(0, subtotalCents - discountCents);

      const [insertedOrder] = await tx
        .insert(shopOrders)
        .values({
          contactEmail: contactEmail.trim().toLowerCase(),
          items: resolvedItems,
          promoCode: appliedPromoCode,
          subtotalCents,
          discountCents,
          totalCents,
        })
        .returning({
          uuid: shopOrders.uuid,
          contactEmail: shopOrders.contactEmail,
          items: shopOrders.items,
          promoCode: shopOrders.promoCode,
          subtotalCents: shopOrders.subtotalCents,
          discountCents: shopOrders.discountCents,
          totalCents: shopOrders.totalCents,
          createdAt: shopOrders.createdAt,
        });

      if (!insertedOrder) {
        throw new Error("Order creation failed");
      }

      if (consumedPromoUuid) {
        await tx
          .update(promoCodes)
          .set({ usedInOrderId: insertedOrder.uuid })
          .where(eq(promoCodes.uuid, consumedPromoUuid));
      }

      return insertedOrder;
    });

    return res.status(201).json({
      orderId: createdOrder.uuid,
      contactEmail: createdOrder.contactEmail,
      items: createdOrder.items,
      appliedPromoCode: createdOrder.promoCode,
      subtotalCents: createdOrder.subtotalCents,
      discountCents: createdOrder.discountCents,
      totalCents: createdOrder.totalCents,
      createdAt: createdOrder.createdAt,
    });
  } catch (error) {
    if (error instanceof ShopValidationError) {
      return res.status(error.status).json({ message: error.message });
    }

    logger.error({ err: error }, "Failed to create shop order");
    return res.status(500).json({ message: "Došlo k chybě serveru" });
  }
}
