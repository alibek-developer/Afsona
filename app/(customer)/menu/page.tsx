'use client'

import { CategoryFilter } from '@/components/customer/category-filter'
import { MenuCard } from '@/components/customer/menu-card'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
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

	// Pagination statelari
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 12 // Sahifada 12 ta taom (3 yoki 4 ustunli grid uchun qulay)

	useEffect(() => {
		fetchMenuItems()
	}, [])

	const fetchMenuItems = async () => {
		try {
			setLoading(true)
			// Bazadan faqat saytda ko'rinishi kerak bo'lgan taomlarni yuklaymiz
			const { data, error } = await supabase
				.from('menu_items')
				.select('*')
				.eq('available_on_website', true)
				.eq('is_available', true)
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
		setCurrentPage(1)
	}, [searchParams])

	// FILTRLASH QISMI - faqat kategoriya bo'yicha filtr, qolganlari SQL darajasida hal qilingan
	const filteredItems = items.filter(item => {
		// Kategoriya bo'yicha filtr
		if (
			selectedCategory &&
			selectedCategory !== 'all' &&
			item.category !== selectedCategory
		) {
			return false
		}
		return true
	})

	// Pagination hisob-kitobi
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const currentDisplayedItems = filteredItems.slice(
		startIndex,
		startIndex + itemsPerPage,
	)

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center py-20'>
				<div className='relative w-16 h-16 mb-4'>
					<Loader2
						className='w-16 h-16 text-red-500 animate-spin'
						strokeWidth={1.5}
					/>
				</div>
				<p className='text-gray-500 font-bold text-lg uppercase tracking-widest'>
					Menyu yuklanmoqda...
				</p>
			</div>
		)
	}

	return (
		<div className='max-w-[1300px] mx-auto px-4 md:px-8 space-y-12'>
			<div className='text-center'>
				<h1 className='text-5xl md:text-7xl font-black mb-6 text-black dark:text-white uppercase tracking-tighter'>
					MENYU
				</h1>
				<div className='flex items-center justify-center gap-4 mb-10'>
					<div className='h-[2px] w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent'></div>
					<p className='text-gray-500 dark:text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs'>
						Zamonaviy Taomlar
					</p>
					<div className='h-[2px] w-12 bg-gradient-to-r from-transparent via-red-600 to-transparent'></div>
				</div>

				<CategoryFilter
					selected={selectedCategory}
					onSelect={setSelectedCategory}
				/>
			</div>

			{currentDisplayedItems.length === 0 ? (
				<div className='flex items-center justify-center py-20'>
					<div className='text-center bg-slate-50 dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-slate-800 p-16 max-w-2xl w-full'>
						<p className='text-gray-400 font-bold text-lg'>
							Hozircha bu bo'limda taomlar yo'q
						</p>
					</div>
				</div>
			) : (
				<div className='space-y-12'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10'>
						{currentDisplayedItems.map(item => (
							<MenuCard key={item.id} item={item} />
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className='flex items-center justify-center gap-3 pt-8 pb-4'>
							<button
								onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className='p-2 rounded-xl border border-gray-200 dark:border-slate-800 disabled:opacity-20 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all'
							>
								<ChevronLeft className='w-6 h-6' />
							</button>

							<div className='flex items-center gap-2'>
								{[...Array(totalPages)].map((_, i) => (
									<button
										key={i + 1}
										onClick={() => setCurrentPage(i + 1)}
										className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
											currentPage === i + 1
												? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
												: 'bg-gray-100 dark:bg-slate-900 text-gray-500 hover:bg-gray-200'
										}`}
									>
										{i + 1}
									</button>
								))}
							</div>

							<button
								onClick={() =>
									setCurrentPage(prev => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className='p-2 rounded-xl border border-gray-200 dark:border-slate-800 disabled:opacity-20 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all'
							>
								<ChevronRight className='w-6 h-6' />
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default function MenuPage() {
	return (
		<div className='min-h-screen bg-white dark:bg-slate-950 py-12 md:py-20'>
			<Suspense
				fallback={
					<div className='flex justify-center py-20'>
						<Loader2 className='animate-spin text-red-500' />
					</div>
				}
			>
				<MenuContent />
			</Suspense>
		</div>
	)
}
