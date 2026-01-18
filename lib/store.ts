"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, MenuItem, Order } from "./types"
import { mockMenuItems, mockOrders } from "./mock-data"

interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)
        if (existingItem) {
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) })
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

interface MenuStore {
  items: MenuItem[]
  setItems: (items: MenuItem[]) => void
  addItem: (item: MenuItem) => void
  updateItem: (id: string, item: Partial<MenuItem>) => void
  deleteItem: (id: string) => void
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: mockMenuItems,
  setItems: (items) => set({ items }),
  addItem: (item) => set({ items: [...get().items, item] }),
  updateItem: (id, updates) => {
    set({
      items: get().items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })
  },
  deleteItem: (id) => {
    set({ items: get().items.filter((item) => item.id !== id) })
  },
}))

interface OrderStore {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: Order["status"]) => void
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: mockOrders,
  addOrder: (order) => set({ orders: [order, ...get().orders] }),
  updateOrderStatus: (id, status) => {
    set({
      orders: get().orders.map((order) => (order.id === id ? { ...order, status } : order)),
    })
  },
}))
