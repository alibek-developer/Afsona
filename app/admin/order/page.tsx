'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Search,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Subtle status colors - no heavy red backgrounds
const STATUS_MAP = {
  yangi: {
    label: 'Yangi',
    color: 'text-[#FF0000]',
    bg: 'bg-red-50 dark:bg-red-950/10',
    border: 'border-red-100 dark:border-red-900/20',
    dot: 'bg-[#FF0000]',
  },
  tayyorlanmoqda: {
    label: 'Jarayonda',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/10',
    border: 'border-orange-100 dark:border-orange-900/20',
    dot: 'bg-orange-500',
  },
  ready: {
    label: 'Tayyor',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/10',
    border: 'border-emerald-100 dark:border-emerald-900/20',
    dot: 'bg-emerald-500',
  },
  yakunlandi: {
    label: 'Tugadi',
    color: 'text-[#666666] dark:text-[#AAAAAA]',
    bg: 'bg-[#F7F7F7] dark:bg-[#1A1A1A]',
    border: 'border-[#E5E5E5] dark:border-[#2A2A2A]',
    dot: 'bg-[#666666]',
  },
}

const RESERVATION_STATUS_MAP = {
  pending: {
    label: 'Kutilmoqda',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/10',
    border: 'border-orange-100 dark:border-orange-900/20',
    dot: 'bg-orange-500',
  },
  confirmed: {
    label: 'Tasdiqlandi',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/10',
    border: 'border-emerald-100 dark:border-emerald-900/20',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Bekor',
    color: 'text-[#666666] dark:text-[#AAAAAA]',
    bg: 'bg-[#F7F7F7] dark:bg-[#1A1A1A]',
    border: 'border-[#E5E5E5] dark:border-[#2A2A2A]',
    dot: 'bg-[#666666]',
  },
  completed: {
    label: 'Tugadi',
    color: 'text-[#666666] dark:text-[#AAAAAA]',
    bg: 'bg-[#F7F7F7] dark:bg-[#1A1A1A]',
    border: 'border-[#E5E5E5] dark:border-[#2A2A2A]',
    dot: 'bg-[#666666]',
  },
}

