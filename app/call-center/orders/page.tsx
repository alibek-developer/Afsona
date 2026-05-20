'use client'

import { supabase } from '@/lib/supabaseClient'
import {
  Bike,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  Search,
  TableProperties,
  User,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const fmt = (n: number) => n.toLocaleString('ru-RU')

const statusConfig: Record<string, { label: string; cls: string; dot: string; icon: any }> = {
  yangi: {
    label: 'Yangi',
    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    icon: Package,
  },
  tayyorlanmoqda: {
    label: 'Oshxonada',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    icon: Clock,
  },
  tayyor: {
    label: 'Tayyor',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    icon: CheckCircle,
  },
  on_the_way: {
    label: "Yo'lda",
    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
    icon: Bike,
  },
  yetkazilmoqda: {
    label: "Yo'lda",
    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
    icon: Bike,
  },
  delivered: {
    label: 'Bajarildi',
    cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    dot: 'bg-zinc-400',
    icon: Check,
  },
  yakunlandi: {
    label: 'Bajarildi',
    cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    dot: 'bg-zinc-400',
    icon: Check,
  },
  completed: {
    label: 'Bajarildi',
    cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    dot: 'bg-zinc-400',
    icon: Check,
  },
}

const statusOrder = ['yangi', 'tayyorlanmoqda', 'tayyor', 'on_the_way', 'delivered']
const statusLabels: Record<string, string> = {
  yangi: 'Qabul qilindi',
  tayyorlanmoqda: 'Oshxonada',
  tayyor: 'Tayyor',
  on_the_way: "Yo'lda",
  delivered: 'Yetkazildi',
}
const statusDescs: Record<string, string> = {
  yangi: 'Operator tasdiqladi',
  tayyorlanmoqda: 'Tayyorlanmoqda',
  tayyor: 'Kuryer kutilmoqda',
  on_the_way: 'Kuryer mijoz tomon',
  delivered: 'Mijozga topshirildi',
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  phone: string
  type: string
  table_number?: string
  delivery_address?: string
  landmark?: string
  items: OrderItem[]
  status: string
  total_amount: number
  created_at: string
  updated_at?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('call-center-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('[call-center] Orders fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const idx = statusOrder.indexOf(currentStatus)
    if (idx < 0 || idx >= statusOrder.length - 1) return
    const nextStatus = statusOrder[idx + 1]
    setIsUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId)
      if (error) throw error
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: nextStatus } : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => (prev ? { ...prev, status: nextStatus } : null))
      }
    } catch (err: any) {
      console.error('[call-center] Status update error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType = typeFilter === 'all' || order.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const activeOrders = orders.filter(o => !['yakunlandi', 'delivered', 'completed'].includes(o.status)).length
  const completedOrders = orders.filter(o => ['yakunlandi', 'delivered', 'completed'].includes(o.status)).length

  const getTypeIcon = (type: string) => {
    if (type === 'delivery') return Bike
    if (type === 'dine-in') return TableProperties
    return Building2
  }

  const getTypeLabel = (type: string) => {
    if (type === 'delivery') return 'Yetkazish'
    if (type === 'dine-in') return 'Zal'
    return type
  }

  const getTypeColor = (type: string) => {
    if (type === 'delivery') return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
    if (type === 'dine-in') return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    return 'bg-red-500/15 text-red-400 border-red-500/30'
  }

  const formatOrderId = (id: string) => {
    const num = parseInt(id.replace(/-/g, '').slice(0, 8), 16) || parseInt(id.slice(0, 8), 16) || 0
    return `#${String(num).padStart(8, '0').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* LEFT: ORDERS LIST */}
      <div className="flex-1 overflow-y-auto">
        {/* Header filters */}
        <div className="p-4 border-b border-white/7 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buyurtma, ism, telefon..."
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-zinc-200 placeholder:text-zinc-600 focus:border-red-500/40 focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'Barchasi', count: totalOrders },
                { id: 'yangi', label: 'Yangi', count: orders.filter(o => o.status === 'yangi').length },
                { id: 'tayyorlanmoqda', label: 'Oshxonada', count: orders.filter(o => o.status === 'tayyorlanmoqda').length },
                { id: 'on_the_way', label: "Yo'lda", count: orders.filter(o => ['on_the_way', 'yetkazilmoqda'].includes(o.status)).length },
                { id: 'tayyor', label: 'Tayyor', count: orders.filter(o => o.status === 'tayyor').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-2 rounded-xl text-[13px] font-medium transition flex items-center gap-1.5 ${
                    statusFilter === f.id
                      ? 'bg-red-500 text-white font-bold'
                      : 'bg-[#111] border border-white/8 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      statusFilter === f.id ? 'bg-black/20' : 'bg-white/10'
                    }`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Barchasi', icon: Package },
              { id: 'dine-in', label: 'Zal', icon: TableProperties },
              { id: 'delivery', label: 'Yetkazish', icon: Bike },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition flex items-center gap-1.5 ${
                  typeFilter === f.id
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-[#111] border border-white/8 text-zinc-500 hover:text-white'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-b border-white/7">
          {[
            { label: 'JAMI BUYURTMA', value: totalOrders, color: 'text-red-500' },
            { label: 'DAROMAD', value: `₩${(totalRevenue / 1000000).toFixed(1)}M`, color: 'text-emerald-400' },
            { label: 'FAOL', value: activeOrders, color: 'text-red-400' },
            { label: 'BAJARILDI', value: completedOrders, color: 'text-zinc-400' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 text-center ${i < 3 ? 'border-r border-white/7' : ''}`}>
              <div className={`text-[22px] font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {filteredOrders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.yangi
              const isCompleted = ['yakunlandi', 'delivered', 'completed'].includes(order.status)
              const isSelected = selectedOrder?.id === order.id
              const TypeIcon = getTypeIcon(order.type)

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-500/5 border-l-2 border-l-red-500'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      order.type === 'delivery'
                        ? 'bg-purple-500/10 text-purple-400'
                        : order.type === 'dine-in'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-bold text-red-500 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${getTypeColor(order.type)}`}>
                          {getTypeLabel(order.type)}
                        </span>
                      </div>
                      <div className="text-[15px] font-semibold text-zinc-100">
                        {order.customer_name || "Noma'lum"}
                      </div>
                      <div className="text-[13px] text-zinc-500 mt-0.5">
                        {order.phone || '—'}
                      </div>
                      <div className="text-[12px] text-zinc-600 mt-1">
                        {order.items?.slice(0, 2).map((i: OrderItem) => `${i.name} ×${i.quantity}`).join(' · ')}
                        {order.items?.length > 2 && ` +${order.items.length - 2}`}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[15px] font-bold text-red-500 font-mono">
                        {fmt(order.total_amount || 0)} so&apos;m
                      </span>
                      <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.created_at
                          ? new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-[18px] font-semibold text-zinc-400 mb-2">Buyurtmalar topilmadi</h3>
              <p className="text-[13px] text-zinc-600">Qidiruv parametrlarini o'zgartiring</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: ORDER DETAIL */}
      {selectedOrder ? (
        <div className="w-[420px] bg-[#0a0a0a] border-l border-white/7 flex flex-col overflow-hidden shrink-0">
          {/* Header */}
          <div className="p-6 border-b border-white/7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[18px] font-bold text-red-500 font-mono">
                #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </span>
              <span className={`text-[12px] px-3 py-1 rounded-full font-medium border ${getTypeColor(selectedOrder.type)}`}>
                {getTypeLabel(selectedOrder.type)}
              </span>
            </div>
            <div className="text-[15px] font-semibold text-zinc-200">
              {selectedOrder.customer_name || "Noma'lum"}
            </div>
            <div className="text-[13px] text-zinc-500 mt-0.5">
              {selectedOrder.phone || '—'}
            </div>
          </div>

          {/* Status timeline */}
          <div className="p-6 flex-1 overflow-y-auto">
            <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block mb-4">
              Buyurtma holati
            </label>
            <div className="space-y-0">
              {statusOrder.map((status, idx) => {
                const cfg = statusConfig[status]
                const currentIdx = statusOrder.indexOf(selectedOrder.status)
                const isPast = idx < currentIdx
                const isCurrent = idx === currentIdx
                const isFuture = idx > currentIdx
                const StatusIcon = cfg.icon

                return (
                  <div key={status} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isPast
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : isCurrent
                            ? 'bg-red-500/15 border-red-500 text-red-400'
                            : 'bg-[#111] border-white/10 text-zinc-600'
                      }`}>
                        {isPast ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StatusIcon className="w-5 h-5" />
                        )}
                      </div>
                      {idx < statusOrder.length - 1 && (
                        <div className={`w-0.5 h-8 ${isPast ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-6">
                      <div className={`text-[14px] font-semibold ${
                        isCurrent ? 'text-red-400' : isPast ? 'text-zinc-200' : 'text-zinc-600'
                      }`}>
                        {statusLabels[status]}
                      </div>
                      <div className="text-[12px] text-zinc-500 mt-0.5">
                        {statusDescs[status]}
                      </div>
                      {isCurrent && (
                        <div className="mt-2">
                          <button
                            onClick={() => advanceStatus(selectedOrder.id, selectedOrder.status)}
                            disabled={isUpdating}
                            className="text-[12px] px-4 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition font-medium disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                            ) : null}
                            Keyingi bosqich
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order items */}
            <div className="mt-4 pt-4 border-t border-white/7">
              <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
                Mahsulotlar
              </label>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-[#111] border border-white/5 rounded-xl p-3"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-zinc-200">{item.name}</div>
                      <div className="text-[12px] text-zinc-500">×{item.quantity}</div>
                    </div>
                    <span className="text-[13px] font-mono text-red-500">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/7 flex justify-between">
                <span className="text-[14px] font-bold text-zinc-200">Jami:</span>
                <span className="text-[16px] font-bold text-red-500 font-mono">
                  {fmt(selectedOrder.total_amount || 0)} so&apos;m
                </span>
              </div>
            </div>

            {/* Address info */}
            {selectedOrder.type === 'delivery' && selectedOrder.delivery_address && (
              <div className="mt-4 pt-4 border-t border-white/7">
                <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block mb-2">
                  Manzil
                </label>
                <div className="flex items-start gap-2 text-[13px] text-zinc-300">
                  <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <div>{selectedOrder.delivery_address}</div>
                    {selectedOrder.landmark && (
                      <div className="text-[12px] text-zinc-500 mt-1">Mo'ljal: {selectedOrder.landmark}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {selectedOrder.type === 'dine-in' && selectedOrder.table_number && (
              <div className="mt-4 pt-4 border-t border-white/7">
                <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block mb-2">
                  Stol
                </label>
                <div className="flex items-center gap-2 text-[13px] text-zinc-300">
                  <TableProperties className="w-4 h-4 text-zinc-500" />
                  Stol {selectedOrder.table_number}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[420px] bg-[#0a0a0a] border-l border-white/7 flex items-center justify-center shrink-0">
          <div className="text-center">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <div className="text-[14px] text-zinc-500">Buyurtmani tanlang</div>
          </div>
        </div>
      )}
    </div>
  )
}
