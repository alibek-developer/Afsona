'use client'

import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/lib/types'

interface CategoryFilterProps {
	selected: string | null
	onSelect: (category: string | null) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
	return (
		<div className='flex flex-wrap gap-4 justify-center py-8 px-4'>
			<Button
				onClick={() => onSelect(null)}
				className={`
          h-12 px-8 rounded-xl border-2 border-black transition-all duration-300
          text-lg font-black uppercase tracking-widest
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:translate-x-[2px] hover:translate-y-[2px]
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          active:translate-x-[4px] active:translate-y-[4px]
          active:shadow-none
          ${
						selected === null
							? 'bg-red-600 text-white border-red-700 shadow-[0_0_20px_rgba(255,0,0,0.5)]'
							: 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-600'
					}
        `}
			>
				HAMMASI
			</Button>
			{CATEGORIES.map(category => (
				<Button
					key={category.id}
					onClick={() => onSelect(category.id)}
					className={`
            h-12 px-8 rounded-xl border-2 border-black transition-all duration-300
            text-lg font-black uppercase tracking-widest
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            hover:translate-x-[2px] hover:translate-y-[2px]
            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            active:translate-x-[4px] active:translate-y-[4px]
            active:shadow-none
            ${
							selected === category.id
								? 'bg-red-600 text-white border-red-700 shadow-[0_0_20px_rgba(255,0,0,0.5)]'
								: 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-600'
						}
          `}
				>
					<span className='mr-2 text-2xl'>{category.icon}</span>
					{category.name}
				</Button>
			))}
		</div>
	)
}
