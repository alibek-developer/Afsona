'use client'

import { cn } from '@/lib/utils'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		data-slot='checkbox'
		// onClick hodisasi ota elementga (DIV) o'tib ketmasligi uchun stopPropagation qo'shamiz
		onClick={e => e.stopPropagation()}
		className={cn(
			'peer bg-background text-foreground size-5 shrink-0 rounded-[4px] border-2 border-black shadow-[3px_3px_0_#000] transition-transform duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:translate-x-px focus-visible:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-black',
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			data-slot='checkbox-indicator'
			className='flex items-center justify-center text-current transition-none'
		>
			<CheckIcon className='size-3.5 stroke-[3px]' />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
