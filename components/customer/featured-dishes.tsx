'use client'

import { useMenuStore } from '@/lib/store'
import { MenuCard } from './menu-card'

export function FeaturedDishes() {
	const items = useMenuStore(state => state.items)
	const featuredItems = items
		.filter(item => item.available_on_website)
		.slice(0, 8) // Show 8 items to fill 2 rows of 4

	return (
		<section className='py-16 bg-gradient-to-b from-white to-slate-50'>
			<div className='text-center mb-12'>
				<h2 className='text-4xl md:text-5xl font-black mb-4 text-black uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]'>
					Mashhur Taomlar
				</h2>
				<div className='max-w-2xl mx-auto relative'>
					<div className='absolute inset-0 bg-red-600/10 blur-xl rounded-full' />
					<p className='text-sm md:text-base text-gray-600 font-bold uppercase tracking-widest relative z-10'>
						Eng ko'p buyurtma qilinadigan an'anaviy o'zbek taomlari
					</p>
				</div>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto'>
				{featuredItems.map(item => (
					<MenuCard key={item.id} item={item} />
				))}
			</div>
		</section>
	)
}
