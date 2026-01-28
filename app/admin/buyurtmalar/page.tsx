'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils' // Muhim import
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Clock, Loader2, MapPin, Phone, Utensils } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
	yangi: 'Yangi',
	new: 'Yangi',
	tayyorlanmoqda: 'Jarayonda',
	preparing: 'Jarayonda',
	ready: 'Tayyor',
	yakunlandi: 'Tayyor',
}

const STATUS_COLORS: Record<string, string> = {
	yangi: 'bg-blue-600',
	new: 'bg-blue-600',
	tayyorlanmoqda: 'bg-amber-500',
	preparing: 'bg-amber-500',
	ready: 'bg-emerald-500',
	yakunlandi: 'bg-emerald-500',
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const prevOrderIdsRef = useRef<Set<string>>(new Set())
	const [highlightedOrderIds, setHighlightedOrderIds] = useState<
		Record<string, number>
	>({})

	useEffect(() => {
		fetchOrders()
		const channel = supabase
			.channel('sync_orders')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'orders' },
				() => fetchOrders(),
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	const fetchOrders = async () => {
		const { data, error } = await supabase
			.from('orders')
			.select(
				'id, created_at, customer_name, phone, type, delivery_address, items, total_amount, status',
			)
			.order('created_at', { ascending: false })

		if (!error) {
			const nextOrders = data || []
			const prevIds = prevOrderIdsRef.current
			const now = Date.now()
			const newHighlights: Record<string, number> = {}

			nextOrders.forEach(o => {
				if (prevIds.size > 0 && !prevIds.has(o.id)) {
					newHighlights[o.id] = now
					// Yangi buyurtma kelganda ovozli xabar berish mumkin
				}
			})

			prevOrderIdsRef.current = new Set(nextOrders.map(o => o.id))
			setHighlightedOrderIds(prev => ({ ...prev, ...newHighlights }))
			setOrders(nextOrders)
		}
		setLoading(false)
	}

	const handleStatusChange = async (id: string, status: string) => {
		const { error } = await supabase
			.from('orders')
			.update({ status })
			.eq('id', id)

		if (!error) {
			toast.success('Status yangilandi', {
				className: 'font-black uppercase text-[10px] tracking-widest',
			})
		}
	}

	if (loading) {
		return (
			<div className='flex h-[60vh] items-center justify-center'>
				<Loader2
					className='animate-spin text-red-600'
					size={40}
					strokeWidth={3}
				/>
			</div>
		)
	}

	return (
		<div className='space-y-10 transition-colors pb-20'>
			{/* Header */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white'>
						Faol <span className='text-red-600'>Buyurtmalar</span>
					</h1>
					<p className='text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]'>
						Barcha buyurtmalarni boshqarish
					</p>
				</div>

				<div className='bg-white dark:bg-slate-900 px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] flex items-center gap-4 transition-all'>
					<div className='flex flex-col items-end'>
						<span className='text-[10px] font-black text-slate-400 uppercase tracking-tighter'>
							Jami
						</span>
						<span className='text-2xl font-black dark:text-white leading-none'>
							{orders.length}
						</span>
					</div>
					<div className='w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center'>
						<Box size={20} className='text-slate-600 dark:text-slate-400' />
					</div>
				</div>
			</div>

			{/* Orders List */}
			<div className='grid gap-4'>
				<AnimatePresence mode='popLayout'>
					{orders.map(order => {
						const isNew = !!highlightedOrderIds[order.id]

						return (
							<motion.div
								key={order.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							>
								<Card
									className={cn(
										'border-2 overflow-hidden bg-white dark:bg-slate-900 transition-all duration-500 rounded-[2rem]',
										isNew
											? 'border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,0.2)]'
											: 'border-slate-100 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.03)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]',
									)}
								>
									<CardContent className='p-0 flex flex-col md:flex-row items-stretch'>
										{/* Status Indicator */}
										<div
											className={cn(
												'w-full md:w-3 h-3 md:h-auto transition-colors',
												STATUS_COLORS[order.status],
											)}
										/>

										<div className='flex-1 flex flex-wrap items-center p-6 md:p-8 gap-6 md:gap-10'>
											{/* Order Info */}
											<div className='min-w-[120px]'>
												<div className='flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase mb-1'>
													<Clock size={12} strokeWidth={3} />
													{new Date(order.created_at).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
												<p className='font-black text-sm uppercase tracking-tighter dark:text-white'>
													#{order.id.slice(-6)}
												</p>
											</div>

											{/* Customer Info */}
											<div className='min-w-[180px] md:border-l border-slate-100 dark:border-slate-800 md:pl-8'>
												<p className='font-black uppercase text-sm dark:text-white mb-1 tracking-tight'>
													{order.customer_name}
												</p>
												<div className='flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold'>
													<Phone size={12} className='text-red-500' />{' '}
													{order.phone}
												</div>
											</div>

											{/* Delivery/Type */}
											<div className='flex-1 md:border-l border-slate-100 dark:border-slate-800 md:pl-8'>
												<div className='flex items-center gap-3'>
													<div
														className={cn(
															'p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50',
															order.type === 'dine-in'
																? 'text-blue-600'
																: 'text-orange-600',
														)}
													>
														{order.type === 'dine-in' ? (
															<Utensils size={18} />
														) : (
															<MapPin size={18} />
														)}
													</div>
													<p className='font-bold text-sm dark:text-white line-clamp-1'>
														{order.delivery_address || 'Olib ketish'}
													</p>
												</div>
											</div>

											{/* Amount */}
											<div className='md:border-l border-slate-100 dark:border-slate-800 md:pl-8 text-right'>
												<p className='text-2xl font-black dark:text-white tracking-tighter'>
													{(order.total_amount || 0).toLocaleString()}
													<span className='text-[10px] ml-1 text-slate-400 uppercase'>
														so'm
													</span>
												</p>
											</div>

											{/* Status Action */}
											<div className='w-full md:w-48 md:ml-auto'>
												<Select
													value={order.status}
													onValueChange={v => handleStatusChange(order.id, v)}
												>
													<SelectTrigger className='h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-black uppercase text-[10px] tracking-widest bg-slate-50 dark:bg-slate-800/50 dark:text-white'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent className='bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl'>
														{Object.entries(STATUS_LABELS).map(([k, v]) => (
															<SelectItem
																key={k}
																value={k}
																className='font-black uppercase text-[10px] tracking-widest p-3 focus:bg-red-50 dark:focus:bg-red-900/20'
															>
																{v}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>

				{orders.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800'
					>
						<Box
							size={48}
							className='mx-auto text-slate-300 mb-4'
							strokeWidth={1}
						/>
						<p className='text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm'>
							Hozircha buyurtmalar yo'q
						</p>
					</motion.div>
				)}
			</div>
		</div>
	)
}
