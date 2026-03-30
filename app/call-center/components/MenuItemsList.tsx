'use client'

import { Price } from '@/components/ui/price'
import type { MenuItem } from '@/lib/types'
import { Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface MenuItemsListProps {
  items: MenuItem[]
  categories: Category[]
  searchTerm: string
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemsList({
  items,
  categories,
  searchTerm,
  onAddToCart,
}: MenuItemsListProps) {
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='space-y-8'>
      {categories.map(category => {
        const categoryItems = filteredItems.filter(
          i => i.category === category.id
        )
        if (categoryItems.length === 0) return null

        return (
          <section key={category.id}>
            <div className='flex items-center gap-3 mb-4'>
              <h2 className='font-black text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>
                {category.name}
              </h2>
              <div className='h-px bg-slate-200 dark:bg-slate-700 flex-1' />
              <span className='text-xs text-slate-400 font-bold'>
                {categoryItems.length}
              </span>
            </div>
            <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2'>
              {categoryItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onAddToCart(item)}
                  className='p-3 bg-white dark:bg-[#111827] rounded-2xl border border-transparent hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5 transition-all text-left flex items-center justify-between gap-2 group active:scale-[0.97]'
                >
                  <div className='min-w-0'>
                    <p className='font-bold text-xs text-slate-800 dark:text-slate-200 truncate'>
                      {item.name}
                    </p>
                    <Price
                      value={item.price}
                      className='text-[11px] font-black text-slate-400'
                    />
                  </div>
                  <div className='w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all flex-shrink-0'>
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )
      })}

      {filteredItems.length === 0 && (
        <div className='text-center py-16 text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl'>
          Hech qanday taom topilmadi
        </div>
      )}
    </div>
  )
}
