import type {
  AdminShopOrder,
  ShopCatalogItem,
  ShopCreateOrderRequest,
  ShopOrder,
  ShopPromoValidateRequest,
  ShopPromoValidateResponse,
  ShopVoucherPurchaseRequest,
  ShopVoucherPurchaseResponse,
} from '@/lib/schemas'
import apiFetch from '../client'

export const getShopCatalog = async (): Promise<ShopCatalogItem[]> => {
  return await apiFetch<ShopCatalogItem[]>('/shop/items')
}

export const validateShopPromoCode = async (
  payload: ShopPromoValidateRequest,
): Promise<ShopPromoValidateResponse> => {
  return await apiFetch<ShopPromoValidateResponse>('/shop/promo/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const createShopOrder = async (
  payload: ShopCreateOrderRequest,
): Promise<ShopOrder> => {
  return await apiFetch<ShopOrder>('/shop/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const getAdminShopOrders = async (): Promise<AdminShopOrder[]> => {
  return await apiFetch<AdminShopOrder[]>('/admin/orders')
}

export const purchaseShopVoucher = async (
  payload: ShopVoucherPurchaseRequest,
): Promise<ShopVoucherPurchaseResponse> => {
  return await apiFetch<ShopVoucherPurchaseResponse>('/shop/vouchers/purchase', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
