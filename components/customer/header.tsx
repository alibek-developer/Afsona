'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CartSidebar } from './cart-sidebar'

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const [darkMode, setDarkMode] = useState(false)
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

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [darkMode])

	return (
		<header className='sticky top-0 z-50 bg-white dark:bg-slate-950 border-b-2 border-red-500 dark:border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.15)] dark:shadow-[0_0_30px_rgba(239,68,68,0.25)] transition-all duration-300 backdrop-blur-md dark:backdrop-blur-xl'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					{/* Logo - Neon Style */}
					<Link href='/' className='flex items-center gap-3 group'>
						<div className='w-12 h-12 rounded-xl bg-black dark:bg-slate-900 flex items-center justify-center text-red-500 dark:text-red-400 text-2xl font-black shadow-[0_0_15px_rgba(255,0,0,0.4)] dark:shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_25px_rgba(255,0,0,0.6)] dark:group-hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all duration-300 border-2 border-red-500 dark:border-red-600'>
							O
						</div>
						<span className='font-black text-2xl md:text-3xl text-black dark:text-white tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 uppercase'>
							O'zbek Oshxonasi
						</span>
					</Link>

					{/* Desktop Navigation - Neon Links */}
					<nav className='hidden md:flex items-center gap-8'>
						{[
							{ href: '/', label: 'Bosh sahifa' },
							{ href: '/menu', label: 'Menyu' },
							{ href: '/about', label: 'Biz haqimizda' },
						].map(link => (
							<Link
								key={link.href}
								href={link.href}
								className='relative text-lg font-black text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-wide after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-red-600 dark:after:bg-red-500 after:shadow-[0_0_8px_rgba(255,0,0,0.6)] dark:after:shadow-[0_0_12px_rgba(239,68,68,0.8)] after:transition-all hover:after:w-full'
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Actions */}
					<div className='flex items-center gap-4'>
						{/* Theme Toggle */}
						<button
							onClick={() => setDarkMode(!darkMode)}
							className='p-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-900 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300'
						>
							{darkMode ? (
								<svg
									className='w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm8-4a1 1 0 11-2 0 1 1 0 012 0zm0 0a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm14-4a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm4-4a1 1 0 110 2 1 1 0 010-2zm8 8a1 1 0 110 2 1 1 0 010-2z' />
								</svg>
							) : (
								<svg
									className='w-5 h-5 text-slate-700'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
								</svg>
							)}
						</button>

						{/* Cart - Neon Icon */}
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative group hover:bg-red-50 dark:hover:bg-slate-900 transition-all duration-300 rounded-xl'
									data-cart-icon
								>
									<ShoppingCart className='h-6 w-6 text-gray-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] dark:group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' />
									<AnimatePresence>
										{isMounted && itemCount > 0 && (
											<motion.span
												key={cartPulseKey}
												initial={{ scale: 0, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												exit={{ scale: 0, opacity: 0 }}
												transition={{ duration: 0.4, type: 'spring' }}
												className='absolute -top-1 -right-1 bg-red-600 dark:bg-red-600 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-[0_0_12px_rgba(255,0,0,0.7)] dark:shadow-[0_0_15px_rgba(239,68,68,0.8)] ring-2 ring-white dark:ring-slate-950 transition-all'
											>
												{itemCount}
											</motion.span>
										)}
									</AnimatePresence>
									<span className='sr-only'>Savatcha</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side='right'
								className='w-full sm:max-w-lg bg-slate-50 dark:bg-slate-900 border-l-2 border-red-500 dark:border-red-600'
							>
								<CartSidebar />
							</SheetContent>
						</Sheet>

						{/* Mobile Menu Toggle - Neon */}
						<Button
							variant='ghost'
							size='icon'
							className='md:hidden hover:bg-red-50 dark:hover:bg-slate-900 transition-all duration-300 rounded-xl'
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className='h-6 w-6 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400' />
							) : (
								<Menu className='h-6 w-6 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400' />
							)}
							<span className='sr-only'>Menyu</span>
						</Button>
					</div>
				</div>

				{/* Mobile Navigation - Neon Style */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.nav
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							className='md:hidden overflow-hidden border-t-2 border-red-500 dark:border-red-600 bg-white dark:bg-slate-900 transition-colors duration-300'
						>
							<div className='py-6 px-4 flex flex-col gap-6'>
								{[
									{ href: '/', label: 'Bosh sahifa' },
									{ href: '/menu', label: 'Menyu' },
									{ href: '/about', label: 'Biz haqimizda' },
								].map(link => (
									<Link
										key={link.href}
										href={link.href}
										className='text-lg font-black text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-wide hover:translate-x-2 hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.4)] dark:hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
										onClick={() => setMobileMenuOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</div>
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</header>
	)
}
