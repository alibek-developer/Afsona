'use client'

import { LocationPicker } from '@/components/customer/location-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'
import { useMounted } from '@/lib/useMounted'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type OrderMode = 'dine-in' | 'delivery'

export default function CheckoutPage() {
	const { items, getTotal, clearCart } = useCartStore()
	const mounted = useMounted()

	const [orderMode, setOrderMode] = useState<OrderMode>('delivery')
	const [customerName, setCustomerName] = useState('')
	const [customerPhone, setCustomerPhone] = useState('')
	const [tableNumber, setTableNumber] = useState('')
	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null)
	const [deliveryTooFar, setDeliveryTooFar] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [subtotal, setSubtotal] = useState(0)

	useEffect(() => {
		if (mounted) setSubtotal(getTotal())
	}, [items, mounted, getTotal])

	const handleLocationSelect = (
		address: string,
		distance: number,
		tooFar: boolean,
	) => {
		setDeliveryAddress(address)
		setDeliveryDistance(distance)
		setDeliveryTooFar(tooFar)
	}

	const handlePlaceOrder = async () => {
		if (isSubmitting) return
		if (!customerName.trim() || customerPhone.trim().length < 9) {
			toast.error("Ma'lumotlarni to'liq kiriting")
			return
		}
		setIsSubmitting(true)

		const orderData = {
			customer_name: customerName.trim(),
			phone: customerPhone.trim(),
			delivery_address:
				orderMode === 'delivery' ? deliveryAddress : `Stol: ${tableNumber}`,
			type: orderMode,
			status: 'yangi',
			items: items,
			total_amount: Number(subtotal),
		}

		try {
			const { error } = await supabase.from('orders').insert([orderData])
			if (error) throw error
			setOrderPlaced(true)
			clearCart()
			toast.success('Buyurtma qabul qilindi!')
		} catch (err: any) {
			toast.error('Xatolik yuz berdi.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!mounted) return null
	if (orderPlaced)
		return (
			<div className='flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-white dark:bg-slate-950'>
				<div className='w-24 h-24 bg-green-500 dark:bg-green-600 text-white rounded-3xl flex items-center justify-center mb-8 border-[4px] border-black dark:border-green-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(34,197,94,0.4)]'>
					<Check size={48} strokeWidth={4} />
				</div>
				<h1 className='text-4xl md:text-5xl font-black mb-4 uppercase italic tracking-tighter dark:text-white'>
					Rahmat!
				</h1>
				<p className='text-xl text-slate-600 dark:text-slate-400 mb-10 font-bold'>
					Buyurtmangiz muvaffaqiyatli qabul qilindi.
				</p>
				<Link href='/menu' className='w-full max-w-sm'>
					<Button className='w-full py-8 bg-black dark:bg-red-600 text-white border-[3px] border-black dark:border-red-500 hover:bg-slate-800 dark:hover:bg-red-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)] text-xl font-black transition-all'>
						MENYUGA QAYTISH
					</Button>
				</Link>
			</div>
		)

	return (
		<div className='bg-white dark:bg-slate-950 min-h-screen py-8 md:py-16 transition-colors duration-300'>
			<div className='max-w-[1400px] mx-auto px-4 md:px-8'>
				<Link
					href='/menu'
					className='inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white mb-10 font-black text-lg transition-all group'
				>
					<ArrowLeft
						size={24}
						className='mr-3 group-hover:-translate-x-2 transition-transform'
						strokeWidth={3}
					/>
					ORQAGA QAYTISH
				</Link>

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start'>
					{/* Chap tomon: Ma'lumotlar */}
					<div className='lg:col-span-7 space-y-10'>
						{/* 01. Shaxsiy ma'lumotlar */}
						<div className='bg-white dark:bg-slate-900 border-[4px] border-black dark:border-slate-700 rounded-2xl p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1),0_0_30px_rgba(239,68,68,0.15)]'>
							<h2 className='text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10 border-b-2 border-slate-100 dark:border-slate-800 pb-4'>
								01. Shaxsiy ma'lumotlar
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
								<div className='space-y-4'>
									<Label className='text-lg font-black text-black dark:text-white uppercase ml-1 italic'>
										Ismingiz
									</Label>
									<Input
										value={customerName}
										onChange={e => setCustomerName(e.target.value)}
										placeholder='Ali Valiyev'
										className='h-16 text-lg border-[3px] border-black dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus-visible:ring-0 focus-visible:border-red-500 dark:focus-visible:border-red-500 font-bold px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
									/>
								</div>
								<div className='space-y-4'>
									<Label className='text-lg font-black text-black dark:text-white uppercase ml-1 italic'>
										Telefon raqam
									</Label>
									<Input
										value={customerPhone}
										onChange={e => setCustomerPhone(e.target.value)}
										placeholder='+998'
										className='h-16 text-lg border-[3px] border-black dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus-visible:ring-0 focus-visible:border-red-500 dark:focus-visible:border-red-500 font-bold px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
									/>
								</div>
							</div>
						</div>

						{/* 02. Qabul qilish turi */}
						<div className='bg-white dark:bg-slate-900 border-[4px] border-black dark:border-slate-700 rounded-2xl p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1),0_0_30px_rgba(239,68,68,0.15)]'>
							<h2 className='text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10 border-b-2 border-slate-100 dark:border-slate-800 pb-4'>
								02. Qabul qilish turi
							</h2>
							<RadioGroup
								value={orderMode}
								onValueChange={v => setOrderMode(v as OrderMode)}
								className='grid grid-cols-2 gap-6 mb-10'
							>
								<Label
									htmlFor='delivery'
									className={`flex items-center justify-center h-20 border-[3px] rounded-2xl cursor-pointer font-black text-lg uppercase transition-all ${
										orderMode === 'delivery'
											? 'bg-red-500 dark:bg-red-600 text-white border-black dark:border-red-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] -translate-y-2'
											: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-black dark:hover:border-red-500'
									}`}
								>
									<RadioGroupItem
										value='delivery'
										id='delivery'
										className='sr-only'
									/>
									Yetkazib berish
								</Label>
								<Label
									htmlFor='dine-in'
									className={`flex items-center justify-center h-20 border-[3px] rounded-2xl cursor-pointer font-black text-lg uppercase transition-all ${
										orderMode === 'dine-in'
											? 'bg-red-500 dark:bg-red-600 text-white border-black dark:border-red-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] -translate-y-2'
											: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-black dark:hover:border-red-500'
									}`}
								>
									<RadioGroupItem
										value='dine-in'
										id='dine-in'
										className='sr-only'
									/>
									Restoranda
								</Label>
							</RadioGroup>

							{orderMode === 'delivery' ? (
								<div className='border-[3px] border-black dark:border-slate-700 rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]'>
									<LocationPicker onLocationSelect={handleLocationSelect} />
								</div>
							) : (
								<div className='space-y-4 animate-in fade-in zoom-in-95 duration-300'>
									<Label className='text-lg font-black text-black dark:text-white uppercase ml-1 italic'>
										Stol raqami
									</Label>
									<Input
										placeholder='Masalan: 5'
										value={tableNumber}
										onChange={e => setTableNumber(e.target.value)}
										className='h-16 text-lg border-[3px] border-black dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl font-bold px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
									/>
								</div>
							)}
						</div>
					</div>

					{/* O'ng tomon: Xulosa */}
					<div className='lg:col-span-5'>
						<div className='bg-white dark:bg-slate-900 border-[4px] border-black dark:border-slate-700 rounded-2xl p-8 md:p-10 shadow-[10px_10px_0px_0px_rgba(239,68,68,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,68,68,0.4)] sticky top-12'>
							<h2 className='text-3xl font-black italic uppercase mb-8 border-b-[6px] border-black dark:border-red-600 pb-4 tracking-tighter dark:text-white'>
								Xulosa
							</h2>

							<div className='space-y-6 max-h-[400px] overflow-y-auto pr-4 mb-10 custom-scrollbar'>
								{items.map(item => (
									<div
										key={item.id}
										className='flex justify-between items-start gap-4 pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-700'
									>
										<div className='flex-1'>
											<p className='font-black text-xl uppercase leading-tight mb-1 dark:text-white'>
												{item.name}
											</p>
											<p className='text-base font-bold text-slate-500 dark:text-slate-400'>
												{item.quantity} dona × <Price value={item.price} />
											</p>
										</div>
										<div className='text-right'>
											<Price
												value={item.price * item.quantity}
												className='text-xl font-black text-red-500 dark:text-red-500 whitespace-nowrap'
											/>
										</div>
									</div>
								))}
							</div>

							<div className='bg-slate-50 dark:bg-slate-800 border-[3px] border-black dark:border-slate-700 p-6 rounded-xl mb-10 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'>
								<span className='font-black uppercase text-2xl italic tracking-tighter dark:text-white'>
									Jami:
								</span>
								<Price
									value={subtotal}
									className='text-3xl font-black text-red-500 dark:text-red-500'
								/>
							</div>

							<Button
								onClick={handlePlaceOrder}
								disabled={isSubmitting || items.length === 0}
								className='w-full py-10 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white border-[4px] border-black dark:border-red-500 rounded-2xl font-black uppercase text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:border-slate-300 dark:disabled:border-slate-600'
							>
								{isSubmitting ? (
									<Loader2 className='animate-spin w-8 h-8' />
								) : (
									'BUYURTMA BERISH'
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
