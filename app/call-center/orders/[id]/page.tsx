'use client'

import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

// Type-safe OrderStatus
const ORDER_STATUSES = [
  'yangi',
  'qabul_qilindi',
  'tayyorlanmoqda',
  'tayyor',
  'olib_ketildi',
  "yo'lda",
  'yetkazildi',
] as const

type OrderStatus = (typeof ORDER_STATUSES)[number]

interface Order {
  id: string
  order_number: string
  created_at: string
  customer_name: string
  phone: string
  address: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: OrderStatus
  courier_id?: string
  courier_name?: string
  courier_phone?: string
  courier_avatar?: string
  courier_lat?: number
  courier_lng?: number
  notes?: string
}

// Status configuration with colors and labels
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  yangi: { label: 'Yangi', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  qabul_qilindi: { label: 'Qabul qilindi', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  tayyorlanmoqda: { label: 'Tayyorlanmoqda', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  tayyor: { label: 'Tayyor', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  olib_ketildi: { label: 'Olib ketildi', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  "yo'lda": { label: "Yo'lda", color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  yetkazildi: { label: 'Yetkazildi', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
}

// Safe status config getter
function getStatusConfig(status: string | undefined): typeof STATUS_CONFIG[OrderStatus] {
  const validStatus = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : 'yangi'
  return STATUS_CONFIG[validStatus]
}

// Kitchen steps
const KITCHEN_STEPS = [
  { id: 'qabul_qilindi', label: 'Buyurtma qabul qilindi', description: 'Operator tomonidan tasdiqlandi' },
  { id: 'tayyorlanmoqda', label: 'Tayyorlanmoqda', description: 'Oshxonada tayyorlanmoqda' },
  { id: 'tayyor', label: 'Tayyor', description: 'Kuryer olishini kutmoqda' },
] as const

// Delivery steps
const DELIVERY_STEPS = [
  { id: 'yo\'lda', label: 'Yo\'lda', description: 'Kuryer yetkazish uchun yo\'lda' },
  { id: 'yetkazildi', label: 'Yetkazildi', description: 'Buyurtma mijozga yetkazildi' },
] as const

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousStatusRef = useRef<OrderStatus | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
  }, [])

  // Play notification sound
  const playNotification = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  // Fetch order
  const fetchOrder = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()

      if (error) throw error

      if (data) {
        const newOrder: Order = {
          id: data.id,
          order_number: data.order_number || data.id.slice(-6),
          created_at: data.created_at,
          customer_name: data.customer_name || 'Noma\'lum',
          phone: data.phone || '-',
          address: data.address || data.delivery_address || 'Manzil ko\'rsatilmagan',
          items: data.items || [],
          total: data.total || data.total_amount || 0,
          status: data.status || 'yangi',
          courier_id: data.courier_id,
          courier_name: data.courier_name,
          courier_phone: data.courier_phone,
          courier_avatar: data.courier_avatar,
          courier_lat: data.courier_lat,
          courier_lng: data.courier_lng,
          notes: data.notes,
        }

        // Check for status change
        if (previousStatusRef.current && previousStatusRef.current !== newOrder.status) {
          const newStatusConfig = getStatusConfig(newOrder.status)
          toast.success(`Status o'zgardi: ${newStatusConfig.label}`)
          playNotification()
        }

        previousStatusRef.current = newOrder.status
        setOrder(newOrder)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Buyurtma ma\'lumotlarini yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [orderId, playNotification])

  // Real-time subscription
  useEffect(() => {
    if (orderId) {
      fetchOrder()

      const channel = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
          fetchOrder()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [orderId, fetchOrder])

  // Update status with optimistic UI
  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order || updating) return

    const previousStatus = order.status
    setUpdating(newStatus)

    // Optimistic update
    setOrder({ ...order, status: newStatus })

    try {
      const updateData: any = { status: newStatus }

      // If accepting as courier, add courier info
      if (newStatus === 'olib_ketildi' && !order.courier_id) {
        updateData.courier_id = 'courier_' + Math.random().toString(36).substr(2, 9)
        updateData.courier_name = 'Aziz Karimov'
        updateData.courier_phone = '+998 90 123 45 67'
      }

      const { error } = await supabase.from('orders').update(updateData).eq('id', order.id)

      if (error) throw error

      const successStatusConfig = getStatusConfig(newStatus)
      toast.success(`Status yangilandi: ${successStatusConfig.label}`)
    } catch (error) {
      console.error('Error updating status:', error)
      // Rollback on error
      setOrder({ ...order, status: previousStatus })
      toast.error('Statusni yangilashda xatolik')
    } finally {
      setUpdating(null)
    }
  }

  // Get current step index
  const getKitchenStepIndex = () => {
    if (!order) return -1
    return KITCHEN_STEPS.findIndex((step) => step.id === order.status)
  }

  const getDeliveryStepIndex = () => {
    if (!order) return -1
    return DELIVERY_STEPS.findIndex((step) => step.id === order.status)
  }

  const isCompleted = order?.status === 'yetkazildi'
  const kitchenStepIndex = getKitchenStepIndex()
  const deliveryStepIndex = getDeliveryStepIndex()
  // Safe status config - never crashes
  const statusConfig = getStatusConfig(order?.status)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Buyurtma topilmadi</p>
          <Link href="/call-center/orders" className="text-[#FF0000] hover:underline mt-2 inline-block">
            Orqaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF0000] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">Afsona</span>
            <span className="text-[#FF0000] font-semibold">Pro</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full ml-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">LIVE</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buyurtma qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF0000]/20 outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'p-2 rounded-xl transition-colors',
                soundEnabled ? 'text-[#FF0000] bg-red-50' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <div className="absolute top-1 right-1 w-4 h-4 bg-[#FF0000] rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                3
              </div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Operator</p>
                <p className="text-xs text-gray-500">Call-Center</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                O
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm text-blue-600 font-medium mb-1">Logistika boshqaruvi</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buyurtma #{order.order_number}</h1>
            <div className="flex items-center gap-3">
              <Badge className={cn('border-0 font-medium', statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              {isCompleted && (
                <Badge className="bg-emerald-100 text-emerald-600 border-0">Yakunlandi</Badge>
              )}
            </div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kitchen Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-orange-500 rounded-full" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Oshxona</h2>
              <button className="ml-auto p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-none">
              {/* Order Info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Buyurtma #{order.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge className={cn('border-0 font-medium', statusConfig.bg, statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {order.items?.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} so'm</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Mahsulotlar ro'yxati bo'sh</p>
                )}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Jami</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{order.total.toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>

              {/* Kitchen Steps */}
              <div className="space-y-3 mb-6">
                {order.status === 'yangi' ? (
                  // Show accept button for new orders
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateStatus('qabul_qilindi')}
                    disabled={updating === 'qabul_qilindi'}
                    className="w-full py-3.5 bg-[#FF0000] text-white rounded-xl font-medium hover:bg-[#cc0000] transition-colors shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    {updating === 'qabul_qilindi' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Buyurtmani qabul qilish
                      </>
                    )}
                  </motion.button>
                ) : (
                  // Show steps for accepted orders
                  KITCHEN_STEPS.map((step, index) => {
                    const isCompleted = index <= kitchenStepIndex
                    const isCurrent = index === kitchenStepIndex
                    const isClickable = index === kitchenStepIndex + 1 && !isCompleted

                    return (
                      <motion.button
                        key={step.id}
                        onClick={() => isClickable && updateStatus(step.id)}
                        disabled={!isClickable || !!updating}
                        whileHover={isClickable ? { scale: 1.02 } : {}}
                        whileTap={isClickable ? { scale: 0.98 } : {}}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                          isCompleted ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-gray-50 dark:bg-gray-800/50',
                          isClickable && 'hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer',
                          !isClickable && 'cursor-default'
                        )}
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                            isCompleted
                              ? 'bg-orange-500 text-white'
                              : isCurrent
                                ? 'border-2 border-orange-500'
                                : 'border-2 border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isCompleted ? (
                            <Check size={14} />
                          ) : (
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                isCurrent ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                              )}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <span
                            className={cn(
                              'text-sm font-medium block',
                              isCompleted
                                ? 'text-gray-900 dark:text-white'
                                : isCurrent
                                  ? 'text-orange-600'
                                  : 'text-gray-400'
                            )}
                          >
                            {step.label}
                          </span>
                          <span className="text-xs text-gray-400">{step.description}</span>
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>

              {/* Mark as Ready Button */}
              {order.status === 'tayyorlanmoqda' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateStatus('tayyor')}
                  disabled={updating === 'tayyor'}
                  className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  {updating === 'tayyor' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Tayyor
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Courier Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Kuryer</h2>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-none">
              {/* Show accept button only when order is ready */}
              {order.status === 'tayyor' && !order.courier_id ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Kuryer biriktirilmagan</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateStatus('olib_ketildi')}
                    disabled={updating === 'olib_ketildi'}
                    className="w-full py-3.5 bg-[#FF0000] text-white rounded-xl font-medium hover:bg-[#cc0000] transition-colors shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    {updating === 'olib_ketildi' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Buyurtmani olish
                      </>
                    )}
                  </motion.button>
                </div>
              ) : order.courier_id ? (
                <>
                  {/* Courier Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                      {order.courier_name?.charAt(0) || 'K'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{order.courier_name || 'Kuryer'}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">TOP KURYER</span>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Phone size={18} />
                    </button>
                  </div>

                  {/* On the way button */}
                  {order.status === 'olib_ketildi' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateStatus('yo\'lda')}
                      disabled={updating === 'yo\'lda'}
                      className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mb-4"
                    >
                      {updating === 'yo\'lda' ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ArrowRight size={18} />
                          Yo'ldaman
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Map Placeholder */}
                  <div className="relative h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-blue-600 font-medium">Xarita tez orada</p>
                      </div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                      <path
                        d="M50 150 Q150 50 250 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        className="text-blue-300"
                      />
                      <circle cx="50" cy="150" r="6" className="fill-blue-500" />
                      <circle cx="250" cy="100" r="6" className="fill-red-500" />
                    </svg>
                    {order.courier_lat && (
                      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jonli</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Buyurtma tayyor bo'lganda kuryer biriktiriladi</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Mijoz</h2>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-none">
              {/* Delivery Address */}
              <div className="mb-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Yetkazish manzili</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.address}</p>
                  </div>
                </div>
              </div>

              {/* ETA & Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Taxminiy vaqt</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">25 daq</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Holat</p>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full animate-pulse', statusConfig.color.replace('text-', 'bg-'))} />
                    <span className={cn('text-sm font-semibold', statusConfig.color)}>{statusConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4 mb-6">
                {DELIVERY_STEPS.map((step, index) => {
                  const isCompleted = index <= deliveryStepIndex
                  const isCurrent = index === deliveryStepIndex

                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                          isCompleted ? 'bg-emerald-500 text-white' : 'border-2 border-gray-200 dark:border-gray-700'
                        )}
                      >
                        {isCompleted ? <Check size={14} /> : <Circle size={14} className="text-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <span
                          className={cn(
                            'text-sm font-medium block',
                            isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-gray-400">{step.description}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Mark as Delivered Button */}
              {order.status === 'yo\'lda' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateStatus('yetkazildi')}
                  disabled={updating === 'yetkazildi'}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-xl flex items-center justify-center gap-2 mb-6"
                >
                  {updating === 'yetkazildi' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Yetkazildi
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              )}

              {isCompleted && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={20} />
                    <span className="font-semibold">Buyurtma yetkazildi</span>
                  </div>
                </div>
              )}

              {/* Support Chat */}
              {order.notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={16} className="text-blue-500" />
                    <span className="text-sm font-semibold text-blue-600">Mijoz izohi</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{order.notes}</p>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                    Javob yozish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
