'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import {
	ArrowDownRight,
	ArrowUpRight,
	Clock,
	ShoppingBag,
	TrendingUp,
	Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

// Chart ma'lumotlari
const data = [
	{ time: '08:00', amount: 1200000 },
	{ time: '10:00', amount: 2500000 },
	{ time: '12:00', amount: 4800000 },
	{ time: '14:00', amount: 3500000 },
	{ time: '16:00', amount: 4200000 },
	{ time: '18:00', amount: 6500000 },
	{ time: '20:00', amount: 5800000 },
	{ time: '22:00', amount: 2800000 },
]

// Currency formatting function
const formatCurrency = (amount: number) => {
	return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function AdminDashboard() {
	const [selectedRange, setSelectedRange] = useState<'1day' | '1week' | '1month' | '1year'>('1day')
	const [stats, setStats] = useState({
		revenue: 29350000,
		orders: 156,
		customers: 1240,
		avgTime: 32,
	})
	const [topItems, setTopItems] = useState([
		{ name: 'Palov', count: 120, color: 'bg-red-600', percentage: 90 },
		{ name: 'Manti', count: 98, color: 'bg-orange-600', percentage: 75 },
		{ name: 'Lagmon', count: 86, color: 'bg-blue-600', percentage: 65 },
		{ name: 'Shashlik', count: 72, color: 'bg-emerald-600', percentage: 50 },
		{ name: 'Gijduvon Shashlik', count: 45, color: 'bg-purple-600', percentage: 35 },
	])
	const [loading, setLoading] = useState(false)

	// Get date range based on selected time filter
	const getDateRange = (range: string) => {
		const now = new Date()
		const start = new Date()

		switch (range) {
			case '1day':
				start.setDate(now.getDate() - 1)
				break
			case '1week':
				start.setDate(now.getDate() - 7)
				break
			case '1month':
				start.setMonth(now.getMonth() - 1)
				break
			case '1year':
				start.setFullYear(now.getFullYear() - 1)
				break
			default:
				start.setDate(now.getDate() - 1)
		}

		return {
			start: start.toISOString(),
			end: now.toISOString()
		}
	}

	// Fetch analytics data
	const fetchAnalytics = async (range: string) => {
		setLoading(true)
		try {
			const { start, end } = getDateRange(range)

			// Fetch orders for the selected period
			const { data: orders, error } = await supabase
				.from('orders')
				.select('total_amount, phone, items, created_at')
				.gte('created_at', start)
				.lte('created_at', end)

			if (error) throw error

			// Calculate revenue
			const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

			// Calculate orders count
			const ordersCount = orders?.length || 0

			// Calculate unique customers (distinct phones)
			const uniqueCustomers = new Set(orders?.map(order => order.phone).filter(Boolean))
			const customersCount = uniqueCustomers.size

			// Calculate top items
			const itemCounts: { [key: string]: { name: string; count: number } } = {}
			orders?.forEach(order => {
				if (order.items && Array.isArray(order.items)) {
					order.items.forEach((item: any) => {
						if (item.name && item.quantity) {
							if (itemCounts[item.name]) {
								itemCounts[item.name].count += item.quantity
							} else {
								itemCounts[item.name] = { name: item.name, count: item.quantity }
							}
						}
					})
				}
			})

			// Sort items by count and take top 5
			const sortedItems = Object.values(itemCounts)
				.sort((a, b) => b.count - a.count)
				.slice(0, 5)

			// Calculate percentages for top items
			const maxCount = sortedItems[0]?.count || 1
			const topItemsWithPercentage = sortedItems.map((item, index) => {
				const colors = ['bg-red-600', 'bg-orange-600', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600']
				return {
					name: item.name,
					count: item.count,
					color: colors[index] || 'bg-gray-600',
					percentage: Math.round((item.count / maxCount) * 100)
				}
			})

			setStats({
				revenue,
				orders: ordersCount,
				customers: customersCount,
				avgTime: 32, // Keep this static as it's not in the orders table
			})

			setTopItems(topItemsWithPercentage)

		} catch (error) {
			console.error('Analytics fetch error:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAnalytics(selectedRange)
	}, [selectedRange])

	return (
		<div className='space-y-10 transition-colors'>
			{/* Sarlavha qismi */}
			<div className='flex flex-col gap-1'>
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
					<div className='flex flex-col gap-1'>
						<h1 className='text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase'>
							Tizim <span className='text-red-600'>Analitikasi</span>
						</h1>
						<div className='flex items-center gap-3'>
							<p className='text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]'>
								Bugungi jonli statistika
							</p>
							<div className='flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full'>
								<span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
								<span className='text-[10px] font-black text-emerald-500 uppercase'>
									Live
								</span>
							</div>
						</div>
					</div>

					{/* Time Filter Tabs */}
					<div className='flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1'>
						{[
							{ key: '1day', label: '1 Kun' },
							{ key: '1week', label: '1 Hafta' },
							{ key: '1month', label: '1 Oy' },
							{ key: '1year', label: '1 Yil' },
						].map(({ key, label }) => (
							<button
								key={key}
								onClick={() => setSelectedRange(key as any)}
								className={cn(
									'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
									selectedRange === key
										? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm'
										: 'text-slate-600 dark:text-slate-400 hover:text-red-500'
								)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Stats Cards - Hard Shadow uslubida */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatCard
					title={`${selectedRange === '1day' ? 'Kunlik' : selectedRange === '1week' ? 'Haftalik' : selectedRange === '1month' ? 'Oylik' : 'Yillik'} Tushum`}
					value={stats.revenue}
					formattedValue={formatCurrency(stats.revenue)}
					trend='+12.5%'
					trendUp={true}
					icon={TrendingUp}
					iconColor='text-red-600'
					iconBg='bg-red-50 dark:bg-red-500/10'
				/>
				<StatCard
					title='Buyurtmalar'
					value={stats.orders}
					unit='ta'
					trend='+8%'
					trendUp={true}
					icon={ShoppingBag}
					iconColor='text-blue-600'
					iconBg='bg-blue-50 dark:bg-blue-500/10'
				/>
				<StatCard
					title='Mijozlar'
					value={stats.customers}
					unit='nafar'
					trend='-2%'
					trendUp={false}
					icon={Users}
					iconColor='text-orange-600'
					iconBg='bg-orange-50 dark:bg-orange-500/10'
				/>
				<StatCard
					title="O'rtacha vaqt"
					value={stats.avgTime}
					unit='daqiqa'
					trend='-5 min'
					trendUp={true}
					icon={Clock}
					iconColor='text-emerald-600'
					iconBg='bg-emerald-50 dark:bg-emerald-500/10'
				/>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Sotuvlar Dinamikasi Chart */}
				<Card className='lg:col-span-2 border-2 border-slate-100 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900'>
					<CardHeader className='pb-0 pt-8 px-8'>
						<CardTitle className='text-xl font-black uppercase tracking-tight dark:text-white'>
							Sotuvlar Dinamikasi
						</CardTitle>
					</CardHeader>
					<CardContent className='h-[380px] w-full p-4'>
						<ResponsiveContainer width='100%' height='100%'>
							<AreaChart
								data={data}
								margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
							>
								<defs>
									<linearGradient id='colorAmount' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='5%' stopColor='#ef4444' stopOpacity={0.2} />
										<stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey='time'
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
									dy={10}
								/>
								<YAxis hide />
								<Tooltip
									cursor={{
										stroke: '#ef4444',
										strokeWidth: 2,
										strokeDasharray: '4 4',
									}}
									contentStyle={{
										borderRadius: '16px',
										border: 'none',
										boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.1)',
										backgroundColor: '#0f172a',
										padding: '12px',
									}}
									itemStyle={{
										color: '#fff',
										fontWeight: 900,
										textTransform: 'uppercase',
										fontSize: '10px',
									}}
									labelStyle={{ display: 'none' }}
									formatter={(value: any) => [
										`${value.toLocaleString()} so'm`,
										'Tushum',
									]}
								/>
								<Area
									type='stepAfter'
									dataKey='amount'
									stroke='#ef4444'
									strokeWidth={4}
									fillOpacity={1}
									fill='url(#colorAmount)'
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Eng ko'p sotilganlar */}
				<Card className='border-2 border-slate-100 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] rounded-[2rem] bg-white dark:bg-slate-900'>
					<CardHeader className='pt-8 px-8'>
						<CardTitle className='text-xl font-black uppercase tracking-tight dark:text-white'>
							Top <span className='text-red-600'>Taomlar</span>
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6 px-8 pb-8'>
						{loading ? (
							<div className='text-center text-slate-400 dark:text-slate-500'>
								Yuklanmoqda...
							</div>
						) : topItems.length > 0 ? (
							topItems.map((item, index) => (
								<TopItem
									key={item.name}
									name={item.name}
									count={item.count}
									color={item.color}
									percentage={item.percentage}
								/>
							))
						) : (
							<div className='text-center text-slate-400 dark:text-slate-500'>
								Ma'lumot mavjud emas
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

function StatCard({
	title,
	value,
	isPrice,
	formattedValue,
	trend,
	trendUp,
	icon: Icon,
	iconColor,
	iconBg,
	unit,
}: any) {
	return (
		<Card className='border-2 border-slate-100 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all bg-white dark:bg-slate-900'>
			<CardContent className='p-6'>
				<div className='flex justify-between items-start mb-6'>
					<div
						className={`p-4 rounded-2xl ${iconBg} ${iconColor} transition-transform group-hover:scale-110 shadow-sm`}
					>
						<Icon size={24} strokeWidth={2.5} />
					</div>
					<div
						className={cn(
							'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter',
							trendUp
								? 'bg-emerald-500/10 text-emerald-600'
								: 'bg-red-500/10 text-red-600',
						)}
					>
						{trend}{' '}
						{trendUp ? (
							<ArrowUpRight size={14} />
						) : (
							<ArrowDownRight size={14} />
						)}
					</div>
				</div>
				<div className='space-y-1'>
					<p className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
						{title}
					</p>
					<div className='flex items-baseline gap-1'>
						<h3 className='text-2xl font-black text-slate-900 dark:text-white tracking-tighter'>
							{formattedValue || (isPrice ? <Price value={value} /> : value.toLocaleString())}
						</h3>
						{unit && (
							<span className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase'>
								{unit}
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function TopItem({ name, count, color, percentage }: any) {
	return (
		<div className='group cursor-default'>
			<div className='flex justify-between items-end mb-2'>
				<span className='font-black text-xs uppercase tracking-tight text-slate-700 dark:text-slate-300 group-hover:text-red-600 transition-colors'>
					{name}
				</span>
				<span className='text-[10px] font-black text-slate-400'>
					{count} ta
				</span>
			</div>
			<div className='h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50'>
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${percentage}%` }}
					viewport={{ once: true }}
					transition={{ duration: 1.5, ease: 'circOut' }}
					className={`h-full ${color} rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
				/>
			</div>
		</div>
	)
}
