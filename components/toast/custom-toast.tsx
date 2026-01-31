'use client'

import type { Toast } from '@/lib/toast-store'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useEffect } from 'react'

interface CustomToastProps {
	toast: Toast
	onDismiss: (id: string) => void
}

export function CustomToast({ toast, onDismiss }: CustomToastProps) {
	const duration = toast.duration || 4000

	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss(toast.id)
		}, duration)
		return () => clearTimeout(timer)
	}, [duration, toast.id, onDismiss])

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
			layout
			className='relative w-[380px] pointer-events-auto'
		>
			{/* Konteyner: Kengligi 380px, foni #1a0505, burchaklari 22px, chegarasi border-red-500/20, soyasi shadow-2xl */}
			<div className='relative flex items-center gap-4 p-4 bg-[#1a0505] rounded-[22px] border border-red-500/20 shadow-2xl overflow-hidden'>
				{/* Ikonka: Chap tomondagi savatcha ikonkasi qizil rangli doira ichida */}
				<div className='shrink-0 w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center'>
					<ShoppingCart className='h-6 w-6 text-red-500' />
				</div>

				{/* Matn strukturasi: Sarlavha va tavsifni flex flex-col ichiga ol. min-w-0 klassini qo'shib, matnlar vertikal bo'lib chalkashib ketishining oldini ol. Matnlar bir qatorda chiroyli turishi shart. */}
				<div className='flex flex-col flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-0.5'>
						<span className='text-[15px] shrink-0'>🎉</span>
						<span className='font-bold text-[15px] text-white whitespace-nowrap'>
							{toast.title}
						</span>
					</div>
					{toast.description && (
						<p className='text-[13px] text-gray-300 leading-tight opacity-90 truncate'>
							{toast.description}
						</p>
					)}
				</div>
			</div>
		</motion.div>
	)
}
