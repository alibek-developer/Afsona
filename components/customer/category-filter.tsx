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
          h-10 md:h-12 px-4 md:px-8 rounded-lg md:rounded-xl border-2 transition-all duration-300
          text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-widest
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
          md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]
          hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px]
          hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.05)]
          md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:md:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]
          active:translate-x-[3px] active:translate-y-[3px] md:active:translate-x-[4px] md:active:translate-y-[4px]
          active:shadow-none whitespace-nowrap
          ${
						selected === null
							? 'bg-red-600 dark:bg-red-600 text-white border-red-700 dark:border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)] dark:shadow-[0_0_20px_rgba(239,68,68,0.6)]'
							: 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-black dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500 dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
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
            h-10 md:h-12 px-4 md:px-8 rounded-lg md:rounded-xl border-2 transition-all duration-300
            text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-widest
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
            md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]
            hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px]
            hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.05)]
            md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:md:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]
            active:translate-x-[3px] active:translate-y-[3px] md:active:translate-x-[4px] md:active:translate-y-[4px]
            active:shadow-none whitespace-nowrap
            ${
							selected === category.id
								? 'bg-red-600 dark:bg-red-600 text-white border-red-700 dark:border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)] dark:shadow-[0_0_20px_rgba(239,68,68,0.6)]'
								: 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-black dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500 dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
						}
          `}
				>
					{category.name}
				</Button>
			))}
		</div>
	)
}
