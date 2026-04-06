export const ACTIVE_ORDER_STATUSES = ['yangi', 'qabul_qilindi', 'tayyorlanmoqda', 'tayyor', 'olib_ketildi', "yo'lda", 'on_the_way', 'preparing', 'accepted', 'ready']
export const COMPLETED_ORDER_STATUSES = ['yetkazildi', 'delivered', 'completed']
export const CANCELLED_ORDER_STATUSES = ['bekor qilindi', 'cancelled']

export interface CourierActiveOrder {
  assignment_id: string
  order_id: string
  courier_id: string
  status: string
  sequence_no: number | null
  priority: number
  assigned_at: string
  customer_name: string
  phone: string
  delivery_address: string | null
  latitude: number | null
  longitude: number | null
  total_amount: number
  delivery_fee: number | null
  estimated_delivery_at: string | null
}

export interface AssignCourierParams {
  orderId: string
  courierId: string
  priority?: number
  sequenceNo?: number | null
}

export interface CourierAssignmentResult {
  success: boolean
  assignmentId?: string
  error?: string
}
