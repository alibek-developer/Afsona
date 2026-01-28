'use client'

import { useMenuStore } from '@/lib/store'
import { motion } from 'framer-motion' // Animatsiya qo'shildi
import { MenuCard } from './menu-card'

export function FeaturedDishes() {
	const items = useMenuStore(state => state.items)
	const featuredItems = items
		.filter(item => item.available_on_website)
		.slice(0, 8)

	return (
		<section className='py-16 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500'>
			{/* Background Decor */}
			<div className='absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent' />

			<div className='absolute top-1/4 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]' />
			<div className='absolute bottom-1/4 left-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]' />

			<div className='relative z-10 container mx-auto px-4 md:px-6'>
				{/* Sarlavha Dizayni */}
				<div className='flex flex-col items-center text-center mb-12 md:mb-20'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className='inline-block mb-4'
					>
						<span className='bg-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'>
							Tavsiya qilamiz
						</span>
					</motion.div>

					<h2 className='text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-6'>
						Mashhur <span className='text-red-600'>Taomlar</span>
					</h2>

					<div className='h-1.5 w-24 bg-black dark:bg-red-600 rounded-full' />
				</div>

				{/* Grid: Mobil qurilmalarda 2 ta, planshetda 2 ta, kompyuterda 4 ta */}
				<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 max-w-7xl mx-auto'>
					{featuredItems.length > 0 ? (
						featuredItems.map((item, index) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
							>
								<MenuCard item={item} />
							</motion.div>
						))
					) : (
						<div className='col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]'>
							<div className='animate-bounce mb-4 text-4xl'>🥘</div>
							<p className='text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-sm'>
								Mazali taomlar tayyorlanmoqda...
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
