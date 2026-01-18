'use client'

import { Card, CardContent } from '@/components/ui/card'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { Clock, MapPin, Phone, Users } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function AboutPage() {
	// Carousel setup with Autoplay
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: 'center' },
		[Autoplay({ delay: 3000, stopOnInteraction: false }) as any]
	)
	const [selectedIndex, setSelectedIndex] = useState(0)

	useEffect(() => {
		if (!emblaApi) return
		emblaApi.on('select', () => {
			setSelectedIndex(emblaApi.selectedScrollSnap())
		})
	}, [emblaApi])

	// Images for 3D Carousel
	const carouselImages = [
		'/uzbek-restaurant-interior-traditional-decor.jpg',
		'/uzbek-restaurant-interior-traditional-decor.jpg', // Duplicate for demo flow
		'/uzbek-restaurant-interior-traditional-decor.jpg', // Duplicate for demo flow
	]

	// Neon Icon Component
	const NeonIcon = ({ icon: Icon }: { icon: any }) => (
		<div className='p-4 bg-white border-2 border-black rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.2)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300'>
			<Icon className='h-8 w-8 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' />
		</div>
	)

	return (
		<div className='min-h-screen bg-slate-50 py-12'>
			<div className='max-w-4xl mx-auto px-4'>
				
				{/* Header: text-6xl font-black */}
				<h1 className='text-6xl md:text-7xl font-black text-center mb-14 text-black uppercase tracking-tight drop-shadow-sm'>
					Biz Haqimizda
				</h1>

				{/* 3D Carousel Hero */}
				<div className='relative mb-16 px-4'>
					<div className='overflow-hidden py-8 -my-8' ref={emblaRef}>
						<div className='flex touch-pan-y'>
							{carouselImages.map((src, index) => (
								<div className='flex-[0_0_85%] md:flex-[0_0_70%] min-w-0 pl-4 relative' key={index}>
									<div 
										className={`relative aspect-video rounded-3xl overflow-hidden border-2 border-black transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
											index === selectedIndex 
												? 'scale-105 shadow-[0_0_40px_rgba(220,38,38,0.5)] opacity-100 z-10' 
												: 'scale-90 shadow-none opacity-60 blur-[2px] z-0'
										}`}
									>
										<Image
											src={src}
											alt={`Restoran interyeri ${index + 1}`}
											fill
											className='object-cover'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
										<div className='absolute bottom-4 left-4 right-4 text-center'>
											<span className='px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest rounded-md border border-white/20'>
												Interyer
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					
					{/* Pagination Dots */}
					<div className="flex justify-center gap-2 mt-6">
						{carouselImages.map((_, index) => (
							<button
								key={index}
								onClick={() => emblaApi?.scrollTo(index)}
								className={`h-3 rounded-full transition-all duration-300 ${
									index === selectedIndex 
										? "bg-red-600 w-8 shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
										: "bg-gray-300 w-3 hover:bg-gray-400"
								}`}
								aria-label={`Slayd ${index + 1}`}
							/>
						))}
					</div>
				</div>

				{/* Content Text */}
				<div className='max-w-3xl mx-auto text-center mb-16'>
					<p className='text-xl md:text-2xl font-bold text-gray-800 leading-relaxed mb-6'>
						O'zbek Oshxonasi — milliy an'analar va zamonaviy xizmatning mukammal uyg'unligi.
					</p>
					<p className='text-gray-600 text-lg leading-loose'>
						Bizning oshpazlarimiz har bir taomni mehr bilan tayyorlaydi. 
						Siz uchun faqat <span className='font-black text-black bg-red-100 px-1'>ENG SIFATLI</span> mahsulotlar ishlatiladi.
					</p>
				</div>

				{/* Info Cards Grid (Neon Cyber) */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{[
						{ icon: Clock, title: 'Ish vaqti', desc: 'Har kuni: 10:00 - 23:00' },
						{ icon: MapPin, title: 'Manzil', desc: "Toshkent sh., Amir Temur 1-uy" },
						{ icon: Phone, title: 'Telefon', desc: '+998 71 123 45 67' },
						{ icon: Users, title: "Sig'im", desc: "100+ o'rindiq, Oilaviy xonalar" },
					].map((item, idx) => (
						<Card key={idx} className='group bg-white border-2 border-black rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(255,0,0,0.15)] hover:-translate-y-1 transition-all duration-300'>
							<CardContent className='p-6 flex items-center gap-5'>
								<NeonIcon icon={item.icon} />
								<div>
									<h3 className='font-black text-xl text-black uppercase tracking-tight mb-1 group-hover:text-red-600 transition-colors'>
										{item.title}
									</h3>
									<p className='text-gray-500 font-bold text-sm uppercase tracking-wide'>
										{item.desc}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

			</div>
		</div>
	)
}
