'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Star, Truck } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
	return (
		<section className='relative min-h-[75vh] flex flex-col items-center justify-center bg-white overflow-hidden py-16 md:py-24'>
			<div className='relative z-10 w-full max-w-6xl mx-auto px-6 text-center'>
				{/* Sarlavha - Muvozanatli o'lcham (text-5xl dan 7xl gacha) */}
				<motion.h1
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className='text-5xl md:text-6xl lg:text-7xl font-black text-black uppercase leading-[1.05] mb-8 tracking-tighter'
				>
					An'anaviy <br /> <span className='text-red-600'>O'zbek</span> Taomlari
				</motion.h1>

				{/* Ta'rif bloki - Saytda bo'shliq qolmasligi uchun kengroq va o'qishli */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className='max-w-2xl mx-auto mb-12'
				>
					<div className='bg-slate-50/50 backdrop-blur-sm rounded-3xl border-2 border-slate-100 p-7 md:p-9 shadow-sm'>
						<p className='text-base md:text-lg text-slate-700 leading-relaxed font-semibold'>
							Eng mazali palov, lag'mon, manti va milliy taomlarimizni hozir
							uyingizga yoki zalda tatib ko'ring. Sifatli mahsulotlar, oilaviy
							retseptlar, issiq holda yetkazib beramiz.
						</p>
					</div>
				</motion.div>

				{/* Asosiy tugmalar - Kattaroq va "Hero" darajasiga mos */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className='flex flex-col sm:flex-row gap-5 justify-center items-center mb-16'
				>
					<Button
						asChild
						className='bg-red-600 hover:bg-red-700 text-white font-black text-base md:text-lg px-10 py-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black uppercase active:scale-95'
					>
						<Link href='/menu'>Menyuni ko'rish →</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						className='bg-white text-black font-black text-base md:text-lg px-10 py-8 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase active:scale-95'
					>
						<Link href='/checkout'>Tez buyurtma</Link>
					</Button>
				</motion.div>

				{/* Pastki xususiyatlar - Sayt kengligini to'ldirish uchun */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className='flex flex-wrap justify-center gap-4 md:gap-6'
				>
					<div className='flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all'>
						<Truck className='h-5 w-5 text-red-600' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide'>
							3 km gacha <span className='text-red-600'>BEPUL</span> yetkazish
						</span>
					</div>

					<div className='flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all'>
						<Clock className='h-5 w-5 text-red-600' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide'>
							30-45 daqiqada <span className='text-red-600'>ISSIQ</span> holda
						</span>
					</div>

					<div className='flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all'>
						<Star className='h-5 w-5 text-red-600 fill-red-600' />
						<span className='text-xs md:text-sm font-black uppercase tracking-wide'>
							100% <span className='text-red-600'>TABIIY</span> mahsulotlar
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
