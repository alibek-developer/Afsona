'use client'
import { Clock, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className='bg-black text-white border-t-2 border-red-500 shadow-[0_-5px_30px_rgba(255,0,0,0.2)]'>
			<div className='max-w-screen-2xl mx-auto px-6 lg:px-10 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
					{/* About - Neon Glow */}
					<div>
						<div className='flex items-center gap-3 mb-6'>
							<div className='w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white text-2xl font-black shadow-[0_0_20px_rgba(255,0,0,0.6)] border-2 border-red-400'>
								🍽️
							</div>
							<span className='font-black text-2xl tracking-tight uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'>
								O'zbek Oshxonasi
							</span>
						</div>
						<p className='text-gray-300 leading-relaxed font-medium'>
							An'anaviy o'zbek taomlari eng sifatli mahsulotlardan tayyorlanadi.
							Oilaviy muhit va mehmonnavozlik.
						</p>
					</div>

					{/* Contact - Neon Icons */}
					<div>
						<h3 className='font-black text-xl mb-6 uppercase tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]'>
							Bog'lanish
						</h3>
						<div className='flex flex-col gap-4 text-gray-300'>
							<div className='flex items-center gap-3 group hover:text-red-400 transition-all duration-300'>
								<div className='w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all duration-300 border border-red-500/30'>
									<Phone className='h-5 w-5 text-red-400' />
								</div>
								<span className='font-bold'>+998 71 123 45 67</span>
							</div>
							<div className='flex items-center gap-3 group hover:text-red-400 transition-all duration-300'>
								<div className='w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all duration-300 border border-red-500/30'>
									<MapPin className='h-5 w-5 text-red-400' />
								</div>
								<span className='font-bold'>
									Toshkent sh., Amir Temur ko'chasi, 1-uy
								</span>
							</div>
							<div className='flex items-center gap-3 group hover:text-red-400 transition-all duration-300'>
								<div className='w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 group-hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all duration-300 border border-red-500/30'>
									<Clock className='h-5 w-5 text-red-400' />
								</div>
								<span className='font-bold'>Har kuni: 10:00 - 23:00</span>
							</div>
						</div>
					</div>

					{/* Links - Neon Hover */}
					<div>
						<h3 className='font-black text-xl mb-6 uppercase tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]'>
							Havolalar
						</h3>
						<div className='flex flex-col gap-3'>
							{[
								{ href: '/menu', label: 'Menyu' },
								{ href: '/about', label: 'Biz haqimizda' },
								{ href: '/checkout', label: 'Buyurtma berish' },
							].map(link => (
								<Link
									key={link.href}
									href={link.href}
									className='text-gray-300 hover:text-red-400 transition-all duration-300 font-bold uppercase tracking-wide hover:translate-x-2 hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] inline-block'
								>
									→ {link.label}
								</Link>
							))}
						</div>
					</div>
				</div>

				<div className='border-t-2 border-red-500/30 mt-10 pt-8 text-center'>
					<p className='text-gray-400 font-bold uppercase tracking-widest text-sm'>
						© 2026 O'zbek Oshxonasi. Barcha huquqlar himoyalangan.
					</p>
				</div>
			</div>
		</footer>
	)
}
