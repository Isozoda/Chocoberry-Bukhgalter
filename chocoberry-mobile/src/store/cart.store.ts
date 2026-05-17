import { create } from 'zustand'
import Decimal from 'decimal.js'

export interface CartItem {
  productId: string
  name: string
  price: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  total: () => Decimal
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((s) => {
      const exists = s.items.find((i) => i.productId === item.productId)
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...s.items, { ...item, quantity: 1 }] }
    }),
  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateQty: (productId, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((i) => i.productId !== productId)
          : s.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
    })),
  clear: () => set({ items: [] }),
  total: () => {
    const { items } = get()
    return items.reduce(
      (sum, item) => sum.plus(new Decimal(item.price).times(item.quantity)),
      new Decimal(0)
    )
  },
}))
