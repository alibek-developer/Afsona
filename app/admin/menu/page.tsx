'use client'

import { MenuItemDialog } from '@/components/admin/menu-item-dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Price } from '@/components/ui/price'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { motion } from 'framer-motion'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminMenuPage() {
	const [items, setItems] = useState<MenuItem[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [showAddDialog, setShowAddDialog] = useState(false)
	const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
	const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)

	useEffect(() => {
		fetchItems()

		const channel = supabase
			.channel('menu_items')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'menu_items' },
				() => {
					fetchItems()
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [])

	const fetchItems = async () => {
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Error fetching items:', error)
			toast.error("Ma'lumotlarni yuklashda xatolik")
		} else {
			setItems(data || [])
		}
	}

	const filteredItems = items.filter(item =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const getCategoryName = (categoryId: string) => {
		return CATEGORIES.find(c => c.id === categoryId)?.name || categoryId
	}

	const handleToggleWebsite = async (item: MenuItem, checked: boolean) => {
		console.log(`Toggling website for ${item.name}: ${checked}`)

		// Optimistic update
		setItems(
			items.map(i =>
				i.id === item.id ? { ...i, available_on_website: checked } : i
			)
		)

		const { error } = await supabase
			.from('menu_items')
			.update({ available_on_website: checked })
			.eq('id', item.id)

		if (error) {
			console.error('Error updating website availability:', error)
			toast.error("O'zgartirishda xatolik")
			// Revert on error
			fetchItems()
		}
	}

	const handleToggleMobile = async (item: MenuItem, checked: boolean) => {
		console.log(`Toggling mobile for ${item.name}: ${checked}`)

		// Optimistic update
		setItems(
			items.map(i =>
				i.id === item.id ? { ...i, available_on_mobile: checked } : i
			)
		)

		const { error } = await supabase
			.from('menu_items')
			.update({ available_on_mobile: checked })
			.eq('id', item.id)

		if (error) {
			console.error('Error updating mobile availability:', error)
			toast.error("O'zgartirishda xatolik")
			// Revert on error
			fetchItems()
		}
	}

	const handleDelete = async () => {
		if (deletingItem) {
			const { error } = await supabase
				.from('menu_items')
				.delete()
				.eq('id', deletingItem.id)

			if (error) {
				console.error('Error deleting item:', error)
				toast.error("O'chirishda xatolik")
			} else {
				toast("Taom o'chirildi", {
					className:
						'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
				})
				setDeletingItem(null)
			}
		}
	}

	return (
		<div>
			{/* Header */}
			<div className='flex flex-wrap items-center gap-4 mb-6'>
				<div className='relative flex-1 min-w-[200px]'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Taom qidirish...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-10 bg-background rounded-2xl shadow-sm'
					/>
				</div>
				<Button
					onClick={() => setShowAddDialog(true)}
					className='rounded-2xl shadow-sm'
				>
					<Plus className='h-4 w-4 mr-2' />
					Yangi taom
				</Button>
			</div>

			{/* Menu Items Cards */}
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-extrabold tracking-tight'>
					Menyu ({filteredItems.length} ta taom)
				</h2>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{filteredItems.map(item => (
					<motion.div
						key={item.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.18 }}
					>
						<Card className='overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1'>
							<div className='relative aspect-4/3 bg-secondary'>
								<Image
									src={item.image_url || '/placeholder.svg'}
									alt={item.name}
									fill
									sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									className='object-cover'
								/>
							</div>

							<CardHeader className='pb-2'>
								<div className='flex items-start justify-between gap-3'>
									<div className='min-w-0'>
										<CardTitle className='text-base font-extrabold truncate'>
											{item.name}
										</CardTitle>
										<p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
											{item.description}
										</p>
									</div>

									<Badge variant='outline' className='rounded-full'>
										{getCategoryName(item.category)}
									</Badge>
								</div>
							</CardHeader>

							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-[11px] uppercase tracking-wide text-muted-foreground font-medium'>
											Narxi
										</p>
										<Price
											value={item.price}
											className='text-lg font-extrabold text-primary'
										/>
									</div>

									<div className='flex items-center gap-2'>
										<Button
											variant='ghost'
											size='icon'
											className='rounded-2xl'
											onClick={() => setEditingItem(item)}
											aria-label={`${item.name} tahrirlash`}
										>
											<Pencil className='h-4 w-4' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='rounded-2xl text-destructive'
											onClick={() => setDeletingItem(item)}
											aria-label={`${item.name} o'chirish`}
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-3'>
									<label className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary px-4 py-3'>
										<span className='text-xs font-medium text-muted-foreground'>
											Saytda
										</span>
										<Checkbox
											checked={item.available_on_website}
											onCheckedChange={checked =>
												handleToggleWebsite(item, checked as boolean)
											}
											aria-label={`Toggle website availability for ${item.name}`}
										/>
									</label>
									<label className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary px-4 py-3'>
										<span className='text-xs font-medium text-muted-foreground'>
											Mobileda
										</span>
										<Checkbox
											checked={item.available_on_mobile}
											onCheckedChange={checked =>
												handleToggleMobile(item, checked as boolean)
											}
											aria-label={`Toggle mobile availability for ${item.name}`}
										/>
									</label>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{filteredItems.length === 0 && (
				<Card className='shadow-md'>
					<CardContent className='text-center py-20 text-muted-foreground'>
						Taomlar topilmadi
					</CardContent>
				</Card>
			)}

			{/* Add/Edit Dialog */}
			<MenuItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
			<MenuItemDialog
				open={!!editingItem}
				onOpenChange={() => setEditingItem(null)}
				editItem={editingItem}
			/>

			{/* Delete Confirmation */}
			<AlertDialog
				open={!!deletingItem}
				onOpenChange={() => setDeletingItem(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Taomni o'chirish</AlertDialogTitle>
						<AlertDialogDescription>
							"{deletingItem?.name}" taomini o'chirmoqchimisiz? Bu amalni
							qaytarib bo'lmaydi.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Bekor qilish</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className='bg-destructive text-destructive-foreground'
						>
							O'chirish
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
