'use client'

import { Clock, Code2, Instagram, MapPin, Phone, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className='bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-800 transition-colors duration-300'>
			<div className='max-w-7xl mx-auto px-6 lg:px-10 py-10 md:py-12'>
				{/* Asosiy grid - O'zgarishsiz qoldi */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16'>
					{/* About Section */}
					<div className='space-y-4'>
						<div className='flex items-center gap-3'>
							<div className='relative w-12 h-12 rounded-xl overflow-hidden border-2 border-red-600 shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] flex-shrink-0'>
								<Image
									src='/logo.jpg'
									alt='Afsona Logo'
									fill
									className='object-cover'
									priority
								/>
							</div>
							<span className='font-black text-xl md:text-2xl tracking-tighter uppercase italic'>
								Afsona
							</span>
						</div>

						<p className='text-slate-600 dark:text-slate-400 leading-snug font-bold max-w-xs text-sm md:text-base'>
							An'anaviy o'zbek taomlari eng sifatli mahsulotlardan tayyorlanadi.
							Haqiqiy mehmondorchilik maskani.
						</p>
					</div>

					{/* Contact Section */}
					<div className='space-y-6'>
						<h3 className='font-black text-[11px] uppercase tracking-[0.2em] text-red-600 dark:text-red-500 border-l-4 border-red-600 pl-3'>
							Bog'lanish
						</h3>
						<div className='flex flex-col gap-4'>
							<a
								href='tel:+998711234567'
								className='flex items-center gap-3 group'
							>
								<div className='w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
									<Phone className='h-4 w-4' />
								</div>
								<span className='font-black text-sm md:text-base text-slate-800 dark:text-slate-200'>
									+998 71 123 45 67
								</span>
							</a>

							<div className='flex items-center gap-3'>
								<div className='w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
									<MapPin className='h-4 w-4' />
								</div>
								<span className='font-black text-slate-800 dark:text-slate-200 text-sm md:text-base'>
									Shovot tumani
								</span>
							</div>

							<div className='flex items-center gap-3'>
								<div className='w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-slate-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
									<Clock className='h-4 w-4' />
								</div>
								<span className='font-black text-slate-800 dark:text-slate-200 text-sm md:text-base'>
									10:00 - 23:00
								</span>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div className='space-y-6'>
						<h3 className='font-black text-[11px] uppercase tracking-[0.2em] text-red-600 dark:text-red-500 border-l-4 border-red-600 pl-3'>
							Havolalar
						</h3>
						<div className='flex flex-col gap-3'>
							{[
								{ href: '/menu', label: 'Menyu' },
								{ href: '/about', label: 'Biz haqimizda' },
								{ href: '/checkout', label: 'Buyurtma' },
							].map(link => (
								<Link
									key={link.href}
									href={link.href}
									className='text-slate-500 dark:text-slate-400 hover:text-red-600 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group'
								>
									<span className='w-3 h-[2px] bg-slate-200 dark:bg-slate-800 group-hover:w-6 group-hover:bg-red-600 transition-all'></span>
									{link.label}
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Bottom Bar - Markazlashtirilgan va Zamonaviy */}
				<div className='border-t-2 border-slate-100 dark:border-slate-900 mt-10 pt-8 flex flex-col items-center gap-8 text-center'>
					<div className='space-y-4'>
						<p className='text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]'>
							© 2026 Afsona. Barcha huquqlar himoyalangan.
						</p>

						{/* Developers Section */}
						<div className='flex flex-col items-center gap-3'>
							<div className='flex items-center gap-2 text-slate-400 dark:text-slate-600 font-bold text-[13px] uppercase tracking-tighter'>
								<Code2 className='w-3 h-3' />
								<span>Powered by</span>
							</div>

							<div className='flex flex-wrap justify-center gap-x-4 gap-y-2'>
								{[
									{ name: 'Asadbek Rakhimov', href: '#' },
									{ name: 'Alibek Allaberganov', href: '#' },
									{ name: 'Farkhad Ruzimov', href: '#' },
								].map((dev, idx) => (
									<Link
										key={idx}
										href={dev.href}
										className='text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-500 transition-colors border-b border-transparent hover:border-red-600'
									>
										{dev.name}
									</Link>
								))}
							</div>
						</div>
					</div>

					{/* Social Links */}
					<div className='flex gap-4'>
						<Link
							href='https://t.me/afsona_shovot'
							target='_blank'
							className='p-2.5 rounded-lg border-2 border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group'
						>
							<Send className='w-4 h-4 text-slate-600 group-hover:text-[#229ED9]' />
						</Link>

						<Link
							href='https://www.instagram.com/afsona_shovot'
							target='_blank'
							className='p-2.5 rounded-lg border-2 border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group'
						>
							<Instagram className='w-4 h-4 text-slate-600 group-hover:text-[#E1306C]' />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
