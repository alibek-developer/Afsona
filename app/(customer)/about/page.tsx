'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import {
	ArrowRight,
	Award,
	Clock,
	Heart,
	MapPin,
	Phone,
	Sparkles,
	Users,
	Utensils,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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

	const carouselImages = ['./hero-1.png', './hero-1.png', './hero-1.png']

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 py-12 md:py-24 font-sans overflow-x-hidden transition-colors duration-500'>
			<div className='max-w-7xl mx-auto px-4'>
				{/* 🔥 Header Section */}
				<div className='relative mb-24 text-center'>
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 dark:bg-red-600/10 blur-[120px] rounded-full'></div>
					<h1 className='relative text-6xl md:text-8xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tighter italic'>
						Biz <span className='text-red-600'>Haqimizda</span>
					</h1>
					<div className='flex items-center justify-center gap-4'>
						<span className='h-[2px] w-12 bg-red-600'></span>
						<p className='text-slate-500 dark:text-slate-400 font-black tracking-[0.4em] uppercase text-xs'>
							Est. 2010 • Premium Quality
						</p>
						<span className='h-[2px] w-12 bg-red-600'></span>
					</div>
				</div>

				{/* 🖼️ 3D Slider Section */}
				<div className='relative mb-32'>
					<div className='overflow-visible' ref={emblaRef}>
						<div className='flex touch-pan-y'>
							{carouselImages.map((src, index) => (
								<div
									className='flex-[0_0_85%] md:flex-[0_0_60%] min-w-0 pl-8'
									key={index}
								>
									<div
										className={`relative aspect-[16/10] rounded-[3rem] overflow-hidden transition-all duration-1000 border-2 ${
											index === selectedIndex
												? 'border-red-600 scale-100 shadow-[0_20px_50px_rgba(220,38,38,0.15)] opacity-100'
												: 'border-slate-200 dark:border-slate-800 scale-90 opacity-40 blur-[1px]'
										}`}
									>
										<Image
											src={src}
											alt='Interior'
											fill
											className='object-cover'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-[#020617]/80 via-transparent to-transparent' />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 📖 Story Section */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40'>
					<div className='relative group order-2 lg:order-1'>
						<div className='absolute -inset-4 bg-red-600/10 dark:bg-red-600/20 rounded-[4rem] blur-2xl group-hover:bg-red-600/20 transition-all'></div>
						<div className='relative rounded-[3rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-3 shadow-xl'>
							<div className='relative aspect-square rounded-[2.5rem] overflow-hidden'>
								<Image
									src='./hero-1.png'
									fill
									className='object-cover'
									alt='About'
								/>
							</div>
						</div>
						{/* Floating Badge */}
						<div className='absolute -bottom-10 -right-10 bg-red-600 p-8 rounded-full border-8 border-slate-50 dark:border-[#020617] shadow-2xl animate-bounce-slow'>
							<Utensils size={40} className='text-white' />
						</div>
					</div>

					<div className='space-y-10 order-1 lg:order-2'>
						<div className='space-y-6'>
							<div className='inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full text-red-600 dark:text-red-500 text-xs font-black uppercase tracking-widest'>
								<Sparkles size={14} /> Bizning Tarix
							</div>
							<h2 className='text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase leading-[0.9] tracking-tighter italic'>
								Lazzatli <br />
								<span className='text-red-600'>An'analar</span> <br />
								Maskani
							</h2>
							<p className='text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium max-w-xl'>
								Afsona Oshxonasi 2010-yildan buyon haqiqiy mehmondorchilikni
								ulashib kelmoqda. Har bir taomimizda ota-bobolarimiz siri va
								cheksiz mehr bor.
							</p>
						</div>

						<div className='flex gap-12'>
							<div>
								<h4 className='font-black text-5xl text-slate-900 dark:text-white italic'>
									15<span className='text-red-600'>+</span>
								</h4>
								<p className='text-xs text-slate-500 uppercase font-black tracking-widest mt-2'>
									Yillik Tajriba
								</p>
							</div>
							<div className='w-[1px] h-16 bg-slate-200 dark:bg-slate-800'></div>
							<div>
								<h4 className='font-black text-5xl text-slate-900 dark:text-white italic'>
									50<span className='text-red-600'>+</span>
								</h4>
								<p className='text-xs text-slate-500 uppercase font-black tracking-widest mt-2'>
									Usta Oshpazlar
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* 🏢 Info Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-40'>
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
							desc: 'Shovot',
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
						<div
							key={idx}
							className='group relative p-[1px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 hover:bg-red-600 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl'
						>
							<div className='bg-white dark:bg-[#0f172a] p-10 rounded-[2.45rem] h-full flex flex-col items-center text-center'>
								<div className='mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-500'>
									<item.icon
										size={28}
										className='text-red-600 group-hover:text-white transition-colors'
									/>
								</div>
								<h3 className='font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter mb-2'>
									{item.title}
								</h3>
								<p className='text-red-600 dark:text-red-500 font-black text-lg'>
									{item.desc}
								</p>
								<p className='text-slate-500 dark:text-slate-600 text-[10px] uppercase mt-4 font-black tracking-[0.2em]'>
									{item.label}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* 🚀 CTA Section */}
				<div className='relative group overflow-hidden bg-red-600 rounded-[4rem] p-12 md:p-24 text-center shadow-[0_20px_80px_rgba(220,38,38,0.3)]'>
					<div className='absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 blur-[100px] rounded-full'></div>

					<h2 className='relative text-3xl md:text-7xl font-black uppercase text-white mb-16 italic tracking-tighter leading-tight'>
						Nima uchun <br className='md:hidden' /> bizni tanlashadi?
					</h2>

					<div className='relative grid grid-cols-1 md:grid-cols-3 gap-16'>
						{[
							{
								icon: Award,
								title: 'Yuqori Sifat',
								desc: 'Eng saralangan va halol mahsulotlar kafolati.',
							},
							{
								icon: Heart,
								title: 'Samimiy Xizmat',
								desc: "Har bir mehmon biz uchun qadrli va mo'tabar.",
							},
							{
								icon: Utensils,
								title: "Betakror Ta'm",
								desc: "An'anaviy usulda pishirilgan milliy lazzat.",
							},
						].map((feature, fidx) => (
							<div key={fidx} className='space-y-6 group/item'>
								<div className='w-20 h-20 bg-white text-red-600 rounded-3xl flex items-center justify-center mx-auto rotate-3 group-hover/item:rotate-12 transition-transform duration-500 shadow-xl'>
									<feature.icon size={36} strokeWidth={3} />
								</div>
								<h4 className='font-black text-2xl uppercase text-white italic'>
									{feature.title}
								</h4>
								<p className='text-red-50/80 text-sm font-medium leading-relaxed'>
									{feature.desc}
								</p>
							</div>
						))}
					</div>
					<Link href='/menu'>
						<button className='mt-20 group cursor-pointer inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-[#020617] px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl'>
							Menyuni ko'rish <ArrowRight size={20} />
						</button>
					</Link>
				</div>
			</div>

			{/* Background Decorations */}
			<div className='fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-red-600/[0.03] dark:bg-red-600/5 blur-[150px] rounded-full'></div>
			<div className='fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-red-600/[0.03] dark:bg-red-600/5 blur-[150px] rounded-full'></div>
		</div>
	)
}
