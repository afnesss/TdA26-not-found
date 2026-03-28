import { Router } from "express";
import {
  createShopOrder,
  getShopCatalog,
  purchaseShopVoucherWithXp,
  validateShopPromoCode,
} from "../controllers/shopController";
import { authMiddleware, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  ShopCreateOrderRequestSchema,
  ShopPromoValidateRequestSchema,
  ShopVoucherPurchaseRequestSchema,
} from "../schemas";

const router = Router();

router.get("/items", getShopCatalog);
router.post(
  "/promo/validate",
  validate(ShopPromoValidateRequestSchema),
  validateShopPromoCode,
);
router.post(
  "/vouchers/purchase",
  authMiddleware,
  requireRole("student"),
  validate(ShopVoucherPurchaseRequestSchema),
  purchaseShopVoucherWithXp,
);
router.post("/orders", validate(ShopCreateOrderRequestSchema), createShopOrder);

export default router;
