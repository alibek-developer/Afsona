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

	return (
		<header className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b-2 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)]'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					{/* Logo - Neon Style */}
					<Link href='/' className='flex items-center gap-3 group'>
						<div className='w-12 h-12 rounded-xl bg-black flex items-center justify-center text-red-500 text-2xl font-black shadow-[0_0_15px_rgba(255,0,0,0.4)] group-hover:shadow-[0_0_25px_rgba(255,0,0,0.6)] transition-all duration-300 border-2 border-red-500'>
							O
						</div>
						<span className='font-black text-2xl md:text-3xl text-black tracking-tight group-hover:text-red-600 transition-colors duration-200 uppercase'>
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
								className='relative text-lg font-black text-gray-700 hover:text-red-600 transition-all duration-300 uppercase tracking-wide after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-red-600 after:shadow-[0_0_8px_rgba(255,0,0,0.6)] after:transition-all hover:after:w-full'
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Actions */}
					<div className='flex items-center gap-4'>
						{/* Cart - Neon Icon */}
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative group hover:bg-red-50 transition-all duration-300 rounded-xl'
									data-cart-icon
								>
									<ShoppingCart className='h-6 w-6 text-gray-700 group-hover:text-red-600 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' />
									<AnimatePresence>
										{isMounted && itemCount > 0 && (
											<motion.span
												key={cartPulseKey}
												initial={{ scale: 0, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												exit={{ scale: 0, opacity: 0 }}
												transition={{ duration: 0.4, type: 'spring' }}
												className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-[0_0_12px_rgba(255,0,0,0.7)] ring-2 ring-white'
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
								className='w-full sm:max-w-lg bg-slate-50 border-l-2 border-red-500'
							>
								<CartSidebar />
							</SheetContent>
						</Sheet>

						{/* Mobile Menu Toggle - Neon */}
						<Button
							variant='ghost'
							size='icon'
							className='md:hidden hover:bg-red-50 transition-all duration-300 rounded-xl'
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className='h-6 w-6 text-gray-700 hover:text-red-600' />
							) : (
								<Menu className='h-6 w-6 text-gray-700 hover:text-red-600' />
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
							className='md:hidden overflow-hidden border-t-2 border-red-500 bg-white/95 backdrop-blur-md'
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
										className='text-lg font-black text-gray-700 hover:text-red-600 transition-all duration-300 uppercase tracking-wide hover:translate-x-2 hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]'
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
