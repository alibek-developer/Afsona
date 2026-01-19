'use client'

import { Card, CardContent } from '@/components/ui/card'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import {
	Award,
	Clock,
	Heart,
	MapPin,
	Phone,
	Users,
	Utensils,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function AboutPage() {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: 'center' },
		[Autoplay({ delay: 3500, stopOnInteraction: false }) as any],
	)
	const [selectedIndex, setSelectedIndex] = useState(0)

	useEffect(() => {
		if (!emblaApi) return
		emblaApi.on('select', () => {
			setSelectedIndex(emblaApi.selectedScrollSnap())
		})
	}, [emblaApi])

	const carouselImages = [
		'/uzbek-restaurant-interior-traditional-decor.jpg',
		'/uzbek-restaurant-interior-traditional-decor.jpg',
		'/uzbek-restaurant-interior-traditional-decor.jpg',
	]

	// Light uslubidagi nozik Icon komponenti
	const MinimalIcon = ({ icon: Icon }: { icon: any }) => (
		<div className='p-3 bg-red-50 rounded-2xl transition-all duration-300 group-hover:bg-red-600 group-hover:scale-110'>
			<Icon className='h-6 w-6 text-red-600 group-hover:text-white transition-colors duration-300' />
		</div>
	)

	return (
		<div className='min-h-screen bg-white py-12 md:py-20 font-sans'>
			<div className='max-w-6xl mx-auto px-4'>
				{/* Sarlavha qismi */}
				<div className='text-center mb-16'>
					<h1 className='text-5xl md:text-7xl font-black mb-4 text-slate-900 uppercase tracking-tight'>
						Biz Haqimizda
					</h1>
					<div className='flex items-center justify-center gap-3'>
						<div className='h-[1px] w-10 bg-red-600'></div>
						<p className='text-red-600 font-bold tracking-[0.2em] uppercase text-xs'>
							An'ana va Sifat
						</p>
						<div className='h-[1px] w-10 bg-red-600'></div>
					</div>
				</div>

				{/* 3D Carousel (Yengil soya bilan) */}
				<div className='relative mb-24'>
					<div className='overflow-hidden' ref={emblaRef}>
						<div className='flex touch-pan-y'>
							{carouselImages.map((src, index) => (
								<div
									className='flex-[0_0_90%] md:flex-[0_0_70%] min-w-0 pl-6'
									key={index}
								>
									<div
										className={`relative aspect-[16/9] rounded-[2.5rem] overflow-hidden transition-all duration-700 ${
											index === selectedIndex
												? 'scale-100 shadow-2xl shadow-red-100 opacity-100'
												: 'scale-90 opacity-30 blur-[1px]'
										}`}
									>
										<Image
											src={src}
											alt='Interior'
											fill
											className='object-cover'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Hikoyamiz qismi (Light layout) */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32'>
					<div className='relative group'>
						<div className='absolute -inset-4 bg-red-50 rounded-[3rem] scale-95 group-hover:scale-100 transition-transform duration-500'></div>
						<div className='relative aspect-square rounded-[2.5rem] overflow-hidden border-8 border-white shadow-xl'>
							<Image
								src='/uzbek-restaurant-interior-traditional-decor.jpg'
								fill
								className='object-cover'
								alt='About'
							/>
						</div>
					</div>

					<div className='space-y-8'>
						<div className='space-y-4'>
							<h2 className='text-4xl md:text-5xl font-black text-slate-900 uppercase leading-none'>
								Lazzatli an'analar <br />
								<span className='text-red-600'>maskaniga</span> xush kelibsiz
							</h2>
							<p className='text-slate-600 text-lg leading-relaxed'>
								O'zbek Oshxonasi 2010-yildan buyon o'z mehmonlariga haqiqiy
								o'zbekona mehmondorchilikni ulashib kelmoqda. Bizning har bir
								taomimizda ota-bobolarimizdan qolgan sirlar va cheksiz mehr bor.
							</p>
						</div>

						<div className='grid grid-cols-2 gap-8 py-6 border-y border-slate-100'>
							<div>
								<h4 className='font-black text-3xl text-slate-900'>100%</h4>
								<p className='text-xs text-slate-400 uppercase font-bold tracking-widest'>
									Tabiiy mahsulotlar
								</p>
							</div>
							<div>
								<h4 className='font-black text-3xl text-slate-900'>Top</h4>
								<p className='text-xs text-slate-400 uppercase font-bold tracking-widest'>
									Usta oshpazlar
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Ma'lumot cardlari (Light & Minimal) */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32'>
					{[
						{
							icon: Clock,
							title: 'Ish vaqti',
							desc: '10:00 - 23:00',
							label: 'Har kuni',
						},
						{
							icon: MapPin,
							title: 'Manzil',
							desc: 'Toshkent sh.',
							label: 'Amir Temur 1',
						},
						{
							icon: Phone,
							title: 'Aloqa',
							desc: '+998 71 123',
							label: 'Ishonch telefoni',
						},
						{
							icon: Users,
							title: "Sig'im",
							desc: "100+ o'rin",
							label: 'Oilaviy xonalar',
						},
					].map((item, idx) => (
						<Card
							key={idx}
							className='group border-none shadow-sm hover:shadow-xl hover:shadow-red-50 transition-all duration-500 rounded-[2rem] bg-slate-50/50 p-2'
						>
							<CardContent className='p-8 flex flex-col items-center text-center'>
								<MinimalIcon icon={item.icon} />
								<h3 className='font-black text-lg mt-6 text-slate-900 uppercase tracking-tight'>
									{item.title}
								</h3>
								<p className='text-red-600 font-bold text-sm mt-1'>
									{item.desc}
								</p>
								<p className='text-slate-400 text-[10px] uppercase mt-2 font-semibold tracking-widest'>
									{item.label}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Nima uchun biz? (Yorqin va toza variant) */}
				<div className='bg-red-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-red-200'>
					<h2 className='text-4xl md:text-5xl font-black uppercase mb-12'>
						Nima uchun bizni tanlashadi?
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
						<div className='space-y-4'>
							<div className='w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm'>
								<Award className='h-8 w-8 text-white' />
							</div>
							<h4 className='font-bold text-xl uppercase'>Yuqori Sifat</h4>
							<p className='text-red-100 text-sm leading-relaxed'>
								Eng saralangan va halol mahsulotlar kafolati.
							</p>
						</div>
						<div className='space-y-4'>
							<div className='w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm'>
								<Heart className='h-8 w-8 text-white' />
							</div>
							<h4 className='font-bold text-xl uppercase'>Samimiy Xizmat</h4>
							<p className='text-red-100 text-sm leading-relaxed'>
								Har bir mehmon biz uchun qadrli va mo'tabar.
							</p>
						</div>
						<div className='space-y-4'>
							<div className='w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm'>
								<Utensils className='h-8 w-8 text-white' />
							</div>
							<h4 className='font-bold text-xl uppercase'>Betakror Ta'm</h4>
							<p className='text-red-100 text-sm leading-relaxed'>
								An'anaviy usulda pishirilgan milliy lazzat.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
