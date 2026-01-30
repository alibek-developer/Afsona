'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import { useCartStore } from '@/lib/store'
import type { MenuItem } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

interface MenuCardProps {
  item: MenuItem
}

export function MenuCard({ item }: MenuCardProps) {
  const [added, setAdded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [flyData, setFlyData] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 })
  
  const addItem = useCartStore(state => state.addItem)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = () => {
    addItem(item)
    setAdded(true)
    
    // Savatcha ikonkasini topish (Navbardagi data-cart-icon)
    const cartEl = document.querySelector('[data-cart-icon]')
    
    if (buttonRef.current && cartEl) {
      const btnRect = buttonRef.current.getBoundingClientRect()
      const cartRect = cartEl.getBoundingClientRect()

      setFlyData({
        x: btnRect.left + btnRect.width / 2,
        y: btnRect.top + btnRect.height / 2,
        targetX: cartRect.left + cartRect.width / 2,
        targetY: cartRect.top + cartRect.height / 2
      })

      setIsFlying(true)
      // Animatsiya davomiyligi bilan bir xil vaqtda o'chirish
      setTimeout(() => setIsFlying(false), 800)
    }

    toast.success(`${item.name} savatga qo'shildi`)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!mounted) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full"
    >
      <Card className="group relative overflow-hidden bg-[#0A0F1C] border border-white/5 rounded-[2.5rem] h-full flex flex-col p-0 shadow-2xl transition-all duration-500 hover:border-red-500/20">
        
        {/* Image Section */}
        <div className="relative w-full h-[220px] shrink-0 overflow-hidden">
          <Image
            src={item.image_url || '/placeholder.svg'}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 right-5 z-20">
            <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border border-white/10 uppercase">
              Hit
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-7 flex flex-col flex-1">
          <div className="flex-1 space-y-2">
            <h3 className="font-black text-2xl text-white uppercase tracking-tighter line-clamp-1">
              {item.name}
            </h3>
            <p className="text-slate-400/80 text-[13px] leading-snug line-clamp-2 font-medium">
              {item.description}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narxi</span>
              <Price value={item.price} className="text-[26px] font-black text-white tracking-tighter" />
            </div>

            <Button
              ref={buttonRef}
              onClick={handleAddToCart}
              className={`h-14 w-14 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                added 
                ? 'bg-green-500 text-white scale-95' 
                : 'bg-red-600 text-white hover:bg-red-500 hover:scale-105 active:scale-90'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-7 w-7 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bag"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                  >
                    <ShoppingBag className="h-7 w-7 stroke-[2]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </Card>

      {/* Fly-to-Cart Animatsiyasi (Portal) */}
      {isFlying && createPortal(
        <motion.div
          initial={{ 
            x: flyData.x - 12, 
            y: flyData.y - 12, 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            x: flyData.targetX - 12, 
            y: flyData.targetY - 12, 
            scale: 0.2, 
            opacity: 0.5 
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.45, 0, 0.55, 1], // S-curve trayektoriya uchun
          }}
          className="fixed top-0 left-0 z-[9999] pointer-events-none"
        >
          {/* Uchayotgan qizil doira yoki mahsulot rasmi kichraytirilgan varianti */}
          <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg shadow-red-500/50 flex items-center justify-center">
             <ShoppingBag className="h-4 w-4 text-white" />
          </div>
        </motion.div>,
        document.body
      )}
    </motion.div>
  )
}