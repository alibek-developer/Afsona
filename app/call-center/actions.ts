'use server'

import { createClient } from '@supabase/supabase-js'

export async function submitOrder(orderData: any) {
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!
	)

	// User requested explicit fields
	// User requested explicit fields
	const payload = {
		customer_name: orderData.customer_name,
		phone: orderData.phone,
		items: orderData.items.map((item: any) => ({
			id: item.item.id,
			name: item.item.name,
			price: item.item.price,
			quantity: item.quantity,
		})),
		total_amount: orderData.total_amount,
		delivery_fee: orderData.delivery_fee || 0,
		type: orderData.mode, // Use 'type' instead of 'mode'
		table_number: orderData.table_number,
		delivery_address: orderData.delivery_address,
		status: 'new',
		source: 'call-center',
		payment_method: (orderData.payment_method || 'cash').toLowerCase(), // Lowercase payment_method
	}

	console.log('Admin Insert Payload:', JSON.stringify(payload, null, 2))

	try {
		const { data, error } = await (supabaseAdmin
			.from('orders')
			.insert([payload] as any) as any)
			.select()

		if (error) {
			console.error('Supabase Admin Insert Error:', error.message)
			return { success: false, message: error.message }
		}

		return { success: true, data }
	} catch (err: any) {
		console.error('Unexpected Error in submitOrder:', err)
		return { success: false, message: err.message || 'Unknown error' }
	}
}
