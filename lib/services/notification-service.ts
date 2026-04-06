import { createClient } from '@supabase/supabase-js'

export type NotificationType = 
  | 'order_assigned'
  | 'order_accepted'
  | 'order_on_the_way'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_status_changed'
  | 'new_order_available'

export type UserType = 'courier' | 'customer' | 'admin' | 'kitchen'

export interface CreateNotificationParams {
  userType: UserType
  userRef: string
  orderId?: string
  title: string
  body: string
  type: NotificationType
  metadata?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function createNotification(params: CreateNotificationParams): Promise<NotificationResult> {
  const { userType, userRef, orderId, title, body, type, metadata } = params

  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_type: userType,
        user_ref: userRef,
        order_id: orderId || null,
        title,
        body,
        type,
        metadata: metadata || null,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[createNotification] Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, notificationId: data.id }
  } catch (err: any) {
    console.error('[createNotification] Unexpected error:', err)
    return { success: false, error: err.message }
  }
}

export async function createOrderAssignedNotification(
  courierId: string,
  orderId: string,
  customerName: string,
  deliveryAddress?: string | null
): Promise<NotificationResult> {
  const address = deliveryAddress || 'Manzil ko\'rsatilmagan'
  return createNotification({
    userType: 'courier',
    userRef: courierId,
    orderId,
    title: 'Yangi buyurtma tayyor! 🚀',
    body: `${customerName} - ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`,
    type: 'order_assigned',
    metadata: { customerName, deliveryAddress: address },
  })
}

export async function createOrderAcceptedNotification(
  courierId: string,
  orderId: string,
  customerName: string
): Promise<NotificationResult> {
  return createNotification({
    userType: 'courier',
    userRef: courierId,
    orderId,
    title: 'Buyurtma qabul qilindi',
    body: `${customerName} buyurtmasini olib ketdingiz`,
    type: 'order_accepted',
    metadata: { customerName },
  })
}

export async function createOrderOnTheWayNotification(
  courierId: string,
  orderId: string,
  customerName: string
): Promise<NotificationResult> {
  return createNotification({
    userType: 'courier',
    userRef: courierId,
    orderId,
    title: "Yo'lda",
    body: `${customerName} buyurtmasini yetkazmoqdasiz`,
    type: 'order_on_the_way',
    metadata: { customerName },
  })
}

export async function createOrderDeliveredNotification(
  courierId: string,
  orderId: string,
  customerName: string,
  earnings?: number
): Promise<NotificationResult> {
  return createNotification({
    userType: 'courier',
    userRef: courierId,
    orderId,
    title: 'Buyurtma yetkazildi! ✅',
    body: earnings 
      ? `${customerName} - +${earnings.toLocaleString()} so'm`
      : `${customerName} buyurtmasi yetkazildi`,
    type: 'order_delivered',
    metadata: { customerName, earnings },
  })
}

export async function createOrderStatusChangedNotification(
  customerPhone: string,
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<NotificationResult> {
  const statusLabels: Record<string, string> = {
    yangi: 'Yangi',
    qabul_qilindi: 'Qabul qilindi',
    tayyorlanmoqda: 'Tayyorlanmoqda',
    tayyor: 'Tayyor',
    olib_ketildi: 'Olib ketildi',
    "yo'lda": "Yo'lda",
    on_the_way: "Yo'lda",
    yetkazildi: 'Yetkazildi',
    delivered: 'Yetkazildi',
    ready: 'Tayyor',
    preparing: 'Tayyorlanmoqda',
  }

  const oldLabel = statusLabels[oldStatus] || oldStatus
  const newLabel = statusLabels[newStatus] || newStatus

  return createNotification({
    userType: 'customer',
    userRef: customerPhone,
    orderId,
    title: `Buyurtma holati: ${newLabel}`,
    body: `Oldingi holat: ${oldLabel}`,
    type: 'order_status_changed',
    metadata: { oldStatus, newStatus },
  })
}

export async function createNewOrderAvailableNotification(
  courierId: string,
  orderId: string,
  area?: string
): Promise<NotificationResult> {
  return createNotification({
    userType: 'courier',
    userRef: courierId,
    orderId,
    title: 'Yangi buyurtma mavjud!',
    body: area ? `Yetkazish hududi: ${area}` : 'Yangi yetkazish buyurtmasi',
    type: 'new_order_available',
    metadata: { area },
  })
}

export async function getUnreadNotifications(
  userType: UserType,
  userRef: string,
  limit: number = 50
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_type', userType)
      .eq('user_ref', userRef)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getUnreadNotifications] Error:', error)
      return []
    }

    return data || []
  } catch (err: any) {
    console.error('[getUnreadNotifications] Unexpected error:', err)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('[markNotificationAsRead] Error:', error)
      return false
    }

    return true
  } catch (err: any) {
    console.error('[markNotificationAsRead] Unexpected error:', err)
    return false
  }
}

export async function markAllNotificationsAsRead(
  userType: UserType,
  userRef: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_type', userType)
      .eq('user_ref', userRef)
      .eq('is_read', false)

    if (error) {
      console.error('[markAllNotificationsAsRead] Error:', error)
      return false
    }

    return true
  } catch (err: any) {
    console.error('[markAllNotificationsAsRead] Unexpected error:', err)
    return false
  }
}

export async function getUnreadNotificationCount(
  userType: UserType,
  userRef: string
): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_type', userType)
      .eq('user_ref', userRef)
      .eq('is_read', false)

    if (error) {
      console.error('[getUnreadNotificationCount] Error:', error)
      return 0
    }

    return count || 0
  } catch (err: any) {
    console.error('[getUnreadNotificationCount] Unexpected error:', err)
    return 0
  }
}
