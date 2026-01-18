import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background text-foreground border-2 border-black shadow-[4px_4px_0_#000] h-12 w-full min-w-0 rounded-md px-4 py-2 text-[15px] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 transition-transform duration-150',
				'focus-visible:ring-ring/40 focus-visible:ring-[3px] focus-visible:translate-x-px focus-visible:translate-y-px',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				className
			)}
			{...props}
		/>
	)
}

export { Input }
