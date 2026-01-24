'use client'

import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Price } from '@/components/ui/price'
import type { Order } from '@/lib/types'
import { useMounted } from '@/lib/useMounted'

interface OrderDetailsDialogProps {
	order: Order | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

// 1. Statuslarni bazadagi o'zbekcha qiymatlarga mosladik
const STATUS_LABELS: Record<string, string> = {
	yangi: 'Yangi',
	new: 'Yangi',
	tayyorlanmoqda: 'Tayyorlanmoqda',
	preparing: 'Tayyorlanmoqda',
	yakunlandi: 'Yakunlandi',
	ready: 'Yakunlandi',
}

const PAYMENT_LABELS: Record<string, string> = {
	cash: 'Naqd pul',
	card: 'Karta',
	click: 'Click',
	payme: 'Payme',
}

export function OrderDetailsDialog({
	order,
	open,
	onOpenChange,
}: OrderDetailsDialogProps) {
	const mounted = useMounted()

	if (!order) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>
						Buyurtma #{order.id.slice(0, 8).toUpperCase()}
					</DialogTitle>
					<DialogDescription suppressHydrationWarning>
						{mounted
							? new Date(order.created_at).toLocaleString('uz-UZ')
							: null}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Mijoz ma'lumotlari */}
					<div>
						<h4 className='font-semibold text-sm mb-1'>Mijoz</h4>
						<p className='text-sm'>{order.customer_name}</p>
						<p className='text-xs text-muted-foreground'>
							{/* customer_phone o'rniga phone */}
							{order.phone}
						</p>
					</div>

					{/* Buyurtma turi va manzili */}
					<div>
						<h4 className='font-semibold text-sm mb-1'>
							Yetkazib berish / Turi
						</h4>
						{/* mode o'rniga type ishlatamiz */}
						{order.type === 'restaurant' || order.type === 'dine-in' ? (
							<p className='text-sm'>
								Restoranda{' '}
								{order.table_number ? `- Stol #${order.table_number}` : ''}
							</p>
						) : (
							<p className='text-sm italic'>
								{order.delivery_address || "Manzil ko'rsatilmagan"}
							</p>
						)}
					</div>

					{/* Taomlar ro'yxati */}
					<div>
						<h4 className='font-semibold text-sm mb-2'>Buyurtma tarkibi</h4>
						<div className='space-y-2 max-h-[200px] overflow-y-auto pr-2'>
							{order.items.map((item, index) => (
								<div
									key={index}
									className='flex justify-between text-sm border-b border-slate-50 pb-1'
								>
									<span>
										{item.name}{' '}
										<span className='text-muted-foreground text-xs'>
											x{item.quantity}
										</span>
									</span>
									<Price value={item.price * item.quantity} />
								</div>
							))}
						</div>
					</div>

					{/* Hisob-kitob */}
					<div className='border-t border-border pt-3 space-y-1.5'>
						<div className='flex justify-between font-bold text-base'>
							<span>Jami summa:</span>
							{/* total o'rniga total_amount */}
							<Price value={order.total_amount || 0} />
						</div>
					</div>

					{/* To'lov usuli va Status */}
					<div className='flex justify-between items-center pt-2'>
						<div className='text-xs'>
							<span className='text-muted-foreground'>To'lov usuli: </span>
							<span className='font-medium uppercase'>
								{order.payment_method
									? PAYMENT_LABELS[order.payment_method] || order.payment_method
									: 'Naqd'}
							</span>
						</div>
						<Badge variant='secondary' className='font-bold'>
							{STATUS_LABELS[order.status] || order.status}
						</Badge>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
