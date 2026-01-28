'use client'

import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/lib/types'

interface CategoryFilterProps {
	selected: string | null
	onSelect: (category: string | null) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
	return (
		<div className='flex flex-wrap gap-3 md:gap-5 justify-center py-6 md:py-10 px-4 max-w-2xl mx-auto'>
			{/* "HAMMASI" Tugmasi */}
			<Button
				onClick={() => onSelect(null)}
				className={`
          // Mobil uchun balandlik h-11, desktop uchun h-14 (sal kattaroq)
          h-11 md:h-14 px-6 md:px-10 rounded-xl border-2 transition-all duration-300
          // Shrift o'lchami va qalinligi
          text-[12px] md:text-sm font-black uppercase tracking-wider
          // Neobrutalizm soyasi - mobil uchun biroz qisqartirildi
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]
          
          hover:translate-x-[1px] hover:translate-y-[1px]
          active:translate-x-[3px] active:translate-y-[3px]
          active:shadow-none whitespace-nowrap
          ${
						selected === null
							? 'bg-red-600 text-white border-black ring-2 ring-red-500/20'
							: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-black dark:border-slate-700'
					}
        `}
			>
				HAMMASI
			</Button>

			{/* Kategoriya tugmalari */}
			{CATEGORIES.map(category => (
				<Button
					key={category.id}
					onClick={() => onSelect(category.id)}
					className={`
            h-11 md:h-14 px-6 md:px-10 rounded-xl border-2 transition-all duration-300
            text-[12px] md:text-sm font-black uppercase tracking-wider
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]
            
            hover:translate-x-[1px] hover:translate-y-[1px]
            active:translate-x-[3px] active:translate-y-[3px]
            active:shadow-none whitespace-nowrap
            ${
							selected === category.id
								? 'bg-red-600 text-white border-black ring-2 ring-red-500/20'
								: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-black dark:border-slate-700'
						}
          `}
				>
					{category.name}
				</Button>
			))}
		</div>
	)
}
