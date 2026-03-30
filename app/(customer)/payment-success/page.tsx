'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function PaymentSuccessContent() {
	const searchParams = useSearchParams()
	const orderId = searchParams.get('order_id')
	const [isVerifying, setIsVerifying] = useState(true)

	useEffect(() => {
		if (!orderId) {
			setIsVerifying(false)
			return
		}

		const verifyOrder = async () => {
			try {
				const { data, error } = await supabase
					.from('orders')
					.select('id, customer_name, total_amount, status')
					.eq('id', orderId)
					.single()

				if (error || !data) {
					console.error('Order not found:', error)
				}
			} catch (err) {
				console.error('Error verifying order:', err)
			} finally {
				setIsVerifying(false)
			}
		}

		verifyOrder()
	}, [orderId])

	if (isVerifying) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080B12] p-6'>
				<Loader2 className='animate-spin text-red-600 mb-4' size={40} />
				<p className='text-slate-500 dark:text-slate-400 font-medium'>Tekshirilmoqda...</p>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080B12] p-6'>
			<div className='w-20 h-20 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20'>
				<Check size={40} strokeWidth={3} />
			</div>
			<h1 className='text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter'>
				To&lsquo;lov muvaffaqiyatli yakunlandi
			</h1>
			<p className='text-slate-500 dark:text-slate-400 text-center max-w-sm mb-2 font-medium'>
				Buyurtmangiz muvaffaqiyatli qabul qilindi va to&lsquo;lov tasdiqlandi.
			</p>
			{orderId && (
				<p className='text-slate-400 dark:text-slate-500 text-xs font-mono mb-8'>
					Buyurtma: {orderId}
				</p>
			)}
			<Link href='/menu'>
				<Button className='bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-red-600/20 text-white uppercase italic'>
					Menyuga qaytish
				</Button>
			</Link>
		</div>
	)
}

export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080B12] p-6'>
					<Loader2 className='animate-spin text-red-600' size={40} />
				</div>
			}
		>
			<PaymentSuccessContent />
		</Suspense>
	)
}
