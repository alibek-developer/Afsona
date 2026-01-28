'use client'

import { Clock, Instagram, MapPin, Phone, Send } from 'lucide-react' // Lucide ikonkalaridan foydalanamiz
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className='bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-800 transition-colors duration-300'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10 py-16'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8'>
					{/* About Section */}
					<div className='space-y-6'>
						<div className='flex items-center gap-4'>
							<div className='relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] dark:shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)] flex-shrink-0'>
								<Image
									src='/logo.jpg'
									alt='Afsona Restaurant Logo'
									fill
									className='object-cover'
									priority
									sizes='(max-width: 768px) 56px, 64px'
								/>
							</div>

							<span className='font-black text-2xl md:text-3xl tracking-tighter uppercase italic'>
								Afsona
							</span>
						</div>

						<p className='text-slate-600 dark:text-slate-400 leading-relaxed font-bold max-w-sm text-sm md:text-base'>
							An'anaviy o'zbek taomlari eng sifatli mahsulotlardan tayyorlanadi.
							Bizda har doim oilaviy muhit va haqiqiy mehmondorchilik.
						</p>
					</div>

					{/* Contact Section */}
					<div className='space-y-8'>
						<h3 className='font-black text-xs md:text-sm uppercase tracking-[0.2em] text-red-600 dark:text-red-500 border-l-4 border-red-600 pl-3'>
							Bog'lanish
						</h3>
						<div className='flex flex-col gap-6'>
							<a
								href='tel:+998711234567'
								className='flex items-center gap-4 group'
							>
								<div className='w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px]'>
									<Phone className='h-5 w-5' />
								</div>
								<span className='font-black text-slate-800 dark:text-slate-200 group-hover:text-red-600 transition-colors'>
									+998 71 123 45 67
								</span>
							</a>

							<div className='flex items-center gap-4 group'>
								<div className='w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
									<MapPin className='h-5 w-5' />
								</div>
								<span className='font-black text-slate-800 dark:text-slate-200 leading-tight text-sm'>
									Toshkent sh., Amir Temur, 1-uy
								</span>
							</div>

							<div className='flex items-center gap-4'>
								<div className='w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
									<Clock className='h-5 w-5' />
								</div>
								<span className='font-black text-slate-800 dark:text-slate-200'>
									10:00 - 23:00
								</span>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div className='space-y-8'>
						<h3 className='font-black text-xs md:text-sm uppercase tracking-[0.2em] text-red-600 dark:text-red-500 border-l-4 border-red-600 pl-3'>
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
									className='text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center gap-3 group'
								>
									<span className='w-4 h-[2px] bg-slate-200 dark:bg-slate-800 group-hover:w-8 group-hover:bg-red-600 transition-all duration-300'></span>
									{link.label}
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='border-t-2 border-slate-100 dark:border-slate-900 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-8'>
					<p className='text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-[10px]'>
						© 2026 Afsona. Barcha huquqlar himoyalangan.
					</p>

					<div className='flex gap-6'>
						<Link
							href='https://t.me/afsona_shovot'
							target='_blank'
							className='p-3 rounded-xl border-2 border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group'
						>
							<Send className='w-5 h-5 text-slate-600 group-hover:text-[#229ED9]' />
						</Link>

						<Link
							href='https://www.instagram.com/afsona_shovot'
							target='_blank'
							className='p-3 rounded-xl border-2 border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group'
						>
							<Instagram className='w-5 h-5 text-slate-600 group-hover:text-[#E1306C]' />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
