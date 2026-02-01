'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function submitOrder(orderData: any) {
	try {
		const { data, error } = await supabaseAdmin.from('orders').insert([
			{
				customer_name: orderData.customer_name,
				phone: orderData.phone,
				delivery_address: orderData.delivery_address,
				type: orderData.type, // 'delivery' yoki 'dine_in'
				items: orderData.items, // JSON formatda
				total_amount: orderData.total_amount,
				status: orderData.status || 'yangi',
			},
		])

		if (error) throw error
		return { success: true }
	} catch (error: any) {
		console.error('Xatolik:', error.message)
		return { success: false, message: error.message }
	}
}
