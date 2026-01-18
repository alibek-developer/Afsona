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

const STATUS_LABELS: Record<Order['status'], string> = {
	new: 'Yangi',
	preparing: 'Tayyorlanmoqda',
	ready: 'Tayyor',
	delivered: 'Yetkazildi',
}

const PAYMENT_LABELS: Record<Order['payment_method'], string> = {
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Buyurtma #{order.id}</DialogTitle>
					<DialogDescription suppressHydrationWarning>
						{mounted
							? new Date(order.created_at).toLocaleString('uz-UZ')
							: null}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Customer Info */}
					<div>
						<h4 className='font-medium mb-2'>Mijoz</h4>
						<p>{order.customer_name}</p>
						<p className='text-sm text-muted-foreground'>
							{order.customer_phone}
						</p>
					</div>

					{/* Order Type */}
					<div>
						<h4 className='font-medium mb-2'>Turi</h4>
						{order.mode === 'dine-in' ? (
							<p>Restoranda - Stol #{order.table_number}</p>
						) : (
							<p>{order.delivery_address}</p>
						)}
					</div>

					{/* Items */}
					<div>
						<h4 className='font-medium mb-2'>Taomlar</h4>
						<div className='space-y-2'>
							{order.items.map((item, index) => (
								<div key={index} className='flex justify-between text-sm'>
									<span>
										{item.name} x{item.quantity}
									</span>
									<Price value={item.price * item.quantity} />
								</div>
							))}
						</div>
					</div>

					{/* Totals */}
					<div className='border-t border-border pt-4 space-y-2'>
						<div className='flex justify-between text-sm'>
							<span className='text-muted-foreground'>Taomlar:</span>
							<Price value={order.subtotal} />
						</div>
						{order.delivery_fee > 0 && (
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground'>Yetkazish:</span>
								<Price value={order.delivery_fee} />
							</div>
						)}
						<div className='flex justify-between font-medium'>
							<span>Jami:</span>
							<Price value={order.total} />
						</div>
					</div>

					{/* Payment & Status */}
					<div className='flex justify-between items-center'>
						<div>
							<span className='text-sm text-muted-foreground'>To'lov: </span>
							<span className='text-sm'>
								{PAYMENT_LABELS[order.payment_method]}
							</span>
						</div>
						<Badge>{STATUS_LABELS[order.status]}</Badge>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
