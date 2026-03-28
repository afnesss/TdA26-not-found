import type { ShopCartItemInput, ShopCatalogItem } from '@/lib/schemas'

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
