'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEFAULT_DELIVERY_FEE = 15000

interface OrderDeliveryParams {
  orderId: string
  courierId: string
  changedBy: string
}

export async function handleOrderDelivered(params: OrderDeliveryParams): Promise<{ success: boolean; earnings?: number; error?: string }> {
  const { orderId, courierId, changedBy } = params

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, delivery_fee, courier_id, customer_name, phone')
      .eq('id', orderId)
      .single()

    if (orderError) {
      return { success: false, error: orderError.message }
    }

    if (order.status === 'delivered' || order.status === 'yetkazildi') {
      return { success: true, earnings: 0 }
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Record status history
    try {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: orderId,
        old_status: order.status,
        new_status: 'delivered',
        changed_by: changedBy,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('[history]', e)
    }

    // Update or create courier assignment
    const { data: existingAssignment, error: assignError } = await supabaseAdmin
      .from('courier_assignments')
      .select('id, delivered_at, earnings_amount')
      .eq('order_id', orderId)
      .eq('courier_id', courierId)
      .single()

    let earningsAmount = order.delivery_fee || DEFAULT_DELIVERY_FEE

    if (existingAssignment?.delivered_at) {
      return { success: true, earnings: existingAssignment.earnings_amount || 0 }
    }

    if (existingAssignment) {
      await supabaseAdmin
        .from('courier_assignments')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          earnings_amount: earningsAmount,
        })
        .eq('id', existingAssignment.id)
    } else {
      await supabaseAdmin.from('courier_assignments').insert({
        order_id: orderId,
        courier_id: courierId,
        status: 'delivered',
        assigned_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        earnings_amount: earningsAmount,
      })
    }

    // Update courier daily stats
    const today = new Date().toISOString().split('T')[0]
    const { data: existingStats, error: statsError } = await supabaseAdmin
      .from('courier_daily_stats')
      .select('id, delivered_count, total_earnings')
      .eq('courier_id', courierId)
      .eq('stat_date', today)
      .single()

    if (existingStats) {
      await supabaseAdmin
        .from('courier_daily_stats')
        .update({
          delivered_count: (existingStats.delivered_count || 0) + 1,
          total_earnings: (existingStats.total_earnings || 0) + earningsAmount,
        })
        .eq('id', existingStats.id)
    } else {
      await supabaseAdmin.from('courier_daily_stats').insert({
        courier_id: courierId,
        stat_date: today,
        delivered_count: 1,
        cancelled_count: 0,
        total_earnings: earningsAmount,
      })
    }

    // Create notification for courier
    try {
      await supabaseAdmin.from('notifications').insert({
        user_type: 'courier',
        user_ref: courierId,
        order_id: orderId,
        title: 'Buyurtma yetkazildi!',
        body: `${order.customer_name} - +${earningsAmount.toLocaleString()} so'm`,
        type: 'order_delivered',
        is_read: false,
      })
    } catch (e) {
      console.error('[notification]', e)
    }

    return { success: true, earnings: earningsAmount }
  } catch (err: any) {
    console.error('[handleOrderDelivered]', err)
    return { success: false, error: err.message }
  }
}

export async function handleOrderAccepted(params: {
  orderId: string
  courierId: string
  changedBy: string
}): Promise<{ success: boolean; error?: string }> {
  const { orderId, courierId, changedBy } = params

  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'on_the_way',
        courier_id: courierId,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    try {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: orderId,
        old_status: 'ready',
        new_status: 'on_the_way',
        changed_by: changedBy,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('[history]', e)
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function handleOrderCancelled(params: {
  orderId: string
  courierId?: string
  changedBy: string
  reason?: string
}): Promise<{ success: boolean; error?: string }> {
  const { orderId, courierId, changedBy, reason } = params

  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    try {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: orderId,
        old_status: order?.status,
        new_status: 'cancelled',
        changed_by: changedBy,
        note: reason,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('[history]', e)
    }

    if (courierId) {
      await supabaseAdmin
        .from('courier_assignments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('courier_id', courierId)

      const today = new Date().toISOString().split('T')[0]
      const { data: stats } = await supabaseAdmin
        .from('courier_daily_stats')
        .select('id, cancelled_count')
        .eq('courier_id', courierId)
        .eq('stat_date', today)
        .single()

      if (stats) {
        await supabaseAdmin
          .from('courier_daily_stats')
          .update({ cancelled_count: (stats.cancelled_count || 0) + 1 })
          .eq('id', stats.id)
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
