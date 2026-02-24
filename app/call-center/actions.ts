'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
}

interface OrderData {
	customer_name: string
	phone: string
	type: 'delivery' | 'dine_in'
	delivery_address: string
	items: OrderItem[]
	total_amount: number
	status: string
	latitude?: number
	longitude?: number
	landmark?: string
}

interface ReservationData {
	table_id: string
	customer_name: string
	phone: string
	reservation_date: string
	start_time: string
	end_time: string
	room_total?: number
	food_total?: number
	service_fee?: number
	total_amount?: number
}

// Service fee percentage
const SERVICE_FEE_PERCENT = 0.10

/**
 * Submit a new food order from call-center
 */
export async function submitOrder(orderData: OrderData) {
	try {
		// Validate required fields
		if (!orderData.customer_name || !orderData.phone || !orderData.type || typeof orderData.total_amount === 'undefined' || orderData.total_amount === null) {
			console.error("❌ INSERT FAILED – Missing required fields:", {
				customer_name: orderData.customer_name,
				phone: orderData.phone,
				type: orderData.type,
				total_amount: orderData.total_amount,
			});
			
			return { 
				success: false, 
				message: "Missing required fields: customer_name, phone, type, or total_amount" 
			};
		}

		// Always use the passed delivery_address (which contains the current text value)
		// Never fallback to stored value or other fields
		const deliveryAddress = orderData.delivery_address || '';

		// Prepare order payload
		const orderPayload = {
			customer_name: orderData.customer_name,
			phone: orderData.phone,
			delivery_address: deliveryAddress,
			type: orderData.type,
			items: orderData.items,
			total_amount: orderData.total_amount,
			status: orderData.status || 'yangi',
			source: 'call-center',
			...(orderData.latitude !== undefined && { latitude: orderData.latitude }),
			...(orderData.longitude !== undefined && { longitude: orderData.longitude }),
			...(orderData.landmark && { landmark: orderData.landmark }),
		};

		console.log("📦 ORDER PAYLOAD:", orderPayload);

		const { data, error } = await supabaseAdmin
			.from('orders')
			.insert([orderPayload])
			.select();

		if (error) {
			console.error("❌ SUPABASE INSERT ERROR FULL:", {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
			});

			return { 
				success: false, 
				message: "Database error: " + error.message 
			};
		}

		if (!data || data.length === 0) {
			console.error("❌ INSERT FAILED – NO DATA RETURNED");
			return { 
				success: false, 
				message: "Insert failed unexpectedly" 
			};
		}

		return { success: true, data }
	} catch (error: any) {
		console.error("❌ UNEXPECTED ERROR:", error);
		return { success: false, message: error.message || "Unexpected error occurred" }
	}
}

/**
 * Calculate total with service fee (Server Action)
 * Business logic: Food only + 10% service fee (Room has no hourly rate)
 */
export async function calculateTotalWithServiceFee(
	foodTotal: number
): Promise<{ subtotal: number; serviceFee: number; total: number }> {
	const subtotal = foodTotal
	const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENT)
	const total = subtotal + serviceFee
	return { subtotal, serviceFee, total }
}

/**
 * Create a new table reservation from call-center
 */
export async function createReservation(reservationData: ReservationData) {
	try {
		// Calculate service fee if amounts provided
		let serviceFee = reservationData.service_fee || 0
		let totalAmount = reservationData.total_amount || 0

		if (reservationData.food_total !== undefined) {
			const calculation = await calculateTotalWithServiceFee(
				reservationData.food_total
			)
			serviceFee = calculation.serviceFee
			totalAmount = calculation.total
		}

		const { data, error } = await supabaseAdmin
			.from('table_reservations')
			.insert([
				{
					table_id: reservationData.table_id,
					customer_name: reservationData.customer_name,
					phone: reservationData.phone,
					reservation_date: reservationData.reservation_date,
					start_time: reservationData.start_time,
					end_time: reservationData.end_time,
					room_total: reservationData.room_total || 0,
					food_total: reservationData.food_total || 0,
					service_fee: serviceFee,
					total_amount: totalAmount,
					source: 'call-center',
					status: 'active',
				},
			])

		if (error) throw error
		return { success: true, data, totalAmount, serviceFee }
	} catch (error: any) {
		console.error('Reservation creation error:', error.message)
		return { success: false, message: error.message }
	}
}

