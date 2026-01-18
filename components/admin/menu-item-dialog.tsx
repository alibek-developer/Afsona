'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface MenuItemDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	editItem?: MenuItem | null
}

export function MenuItemDialog({
	open,
	onOpenChange,
	editItem,
}: MenuItemDialogProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [category, setCategory] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [availableOnWebsite, setAvailableOnWebsite] = useState(true)
	const [availableOnMobile, setAvailableOnMobile] = useState(true)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (editItem) {
			setName(editItem.name)
			setDescription(editItem.description)
			setPrice(editItem.price.toString())
			setCategory(editItem.category)
			setImageUrl(editItem.image_url)
			setAvailableOnWebsite(editItem.available_on_website)
			setAvailableOnMobile(editItem.available_on_mobile)
		} else {
			resetForm()
		}
	}, [editItem, open])

	const resetForm = () => {
		setName('')
		setDescription('')
		setPrice('')
		setCategory('')
		setImageUrl('')
		setAvailableOnWebsite(true)
		setAvailableOnMobile(true)
	}

	const handleWebsiteChange = (checked: boolean) => {
		console.log('Dialog: Website checkbox changed:', checked)
		setAvailableOnWebsite(checked)
	}

	const handleMobileChange = (checked: boolean) => {
		console.log('Dialog: Mobile checkbox changed:', checked)
		setAvailableOnMobile(checked)
	}

	const handleSubmit = async () => {
		setLoading(true)

		// Validatsiya
		const priceNum = Number.parseInt(price, 10)
		if (isNaN(priceNum) || priceNum <= 0) {
			toast.error("Narx noto'g'ri formatda")
			setLoading(false)
			return
		}

		const itemData = {
			name: name.trim(),
			description: description.trim(),
			price: priceNum,
			category,
			image_url: imageUrl.trim() || '/placeholder.svg?height=300&width=400',
			available_on_website: availableOnWebsite,
			available_on_mobile: availableOnMobile,
		}

		console.log("Yuborilayotgan ma'lumot:", JSON.stringify(itemData, null, 2))

		try {
			if (editItem) {
				const { data, error } = await supabase
					.from('menu_items')
					.update(itemData)
					.eq('id', editItem.id)
					.select()

				if (error) {
					console.error('Update xatosi:', {
						message: error.message,
						details: error.details,
						hint: error.hint,
						code: error.code,
					})
					throw new Error(error.message || 'Yangilashda xatolik')
				}

				console.log("Yangilangan ma'lumot:", data)
				toast('Taom yangilandi', {
					className:
						'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
				})
			} else {
				const { data, error } = await supabase
					.from('menu_items')
					.insert([itemData])
					.select()

				if (error) {
					console.error('Insert xatosi:', {
						message: error.message,
						details: error.details,
						hint: error.hint,
						code: error.code,
					})
					throw new Error(error.message || "Qo'shishda xatolik")
				}

				console.log("Qo'shilgan ma'lumot:", data)
				toast("Yangi taom qo'shildi", {
					className:
						'bg-primary text-primary-foreground border border-primary/30 shadow-lg',
				})
			}
			onOpenChange(false)
			resetForm()
		} catch (error: any) {
			console.log("To'liq xato obyekti:", error)
			toast.error(`Xatolik: ${error?.message || "Noma'lum xatolik"}`)
		} finally {
			setLoading(false)
		}
	}

	const isValid = name && description && price && category

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editItem ? 'Taomni tahrirlash' : "Yangi taom qo'shish"}
					</DialogTitle>
					<DialogDescription>
						{editItem
							? "Taom ma'lumotlarini o'zgartiring"
							: "Menyuga yangi taom qo'shing"}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<div>
						<Label htmlFor='item-name'>Nomi</Label>
						<Input
							id='item-name'
							value={name}
							onChange={e => setName(e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor='item-desc'>Tavsif</Label>
						<Textarea
							id='item-desc'
							value={description}
							onChange={e => setDescription(e.target.value)}
							rows={2}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='item-price'>Narxi (so'm)</Label>
							<Input
								id='item-price'
								type='number'
								value={price}
								onChange={e => setPrice(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor='item-category'>Kategoriya</Label>
							<Select value={category} onValueChange={setCategory}>
								<SelectTrigger className='bg-background'>
									<SelectValue placeholder='Tanlang' />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map(cat => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.icon} {cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div>
						<Label htmlFor='item-image'>Rasm URL</Label>
						<Input
							id='item-image'
							value={imageUrl}
							onChange={e => setImageUrl(e.target.value)}
							placeholder='/placeholder.svg'
						/>
					</div>

					<div className='flex gap-6'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='available-website'
								checked={availableOnWebsite}
								onCheckedChange={checked =>
									handleWebsiteChange(checked as boolean)
								}
							/>
							<Label htmlFor='available-website'>Saytda ko'rsatish</Label>
						</div>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='available-mobile'
								checked={availableOnMobile}
								onCheckedChange={checked =>
									handleMobileChange(checked as boolean)
								}
							/>
							<Label htmlFor='available-mobile'>Mobileda ko'rsatish</Label>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Bekor qilish
					</Button>
					<Button onClick={handleSubmit} disabled={!isValid || loading}>
						{loading ? 'Saqlanmoqda...' : editItem ? 'Saqlash' : "Qo'shish"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
