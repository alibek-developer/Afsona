'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Star, Truck } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
	return (
		<section className='relative min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden py-16 md:py-24 transition-colors duration-300'>
			{/* Animated Background Gradient */}
			<div className='absolute inset-0 dark:hidden'>
				<div className='absolute top-0 right-0 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
				<div className='absolute bottom-0 left-0 w-72 h-72 bg-red-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
			</div>

			<div className='hidden dark:block absolute inset-0'>
				<div className='absolute top-0 right-0 w-72 h-72 bg-red-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob'></div>
				<div className='absolute bottom-0 left-0 w-72 h-72 bg-red-800 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000'></div>
			</div>

			<div className='relative z-10 w-full max-w-6xl mx-auto px-6 text-center'>
				{/* Sarlavha */}
				<motion.h1
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className='text-5xl md:text-6xl lg:text-7xl font-black text-black dark:text-white uppercase leading-[1.05] mb-8 tracking-tighter'
				>
					An'anaviy <br />{' '}
					<span className='text-red-600 dark:text-red-500'>O'zbek</span>{' '}
					Taomlari
				</motion.h1>

				{/* Ta'rif bloki */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className='max-w-2xl mx-auto mb-12'
				>
					<div className='bg-slate-50 dark:bg-slate-900 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-7 md:p-9 shadow-sm dark:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-md dark:hover:shadow-[0_0_40px_rgba(239,68,68,0.2)] transition-all duration-300'>
						<p className='text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-semibold'>
							Eng mazali palov, lag'mon, manti va milliy taomlarimizni hozir
							uyingizga yoki zalda tatib ko'ring. Sifatli mahsulotlar, oilaviy
							retseptlar, issiq holda yetkazib beramiz.
						</p>
					</div>
				</motion.div>

				{/* Asosiy tugmalar */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className='flex flex-col sm:flex-row gap-5 justify-center items-center mb-16'
				>
					<Button
						asChild
						className='bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white font-black text-base md:text-lg px-10 py-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.4)] transition-all border-2 border-black dark:border-red-500 uppercase active:scale-95 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] dark:drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]'
					>
						<Link href='/menu'>Menyuni ko'rish →</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						className='bg-white dark:bg-slate-900 text-black dark:text-white font-black text-base md:text-lg px-10 py-8 rounded-2xl border-2 border-black dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all uppercase active:scale-95 dark:hover:border-red-600 dark:hover:bg-slate-800'
					>
						<Link href='/checkout'>Tez buyurtma</Link>
					</Button>
				</motion.div>

				{/* Pastki xususiyatlar */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className='flex flex-wrap justify-center gap-4 md:gap-6'
				>
					<div className='flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 dark:hover:border-red-600 transition-all'>
						<Truck className='h-5 w-5 text-red-600 dark:text-red-500' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-300'>
							3 km gacha{' '}
							<span className='text-red-600 dark:text-red-400'>BEPUL</span>{' '}
							yetkazish
						</span>
					</div>

					<div className='flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 dark:hover:border-red-600 transition-all'>
						<Clock className='h-5 w-5 text-red-600 dark:text-red-500' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-300'>
							30-45 daqiqada{' '}
							<span className='text-red-600 dark:text-red-400'>ISSIQ</span>{' '}
							holda
						</span>
					</div>

					<div className='flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 dark:hover:border-red-600 transition-all'>
						<Star className='h-5 w-5 text-red-600 dark:text-red-500 fill-red-600 dark:fill-red-500' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide text-black dark:text-slate-300'>
							100%{' '}
							<span className='text-red-600 dark:text-red-400'>TABIIY</span>{' '}
							mahsulotlar
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
