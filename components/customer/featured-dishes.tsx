'use client'

import { useMenuStore } from '@/lib/store'
import { MenuCard } from './menu-card'

export function FeaturedDishes() {
	const items = useMenuStore(state => state.items)
	const featuredItems = items
		.filter(item => item.available_on_website)
		.slice(0, 8)

	return (
		<section className='py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-300'>
			{/* Background Blobs */}
			<div className='absolute top-0 right-1/4 w-96 h-96 bg-red-100 dark:bg-red-950 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-30 dark:opacity-10 animate-blob' />
			<div className='absolute -bottom-8 left-1/3 w-80 h-80 bg-blue-100 dark:bg-blue-950 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000' />

			<div className='relative z-10'>
				<div className='text-center mb-16'>
					<h2 className='text-4xl md:text-5xl font-black mb-6 text-black dark:text-white uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-none'>
						Mashhur Taomlar
					</h2>
					<div className='max-w-2xl mx-auto relative'>
						<div className='absolute inset-0 bg-red-600/10 dark:bg-red-600/20 blur-xl rounded-full' />
						<p className='text-sm md:text-base text-gray-600 dark:text-slate-400 font-bold uppercase tracking-widest relative z-10'>
							Eng ko'p buyurtma qilinadigan an'anaviy o'zbek taomlari
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 md:px-6 max-w-7xl mx-auto'>
					{featuredItems.length > 0 ? (
						featuredItems.map(item => <MenuCard key={item.id} item={item} />)
					) : (
						<div className='col-span-full py-20 text-center'>
							<p className='text-gray-400 dark:text-slate-500 font-bold text-lg'>
								Taomlar yuklanmoqda...
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
