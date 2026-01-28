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
		const itemData = { ...formData, price: parseFloat(formData.price) || 0 }

		try {
			const { error } = editItem
				? await supabase
						.from('menu_items')
						.update(itemData)
						.eq('id', editItem.id)
				: await supabase.from('menu_items').insert([itemData])

			if (error) throw error
			toast.success(editItem ? 'Yangilandi!' : "Qo'shildi!")
			onOpenChange(false)
			refreshData?.()
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setLoading(false)
		}
	}

	// Ixcham input stili
	const inputStyles =
		'h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 transition-all font-medium text-sm'

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-[440px] max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl'>
				{/* Header - Android Style */}
				<div className='bg-slate-900 dark:bg-black p-5 text-white flex items-center gap-4'>
					<div className='w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center'>
						<UtensilsCrossed size={20} />
					</div>
					<div>
						<DialogTitle className='text-lg font-bold uppercase tracking-tight'>
							{editItem ? 'Tahrirlash' : 'Yangi Taom'}
						</DialogTitle>
						<p className='text-[10px] opacity-50 font-bold uppercase tracking-widest'>
							Admin Panel
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className='p-6 space-y-4'>
					<div className='space-y-1.5'>
						<Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
							Taom nomi
						</Label>
						<Input
							required
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							className={inputStyles}
							placeholder='Masalan: Milliy Palov'
						/>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<div className='space-y-1.5'>
							<Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
								Narxi
							</Label>
							<Input
								required
								type='number'
								value={formData.price}
								onChange={e =>
									setFormData({ ...formData, price: e.target.value })
								}
								className={inputStyles}
							/>
						</div>
						<div className='space-y-1.5'>
							<Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
								Kategoriya
							</Label>
							<Select
								value={formData.category}
								onValueChange={v => setFormData({ ...formData, category: v })}
							>
								<SelectTrigger className={inputStyles}>
									<SelectValue placeholder='Tanlang' />
								</SelectTrigger>
								<SelectContent className='rounded-xl border-slate-200 font-bold'>
									{CATEGORIES.map(c => (
										<SelectItem
											key={c.id}
											value={c.id}
											className='text-xs uppercase'
										>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='space-y-1.5'>
						<Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
							Tavsif
						</Label>
						<Textarea
							value={formData.description}
							onChange={e =>
								setFormData({ ...formData, description: e.target.value })
							}
							className='min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 resize-none text-sm'
							placeholder='Taom tarkibi...'
						/>
					</div>

					<div className='space-y-1.5'>
						<Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
							Rasm URL
						</Label>
						<div className='relative'>
							<Input
								value={formData.image_url}
								onChange={e =>
									setFormData({ ...formData, image_url: e.target.value })
								}
								className={`pl-10 ${inputStyles}`}
								placeholder='https://...'
							/>
							<LinkIcon
								size={16}
								className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
							/>
						</div>
					</div>

					{/* Switchers - Tozalandi */}
					<div className='flex gap-2'>
						{[
							{ id: 'available_on_website', label: 'Veb-sayt' },
							{ id: 'available_on_mobile', label: 'Mobil' },
						].map(sw => (
							<div
								key={sw.id}
								onClick={() =>
									setFormData(p => ({ ...p, [sw.id]: !(p as any)[sw.id] }))
								}
								className={`flex-1 flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
									(formData as any)[sw.id]
										? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
										: 'border-slate-100 dark:border-slate-800 bg-slate-50/50'
								}`}
							>
								<span className='text-[10px] font-bold uppercase text-slate-500'>
									{sw.label}
								</span>
								<Checkbox
									checked={(formData as any)[sw.id]}
									className='rounded-md border-slate-300'
								/>
							</div>
						))}
					</div>

					{/* Actions - Android Style Buttons */}
					<div className='flex gap-3 pt-2'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => onOpenChange(false)}
							className='flex-1 h-12 rounded-xl font-bold uppercase text-xs'
						>
							Bekor qilish
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='flex-[1.5] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-xs shadow-lg shadow-indigo-500/20'
						>
							{loading ? (
								<Loader2 className='animate-spin' size={18} />
							) : (
								'Saqlash'
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
