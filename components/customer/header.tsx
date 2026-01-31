'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CartSidebar } from './cart-sidebar'

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  const itemCount = useCartStore(state => isMounted ? state.getItemCount() : 0)
  const [cartPulseKey, setCartPulseKey] = useState(0)
  const prevItemCount = useRef(itemCount)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && itemCount > prevItemCount.current) {
      setCartPulseKey(k => k + 1)
    }
    prevItemCount.current = itemCount
  }, [itemCount, isMounted])

  if (!isMounted) return null

  const isDark = resolvedTheme === 'dark'

  const navLinks = [
    { href: '/', label: 'Bosh sahifa' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'Biz haqimizda' },
  ]

  return (
    <header className='sticky top-0 z-50 w-full transition-all duration-300'>
      {/* TUZATISH: Blur fonini alohida divda faqat asosiy Header balandligida saqlaymiz.
        Bu mobil menyu ochilganda blur pastga qarab cho'zilib ketishini oldini oladi.
      */}
      <div className='absolute top-0 left-0 right-0 h-16 md:h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3 group'>
            <div className='relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:border-red-500 transition-all'>
              <Image src='/logo.jpg' alt='Logo' fill className='object-cover' priority />
            </div>
            <span className='font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase italic'>
              Afsona
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className='hidden md:flex items-center gap-1'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all
                  ${pathname === link.href ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-red-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className='rounded-xl hover:text-red-600 transition-colors'
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </Button>

            {/* Savatcha Qismi */}
            <Sheet>
              <SheetTrigger asChild>
                <div className='relative'>
                  <motion.div
                    key={cartPulseKey}
                    animate={itemCount > 0 && cartPulseKey > 0 ? { 
                      y: [0, -8, 0],
                      rotate: [0, -10, 10, 0] 
                    } : {}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Button 
                      variant='ghost' 
                      size='icon' 
                      className='relative h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-red-600 hover:text-white transition-all group'
                    >
                      <ShoppingCart className='h-5 w-5' />
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0, x: 10, y: -10 }}
                        animate={{ scale: 1, x: 0, y: 0 }}
                        exit={{ scale: 0 }}
                        className='absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center 
                                   bg-red-600 text-white text-[11px] font-black rounded-[8px] 
                                   shadow-[0_4px_12px_rgba(220,38,38,0.4)] border-2 border-white dark:border-slate-950
                                   pointer-events-none'
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </SheetTrigger>
              <SheetContent className='w-full sm:max-w-md p-0'>
                <CartSidebar />
              </SheetContent>
            </Sheet>

            <Button
              variant='ghost'
              size='icon'
              className='md:hidden rounded-xl'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            /* Mobil menyu foni endi header bluriga bog'liq emas */
            className='md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800'
          >
            <div className='flex flex-col p-4 gap-2'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-4 rounded-xl text-lg font-black uppercase transition-colors ${pathname === link.href ? 'bg-red-50 text-red-600' : 'text-slate-900 dark:text-white'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}