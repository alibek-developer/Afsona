'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CategoryFilterProps {
  selected: string | null
  onSelect: (category: string | null) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true }) // Alfavit bo'yicha

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        toast.error("Kategoriyalarni yuklashda xatolik")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className='w-full py-6 flex justify-center items-center'>
        <Loader2 className='animate-spin text-red-600' />
      </div>
    )
  }

  return (
    <div className='w-full bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30 py-6 border-b border-slate-100 dark:border-slate-900'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* flex-wrap: Mobil qurilmalarda tugmalar qatorlarga bo'linadi (chiroyli joylashishi uchun).
            md:flex-nowrap: Planshet va desktopda majburan bitta qatorda saqlanadi.
            md:overflow-x-auto: Desktopda sig'may qolsa, o'ngga skrol qilish imkonini beradi.
            justify-center: Mobil qurilmalarda tugmalar markazda turadi.
        */}
        <div className='flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-3 md:gap-4 md:overflow-x-auto pb-2 md:pb-4 no-scrollbar mask-fade-right'>
          
          {/* "HAMMASI" Tugmasi */}
          <Button
            onClick={() => onSelect(null)}
            className={cn(
              "h-12 md:h-14 px-6 md:px-8 rounded-xl border-2 transition-all duration-200 uppercase font-black text-[10px] md:text-sm tracking-widest flex-shrink-0",
              selected === null
                ? "bg-red-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)] translate-x-[-2px] translate-y-[-2px]"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-slate-600 shadow-none hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            )}
          >
            Hammasi
          </Button>

          {/* Kategoriya tugmalari */}
          {categories.map(category => (
            <Button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                "h-12 md:h-14 px-6 md:px-8 rounded-xl border-2 transition-all duration-200 uppercase font-black text-[10px] md:text-sm tracking-widest flex-shrink-0",
                selected?.toLowerCase() === category.id.toLowerCase()
                  ? "bg-red-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)] translate-x-[-2px] translate-y-[-2px]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-slate-600 shadow-none hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Mask effektini faqat desktopda saqlaymiz */
        @media (min-width: 768px) {
          .mask-fade-right {
            mask-image: linear-gradient(to right, black 88%, transparent 100%);
          }
        }
      `}</style>
    </div>
  )
}