import type { ShopCartItemInput, ShopCatalogItem } from '@/lib/schemas'

const SHOP_ORG_STORAGE_KEY = 'shop-org-slug-v1'

export const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export type ShopCartLine = {
  itemId: string
  quantity: number
  item: ShopCatalogItem | null
  lineTotalCents: number
}

export const resolveCartLines = (
  cartItems: ShopCartItemInput[],
  catalog: ShopCatalogItem[],
): ShopCartLine[] => {
  const itemById = new Map(catalog.map((item) => [item.uuid, item]))

  return cartItems.map((cartItem) => {
    const catalogItem = itemById.get(cartItem.itemId) ?? null
    const lineTotalCents = catalogItem
      ? catalogItem.unitPriceCents * cartItem.quantity
      : 0

    return {
      itemId: cartItem.itemId,
      quantity: cartItem.quantity,
      item: catalogItem,
      lineTotalCents,
    }
  })
}

export const resolveShopOrgSlug = (explicitOrgSlug?: string | null) => {
  const normalizedExplicit = explicitOrgSlug?.trim() || undefined
  if (normalizedExplicit) return normalizedExplicit

  if (typeof window === 'undefined') return undefined

  const stored = window.localStorage.getItem(SHOP_ORG_STORAGE_KEY)?.trim()
  return stored || undefined
}

export const persistShopOrgSlug = (orgSlug?: string | null) => {
  if (typeof window === 'undefined') return

  const normalized = orgSlug?.trim()
  if (normalized) {
    window.localStorage.setItem(SHOP_ORG_STORAGE_KEY, normalized)
  }
}

export const buildShopPath = (path: string, orgSlug?: string | null) => {
  const normalized = orgSlug?.trim()
  if (!normalized) return path

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}org=${encodeURIComponent(normalized)}`
}
