'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import { useCartStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { MenuItem } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export function MenuCard({ item }: { item: MenuItem }) {
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
		const cartEl = document.querySelector('[data-cart-icon]')
		if (buttonRef.current && cartEl) {
			const btnRect = buttonRef.current.getBoundingClientRect()
			const cartRect = cartEl.getBoundingClientRect()
			setFlyData({
				x: btnRect.left + btnRect.width / 2,
				y: btnRect.top + btnRect.height / 2,
				targetX: cartRect.left + cartRect.width / 2,
				targetY: cartRect.top + cartRect.height / 2,
			})
			setIsFlying(true)
			setTimeout(() => setIsFlying(false), 900)
		}
		toast.success("Savatga qo'shildi!")
		setTimeout(() => setAdded(false), 2000)
	}

	if (!mounted) return null

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='h-full w-full'
		>
			<Card
				className='group relative flex h-full flex-col overflow-hidden border-none bg-white dark:bg-[#0F172A] rounded-[2rem] p-0 transition-all duration-500 ease-out
        shadow-[0_10px_30px_rgba(0,0,0,0.05)]
        dark:shadow-[0_15px_35px_rgba(0,0,0,0.3)]
        hover:scale-[1.05] 
        hover:z-30
        hover:shadow-[0_25px_50px_rgba(220,38,38,0.15)]
        dark:hover:shadow-[0_25px_50px_rgba(220,38,38,0.25)]'
			>
				{/* Rasm heighti aspect-[4/3] orqali oshirildi */}
				<div className='relative w-full aspect-[4/3] overflow-hidden shrink-0 block leading-[0]'>
					<Image
						src={item.image_url || '/placeholder.svg'}
						alt={item.name}
						fill
						sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw'
						className='object-cover transition-transform duration-700 group-hover:scale-110 block'
						priority
					/>
				</div>

				<div className='flex flex-1 flex-col px-5 py-5'>
					<div className='mb-4'>
						<h3 className='text-xl font-black tracking-normal text-slate-900 dark:text-white uppercase transition-colors group-hover:text-red-600 leading-tight'>
							{item.name}
						</h3>
					</div>

					<div className='mt-auto flex items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-[1.5rem] border border-slate-100 dark:border-white/10 group-hover:border-red-500/30 transition-all'>
						<div className='flex flex-col'>
							<span className='text-[9px] font-bold uppercase tracking-wider text-red-600 mb-0.5'>
								Narxi
							</span>
							<Price
								value={item.price}
								className='text-xl font-black tracking-tighter text-slate-900 dark:text-white'
							/>
						</div>

						<Button
							ref={buttonRef}
							onClick={handleAddToCart}
							className={`h-11 w-11 rounded-xl transition-all duration-300 shadow-md active:scale-90 ${
								added
									? 'bg-green-500 text-white hover:bg-green-600'
									: 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/20'
							}`}
						>
							<AnimatePresence mode='wait'>
								{added ? (
									<motion.div
										key='check'
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
									>
										<Check className='h-6 w-6 stroke-[3]' />
									</motion.div>
								) : (
									<motion.div
										key='bag'
										initial={{ y: 5 }}
										animate={{ y: 0 }}
										exit={{ y: -5 }}
									>
										<ShoppingBag className='h-6 w-6 stroke-[2.5]' />
									</motion.div>
								)}
							</AnimatePresence>
						</Button>
					</div>
				</div>
			</Card>

			{isFlying &&
				createPortal(
					<motion.div
						initial={{
							x: flyData.x - 24,
							y: flyData.y - 24,
							scale: 1,
							opacity: 1,
						}}
						animate={{
							x: flyData.targetX - 24,
							y: flyData.targetY - 24,
							scale: 0.1,
							opacity: 0.2,
						}}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
						className='fixed top-0 left-0 z-[9999] pointer-events-none'
					>
						<div className='w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.5)] border-2 border-white dark:border-slate-800'>
							<ShoppingBag className='h-6 w-6 text-white' />
						</div>
					</motion.div>,
					document.body,
				)}
		</motion.div>
	)
}