type TabType = 'orders' | 'reservations'

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [newReservationsCount, setNewReservationsCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const localStart = new Date(`${selectedDate}T00:00:00`)
    const localEnd = new Date(`${selectedDate}T23:59:59`)
    const start = localStart.toISOString()
    const end = localEnd.toISOString()
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setOrders(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error('Orders yuklashda xatolik:', error.message)
      toast.error('Buyurtmalarni yuklashda muammo boʻldi')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, page])

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    const localStart = new Date(`${selectedDate}T00:00:00`)
    const localEnd = new Date(`${selectedDate}T23:59:59`)
    const start = localStart.toISOString()
    const end = localEnd.toISOString()
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    try {
      const { data, error, count } = await supabase
        .from('table_reservations')
        .select('*', { count: 'exact' })
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setReservations(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error('Reservations yuklashda xatolik:', error.message)
      toast.error('Bronlarni yuklashda muammo boʻldi')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, page])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else {
      fetchReservations()
    }
  }, [activeTab, fetchOrders, fetchReservations])

  useEffect(() => {
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        if (activeTab === 'orders') {
          fetchOrders()
        } else {
          setNewOrdersCount((prev) => prev + 1)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        if (activeTab === 'orders') fetchOrders()
      })
      .subscribe()

    const reservationsChannel = supabase
      .channel('admin-reservations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'table_reservations' }, () => {
        if (activeTab === 'reservations') {
          fetchReservations()
        } else {
          setNewReservationsCount((prev) => prev + 1)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'table_reservations' }, () => {
        if (activeTab === 'reservations') fetchReservations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(reservationsChannel)
    }
  }, [activeTab, fetchOrders, fetchReservations])

  useEffect(() => {
    if (activeTab === 'orders') {
      setNewOrdersCount(0)
    } else {
      setNewReservationsCount(0)
    }
  }, [activeTab])

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const order = orders.find(o => o.id === id)
    const oldStatus = order?.status
    
    const { error } = await supabase.from('orders').update({ 
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) {
      toast.error('Statusni yangilab boʻlmadi')
    } else {
      // Record status history
      try {
        await supabase.from('order_status_history').insert({
          order_id: id,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: 'admin',
          created_at: new Date().toISOString(),
        })
      } catch (e) { console.error('[history]', e) }
      
      toast.success('Status yangilandi')
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    }
  }

  const updateReservationStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('table_reservations').update({ status: newStatus }).eq('id', id)

    if (error) {
      toast.error('Statusni yangilab boʻlmadi')
    } else {
      toast.success('Bron statusi yangilandi')
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)))
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery) ||
      order.id?.toString().includes(searchQuery)
  )

  const filteredReservations = reservations.filter(
    (res) =>
      res.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone?.includes(searchQuery) ||
      res.id?.toString().includes(searchQuery)
  )

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111] dark:text-white">Buyurtmalar</h1>
          <p className="text-sm text-[#666666] dark:text-[#AAAAAA] mt-0.5">
            {selectedDate} sanasidagi barcha ma'lumotlar
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#181818] px-3 py-2 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A]">
            <Calendar size={16} className="text-[#666666] dark:text-[#AAAAAA]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setPage(1)
              }}
              className="bg-transparent outline-none text-sm text-[#111111] dark:text-white"
            />
          </div>

          {/* Total Badge */}
          <div className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-xl text-sm font-medium">
            {totalCount}
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#181818] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A]">
          <button
            onClick={() => {
              setActiveTab('orders')
              setPage(1)
            }}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'orders'
                ? 'text-[#FF0000]'
                : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-white'
            )}
          >
            <Utensils size={16} />
            <span>Taomlar</span>
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-white text-xs font-medium rounded-full flex items-center justify-center">
                {newOrdersCount}
              </span>
            )}
            {activeTab === 'orders' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF0000] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('reservations')
              setPage(1)
            }}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'reservations'
                ? 'text-[#FF0000]'
                : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-white'
            )}
          >
            <DoorOpen size={16} />
            <span>Xonalar</span>
            {newReservationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-white text-xs font-medium rounded-full flex items-center justify-center">
                {newReservationsCount}
              </span>
            )}
            {activeTab === 'reservations' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF0000] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] dark:text-[#AAAAAA]" size={18} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#666666] dark:placeholder:text-[#AAAAAA] outline-none focus:border-[#FF0000] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
        {loading && (activeTab === 'orders' ? orders : reservations).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#FF0000]" size={32} />
            <p className="text-sm text-[#666666] dark:text-[#AAAAAA]">Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={40} className="mx-auto text-[#E5E5E5] dark:text-[#2A2A2A] mb-3" />
                    <p className="text-[#666666] dark:text-[#AAAAAA]">Buyurtmalar topilmadi</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <tr>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">ID / Vaqt</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Mijoz</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Manzil</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-right">Summa</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-center">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
                        <AnimatePresence mode="popLayout">
                          {filteredOrders.map((order) => (
                            <motion.tr
                              key={order.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                              onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-[#111111] dark:text-white">
                                    #{order.id.toString().slice(-5)}
                                  </span>
                                  <span className="text-xs text-[#666666] dark:text-[#AAAAAA]">
                                    {new Date(order.created_at).toLocaleTimeString('uz-UZ', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-[#1A1A1A] flex items-center justify-center">
                                    <User size={14} className="text-[#666666] dark:text-[#AAAAAA]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#111111] dark:text-white">
                                      {order.customer_name}
                                    </p>
                                    <p className="text-xs text-[#666666] dark:text-[#AAAAAA]">{order.phone}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-[#666666] dark:text-[#AAAAAA]">
                                  <MapPin size={14} />
                                  <span className="truncate max-w-[150px]">
                                    {order.delivery_address || (order.table_number ? `Stol ${order.table_number}` : 'Olib ketish')}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-semibold text-[#111111] dark:text-white">
                                  {Number(order.total_amount).toLocaleString()}
                                  <span className="text-xs text-[#666666] dark:text-[#AAAAAA] ml-1">so'm</span>
                                </span>
                              </td>

                              <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <StatusBadge
                                  status={order.status}
                                  options={STATUS_MAP}
                                  onChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                                />
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'reservations' && (
              <>
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-16">
                    <DoorOpen size={40} className="mx-auto text-[#E5E5E5] dark:text-[#2A2A2A] mb-3" />
                    <p className="text-[#666666] dark:text-[#AAAAAA]">Bronlar topilmadi</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <tr>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">ID / Vaqt</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Mijoz</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Bron ma'lumoti</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">So'rov</th>
                          <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-center">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
                        <AnimatePresence mode="popLayout">
                          {filteredReservations.map((reservation) => (
                            <motion.tr
                              key={reservation.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-[#111111] dark:text-white">
                                    #{reservation.id.toString().slice(-5)}
                                  </span>
                                  <span className="text-xs text-[#666666] dark:text-[#AAAAAA]">
                                    {new Date(reservation.created_at).toLocaleTimeString('uz-UZ', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-[#F7F7F7] dark:bg-[#1A1A1A] flex items-center justify-center">
                                    <User size={14} className="text-[#666666] dark:text-[#AAAAAA]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#111111] dark:text-white">
                                      {reservation.customer_name}
                                    </p>
                                    <p className="text-xs text-[#666666] dark:text-[#AAAAAA]">{reservation.phone}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-[#111111] dark:text-white">
                                    <Clock size={14} className="text-[#666666] dark:text-[#AAAAAA]" />
                                    {new Date(reservation.reservation_date).toLocaleDateString('uz-UZ')} {reservation.reservation_time}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#AAAAAA]">
                                    <Users size={12} />
                                    {reservation.guest_count} kishi
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {reservation.special_requests ? (
                                  <div className="flex items-center gap-2 text-sm text-[#666666] dark:text-[#AAAAAA]">
                                    <MessageSquare size={14} />
                                    <span className="truncate max-w-[150px]">{reservation.special_requests}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#666666] dark:text-[#AAAAAA]">-</span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <StatusBadge
                                  status={reservation.status}
                                  options={RESERVATION_STATUS_MAP}
                                  onChange={(newStatus) => updateReservationStatus(reservation.id, newStatus)}
                                />
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 px-4 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
          >
            <ChevronLeft size={16} className="mr-1" /> Oldingi
          </Button>
          <div className="px-4 py-2 bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-lg text-sm font-medium text-[#111111] dark:text-white">
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 px-4 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
          >
            Keyingi <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-[#181818] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#1A1A1A]">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">Buyurtma #{selectedOrder.id.toString().slice(-5)}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{new Date(selectedOrder.created_at).toLocaleString('uz-UZ')}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Mijoz</h3>
                  <div className="bg-gray-50 dark:bg-[#141414] p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <p className="font-medium text-lg flex items-center gap-3"><User size={18} className="text-[#FF0000]"/> {selectedOrder.customer_name}</p>
                    <p className="text-muted-foreground flex items-center gap-3"><Phone size={18} className="text-[#FF0000]"/> {selectedOrder.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Yetkazish Ma'lumotlari</h3>
                  <div className="bg-gray-50 dark:bg-[#141414] p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Turi:</span> <span className="font-bold">
                      {{'delivery': 'Yetkazib berish', 'dine-in': 'Restoranda', 'restaurant': 'Olib ketish', 'takeaway': 'Olib ketish'}[(selectedOrder.order_type || selectedOrder.mode) as string] || selectedOrder.order_type || selectedOrder.mode || 'Noma\'lum'}
                    </span></div>
                    {selectedOrder.delivery_address && <div className="flex flex-col gap-1 mt-2 border-t pt-2 border-gray-100 dark:border-gray-800"><span className="text-sm text-gray-500">Manzil:</span> <span className="font-medium leading-relaxed">{selectedOrder.delivery_address}</span></div>}
                    {selectedOrder.table_number && <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Stol raqami:</span> <span className="font-bold">{selectedOrder.table_number}</span></div>}
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2 mt-2"><span className="text-sm text-gray-500">To'lov usuli:</span> <span className="font-bold">
                      {{'card': 'Karta', 'cash': 'Naqd pul'}[selectedOrder.payment_method as string] || selectedOrder.payment_method}
                    </span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-500">To'lov holati:</span> <span className={cn("font-bold px-2 py-0.5 rounded text-xs", selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                      {{'paid': '✅ To\'langan', 'pending': '⏳ Kutilmoqda', 'failed': '❌ Bekor bo\'lgan'}[selectedOrder.payment_status as string] || 'Hali to\'lanmagan'}
                    </span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Manba:</span> <span className="font-medium bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">
                      {{'mobile_app': '📱 Mobil Ilova', 'website': '💻 Vebsayt'}[selectedOrder.source as string] || selectedOrder.source}
                    </span></div>
                  </div>
                </div>
                
                {selectedOrder.note && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Mijoz Izohi</h3>
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 text-orange-800 dark:text-orange-200">
                    {selectedOrder.note}
                  </div>
                </div>
                )}
              </div>
              
              {/* Right Order Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Tarkibi</h3>
                <div className="bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex items-start gap-4">
                           <span className="font-bold text-[#FF0000] bg-red-50 dark:bg-red-950 px-2 py-1 rounded-lg w-10 text-center">{item.quantity || 1}x</span>
                           <div className="flex flex-col gap-1">
                              <span className="font-medium text-gray-900 dark:text-gray-100">{item.name || item.item_name}</span>
                              <span className="text-xs text-gray-500">Unit: {Number(item.price || item.unit_price || 0).toLocaleString()} so'm</span>
                           </div>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 w-24 text-right">
                          {((item.quantity || 1) * (item.price || item.unit_price || 0)).toLocaleString()} so'm
                        </span>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-gray-500 text-sm">Maxsulotlar topilmadi</div>
                    )}
                  </div>
                  <div className="p-5 bg-gray-100 dark:bg-[#202020] flex justify-between items-center border-t border-gray-200 dark:border-gray-700 shadow-inner">
                    <span className="font-bold text-lg text-gray-600 dark:text-gray-300">JAMI SUMMA</span>
                    <span className="font-black text-2xl text-[#FF0000]">{Number(selectedOrder.total_amount).toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  )
}

function StatusBadge({
  status,
  options,
  onChange,
}: {
  status: string
  options: Record<string, any>
  onChange: (newStatus: string) => void
}) {
  const config = options[status] || options.yangi || options.pending

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer transition-colors',
        config.bg,
        config.color,
        config.border
      )}
    >
      {Object.entries(options).map(([key, value]: [string, any]) => (
        <option key={key} value={key} className="bg-white dark:bg-[#181818] text-[#111111] dark:text-white">
          {value.label}
        </option>
      ))}
    </select>
  )
}
