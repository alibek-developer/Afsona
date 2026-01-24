export interface MenuItem {
	id: string
	name: string
	description: string
	price: number
	category: string
	image_url: string
	available_on_mobile: boolean
	available_on_website: boolean
	is_active?: boolean
}

export interface CartItem extends MenuItem {
	quantity: number
}

export interface SavedOrderItem {
	id: string
	name: string
	price: number
	quantity: number
}

export interface Order {
	id: string
	created_at: string
	customer_name: string
	phone: string
	mode: 'delivery' | 'dine-in' | 'restaurant'
	type?: 'delivery' | 'dine-in' | 'restaurant'
	delivery_address?: string | null
	table_number?: string | null
	items: SavedOrderItem[]
	total_amount: number
	delivery_fee?: number
	status: 'new' | 'preparing' | 'ready' | 'yangi' | 'tayyorlanmoqda' | 'yakunlandi'
	source: 'website' | 'mobile' | 'call-center'
	payment_method: 'cash' | 'card' | 'click' | 'payme'
}

export const CATEGORIES = [
	{ id: 'XAMIRLI TAOMLAR', name: 'Xamirli taomlar', icon: '🥟' },
	{ id: 'SUYUQ OVQATLAR', name: 'Suyuq ovqatlar', icon: '🍲' },
	{ id: 'SHASHLIK', name: 'Shashliklar', icon: '🍢' },
	{
		id: "MILLIY GO'SHTLI TAOMLAR",
		name: 'Milliy go‘shtli taomlar',
		icon: '🍽️',
	},
	{ id: 'BALIQ', name: 'Baliq taomlari', icon: '🐟' },
	{ id: 'ICHIMLIKLAR', name: 'Ichimliklar', icon: '🥤' },
] as const
export const FREE_DELIVERY_DISTANCE_KM = 3
export const FREE_DELIVERY_MIN_TOTAL = 300000
export const DELIVERY_FEE_PER_KM = 5000
