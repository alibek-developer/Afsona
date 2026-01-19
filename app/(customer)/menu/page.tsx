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

	const filteredItems = items.filter(item => {
		if (item.available_on_website !== true) return false
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
			<div className='flex flex-col items-center justify-center py-20 animate-pulse'>
				<div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4'></div>
				<p className='text-gray-500 font-medium'>Menyu yuklanmoqda...</p>
			</div>
		)
	}

	return (
		<div className='max-w-[1400px] mx-auto px-4 md:px-8'>
			{/* Sarlavha qismi */}
			<div className='mb-12 text-center'>
				<h1 className='text-5xl md:text-7xl font-black mb-3 text-black uppercase tracking-tighter'>
					MENYU
				</h1>
				<div className='flex items-center justify-center gap-4 mb-10'>
					<div className='h-[2px] w-8 md:w-12 bg-red-600'></div>
					<p className='text-gray-500 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs'>
						Zamonaviy Taomlar
					</p>
					<div className='h-[2px] w-8 md:w-12 bg-red-600'></div>
				</div>

				{/* Filtrlarni o'rtaga olish */}
				<div className='inline-block w-full overflow-x-auto pb-4 no-scrollbar'>
					<CategoryFilter
						selected={selectedCategory}
						onSelect={setSelectedCategory}
					/>
				</div>
			</div>

			{/* Grid tizimi: Katta ekranda ham markazda turishi uchun max-w va mx-auto */}
			{filteredItems.length === 0 ? (
				<div className='text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200'>
					<p className='text-gray-400 font-medium'>
						Hozircha ushbu bo'limda taomlar mavjud emas.
					</p>
				</div>
			) : (
				<div className='flex justify-center'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 w-full'>
						{filteredItems.map(item => (
							<div key={item.id} className='flex justify-center'>
								<MenuCard item={item} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default function MenuPage() {
	return (
		<div className='min-h-screen bg-white py-12 md:py-20'>
			<Suspense
				fallback={
					<div className='text-center py-20 font-bold tracking-widest'>
						YUKLANMOQDA...
					</div>
				}
			>
				<MenuContent />
			</Suspense>
		</div>
	)
}
