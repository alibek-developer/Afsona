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
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Hash, Loader2, MapPin, Phone, Utensils } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
	yangi: 'Yangi',
	new: 'Yangi',
	tayyorlanmoqda: 'Tayyorlanmoqda',
	preparing: 'Tayyorlanmoqda',
	yakunlandi: 'Yakunlandi',
	ready: 'Yakunlandi',
}
const STATUS_COLORS: Record<string, string> = {
	yangi: 'bg-blue-600',
	new: 'bg-blue-600',
	tayyorlanmoqda: 'bg-amber-500',
	preparing: 'bg-amber-500',
	yakunlandi: 'bg-emerald-500',
	ready: 'bg-emerald-500',
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [darkMode, setDarkMode] = useState(false)
	const prevOrderIdsRef = useRef<Set<string>>(new Set())
	const [highlightedOrderIds, setHighlightedOrderIds] = useState<
		Record<string, number>
	>({})

	useEffect(() => {
		const isDark = document.documentElement.classList.contains('dark')
		setDarkMode(isDark)
		fetchOrders()
		const channel = supabase
			.channel('sync')
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
				if (prevIds.size > 0 && !prevIds.has(o.id)) newHighlights[o.id] = now
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
		if (!error) toast.success('Status yangilandi')
	}

	if (loading)
		return (
			<div className='flex h-screen items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 transition-colors'>
				<Loader2 className='animate-spin text-red-500' size={32} />
			</div>
		)

	return (
		<div className='p-6 max-w-[1400px] mx-auto space-y-6 bg-[#F1F5F9] dark:bg-slate-950 min-h-screen transition-colors'>
			<div className='flex justify-between items-center mb-10'>
				<h1 className='text-4xl font-black uppercase tracking-tighter dark:text-white'>
					Buyurtmalar
				</h1>
				<div className='bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors'>
					<span className='text-3xl font-black dark:text-white'>
						{orders.length}
					</span>
					<Hash className='text-slate-400 dark:text-slate-600' />
				</div>
			</div>

			<div className='flex flex-col gap-4'>
				<AnimatePresence mode='popLayout'>
					{orders.map(order => (
						<motion.div
							key={order.id}
							layout
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						>
							<Card
								className={`border-none overflow-hidden bg-white dark:bg-slate-900 transition-all ${
									highlightedOrderIds[order.id]
										? 'ring-4 ring-blue-500 dark:ring-blue-600 shadow-lg dark:shadow-[0_0_25px_rgba(37,99,235,0.3)]'
										: 'shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.2)]'
								}`}
							>
								<CardContent className='p-0 flex items-stretch'>
									<div
										className={`w-2 ${STATUS_COLORS[order.status]} dark:opacity-80`}
									/>
									<div className='flex-1 flex items-center p-6 gap-8'>
										<div className='w-32'>
											<div className='flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold'>
												<Clock size={12} />{' '}
												{new Date(order.created_at).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
											<p className='font-black text-sm uppercase dark:text-white'>
												ID: {order.id.slice(-6)}
											</p>
										</div>
										<div className='w-64 border-l border-slate-200 dark:border-slate-800 pl-6'>
											<p className='font-black uppercase text-sm dark:text-white'>
												{order.customer_name}
											</p>
											<div className='flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs'>
												<Phone size={12} /> {order.phone}
											</div>
										</div>
										<div className='flex-1 border-l border-slate-200 dark:border-slate-800 pl-6'>
											<div className='flex items-center gap-2'>
												{order.type === 'dine-in' ? (
													<Utensils
														size={16}
														className='text-blue-500 dark:text-blue-400'
													/>
												) : (
													<MapPin
														size={16}
														className='text-red-500 dark:text-red-400'
													/>
												)}
												<span className='font-bold text-sm dark:text-white'>
													{order.delivery_address}
												</span>
											</div>
										</div>
										<div className='w-40 text-right border-l border-slate-200 dark:border-slate-800 px-6'>
											<p className='text-2xl font-black dark:text-white'>
												{(order.total_amount || 0).toLocaleString()}{' '}
												<span className='text-xs dark:text-slate-400'>
													so'm
												</span>
											</p>
										</div>
										<div className='w-56 border-l border-slate-200 dark:border-slate-800 pl-6'>
											<Select
												value={order.status}
												onValueChange={v => handleStatusChange(order.id, v)}
											>
												<SelectTrigger className='font-black uppercase text-[10px] bg-white dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 dark:hover:border-slate-600 transition-colors'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'>
													{Object.entries(STATUS_LABELS).map(([k, v]) => (
														<SelectItem
															key={k}
															value={k}
															className='font-bold uppercase text-xs dark:text-white dark:hover:bg-slate-800'
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
					))}
				</AnimatePresence>

				{orders.length === 0 && (
					<div className='text-center py-20'>
						<p className='text-slate-500 dark:text-slate-400 font-bold text-lg'>
							Buyurtmalar topilmadi
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
