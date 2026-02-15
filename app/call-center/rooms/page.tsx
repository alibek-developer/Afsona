'use client'

import { useEffect, useState } from 'react'
import { format, setHours, setMinutes } from 'date-fns'
import { Search, Loader2, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { FloorMap } from '../components/FloorMap'
import { FloorTabs } from '../components/FloorTabs'
import { BookingSidebar } from '../components/BookingSidebar'
import { RoomPreviewModal } from '../components/RoomPreviewModal'
import { fetchTablesWithStatus, completeOrder } from '../actions'

interface Order {
  id: string
  table_id: string
  customer_name: string
  phone: string
  status: 'active' | 'completed'
  created_at: string
  completed_at?: string
  total_amount: number
}

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
  floor: string
  active_order: Order | null
}

const FLOORS = ['1-qavat', '2-qavat', '3-qavat'] as const
type FloorType = typeof FLOORS[number]

export default function RoomsPage() {
  const [xonalar, setXonalar] = useState<Xona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFloor, setActiveFloor] = useState<FloorType>('3-qavat')

  // Selected xona state
  const [selectedXona, setSelectedXona] = useState<Xona | null>(null)

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [startTime, setStartTime] = useState<Date | null>(
    setMinutes(setHours(new Date(), 12), 0)
  )
  const [endTime, setEndTime] = useState<Date | null>(
    setMinutes(setHours(new Date(), 14), 0)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Preview modal state
  const [previewXona, setPreviewXona] = useState<Xona | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    fetchXonalar()
  }, [])

  const fetchXonalar = async () => {
    try {
      const result = await fetchTablesWithStatus()
      if (result.success) {
        setXonalar(result.data)
      } else {
        toast.error('Xonalarni yuklashda xatolik: ' + result.message)
      }
    } catch (err: any) {
      toast.error('Xonalarni yuklashda xatolik: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription for orders
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refetch tables when orders change
          fetchXonalar()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Filter xonalar by active floor
  const filteredByFloor = xonalar.filter((x) => x.floor === activeFloor)

  // Further filter by search term
  const filteredXonalar = filteredByFloor.filter((x) =>
    x.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectXona = (xona: Xona) => {
    if (!xona.is_available) {
      toast.error('Bu xona band!')
      return
    }
    setSelectedXona(xona)
    toast.success(`${xona.name} tanlandi`)
  }

  const handlePreviewXona = (xona: Xona) => {
    setPreviewXona(xona)
    setIsPreviewOpen(true)
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const result = await completeOrder(orderId)
      if (result.success) {
        toast.success('Bron yakunlandi!')
        fetchXonalar()
      } else {
        toast.error('Xatolik: ' + result.message)
      }
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message)
    }
  }

  const resetForm = () => {
    setSelectedXona(null)
    setCustomerName('')
    setPhone('')
    setStartTime(setMinutes(setHours(new Date(), 12), 0))
    setEndTime(setMinutes(setHours(new Date(), 14), 0))
  }

  const handleSubmit = async () => {
    if (!selectedXona) return toast.error('Xona tanlanmagan!')
    if (!customerName || !phone) return toast.error("Mijoz ma'lumotlarini to'ldiring")
    if (!startTime || !endTime) return toast.error("Vaqtni to'ldiring")

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('table_reservations').insert([
        {
          table_id: selectedXona.id,
          customer_name: customerName.trim(),
          phone: phone.trim(),
          reservation_date: format(new Date(), 'yyyy-MM-dd'),
          start_time: format(startTime, 'HH:mm:ss'),
          end_time: format(endTime, 'HH:mm:ss'),
        },
      ])

      if (error) throw error

      toast.success('Bron muvaffaqiyatli saqlandi!')
      resetForm()
      fetchXonalar()
    } catch (err: any) {
      toast.error(err.message || 'Bronni saqlashda xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2.5 rounded-xl shadow-lg shadow-red-500/20">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              XONALAR
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Xona bron qilish paneli
            </p>
          </div>
        </div>
      </div>

      {/* Floor Tabs */}
      <FloorTabs activeFloor={activeFloor} onFloorChange={setActiveFloor} />

      {/* Search */}
      <div className="relative group">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
          size={22}
        />
        <input
          type="text"
          placeholder={`${activeFloor} dagi xonalarni qidirish...`}
          className="w-full h-16 pl-14 pr-6 rounded-[1.25rem] bg-white dark:bg-[#111827] border-none shadow-sm text-lg font-medium focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-slate-200"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side - Floor Map */}
        <div className="lg:col-span-8">
          <FloorMap
            xonalar={filteredXonalar}
            selectedXona={selectedXona}
            onSelectXona={handleSelectXona}
            onPreviewXona={handlePreviewXona}
            onCompleteOrder={handleCompleteOrder}
            activeFloor={activeFloor}
            searchTerm={searchTerm}
          />
        </div>

        {/* Right Side - Booking Sidebar */}
        <div className="lg:col-span-4">
          <BookingSidebar
            selectedXona={selectedXona}
            customerName={customerName}
            setCustomerName={setCustomerName}
            phone={phone}
            setPhone={setPhone}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onReset={resetForm}
          />
        </div>
      </div>

      {/* Room Preview Modal */}
      <RoomPreviewModal
        xona={previewXona}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}
