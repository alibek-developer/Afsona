'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChefHat, Clock, Grid3X3, LayoutList, Loader2, Package, Phone, User, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  created_at: string
  customer_name: string
  phone: string
  mode: 'delivery' | 'dine-in' | 'restaurant'
  delivery_address?: string | null
  table_number?: string | null
  items: OrderItem[]
  total_amount: number
  status: 'new' | 'preparing' | 'ready'
}

type OrderStatus = 'new' | 'preparing' | 'ready'
type ViewMode = 'comfortable' | 'compact'

const COLUMN_CONFIG = {
  new: {
    title: 'Yangi',
    subtitle: 'Yangi buyurtmalar',
    color: '#FF0000',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/30',
    indicator: 'bg-[#FF0000]',
    pulse: true,
  },
  preparing: {
    title: 'Jarayonda',
    subtitle: 'Tayyorlanmoqda',
    color: '#f97316',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900/30',
    indicator: 'bg-orange-500',
    pulse: false,
  },
  ready: {
    title: 'Tayyor',
    subtitle: 'Yetkazishga tayyor',
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-900/30',
    indicator: 'bg-emerald-500',
    pulse: false,
  },
}

// Sound notification hook
function useOrderNotification() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousOrdersRef = useRef<string[]>([])

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
  }, [])

  const playNotification = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  const checkNewOrders = useCallback(
    (orders: Order[]) => {
      const currentOrderIds = orders.map((o) => o.id)
      const newOrders = currentOrderIds.filter((id) => !previousOrdersRef.current.includes(id))

      if (newOrders.length > 0 && previousOrdersRef.current.length > 0) {
        playNotification()
        toast.success(`Yangi buyurtma: #${newOrders[0].slice(-5)}`)
      }

      previousOrdersRef.current = currentOrderIds
    },
    [playNotification]
  )

  return { soundEnabled, setSoundEnabled, checkNewOrders }
}

// Order timer component
function OrderTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState('')
  const [isDelayed, setIsDelayed] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(createdAt).getTime()
      const now = Date.now()
      const diff = now - created
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      setIsDelayed(minutes > 15)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-medium',
        isDelayed
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <Clock size={12} />
      {elapsed}
      {isDelayed && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
    </div>
  )
}

