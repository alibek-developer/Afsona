'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useAuthGuard } from '@/lib/useAuth'
import {
	CheckCircle2,
	Hash,
	Loader2,
	LogOut,
	MapPin,
	Minus,
	Plus,
	Search,
	ShoppingBag,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { submitOrder } from './actions'

export default function ProfessionalCallCenter() {
	const { loading: authLoading } = useAuthGuard({
		allowRoles: ['admin', 'operator'],
	})
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
		fetchItems()
		const isDark = document.documentElement.classList.contains('dark')
		setDarkMode(isDark)
	}, [])

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [darkMode])

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
		const existing = cart.find(i => i.item.id === item.id)
		if (existing) {
			setCart(
				cart.map(i =>
					i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
				),
			)
		} else {
			setCart([...cart, { item, quantity: 1 }])
		}
	}

	const updateQuantity = (itemId: string, delta: number) => {
		setCart(
			cart
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
		setSubmitting(false)
	}

	if (authLoading || loading)
		return (
			<div className='h-screen flex items-center justify-center bg-white dark:bg-slate-950 font-sans transition-colors'>
				<Loader2 className='animate-spin text-red-500' />
			</div>
		)

	return (
		<div className='min-h-screen bg-[#F1F5F9] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-white transition-colors duration-300'>
			{/* Header */}
			<header className='bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors'>
				<div className='max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 bg-red-500 dark:bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white'>
							<ShoppingBag size={24} />
						</div>
						<div>
							<h1 className='text-xl font-black tracking-tight uppercase dark:text-white'>
								CALL-CENTER PANEL
							</h1>
							<div className='flex items-center gap-2'>
								<span className='w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse' />
								<span className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
									Online Monitoring
								</span>
							</div>
						</div>
					</div>

					<div className='flex items-center gap-4'>
						<button
							onClick={() => setDarkMode(!darkMode)}
							className='p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors'
						>
							{darkMode ? (
								<svg
									className='w-5 h-5 text-yellow-500'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm8-4a1 1 0 11-2 0 1 1 0 012 0zm0 0a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm14-4a1 1 0 11-2 0 1 1 0 012 0zM2 10a1 1 0 011 1v0a1 1 0 11-2 0v0a1 1 0 011-1zm4-4a1 1 0 110 2 1 1 0 010-2zm8 8a1 1 0 110 2 1 1 0 010-2z' />
								</svg>
							) : (
								<svg
									className='w-5 h-5 text-slate-700'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
								</svg>
							)}
						</button>

						<Button
							variant='ghost'
							onClick={handleSignOut}
							className='rounded-xl hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 font-black transition-all px-6 border border-transparent hover:border-red-100 dark:hover:border-red-900'
						>
							<LogOut className='h-5 w-5 mr-2' /> CHIQUV
						</Button>
					</div>
				</div>
			</header>

			<main className='max-w-[1800px] mx-auto p-8 gap-8 grid grid-cols-12 h-[calc(100vh-100px)]'>
				{/* LEFT: Menu Section */}
				<div className='col-span-8 flex flex-col gap-6'>
					<div className='relative group'>
						<Search
							className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors'
							size={22}
						/>
						<input
							type='text'
							placeholder='Taom yoki ichimlik qidirish...'
							className='w-full bg-white dark:bg-slate-900 border-none h-16 pl-14 pr-6 rounded-2xl shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] text-lg font-bold focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/30 outline-none transition-all dark:text-white dark:placeholder-slate-500'
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>

					<ScrollArea className='flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm dark:shadow-[0_0_30px_rgba(239,68,68,0.1)]'>
						<div className='p-8 space-y-10'>
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
											<h3 className='font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-sm'>
												{category.name}
											</h3>
											<div className='h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-4' />
										</div>
										<div className='grid grid-cols-2 xl:grid-cols-3 gap-4'>
											{catItems.map(item => (
												<button
													key={item.id}
													onClick={() => addToCart(item)}
													className='group p-6 rounded-3xl border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all text-left relative overflow-hidden active:scale-95'
												>
													<div className='relative z-10'>
														<p className='font-black text-lg text-slate-800 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors'>
															{item.name}
														</p>
														<Price
															value={item.price}
															className='text-sm font-black text-slate-400 dark:text-slate-500'
														/>
													</div>
													<div className='absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-red-500 dark:group-hover:bg-red-600 group-hover:text-white transition-all dark:text-slate-400 group-hover:dark:text-white'>
														<Plus size={24} />
													</div>
												</button>
											))}
										</div>
									</div>
								)
							})}
						</div>
					</ScrollArea>
				</div>

				{/* RIGHT: Order Form Section */}
				<div className='col-span-4 h-full'>
					<Card className='h-full border-none shadow-2xl dark:shadow-[0_0_50px_rgba(239,68,68,0.2)] shadow-slate-200/60 rounded-[3rem] flex flex-col bg-white dark:bg-slate-900 overflow-hidden transition-colors'>
						<CardHeader className='p-8 pb-4 border-b border-slate-50 dark:border-slate-800'>
							<CardTitle className='text-xl font-black flex justify-between items-center tracking-tighter dark:text-white'>
								YANGI BUYURTMA
								<span className='text-[10px] bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-full text-slate-500 font-black'>
									LIVE
								</span>
							</CardTitle>
						</CardHeader>

						<CardContent className='p-8 space-y-8 flex-1 overflow-y-auto'>
							<div className='space-y-6'>
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'>
											Mijoz
										</Label>
										<Input
											value={customerName}
											onChange={e => setCustomerName(e.target.value)}
											placeholder='Ismi'
											className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 font-black text-slate-700'
										/>
									</div>
									<div className='space-y-2'>
										<Label className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'>
											Tel
										</Label>
										<Input
											value={phone}
											onChange={e => setPhone(e.target.value)}
											placeholder='+998'
											className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 font-black text-slate-700'
										/>
									</div>
								</div>

								<div className='space-y-3'>
									<Label className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'>
										Xizmat
									</Label>
									<div className='grid grid-cols-2 gap-3'>
										<button
											onClick={() => setMode('delivery')}
											className={`h-16 rounded-[1.25rem] border-2 flex items-center justify-center gap-2 font-black transition-all ${mode === 'delivery' ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10 dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}
										>
											<MapPin size={20} /> YETKAZISH
										</button>
										<button
											onClick={() => setMode('dine-in')}
											className={`h-16 rounded-[1.25rem] border-2 flex items-center justify-center gap-2 font-black transition-all ${mode === 'dine-in' ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10 dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}
										>
											<Hash size={20} /> ZALDA
										</button>
									</div>
								</div>

								<div className='space-y-2'>
									<Label className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'>
										{mode === 'delivery' ? 'Manzil' : 'Stol'}
									</Label>
									{mode === 'delivery' ? (
										<Textarea
											value={address}
											onChange={e => setAddress(e.target.value)}
											placeholder='Manzilni batafsil yozing...'
											className='rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 min-h-[100px] font-bold text-slate-700 p-4'
										/>
									) : (
										<Input
											value={tableNumber}
											onChange={e => setTableNumber(e.target.value)}
											placeholder='Masalan: 5'
											className='h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 font-black text-slate-700'
										/>
									)}
								</div>
							</div>

							<div className='pt-6 border-t border-slate-100 dark:border-slate-800'>
								<Label className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase block mb-6 tracking-[0.2em]'>
									Savatcha
								</Label>
								<div className='space-y-4'>
									{cart.length === 0 && (
										<p className='text-center text-slate-300 dark:text-slate-600 font-bold py-4'>
											Hali taom tanlanmadi
										</p>
									)}
									{cart.map(({ item, quantity }) => (
										<div
											key={item.id}
											className='flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm'
										>
											<div className='flex-1'>
												<p className='font-black text-slate-800 dark:text-white text-sm'>
													{item.name}
												</p>
												<Price
													value={item.price * quantity}
													className='text-xs font-black text-red-500 dark:text-red-400'
												/>
											</div>
											<div className='flex items-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1.5 gap-1'>
												<button
													onClick={() => updateQuantity(item.id, -1)}
													className='p-1 hover:text-red-500 dark:hover:text-red-400 dark:text-slate-400 transition-colors'
												>
													<Minus size={16} />
												</button>
												<span className='w-10 text-center text-sm font-black dark:text-white'>
													{quantity}
												</span>
												<button
													onClick={() => addToCart(item)}
													className='p-1 hover:text-red-500 dark:hover:text-red-400 dark:text-slate-400 transition-colors'
												>
													<Plus size={16} />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardContent>

						<div className='p-8 pt-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800'>
							<div className='flex justify-between items-end mb-8 px-2'>
								<div>
									<p className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1'>
										Umumiy hisob
									</p>
									<Price
										value={calculateTotal()}
										className='text-4xl font-black text-slate-900 dark:text-white tracking-tighter'
									/>
								</div>
								<div className='text-right'>
									<span className='text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-full uppercase'>
										Tayyor
									</span>
								</div>
							</div>
							<Button
								onClick={handleSubmit}
								disabled={submitting || cart.length === 0}
								className='w-full h-20 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-red-500/30 dark:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3'
							>
								{submitting ? (
									<Loader2 className='animate-spin' size={24} />
								) : (
									<CheckCircle2 size={24} />
								)}
								BUYURTMANI YUBORISH
							</Button>
						</div>
					</Card>
				</div>
			</main>
		</div>
	)
}
