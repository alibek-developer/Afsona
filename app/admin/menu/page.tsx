'use client'

import { MenuItemDialog } from '@/components/admin/menu-item-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import {
	ChevronLeft,
	ChevronRight,
	Edit2,
	Eye,
	EyeOff,
	Plus,
	Search,
	Trash2,
	Utensils,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function AdminMenuPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState<any>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

	// Ma'lumotlarni yuklash (useCallback loopni oldini oladi)
	const fetchItems = useCallback(async () => {
		setLoading(true)
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			toast.error('Menyuni yuklashda xatolik!')
		} else {
			setItems(data || [])
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchItems()
	}, [fetchItems])

	// Holatni o'zgartirish (Sotuvda/Arxiv)
	const toggleStatus = async (id: string, currentStatus: boolean) => {
		setItems(prev =>
			prev.map(item =>
				item.id === id ? { ...item, is_available: !currentStatus } : item,
			),
		)

		const { error } = await supabase
			.from('menu_items')
			.update({ is_available: !currentStatus })
			.eq('id', id)

		if (error) {
			toast.error("Statusni o'zgartirib bo'lmadi")
			fetchItems()
		} else {
			toast.success(
				currentStatus ? 'Taom arxivga olindi' : 'Taom sotuvga qaytarildi',
			)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('Ushbu taomni butunlay oʻchirib yubormoqchimisiz?')) return
		const { error } = await supabase.from('menu_items').delete().eq('id', id)
		if (error) {
			toast.error(
				error.code === '23503'
					? "O'chirib bo'lmaydi: Buyurtmalar tarixida bor"
					: `Xatolik: ${error.message}`,
			)
		} else {
			toast.success('Muvaffaqiyatli oʻchirildi')
			fetchItems()
		}
	}

	// Filtr mantiqi
	const filteredItems = items.filter(item => {
		const matchesSearch = item.name
			?.toLowerCase()
			.includes(searchQuery.toLowerCase())
		const matchesTab =
			activeTab === 'active'
				? item.is_available === true
				: item.is_available === false
		return matchesSearch && matchesTab
	})

	// Pagination mantiqi
	const itemsPerPage = 10
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	)

	useEffect(() => {
		setCurrentPage(1)
	}, [searchQuery, activeTab])

	return (
		<div className='p-4 md:p-8 space-y-6'>
			{/* Header */}
			<div className='flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm'>
				<div className='flex items-center gap-4'>
					<div className='w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white'>
						<Utensils size={24} />
					</div>
					<div>
						<h1 className='text-2xl font-black text-slate-900 dark:text-white'>
							Menyu Boshqaruvi
						</h1>
						<p className='text-slate-500 text-xs font-bold uppercase'>
							{activeTab === 'active' ? 'Sotuvda' : 'Arxivda'}
						</p>
					</div>
				</div>
				<div className='flex gap-3 w-full md:w-auto'>
					<div className='relative w-full md:w-64'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
							size={18}
						/>
						<Input
							placeholder='Taomni qidirish...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='pl-10 rounded-xl bg-slate-50 dark:bg-slate-800'
						/>
					</div>
					<Button
						onClick={() => {
							setSelectedItem(null)
							setIsDialogOpen(true)
						}}
						className='rounded-xl bg-indigo-600 font-bold'
					>
						<Plus className='mr-2' size={18} /> Qo'shish
					</Button>
				</div>
			</div>

			{/* Tabs - Arxiv va Sotuvda bo'limlari */}
			<div className='flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 w-fit rounded-2xl border'>
				<button
					onClick={() => setActiveTab('active')}
					className={cn(
						'px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
						activeTab === 'active'
							? 'bg-white text-indigo-600 shadow-sm'
							: 'text-slate-500',
					)}
				>
					Sotuvda ({items.filter(i => i.is_available).length})
				</button>
				<button
					onClick={() => setActiveTab('archived')}
					className={cn(
						'px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
						activeTab === 'archived'
							? 'bg-white text-red-600 shadow-sm'
							: 'text-slate-500',
					)}
				>
					Arxiv ({items.filter(i => !i.is_available).length})
				</button>
			</div>

			{/* Table */}
			<div className='bg-white dark:bg-slate-900 rounded-[24px] border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left'>
						<thead className='bg-slate-50 dark:bg-slate-800/50 border-b'>
							<tr>
								<th className='p-5 text-[10px] font-black uppercase text-slate-400'>
									Taom Nomi
								</th>
								<th className='p-5 text-[10px] font-black uppercase text-slate-400'>
									Kategoriya
								</th>
								<th className='p-5 text-[10px] font-black uppercase text-slate-400'>
									Narxi
								</th>
								<th className='p-5 text-[10px] font-black uppercase text-slate-400 text-center'>
									Holati
								</th>
								<th className='p-5 text-[10px] font-black uppercase text-slate-400 text-right'>
									Amallar
								</th>
							</tr>
						</thead>
						<tbody className='divide-y'>
							{loading ? (
								<tr>
									<td
										colSpan={5}
										className='p-20 text-center animate-pulse text-slate-400'
									>
										Yuklanmoqda...
									</td>
								</tr>
							) : paginatedItems.length === 0 ? (
								<tr>
									<td colSpan={5} className='p-20 text-center text-slate-400'>
										Ma'lumot topilmadi
									</td>
								</tr>
							) : (
								paginatedItems.map(item => (
									<tr
										key={item.id}
										className='hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='p-5 font-bold text-slate-900 dark:text-white'>
											{item.name}
										</td>
										<td className='p-5'>
											<span className='px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase'>
												{item.category}
											</span>
										</td>
										<td className='p-5 font-black text-indigo-600'>
											{item.price?.toLocaleString()}{' '}
											<span className='text-[10px] text-slate-400'>SO'M</span>
										</td>
										<td className='p-5 text-center'>
											<button
												onClick={() => toggleStatus(item.id, item.is_available)}
												className={cn(
													'px-3 py-1.5 rounded-lg text-xs font-bold uppercase border-2 transition-all cursor-pointer',
													item.is_available
														? 'border-emerald-100 bg-emerald-50 text-emerald-600'
														: 'border-red-100 bg-red-50 text-red-600',
												)}
											>
												{item.is_available ? 'Sotuvda' : 'Arxivda'}
											</button>
										</td>
										<td className='p-5 text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													variant='ghost'
													size='icon'
													onClick={() =>
														toggleStatus(item.id, item.is_available)
													}
													className='text-slate-400 hover:text-indigo-600'
												>
													{item.is_available ? (
														<EyeOff size={18} />
													) : (
														<Eye size={18} />
													)}
												</Button>
												<Button
													variant='ghost'
													size='icon'
													onClick={() => {
														setSelectedItem(item)
														setIsDialogOpen(true)
													}}
													className='text-indigo-400 hover:bg-indigo-50'
												>
													<Edit2 size={18} />
												</Button>
												<Button
													variant='ghost'
													size='icon'
													onClick={() => handleDelete(item.id)}
													className='text-red-400 hover:bg-red-50'
												>
													<Trash2 size={18} />
												</Button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm'>
					<p className='text-sm text-slate-500 font-medium'>
						Sahifa {currentPage} / {totalPages}
					</p>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft size={18} />
						</Button>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							<ChevronRight size={18} />
						</Button>
					</div>
				</div>
			)}

			<MenuItemDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				editItem={selectedItem}
				refreshData={fetchItems}
			/>
		</div>
	)
}
