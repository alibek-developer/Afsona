'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react' // Sun va Moon qo'shildi
import { useTheme } from 'next-themes' // useTheme qo'shildi
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CartSidebar } from './cart-sidebar'

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [isMounted, setIsMounted] = useState(false)

	// GLOBAL THEME SISTEMASI
	const { setTheme, resolvedTheme } = useTheme()

	const itemCount = useCartStore(state =>
		isMounted ? state.getItemCount() : 0,
	)
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

	return (
		<header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 border-b-2 border-red-500 dark:border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)] dark:shadow-[0_0_30px_rgba(239,68,68,0.35)] transition-all duration-300 backdrop-blur-md'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					{/* Logo Section */}
					<Link href='/' className='flex items-center gap-3 group'>
						<div className='relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-red-500 dark:border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-300'>
							<Image
								src='/logo.jpg'
								alt='Afsona Restaurant Logo'
								fill
								className='object-cover'
								priority
								sizes='(max-width: 768px) 48px, 56px'
							/>
						</div>
						<span className='font-black text-2xl md:text-3xl text-black dark:text-white tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 uppercase italic'>
							Afsona
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex items-center gap-8'>
						{[
							{ href: '/', label: 'Bosh sahifa' },
							{ href: '/menu', label: 'Menu' },
							{ href: '/about', label: 'Biz haqimizda' },
						].map(link => (
							<Link
								key={link.href}
								href={link.href}
								className='relative text-lg font-black text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-wide after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-red-600 dark:after:bg-red-500 after:transition-all hover:after:w-full'
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Actions Section */}
					<div className='flex items-center gap-3 md:gap-5'>
						{/* TOGGLE THEME - TO'G'RI VARIANT */}
						<button
							onClick={() => setTheme(isDark ? 'light' : 'dark')}
							className='p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-red-500 dark:hover:border-red-500 transition-all duration-300 group'
							aria-label='Toggle theme'
						>
							{isDark ? (
								<Sun className='w-5 h-5 text-yellow-500 animate-pulse' />
							) : (
								<Moon className='w-5 h-5 text-slate-700 group-hover:text-red-600' />
							)}
						</button>

						{/* Cart Button */}
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative group hover:bg-red-50 dark:hover:bg-slate-900 transition-all duration-300 rounded-xl border-2 border-transparent hover:border-red-200 dark:hover:border-red-900'
								>
									<ShoppingCart className='h-6 w-6 text-gray-700 dark:text-slate-300 group-hover:text-red-600' />
									<AnimatePresence>
										{itemCount > 0 && (
											<motion.span
												key={cartPulseKey}
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0 }}
												className='absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-950'
											>
												{itemCount}
											</motion.span>
										)}
									</AnimatePresence>
								</Button>
							</SheetTrigger>
							<SheetContent
								side='right'
								className='w-full sm:max-w-md bg-white dark:bg-slate-950 border-l-2 border-red-600 p-0'
							>
								<CartSidebar />
							</SheetContent>
						</Sheet>

						{/* Mobile Menu Button */}
						<Button
							variant='ghost'
							size='icon'
							className='md:hidden border-2 border-slate-100 dark:border-slate-800 rounded-xl'
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className='h-6 w-6' />
							) : (
								<Menu className='h-6 w-6' />
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile Menu Drawer */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.nav
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className='md:hidden border-t-2 border-red-500 bg-white dark:bg-slate-950 px-6 py-8 flex flex-col gap-6 shadow-2xl'
					>
						{['Bosh sahifa', 'Menyu', 'Biz haqimizda'].map((label, idx) => (
							<Link
								key={idx}
								href={
									label === 'Bosh sahifa'
										? '/'
										: `/${label.toLowerCase().replace(' ', '-')}`
								}
								className='text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white hover:text-red-600 transition-colors'
								onClick={() => setMobileMenuOpen(false)}
							>
								{label}
							</Link>
						))}
					</motion.nav>
				)}
			</AnimatePresence>
		</header>
	)
}
