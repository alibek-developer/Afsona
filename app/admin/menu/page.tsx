'use client'

import { MenuItemDialog } from '@/components/admin/menu-item-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { Edit2, Plus, Trash2, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Export default sahifadagi "The default export is not a React Component" xatosini tuzatadi
export default function AdminMenuPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState<any>(null)

	const fetchItems = async () => {
		setLoading(true)
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.order('created_at', { ascending: false })
		if (!error) setItems(data || [])
		setLoading(false)
	}

	useEffect(() => {
		fetchItems()
	}, [])

	const handleDelete = async (id: string) => {
		if (!confirm('Ushbu taomni oʻchirib yubormoqchimisiz?')) return
		const { error } = await supabase.from('menu_items').delete().eq('id', id)
		if (!error) {
			toast.success('Oʻchirildi')
			fetchItems()
		}
	}

	const filteredItems = items.filter(item =>
		item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	return (
		<div className='p-4 md:p-8 space-y-6'>
			{/* Header - Light/Dark moslashtirilgan */}
			<div className='flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors'>
				<div className='flex items-center gap-4'>
					<div className='w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white'>
						<Utensils size={24} />
					</div>
					<h1 className='text-2xl font-bold dark:text-white'>
						Menyu ({items.length})
					</h1>
				</div>
				<div className='flex gap-3 w-full md:w-auto'>
					<Input
						placeholder='Qidirish...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='w-full md:w-64 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700'
					/>
					<Button
						onClick={() => {
							setSelectedItem(null)
							setIsDialogOpen(true)
						}}
						className='rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
					>
						<Plus className='mr-2' size={18} /> Qo'shish
					</Button>
				</div>
			</div>

			{/* Jadval - Rasmdagi uzun va ixcham ko'rinish */}
			<div className='bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left'>
						<thead className='bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700'>
							<tr>
								<th className='p-5 text-xs font-bold uppercase text-slate-400'>
									Taom
								</th>
								<th className='p-5 text-xs font-bold uppercase text-slate-400'>
									Kategoriya
								</th>
								<th className='p-5 text-xs font-bold uppercase text-slate-400'>
									Narxi
								</th>
								<th className='p-5 text-xs font-bold uppercase text-slate-400 text-right'>
									Amallar
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
							{loading ? (
								<tr>
									<td
										colSpan={4}
										className='p-10 text-center text-slate-400 dark:text-slate-500'
									>
										Yuklanmoqda...
									</td>
								</tr>
							) : filteredItems.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className='p-10 text-center text-slate-400 dark:text-slate-500'
									>
										Hech narsa topilmadi
									</td>
								</tr>
							) : (
								filteredItems.map(item => (
									<tr
										key={item.id}
										className='hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors'
									>
										<td className='p-5 font-bold dark:text-white'>
											{item.name}
										</td>
										<td className='p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
											{item.category}
										</td>
										<td className='p-5 font-bold text-indigo-600 dark:text-indigo-400'>
											{item.price?.toLocaleString()} so'm
										</td>
										<td className='p-5 text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													variant='ghost'
													size='icon'
													onClick={() => {
														setSelectedItem(item)
														setIsDialogOpen(true)
													}}
													className='text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
												>
													<Edit2 size={18} />
												</Button>
												<Button
													variant='ghost'
													size='icon'
													onClick={() => handleDelete(item.id)}
													className='text-slate-400 hover:text-red-500'
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

			<MenuItemDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				editItem={selectedItem}
				refreshData={fetchItems}
			/>
		</div>
	)
}
