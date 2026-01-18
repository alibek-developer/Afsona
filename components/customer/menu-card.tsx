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
	// ✅ CRITICAL FIX: Barcha hooklar eng tepada, hech qanday shartdan tashqarida
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

	const addItem = useCartStore(state => state.addItem)

	// ✅ Carousel Hooks - Infinite Loop + Autoplay (3 soniya)
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
		Autoplay({ delay: 3000, stopOnInteraction: false }) as any,
	])

	// ✅ Mount Effect
	useEffect(() => {
		setMounted(true)
	}, [])

	// ✅ Carousel Selection Effect
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

	// ✅ Add to Cart Function
	const handleAddToCart = (e?: React.MouseEvent) => {
		addItem(item)
		setAdded(true)
		toast("Muvaffaqiyatli qo'shildi!", {
			duration: 2400,
			className:
				'bg-red-600 text-white border-2 border-black shadow-[0_0_20px_rgba(255,0,0,0.5)] font-black',
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

	// Images for Carousel
	const images = [
		item.image_url || '/placeholder.svg',
		item.image_url || '/placeholder.svg',
		item.image_url || '/placeholder.svg',
	]

	// ✅ Conditional return AFTER all hooks
	if (!mounted) return null

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<Card className='group relative overflow-hidden bg-white border-2 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300 h-full flex flex-col'>
				{/* 3D Carousel Section */}
				<div className='relative h-64 w-full overflow-hidden shrink-0 rounded-t-3xl bg-slate-50'>
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
										? 'bg-red-600 w-6 shadow-[0_0_12px_rgba(255,0,0,0.9)] border border-white'
										: 'bg-gray-400 w-2 hover:bg-gray-600'
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>

					{/* Badge - Neon Style */}
					<div className='absolute top-3 right-3 z-20'>
						<span className='bg-red-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.7)] border-2 border-white'>
							HIT
						</span>
					</div>
				</div>

				{/* Content Section - Neon Style */}
				<div className='p-6 flex flex-col flex-1 relative z-20 bg-white'>
					<div className='flex-1 text-center'>
						<h3 className='font-black text-3xl mb-2 text-black leading-none tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]'>
							{item.name}
						</h3>
						<p className='text-gray-500 text-xs font-bold uppercase tracking-widest line-clamp-2'>
							{item.description}
						</p>
					</div>

					<div className='mt-6 flex items-end justify-between gap-3 pt-4 border-t-2 border-gray-200'>
						<div className='flex flex-col text-left'>
							<span className='text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1'>
								Narxi
							</span>
							<div className='relative'>
								<Price
									value={item.price}
									className='text-3xl font-black text-red-600 tracking-tight drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]'
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
									className={`h-14 w-14 rounded-xl border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${
										added
											? 'bg-green-500 text-white border-green-700 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
											: 'bg-white text-black hover:bg-red-50 hover:text-red-600 hover:border-red-600'
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
							className='rounded-full bg-red-600 shadow-[0_0_30px_rgba(255,0,0,0.8)] border-2 border-white'
						/>,
						document.body,
					)
				: null}
		</motion.div>
	)
}
