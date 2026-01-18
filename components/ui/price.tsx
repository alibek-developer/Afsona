'use client'

import { useMounted } from '@/lib/useMounted'
import { cn, formatPrice } from '@/lib/utils'

export function Price({
	value,
	className,
}: {
	value: any
	className?: string
}) {
	const mounted = useMounted()

	return (
		<span className={cn('num-mono', className)} suppressHydrationWarning>
			{mounted ? formatPrice(value) : '—'}
		</span>
	)
}
