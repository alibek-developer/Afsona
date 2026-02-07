'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	DoorOpen,
	Loader2,
	MapPin,
	MessageSquare,
	Package,
	Phone,
	User,
	Users,
	Utensils,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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

const RESERVATION_STATUS_MAP = {
	pending: {
		label: 'Kutilmoqda',
		color: 'text-blue-600 dark:text-blue-400',
		bg: 'bg-blue-50 dark:bg-blue-500/10',
		border: 'border-blue-200 dark:border-blue-500/20',
	},
	confirmed: {
		label: 'Tasdiqlandi',
		color: 'text-emerald-600 dark:text-emerald-400',
		bg: 'bg-emerald-50 dark:bg-emerald-500/10',
		border: 'border-emerald-200 dark:border-emerald-500/20',
	},
	cancelled: {
		label: 'Bekor qilindi',
		color: 'text-red-600 dark:text-red-400',
		bg: 'bg-red-50 dark:bg-red-500/10',
		border: 'border-red-200 dark:border-red-500/20',
	},
	completed: {
		label: 'Tugadi',
		color: 'text-slate-500 dark:text-slate-400',
		bg: 'bg-slate-50 dark:bg-slate-500/10',
		border: 'border-slate-200 dark:border-slate-500/20',
	},
}

type TabType = 'orders' | 'reservations'

