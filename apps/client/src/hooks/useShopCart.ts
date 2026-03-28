import type { ShopCartItemInput } from '@/lib/schemas'
import { useLocalStorage } from './useLocalStorage'

type ShopCartState = {
  items: ShopCartItemInput[]
  promoCode: string
}

const SHOP_CART_STORAGE_KEY = 'platform-shop-cart-v1'

const EMPTY_CART_STATE: ShopCartState = {
  items: [],
  promoCode: '',
}

const clampQuantity = (quantity: number) => {
  if (Number.isNaN(quantity)) return 1
  return Math.max(1, Math.min(99, Math.floor(quantity)))
}

export function useShopCart() {
  const [cart, setCart] = useLocalStorage<ShopCartState>(
    SHOP_CART_STORAGE_KEY,
    EMPTY_CART_STATE,
  )

  const addItem = (itemId: string, quantity = 1) => {
    setCart((prev) => {
      const normalizedQuantity = clampQuantity(quantity)
      const existing = prev.items.find((item) => item.itemId === itemId)

      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.itemId === itemId
              ? {
                  ...item,
                  quantity: clampQuantity(item.quantity + normalizedQuantity),
                }
              : item,
          ),
        }
      }

      return {
        ...prev,
        items: [...prev.items, { itemId, quantity: normalizedQuantity }],
      }
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const normalizedQuantity = clampQuantity(quantity)
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: normalizedQuantity } : item,
      ),
    }))
  }

  const removeItem = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.itemId !== itemId),
    }))
  }

  const clearCart = () => {
    setCart(EMPTY_CART_STATE)
  }

  const setPromoCode = (promoCode: string) => {
    setCart((prev) => ({
      ...prev,
      promoCode,
    }))
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setPromoCode,
    itemCount,
  }
}
