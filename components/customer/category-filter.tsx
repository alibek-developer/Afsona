'use client'

import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/lib/types'

interface CategoryFilterProps {
	selected: string | null
	onSelect: (category: string | null) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
	return (
		<div className='flex flex-wrap gap-2 md:gap-4 justify-center py-4 md:py-8 px-2 md:px-4'>
			{/* "HAMMASI" Tugmasi */}
			<Button
				onClick={() => onSelect(null)}
				className={`
          h-10 md:h-12 px-4 md:px-8 rounded-lg md:rounded-xl border-2 border-black transition-all duration-300
          text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-widest
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px]
          hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          active:translate-x-[3px] active:translate-y-[3px] md:active:translate-x-[4px] md:active:translate-y-[4px]
          active:shadow-none whitespace-nowrap
          ${
						selected === null
							? 'bg-red-600 text-white border-red-700 shadow-[0_0_15px_rgba(255,0,0,0.3)]'
							: 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-600'
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
            h-10 md:h-12 px-4 md:px-8 rounded-lg md:rounded-xl border-2 border-black transition-all duration-300
            text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-widest
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px]
            hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            active:translate-x-[3px] active:translate-y-[3px] md:active:translate-x-[4px] md:active:translate-y-[4px]
            active:shadow-none whitespace-nowrap
            ${
							selected === category.id
								? 'bg-red-600 text-white border-red-700 shadow-[0_0_15px_rgba(255,0,0,0.3)]'
								: 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-600'
						}
          `}
				>
					{category.name}
				</Button>
			))}
		</div>
	)
}
