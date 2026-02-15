'use client'

import { Price } from '@/components/ui/price'
import { CATEGORIES } from '@/lib/types'
import type { MenuItem } from '@/lib/types'
import { Plus } from 'lucide-react'

interface MenuItemsListProps {
  items: MenuItem[]
  searchTerm: string
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemsList({ items, searchTerm, onAddToCart }: MenuItemsListProps) {
  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-10">
      {CATEGORIES.map((category) => {
        const categoryItems = filteredItems.filter(
          (i) => i.category === category.id
        )
        if (categoryItems.length === 0) return null

        return (
          <section key={category.id}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl">{category.icon}</span>
              <h2 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">
                {category.name}
              </h2>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAddToCart(item)}
                  className="p-5 bg-white dark:bg-[#111827] rounded-3xl border border-transparent hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5 transition-all text-left flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </p>
                    <Price
                      value={item.price}
                      className="text-sm font-black text-slate-400"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Plus size={20} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )
      })}

      {filteredItems.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl">
          Hech qanday taom topilmadi
        </div>
      )}
    </div>
  )
}
