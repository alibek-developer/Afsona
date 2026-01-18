'use client'

import { LocationPicker } from '@/components/customer/location-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MAX_DELIVERY_RADIUS_KM } from '@/lib/constants'
import { useCartStore, useOrderStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'; // Supabase clientni import qiling
import { FREE_DELIVERY_DISTANCE_KM } from '@/lib/types'
import { useMounted } from '@/lib/useMounted'
import { generateOrderId } from '@/lib/utils'
import { ArrowLeft, Check, Loader2, MapPin, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type OrderMode = 'dine-in' | 'delivery'
type PaymentMethod = 'cash' | 'card' | 'click' | 'payme'

export default function CheckoutPage() {
	const { items, updateQuantity, removeItem, getTotal, clearCart } =
		useCartStore()
	const { addOrder } = useOrderStore()
	const mounted = useMounted()

	const [orderMode, setOrderMode] = useState<OrderMode>('delivery')
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
	const [customerName, setCustomerName] = useState('')
	const [customerPhone, setCustomerPhone] = useState('')
	const [tableNumber, setTableNumber] = useState('')
	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null)
	const [deliveryTooFar, setDeliveryTooFar] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	const [orderId, setOrderId] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [subtotal, setSubtotal] = useState(0)
	const isDeliveryTooFar =
		orderMode === 'delivery' &&
		(deliveryTooFar ||
			(deliveryDistance !== null && deliveryDistance > MAX_DELIVERY_RADIUS_KM))
	const [deliveryFee, setDeliveryFee] = useState(0)
	const [total, setTotal] = useState(0)

	useEffect(() => {
		if (!mounted) return
		setSubtotal(getTotal())
	}, [getTotal, items, mounted])

	useEffect(() => {
		if (!mounted) return
		const fee =
			orderMode === 'delivery' && deliveryDistance
				? 0 // calculateDeliveryFee(deliveryDistance, subtotal) - Hozircha operator aniqlaydi
				: 0
		setDeliveryFee(fee)
		setTotal(subtotal + fee)
	}, [deliveryDistance, mounted, orderMode, subtotal])

	const handleLocationSelect = (
		address: string,
		distance: number,
		tooFar: boolean
	) => {
		setDeliveryAddress(address)
		setDeliveryDistance(distance)
		setDeliveryTooFar(tooFar)
	}

	const handlePlaceOrder = async () => {
		if (isSubmitting) return
		setIsSubmitting(true)

		const newOrderId = generateOrderId()

		const orderData = {
			customer_name: customerName,
			customer_phone: customerPhone,
			mode: orderMode,
			table_number: orderMode === 'dine-in' ? tableNumber : null,
			delivery_address: orderMode === 'delivery' ? deliveryAddress : null,
			items: items,
			total_amount: subtotal,
			delivery_fee: deliveryFee,
			grand_total: total,
			status: 'new',
			source_channel: 'website',
			// Agar bu ustunlarni bazada hali ochmagan bo'lsangiz,
			// pastdagi 2 qatorni vaqtincha izohga (comment) olib turing:
			// payment_method: paymentMethod,
			// payment_status: "pending",
		}

		try {
			const { error: supabaseError } = await supabase
				.from('orders')
				.insert([orderData])

			if (supabaseError) throw supabaseError

			setOrderId(newOrderId)
			setOrderPlaced(true)
			clearCart()
			toast('Buyurtmangiz qabul qilindi!', {
				className:
					'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
			})
		} catch (err: any) {
			console.error('Xatolik:', err.message)
			toast.error(`Xatolik: ${err.message}`)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Tugmani aktivligini tekshirish
	const isFormValid =
		customerName.trim().length > 2 &&
		customerPhone.trim().length >= 9 &&
		items.length > 0 &&
		(orderMode === 'dine-in'
			? tableNumber
			: deliveryAddress &&
			  deliveryDistance !== null &&
			  deliveryDistance <= MAX_DELIVERY_RADIUS_KM)

	if (!mounted) {
		return <div className='py-12' />
	}

	if (orderPlaced) {
		return (
			<div className='py-12'>
				<div className='max-w-md mx-auto text-center'>
					<div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6'>
						<Check className='h-10 w-10 text-primary' />
					</div>
					<h1 className='text-2xl font-bold mb-4 text-foreground'>
						Buyurtma qabul qilindi!
					</h1>
					<p className='text-muted-foreground mb-2 text-lg font-medium'>
						Raqam: <span className='text-primary'>{orderId}</span>
					</p>
					<p className='text-muted-foreground mb-8'>
						Tez orada operatorimiz siz bilan bog'lanadi.
					</p>
					<Link href='/menu'>
						<Button size='lg'>Asosiy sahifaga qaytish</Button>
					</Link>
				</div>
			</div>
		)
	}

	if (items.length === 0) {
		return (
			<div className='py-12 text-center'>
				<h1 className='text-2xl font-bold mb-4'>Savatchangiz bo'sh</h1>
				<Link href='/menu'>
					<Button>Menyuni ko'rish</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className='py-12'>
			<Link
				href='/menu'
				className='inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors'
			>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Menyuga qaytish
			</Link>

			<h1 className='text-3xl font-bold mb-8 text-foreground tracking-tight'>
				Buyurtmani rasmiylashtirish
			</h1>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-6'>
					{/* Shaxsiy ma'lumotlar */}
					<Card>
						<CardHeader>
							<CardTitle>Aloqa ma'lumotlari</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Ismingiz</Label>
								<Input
									id='name'
									placeholder='Ismingizni kiriting'
									value={customerName}
									onChange={e => setCustomerName(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='phone'>Telefon raqam</Label>
								<Input
									id='phone'
									type='tel'
									placeholder='+998'
									value={customerPhone}
									onChange={e => setCustomerPhone(e.target.value)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Buyurtma turi */}
					<Card>
						<CardHeader>
							<CardTitle>Buyurtma turi</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<RadioGroup
								value={orderMode}
								onValueChange={v => setOrderMode(v as OrderMode)}
							>
								<div
									className={`flex items-center space-x-2 p-4 rounded-lg border transition-all cursor-pointer ${
										orderMode === 'delivery'
											? 'border-primary bg-primary/5'
											: 'border-border'
									}`}
								>
									<RadioGroupItem value='delivery' id='delivery' />
									<Label htmlFor='delivery' className='flex-1 cursor-pointer'>
										<span className='font-bold'>Yetkazib berish</span>
										<p className='text-sm text-muted-foreground'>
											Ko'rsatilgan manzilingizga olib boramiz
										</p>
									</Label>
								</div>
								<div
									className={`flex items-center space-x-2 p-4 rounded-lg border transition-all cursor-pointer mt-3 ${
										orderMode === 'dine-in'
											? 'border-primary bg-primary/5'
											: 'border-border'
									}`}
								>
									<RadioGroupItem value='dine-in' id='dine-in' />
									<Label htmlFor='dine-in' className='flex-1 cursor-pointer'>
										<span className='font-bold'>Restoranda</span>
										<p className='text-sm text-muted-foreground'>
											Stolga buyurtma qilish
										</p>
									</Label>
								</div>
							</RadioGroup>

							{orderMode === 'dine-in' && (
								<div className='mt-4 animate-in fade-in slide-in-from-top-2'>
									<Label htmlFor='table'>Stol raqami</Label>
									<Input
										id='table'
										placeholder='Masalan: 5'
										value={tableNumber}
										onChange={e => setTableNumber(e.target.value)}
									/>
								</div>
							)}

							{orderMode === 'delivery' && (
								<div className='mt-4 animate-in fade-in slide-in-from-top-2'>
									<Label className='mb-2 block'>Yetkazish manzili</Label>
									<LocationPicker onLocationSelect={handleLocationSelect} />
									{deliveryAddress && (
										<div className='mt-3 p-3 bg-accent/10 border border-accent/20 rounded-lg'>
											<div className='flex items-start gap-2'>
												<MapPin className='h-4 w-4 text-primary mt-0.5' />
												<div className='flex-1'>
													<p className='text-sm font-medium text-foreground'>
														{deliveryAddress}
													</p>
													{deliveryDistance !== null && (
														<p className='text-xs text-muted-foreground mt-1'>
															Masofa: {deliveryDistance.toFixed(1)} km
															{deliveryDistance <=
																FREE_DELIVERY_DISTANCE_KM && (
																<span className='text-primary font-bold ml-2'>
																	(Bepul!)
																</span>
															)}
														</p>
													)}
													{isDeliveryTooFar && (
														<p className='text-xs font-bold text-destructive mt-1'>
															Yetkazib berish faqat {MAX_DELIVERY_RADIUS_KM} km
															gacha.
														</p>
													)}
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* To'lov usuli */}
					<Card>
						<CardHeader>
							<CardTitle>To'lov usuli</CardTitle>
						</CardHeader>
						<CardContent>
							<RadioGroup
								value={paymentMethod}
								onValueChange={v => setPaymentMethod(v as PaymentMethod)}
								className='grid grid-cols-2 gap-3'
							>
								{['cash', 'card', 'click', 'payme'].map(method => (
									<div
										key={method}
										className='flex items-center space-x-2 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer'
									>
										<RadioGroupItem value={method} id={method} />
										<Label
											htmlFor={method}
											className='uppercase font-semibold cursor-pointer'
										>
											{method}
										</Label>
									</div>
								))}
							</RadioGroup>
						</CardContent>
					</Card>
				</div>

				{/* Xulosa qismi */}
				<div className='lg:col-span-1'>
					<Card className='sticky top-24'>
						<CardHeader>
							<CardTitle>Sizning buyurtmangiz</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6'>
								{items.map(item => (
									<div key={item.id} className='flex gap-3 items-center'>
										<div className='relative w-12 h-12 rounded overflow-hidden bg-muted'>
											<Image
												src={item.image_url || '/placeholder.svg'}
												alt={item.name}
												fill
												className='object-cover'
											/>
										</div>
										<div className='flex-1 min-w-0'>
											<h4 className='font-medium text-sm truncate'>
												{item.name}
											</h4>
											<p className='text-xs text-muted-foreground'>
												{item.quantity} x <Price value={item.price} />
											</p>
										</div>
										<div className='flex items-center gap-1'>
											<Button
												variant='outline'
												size='icon'
												className='h-6 w-6'
												onClick={() =>
													updateQuantity(item.id, item.quantity - 1)
												}
											>
												<Minus className='h-3 w-3' />
											</Button>
											<Button
												variant='outline'
												size='icon'
												className='h-6 w-6'
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
											>
												<Plus className='h-3 w-3' />
											</Button>
										</div>
									</div>
								))}
							</div>

							<div className='space-y-3 border-t pt-4 text-sm'>
								<div className='flex justify-between text-muted-foreground'>
									<span>Jami taomlar:</span>
									<Price value={subtotal} />
								</div>
								{orderMode === 'delivery' && (
									<div className='flex justify-between text-muted-foreground'>
										<span>Yetkazib berish:</span>
										<span className='font-medium text-gray-500'>
											Operator aniqlaydi
										</span>
									</div>
								)}
								<div className='flex justify-between font-bold text-xl pt-2 border-t text-primary'>
									<span>Umumiy:</span>
									<Price value={total} />
								</div>
							</div>

							<Button
								className='w-full mt-6 py-6 text-lg font-black font-sans bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase'
								disabled={!isFormValid || isSubmitting || isDeliveryTooFar}
								onClick={handlePlaceOrder}
							>
								{isSubmitting ? (
									<>
										<Loader2 className='mr-2 h-5 w-5 animate-spin' />{' '}
										Yuborilmoqda...
									</>
								) : (
									'Buyurtmani tasdiqlash'
								)}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
