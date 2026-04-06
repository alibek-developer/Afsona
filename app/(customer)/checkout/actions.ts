'use server'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type CheckoutLineInput = {
	menu_item_id: string
	quantity: number
}

export type ResolvedOrderItem = {
	id: string
	name: string
	price: number
	quantity: number
}

const MAX_LINES = 50
const MAX_QTY_PER_SKU = 99

const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Reads menu prices. Prefers service role; falls back to anon (same as /menu in the browser)
 * so quotes work when SUPABASE_SERVICE_ROLE_KEY is not set yet.
 * Inserts still require getOrderWriteClient().
 */
function getPricingClient(): SupabaseClient {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

	if (!url || !anon) {
		throw new Error(
			'NEXT_PUBLIC_SUPABASE_URL yoki NEXT_PUBLIC_SUPABASE_ANON_KEY topilmadi',
		)
	}
	// Avoid passing 'PASTE_YOUR...' invalid strings which throw "Invalid API key" from inside Supabase's createClient itself.
	if (service && service.startsWith('ey')) {
		return createClient(url, service)
	}
	// Valid fallback for pricing
	return createClient(url, anon)
}

function getOrderWriteClient(): SupabaseClient {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!url) {
		throw new Error("Tizim xatosi: NEXT_PUBLIC_SUPABASE_URL topilmadi")
	}

	if (key && key.startsWith('ey')) {
		return createClient(url, key)
	}

	if (anon) {
		console.warn('[checkout/actions] DEBUG: Service Role key missing. Falling back to ANON key for writing orders. RLS INSERT policy must be configured.')
		return createClient(url, anon)
	}

	throw new Error("SUPABASE_ANON_KEY topilmadi.")
}

/** Website checkout: same rules as customer menu + featured section (null is_available = allow if website). */
function isRowPurchasableOnWebsite(row: Record<string, unknown>): boolean {
	if (row.available_on_website !== true) return false
	if (row.is_available === false) return false
	if (row.is_active === false) return false
	return true
}

function mergeLines(lines: CheckoutLineInput[]): CheckoutLineInput[] {
	const map = new Map<string, number>()
	for (const raw of lines) {
		const id = String(raw.menu_item_id ?? '').trim()
		const q = Math.floor(Number(raw.quantity))
		if (!id || q < 1) continue
		map.set(id, Math.min((map.get(id) ?? 0) + q, MAX_QTY_PER_SKU))
	}
	return [...map.entries()].map(([menu_item_id, quantity]) => ({
		menu_item_id,
		quantity,
	}))
}

async function resolveMenuLines(
	admin: SupabaseClient,
	lines: CheckoutLineInput[],
): Promise<{ resolved: ResolvedOrderItem[]; total: number }> {
	const merged = mergeLines(lines)
	if (merged.length === 0) {
		throw new Error("Savat bo'sh")
	}
	if (merged.length > MAX_LINES) {
		throw new Error("Juda ko'p turdagi mahsulot")
	}

	const ids = merged.map(l => l.menu_item_id)
	const uniqueIds = [...new Set(ids)]

	const { data: rows, error } = await admin
		.from('menu_items')
		.select('*')
		.in('id', uniqueIds)

	if (error) {
		throw new Error(error.message)
	}
	if (!rows || rows.length !== uniqueIds.length) {
		throw new Error(
			"Ba'zi taomlar topilmadi yoki menyudan olib tashlangan. Savatdagi mahsulotlar bazadagi ID bilan mos kelmayapti (masalan, eski test savati). Menyudan qayta tanlang.",
		)
	}

	for (const row of rows) {
		const r = row as Record<string, unknown>
		if (!isRowPurchasableOnWebsite(r)) {
			const name = typeof r.name === 'string' ? r.name : 'taom'
			throw new Error(`Hozircha buyurtma berib bo'lmaydi: ${name}`)
		}
	}

	const byId = new Map(
		rows.map(r => [String((r as Record<string, unknown>).id), r as Record<string, unknown>]),
	)
	const resolved: ResolvedOrderItem[] = []
	let total = 0

	for (const l of merged) {
		const row = byId.get(String(l.menu_item_id))
		if (!row) {
			throw new Error("Noto'g'ri mahsulot")
		}
		const price = Number(row.price)
		if (!Number.isFinite(price) || price < 0) {
			throw new Error("Noto'g'ri narx")
		}
		total += price * l.quantity
		resolved.push({
			id: String(row.id),
			name: String(row.name ?? ''),
			price,
			quantity: l.quantity,
		})
	}

	return { resolved, total }
}

