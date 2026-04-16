'use client'

import { MapPin, Box, Award, ChefHat } from 'lucide-react'
import { motion } from 'framer-motion'

export function CustomerFeatures() {
	const features = [
		{
			title: 'Tezkor Yetkazish',
			description: 'Kutishning aslo keragi yoq, buyurtmangiz tez fursatda yetkazib beriladi.',
			icon: MapPin,
		},
		{
			title: 'Yangi Mahsulotlar',
			description: 'Xar bir taom yangi va sarxil mahsulotlardan tayyorlanadi.',
			icon: Box,
		},
		{
			title: 'Yuqori Sifat',
			description: 'Xar bir taom retseptga qoyilgan qoidalarga asosan tayyorlanadi.',
			icon: Award,
		},
		{
			title: 'Usta Oshpazlar',
			description: 'Ko\'p yillik tajribaga ega bo\'lgan haqiqiy o\'z ishi ustalari.',
			icon: ChefHat,
		},
	]

	return (
		<section className='bg-slate-50 dark:bg-[#020617] py-20'>
			<div className='max-w-7xl mx-auto px-6'>
				<div className='mb-12'>
					<h2 className='text-3xl lg:text-4xl font-black text-red-600 tracking-tight'>
						Nima uchun Afsona?
					</h2>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{features.map((feature, i) => {
						const Icon = feature.icon
						return (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
								key={i}
								className='bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col group'
							>
								<div className='w-14 h-14 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all'>
									<Icon size={24} />
								</div>
								<h3 className='text-xl font-black text-slate-900 dark:text-white mb-3'>
									{feature.title}
								</h3>
								<p className='text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium'>
									{feature.description}
								</p>
							</motion.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
