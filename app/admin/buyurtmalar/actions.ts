// app/admin/orders/actions.ts
'use server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Yoki Anon Key
)

export async function getAdminOrders(page: number, date: string) {
	const itemsPerPage = 10 // Sahifadagi buyurtmalar soni
	const from = (page - 1) * itemsPerPage
	const to = from + itemsPerPage - 1

	const startOfDay = `${date}T00:00:00.000Z`
	const endOfDay = `${date}T23:59:59.999Z`

	const { data, count, error } = await supabase
		.from('orders')
		.select('*', { count: 'exact' }) // BU JUDA MUHIM: Jami qatorlarni sanaydi
		.gte('created_at', startOfDay)
		.lte('created_at', endOfDay)
		.order('created_at', { ascending: false })
		.range(from, to)

	if (error) throw error

	return {
		orders: data || [],
		// Jami sahifalar sonini hisoblab qaytaramiz
		totalPages: count ? Math.ceil(count / itemsPerPage) : 1,
	}
}
