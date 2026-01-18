'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import type { Order } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MapPin, Phone, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
	new: 'Yangi',
	preparing: 'Tayyorlanmoqda',
	ready: 'Tayyor',
	delivered: 'Yetkazildi',
}

const STATUS_COLORS: Record<string, string> = {
	new: 'bg-primary text-primary-foreground',
	preparing: 'bg-slate-900 text-white',
	ready: 'bg-red-800 text-white',
	delivered: 'bg-slate-700 text-white',
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const prevOrderIdsRef = useRef<Set<string>>(new Set())
	const [highlightedOrderIds, setHighlightedOrderIds] = useState<
		Record<string, number>
	>({})

	useEffect(() => {
		fetchOrders()

		const channel = supabase
			.channel('admin_orders_channel')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'orders' },
				() => {
					fetchOrders()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	const fetchOrders = async () => {
		const { data, error } = await supabase
			.from('orders')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			toast.error('Buyurtmalarni yuklashda xatolik')
		} else {
			const nextOrders = (data as Order[]) || []
			const prevIds = prevOrderIdsRef.current
			const nextIds = new Set(nextOrders.map(o => o.id))

			const now = Date.now()
			const newHighlights: Record<string, number> = {}
			for (const o of nextOrders) {
				if (!prevIds.has(o.id)) {
					newHighlights[o.id] = now
				}
			}

			prevOrderIdsRef.current = nextIds

			if (Object.keys(newHighlights).length > 0) {
				setHighlightedOrderIds(prev => ({ ...prev, ...newHighlights }))
				for (const id of Object.keys(newHighlights)) {
					window.setTimeout(() => {
						setHighlightedOrderIds(prev => {
							if (!(id in prev)) return prev
							const next = { ...prev }
							delete next[id]
							return next
						})
					}, 5200)
				}
			}

			setOrders(nextOrders)
		}
		setLoading(false)
	}

	const handleStatusChange = async (orderId: string, newStatus: string) => {
		const { error } = await supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', orderId)

		if (error) {
			toast.error('Xatolik yuz berdi')
		} else {
			toast('Status yangilandi', {
				className:
					'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
			})
			setOrders(prev =>
				prev.map(o =>
					o.id === orderId ? { ...o, status: newStatus as any } : o
				)
			)
		}
	}

	if (loading)
		return (
			<div className='flex flex-col items-center justify-center p-20 gap-4'>
				<Loader2 className='w-10 h-10 animate-spin text-primary' />
				<p className='text-muted-foreground animate-pulse'>Yuklanmoqda...</p>
			</div>
		)

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Buyurtmalar boshqaruvi
				</h1>
				<Badge variant='outline' className='text-lg py-1 px-4'>
					Jami: {orders.length} ta
				</Badge>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				<AnimatePresence>
					{orders.map(order => {
						const highlightStart = highlightedOrderIds[order.id]
						const isHighlighted = highlightStart ? true : false
						const grandTotal = Number(
							(order as any).grand_total ??
								(order as any).total_amount ??
								order.total ??
								0
						)

						return (
							<motion.div
								key={order.id}
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.18 }}
							>
								<Card
									className={`relative overflow-hidden border shadow-md rounded-2xl bg-card transition-all hover:shadow-xl hover:-translate-y-1 ${
										isHighlighted ? 'ring-2 ring-primary/60' : ''
									}`}
								>
									{isHighlighted && (
										<motion.div
											aria-hidden='true'
											className='pointer-events-none absolute inset-0'
											initial={{ opacity: 0.9 }}
											animate={{ opacity: [0.15, 0.6, 0.15] }}
											transition={{
												duration: 1.2,
												repeat: 4,
												ease: 'easeInOut',
											}}
											style={{
												boxShadow: 'inset 0 0 0 2px rgba(220, 38, 38, 0.45)',
											}}
										/>
									)}

									<CardHeader className='pb-3'>
										<div className='flex items-start justify-between gap-3'>
											<div className='min-w-0'>
												{/* Mijoz Ma'lumotlari */}
												<div className='flex items-center gap-2'>
													<User className='w-4 h-4 text-muted-foreground' />
													<p className='font-extrabold text-foreground truncate'>
														{order.customer_name}
													</p>
												</div>
												<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
													<Phone className='w-3.5 h-3.5' />
													<span className='truncate'>
														{order.customer_phone}
													</span>
												</div>
											</div>

											{/* Status Badge */}
											<Badge
												className={`border-none px-3 py-1 rounded-full shadow-sm ${
													STATUS_COLORS[order.status]
												}`}
											>
												{STATUS_LABELS[order.status] || order.status}
											</Badge>
										</div>
									</CardHeader>

									<CardContent className='space-y-4'>
										<div className='flex items-center justify-between'>
											{/* Jami Pul */}
											<div>
												<p className='text-[11px] uppercase tracking-wide text-muted-foreground font-medium'>
													Umumiy
												</p>
												<p className='text-lg font-extrabold text-primary'>
													<Price value={grandTotal} />
												</p>
											</div>

											<div className='text-right'>
												<p className='text-[11px] uppercase tracking-wide text-muted-foreground font-medium'>
													Turi
												</p>
												{/* Turi va Manzil */}
												{order.mode === 'dine-in' ? (
													<Badge
														variant='outline'
														className='rounded-full bg-primary/5 border-primary/20 text-primary'
													>
														Stol: {order.table_number}
													</Badge>
												) : (
													<Badge
														variant='secondary'
														className='rounded-full bg-secondary text-foreground'
													>
														Yetkazib berish
													</Badge>
												)}
											</div>
										</div>

										{order.mode !== 'dine-in' && (
											<div className='flex items-start gap-2.5 rounded-xl border border-border bg-secondary p-3'>
												<MapPin className='w-4 h-4 text-primary shrink-0 mt-0.5' />
												<p className='text-sm text-muted-foreground leading-snug'>
													{order.delivery_address || "Manzil ko'rsatilmagan"}
												</p>
											</div>
										)}

										{/* Amal (Statusni o'zgartirish) */}
										<div className='pt-2 border-t border-border flex items-center justify-between gap-3'>
											<p className='text-xs font-medium text-muted-foreground'>
												Status
											</p>
											<Select
												value={order.status}
												onValueChange={val => handleStatusChange(order.id, val)}
											>
												<SelectTrigger className='w-[170px] h-10 rounded-2xl shadow-sm'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Object.entries(STATUS_LABELS).map(([key, label]) => (
														<SelectItem key={key} value={key}>
															{label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</div>

			{orders.length === 0 && (
				<Card className='shadow-md'>
					<CardContent className='text-center py-20 text-muted-foreground'>
						Hozircha buyurtmalar mavjud emas.
					</CardContent>
				</Card>
			)}
		</div>
	)
}
