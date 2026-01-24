'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import { useCartStore } from '@/lib/store'
import type { MenuItem } from '@/lib/types'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

interface MenuCardProps {
	item: MenuItem
}

export function MenuCard({ item }: MenuCardProps) {
	const [added, setAdded] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [flyToCart, setFlyToCart] = useState(false)
	const [flyFrom, setFlyFrom] = useState<{
		x: number
		y: number
		size: number
	} | null>(null)
	const [flyTo, setFlyTo] = useState<{ x: number; y: number } | null>(null)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [darkMode, setDarkMode] = useState(false)

	const addItem = useCartStore(state => state.addItem)

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
		Autoplay({ delay: 3000, stopOnInteraction: false }) as any,
	])

	useEffect(() => {
		setMounted(true)
		const isDark = document.documentElement.classList.contains('dark')
		setDarkMode(isDark)
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		const onSelect = () => {
			setSelectedIndex(emblaApi.selectedScrollSnap())
		}

		emblaApi.on('select', onSelect)
		onSelect()

		return () => {
			emblaApi.off('select', onSelect)
		}
	}, [emblaApi])

	const handleAddToCart = (e?: React.MouseEvent) => {
		addItem(item)
		setAdded(true)
		toast("Muvaffaqiyatli qo'shildi!", {
			duration: 2400,
			className: darkMode
				? 'bg-red-600 dark:bg-red-600 text-white border-2 border-red-500 dark:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] font-black'
				: 'bg-red-600 text-white border-2 border-black shadow-[0_0_20px_rgba(255,0,0,0.5)] font-black',
		})

		const buttonEl = (e?.currentTarget as HTMLElement | undefined) ?? null
		const cartEl = document.querySelector(
			'[data-cart-icon]',
		) as HTMLElement | null

		if (buttonEl) {
			const fromRect = buttonEl.getBoundingClientRect()
			setFlyFrom({
				x: fromRect.left + fromRect.width / 2,
				y: fromRect.top + fromRect.height / 2,
				size: 36,
			})
		}

		if (cartEl) {
			const toRect = cartEl.getBoundingClientRect()
			setFlyTo({
				x: toRect.left + toRect.width / 2,
				y: toRect.top + toRect.height / 2,
			})
		} else {
			setFlyTo({ x: window.innerWidth - 56, y: window.innerHeight - 56 })
		}

		if (buttonEl) {
			setFlyToCart(true)
			window.setTimeout(() => setFlyToCart(false), 650)
		}

		setTimeout(() => setAdded(false), 1400)
	}

	const images = [
		item.image_url || '/placeholder.svg',
		item.image_url || '/placeholder.svg',
		item.image_url || '/placeholder.svg',
	]

	if (!mounted) return null

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<Card className='group relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] dark:hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] dark:hover:border-red-600 transition-all duration-300 h-full flex flex-col'>
				{/* Carousel Section */}
				<div className='relative h-64 w-full overflow-hidden shrink-0 rounded-t-3xl bg-slate-50 dark:bg-slate-800'>
					<div className='overflow-hidden h-full' ref={emblaRef}>
						<div className='flex h-full touch-pan-y'>
							{images.map((img, index) => (
								<div
									className='flex-[0_0_100%] min-w-0 relative h-full px-1'
									key={index}
								>
									<div
										className={`relative w-full h-full transition-all duration-700 ease-out ${
											index === selectedIndex
												? 'scale-100 opacity-100'
												: 'scale-90 opacity-60 blur-[2px]'
										}`}
									>
										<Image
											src={img}
											alt={`${item.name} - ${index + 1}`}
											fill
											className='object-cover w-full h-full rounded-2xl'
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Neon Indicator Dots */}
					<div className='absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20'>
						{images.map((_, index) => (
							<button
								key={index}
								onClick={() => emblaApi?.scrollTo(index)}
								className={`h-2 rounded-full transition-all duration-300 ${
									index === selectedIndex
										? 'bg-red-600 dark:bg-red-500 w-6 shadow-[0_0_12px_rgba(255,0,0,0.9)] dark:shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-white dark:border-red-400'
										: 'bg-gray-400 dark:bg-slate-600 w-2 hover:bg-gray-600 dark:hover:bg-slate-500'
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>

					{/* Badge - Neon Style */}
					<div className='absolute top-3 right-3 z-20'>
						<span className='bg-red-600 dark:bg-red-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.7)] dark:shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-white dark:border-red-400'>
							HIT
						</span>
					</div>
				</div>

				{/* Content Section */}
				<div className='p-6 flex flex-col flex-1 relative z-20 bg-white dark:bg-slate-900'>
					<div className='flex-1 text-center'>
						<h3 className='font-black text-3xl mb-2 text-black dark:text-white leading-none tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'>
							{item.name}
						</h3>
						<p className='text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest line-clamp-2'>
							{item.description}
						</p>
					</div>

					<div className='mt-6 flex items-end justify-between gap-3 pt-4 border-t-2 border-gray-200 dark:border-slate-700'>
						<div className='flex flex-col text-left'>
							<span className='text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1'>
								Narxi
							</span>
							<div className='relative'>
								<Price
									value={item.price}
									className='text-3xl font-black text-red-600 dark:text-red-500 tracking-tight drop-shadow-[0_0_8px_rgba(255,0,0,0.3)] dark:drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
								/>
							</div>
						</div>

						<AnimatePresence mode='wait'>
							<motion.div
								key={added ? 'added' : 'not-added'}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.8, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<Button
									onClick={handleAddToCart}
									className={`h-14 w-14 rounded-xl border-2 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200 ${
										added
											? 'bg-green-500 dark:bg-green-600 text-white border-green-700 dark:border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] dark:shadow-[0_0_25px_rgba(34,197,94,0.7)]'
											: 'bg-white dark:bg-slate-800 text-black dark:text-white border-black dark:border-slate-600 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500'
									}`}
								>
									{added ? (
										<Check className='h-7 w-7 stroke-[3]' />
									) : (
										<ShoppingBag className='h-7 w-7 stroke-[3]' />
									)}
								</Button>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</Card>

			{/* Flying Animation Portal */}
			{mounted && flyToCart && flyFrom && flyTo
				? createPortal(
						<motion.div
							initial={{
								opacity: 1,
								x: flyFrom.x,
								y: flyFrom.y,
								scale: 1,
							}}
							animate={{
								opacity: 0,
								x: flyTo.x,
								y: flyTo.y,
								scale: 0.2,
							}}
							transition={{ duration: 0.6, ease: 'easeInOut' }}
							style={{
								position: 'fixed',
								left: 0,
								top: 0,
								width: flyFrom.size,
								height: flyFrom.size,
								marginLeft: -(flyFrom.size / 2),
								marginTop: -(flyFrom.size / 2),
								pointerEvents: 'none',
								zIndex: 60,
							}}
							className='rounded-full bg-red-600 dark:bg-red-600 shadow-[0_0_30px_rgba(255,0,0,0.8)] dark:shadow-[0_0_40px_rgba(239,68,68,0.9)] border-2 border-white dark:border-red-400'
						/>,
						document.body,
					)
				: null}
		</motion.div>
	)
}
