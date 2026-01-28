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
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSidebar() {
	const { items, removeItem, updateQuantity, getTotal } = useCartStore()

	if (items.length === 0) {
		return (
			<div className='flex flex-col h-full bg-slate-50 dark:bg-slate-950'>
				<SheetHeader className='border-b-4 border-red-600 p-6 bg-white dark:bg-slate-900'>
					<SheetTitle className='text-3xl font-black uppercase tracking-tighter dark:text-white'>
						Savatcha
					</SheetTitle>
					<SheetDescription className='font-bold text-slate-500'>
						Hozircha bo'sh
					</SheetDescription>
				</SheetHeader>

				<div className='flex-1 flex flex-col items-center justify-center gap-6 px-6'>
					<div className='relative'>
						<div className='absolute inset-0 bg-red-600/20 blur-3xl rounded-full animate-pulse' />
						<ShoppingBag className='h-28 w-28 text-red-600 relative z-10 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]' />
					</div>
					<p className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center'>
						Savatchangizda <br /> hech narsa yo'q
					</p>
					<SheetClose asChild>
						<Link href='/menu'>
							<Button className='h-14 px-10 text-base font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded-xl uppercase bg-red-600 text-white border-2 border-black'>
								Menyuga o'tish
							</Button>
						</Link>
					</SheetClose>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col h-full bg-slate-50 dark:bg-slate-950'>
			<SheetHeader className='border-b-4 border-red-600 p-6 bg-white dark:bg-slate-900'>
				<SheetTitle className='text-3xl font-black uppercase tracking-tighter dark:text-white'>
					Savatcha
				</SheetTitle>
				<SheetDescription className='font-bold text-red-600 dark:text-red-500 uppercase tracking-widest text-xs'>
					{items.length} ta mahsulot tanlandi
				</SheetDescription>
			</SheetHeader>

			{/* Scrollable Area */}
			<div className='flex-1 overflow-y-auto py-6 px-4 custom-scrollbar'>
				<div className='flex flex-col gap-4'>
					{items.map(item => (
						<div
							key={item.id}
							className='flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-black dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.1)] transition-all'
						>
							{/* Image */}
							<div className='relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-100 dark:border-slate-800'>
								<Image
									src={item.image_url || '/placeholder.svg'}
									alt={item.name}
									fill
									className='object-cover'
								/>
							</div>

							{/* Info */}
							<div className='flex-1 min-w-0 flex flex-col justify-between'>
								<div>
									<h4 className='font-black text-sm md:text-base truncate uppercase tracking-tight dark:text-white'>
										{item.name}
									</h4>
									<Price
										value={item.price}
										className='text-red-600 dark:text-red-500 font-black text-sm'
									/>
								</div>

								{/* Counter & Actions */}
								<div className='flex items-center justify-between mt-2'>
									<div className='flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-black dark:border-slate-700'>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7 hover:bg-white dark:hover:bg-slate-700'
											onClick={() =>
												updateQuantity(item.id, Math.max(1, item.quantity - 1))
											}
										>
											<Minus className='h-3 w-3 stroke-[4]' />
										</Button>
										<span className='w-8 text-center text-xs font-black dark:text-white'>
											{item.quantity}
										</span>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7 hover:bg-white dark:hover:bg-slate-700'
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
										>
											<Plus className='h-3 w-3 stroke-[4]' />
										</Button>
									</div>

									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:bg-red-950/30'
										onClick={() => removeItem(item.id)}
									>
										<Trash2 className='h-4 w-4 stroke-[3]' />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Footer / Summary */}
			<div className='border-t-4 border-black dark:border-slate-800 p-6 bg-white dark:bg-slate-900'>
				<div className='space-y-4'>
					<div className='space-y-2'>
						<div className='flex justify-between items-center'>
							<span className='text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest'>
								Jami miqdor:
							</span>
							<Price
								value={getTotal()}
								className='font-black text-slate-900 dark:text-white'
							/>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest'>
								Yetkazib berish:
							</span>
							<span className='text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded'>
								OPERATOR ANIQLAYDI
							</span>
						</div>
					</div>

					<div className='pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800'>
						<div className='flex justify-between items-end mb-6'>
							<span className='text-2xl font-black uppercase tracking-tighter dark:text-white'>
								Umumiy:
							</span>
							<Price
								value={getTotal()}
								className='text-3xl font-black text-red-600 dark:text-red-500 tracking-tighter'
							/>
						</div>

						<SheetClose asChild>
							<Link href='/checkout'>
								<Button
									className='w-full h-16 text-lg font-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all uppercase bg-red-600 text-white border-2 border-black'
									size='lg'
								>
									Buyurtma berish
								</Button>
							</Link>
						</SheetClose>
					</div>
				</div>
			</div>
		</div>
	)
}
