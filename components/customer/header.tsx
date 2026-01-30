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
      {/* 1. Glassmorphism Container */}
      <div className='absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          
          {/* Logo Section - Ixchamroq */}
          <Link href='/' className='flex items-center gap-3 group'>
            <div className='relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group-hover:border-red-500 transition-all'>
              <Image
                src='/logo.jpg'
                alt='Logo'
                fill
                className='object-cover'
                priority
              />
            </div>
            <span className='font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase italic'>
              Afsona
            </span>
          </Link>

          {/* Desktop Navigation - Minimalist */}
          <nav className='hidden md:flex items-center gap-1'>
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-200
                    ${isActive 
                      ? 'text-red-600 bg-red-50 dark:bg-red-500/10' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions Section */}
          <div className='flex items-center gap-2'>
            {/* Theme Toggle */}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className='rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600'
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </Button>

            {/* Shopping Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='relative rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 group'>
                  <ShoppingCart className='h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-red-600' />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key={cartPulseKey}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center'
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </SheetTrigger>
              <SheetContent className='w-full sm:max-w-md p-0 border-l border-slate-200 dark:border-slate-800'>
                <CartSidebar />
              </SheetContent>
            </Sheet>

            {/* Mobile Menu Toggle */}
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

      {/* Mobile Menu - Minimalist Slide Down */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden'
          >
            <div className='flex flex-col p-4 gap-2'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-4 rounded-xl text-lg font-black uppercase tracking-tight
                    ${pathname === link.href ? 'bg-red-50 text-red-600' : 'text-slate-900 dark:text-white'}
                  `}
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