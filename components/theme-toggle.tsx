'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
	// resolvedTheme - system rejimini ham hisobga olib,
	// aniq qaysi rang turganini aytadi
	const { setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	const isDark = resolvedTheme === 'dark'

	return (
		<button
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className='flex items-center gap-3 p-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
			aria-label='Toggle theme'
		>
			{isDark ? (
				<>
					<Sun className='h-5 w-5 text-yellow-500' />
					<span className='text-sm font-medium uppercase text-gray-400'>
						KUN
					</span>
				</>
			) : (
				<>
					<Moon className='h-5 w-5 text-gray-600' />
					<span className='text-sm font-medium uppercase text-gray-600'>
						TUN
					</span>
				</>
			)}
		</button>
	)
}
