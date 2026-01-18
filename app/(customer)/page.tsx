import { FeaturedDishes } from '@/components/customer/featured-dishes'
import { HeroSection } from '@/components/customer/hero-section'

export default function HomePage() {
	return (
		<>
			<HeroSection />

			<FeaturedDishes />
			<section className='py-14'>
				<div className='text-center max-w-3xl mx-auto'>
					<h2 className='text-3xl md:text-4xl font-bold mb-3 text-foreground'>
						Bizning ilovamiz
					</h2>
					<p className='text-sm md:text-base text-muted-foreground leading-relaxed mb-8'>
						Bizning mobil ilovamiz orqali buyurtma berish yanada oson!
						<br />
						Hoziroq yuklab oling va chegirmalarga ega bo'ling.
					</p>

					<div className='flex flex-wrap justify-center gap-4'>
						{/* App Store Button */}
						<a
							href='#'
							className='inline-flex items-center justify-center bg-black text-white rounded-xl px-4 py-2 transition-transform hover:scale-105 active:scale-95 shadow-lg'
						>
							<svg
								className='w-8 h-8 mr-3'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M17.842 16.593c.338-.024.697-.137 1.05-.386.994-.702 1.34-1.748 1.354-1.78-.016-.07-2.614-1.002-2.637-3.972-.023-2.48 2.053-3.666 2.152-3.719-1.173-1.714-3.004-1.91-3.649-1.954-1.55-.11-3.027.91-3.816.91-.801 0-2.09-.89-3.414-.868-1.756.026-3.376 1.026-4.27 2.603-1.82 3.167-.465 7.846 1.309 10.413.87 1.258 1.905 2.668 3.267 2.62 1.306-.05 1.8-.846 3.378-.846 1.564 0 2.008.847 3.364.822 1.398-.025 2.274-1.277 3.129-2.528.98-1.436 1.385-2.83 1.4-2.903-.03-.01-2.695-1.033-2.72-4.098zm-3.5-9.66c.642-.776 1.074-1.854.954-2.933-.925.038-2.046.616-2.709 1.41-.594.707-1.114 1.834-.972 2.872.998.077 2.05-.536 2.728-1.35z' />
							</svg>
							<div className='text-left'>
								<div className='text-[10px] uppercase font-medium leading-none'>
									Download on the
								</div>
								<div className='text-xl font-bold leading-none'>App Store</div>
							</div>
						</a>

						{/* Google Play Button */}
						<a
							href='#'
							className='inline-flex items-center justify-center bg-black text-white rounded-xl px-4 py-2 transition-transform hover:scale-105 active:scale-95 shadow-lg'
						>
							<svg
								className='w-7 h-7 mr-3'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M3.609 1.814L13.792 12 3.61 22.186C2.981 21.921 2.5 21.29 2.5 20.47V3.53c0-.82.481-1.451 1.109-1.716zM14.77 12.98l.944.945-8.894 8.893c-.64.384-1.428.468-2.126.309L14.77 12.98zm1.09-1.96L5.696.866c.698-.16 1.487-.075 2.127.31l8.037 8.036-.944.945h.944zm1.884 1.885l4.897-2.753c1.428-.802 1.428-2.102 0-2.905l-4.897-2.753-.9.9 5.378 5.378-.48.48-4.898-2.754-.48.48.48.48z' />
							</svg>
							<div className='text-left'>
								<div className='text-[10px] uppercase font-medium leading-none'>
									Get it on
								</div>
								<div className='text-xl font-bold leading-none'>
									Google Play
								</div>
							</div>
						</a>
					</div>
				</div>
				{/* Bezovchi "Bizning ilovamiz" fon rasmi orqada qolishi mumkin */}
			</section>
		</>
	)
}
