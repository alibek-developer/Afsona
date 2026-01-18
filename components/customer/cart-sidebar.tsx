'use client'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import {
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
			<div className='flex flex-col h-full bg-slate-50'>
				<SheetHeader className='border-b-2 border-red-500 pb-4'>
					<SheetTitle className='text-2xl font-black uppercase tracking-tight'>
						Savatcha
					</SheetTitle>
					<SheetDescription className='font-bold text-gray-500'>
						Savatchada hech narsa yo'q
					</SheetDescription>
				</SheetHeader>
				<div className='flex-1 flex flex-col items-center justify-center gap-6 text-muted-foreground px-6'>
					<div className='relative'>
						<div className='absolute inset-0 bg-red-600/20 blur-2xl rounded-full animate-pulse' />
						<ShoppingBag className='h-24 w-24 text-red-600 relative z-10 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]' />
					</div>
					<p className='text-xl font-black text-gray-900 uppercase tracking-tight'>
						Savatchada hech narsa yo'q
					</p>
					<Link href='/menu'>
						<Button className='h-14 px-10 text-base font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300 rounded-2xl uppercase bg-red-600 text-white border-2 border-black'>
							Menyuga o'tish
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col h-full bg-slate-50'>
			<SheetHeader className='border-b-2 border-red-500 pb-4 bg-white/80 backdrop-blur-md'>
				<SheetTitle className='text-2xl font-black uppercase tracking-tight'>
					Savatcha
				</SheetTitle>
				<SheetDescription className='font-bold text-gray-600'>
					{items.length} ta taom
				</SheetDescription>
			</SheetHeader>

			<div className='flex-1 overflow-y-auto py-6 px-4'>
				<div className='flex flex-col gap-4'>
					{items.map(item => (
						<div
							key={item.id}
							className='flex gap-3 p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all duration-300'
						>
							<div className='relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200'>
								<Image
									src={item.image_url || '/placeholder.svg'}
									alt={item.name}
									fill
									className='object-cover'
								/>
							</div>
							<div className='flex-1 min-w-0'>
								<h4 className='font-black text-base truncate uppercase tracking-tight'>
									{item.name}
								</h4>
								<Price
									value={item.price}
									className='text-red-600 font-black text-sm drop-shadow-[0_0_4px_rgba(255,0,0,0.3)]'
								/>
								<div className='flex items-center gap-2 mt-3'>
									<Button
										variant='outline'
										size='icon'
										className='h-8 w-8 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all'
										onClick={() => updateQuantity(item.id, item.quantity - 1)}
									>
										<Minus className='h-4 w-4 stroke-[3]' />
									</Button>
									<span className='w-10 text-center text-sm font-black'>
										{item.quantity}
									</span>
									<Button
										variant='outline'
										size='icon'
										className='h-8 w-8 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all'
										onClick={() => updateQuantity(item.id, item.quantity + 1)}
									>
										<Plus className='h-4 w-4 stroke-[3]' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg'
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

			<div className='border-t-2 border-red-500 p-6 bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20'>
				<div className='max-w-sm mx-auto space-y-4'>
					{/* Breakdown */}
					<div className='space-y-3'>
						<div className='flex justify-between items-center text-base'>
							<span className='text-gray-700 font-black uppercase tracking-tight'>
								Mahsulotlar:
							</span>
							<Price value={getTotal()} className='font-black text-gray-900' />
						</div>
						<div className='flex justify-between items-center text-base'>
							<span className='text-gray-700 font-black uppercase tracking-tight'>
								Yetkazib berish:
							</span>
							<span className='text-gray-500 font-black uppercase tracking-widest text-xs'>
								OPERATOR ANIQLAYDI
							</span>
						</div>
					</div>

					{/* Total */}
					<div className='flex justify-between items-end pt-4 border-t-2 border-dashed border-gray-300'>
						<span className='text-3xl font-black text-gray-900 tracking-tight uppercase'>
							Jami:
						</span>
						<Price
							value={getTotal()}
							className='text-3xl font-black text-red-600 tracking-tight drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]'
						/>
					</div>

					{/* Checkout Button */}
					<Link href='/checkout' className='block pt-2'>
						<Button
							className='w-full h-16 text-lg font-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0_0_25px_rgba(255,0,0,0.6)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wide bg-red-600 text-white border-2 border-black'
							size='lg'
						>
							Buyurtmani rasmiylashtirish
						</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}
