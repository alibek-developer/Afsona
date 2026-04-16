'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Clock, Users, Award, Car } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
	return (
		<>
			<section className='relative min-h-[90vh] w-full flex items-center bg-slate-50 dark:bg-black overflow-hidden pt-20 pb-10'>
				{/* Orqa fon rasmi (To'liq qoplovchi) */}
				<div 
					className='absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-40'
					style={{ backgroundImage: 'url("/hero-bg.jpg")' }} // As a placeholder, use a generic or missing image bg color
				/>
				
				{/* Gradient Overlay for better readability */}
				<div className='absolute inset-0 z-0 bg-gradient-to-r from-white/80 via-white/50 to-white/10 dark:from-black/80 dark:via-black/50 dark:to-transparent' />

				<div className='relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center'>
					{/* CHAP TOMON: MATNLAR */}
					<div className='text-left space-y-6 max-w-2xl'>
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-50 dark:bg-red-950/20 backdrop-blur-sm'
						>
							<span className='text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-500'>
								ENG SEVIMLI VA ZAMONAVIY
							</span>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
						>
							<h1 className='text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-2'>
								Haqiqiy<br />
								<span className='text-red-600 italic bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 dark:from-red-500 dark:to-red-700'>
									Lazzat
								</span><br />
								San'ati
							</h1>
						</motion.div>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className='text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed max-w-lg mb-8'
						>
							Asrlar davomida sayqal topgan retseptlar, sarxil masalliqlar va milliy mehmondo'stlikning eng sara namunalari bir manzilda.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className='flex flex-wrap gap-4'
						>
							<Button
								asChild
								className='h-14 sm:h-16 px-8 sm:px-10 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl sm:rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] uppercase tracking-widest flex items-center gap-3 text-xs sm:text-sm'
							>
								<Link href='/menu'>
									Menyuni ko'rish
								</Link>
							</Button>

							<Button
								asChild
								variant='outline'
								className='h-14 sm:h-16 px-8 sm:px-10 border-2 border-slate-900/10 dark:border-white/20 bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-xs sm:text-sm transition-all hover:border-slate-900/30 dark:hover:border-white/40'
							>
								<Link href='/reservations'>Stol band qilish</Link>
							</Button>
						</motion.div>
					</div>

					{/* Float Card */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 50 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{ delay: 1, duration: 0.6, type: 'spring' }}
						className='absolute bottom-10 right-6 lg:right-10 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/20 p-4 lg:p-5 rounded-2xl shadow-2xl flex items-center gap-4 group hover:bg-white dark:hover:bg-white/20 transition-all'
					>
						<div className='w-12 h-12 lg:w-14 lg:h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform'>
							<Car strokeWidth={1.5} size={24} />
						</div>
						<div className='pr-4 text-left'>
							<p className='text-sm lg:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1'>
								Tezkor Yetkazib Berish
							</p>
							<div className='flex items-center gap-2'>
								<span className='w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse'></span>
								<p className='text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest'>
									Hozir Ochiq
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* STATISTICS BANNER */}
			<section className='bg-white dark:bg-slate-950 py-8 lg:py-12 border-b border-slate-100 dark:border-slate-900 shadow-sm relative z-20'>
				<div className='max-w-7xl mx-auto px-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-1 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800'>
						{/* Stat 1 */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className='flex flex-col items-center justify-center pt-4 md:pt-0 gap-3 group'
						>
							<div className='w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-transform'>
								<Clock className='text-red-500' size={24} />
							</div>
							<div className='text-center'>
								<h3 className='text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1'>
									30+ YILLIK
								</h3>
								<p className='text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500'>
									Tajriba
								</p>
							</div>
						</motion.div>

						{/* Stat 2 */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className='flex flex-col items-center justify-center pt-8 md:pt-0 gap-3 group'
						>
							<div className='w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-transform'>
								<Users className='text-red-500' size={24} />
							</div>
							<div className='text-center'>
								<h3 className='text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1'>
									50+ USTA
								</h3>
								<p className='text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500'>
									Oshpazlar
								</p>
							</div>
						</motion.div>

						{/* Stat 3 */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className='flex flex-col items-center justify-center pt-8 md:pt-0 gap-3 group'
						>
							<div className='w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-transform'>
								<Star className='text-red-500 fill-red-500' size={24} />
							</div>
							<div className='text-center'>
								<h3 className='text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1'>
									4.9<span className='text-red-500 ml-1'>★</span> MIJOZLAR
								</h3>
								<p className='text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500'>
									Reytingi
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</>
	)
}
