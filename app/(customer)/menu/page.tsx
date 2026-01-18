'use client'

import { CategoryFilter } from '@/components/customer/category-filter'
import { MenuCard } from '@/components/customer/menu-card'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function MenuContent() {
	const searchParams = useSearchParams()
	const initialCategory = searchParams.get('category')
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		initialCategory,
	)
	const [items, setItems] = useState<MenuItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchMenuItems()
	}, [])

	const fetchMenuItems = async () => {
		try {
			setLoading(true)
			const { data, error } = await supabase
				.from('menu_items')
				.select('*')
				// DIQQAT: Agar bazada 'available_on_website' false bo'lsa, chiqmaydi.
				// Tekshirish uchun vaqtincha filtrni olib tashlashingiz mumkin:
				.order('created_at', { ascending: false })

			if (error) {
				console.error('Menu yuklashda xatolik:', error.message)
			} else {
				setItems(data || [])
			}
		} catch (error) {
			console.error('Fetch error:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		setSelectedCategory(searchParams.get('category'))
	}, [searchParams])

	// Filtrlash mantiqi
	const filteredItems = items.filter(item => {
		// 1. Agar admin panelda "Saytda" (available_on_website) belgilanmagan bo'lsa, ko'rsatmaydi
		if (item.available_on_website !== true) return false

		// 2. Kategoriya bo'yicha filtr
		if (
			selectedCategory &&
			selectedCategory !== 'all' &&
			item.category !== selectedCategory
		) {
			return false
		}
		return true
	})

	if (loading) {
		return (
			<div className='text-center py-16 text-muted-foreground'>
				<p>Yuklanmoqda...</p>
			</div>
		)
	}

	return (
		<>
			<div className='mb-12 text-center'>
				<h1 className='text-5xl md:text-6xl font-black mb-4 text-black uppercase tracking-tighter drop-shadow-sm'>
					MENYU
				</h1>
				<p className='text-gray-500 font-bold tracking-widest uppercase text-xs'>
					Zamonaviy Taomlar
				</p>
				<CategoryFilter
					selected={selectedCategory}
					onSelect={setSelectedCategory}
				/>
			</div>

			{filteredItems.length === 0 ? (
				<div className='text-center py-16 text-muted-foreground'>
					<p>
						Hozircha taomlar mavjud emas yoki tanlangan kategoriyada taom
						topilmadi.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
					{filteredItems.map(item => (
						<MenuCard key={item.id} item={item} />
					))}
				</div>
			)}
		</>
	)
}

export default function MenuPage() {
	return (
		<div className='py-12'>
			<Suspense
				fallback={<div className='text-center py-16'>Yuklanmoqda...</div>}
			>
				<MenuContent />
			</Suspense>
		</div>
	)
}

// Client componentda 'export const revalidate' ishlamaydi,
// lekin useEffect ichidagi setLoading va fetch har gal sahifa yuklanganda ishlaydi.
