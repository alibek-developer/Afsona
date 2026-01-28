'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
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
		<header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 border-b-2 border-red-500 dark:border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)] dark:shadow-[0_0_30px_rgba(239,68,68,0.35)] transition-all duration-300 backdrop-blur-md'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					{/* Logo */}
					<Link href='/' className='flex items-center gap-3 group'>
						<div className='relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-red-500 dark:border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-300'>
							<Image
								src='/logo.jpg' // public/logo.jpg → to'g'ri yo'l
								alt='Afsona Restaurant Logo'
								fill
								className='object-cover'
								priority
								sizes='(max-width: 768px) 48px, 56px'
							/>
						</div>

						<span className='font-black text-2xl md:text-3xl text-black dark:text-white tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 uppercase'>
							Afsona
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex items-center gap-8'>
						{[
							{ href: '/', label: 'Bosh sahifa' },
							{ href: '/menu', label: 'Menyu' },
							{ href: '/about', label: 'Biz haqimizda' },
						].map(link => (
							<Link
								key={link.href}
								href={link.href}
								className='relative text-lg font-black text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-wide after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-red-600 dark:after:bg-red-500 after:transition-all hover:after:w-full after:shadow-[0_0_8px_rgba(239,68,68,0.6)]'
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
							aria-label='Toggle dark mode'
						>
							{darkMode ? (
								<svg
									className='w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm8-4a1 1 0 11-2 0 1 1 0 012 0zm-2-6a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm14-4a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm4-4a1 1 0 110 2 1 1 0 010-2zm8 8a1 1 0 110 2 1 1 0 010-2z' />
								</svg>
							) : (
								<svg
									className='w-5 h-5 text-slate-700 dark:text-slate-300'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
								</svg>
							)}
						</button>

						{/* Cart */}
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative group hover:bg-red-50 dark:hover:bg-slate-900 transition-all duration-300 rounded-xl'
								>
									<ShoppingCart className='h-6 w-6 text-gray-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' />
									<AnimatePresence>
										{isMounted && itemCount > 0 && (
											<motion.span
												key={cartPulseKey}
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0 }}
												transition={{
													type: 'spring',
													stiffness: 300,
													damping: 20,
												}}
												className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-2 ring-white dark:ring-slate-950'
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

						{/* Mobile Menu Button */}
						<Button
							variant='ghost'
							size='icon'
							className='md:hidden hover:bg-red-50 dark:hover:bg-slate-900 transition-all duration-300 rounded-xl'
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className='h-7 w-7' />
							) : (
								<Menu className='h-7 w-7' />
							)}
							<span className='sr-only'>Menyu</span>
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.nav
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className='md:hidden border-t-2 border-red-500 dark:border-red-600 bg-white dark:bg-slate-950 overflow-hidden'
						>
							<div className='py-6 px-6 flex flex-col gap-6'>
								{[
									{ href: '/', label: 'Bosh sahifa' },
									{ href: '/menu', label: 'Menyu' },
									{ href: '/about', label: 'Biz haqimizda' },
								].map(link => (
									<Link
										key={link.href}
										href={link.href}
										className='text-xl font-black text-gray-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-wider hover:translate-x-2'
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
