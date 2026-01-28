'use client'

import { Clock, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className='bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(239,68,68,0.1)] transition-colors duration-300'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10 py-16'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8'>
					{/* About Section */}
					<div className='space-y-6'>
						<div className='flex items-center gap-4'>
							<div className='relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-red-600 dark:border-red-600 shadow-lg shadow-red-200 dark:shadow-[0_0_20px_rgba(239,68,68,0.5)] flex-shrink-0'>
								<Image
									src='/logo.jpg'
									alt='Afsona Restaurant Logo'
									fill
									className='object-cover'
									priority
									sizes='(max-width: 768px) 56px, 64px'
								/>
							</div>

							<span className='font-black text-2xl md:text-3xl tracking-tighter uppercase text-slate-900 dark:text-white'>
								Afsona
							</span>
						</div>

						<p className='text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-sm'>
							An'anaviy o'zbek taomlari eng sifatli mahsulotlardan tayyorlanadi.
							Bizda har doim oilaviy muhit va haqiqiy mehmondorchilik.
						</p>
					</div>

					{/* Contact Section */}
					<div>
						<h3 className='font-black text-sm mb-8 uppercase tracking-[0.2em] text-red-600 dark:text-red-500'>
							Bog'lanish
						</h3>
						<div className='flex flex-col gap-5'>
							<div className='flex items-center gap-4 group cursor-pointer'>
								<div className='w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-950 transition-colors duration-300'>
									<Phone className='h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors' />
								</div>
								<span className='font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors'>
									+998 71 123 45 67
								</span>
							</div>

							<div className='flex items-center gap-4 group cursor-pointer'>
								<div className='w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-950 transition-colors duration-300'>
									<MapPin className='h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors' />
								</div>
								<span className='font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight'>
									Toshkent sh., Amir Temur, 1-uy
								</span>
							</div>

							<div className='flex items-center gap-4 group'>
								<div className='w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center'>
									<Clock className='h-5 w-5 text-slate-400 dark:text-slate-600' />
								</div>
								<span className='font-bold text-slate-700 dark:text-slate-300'>
									10:00 - 23:00
								</span>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className='font-black text-sm mb-8 uppercase tracking-[0.2em] text-red-600 dark:text-red-500'>
							Havolalar
						</h3>
						<div className='flex flex-col gap-4'>
							{[
								{ href: '/menu', label: 'Menyu' },
								{ href: '/about', label: 'Biz haqimizda' },
								{ href: '/checkout', label: 'Buyurtma berish' },
							].map(link => (
								<Link
									key={link.href}
									href={link.href}
									className='text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 font-bold uppercase text-xs tracking-widest flex items-center gap-2 group'
								>
									<span className='w-0 h-[2px] bg-red-600 dark:bg-red-500 group-hover:w-4 transition-all duration-300'></span>
									{link.label}
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Bottom Copyright + Social Links */}
				<div className='border-t border-slate-100 dark:border-slate-800 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-6'>
					<p className='text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]'>
						© 2026 Afsona. Barcha huquqlar himoyalangan.
					</p>

					<div className='flex gap-8 md:gap-10'>
						<Link
							href='https://t.me/afsona_shovot'
							target='_blank'
							rel='noopener noreferrer'
							className='text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2'
						>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
								<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.896 16.312c-.164.468-.508.84-.972 1.016-.466.174-.994.174-1.46 0l-3.656-1.728-2.46 1.728c-.466.174-.994.174-1.46 0-.466-.174-.808-.548-.972-1.016-.164-.468-.164-.994 0-1.46l2.46-1.728-2.46-1.728c-.164-.466-.164-.994 0-1.46.164-.468.508-.84.972-1.016.466-.174.994-.174 1.46 0l3.656 1.728 2.46-1.728c.466-.174.994-.174 1.46 0 .466.174.808.548.972 1.016.164.466.164.994 0 1.46l-2.46 1.728 2.46 1.728c.164.466.164.994 0 1.46z' />
							</svg>
							Telegram
						</Link>

						<Link
							href='https://www.instagram.com/afsona_shovot'
							target='_blank'
							rel='noopener noreferrer'
							className='text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2'
						>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
								<path d='M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.239 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.239-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.239-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.239 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.735 0 8.332.012 7.002.07c-1.378.062-2.66.326-3.634 1.3C2.428 2.444 2.164 3.726 2.102 5.104.07 8.332 0 8.735 0 12c0 3.265.07 3.668.07 4.998.062 1.378.326 2.66 1.3 3.634.974.974 2.256 1.238 3.634 1.3C8.332 24 8.735 24 12 24s3.668-.07 4.998-.07c1.378-.062 2.66-.326 3.634-1.3.974-.974 1.238-2.256 1.3-3.634.07-1.33.07-1.733.07-4.998 0-3.265-.07-3.668-.07-4.998-.062-1.378-.326-2.66-1.3-3.634-.974-.974-2.256-1.238-3.634-1.3C15.668 0 15.265 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm7.846-10.162a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z' />
							</svg>
							Instagram
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
