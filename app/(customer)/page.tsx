'use client'

import { FeaturedDishes } from '@/components/customer/featured-dishes'
import { HeroSection } from '@/components/customer/hero-section'
import { CheckCircle2, Download, Smartphone } from 'lucide-react'

export default function HomePage() {
	return (
		<>
			<HeroSection />
			<FeaturedDishes />

			<section className='py-20 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300'>
				{/* Orqa fondagi bezak elementlari */}
				<div className='absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-red-50 dark:bg-red-950 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-50 dark:opacity-30' />
				<div className='absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-slate-50 dark:bg-slate-900 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-50 dark:opacity-20' />

				<div className='max-w-5xl mx-auto px-6 relative z-10'>
					<div className='bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-[0_0_40px_rgba(239,68,68,0.15)] hover:shadow-md dark:hover:shadow-[0_0_50px_rgba(239,68,68,0.2)] transition-all duration-300'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
							{/* Matn qismi */}
							<div className='space-y-8'>
								<div className='space-y-4'>
									<div className='inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest'>
										<Smartphone size={14} />
										Mobil Ilova
									</div>
									<h2 className='text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none'>
										Buyurtma berish <br />{' '}
										<span className='text-red-600 dark:text-red-500'>
											yanada oson!
										</span>
									</h2>
									<p className='text-slate-500 dark:text-slate-400 text-lg leading-relaxed'>
										Bizning mobil ilovamizni yuklab oling va har bir buyurtmadan
										eksklyuziv chegirmalarga ega bo'ling. Hozircha faqat Android
										uchun!
									</p>
								</div>

								{/* Afzalliklar ro'yxati */}
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									{[
										'Tezkor buyurtma',
										'Maxsus chegirmalar',
										'Buyurtma tarixi',
										'Jonli kuzatish',
									].map(text => (
										<div
											key={text}
											className='flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm'
										>
											<CheckCircle2
												size={18}
												className='text-red-600 dark:text-red-500'
											/>
											{text}
										</div>
									))}
								</div>

								{/* Yuklab olish tugmasi */}
								<div className='pt-4'>
									<a
										href='/app-release.apk'
										download
										className='group relative inline-flex items-center gap-4 bg-slate-900 dark:bg-red-600 text-white px-8 py-5 rounded-2xl transition-all duration-300 hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-2xl hover:shadow-red-200 dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 border-2 border-slate-900 dark:border-red-600 hover:border-red-600 dark:hover:border-red-500'
									>
										<div className='bg-white/10 dark:bg-white/20 p-2 rounded-lg group-hover:bg-white/20 dark:group-hover:bg-white/30 transition-colors'>
											<svg
												className='w-8 h-8'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M17.523 15.3414L18.3509 16.7753C18.4452 16.9385 18.3893 17.1469 18.226 17.2412L17.1517 17.8615C16.9885 17.9558 16.7801 17.8999 16.6858 17.7366L15.8426 16.2762C14.6865 16.8524 13.3812 17.1818 12 17.1818C10.6188 17.1818 9.3135 16.8524 8.1574 16.2762L7.3142 17.7366C7.2199 17.8999 7.0115 17.9558 6.8483 17.8615L5.774 17.2412C5.6107 17.1469 5.5548 16.9385 5.6491 16.7753L6.477 15.3414C4.1087 13.916 2.5 11.346 2.5 8.4091V7.9545C2.5 7.674 2.7273 7.4468 3.0078 7.4468H20.9922C21.2727 7.4468 21.5 7.674 21.5 7.9545V8.4091C21.5 11.346 19.8913 13.916 17.523 15.3414ZM7.5 11.0909C7.5 11.5113 7.8413 11.8527 8.2617 11.8527C8.6821 11.8527 9.0234 11.5113 9.0234 11.0909C9.0234 10.6705 8.6821 10.3291 8.2617 10.3291C7.8413 10.3291 7.5 10.6705 7.5 11.0909ZM14.9766 11.0909C14.9766 11.5113 15.3179 11.8527 15.7383 11.8527C16.1587 11.8527 16.5 11.5113 16.5 11.0909C16.5 10.6705 16.1587 10.3291 15.7383 10.3291C15.3179 10.3291 14.9766 10.6705 14.9766 11.0909Z' />
											</svg>
										</div>
										<div className='text-left'>
											<p className='text-[10px] uppercase font-bold tracking-widest opacity-60 dark:opacity-70 leading-none mb-1'>
												Yuklab olish
											</p>
											<p className='text-xl font-black uppercase tracking-tight leading-none'>
												Android APK
											</p>
										</div>
										<Download size={20} className='ml-2 animate-bounce' />
									</a>
								</div>
							</div>

							{/* O'ng tarafdagi vizual qism */}
							<div className='relative hidden lg:flex justify-center'>
								<div className='w-64 h-[500px] bg-slate-900 dark:bg-slate-800 rounded-[3rem] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl dark:shadow-[0_0_40px_rgba(239,68,68,0.2)] relative overflow-hidden'>
									<div className='absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-700 rounded-b-2xl' />
									<div className='p-4 pt-12 space-y-4'>
										<div className='h-32 bg-red-600 dark:bg-red-600 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' />
										<div className='space-y-2'>
											<div className='h-4 bg-slate-700 dark:bg-slate-600 rounded w-3/4' />
											<div className='h-4 bg-slate-700 dark:bg-slate-600 rounded w-1/2' />
										</div>
										<div className='grid grid-cols-2 gap-2'>
											<div className='h-20 bg-slate-800 dark:bg-slate-700 rounded-xl' />
											<div className='h-20 bg-slate-800 dark:bg-slate-700 rounded-xl' />
										</div>
									</div>
									<div className='absolute bottom-6 left-4 right-4 h-12 bg-red-600 dark:bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-xs uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)]'>
										Buyurtma berish
									</div>
								</div>
								{/* Bezovchi elementlar */}
								<div className='absolute -bottom-6 -right-6 w-32 h-32 bg-red-600 dark:bg-red-600 rounded-3xl -z-10 rotate-12 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] dark:shadow-[0_0_40px_rgba(239,68,68,0.7)]'>
									-20%
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
