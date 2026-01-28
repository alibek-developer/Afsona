'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	Loader2,
	MapPin,
	Package,
	Phone,
	User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Statuslar uchun ranglar xaritasi - Har ikki rejimga moslashtirildi
const STATUS_MAP = {
	yangi: {
		label: 'Yangi',
		color: 'text-blue-600 dark:text-blue-400',
		bg: 'bg-blue-50 dark:bg-blue-500/10',
		border: 'border-blue-200 dark:border-blue-500/20',
	},
	tayyorlanmoqda: {
		label: 'Jarayonda',
		color: 'text-amber-600 dark:text-amber-400',
		bg: 'bg-amber-50 dark:bg-amber-500/10',
		border: 'border-amber-200 dark:border-amber-500/20',
	},
	ready: {
		label: 'Tayyor',
		color: 'text-emerald-600 dark:text-emerald-400',
		bg: 'bg-emerald-50 dark:bg-emerald-500/10',
		border: 'border-emerald-200 dark:border-emerald-500/20',
	},
	yakunlandi: {
		label: 'Tugadi',
		color: 'text-slate-500 dark:text-slate-400',
		bg: 'bg-slate-50 dark:bg-slate-500/10',
		border: 'border-slate-200 dark:border-slate-500/20',
	},
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split('T')[0],
	)

	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const itemsPerPage = 8

	const fetchOrders = async () => {
		setLoading(true)
		const start = `${selectedDate}T00:00:00.000Z`
		const end = `${selectedDate}T23:59:59.999Z`

		const from = (page - 1) * itemsPerPage
		const to = from + itemsPerPage - 1

		const { data, error, count } = await supabase
			.from('orders')
			.select('*', { count: 'exact' })
			.gte('created_at', start)
			.lte('created_at', end)
			.order('created_at', { ascending: false })
			.range(from, to)

		if (!error) {
			setOrders(data || [])
			setTotalCount(count || 0)
		}
		setLoading(false)
	}

	useEffect(() => {
		fetchOrders()
		const channel = supabase
			.channel('orders-sync')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'orders' },
				() => fetchOrders(),
			)
			.subscribe()
		return () => {
			supabase.removeChannel(channel)
		}
	}, [selectedDate, page])

	const totalPages = Math.ceil(totalCount / itemsPerPage)

	const updateStatus = async (id: string, newStatus: string) => {
		const { error } = await supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', id)
		if (!error) toast.success('Status yangilandi')
	}

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans transition-colors duration-300'>
			{/* Header Section */}
			<div className='max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3'>
						<Package className='text-red-600' /> Faol Buyurtmalar
					</h1>
					<p className='text-slate-500 dark:text-slate-400 mt-1'>
						Barcha buyurtmalarni real vaqtda boshqarish
					</p>
				</div>

				<div className='flex items-center gap-4 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm'>
					<div className='flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700'>
						<Calendar size={16} className='text-red-600' />
						<input
							type='date'
							value={selectedDate}
							onChange={e => {
								setSelectedDate(e.target.value)
								setPage(1)
							}}
							className='bg-transparent outline-none text-sm font-semibold uppercase text-slate-700 dark:text-slate-200'
						/>
					</div>
					<div className='px-5 py-2 bg-red-600 rounded-xl text-white font-bold shadow-sm'>
						Jami: {totalCount}
					</div>
				</div>
			</div>

			{/* Orders List Section */}
			<div className='max-w-6xl mx-auto space-y-4 min-h-[500px]'>
				{loading ? (
					<div className='flex justify-center py-20'>
						<Loader2 className='animate-spin text-red-600' size={40} />
					</div>
				) : (
					<AnimatePresence mode='wait'>
						{orders.map(order => (
							<motion.div
								key={order.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								className='group relative bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-[24px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md'
							>
								<div className='p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6'>
									{/* Order Time and ID */}
									<div className='flex flex-col gap-1 min-w-[100px]'>
										<div className='flex items-center gap-1.5 text-slate-400 dark:text-slate-500'>
											<Clock size={14} />
											<span className='text-xs font-semibold uppercase'>
												{new Date(order.created_at).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
										</div>
										<span className='text-lg font-black tracking-widest text-slate-900 dark:text-white uppercase'>
											#{order.id.slice(-5)}
										</span>
									</div>

									{/* Customer Details */}
									<div className='flex-1 border-l border-slate-100 dark:border-slate-800 pl-6'>
										<div className='flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase'>
											<User size={14} className='text-red-600' />{' '}
											{order.customer_name}
										</div>
										<div className='flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm'>
											<Phone size={14} /> {order.phone}
										</div>
									</div>

									{/* Address / Table Info */}
									<div className='flex-1 border-l border-slate-100 dark:border-slate-800 pl-6'>
										<div className='flex items-start gap-2 text-sm italic text-slate-600 dark:text-slate-300'>
											<MapPin size={16} className='text-red-600 shrink-0' />
											{order.delivery_address ||
												(order.table_number
													? `Stol: ${order.table_number}`
													: 'Olib ketish')}
										</div>
									</div>

									{/* Amount */}
									<div className='min-w-[140px] text-right font-black text-slate-900 dark:text-white text-2xl'>
										{order.total_amount?.toLocaleString()}{' '}
										<span className='text-[10px] text-slate-400 dark:text-slate-500 uppercase'>
											so'm
										</span>
									</div>

									{/* Status Dropdown */}
									<div className='w-full md:w-auto'>
										<select
											value={order.status}
											onChange={e => updateStatus(order.id, e.target.value)}
											className={cn(
												'w-full md:w-40 px-4 py-2.5 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer appearance-none text-center outline-none shadow-sm',
												STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.bg,
												STATUS_MAP[order.status as keyof typeof STATUS_MAP]
													?.color,
												STATUS_MAP[order.status as keyof typeof STATUS_MAP]
													?.border,
											)}
										>
											{Object.entries(STATUS_MAP).map(([key, value]) => (
												<option
													key={key}
													value={key}
													className='bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
												>
													{value.label}
												</option>
											))}
										</select>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				)}
			</div>

			{/* PAGINATION CONTROLS */}
			{totalPages > 1 && (
				<div className='max-w-6xl mx-auto flex justify-center items-center gap-4 mt-12 pb-10'>
					<Button
						variant='outline'
						disabled={page === 1 || loading}
						onClick={() => setPage(p => p - 1)}
						className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-red-600 rounded-xl px-6 shadow-sm transition-colors'
					>
						<ChevronLeft className='mr-2' size={18} /> Orqaga
					</Button>

					<div className='px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-white shadow-sm'>
						{page}{' '}
						<span className='text-slate-300 dark:text-slate-600 mx-1'>/</span>{' '}
						{totalPages}
					</div>

					<Button
						variant='outline'
						disabled={page === totalPages || loading}
						onClick={() => setPage(p => p + 1)}
						className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-red-600 rounded-xl px-6 shadow-sm transition-colors'
					>
						Keyingi <ChevronRight className='ml-2' size={18} />
					</Button>
				</div>
			)}
		</div>
	)
}
