'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useMenuStore, useOrderStore } from '@/lib/store'
import type { CartItem, Order } from '@/lib/types'
import { generateOrderId } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface NewPhoneOrderDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function NewPhoneOrderDialog({
	open,
	onOpenChange,
}: NewPhoneOrderDialogProps) {
	const menuItems = useMenuStore(state => state.items)
	const addOrder = useOrderStore(state => state.addOrder)

	const [customerName, setCustomerName] = useState('')
	const [customerPhone, setCustomerPhone] = useState('')
	const [orderMode, setOrderMode] = useState<'dine-in' | 'delivery'>('delivery')
	const [tableNumber, setTableNumber] = useState('')
	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [paymentMethod, setPaymentMethod] =
		useState<Order['payment_method']>('cash')
	const [orderItems, setOrderItems] = useState<CartItem[]>([])
	const [selectedItemId, setSelectedItemId] = useState<string>('')

	const addItemToOrder = () => {
		if (!selectedItemId) return
		const menuItem = menuItems.find(item => item.id === selectedItemId)
		if (!menuItem) return

		const existingItem = orderItems.find(item => item.id === selectedItemId)
		if (existingItem) {
			setOrderItems(
				orderItems.map(item =>
					item.id === selectedItemId
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			)
		} else {
			setOrderItems([...orderItems, { ...menuItem, quantity: 1 }])
		}
		setSelectedItemId('')
	}

	const updateItemQuantity = (id: string, quantity: number) => {
		if (quantity <= 0) {
			setOrderItems(orderItems.filter(item => item.id !== id))
		} else {
			setOrderItems(
				orderItems.map(item => (item.id === id ? { ...item, quantity } : item))
			)
		}
	}

	const removeItem = (id: string) => {
		setOrderItems(orderItems.filter(item => item.id !== id))
	}

	const subtotal = orderItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	)

	const handleSubmit = () => {
		const order: Order = {
			id: generateOrderId(),
			created_at: new Date().toISOString(),
			customer_name: customerName,
			customer_phone: customerPhone,
			mode: orderMode,
			table_number: orderMode === 'dine-in' ? tableNumber : undefined,
			delivery_address: orderMode === 'delivery' ? deliveryAddress : undefined,
			items: orderItems,
			subtotal,
			delivery_fee: 0,
			total: subtotal,
			status: 'new',
			source: 'call-center',
			payment_method: paymentMethod,
			payment_status: 'pending',
		}
		addOrder(order)
		resetForm()
		onOpenChange(false)
	}

	const resetForm = () => {
		setCustomerName('')
		setCustomerPhone('')
		setOrderMode('delivery')
		setTableNumber('')
		setDeliveryAddress('')
		setPaymentMethod('cash')
		setOrderItems([])
	}

	const isValid =
		customerName &&
		customerPhone &&
		orderItems.length > 0 &&
		(orderMode === 'dine-in' ? tableNumber : deliveryAddress)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Yangi telefon buyurtma</DialogTitle>
					<DialogDescription>
						Call-center orqali yangi buyurtma qo'shish
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Customer Info */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='name'>Mijoz ismi</Label>
							<Input
								id='name'
								value={customerName}
								onChange={e => setCustomerName(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor='phone'>Telefon</Label>
							<Input
								id='phone'
								value={customerPhone}
								onChange={e => setCustomerPhone(e.target.value)}
							/>
						</div>
					</div>

					{/* Order Mode */}
					<div>
						<Label>Buyurtma turi</Label>
						<RadioGroup
							value={orderMode}
							onValueChange={v => setOrderMode(v as 'dine-in' | 'delivery')}
							className='flex gap-4 mt-2'
						>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='delivery' id='r-delivery' />
								<Label htmlFor='r-delivery'>Yetkazish</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='dine-in' id='r-dinein' />
								<Label htmlFor='r-dinein'>Restoranda</Label>
							</div>
						</RadioGroup>
					</div>

					{orderMode === 'dine-in' ? (
						<div>
							<Label htmlFor='table'>Stol raqami</Label>
							<Input
								id='table'
								value={tableNumber}
								onChange={e => setTableNumber(e.target.value)}
							/>
						</div>
					) : (
						<div>
							<Label htmlFor='address'>Manzil</Label>
							<Input
								id='address'
								value={deliveryAddress}
								onChange={e => setDeliveryAddress(e.target.value)}
							/>
						</div>
					)}

					{/* Payment Method */}
					<div>
						<Label htmlFor='payment'>To'lov usuli</Label>
						<Select
							value={paymentMethod}
							onValueChange={v =>
								setPaymentMethod(v as Order['payment_method'])
							}
						>
							<SelectTrigger className='bg-background'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='cash'>Naqd pul</SelectItem>
								<SelectItem value='card'>Karta</SelectItem>
								<SelectItem value='click'>Click</SelectItem>
								<SelectItem value='payme'>Payme</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Add Items */}
					<div>
						<Label>Taom qo'shish</Label>
						<div className='flex gap-2 mt-2'>
							<Select value={selectedItemId} onValueChange={setSelectedItemId}>
								<SelectTrigger className='flex-1 bg-background'>
									<SelectValue placeholder='Taom tanlang' />
								</SelectTrigger>
								<SelectContent>
									{menuItems.map(item => (
										<SelectItem key={item.id} value={item.id}>
											{item.name} - <Price value={item.price} />
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button onClick={addItemToOrder} disabled={!selectedItemId}>
								<Plus className='h-4 w-4' />
							</Button>
						</div>
					</div>

					{/* Order Items */}
					{orderItems.length > 0 && (
						<div className='border border-border rounded-lg p-4'>
							<h4 className='font-medium mb-3'>Buyurtma tarkibi</h4>
							<div className='space-y-2'>
								{orderItems.map(item => (
									<div
										key={item.id}
										className='flex items-center justify-between'
									>
										<span className='text-sm'>{item.name}</span>
										<div className='flex items-center gap-2'>
											<Price
												value={item.price}
												className='text-sm text-muted-foreground'
											/>
											<Button
												variant='outline'
												size='icon'
												className='h-6 w-6 bg-transparent'
												onClick={() =>
													updateItemQuantity(item.id, item.quantity - 1)
												}
											>
												<Minus className='h-3 w-3' />
											</Button>
											<span className='w-6 text-center text-sm'>
												{item.quantity}
											</span>
											<Button
												variant='outline'
												size='icon'
												className='h-6 w-6 bg-transparent'
												onClick={() =>
													updateItemQuantity(item.id, item.quantity + 1)
												}
											>
												<Plus className='h-3 w-3' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-6 w-6 text-destructive'
												onClick={() => removeItem(item.id)}
											>
												<Trash2 className='h-3 w-3' />
											</Button>
										</div>
									</div>
								))}
							</div>
							<div className='border-t border-border mt-3 pt-3 flex justify-between font-medium'>
								<span>Jami:</span>
								<Price value={subtotal} />
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Bekor qilish
					</Button>
					<Button onClick={handleSubmit} disabled={!isValid}>
						Buyurtma qo'shish
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