export default function AdminOrdersPage() {
	const [activeTab, setActiveTab] = useState<TabType>('orders')
	const [orders, setOrders] = useState<any[]>([])
	const [reservations, setReservations] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedDate, setSelectedDate] = useState(
		new Date().toLocaleDateString('en-CA'),
	)

	// Real-time counters
	const [newOrdersCount, setNewOrdersCount] = useState(0)
	const [newReservationsCount, setNewReservationsCount] = useState(0)

	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const itemsPerPage = 10

	// Separate fetch function for ORDERS
	const fetchOrders = useCallback(async () => {
		setLoading(true)
		const start = `${selectedDate}T00:00:00`
		const end = `${selectedDate}T23:59:59`
		const from = (page - 1) * itemsPerPage
		const to = from + itemsPerPage - 1

		try {
			const { data, error, count } = await supabase
				.from('orders')
				.select('*', { count: 'exact' })
				.gte('created_at', start)
				.lte('created_at', end)
				.order('created_at', { ascending: false }) // Eng yangisi tepada
				.range(from, to)

			if (error) throw error
			setOrders(data || [])
			setTotalCount(count || 0)
		} catch (error: any) {
			console.error('Orders yuklashda xatolik:', error.message)
			toast.error('Buyurtmalarni yuklashda muammo boʻldi')
		} finally {
			setLoading(false)
		}
	}, [selectedDate, page])

	// Separate fetch function for RESERVATIONS
	const fetchReservations = useCallback(async () => {
		setLoading(true)
		const start = `${selectedDate}T00:00:00`
		const end = `${selectedDate}T23:59:59`
		const from = (page - 1) * itemsPerPage
		const to = from + itemsPerPage - 1

		try {
			const { data, error, count } = await supabase
				.from('table_reservations')
				.select('*', { count: 'exact' })
				.gte('created_at', start)
				.lte('created_at', end)
				.order('created_at', { ascending: false }) // Eng yangisi tepada
				.range(from, to)

			if (error) throw error
			setReservations(data || [])
			setTotalCount(count || 0)
		} catch (error: any) {
			console.error('Reservations yuklashda xatolik:', error.message)
			toast.error('Bronlarni yuklashda muammo boʻldi')
		} finally {
			setLoading(false)
		}
	}, [selectedDate, page])

	// Fetch data when tab changes
	useEffect(() => {
		if (activeTab === 'orders') {
			fetchOrders()
		} else {
			fetchReservations()
		}
	}, [activeTab, fetchOrders, fetchReservations])

	// Real-time subscriptions with smart counter logic
	useEffect(() => {
		// ORDERS Real-time Channel
		const ordersChannel = supabase
			.channel('admin-orders-realtime')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'orders' },
				payload => {
					console.log('Yangi taom buyurtmasi:', payload.new)
					if (activeTab === 'orders') {
						// Agar hozir Orders tabida bo'lsa - ro'yxatni yangilash
						fetchOrders()
					} else {
						// Agar Reservations tabida bo'lsa - counterni oshirish
						setNewOrdersCount(prev => prev + 1)
					}
				},
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'orders' },
				() => {
					if (activeTab === 'orders') {
						fetchOrders()
					}
				},
			)
			.subscribe()

		// RESERVATIONS Real-time Channel
		const reservationsChannel = supabase
			.channel('admin-reservations-realtime')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'table_reservations' },
				payload => {
					console.log('Yangi xona broni:', payload.new)
					if (activeTab === 'reservations') {
						// Agar hozir Reservations tabida bo'lsa - ro'yxatni yangilash
						fetchReservations()
					} else {
						// Agar Orders tabida bo'lsa - counterni oshirish
						setNewReservationsCount(prev => prev + 1)
					}
				},
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'table_reservations' },
				() => {
					if (activeTab === 'reservations') {
						fetchReservations()
					}
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(ordersChannel)
			supabase.removeChannel(reservationsChannel)
		}
	}, [activeTab, fetchOrders, fetchReservations])

	// Reset counter when switching tabs
	useEffect(() => {
		if (activeTab === 'orders') {
			setNewOrdersCount(0)
		} else {
			setNewReservationsCount(0)
		}
	}, [activeTab])

	const updateOrderStatus = async (id: string, newStatus: string) => {
		const { error } = await supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', id)

		if (error) {
			toast.error('Statusni yangilab boʻlmadi')
		} else {
			toast.success('Status yangilandi')
			setOrders(prev =>
				prev.map(o => (o.id === id ? { ...o, status: newStatus } : o)),
			)
		}
	}

	const updateReservationStatus = async (id: string, newStatus: string) => {
		const { error } = await supabase
			.from('table_reservations')
			.update({ status: newStatus })
			.eq('id', id)

		if (error) {
			toast.error('Statusni yangilab boʻlmadi')
		} else {
			toast.success('Bron statusi yangilandi')
			setReservations(prev =>
				prev.map(r => (r.id === id ? { ...r, status: newStatus } : r)),
			)
		}
	}

	const totalPages = Math.ceil(totalCount / itemsPerPage)

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans transition-colors duration-300'>
			{/* Header Section */}
			<div className='max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3'>
						<Package className='text-red-600' /> Boshqaruv Paneli
					</h1>
					<p className='text-slate-500 dark:text-slate-400 mt-1'>
						{selectedDate} sanasidagi barcha ma'lumotlar
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

			{/* Tabs Section */}
			<div className='max-w-7xl mx-auto mb-6'>
				<div className='bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 inline-flex gap-2 shadow-sm'>
					<button
						onClick={() => {
							setActiveTab('orders')
							setPage(1)
						}}
						className={cn(
							'relative px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300',
							activeTab === 'orders'
								? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
								: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
						)}
					>
						<div className='flex items-center gap-2'>
							<Utensils size={18} />
							<span>Taomlar</span>
						</div>
						{newOrdersCount > 0 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg'
							>
								{newOrdersCount}
							</motion.div>
						)}
					</button>

					<button
						onClick={() => {
							setActiveTab('reservations')
							setPage(1)
						}}
						className={cn(
							'relative px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300',
							activeTab === 'reservations'
								? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
								: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
						)}
					>
						<div className='flex items-center gap-2'>
							<DoorOpen size={18} />
							<span>Xonalar</span>
						</div>
						{newReservationsCount > 0 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg'
							>
								{newReservationsCount}
							</motion.div>
						)}
					</button>
				</div>
			</div>

			{/* Content Section */}
			<div className='max-w-7xl mx-auto min-h-[400px]'>
				{loading && (activeTab === 'orders' ? orders : reservations).length === 0 ? (
					<div className='flex flex-col items-center justify-center py-20 gap-4'>
						<Loader2 className='animate-spin text-red-600' size={40} />
						<p className='text-slate-500 font-bold uppercase tracking-widest text-xs'>
							Yuklanmoqda...
						</p>
					</div>
				) : (
					<>
						{/* Orders Table */}
						{activeTab === 'orders' && (
							<div className='bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm'>
								{orders.length === 0 ? (
									<div className='text-center py-20'>
										<Package
											size={48}
											className='mx-auto text-slate-300 dark:text-slate-700 mb-4'
										/>
										<p className='text-slate-500 font-bold uppercase tracking-tighter'>
											Hozircha buyurtmalar yo'q
										</p>
									</div>
								) : (
									<div className='overflow-x-auto'>
										<table className='w-full text-left border-collapse'>
											<thead className='bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800'>
												<tr>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														ID / Vaqt
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														Mijoz
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														Manzil
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 text-right'>
														Summa
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 text-center'>
														Holat
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
												<AnimatePresence mode='popLayout'>
													{orders.map(order => (
														<motion.tr
															key={order.id}
															layout
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															className='group hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors'
														>
															<td className='px-6 py-4 align-middle'>
																<div className='flex flex-col'>
																	<span className='font-black text-slate-900 dark:text-white uppercase tracking-widest'>
																		#{order.id.toString().slice(-5)}
																	</span>
																	<div className='flex items-center gap-1.5 text-slate-400 mt-1'>
																		<Clock size={12} />
																		<span className='text-xs font-semibold'>
																			{new Date(
																				order.created_at,
																			).toLocaleTimeString('uz-UZ', {
																				hour: '2-digit',
																				minute: '2-digit',
																			})}
																		</span>
																	</div>
																</div>
															</td>

															<td className='px-6 py-4 align-middle'>
																<div className='flex flex-col'>
																	<div className='flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200'>
																		<User size={14} className='text-red-600' />
																		{order.customer_name}
																	</div>
																	<div className='flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium'>
																		<Phone size={12} />
																		{order.phone}
																	</div>
																</div>
															</td>

															<td className='px-6 py-4 align-middle'>
																<div className='flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[200px] truncate'>
																	<MapPin
																		size={16}
																		className='text-red-600 shrink-0'
																	/>
																	<span className='truncate'>
																		{order.delivery_address ||
																			(order.table_number
																				? `Stol: ${order.table_number}`
																				: 'Olib ketish')}
																	</span>
																</div>
															</td>

															<td className='px-6 py-4 align-middle text-right'>
																<div className='font-black text-slate-900 dark:text-white text-lg'>
																	{Number(order.total_amount).toLocaleString()}
																	<span className='text-[10px] text-slate-400 uppercase ml-1'>
																		so'm
																	</span>
																</div>
															</td>

															<td className='px-6 py-4 align-middle text-center'>
																<select
																	value={order.status}
																	onChange={e =>
																		updateOrderStatus(order.id, e.target.value)
																	}
																	className={cn(
																		'w-32 px-3 py-2 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer text-center outline-none shadow-sm appearance-none',
																		STATUS_MAP[
																			order.status as keyof typeof STATUS_MAP
																		]?.bg || 'bg-slate-100',
																		STATUS_MAP[
																			order.status as keyof typeof STATUS_MAP
																		]?.color || 'text-slate-600',
																		STATUS_MAP[
																			order.status as keyof typeof STATUS_MAP
																		]?.border || 'border-slate-200',
																	)}
																>
																	{Object.entries(STATUS_MAP).map(
																		([key, value]) => (
																			<option
																				key={key}
																				value={key}
																				className='bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
																			>
																				{value.label}
																			</option>
																		),
																	)}
																</select>
															</td>
														</motion.tr>
													))}
												</AnimatePresence>
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}

						{/* Reservations Table - 100% Matching Orders Design */}
						{activeTab === 'reservations' && (
							<div className='bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm'>
								{reservations.length === 0 ? (
									<div className='text-center py-20'>
										<DoorOpen
											size={48}
											className='mx-auto text-slate-300 dark:text-slate-700 mb-4'
										/>
										<p className='text-slate-500 font-bold uppercase tracking-tighter'>
											Hozircha bronlar yo'q
										</p>
									</div>
								) : (
									<div className='overflow-x-auto'>
										<table className='w-full text-left border-collapse'>
											<thead className='bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800'>
												<tr>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														ID / Vaqt
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														Mijoz
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														Bron Ma'lumoti
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400'>
														Maxsus So'rov
													</th>
													<th className='px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 text-center'>
														Holat
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
												<AnimatePresence mode='popLayout'>
													{reservations.map(reservation => (
														<motion.tr
															key={reservation.id}
															layout
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															className='group hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors'
														>
															{/* ID & Time */}
															<td className='px-6 py-4 align-middle'>
																<div className='flex flex-col'>
																	<span className='font-black text-slate-900 dark:text-white uppercase tracking-widest'>
																		#{reservation.id.toString().slice(-5)}
																	</span>
																	<div className='flex items-center gap-1.5 text-slate-400 mt-1'>
																		<Clock size={12} />
																		<span className='text-xs font-semibold'>
																			{new Date(
																				reservation.created_at,
																			).toLocaleTimeString('uz-UZ', {
																				hour: '2-digit',
																				minute: '2-digit',
																			})}
																		</span>
																	</div>
																</div>
															</td>

															{/* Customer */}
															<td className='px-6 py-4 align-middle'>
																<div className='flex flex-col'>
																	<div className='flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200'>
																		<User size={14} className='text-red-600' />
																		{reservation.customer_name}
																	</div>
																	<div className='flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium'>
																		<Phone size={12} />
																		{reservation.phone}
																	</div>
																</div>
															</td>

															{/* Reservation Details */}
															<td className='px-6 py-4 align-middle'>
																<div className='flex flex-col gap-1.5'>
																	<div className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		<Calendar size={14} className='text-red-600' />
																		<span>
																			{new Date(
																				reservation.reservation_date,
																			).toLocaleDateString('uz-UZ')}
																		</span>
																		<Clock size={12} className='text-slate-400' />
																		<span className='text-slate-600 dark:text-slate-400'>
																			{reservation.reservation_time}
																		</span>
																	</div>
																	<div className='flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400'>
																		<Users size={12} className='text-red-600' />
																		<span>{reservation.guest_count} kishi</span>
																	</div>
																</div>
															</td>

															{/* Special Requests */}
															<td className='px-6 py-4 align-middle'>
																{reservation.special_requests ? (
																	<div className='flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[200px]'>
																		<MessageSquare
																			size={14}
																			className='text-red-600 shrink-0'
																		/>
																		<span className='truncate'>
																			{reservation.special_requests}
																		</span>
																	</div>
																) : (
																	<span className='text-xs text-slate-400 italic'>
																		Yo'q
																	</span>
																)}
															</td>

															{/* Status Select */}
															<td className='px-6 py-4 align-middle text-center'>
																<select
																	value={reservation.status}
																	onChange={e =>
																		updateReservationStatus(
																			reservation.id,
																			e.target.value,
																		)
																	}
																	className={cn(
																		'w-32 px-3 py-2 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer text-center outline-none shadow-sm appearance-none',
																		RESERVATION_STATUS_MAP[
																			reservation.status as keyof typeof RESERVATION_STATUS_MAP
																		]?.bg || 'bg-slate-100',
																		RESERVATION_STATUS_MAP[
																			reservation.status as keyof typeof RESERVATION_STATUS_MAP
																		]?.color || 'text-slate-600',
																		RESERVATION_STATUS_MAP[
																			reservation.status as keyof typeof RESERVATION_STATUS_MAP
																		]?.border || 'border-slate-200',
																	)}
																>
																	{Object.entries(RESERVATION_STATUS_MAP).map(
																		([key, value]) => (
																			<option
																				key={key}
																				value={key}
																				className='bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
																			>
																				{value.label}
																			</option>
																		),
																	)}
																</select>
															</td>
														</motion.tr>
													))}
												</AnimatePresence>
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='max-w-7xl mx-auto flex justify-center items-center gap-4 mt-8 pb-10'>
					<Button
						variant='outline'
						disabled={page === 1 || loading}
						onClick={() => setPage(p => p - 1)}
						className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl px-6'
					>
						<ChevronLeft className='mr-2' size={18} /> Orqaga
					</Button>
					<div className='px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold'>
						{page} / {totalPages}
					</div>
					<Button
						variant='outline'
						disabled={page === totalPages || loading}
						onClick={() => setPage(p => p + 1)}
						className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl px-6'
					>
						Keyingi <ChevronRight className='ml-2' size={18} />
					</Button>
				</div>
			)}
		</div>
	)
}