'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEFAULT_DELIVERY_FEE = 15000
const EARNINGS_PER_DELIVERY = 15000

export interface DeliveryEarningsParams {
  orderId: string
  courierId: string
  totalAmount?: number
  deliveryFee?: number
  distanceKm?: number
}

export interface EarningsResult {
  success: boolean
  earningsAmount?: number
  assignmentId?: string
  error?: string
}

export async function calculateEarnings(params: DeliveryEarningsParams): Promise<number> {
  const { deliveryFee, distanceKm } = params

  const fee = deliveryFee || DEFAULT_DELIVERY_FEE

  return fee
}

export async function finalizeDeliveryEarnings(params: DeliveryEarningsParams): Promise<EarningsResult> {
  const { orderId, courierId, totalAmount, deliveryFee, distanceKm } = params

  try {
    const { data: existingAssignment, error: findError } = await supabaseAdmin
      .from('courier_assignments')
      .select('id, status, earnings_amount, delivered_at')
      .eq('order_id', orderId)
      .eq('courier_id', courierId)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('[finalizeDeliveryEarnings] Find error:', findError)
      return { success: false, error: findError.message }
    }

    if (existingAssignment?.delivered_at && existingAssignment?.earnings_amount !== null) {
      console.log('[finalizeDeliveryEarnings] Already finalized, skipping. Assignment:', existingAssignment.id)
      return { success: true, assignmentId: existingAssignment.id, earningsAmount: existingAssignment.earnings_amount }
    }

    const earningsAmount = await calculateEarnings({ orderId, courierId, totalAmount, deliveryFee, distanceKm })

    let assignmentId = existingAssignment?.id

    if (existingAssignment) {
      const { error: updateError } = await supabaseAdmin
        .from('courier_assignments')
        .update({ earnings_amount: earningsAmount })
        .eq('id', existingAssignment.id)

      if (updateError) {
        console.error('[finalizeDeliveryEarnings] Assignment update error:', updateError)
        return { success: false, error: updateError.message }
      }
    } else {
      const { data: newAssignment, error: insertError } = await supabaseAdmin
        .from('courier_assignments')
        .insert({
          order_id: orderId,
          courier_id: courierId,
          status: 'delivered',
          assigned_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          earnings_amount: earningsAmount,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[finalizeDeliveryEarnings] Assignment insert error:', insertError)
        return { success: false, error: insertError.message }
      }

      assignmentId = newAssignment.id
    }

    await updateCourierDailyStats(courierId, 'delivered', earningsAmount)

    return { success: true, assignmentId, earningsAmount }
  } catch (err: any) {
    console.error('[finalizeDeliveryEarnings] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function updateCourierDailyStats(
  courierId: string,
  statType: 'delivered' | 'cancelled',
  amount: number = 0
): Promise<{ success: boolean; error?: string }> {
  const today = new Date().toISOString().split('T')[0]

  try {
    const { data: existingStats, error: findError } = await supabaseAdmin
      .from('courier_daily_stats')
      .select('id, delivered_count, cancelled_count, total_earnings')
      .eq('courier_id', courierId)
      .eq('stat_date', today)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('[updateCourierDailyStats] Find error:', findError)
      return { success: false, error: findError.message }
    }

    if (existingStats) {
      const updateData: Record<string, any> = {}
      
      if (statType === 'delivered') {
        updateData.delivered_count = (existingStats.delivered_count || 0) + 1
        updateData.total_earnings = (existingStats.total_earnings || 0) + amount
      } else if (statType === 'cancelled') {
        updateData.cancelled_count = (existingStats.cancelled_count || 0) + 1
      }

      const { error: updateError } = await supabaseAdmin
        .from('courier_daily_stats')
        .update(updateData)
        .eq('id', existingStats.id)

      if (updateError) {
        console.error('[updateCourierDailyStats] Update error:', updateError)
        return { success: false, error: updateError.message }
      }
    } else {
      const insertData: Record<string, any> = {
        courier_id: courierId,
        stat_date: today,
        delivered_count: statType === 'delivered' ? 1 : 0,
        cancelled_count: statType === 'cancelled' ? 1 : 0,
        total_earnings: statType === 'delivered' ? amount : 0,
      }

      const { error: insertError } = await supabaseAdmin
        .from('courier_daily_stats')
        .insert(insertData)

      if (insertError) {
        console.error('[updateCourierDailyStats] Insert error:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[updateCourierDailyStats] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function getCourierDailyStats(courierId: string, date?: string): Promise<any> {
  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    const { data, error } = await supabaseAdmin
      .from('courier_daily_stats')
      .select('*')
      .eq('courier_id', courierId)
      .eq('stat_date', targetDate)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[getCourierDailyStats] Error:', error)
      return null
    }

    return data || {
      courier_id: courierId,
      stat_date: targetDate,
      delivered_count: 0,
      cancelled_count: 0,
      total_earnings: 0,
    }
  } catch (err: any) {
    console.error('[getCourierDailyStats] Unexpected error:', err)
    return null
  }
}

export async function getCourierTotalEarnings(
  courierId: string,
  startDate?: string,
  endDate?: string
): Promise<{ totalDelivered: number; totalEarnings: number; totalCancelled: number }> {
  try {
    let query = supabaseAdmin
      .from('courier_daily_stats')
      .select('delivered_count, cancelled_count, total_earnings')
      .eq('courier_id', courierId)

    if (startDate) {
      query = query.gte('stat_date', startDate)
    }
    if (endDate) {
      query = query.lte('stat_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('[getCourierTotalEarnings] Error:', error)
      return { totalDelivered: 0, totalEarnings: 0, totalCancelled: 0 }
    }

    const totals = (data || []).reduce(
      (acc, stat) => ({
        totalDelivered: acc.totalDelivered + (stat.delivered_count || 0),
        totalEarnings: acc.totalEarnings + (stat.total_earnings || 0),
        totalCancelled: acc.totalCancelled + (stat.cancelled_count || 0),
      }),
      { totalDelivered: 0, totalEarnings: 0, totalCancelled: 0 }
    )

    return totals
  } catch (err: any) {
    console.error('[getCourierTotalEarnings] Unexpected error:', err)
    return { totalDelivered: 0, totalEarnings: 0, totalCancelled: 0 }
  }
}

export async function handleOrderCancellationEarnings(courierId: string): Promise<void> {
  if (!courierId) return
  
  await updateCourierDailyStats(courierId, 'cancelled', 0)
}
