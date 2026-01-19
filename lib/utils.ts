import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RESTAURANT_LOCATION } from './constants'

// Tip xatolarini oldini olish uchun default qiymatlar
const DELIVERY_FEE_PER_KM = 3000
const FREE_DELIVERY_DISTANCE_KM = 2
const FREE_DELIVERY_MIN_TOTAL = 100000

/**
 * Tailwind klasslarini birlashtirish
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Narxni formatlash
 */
export const formatPrice = (price: number | null | undefined) => {
	// Null yoki undefined bo'lsa, 0 ga o'rnatamiz
	const numPrice = price ?? 0
	
	// User requested "so'm" without space or specific formatting fix
	// Standard space formatting for numbers but tight "so'm" interaction
	return new Intl.NumberFormat('uz-UZ', {
		style: 'decimal',
		maximumFractionDigits: 0,
	})
		.format(numPrice)
		.replace(/,/g, ' ') + "so'm"
}

/**
 * Professional Haversine formulasi
 */
export function calculateDistance(lat: number, lng: number): number {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 0

	const R = 6371 // Yer radiusi (km)
	const toRad = (deg: number) => (deg * Math.PI) / 180

	const dLat = toRad(lat - RESTAURANT_LOCATION.lat)
	const dLon = toRad(lng - RESTAURANT_LOCATION.lng)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(RESTAURANT_LOCATION.lat)) *
			Math.cos(toRad(lat)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return parseFloat((R * c).toFixed(2))
}

/**
 * Yetkazib berish narxini hisoblash
 */
export function calculateDeliveryFee(
	distance: number,
	subtotal: number
): number {
	const dist = Number(distance) || 0
	const sub = Number(subtotal) || 0
	if (dist <= FREE_DELIVERY_DISTANCE_KM || sub >= FREE_DELIVERY_MIN_TOTAL)
		return 0
	return Math.round(dist * DELIVERY_FEE_PER_KM)
}

/**
 * UNIKAL BUYURTMA ID YARATISH (Build errorni to'g'irlash uchun)
 */
export function generateOrderId(): string {
	return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
		.toString(36)
		.substr(2, 5)
		.toUpperCase()}`
}
