'use client'

import { MenuCard } from '@/components/customer/menu-card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function FeaturedDishes() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedItems()
  }, [])

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available_on_website', true)
        .order('created_at', { ascending: false })
        .limit(4) // Faqat 4 ta taomni olish

      if (error) {
        console.error('Xatolik:', error.message)
      } else {
        setItems(data || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='py-16 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500'>
      {/* Background Decor */}
      <div className='absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 dark:from-slate-900/20 to-transparent' />
      
      <div className='relative z-10 max-w-[1300px] mx-auto px-4 md:px-8'>
        {/* Sarlavha */}
        <div className='flex flex-col items-center text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='mb-4'
          >
             <span className='bg-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'>
               Tavsiya qilamiz
             </span>
          </motion.div>

          <h2 className='text-5xl md:text-7xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-6'>
            Mashhur <span className='text-red-600'>Taomlar</span>
          </h2>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-10'>
            <Loader2 className='w-10 h-10 text-red-500 animate-spin mb-4' />
          </div>
        ) : (
          <div className='space-y-16'>
            {/* Grid - Faqat 4 ta card */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 w-full'>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </div>

            {/* Pastdagi Tugma */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='flex justify-center'
            >
              <Link href='/menu'>
                <Button 
                  variant="outline" 
                  className="group h-14 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-transparent hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-sm flex items-center gap-3"
                >
                  Menuni to'liq ko'rish
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}