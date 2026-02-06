'use client'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock,
	Inbox,
	MapPin,
	Phone,
	User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAdminOrders } from './actions'

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<any[]>([])
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split('T')[0],
	)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadOrders()
	}, [page, selectedDate])

	async function loadOrders() {
		setLoading(true)
		try {
			const res = await getAdminOrders(page, selectedDate)
			setOrders(res.orders || [])
			setTotalPages(res.totalPages || 1)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		} catch (error) {
			console.error('Yuklashda xatolik:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-[#020617] text-slate-300 p-8'>
			<div className='max-w-7xl mx-auto space-y-8'>
				{/* HEADER & FILTER */}
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
					<div>
						<h1 className='text-3xl font-black text-white uppercase italic tracking-tight'>
							Faol <span className='text-red-600'>Buyurtmalar</span>
						</h1>
						<p className='text-slate-500 text-sm font-bold uppercase tracking-wider mt-1'>
							Barcha buyurtmalarni boshqarish
						</p>
					</div>

					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-3 bg-[#0f172a] border border-slate-800 p-3 rounded-xl'>
							<CalendarIcon size={18} className='text-red-600' />
							<input
								type='date'
								value={selectedDate}
								onChange={e => {
									setSelectedDate(e.target.value)
									setPage(1)
								}}
								className='bg-transparent font-bold outline-none text-white text-sm'
							/>
						</div>
						<div className='bg-red-600 text-white px-6 py-2 rounded-xl flex flex-col items-center shadow-lg shadow-red-900/20'>
							<span className='text-[10px] font-black uppercase'>Jami</span>
							<span className='text-xl font-bold leading-none'>
								{orders.length}
							</span>
						</div>
					</div>
				</div>

				{/* LIST VIEW (Rasmdagi kabi karta ko'rinishida) */}
				<div className='space-y-4'>
					{loading ? (
						<div className='py-20 text-center font-bold text-slate-500 animate-pulse uppercase tracking-[0.2em]'>
							Yuklanmoqda...
						</div>
					) : orders.length === 0 ? (
						<div className='bg-[#0f172a] border border-slate-800 rounded-[2rem] p-20 text-center'>
							<div className='flex flex-col items-center gap-4 text-slate-500 uppercase font-black'>
								<Inbox size={64} className='opacity-20' />
								Ma'lumot topilmadi
							</div>
						</div>
					) : (
						orders.map(order => (
							<div
								key={order.id}
								className='bg-[#0f172a]/50 border border-slate-800 hover:border-slate-700 rounded-[2rem] p-6 transition-all group relative overflow-hidden'
							>
								{/* Chap tarafdagi ko'k indikator */}
								<div className='absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-full my-4 ml-1 opacity-80' />

								<div className='flex flex-wrap items-center justify-between gap-6 pl-4'>
									{/* Vaqt va ID */}
									<div className='min-w-[100px]'>
										<div className='flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-1 uppercase'>
											<Clock size={12} />{' '}
											{new Date().toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</div>
										<div className='text-white font-black tracking-tighter text-lg uppercase italic'>
											#{order.id.toString().slice(-5)}
										</div>
									</div>

									{/* Mijoz Ma'lumotlari */}
									<div className='flex-1 border-l border-slate-800 pl-6 min-w-[180px]'>
										<div className='flex items-center gap-2 text-white font-black uppercase text-sm mb-1'>
											<User size={14} className='text-red-500' />{' '}
											{order.customer_name}
										</div>
										<div className='flex items-center gap-2 text-slate-500 text-xs font-bold'>
											<Phone size={12} /> {order.phone || '+998...'}
										</div>
									</div>

									{/* Manzil */}
									<div className='flex-1 border-l border-slate-800 pl-6 min-w-[200px]'>
										<div className='flex items-start gap-2 text-slate-300 text-xs font-bold italic leading-relaxed'>
											<MapPin
												size={16}
												className='text-red-600 shrink-0 mt-0.5'
											/>
											{order.delivery_address || 'Olib ketish / Stol raqami'}
										</div>
									</div>

									{/* Narx */}
									<div className='text-right border-l border-slate-800 pl-6 min-w-[150px]'>
										<div className='text-2xl font-black text-white tracking-tight'>
											<Price value={order.total_amount} />
										</div>
									</div>

									{/* Status Dropdown (Dizayn uchun placeholder) */}
									<div className='min-w-[130px]'>
										<div className='bg-[#1e293b] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-slate-700 shadow-sm'>
											{order.status}
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* PAGINATION */}
				{totalPages > 0 && (
					<div className='flex justify-center items-center gap-8 pt-10 pb-20'>
						<Button
							disabled={page === 1 || loading}
							onClick={() => setPage(p => Math.max(1, p - 1))}
							className='h-14 w-14 rounded-2xl bg-[#0f172a] border border-slate-800 hover:bg-red-600 hover:text-white transition-all text-slate-400'
						>
							<ChevronLeft size={28} />
						</Button>

						<div className='flex flex-col items-center bg-[#0f172a] px-8 py-2 rounded-2xl border border-slate-800'>
							<span className='text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]'>
								Sahifa
							</span>
							<span className='text-xl font-black text-white italic'>
								{page} <span className='text-red-600'>/</span> {totalPages}
							</span>
						</div>

						<Button
							disabled={page >= totalPages || loading}
							onClick={() => setPage(p => p + 1)}
							className='h-14 w-14 rounded-2xl bg-[#0f172a] border border-slate-800 hover:bg-red-600 hover:text-white transition-all text-slate-400'
						>
							<ChevronRight size={28} />
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
