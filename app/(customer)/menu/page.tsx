'use client'

import { CategoryFilter } from '@/components/customer/category-filter'
import { MenuCard } from '@/components/customer/menu-card'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { Loader2 } from 'lucide-react'
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
			<div className='flex  flex-col items-center justify-center py-20'>
				<div className='relative w-16 h-16 mb-4'>
					<Loader2
						className='w-16 h-16 text-red-500 dark:text-red-400 animate-spin'
						strokeWidth={1.5}
					/>
				</div>
				<p className='text-gray-500 dark:text-slate-400 font-bold text-lg uppercase tracking-widest'>
					Menyu yuklanmoqda...
				</p>
			</div>
		)
	}

	return (
		<div className='max-w-[1300px] mx-auto px-4 md:px-8 space-y-12'>
			{/* Sarlavha qismi */}
			<div className='text-center'>
				<h1 className='text-5xl md:text-7xl font-black mb-6 text-black dark:text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-none'>
					MENYU
				</h1>
				<div className='flex items-center justify-center gap-4 mb-10'>
					<div className='h-[2px] w-8 md:w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent dark:via-red-500'></div>
					<p className='text-gray-500 dark:text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs whitespace-nowrap'>
						Zamonaviy Taomlar
					</p>
					<div className='h-[2px] w-8 md:w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent dark:via-red-500'></div>
				</div>

				{/* Kategoriya filteri */}
				<div className='inline-block w-full'>
					<CategoryFilter
						selected={selectedCategory}
						onSelect={setSelectedCategory}
					/>
				</div>
			</div>

			{/* Grid tizimi */}
			{filteredItems.length === 0 ? (
				<div className='flex items-center justify-center py-20'>
					<div className='text-center bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-[0_0_30px_rgba(239,68,68,0.1)] px-8 py-16 max-w-2xl'>
						<div className='w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-8 h-8 text-red-500 dark:text-red-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</div>
						<p className='text-gray-400 dark:text-slate-500 font-bold text-lg mb-2'>
							Taomlar topilmadi
						</p>
						<p className='text-gray-400 dark:text-slate-500 text-sm'>
							Hozircha ushbu bo'limda taomlar mavjud emas.
						</p>
					</div>
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
		<div className='min-h-screen bg-white dark:bg-slate-950 py-12 md:py-20 transition-colors duration-300'>
			{/* Background gradient animatsiya */}
			<div className='fixed inset-0 -z-10 pointer-events-none'>
				<div className='absolute top-0 right-1/4 w-96 h-96 bg-red-50 dark:bg-red-950 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-0 dark:opacity-10 animate-blob'></div>
				<div className='absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-50 dark:bg-blue-950 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-0 dark:opacity-10 animate-blob animation-delay-2000'></div>
			</div>

			<Suspense
				fallback={
					<div className='flex items-center justify-center py-20'>
						<div className='relative'>
							<Loader2
								className='w-12 h-12 text-red-500 dark:text-red-400 animate-spin'
								strokeWidth={1.5}
							/>
						</div>
					</div>
				}
			>
				<MenuContent />
			</Suspense>
		</div>
	)
}
