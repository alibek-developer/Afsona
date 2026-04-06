import { createClient } from '@supabase/supabase-js'

export type OrderStatus = 
  | 'yangi'
  | 'qabul_qilindi'
  | 'tayyorlanmoqda'
  | 'tayyor'
  | 'olib_ketildi'
  | "yo'lda"
  | 'on_the_way'
  | 'yetkazildi'
  | 'delivered'
  | 'cancelled'

export type OrderStatusHistoryEntry = {
  order_id: string
  old_status: string | null
  new_status: string
  changed_by: string
  note?: string
  created_at: string
}

export interface UpdateOrderStatusParams {
  orderId: string
  newStatus: OrderStatus
  changedBy: string
  note?: string
  courierId?: string
  autoStatusEnabled?: boolean
  skipHistory?: boolean
}

export interface UpdateOrderStatusResult {
  success: boolean
  oldStatus?: string
  newStatus?: string
  error?: string
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const STATUS_TIMESTAMP_MAP: Record<string, string | null> = {
  yangi: null,
  qabul_qilindi: 'accepted_at',
  tayyorlanmoqda: 'preparing_at',
  tayyor: 'ready_at',
  ready: 'ready_at',
  olib_ketildi: 'picked_at',
  picked_up: 'picked_at',
  "yo'lda": 'on_the_way_at',
  on_the_way: 'on_the_way_at',
  yetkazildi: 'delivered_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
  new: null,
  accepted: 'accepted_at',
  preparing: 'preparing_at',
}

export async function getTimestampFieldForStatus(status: string): Promise<string | null> {
  return STATUS_TIMESTAMP_MAP[status] || null
}

export async function updateOrderStatus(params: UpdateOrderStatusParams): Promise<UpdateOrderStatusResult> {
  const { orderId, newStatus, changedBy, note, courierId, skipHistory = false } = params

  try {
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status, courier_id, delivery_fee, latitude, longitude')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      console.error('[updateOrderStatus] Fetch error:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const oldStatus = currentOrder.status

    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    const timestampField = await getTimestampFieldForStatus(newStatus)
    if (timestampField) {
      updateData[timestampField] = new Date().toISOString()
    }

    if (courierId && !currentOrder.courier_id) {
      updateData.courier_id = courierId
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      console.error('[updateOrderStatus] Update error:', updateError)
      return { success: false, error: updateError.message }
    }

    if (!skipHistory) {
      await recordStatusHistory({
        orderId,
        oldStatus,
        newStatus,
        changedBy,
        note,
      })
    }

    return { success: true, oldStatus, newStatus }
  } catch (err: any) {
    console.error('[updateOrderStatus] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function recordStatusHistory(params: {
  orderId: string
  oldStatus: string | null
  newStatus: string
  changedBy: string
  note?: string
}): Promise<boolean> {
  const { orderId, oldStatus, newStatus, changedBy, note } = params

  if (oldStatus === newStatus) {
    return true
  }

  try {
    const { error } = await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        note: note || null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[recordStatusHistory] Error:', error)
      return false
    }

    return true
  } catch (err: any) {
    console.error('[recordStatusHistory] Unexpected error:', err)
    return false
  }
}

export async function getOrderStatusHistory(orderId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[getOrderStatusHistory] Error:', error)
      return []
    }

    return data || []
  } catch (err: any) {
    console.error('[getOrderStatusHistory] Unexpected error:', err)
    return []
  }
}

export async function estimateDeliveryTime(orderId: string): Promise<string | null> {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('latitude, longitude, created_at')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return null
    }

    const avgPrepTimeMinutes = 30
    const avgDeliveryTimeMinutes = 25

    const estimatedMinutes = avgPrepTimeMinutes + avgDeliveryTimeMinutes
    
    const createdAt = new Date(order.created_at)
    const estimated = new Date(createdAt.getTime() + estimatedMinutes * 60000)

    return estimated.toISOString()
  } catch (err: any) {
    console.error('[estimateDeliveryTime] Unexpected error:', err)
    return null
  }
}

export async function setEstimatedDeliveryTime(
  orderId: string,
  estimatedAt: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ estimated_delivery_at: estimatedAt })
      .eq('id', orderId)

    if (error) {
      console.error('[setEstimatedDeliveryTime] Error:', error)
      return false
    }

    return true
  } catch (err: any) {
    console.error('[setEstimatedDeliveryTime] Unexpected error:', err)
    return false
  }
}

export async function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): Promise<boolean> {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    yangi: ['qabul_qilindi', 'cancelled'],
    qabul_qilindi: ['tayyorlanmoqda', 'cancelled'],
    tayyorlanmoqda: ['tayyor', 'cancelled'],
    tayyor: ['olib_ketildi', "yo'lda", 'on_the_way', 'cancelled'],
    olib_ketildi: ["yo'lda", 'on_the_way', 'cancelled'],
    "yo'lda": ['yetkazildi', 'cancelled'],
    on_the_way: ['yetkazildi', 'delivered', 'cancelled'],
    yetkazildi: [],
    delivered: [],
    cancelled: [],
    new: ['accepted', 'preparing', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['on_the_way', 'cancelled'],
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []
  return allowedTransitions.includes(newStatus)
}

export async function getOrderWithTrackingData(orderId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        accepted_at,
        preparing_at,
        ready_at,
        picked_at,
        on_the_way_at,
        delivered_at,
        cancelled_at,
        courier_latitude,
        courier_longitude
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('[getOrderWithTrackingData] Error:', error)
      return null
    }

    return data
  } catch (err: any) {
    console.error('[getOrderWithTrackingData] Unexpected error:', err)
    return null
  }
}
