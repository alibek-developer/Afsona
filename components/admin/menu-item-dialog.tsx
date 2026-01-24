'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { CATEGORIES } from '@/lib/types'
import { Link as LinkIcon, Loader2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function MenuItemDialog({
	open,
	onOpenChange,
	editItem,
	refreshData,
}: any) {
	const [loading, setLoading] = useState(false)
	const [darkMode, setDarkMode] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		category: '',
		image_url: '',
		available_on_website: true,
		available_on_mobile: true,
	})

	useEffect(() => {
		const isDark = document.documentElement.classList.contains('dark')
		setDarkMode(isDark)
	}, [])

	useEffect(() => {
		if (!open) return

		if (editItem) {
			setFormData({
				name: editItem.name || '',
				description: editItem.description || '',
				price: editItem.price?.toString() || '',
				category: editItem.category || '',
				image_url: editItem.image_url || '',
				available_on_website: !!editItem.available_on_website,
				available_on_mobile: !!editItem.available_on_mobile,
			})
		} else {
			setFormData({
				name: '',
				description: '',
				price: '',
				category: '',
				image_url: '',
				available_on_website: true,
				available_on_mobile: true,
			})
		}
	}, [open, editItem])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.category) return toast.error('Kategoriyani tanlang')

		setLoading(true)
		const itemData = {
			...formData,
			price: parseFloat(formData.price) || 0,
		}

		try {
			const { error } = editItem
				? await supabase
						.from('menu_items')
						.update(itemData)
						.eq('id', editItem.id)
				: await supabase.from('menu_items').insert([itemData])

			if (error) throw error

			toast.success(
				editItem ? 'Muvaffaqiyatli yangilandi' : "Yangi taom qo'shildi",
			)
			onOpenChange(false)

			if (refreshData) {
				refreshData()
			} else {
				window.location.reload()
			}
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-[550px] p-0 overflow-hidden border-none shadow-2xl dark:shadow-[0_0_50px_rgba(239,68,68,0.2)] rounded-[30px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors'>
				<div className='bg-[#0f172a] dark:bg-slate-800 p-6 text-white flex items-center gap-4 border-b border-slate-700 dark:border-slate-700'>
					<div className='w-12 h-12 rounded-2xl bg-indigo-500/20 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 dark:border-indigo-400/40'>
						<UtensilsCrossed
							size={24}
							className='text-indigo-400 dark:text-indigo-300'
						/>
					</div>
					<div>
						<DialogTitle className='text-xl font-bold uppercase tracking-tight dark:text-white'>
							{editItem ? 'Taomni tahrirlash' : 'Yangi Taom'}
						</DialogTitle>
						<p className='text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5'>
							Admin boshqaruv paneli
						</p>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className='p-6 space-y-4 dark:bg-slate-900'
				>
					{/* Nomi */}
					<div className='space-y-1.5'>
						<Label className='text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1'>
							Taom nomi
						</Label>
						<Input
							required
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							className='h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-800 dark:text-white font-semibold px-5 focus:ring-2 ring-indigo-100 dark:ring-indigo-500/30 shadow-none placeholder-slate-400 dark:placeholder-slate-500'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-1.5'>
							<Label className='text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1'>
								Narxi
							</Label>
							<Input
								required
								type='number'
								value={formData.price}
								onChange={e =>
									setFormData({ ...formData, price: e.target.value })
								}
								className='h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-800 dark:text-white font-semibold px-5 focus:ring-2 ring-indigo-100 dark:ring-indigo-500/30 shadow-none placeholder-slate-400 dark:placeholder-slate-500'
							/>
						</div>
						<div className='space-y-1.5'>
							<Label className='text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1'>
								Kategoriya
							</Label>
							<Select
								value={formData.category}
								onValueChange={v => setFormData({ ...formData, category: v })}
							>
								<SelectTrigger className='h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-800 dark:text-white font-semibold shadow-none placeholder-slate-400 dark:placeholder-slate-500'>
									<SelectValue placeholder='Tanlang' />
								</SelectTrigger>
								<SelectContent className='rounded-xl border-none shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
									{CATEGORIES.map(c => (
										<SelectItem
											key={c.id}
											value={c.id}
											className='dark:text-white dark:hover:bg-slate-700'
										>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Tavsif */}
					<div className='space-y-1.5'>
						<Label className='text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-1'>
							Tavsif (Description)
						</Label>
						<Textarea
							value={formData.description}
							onChange={e =>
								setFormData({ ...formData, description: e.target.value })
							}
							className='min-h-[80px] rounded-xl border-none bg-slate-50 dark:bg-slate-800 dark:text-white font-medium p-4 focus:ring-2 ring-indigo-100 dark:ring-indigo-500/30 resize-none shadow-none placeholder-slate-400 dark:placeholder-slate-500'
							placeholder="Taom haqida qisqacha ma'lumot..."
						/>
					</div>

					{/* Rasm URL */}
					<div className='space-y-1.5'>
						<Label className='text-[10px] font-bold uppercase text-indigo-500 dark:text-indigo-400 ml-1'>
							Rasm URL (Image URL)
						</Label>
						<div className='relative'>
							<Input
								value={formData.image_url}
								onChange={e =>
									setFormData({ ...formData, image_url: e.target.value })
								}
								className='h-12 rounded-xl border-none bg-indigo-50 dark:bg-indigo-950/30 dark:text-white font-medium pl-11 pr-5 focus:ring-2 ring-indigo-100 dark:ring-indigo-500/30 shadow-none placeholder-slate-400 dark:placeholder-slate-500'
								placeholder='https://misol.uz/rasm.jpg'
							/>
							<LinkIcon
								size={18}
								className='absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-300'
							/>
						</div>
					</div>

					{/* Checkboxlar */}
					<div className='flex gap-3'>
						<div
							className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
								formData.available_on_website
									? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
									: 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
							}`}
							onClick={() =>
								setFormData(p => ({
									...p,
									available_on_website: !p.available_on_website,
								}))
							}
						>
							<span className='text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400'>
								Veb-sayt
							</span>
							<Checkbox
								checked={formData.available_on_website}
								onCheckedChange={v =>
									setFormData(p => ({ ...p, available_on_website: !!v }))
								}
								onClick={e => e.stopPropagation()}
								className='dark:border-slate-600 dark:bg-slate-700'
							/>
						</div>
						<div
							className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
								formData.available_on_mobile
									? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
									: 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
							}`}
							onClick={() =>
								setFormData(p => ({
									...p,
									available_on_mobile: !p.available_on_mobile,
								}))
							}
						>
							<span className='text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400'>
								Mobil
							</span>
							<Checkbox
								checked={formData.available_on_mobile}
								onCheckedChange={v =>
									setFormData(p => ({ ...p, available_on_mobile: !!v }))
								}
								onClick={e => e.stopPropagation()}
								className='dark:border-slate-600 dark:bg-slate-700'
							/>
						</div>
					</div>

					<div className='flex gap-3 pt-2'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => onOpenChange(false)}
							className='flex-1 h-12 rounded-xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
						>
							BEKOR QILISH
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='flex-[1.5] h-12 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95'
						>
							{loading ? <Loader2 className='animate-spin' /> : 'SAQLASH'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
