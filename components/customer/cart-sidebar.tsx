'use client'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import {
	SheetClose,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSidebar() {
	const { items, removeItem, updateQuantity, getTotal } = useCartStore()

	// SIZGA YOQQAN O'SHA CHAYQALISH ANIMATSIYASI
	const iconFloat = {
		animate: {
			y: [0, -20, 0],
			rotate: [0, 8, -8, 0],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: 'easeInOut',
			},
		},
	}

	if (items.length === 0) {
		return (
			<div className='flex flex-col h-full bg-[#0b1120] text-white'>
				<SheetHeader className='border-b border-white/5 p-5'>
					<SheetTitle className='text-xl font-black uppercase tracking-normal  text-white'>
						Savatcha
					</SheetTitle>
					<SheetDescription className='text-[10px] font-bold text-slate-500 uppercase tracking-[2px]'>
						Hozircha bo'sh
					</SheetDescription>
				</SheetHeader>

				<div className='flex-1 flex flex-col items-center justify-center p-10'>
					<motion.div
						variants={iconFloat}
						animate='animate'
						className='relative mb-10'
					>
						<div className='absolute inset-0 bg-red-600/20 blur-[50px] rounded-full' />
						<ShoppingBag className='h-28 w-28 text-red-600 relative z-10 stroke-[1.2]' />
					</motion.div>

					<div className='text-center space-y-4 mb-12'>
						<h3 className='text-3xl font-black uppercase tracking-normal'>
							Savatcha bo'sh
						</h3>
						<p className='text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose'>
							Mazali taomlardan <br /> birini tanlang
						</p>
					</div>

					<SheetClose asChild>
						<Link href='/menu' className='w-full'>
							<Button className='w-full h-16 text-sm font-black uppercase  bg-red-600 hover:bg-red-700 text-white rounded-2xl border-b-[6px] border-red-900 active:border-b-0 active:translate-y-1 transition-all shadow-2xl shadow-red-900/40'>
								Menyuni ko'rish
							</Button>
						</Link>
					</SheetClose>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col h-full bg-[#0b1120]'>
			{/* Header */}
			<SheetHeader className='border-b border-white/5 p-5 bg-[#0b1120] z-10'>
				<SheetTitle className='text-xl font-black uppercase tracking-tighter text-white'>
					Savatcha
				</SheetTitle>
				<SheetDescription className='font-bold text-red-500 uppercase tracking-widest text-[10px]'>
					{items.length} ta mahsulot
				</SheetDescription>
			</SheetHeader>

			{/* Mahsulotlar ro'yxati */}
			<div className='flex-1 overflow-y-auto py-6 px-4 custom-scrollbar bg-[#0b1120]'>
				<motion.div layout className='flex flex-col gap-4'>
					<AnimatePresence mode='popLayout'>
						{items.map(item => (
							<motion.div
								key={item.id}
								layout
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className='flex gap-4 p-4 bg-[#161f32] rounded-2xl border border-white/5 shadow-2xl relative group'
							>
								<div className='relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10'>
									<Image
										src={item.image_url || '/placeholder.svg'}
										alt={item.name}
										fill
										className='object-cover group-hover:scale-110 transition-transform duration-500'
									/>
								</div>

								<div className='flex-1 min-w-0 flex flex-col justify-between py-1'>
									<div className='flex justify-between items-start'>
										<h4 className='font-bold text-sm md:text-base text-white uppercase truncate tracking-tight'>
											{item.name}
										</h4>
										<button
											onClick={() => removeItem(item.id)}
											className='text-slate-500 hover:text-red-500 transition-colors'
										>
											<Trash2 size={16} />
										</button>
									</div>

									<div className='flex items-center justify-between'>
										<Price
											value={item.price * item.quantity}
											className='text-red-500 font-black text-base'
										/>

										<div className='flex items-center gap-3 bg-[#0b1120] rounded-xl border border-white/10 p-1'>
											<button
												disabled={item.quantity <= 1}
												onClick={() =>
													updateQuantity(item.id, item.quantity - 1)
												}
												className='h-7 w-7 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 rounded-lg disabled:opacity-20 transition-all'
											>
												<Minus
													size={14}
													strokeWidth={3}
													className='text-white'
												/>
											</button>
											<span className='min-w-[18px] text-center text-[11px] font-black text-white'>
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
												className='h-7 w-7 flex items-center justify-center hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-all'
											>
												<Plus
													size={14}
													strokeWidth={3}
													className='text-white'
												/>
											</button>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			</div>

			{/* Footer - 2-rasm asosida yangilandi */}
			<div className='border-t border-white/5 p-6 bg-[#0b1120] space-y-5'>
				<div className='space-y-3'>
					<div className='flex justify-between items-center'>
						<span className='text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500'>
							Mahsulotlar:
						</span>
						<Price
							value={getTotal()}
							className='text-sm font-bold text-white tracking-tight'
						/>
					</div>

					<div className='flex justify-between items-center'>
						<span className='text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500'>
							Yetkazib berish:
						</span>
						<span className='text-[10px] font-black text-red-500 uppercase tracking-wider'>
							Bepul
						</span>
					</div>
				</div>

				{/* Ingichka chiziq (2-rasmdagi divider uslubida) */}
				<div className='h-[1px] w-full bg-white/5' />

				<div className='flex justify-between items-end pb-2'>
					<div className='flex flex-col'>
						<span className='text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-0.5'>
							Umumiy to'lov:
						</span>
						<span className='text-2xl font-black uppercase tracking-tighter text-white'>
							Jami:
						</span>
					</div>
					<Price
						value={getTotal()}
						className='text-3xl font-black text-red-500 tracking-tighter'
					/>
				</div>

				<SheetClose asChild>
					<Link href='/checkout'>
						<Button className='w-full h-15  text-sm font-black rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all uppercase flex items-center justify-center gap-3 group'>
							Rasmiylashtirish
							<ArrowRight
								size={18}
								className='group-hover:translate-x-1.5 transition-transform'
							/>
						</Button>
					</Link>
				</SheetClose>
			</div>
		</div>
	)
}
