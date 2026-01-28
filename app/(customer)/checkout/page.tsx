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
import { ArrowLeft, Check, Loader2, MapPin, Utensils } from 'lucide-react'
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
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	const [subtotal, setSubtotal] = useState(0)

	useEffect(() => {
		if (mounted) setSubtotal(getTotal())
	}, [items, mounted, getTotal])

	const handlePlaceOrder = async () => {
		if (isSubmitting) return
		if (!customerName.trim() || customerPhone.trim().length < 9) {
			toast.error("Ma'lumotlarni to'liq kiritish shart!")
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
			<div className='flex flex-col items-center justify-center min-h-[90vh] px-6 text-center bg-white dark:bg-slate-950'>
				<div className='w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-6 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
					<Check size={40} strokeWidth={4} />
				</div>
				<h1 className='text-3xl font-black mb-2 uppercase italic dark:text-white'>
					RAHMAT!
				</h1>
				<p className='text-slate-500 dark:text-slate-400 mb-8 font-bold text-sm'>
					Buyurtmangiz qabul qilindi.
				</p>
				<Link href='/menu' className='w-full max-w-xs'>
					<Button className='w-full py-6 bg-red-600 text-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg font-black'>
						MENYUGA QAYTISH
					</Button>
				</Link>
			</div>
		)

	return (
		<div className='bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300'>
			{/* Header */}
			<div className='sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b-2 border-black dark:border-slate-800 px-4 py-4 flex items-center gap-4'>
				<Link
					href='/menu'
					className='p-2 bg-slate-100 dark:bg-slate-800 border-2 border-black rounded-xl active:translate-y-1 transition-all'
				>
					<ArrowLeft
						size={20}
						strokeWidth={3}
						className='text-black dark:text-white'
					/>
				</Link>
				<h1 className='text-xl font-black uppercase italic tracking-tighter dark:text-white'>
					Buyurtma berish
				</h1>
			</div>

			<div className='max-w-md mx-auto px-4 mt-6 space-y-6'>
				{/* 01. Shaxsiy ma'lumotlar - Ixchamroq */}
				<section className='bg-white dark:bg-slate-900 border-[3px] border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
					<div className='flex items-center gap-2 mb-6'>
						<span className='bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md border-2 border-black'>
							01
						</span>
						<h2 className='font-black uppercase tracking-tight text-sm text-slate-500'>
							Shaxsiy ma'lumotlar
						</h2>
					</div>

					<div className='space-y-4'>
						<div className='space-y-1.5'>
							<Label className='text-xs font-black uppercase ml-1 dark:text-slate-300'>
								Ism va Familiya
							</Label>
							<Input
								value={customerName}
								onChange={e => setCustomerName(e.target.value)}
								placeholder='Ali Valiyev'
								className='h-12 border-2 border-black dark:border-slate-700 font-bold focus-visible:ring-0 rounded-xl'
							/>
						</div>
						<div className='space-y-1.5'>
							<Label className='text-xs font-black uppercase ml-1 dark:text-slate-300'>
								Telefon raqam
							</Label>
							<Input
								value={customerPhone}
								onChange={e => setCustomerPhone(e.target.value)}
								placeholder='+998'
								className='h-12 border-2 border-black dark:border-slate-700 font-bold focus-visible:ring-0 rounded-xl'
							/>
						</div>
					</div>
				</section>

				{/* 02. Qabul qilish turi - Ixchamroq */}
				<section className='bg-white dark:bg-slate-900 border-[3px] border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
					<div className='flex items-center gap-2 mb-6'>
						<span className='bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md border-2 border-black'>
							02
						</span>
						<h2 className='font-black uppercase tracking-tight text-sm text-slate-500'>
							Qabul qilish
						</h2>
					</div>

					<RadioGroup
						value={orderMode}
						onValueChange={v => setOrderMode(v as OrderMode)}
						className='grid grid-cols-2 gap-3 mb-6'
					>
						<Label
							htmlFor='delivery'
							className={`flex flex-col items-center justify-center py-3 border-[3px] rounded-xl cursor-pointer transition-all ${orderMode === 'delivery' ? 'bg-red-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'}`}
						>
							<RadioGroupItem
								value='delivery'
								id='delivery'
								className='sr-only'
							/>
							<MapPin size={20} className='mb-1' />
							<span className='text-[10px] font-black uppercase'>
								Yetkazish
							</span>
						</Label>
						<Label
							htmlFor='dine-in'
							className={`flex flex-col items-center justify-center py-3 border-[3px] rounded-xl cursor-pointer transition-all ${orderMode === 'dine-in' ? 'bg-red-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'}`}
						>
							<RadioGroupItem
								value='dine-in'
								id='dine-in'
								className='sr-only'
							/>
							<Utensils size={20} className='mb-1' />
							<span className='text-[10px] font-black uppercase'>Restoran</span>
						</Label>
					</RadioGroup>

					{orderMode === 'delivery' ? (
						<div className='rounded-xl overflow-hidden border-2 border-black'>
							<LocationPicker
								onLocationSelect={addr => setDeliveryAddress(addr)}
							/>
						</div>
					) : (
						<div className='space-y-1.5 animate-in slide-in-from-top-2 duration-300'>
							<Label className='text-xs font-black uppercase ml-1 dark:text-slate-300'>
								Stol raqami
							</Label>
							<Input
								value={tableNumber}
								onChange={e => setTableNumber(e.target.value)}
								placeholder='Stol: 12'
								className='h-12 border-2 border-black font-bold rounded-xl'
							/>
						</div>
					)}
				</section>

				{/* 03. Xulosa - Eng muhim qismi */}
				<section className='bg-white dark:bg-slate-900 border-[3px] border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]'>
					<h2 className='font-black italic uppercase text-lg mb-4 border-b-4 border-black pb-2 dark:text-white'>
						Xulosa
					</h2>

					<div className='space-y-3 mb-6'>
						{items.map(item => (
							<div
								key={item.id}
								className='flex justify-between items-center text-sm border-b border-dashed border-slate-200 dark:border-slate-800 pb-2'
							>
								<span className='font-bold uppercase text-xs truncate max-w-[150px] dark:text-white'>
									{item.name}
								</span>
								<span className='font-black text-red-500'>
									<Price value={item.price * item.quantity} />
								</span>
							</div>
						))}
					</div>

					<div className='flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-black mb-6'>
						<span className='font-black uppercase text-sm italic dark:text-white'>
							Jami:
						</span>
						<Price
							value={subtotal}
							className='text-xl font-black text-red-500'
						/>
					</div>

					<Button
						onClick={handlePlaceOrder}
						disabled={isSubmitting || items.length === 0}
						className='w-full py-7 bg-red-600 hover:bg-red-700 text-white border-[3px] border-black rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all'
					>
						{isSubmitting ? (
							<Loader2 className='animate-spin' />
						) : (
							'BUYURTMA BERISH'
						)}
					</Button>
				</section>
			</div>
		</div>
	)
}
