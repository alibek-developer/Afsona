'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useAuthGuard } from '@/lib/useAuth'
import { CheckCircle2, Loader2, LogOut, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { submitOrder } from './actions'

export default function CallCenterPage() {
	const { loading: authLoading } = useAuthGuard({
		allowRoles: ['admin', 'operator'],
	})

	const [items, setItems] = useState<MenuItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)

	// Form State
	const [customerName, setCustomerName] = useState('')
	const [phone, setPhone] = useState('')
	const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
	const [address, setAddress] = useState('')
	const [tableNumber, setTableNumber] = useState('')
	const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])

	useEffect(() => {
		fetchItems()

		const channel = supabase
			.channel('realtime:menu_items')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'menu_items' },
				() => {
					fetchItems()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	const fetchItems = async () => {
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.eq('available_on_website', true)
			.order('category')

		if (error) {
			toast.error('Menyuni yuklashda xatolik')
		} else {
			setItems(data || [])
		}
		setLoading(false)
	}

	const handleLogout = async () => {
		try {
			// Sessiyani to'liq o'chirish
			await supabase.auth.signOut()
			// Hard redirect - middleware sessiya yo'qligini tanishi uchun
			window.location.href = '/login'
		} catch (error) {
			console.error('Logout error:', error)
			// Xatolik bo'lsa ham login sahifasiga o'tish
			window.location.href = '/login'
		}
	}

	const addToCart = (item: MenuItem) => {
		const existing = cart.find(i => i.item.id === item.id)
		if (existing) {
			setCart(
				cart.map(i =>
					i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
				)
			)
		} else {
			setCart([...cart, { item, quantity: 1 }])
		}
	}

	const removeFromCart = (itemId: string) => {
		setCart(cart.filter(i => i.item.id !== itemId))
	}

	const updateQuantity = (itemId: string, delta: number) => {
		setCart(
			cart
				.map(i => {
					if (i.item.id === itemId) {
						const newQty = Math.max(0, i.quantity + delta)
						return { ...i, quantity: newQty }
					}
					return i
				})
				.filter(i => i.quantity > 0)
		)
	}

	const calculateTotal = () => {
		return cart.reduce(
			(sum, { item, quantity }) => sum + item.price * quantity,
			0
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (cart.length === 0) {
			toast.error("Savatcha bo'sh")
			return
		}
		if (!customerName || !phone) {
			toast.error("Mijoz ma'lumotlarini kiriting")
			return
		}
		if (mode === 'delivery' && !address) {
			toast.error('Manzilni kiriting')
			return
		}
		if (mode === 'dine-in' && !tableNumber) {
			toast.error('Stol raqamini kiriting')
			return
		}

		setSubmitting(true)

		const orderData = {
			customer_name: customerName,
			customer_phone: phone,
			mode,
			delivery_address: mode === 'delivery' ? address : null,
			table_number: mode === 'dine-in' ? tableNumber : null,
			items: cart,
			total: calculateTotal(),
			payment_method: 'cash', // Default
		}

		const result = await submitOrder(orderData)

		if (!result.success) {
			console.error('Order error:', result.message)
			toast.error('Buyurtma yaratishda xatolik', {
				description: result.message, // Show specific error if available
			})
		} else {
			toast('Buyurtma qabul qilindi!', {
				className:
					'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
			})
			// Reset form
			setCustomerName('')
			setPhone('')
			setAddress('')
			setTableNumber('')
			setCart([])
			setMode('delivery')
		}
		setSubmitting(false)
	}

	if (authLoading)
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loader2 className='animate-spin' />
			</div>
		)

	if (loading)
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loader2 className='animate-spin' />
			</div>
		)

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			<header className='bg-background border-b-2 border-black sticky top-0 z-10'>
				<div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
					<h1 className='font-display text-xl font-black tracking-tight'>
						Kall-markaz operatori
					</h1>
					<Button
						variant='ghost'
						onClick={handleLogout}
						className='text-primary hover:text-primary hover:bg-primary/10'
					>
						<LogOut className='h-4 w-4 mr-2' />
						Chiqish
					</Button>
				</div>
			</header>

			<main className='flex-1'>
				<div className='max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Menu Section */}
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle className='font-display font-black tracking-tight'>
									Menyu
								</CardTitle>
							</CardHeader>
							<CardContent className='p-0'>
								<ScrollArea className='h-[560px] px-6'>
									<div className='space-y-8 pb-6'>
										{CATEGORIES.map(category => {
											const catItems = items.filter(
												i => i.category === category.id
											)
											if (catItems.length === 0) return null
											return (
												<div key={category.id}>
													<h3 className='font-display font-black tracking-tight text-lg mb-4 flex items-center gap-2'>
														<span>{category.icon}</span> {category.name}
													</h3>
													<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
														{catItems.map(item => (
															<div
																key={item.id}
																className='border border-border rounded-2xl p-3 hover:bg-secondary transition-colors cursor-pointer flex justify-between items-start gap-2'
																onClick={() => addToCart(item)}
															>
																<div>
																	<p className='font-medium text-foreground'>
																		{item.name}
																	</p>
																	<Price
																		value={item.price}
																		className='text-sm text-primary font-bold'
																	/>
																</div>
																<Button
																	size='icon'
																	variant='ghost'
																	className='h-6 w-6 shrink-0'
																>
																	<Plus className='h-4 w-4' />
																</Button>
															</div>
														))}
													</div>
												</div>
											)
										})}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</div>

					{/* Order Form Section */}
					<div className='lg:col-span-1'>
						<Card className='flex flex-col'>
							<CardHeader>
								<CardTitle className='font-display font-black tracking-tight'>
									Buyurtma
								</CardTitle>
							</CardHeader>
							<CardContent className='flex-1 overflow-y-auto flex flex-col gap-6'>
								<form
									id='order-form'
									onSubmit={handleSubmit}
									className='space-y-4'
								>
									<div className='grid grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label>Mijoz ismi</Label>
											<Input
												value={customerName}
												onChange={e => setCustomerName(e.target.value)}
												required
												placeholder='Ism'
											/>
										</div>
										<div className='space-y-2'>
											<Label>Telefon</Label>
											<Input
												value={phone}
												onChange={e => setPhone(e.target.value)}
												required
												placeholder='+998...'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<Label>Xizmat turi</Label>
										<RadioGroup
											value={mode}
											onValueChange={(v: any) => setMode(v)}
											className='flex gap-4'
										>
											<div className='flex items-center space-x-2'>
												<RadioGroupItem value='delivery' id='r1' />
												<Label htmlFor='r1'>Yetkazib berish</Label>
											</div>
											<div className='flex items-center space-x-2'>
												<RadioGroupItem value='dine-in' id='r2' />
												<Label htmlFor='r2'>Zalda</Label>
											</div>
										</RadioGroup>
									</div>

									{mode === 'delivery' ? (
										<div className='space-y-2'>
											<Label>Manzil</Label>
											<Textarea
												value={address}
												onChange={e => setAddress(e.target.value)}
												placeholder='Mijoz manzili...'
											/>
										</div>
									) : (
										<div className='space-y-2'>
											<Label>Stol raqami</Label>
											<Input
												value={tableNumber}
												onChange={e => setTableNumber(e.target.value)}
												placeholder='Masalan: 5'
											/>
										</div>
									)}
								</form>

								<div className='flex-1 mt-4'>
									<h4 className='font-medium mb-2'>Tanlangan taomlar</h4>
									{cart.length === 0 ? (
										<p className='text-sm text-muted-foreground text-center py-4'>
											Savatcha bo'sh
										</p>
									) : (
										<div className='space-y-2'>
											{cart.map(({ item, quantity }) => (
												<div
													key={item.id}
													className='flex items-center justify-between text-sm bg-muted/30 p-2 rounded'
												>
													<div className='flex-1'>
														<p className='font-medium'>{item.name}</p>
														<p className='text-xs text-muted-foreground'>
															<Price value={item.price} /> x {quantity}
														</p>
													</div>
													<div className='flex items-center gap-2'>
														<Button
															size='icon'
															variant='outline'
															className='h-6 w-6'
															onClick={() => updateQuantity(item.id, -1)}
														>
															<Minus className='h-3 w-3' />
														</Button>
														<span className='w-4 text-center'>{quantity}</span>
														<Button
															size='icon'
															variant='outline'
															className='h-6 w-6'
															onClick={() => updateQuantity(item.id, 1)}
														>
															<Plus className='h-3 w-3' />
														</Button>
													</div>
													<p className='font-medium w-20 text-right'>
														<Price value={item.price * quantity} />
													</p>
												</div>
											))}
										</div>
									)}
								</div>
							</CardContent>
							<div className='p-6 border-t border-border pt-4'>
								<Button
									form='order-form'
									type='submit'
									className='w-full font-black bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase'
									size='lg'
									disabled={submitting || cart.length === 0}
								>
									{submitting ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Yuborilmoqda...
										</>
									) : (
										<CheckCircle2 className='mr-2' />
									)}
									Buyurtmani tasdiqlash
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
