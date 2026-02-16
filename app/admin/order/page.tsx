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
  const itemsPerPage = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const start = `${selectedDate}T00:00:00`
    const end = `${selectedDate}T23:59:59`
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
    const start = `${selectedDate}T00:00:00`
    const end = `${selectedDate}T23:59:59`
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
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)

    if (error) {
      toast.error('Statusni yangilab boʻlmadi')
    } else {
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
                              className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors"
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

                              <td className="px-6 py-4 text-center">
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
