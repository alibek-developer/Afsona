import { NextResponse } from 'next/server'
import { handleOrderDelivered, handleOrderAccepted, handleOrderCancelled } from '@/lib/services/order-lifecycle-actions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, orderId, courierId, changedBy, reason } = body

    if (!orderId || !changedBy) {
      return NextResponse.json(
        { success: false, error: 'orderId and changedBy required' },
        { status: 400 }
      )
    }

    if (action === 'delivered') {
      const result = await handleOrderDelivered({ orderId, courierId, changedBy })
      return NextResponse.json(result)
    }

    if (action === 'accepted') {
      const result = await handleOrderAccepted({ orderId, courierId, changedBy })
      return NextResponse.json(result)
    }

    if (action === 'cancelled') {
      const result = await handleOrderCancelled({ orderId, courierId, changedBy, reason })
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