/**
 * Fetch all available tables/rooms
 */
export async function fetchTables() {
	try {
		const { data, error } = await supabaseAdmin
			.from('tables')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) throw error
		return { success: true, data: data || [] }
	} catch (error: any) {
		console.error('Fetch tables error:', error.message)
		return { success: false, message: error.message, data: [] }
	}
}

/**
 * Fetch all active menu items
 */
export async function fetchMenuItems() {
	try {
		const { data, error } = await supabaseAdmin
			.from('menu_items')
			.select('*')
			.eq('is_active', true)
			.order('category')

		if (error) throw error
		return { success: true, data: data || [] }
	} catch (error: any) {
		console.error('Fetch menu items error:', error.message)
		return { success: false, message: error.message, data: [] }
	}
}

/**
 * Check if a table has an active order (real-time availability)
 */
export async function checkTableAvailability(tableId: string) {
	try {
		const { data, error } = await supabaseAdmin
			.from('orders')
			.select('*')
			.eq('table_id', tableId)
			.eq('status', 'active')
			.maybeSingle()

		if (error) throw error
		return { 
			success: true, 
			isAvailable: !data,
			activeOrder: data 
		}
	} catch (error: any) {
		console.error('Check availability error:', error.message)
		return { success: false, message: error.message, isAvailable: true }
	}
}

/**
 * Fetch all tables with their active order status
 */
export async function fetchTablesWithStatus() {
	try {
		// Fetch all tables
		const { data: tables, error: tablesError } = await supabaseAdmin
			.from('tables')
			.select('*')
			.order('created_at', { ascending: false })

		if (tablesError) throw tablesError

		// Fetch all active orders
		const { data: activeOrders, error: ordersError } = await supabaseAdmin
			.from('orders')
			.select('*')
			.eq('status', 'active')

		if (ordersError) throw ordersError

		// Map tables with their status
		const tablesWithStatus = (tables || []).map(table => {
			const activeOrder = activeOrders?.find(order => order.table_id === table.id)
			return {
				...table,
				is_available: !activeOrder,
				active_order: activeOrder || null
			}
		})

		return { success: true, data: tablesWithStatus }
	} catch (error: any) {
		console.error('Fetch tables with status error:', error.message)
		return { success: false, message: error.message, data: [] }
	}
}

/**
 * Complete an active order (free up the room)
 */
export async function completeOrder(orderId: string) {
	try {
		const { data, error } = await supabaseAdmin
			.from('orders')
			.update({
				status: 'completed',
				completed_at: new Date().toISOString()
			})
			.eq('id', orderId)

		if (error) throw error
		return { success: true, data }
	} catch (error: any) {
		console.error('Complete order error:', error.message)
		return { success: false, message: error.message }
	}
}

/**
 * Create a new room order (marks room as busy)
 */
export async function createRoomOrder(orderData: {
	table_id: string
	customer_name: string
	phone: string
	total_amount: number
}) {
	try {
		const { data, error } = await supabaseAdmin
			.from('orders')
			.insert([{
				table_id: orderData.table_id,
				customer_name: orderData.customer_name,
				phone: orderData.phone,
				total_amount: orderData.total_amount,
				status: 'active',
				source: 'call-center',
				created_at: new Date().toISOString()
			}])

		if (error) throw error
		return { success: true, data }
	} catch (error: any) {
		console.error('Create room order error:', error.message)
		return { success: false, message: error.message }
	}
}
