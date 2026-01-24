'use client'
import { Clock, MapPin, Phone, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className='bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(239,68,68,0.1)] transition-colors duration-300'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10 py-16'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8'>
					{/* About Section */}
					<div className='space-y-6'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-2xl bg-red-600 dark:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-[0_0_20px_rgba(239,68,68,0.5)]'>
								<UtensilsCrossed size={24} />
							</div>
							<span className='font-black text-2xl tracking-tighter uppercase text-slate-900 dark:text-white'>
								O'zbek Oshxonasi
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

				{/* Bottom Copyright */}
				<div className='border-t border-slate-100 dark:border-slate-800 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-4'>
					<p className='text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]'>
						© 2026 O'zbek Oshxonasi. Barcha huquqlar himoyalangan.
					</p>
					<div className='flex gap-6'>
						<span className='text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors'>
							Instagram
						</span>
						<span className='text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors'>
							Telegram
						</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