// Premium Order Card
function OrderCard({
  order,
  onStatusChange,
  viewMode,
}: {
  order: Order
  onStatusChange: (id: string, newStatus: OrderStatus) => void
  viewMode: ViewMode
}) {
  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'new') return 'preparing'
    if (current === 'preparing') return 'ready'
    return null
  }

  const nextStatus = getNextStatus(order.status)
  const config = COLUMN_CONFIG[order.status]

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'delivery':
        return 'Yetkazib berish'
      case 'dine-in':
        return 'Restoranda'
      case 'restaurant':
        return 'Olib ketish'
      default:
        return mode
    }
  }

  if (viewMode === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2, boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12)' }}
        className="relative bg-card rounded-xl p-3 border border-border shadow-sm overflow-hidden group"
      >
        {/* Left indicator strip */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-1', config.indicator)} />

        <div className="flex items-center justify-between pl-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-foreground">#{order.id.slice(-4)}</span>
            <OrderTimer createdAt={order.created_at} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{order.total_amount.toLocaleString()} so'm</span>
        </div>

        <div className="flex items-center justify-between mt-2 pl-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={14} />
            <span className="truncate max-w-[120px]">{order.customer_name}</span>
          </div>
          {nextStatus && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95',
                nextStatus === 'preparing' ? 'bg-[#FF0000] hover:bg-[#cc0000]' : 'bg-emerald-500 hover:bg-emerald-600'
              )}
            >
              {nextStatus === 'preparing' ? 'Qabul' : 'Tayyor'}
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative bg-card rounded-2xl p-5 border border-border shadow-sm overflow-hidden group"
    >
      {/* Left color indicator strip */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', config.indicator)} />

      {/* Status pulse for new orders */}
      {config.pulse && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF0000]" />
          </span>
        </div>
      )}

      {/* Top Row: ID, Timer, Status */}
      <div className="flex items-start justify-between mb-4 pl-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-foreground">#{order.id.slice(-5)}</span>
          <OrderTimer createdAt={order.created_at} />
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-medium border-0',
            order.status === 'new' && 'bg-red-50 dark:bg-red-950/20 text-[#FF0000]',
            order.status === 'preparing' && 'bg-orange-50 dark:bg-orange-950/20 text-orange-600',
            order.status === 'ready' && 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
          )}
        >
          {order.status === 'new' ? 'Yangi' : order.status === 'preparing' ? 'Jarayonda' : 'Tayyor'}
        </Badge>
      </div>

      {/* Customer Info */}
      <div className="space-y-2 mb-4 pl-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Package size={14} />
          <span>
            {getModeLabel(order.mode)}
            {order.table_number && ` • Stol ${order.table_number}`}
            {order.delivery_address && ` • ${order.delivery_address.slice(0, 30)}...`}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="border-t border-border pt-3 mb-4 pl-2">
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{item.quantity}x</span> {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Total & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-border pl-2">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Jami</p>
          <p className="font-display text-xl font-bold text-foreground">
            {order.total_amount.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">so'm</span>
          </p>
        </div>

        {nextStatus && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all duration-200',
              nextStatus === 'preparing'
                ? 'bg-[#FF0000] shadow-red-500/25 hover:shadow-red-500/40 hover:bg-[#cc0000]'
                : 'bg-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:bg-emerald-600'
            )}
          >
            {nextStatus === 'preparing' ? 'Qabul qilish' : 'Tayyor'}
          </motion.button>
        )}

        {order.status === 'ready' && (
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium">Tayyor</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Kanban Column
function KanbanColumn({
  status,
  orders,
  onStatusChange,
  viewMode,
}: {
  status: OrderStatus
  orders: Order[]
  onStatusChange: (id: string, newStatus: OrderStatus) => void
  viewMode: ViewMode
}) {
  const config = COLUMN_CONFIG[status]
  const sortedOrders = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div
        className={cn(
          'rounded-2xl p-4 mb-4 border backdrop-blur-sm',
          config.bg,
          config.border
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-3 h-3 rounded-full', config.indicator, config.pulse && 'animate-pulse')} />
            <div>
              <h3 className={cn('font-display font-semibold text-sm', `text-[${config.color}]`)} style={{ color: config.color }}>
                {config.title}
              </h3>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-display text-lg font-bold">
            {orders.length}
          </Badge>
        </div>
      </div>

      {/* Orders List */}
      <div className={cn('flex-1 space-y-3 min-h-[200px]', viewMode === 'compact' && 'space-y-2')}>
        <AnimatePresence mode="popLayout">
          {sortedOrders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} viewMode={viewMode} />
          ))}
        </AnimatePresence>

        {sortedOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Package className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">Buyurtmalar yo'q</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}

// Main Kitchen Dashboard
export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const { soundEnabled, setSoundEnabled, checkNewOrders } = useOrderNotification()

  const fetchOrders = useCallback(async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA')
      const start = `${today}T00:00:00`
      const end = `${today}T23:59:59`

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .in('status', ['new', 'preparing', 'ready', 'yangi', 'tayyorlanmoqda'])
        .order('created_at', { ascending: true })

      if (error) throw error

      const validOrders = (data || []).map((order) => ({
        ...order,
        status: normalizeStatus(order.status),
      })) as Order[]

      checkNewOrders(validOrders)
      setOrders(validOrders)
    } catch (error: any) {
      console.error('Buyurtmalarni yuklashda xatolik:', error.message)
      toast.error('Buyurtmalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [checkNewOrders])

  const normalizeStatus = (status: string): OrderStatus => {
    if (status === 'new' || status === 'yangi') return 'new'
    if (status === 'preparing' || status === 'tayyorlanmoqda') return 'preparing'
    if (status === 'ready') return 'ready'
    return 'new'
  }

  const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    const dbStatus = newStatus === 'new' ? 'yangi' : newStatus === 'preparing' ? 'tayyorlanmoqda' : 'ready'

    try {
      const { error } = await supabase.from('orders').update({ status: dbStatus }).eq('id', id)
      if (error) throw error

      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
      toast.success('Status yangilandi')
    } catch (error: any) {
      console.error('Statusni yangilashda xatolik:', error.message)
      toast.error('Statusni yangilashda xatolik')
    }
  }

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('kitchen-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  const newOrders = orders.filter((o) => o.status === 'new')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  const readyOrders = orders.filter((o) => o.status === 'ready')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Oshxona</h1>
          <p className="text-muted-foreground mt-1">Real-time buyurtma boshqaruvi</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            <button
              onClick={() => setViewMode('comfortable')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'comfortable'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList size={16} />
              <span className="hidden sm:inline">Keng</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                viewMode === 'compact'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3X3 size={16} />
              <span className="hidden sm:inline">Zich</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'h-10 w-10 rounded-xl border-0 transition-all duration-200',
              soundEnabled
                ? 'bg-[#FF0000] text-white hover:bg-[#cc0000] shadow-lg shadow-red-500/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>

          {/* Total Orders */}
          <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm">
            <ChefHat size={18} className="text-[#FF0000]" />
            <span className="font-display text-lg font-bold">{orders.length}</span>
            <span className="text-xs text-muted-foreground">jami</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <KanbanColumn status="new" orders={newOrders} onStatusChange={updateOrderStatus} viewMode={viewMode} />
        <KanbanColumn status="preparing" orders={preparingOrders} onStatusChange={updateOrderStatus} viewMode={viewMode} />
        <KanbanColumn status="ready" orders={readyOrders} onStatusChange={updateOrderStatus} viewMode={viewMode} />
      </div>
    </div>
  )
}
