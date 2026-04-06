import { createClient } from '@supabase/supabase-js'
import { COMPLETED_ORDER_STATUSES, type CourierAssignmentResult, type AssignCourierParams } from './courier-types'

export { COMPLETED_ORDER_STATUSES }
export type { CourierAssignmentResult, AssignCourierParams }

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export const SERVICE_STATUSES = COMPLETED_ORDER_STATUSES

export async function assignCourierToOrder(params: AssignCourierParams): Promise<CourierAssignmentResult> {
  const { orderId, courierId, priority = 0, sequenceNo = null } = params

  try {
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('courier_assignments')
      .select('id, status')
      .eq('order_id', orderId)
      .eq('courier_id', courierId)
      .not('status', 'in', `(${COMPLETED_ORDER_STATUSES.map(s => `'${s}'`).join(',')})`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[assignCourier] Check error:', checkError)
    }

    if (existing) {
      return { success: true, assignmentId: existing.id }
    }

    let maxSequence = 0
    if (sequenceNo === null) {
      const { data: lastAssignment } = await supabaseAdmin
        .from('courier_assignments')
        .select('sequence_no')
        .eq('courier_id', courierId)
        .not('status', 'in', `(${COMPLETED_ORDER_STATUSES.map(s => `'${s}'`).join(',')})`)
        .order('sequence_no', { ascending: false })
        .limit(1)
        .single()

      if (lastAssignment?.sequence_no) {
        maxSequence = lastAssignment.sequence_no
      }
    }

    const { data: assignment, error: insertError } = await supabaseAdmin
      .from('courier_assignments')
      .insert({
        order_id: orderId,
        courier_id: courierId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        priority,
        sequence_no: sequenceNo !== null ? sequenceNo : maxSequence + 1,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[assignCourier] Insert error:', insertError)
      return { success: false, error: insertError.message }
    }

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ courier_id: courierId })
      .eq('id', orderId)

    if (orderError) {
      console.error('[assignCourier] Order update error:', orderError)
    }

    return { success: true, assignmentId: assignment.id }
  } catch (err: any) {
    console.error('[assignCourier] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function getCourierActiveOrders(courierId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('courier_assignments')
      .select(`
        id,
        order_id,
        courier_id,
        status,
        sequence_no,
        priority,
        assigned_at,
        orders:order_id (
          id,
          status,
          customer_name,
          phone,
          delivery_address,
          latitude,
          longitude,
          total_amount,
          delivery_fee,
          estimated_delivery_at
        )
      `)
      .eq('courier_id', courierId)
      .not('status', 'in', `(${COMPLETED_ORDER_STATUSES.map(s => `'${s}'`).join(',')})`)
      .order('sequence_no', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .order('assigned_at', { ascending: true })

    if (error) {
      console.error('[getCourierActiveOrders] Error:', error)
      return []
    }

    const orders = (data || [])
      .filter((a: any) => a.orders && !COMPLETED_ORDER_STATUSES.includes(a.orders.status))
      .map((a: any) => ({
        assignment_id: a.id,
        order_id: a.order_id,
        courier_id: a.courier_id,
        status: a.orders.status,
        sequence_no: a.sequence_no,
        priority: a.priority,
        assigned_at: a.assigned_at,
        customer_name: a.orders.customer_name,
        phone: a.orders.phone,
        delivery_address: a.orders.delivery_address,
        latitude: a.orders.latitude,
        longitude: a.orders.longitude,
        total_amount: a.orders.total_amount,
        delivery_fee: a.orders.delivery_fee,
        estimated_delivery_at: a.orders.estimated_delivery_at,
      }))

    return orders
  } catch (err: any) {
    console.error('[getCourierActiveOrders] Unexpected error:', err)
    return []
  }
}

export async function getCourierActiveOrderCount(courierId: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('courier_assignments')
      .select('id', { count: 'exact' })
      .eq('courier_id', courierId)
      .not('status', 'in', `(${COMPLETED_ORDER_STATUSES.map(s => `'${s}'`).join(',')})`)

    if (error) {
      console.error('[getCourierActiveOrderCount] Error:', error)
      return 0
    }

    return count || 0
  } catch (err: any) {
    console.error('[getCourierActiveOrderCount] Unexpected error:', err)
    return 0
  }
}

export async function updateAssignmentStatus(
  assignmentId: string,
  newStatus: 'assigned' | 'accepted' | 'on_the_way' | 'delivered' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, any> = { status: newStatus }

    if (newStatus === 'accepted') {
      updateData.accepted_at = new Date().toISOString()
    } else if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
      updateData.completed_at = new Date().toISOString()
    } else if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from('courier_assignments')
      .update(updateData)
      .eq('id', assignmentId)

    if (error) {
      console.error('[updateAssignmentStatus] Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[updateAssignmentStatus] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function reorderCourierAssignments(
  courierId: string,
  orderedAssignmentIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    for (let i = 0; i < orderedAssignmentIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('courier_assignments')
        .update({ sequence_no: i + 1 })
        .eq('id', orderedAssignmentIds[i])
        .eq('courier_id', courierId)

      if (error) {
        console.error('[reorderCourierAssignments] Update error:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[reorderCourierAssignments] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function getNextSequenceNumber(courierId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('courier_assignments')
      .select('sequence_no')
      .eq('courier_id', courierId)
      .not('status', 'in', `(${COMPLETED_ORDER_STATUSES.map(s => `'${s}'`).join(',')})`)
      .order('sequence_no', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[getNextSequenceNumber] Error:', error)
      return 1
    }

    return (data?.sequence_no || 0) + 1
  } catch (err: any) {
    console.error('[getNextSequenceNumber] Unexpected error:', err)
    return 1
  }
}
