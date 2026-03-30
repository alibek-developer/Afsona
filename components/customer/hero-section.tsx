'use client'

import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star, Truck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function HeroSection() {
	const [mounted, setMounted] = useState(false)
	const containerRef = useRef(null)

	// Parallax effekti uchun
	const { scrollY } = useScroll()
	const y1 = useTransform(scrollY, [0, 500], [0, 200])
	const y2 = useTransform(scrollY, [0, 500], [0, -150])

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<section
			ref={containerRef}
			className='relative min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#020617] overflow-hidden py-20'
		>
			{/* 1. DINAMIK FON ELEMLARI (Premium vibe) */}
			<div className='absolute inset-0 pointer-events-none'>
				<motion.div
					style={{ y: y1 }}
					className='absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full'
				/>
				<motion.div
					style={{ y: y2 }}
					className='absolute bottom-[10%] right-[5%] w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full'
				/>

				{/* Pattern - nozik setka */}
				<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
			</div>

			<div className='relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
				{/* CHAP TOMON: MATNLAR */}
				<div className='text-left space-y-8'>
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50'
					>
						<Star className='h-4 w-4 text-red-600 fill-red-600' />
						<span className='text-[10px] font-black uppercase tracking-[0.2em] text-red-600'>
							Eng sara restoran 2024
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: 'circOut' }}
					>
						<h1 className='text-6xl md:text-8xl font-black tracking-normal  uppercase leading-[0.9]'>
							<span className='text-slate-900 dark:text-white'>Haqiqiy</span>{' '}
							<br />
							<span className='text-red-600 relative'>
								Lazzat
								<svg
									className='absolute -bottom-2 left-0 w-full h-3 text-red-600/20'
									viewBox='0 0 100 10'
									preserveAspectRatio='none'
								>
									<path
										d='M0 5 Q 25 0 50 5 T 100 5'
										stroke='currentColor'
										strokeWidth='2'
										fill='none'
									/>
								</svg>
							</span>{' '}
							<br />
							<span className='text-slate-900 dark:text-white'>San'ati</span>
						</h1>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className='max-w-lg text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed'
					>
						Milliy an'analar va zamonaviy gastronomiyaning uyg'unligi. Siz uchun
						eng sara masalliqlardan tayyorlangan o'zbekona shohona taomlar.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className='flex flex-wrap gap-4'
					>
						<Button
							asChild
							className='h-16 px-10 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-[0_20px_40px_rgba(220,38,38,0.25)] uppercase tracking-widest flex items-center gap-3'
						>
							<Link href='/menu'>
								Menyuni ko'rish
								<ArrowRight className='h-5 w-5' />
							</Link>
						</Button>

						<Button
							asChild
							variant='outline'
							className='h-16 px-10 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 uppercase tracking-widest'
						>
							<Link href='/about'>Biz haqimizda</Link>
						</Button>
					</motion.div>

					{/* FEATURES GRID */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						className='pt-8 flex items-center gap-10 border-t border-slate-100 dark:border-slate-900'
					>
						<div className='flex flex-col gap-1'>
							<span className='text-2xl font-black text-slate-900 dark:text-white'>
								30+
							</span>
							<span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
								Turli taomlar
							</span>
						</div>
						<div className='flex flex-col gap-1'>
							<span className='text-2xl font-black text-slate-900 dark:text-white'>
								4.9
							</span>
							<span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
								Mijozlar reytingi
							</span>
						</div>
						<div className='flex flex-col gap-1'>
							<span className='text-2xl font-black text-slate-900 dark:text-white'>
								24/7
							</span>
							<span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
								Yetkazib berish
							</span>
						</div>
					</motion.div>
				</div>

				{/* O'NG TOMON: VISUAL (Taom rasmi uchun joy) */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 1, ease: 'circOut' }}
					className='relative hidden lg:block'
				>
					<div className='relative w-[500px] h-[500px] mx-auto'>
						{/* Dumaloq aylanuvchi tekst yoki rasm asosi */}
						<div className='absolute inset-0 border-[20px] border-slate-100 dark:border-slate-900 rounded-full animate-[spin_20s_linear_infinite]' />

						{/* Asosiy Rasm uchun Container */}
						<div className='absolute inset-10 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-2xl'>
							{/* Bu yerga Palov yoki kabob rasmini qo'yasiz */}
							<img
								src='./hero-1.png'
								alt='Main Dish'
								className='w-full h-full object-cover hover:scale-110 transition-transform duration-700'
							/>
						</div>

						{/* Float Card */}
						<motion.div
							animate={{ y: [0, -20, 0] }}
							transition={{ duration: 4, repeat: Infinity }}
							className='absolute -right-4 top-1/4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800'
						>
							<div className='flex items-center gap-3'>
								<div className='w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white'>
									<Truck />
								</div>
								<div>
									<p className='text-xs font-black dark:text-white uppercase'>
										Tezkor
									</p>
									<p className='text-[10px] text-slate-500 uppercase'>
										Yetkazib berish
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
