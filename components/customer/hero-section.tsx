'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Star, Truck } from 'lucide-react'
import { useTheme } from 'next-themes' // Mavzu uchun qo'shildi
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HeroSection() {
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	const isDark = resolvedTheme === 'dark'

	return (
		<section className='relative min-h-[85vh] md:min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden py-12 md:py-24 transition-colors duration-500'>
			{/* Orqa fon animatsiyalari - Mavzuga qarab o'zgaradi */}
			<div className='absolute inset-0 pointer-events-none'>
				<div
					className={`absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${isDark ? 'bg-red-900' : 'bg-red-100'}`}
				></div>
				<div
					className={`absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${isDark ? 'bg-red-800' : 'bg-red-50'}`}
				></div>
			</div>

			<div className='relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 text-center'>
				{/* Sarlavha - Telefonda o'lchami optimallashdi */}
				<motion.h1
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black dark:text-white uppercase leading-[1.1] mb-6 tracking-tighter'
				>
					An'anaviy <br />
					<span className='text-red-600 dark:text-red-500 inline-block mt-2'>
						O'zbek
					</span>{' '}
					Taomlari
				</motion.h1>

				{/* Ta'rif bloki */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className='max-w-2xl mx-auto mb-10'
				>
					<div className='bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border-2 border-black dark:border-slate-800 p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]'>
						<p className='text-sm md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-bold'>
							Eng mazali palov, lag'mon va milliy taomlarimizni hozir uyingizda
							yoki zalda tatib ko'ring. Sifatli mahsulotlar, oilaviy retseptlar,
							issiq holda yetkazib beramiz.
						</p>
					</div>
				</motion.div>

				{/* Tugmalar - Mobil va Desktopga mos */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'
				>
					<Button
						asChild
						className='w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-lg px-8 py-7 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none transition-all border-2 border-black uppercase italic'
					>
						<Link href='/menu'>Menyuni ko'rish</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						className='w-full sm:w-auto bg-white dark:bg-slate-900 text-black dark:text-white font-black text-lg px-8 py-7 rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none transition-all uppercase italic'
					>
						<Link href='/checkout'>Tez buyurtma</Link>
					</Button>
				</motion.div>

				{/* Xususiyatlar (Features) - Telefonda 1-2 ustun bo'ladi */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className='grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto'
				>
					{[
						{ icon: Truck, text: '3 km gacha', highlight: 'BEPUL' },
						{ icon: Clock, text: '30-45 daqiqada', highlight: 'ISSIQ' },
						{ icon: Star, text: '100% TABIIY', highlight: 'SIFAT' },
					].map((item, i) => (
						<div
							key={i}
							className='flex items-center justify-center gap-3 bg-white dark:bg-slate-900 px-4 py-4 rounded-xl border-2 border-black dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] transition-all hover:bg-red-50 dark:hover:bg-slate-800'
						>
							<item.icon className='h-5 w-5 text-red-600' />
							<span className='text-[10px] md:text-xs font-black uppercase tracking-tight text-black dark:text-slate-300'>
								{item.text}{' '}
								<span className='text-red-600'>{item.highlight}</span>
							</span>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	)
}
