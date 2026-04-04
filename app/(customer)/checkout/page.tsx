'use client'

import {
	createWebsiteOrder,
	getCheckoutTotals,
	type ResolvedOrderItem,
} from '@/app/(customer)/checkout/actions'
import { LocationPicker } from '@/components/customer/location-picker'
import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { useCartStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import { useMounted } from '@/lib/useMounted'
import {
	ArrowLeft,
	Check,
	Loader2,
	Map,
	MapPin,
	ShoppingBag,
	User,
	Utensils,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type OrderMode = 'dine-in' | 'delivery'

export default function CheckoutPage() {
	const { items, clearCart } = useCartStore()
	const mounted = useMounted()

	const [orderMode, setOrderMode] = useState<OrderMode>('delivery')
	const [customerName, setCustomerName] = useState('')
	const [customerPhone, setCustomerPhone] = useState('+998')
	const [tableNumber, setTableNumber] = useState('')
	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	const [latitude, setLatitude] = useState<number | null>(null)
	const [longitude, setLongitude] = useState<number | null>(null)

	const [quoteLoading, setQuoteLoading] = useState(false)
	const [quoteLines, setQuoteLines] = useState<ResolvedOrderItem[] | null>(
		null,
	)
	const [serverTotal, setServerTotal] = useState<number | null>(null)
	const [quoteError, setQuoteError] = useState<string | null>(null)

	const cartSignature = useMemo(
		() => items.map(i => `${i.id}:${i.quantity}`).sort().join('|'),
		[items],
	)

	const linePayload = useMemo(
		() => items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
		[items],
	)

	const idempotencyRef = useRef<string | null>(null)
	const prevCartSigRef = useRef<string>('')

	useEffect(() => {
		if (prevCartSigRef.current !== cartSignature) {
			prevCartSigRef.current = cartSignature
			idempotencyRef.current = null
		}
	}, [cartSignature])

	const getIdempotencyKey = () => {
		if (!cartSignature) return ''
		if (!idempotencyRef.current) {
			idempotencyRef.current = crypto.randomUUID()
		}
		return idempotencyRef.current
	}

	useEffect(() => {
		if (!mounted || items.length === 0) {
			setQuoteLines(null)
			setServerTotal(null)
			setQuoteLoading(false)
			setQuoteError(null)
			return
		}

		let cancelled = false
		setQuoteLoading(true)
		setQuoteError(null)

		getCheckoutTotals(linePayload)
			.then(result => {
				if (cancelled) return
				if (result.ok) {
					setQuoteLines(result.resolved)
					setServerTotal(result.total)
					setQuoteError(null)
				} else {
					setQuoteLines(null)
					setServerTotal(null)
					setQuoteError(result.message)
					toast.error(result.message)
				}
			})
			.catch(err => {
				if (cancelled) return
				const message =
					err instanceof Error ? err.message : "Narxni yuklab bo'lmadi"
				setQuoteLines(null)
				setServerTotal(null)
				setQuoteError(message)
				toast.error(message)
			})
			.finally(() => {
				if (!cancelled) setQuoteLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [mounted, cartSignature, linePayload, items.length])

	const handlePhoneChange = (val: string) => {
		if (!val.startsWith('+998')) {
			setCustomerPhone('+998')
			return
		}
		if (val.length <= 13 && /^\+998[0-9]*$/.test(val)) {
			setCustomerPhone(val)
		}
	}

	const handleLocationSelect = (
		address: string,
		distance: number,
		tooFar: boolean,
		lat?: number,
		lng?: number,
	) => {
		setDeliveryAddress(address)
		if (lat !== undefined && lng !== undefined) {
			setLatitude(lat)
			setLongitude(lng)
		} else {
			setLatitude(null)
			setLongitude(null)
		}
	}

	const validateFields = () => {
		if (!customerName.trim() || customerPhone.trim().length !== 13) {
			toast.error("Iltimos, ismingizni va telefon raqamingizni to'liq kiriting")
			return false
		}
		if (orderMode === 'dine-in' && !tableNumber) {
			toast.error('Stol raqamini kiriting')
			return false
		}
		if (orderMode === 'delivery') {
			if (latitude === null || longitude === null) {
				toast.error(
					'Yetkazib berish manzilini aniqlash uchun joylashuvni aniqlang',
				)
				return false
			}
		}
		return true
	}

	const buildOrderBase = () => ({
		idempotencyKey: getIdempotencyKey(),
		lines: linePayload,
		customer_name: customerName.trim(),
		phone: customerPhone.trim(),
		delivery_address:
			orderMode === 'delivery' ? deliveryAddress : `Stol: ${tableNumber}`,
		type: orderMode,
		latitude: orderMode === 'delivery' ? latitude : null,
		longitude: orderMode === 'delivery' ? longitude : null,
	})

	const redirectToPayment = async (
		payment_method: 'click' | 'payme',
		orderId: string,
		amount: number,
	) => {
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
		const returnUrl = `${siteUrl}/payment-success?order_id=${orderId}`

		const functionUrl =
			payment_method === 'click'
				? process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_CREATE_PAYMENT
				: process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_CREATE_PAYME_PAYMENT

		if (!functionUrl) {
			toast.error(
				"To'lov tizimi sozlanmagan. Iltimos, administratorga murojaat qiling.",
			)
			return false
		}

		const response = await fetch(functionUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				order_id: orderId,
				amount,
				return_url: returnUrl,
			}),
		})

		const result = await response.json()

		if (!response.ok || !result.success || !result.payment_url) {
			throw new Error(result.error || "To'lov yaratishda xatolik yuz berdi")
		}

		clearCart()
		window.location.href = result.payment_url
		return true
	}

	const handlePayWithPayme = async () => {
		if (isSubmitting || !validateFields() || items.length === 0) return
		if (!getIdempotencyKey()) return
		if (serverTotal === null || quoteLoading) {
			toast.error('Narxlar hali tayyor emas, biroz kuting')
			return
		}

		setIsSubmitting(true)
		try {
			const created = await createWebsiteOrder({
				...buildOrderBase(),
				payment_method: 'payme',
			})

			if (!created.ok) {
				toast.error(created.message)
				return
			}

			await redirectToPayment(
				'payme',
				created.orderId,
				created.total_amount,
			)
		} catch (err) {
			console.error('Payme payment error:', err)
			toast.error(
				err instanceof Error
					? err.message
					: 'Xatolik yuz berdi, qaytadan urinib koʻring',
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handlePayWithClick = async () => {
		if (isSubmitting || !validateFields() || items.length === 0) return
		if (!getIdempotencyKey()) return
		if (serverTotal === null || quoteLoading) {
			toast.error('Narxlar hali tayyor emas, biroz kuting')
			return
		}

		setIsSubmitting(true)
		try {
			const created = await createWebsiteOrder({
				...buildOrderBase(),
				payment_method: 'click',
			})

			if (!created.ok) {
				toast.error(created.message)
				return
			}

			await redirectToPayment(
				'click',
				created.orderId,
				created.total_amount,
			)
		} catch (err) {
			console.error('Click payment error:', err)
			toast.error(
				err instanceof Error
					? err.message
					: 'Xatolik yuz berdi, qaytadan urinib koʻring',
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!mounted) return null

	if (orderPlaced)
		return (
			<div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080B12] p-6'>
				<div className='w-20 h-20 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20'>
					<Check size={40} strokeWidth={3} />
				</div>
				<h1 className='text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter'>
					Rahmat!
				</h1>
				<p className='text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8 font-medium'>
					Buyurtmangiz muvaffaqiyatli qabul qilindi.
				</p>
				<Link href='/menu'>
					<Button className='bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-red-600/20 text-white uppercase italic'>
						Menyuga qaytish
					</Button>
				</Link>
			</div>
		)

	const displayLines: ResolvedOrderItem[] | null = quoteLines

	return (
		<div className='bg-white dark:bg-[#080B12] min-h-screen transition-colors duration-300'>
			<div className='max-w-6xl mx-auto px-6 py-10'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
					<div className='flex items-center gap-5'>
						<Link
							href='/menu'
							className='w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 transition-all shadow-sm'
						>
							<ArrowLeft
								size={22}
								className='text-slate-600 dark:text-slate-300'
							/>
						</Link>
						<div>
							<h1 className='text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none'>
								Checkout
							</h1>
							<p className='text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest'>
								Buyurtmani rasmiylashtirish
							</p>
						</div>
					</div>
					<div className='inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-slate-800'>
						<ShoppingBag size={18} className='text-red-600' />
						<span className='font-black text-sm text-slate-700 dark:text-slate-200 uppercase'>
							{items.length} ta mahsulot
						</span>
					</div>
				</div>
			</div>

			<main className='max-w-6xl mx-auto px-6 pb-24'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
					<div className='lg:col-span-7 space-y-10'>
						<div className='relative'>
							<div className='absolute -left-3 top-0 bottom-0 w-1 bg-red-600 rounded-full hidden md:block' />
							<section className='mb-12'>
								<div className='flex items-center gap-3 mb-8'>
									<div className='p-2 bg-red-600/10 rounded-lg text-red-600'>
										<User size={20} strokeWidth={2.5} />
									</div>
									<h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>
										Mijoz ma'lumotlari
									</h2>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div className='space-y-2'>
										<label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>
											Ism va Familiya
										</label>
										<input
											type='text'
											value={customerName}
											onChange={e => setCustomerName(e.target.value)}
											placeholder='Ali Valiyev'
											className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-14 px-5 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all dark:text-white text-slate-900 font-bold'
										/>
									</div>
									<div className='space-y-2'>
										<label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>
											Telefon raqam
										</label>
										<input
											type='tel'
											value={customerPhone}
											onChange={e => handlePhoneChange(e.target.value)}
											className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-14 px-5 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all dark:text-white text-slate-900 font-bold'
										/>
									</div>
								</div>
							</section>

							<section>
								<div className='flex items-center gap-3 mb-8'>
									<div className='p-2 bg-red-600/10 rounded-lg text-red-600'>
										<Map size={20} strokeWidth={2.5} />
									</div>
									<h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>
										Qabul qilish usuli
									</h2>
								</div>

								<div className='flex p-1.5 bg-slate-100 dark:bg-[#0F1420] rounded-[22px] border border-slate-200 dark:border-slate-800 mb-8'>
									<button
										onClick={() => setOrderMode('delivery')}
										className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-[16px] font-black text-xs transition-all duration-300 ${orderMode === 'delivery' ? 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-sm dark:shadow-red-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
									>
										<MapPin size={16} /> YETKAZIB BERISH
									</button>
									<button
										onClick={() => setOrderMode('dine-in')}
										className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-[16px] font-black text-xs transition-all duration-300 ${orderMode === 'dine-in' ? 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-sm dark:shadow-red-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
									>
										<Utensils size={16} /> RESTORANDA
									</button>
								</div>

								{orderMode === 'delivery' ? (
									<div className='rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-[#0F1420]'>
										<LocationPicker onLocationSelect={handleLocationSelect} />
									</div>
								) : (
									<div className='animate-in fade-in slide-in-from-top-4 duration-500'>
										<label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block ml-1'>
											Stol raqami
										</label>
										<input
											type='number'
											value={tableNumber}
											onChange={e => setTableNumber(e.target.value)}
											placeholder='7'
											className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-16 px-6 rounded-2xl outline-none focus:border-red-600 transition-all dark:text-white text-slate-900 font-black text-2xl'
										/>
									</div>
								)}
							</section>
						</div>
					</div>

					<div className='lg:col-span-5'>
						<div className='bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 sticky top-10 shadow-2xl dark:shadow-none'>
							<div className='flex items-center justify-between mb-10'>
								<h2 className='text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none'>
									SIZNING BUYURTMANGIZ
								</h2>
								<div className='h-1 w-12 bg-red-600 rounded-full' />
							</div>

							<p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4'>
								Narxlar serverda tekshiriladi
							</p>

							<div className='space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar'>
								{quoteLoading && (
									<div className='flex items-center gap-2 text-slate-500 text-sm font-bold'>
										<Loader2 className='w-5 h-5 animate-spin text-red-500' />
										Narxlar yuklanmoqda...
									</div>
								)}
								{displayLines &&
									displayLines.map(line => (
										<div
											key={line.id}
											className='flex justify-between items-center group'
										>
											<div className='flex items-center gap-4'>
												<div className='w-14 h-14 bg-white dark:bg-[#080B12] rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800'>
													<span className='font-black text-red-600 text-sm'>
														x{line.quantity}
													</span>
												</div>
												<div>
													<p className='text-sm font-black text-slate-800 dark:text-white uppercase leading-tight'>
														{line.name}
													</p>
													<p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider'>
														<Price value={line.price} />
													</p>
												</div>
											</div>
											<p className='text-sm font-black text-slate-900 dark:text-slate-100'>
												<Price value={line.price * line.quantity} />
											</p>
										</div>
									))}
								{!quoteLoading && !displayLines && items.length > 0 && (
									<div className='rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 space-y-2'>
										<p className='text-sm text-red-700 dark:text-red-400 font-bold'>
											Narxni yuklab bo&apos;lmadi
										</p>
										{quoteError && (
											<p className='text-xs text-red-600/90 dark:text-red-300/90 font-mono break-words'>
												{quoteError}
											</p>
										)}
										<p className='text-xs text-slate-600 dark:text-slate-400'>
											Eslatma: narxlar Next.js server action orqali keladi (alohida API
											URL emas). Agar xato &quot;permission&quot; yoki &quot;RLS&quot;
											bo&apos;lsa, Supabase da{' '}
											<code className='text-[10px] bg-white/50 dark:bg-black/30 px-1 rounded'>
												menu_items
											</code>{' '}
											uchun anon SELECT siyosatini tekshiring.
										</p>
									</div>
								)}
							</div>

							<div className='pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6'>
								<div className='flex justify-between items-end'>
									<div className='space-y-1'>
										<span className='block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]'>
											Jami to'lov:
										</span>
										{quoteLoading || serverTotal === null ? (
											<div className='flex items-center gap-2 h-10'>
												<Loader2 className='w-8 h-8 animate-spin text-red-500' />
											</div>
										) : (
											<Price
												value={serverTotal}
												className='text-3xl font-black text-red-600 tracking-tighter block'
											/>
										)}
									</div>
								</div>

								<div className='flex flex-col gap-3'>
									<button
										onClick={handlePayWithPayme}
										disabled={
											isSubmitting ||
											items.length === 0 ||
											quoteLoading ||
											serverTotal === null
										}
										className='w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-base rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.96] flex items-center justify-center gap-3 uppercase tracking-tight'
									>
										{isSubmitting ? (
											<Loader2 className='animate-spin' />
										) : (
											<>
												Payme bilan to&apos;lov{' '}
												<Check size={20} strokeWidth={3} />
											</>
										)}
									</button>
									<button
										onClick={handlePayWithClick}
										disabled={
											isSubmitting ||
											items.length === 0 ||
											quoteLoading ||
											serverTotal === null
										}
										className='w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-sm rounded-2xl transition-all shadow-lg active:scale-[0.96] flex items-center justify-center gap-2 uppercase tracking-tight'
									>
										Click bilan to&apos;lov
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
