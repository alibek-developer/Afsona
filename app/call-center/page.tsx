'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Price } from '@/components/ui/price'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useAuthGuard } from '@/lib/useAuth'
import { cn } from '@/lib/utils'
import {
	Loader2,
	LogOut,
	Minus,
	Moon,
	Plus,
	Search,
	ShoppingBag,
	Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { submitOrder } from './actions'

export default function ProfessionalCallCenter() {
	const { loading: authLoading } = useAuthGuard({
		allowRoles: ['admin', 'operator'],
	})

	// State-lar
	const [items, setItems] = useState<MenuItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [darkMode, setDarkMode] = useState(false)

	const [customerName, setCustomerName] = useState('')
	const [phone, setPhone] = useState('')
	const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
	const [address, setAddress] = useState('')
	const [tableNumber, setTableNumber] = useState('')
	const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		const isDark =
			savedTheme === 'dark' ||
			(!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
		setDarkMode(isDark)
	}, [])

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		}
	}, [darkMode])

	useEffect(() => {
		fetchItems()
	}, [])

	const fetchItems = async () => {
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.or('available_on_website.eq.true,is_active.eq.true')
			.order('category')
		if (!error) setItems(data || [])
		setLoading(false)
	}

	const handleSignOut = async () => {
		try {
			const { error } = await supabase.auth.signOut()
			if (error) throw error
			toast.success('Tizimdan chiqildi')
			window.location.href = '/login'
		} catch (error: any) {
			toast.error('Xatolik: ' + error.message)
		}
	}

	const addToCart = (item: MenuItem) => {
		setCart(prev => {
			const existing = prev.find(i => i.item.id === item.id)
			if (existing) {
				return prev.map(i =>
					i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
				)
			}
			return [...prev, { item, quantity: 1 }]
		})
	}

	const updateQuantity = (itemId: string, delta: number) => {
		setCart(prev =>
			prev
				.map(i =>
					i.item.id === itemId
						? { ...i, quantity: Math.max(0, i.quantity + delta) }
						: i,
				)
				.filter(i => i.quantity > 0),
		)
	}

	const calculateTotal = () =>
		cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)

	const handleSubmit = async () => {
		if (cart.length === 0) return toast.error("Savatcha bo'sh")
		if (!customerName || !phone)
			return toast.error("Mijoz ma'lumotlarini kiriting")

		setSubmitting(true)
		const orderData = {
			customer_name: customerName,
			phone: phone,
			mode,
			delivery_address: mode === 'delivery' ? address : null,
			table_number: mode === 'dine-in' ? tableNumber : null,
			items: cart,
			total_amount: calculateTotal(),
			payment_method: 'cash',
		}

		try {
			const result = await submitOrder(orderData)
			if (result.success) {
				toast.success('Buyurtma qabul qilindi!')
				setCustomerName('')
				setPhone('')
				setAddress('')
				setTableNumber('')
				setCart([])
			} else {
				toast.error('Xatolik: ' + (result.message || 'Nomaʼlum xatolik'))
			}
		} catch (e) {
			toast.error('Tizimda xatolik yuz berdi')
		} finally {
			setSubmitting(false)
		}
	}

	if (authLoading || loading)
		return (
			<div className='h-screen flex items-center justify-center bg-white dark:bg-slate-950'>
				<Loader2 className='animate-spin text-red-500' size={40} />
			</div>
		)

	return (
		<div className='min-h-screen bg-[#F1F5F9] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-white'>
			<header className='bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50'>
				<div className='max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white'>
							<ShoppingBag size={24} />
						</div>
						<h1 className='text-xl font-black uppercase'>CALL-CENTER PANEL</h1>
					</div>
					<div className='flex items-center gap-4'>
						<button
							onClick={() => setDarkMode(!darkMode)}
							className='p-2.5 rounded-lg border border-slate-300 dark:border-slate-700'
						>
							{darkMode ? <Sun className='text-yellow-500' /> : <Moon />}
						</button>
						<Button
							variant='ghost'
							onClick={handleSignOut}
							className='font-black'
						>
							<LogOut className='mr-2' /> CHIQUV
						</Button>
					</div>
				</div>
			</header>

			{/* h-full va overflow-hidden olib tashlandi */}
			<main className='max-w-[1800px] mx-auto p-8 grid grid-cols-12 gap-8'>
				{/* LEFT: Menu Section - ScrollArea o'rniga h-fit div ishlatildi */}
				<div className='col-span-8 space-y-6 h-fit'>
					<div className='relative'>
						<Search
							className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400'
							size={22}
						/>
						<input
							type='text'
							placeholder='Taom qidirish...'
							className='w-full bg-white dark:bg-slate-900 h-16 pl-14 pr-6 rounded-2xl shadow-sm outline-none font-bold'
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-10'>
						{CATEGORIES.map(category => {
							const catItems = items.filter(
								i =>
									i.category.toUpperCase() === category.id.toUpperCase() &&
									i.name.toLowerCase().includes(searchTerm.toLowerCase()),
							)
							if (catItems.length === 0) return null
							return (
								<div key={category.id}>
									<div className='flex items-center gap-3 mb-6'>
										<span className='text-2xl'>{category.icon}</span>
										<h3 className='font-black uppercase tracking-widest text-sm'>
											{category.name}
										</h3>
										<div className='h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-4' />
									</div>
									<div className='grid grid-cols-2 xl:grid-cols-3 gap-4'>
										{catItems.map(item => (
											<button
												key={item.id}
												onClick={() => addToCart(item)}
												className='p-6 rounded-3xl border bg-white dark:bg-slate-800 hover:border-red-500 transition-all text-left relative'
											>
												<p className='font-black text-lg'>{item.name}</p>
												<Price
													value={item.price}
													className='text-sm text-slate-400 font-black'
												/>
												<div className='absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all'>
													<Plus size={20} />
												</div>
											</button>
										))}
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* RIGHT: Order Form - Sticky qilindi */}
				<div className='col-span-4'>
					<div className='sticky top-28 h-fit'>
						<Card className='border-none shadow-2xl rounded-[3rem] flex flex-col bg-white dark:bg-slate-900'>
							<CardHeader className='p-8 pb-4 border-b dark:border-slate-800'>
								<CardTitle className='text-xl font-black flex justify-between'>
									YANGI BUYURTMA{' '}
									<span className='text-[10px] bg-red-100 text-red-500 px-3 py-1 rounded-full'>
										LIVE
									</span>
								</CardTitle>
							</CardHeader>

							<CardContent className='p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar'>
								<div className='grid grid-cols-2 gap-4'>
									<Input
										value={customerName}
										onChange={e => setCustomerName(e.target.value)}
										placeholder='Ismi'
										className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold'
									/>
									<Input
										value={phone}
										onChange={e => setPhone(e.target.value)}
										placeholder='+998'
										className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold'
									/>
								</div>

								<div className='grid grid-cols-2 gap-3'>
									<button
										onClick={() => setMode('delivery')}
										className={cn(
											'h-14 rounded-2xl border-2 font-black transition-all',
											mode === 'delivery'
												? 'border-red-500 bg-red-50 text-red-600'
												: 'border-slate-50 bg-slate-50 text-slate-400',
										)}
									>
										YETKAZISH
									</button>
									<button
										onClick={() => setMode('dine-in')}
										className={cn(
											'h-14 rounded-2xl border-2 font-black transition-all',
											mode === 'dine-in'
												? 'border-red-500 bg-red-50 text-red-600'
												: 'border-slate-50 bg-slate-50 text-slate-400',
										)}
									>
										ZALDA
									</button>
								</div>

								{mode === 'delivery' ? (
									<Textarea
										value={address}
										onChange={e => setAddress(e.target.value)}
										placeholder='Manzil...'
										className='rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold p-4'
									/>
								) : (
									<Input
										value={tableNumber}
										onChange={e => setTableNumber(e.target.value)}
										placeholder='Stol raqami'
										className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold'
									/>
								)}

								<div className='space-y-3 pt-4 border-t dark:border-slate-800'>
									{cart.map(({ item, quantity }) => (
										<div
											key={item.id}
											className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl'
										>
											<div className='flex-1'>
												<p className='font-black text-sm'>{item.name}</p>
												<Price
													value={item.price * quantity}
													className='text-xs text-red-500 font-bold'
												/>
											</div>
											<div className='flex items-center bg-white dark:bg-slate-700 rounded-lg p-1 gap-2'>
												<button onClick={() => updateQuantity(item.id, -1)}>
													<Minus size={14} />
												</button>
												<span className='font-black text-sm'>{quantity}</span>
												<button onClick={() => addToCart(item)}>
													<Plus size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
							</CardContent>

							<div className='p-8 pt-4 border-t dark:border-slate-800'>
								<div className='flex justify-between items-end mb-6'>
									<div>
										<p className='text-[10px] font-black text-slate-400 uppercase'>
											Umumiy
										</p>
										<Price
											value={calculateTotal()}
											className='text-3xl font-black'
										/>
									</div>
								</div>
								<Button
									onClick={handleSubmit}
									disabled={submitting || cart.length === 0}
									className='w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black'
								>
									{submitting ? (
										<Loader2 className='animate-spin' />
									) : (
										'TASDIQLASH'
									)}
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
