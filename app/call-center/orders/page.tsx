'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Clock, MapPin, Package, Phone, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered'

interface Order {
  id: string
  created_at: string
  customer_name: string
  phone: string
  address: string
  total_price: number
  status: OrderStatus
  items_count: number
  payment_method: string
  notes?: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'Yangi', color: 'text-[#FF0000]', bg: 'bg-red-50 dark:bg-red-950/20' },
  accepted: { label: 'Qabul qilindi', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  preparing: { label: 'Tayyorlanmoqda', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  ready: { label: 'Tayyor', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  picked_up: { label: 'Kuryer oldi', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  on_the_way: { label: 'Yo\'lda', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
  delivered: { label: 'Yetkazildi', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' },
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const status = STATUS_CONFIG[order.status]
  const isCompleted = order.status === 'delivered'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/call-center/orders/${order.id}`}>
        <Card
          className={cn(
            'p-5 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group',
            isCompleted && 'opacity-75'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-bold text-foreground">#{order.id.slice(-6)}</span>
              <Badge variant="outline" className={cn('border-0 font-medium', status.bg, status.color)}>
                {status.label}
              </Badge>
              {isCompleted && (
                <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">
                  Completed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={14} />
              {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <User size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{order.address}</span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-foreground">
                  {order.total_price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">so'm</span>
                </p>
                <p className="text-sm text-muted-foreground">{order.items_count} ta mahsulot</p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Package size={16} className="text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground capitalize">{order.payment_method}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Izoh:</span> {order.notes}
              </p>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    fetchOrders()

    // Real-time subscription
    const channel = supabase
      .channel('call-center-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: { new: any }) => {
        if (payload.new?.source === 'call-center') {
          fetchOrders();
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('source', 'call-center')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match our interface
      const transformedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        customer_name: order.customer_name || 'Noma\'lum',
        phone: order.phone || '-',
        address: order.delivery_address || order.address || 'Manzil ko\'rsatilmagan',
        total_price: order.total_amount || order.total_price || 0,
        status: normalizeStatus(order.status),
        items_count: order.items?.length || 0,
        payment_method: order.payment_method || 'Naqd',
        notes: order.notes,
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeStatus = (status: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      yangi: 'new',
      new: 'new',
      qabul_qilindi: 'accepted',
      accepted: 'accepted',
      tayyorlanmoqda: 'preparing',
      preparing: 'preparing',
      tayyor: 'ready',
      ready: 'ready',
      kuryer_oldi: 'picked_up',
      picked_up: 'picked_up',
      yolda: 'on_the_way',
      on_the_way: 'on_the_way',
      yetkazildi: 'delivered',
      delivered: 'delivered',
    }
    return statusMap[status] || 'new'
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeOrders = orders.filter((o) => o.status !== 'delivered').length
  const completedOrders = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Buyurtmalar</h1>
          <p className="text-muted-foreground mt-1">Barcha buyurtmalarni boshqarish</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#FF0000] animate-pulse" />
            <span className="text-sm font-medium">{activeOrders} faol</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">{completedOrders} yetkazildi</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#FF0000] transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === 'all'
                ? 'bg-[#FF0000] text-white'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            Barchasi
          </button>
          {(['new', 'preparing', 'ready', 'on_the_way', 'delivered'] as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === status
                  ? 'bg-[#FF0000] text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Buyurtmalar topilmadi</h3>
            <p className="text-muted-foreground">Qidiruv parametrlarini o'zgartiring</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => <OrderCard key={order.id} order={order} index={index} />)
        )}
      </div>
    </div>
  )
}