/**
 * Read-only: server prices for checkout UI (no insert, no idempotency).
 */
export async function getCheckoutTotals(lines: CheckoutLineInput[]): Promise<{
	ok: true
	resolved: ResolvedOrderItem[]
	total: number
} | { ok: false; message: string }> {
	try {
        console.log('[checkout/actions] DEBUG: starting getCheckoutTotals')
		const client = getPricingClient()
		const { resolved, total } = await resolveMenuLines(client, lines)
        console.log(`[checkout/actions] DEBUG: getCheckoutTotals success | Items: ${resolved.length} | Total: ${total}`)
		return { ok: true, resolved, total }
	} catch (e) {
		console.error('DEBUG: [checkout/actions] getCheckoutTotals catch block error:', e)
		const message = e instanceof Error ? e.message : 'Xatolik'
		return { ok: false, message }
	}
}

export type CreateWebsiteOrderInput = {
	idempotencyKey: string
	lines: CheckoutLineInput[]
	customer_name: string
	phone: string
	type: 'delivery' | 'dine-in'
	delivery_address: string
	latitude?: number | null
	longitude?: number | null
	payment_method?: 'cash' | 'payme' | null
}

/**
 * Creates an order with DB-backed line items and totals. Idempotent per idempotencyKey.
 */
export async function createWebsiteOrder(
	input: CreateWebsiteOrderInput,
): Promise<
	| {
			ok: true
			orderId: string
			total_amount: number
			items: ResolvedOrderItem[]
			idempotentReplay: boolean
	  }
	| { ok: false; message: string }
> {
	try {
		if (!UUID_V4.test(input.idempotencyKey)) {
			return { ok: false, message: "Noto'g'ri idempotency kaliti" }
		}

		const pricing = getPricingClient()
		const { resolved, total } = await resolveMenuLines(pricing, input.lines)

		const admin = getOrderWriteClient()

		const { data: existing, error: existingErr } = await admin
			.from('orders')
			.select('id, total_amount, items')
			.eq('idempotency_key', input.idempotencyKey)
			.maybeSingle()

		if (existingErr) {
			return { 
				ok: false, 
				message: `Baza Select xatosi [${existingErr.code}]: ${existingErr.message} ${existingErr.hint ? '(' + existingErr.hint + ')' : ''}` 
			}
		}

		if (existing) {
			return {
				ok: true,
				orderId: existing.id,
				total_amount: Number(existing.total_amount),
				items: existing.items as ResolvedOrderItem[],
				idempotentReplay: true,
			}
		}

		const row: Record<string, unknown> = {
			idempotency_key: input.idempotencyKey,
			customer_name: input.customer_name.trim(),
			phone: input.phone.trim(),
			delivery_address: input.delivery_address,
			type: input.type,
			status: 'yangi',
			items: resolved,
			total_amount: total,
			source: 'website',
		}

		if (input.payment_method) {
			row.payment_method = input.payment_method
		}

		if (
			input.type === 'delivery' &&
			input.latitude != null &&
			input.longitude != null
		) {
			row.latitude = input.latitude
			row.longitude = input.longitude
		}

		const { data: inserted, error: insertErr } = await admin
			.from('orders')
			.insert([row])
			.select('id, total_amount, items')
			.single()

		if (insertErr) {
			if (insertErr.code === '23505') {
				const { data: again } = await admin
					.from('orders')
					.select('id, total_amount, items')
					.eq('idempotency_key', input.idempotencyKey)
					.single()

				if (again) {
					return {
						ok: true,
						orderId: again.id,
						total_amount: Number(again.total_amount),
						items: again.items as ResolvedOrderItem[],
						idempotentReplay: true,
					}
				}
			}
			return { 
				ok: false, 
				message: `Baza Insert xatosi [${insertErr.code}]: ${insertErr.message}. Hint: ${insertErr.hint || 'Yo`q'}, Details: ${insertErr.details || 'Yo`q'}` 
			}
		}

		if (!inserted) {
			return { ok: false, message: 'Buyurtma yaratilmadi' }
		}

		return {
			ok: true,
			orderId: inserted.id,
			total_amount: Number(inserted.total_amount),
			items: inserted.items as ResolvedOrderItem[],
			idempotentReplay: false,
		}
	} catch (e: any) {
		console.error('DEBUG: [checkout/actions] createWebsiteOrder catch block error:', e)
		const message = `Server Catch xatosi: ${e?.message || JSON.stringify(e)}`
		return { ok: false, message }
	}
}
