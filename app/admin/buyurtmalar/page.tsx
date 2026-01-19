'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import type { Order } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Hash, Loader2, MapPin, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  new: 'Yangi Buyurtma',
  preparing: 'Tayyorlanmoqda',
  ready: 'Tayyor / Kutmoqda',
  delivered: 'Yetkazib berildi',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-600',
  preparing: 'bg-amber-500',
  ready: 'bg-emerald-500',
  delivered: 'bg-slate-300',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const prevOrderIdsRef = useRef<Set<string>>(new Set())
  const [highlightedOrderIds, setHighlightedOrderIds] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('admin_orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      // Note: DB schema confirmed to NOT have delivery_distance/subtotal; keep only known columns
      .select('id, created_at, customer_name, customer_phone, mode, table_number, delivery_address, items, total_amount, delivery_fee, grand_total, status')
      .order('created_at', { ascending: false })
    if (!error) {
      const nextOrders = (data as Order[]) || []
      const prevIds = prevOrderIdsRef.current
      const now = Date.now()
      const newHighlights: Record<string, number> = {}
      nextOrders.forEach(o => { if (!prevIds.has(o.id)) newHighlights[o.id] = now })
      prevOrderIdsRef.current = new Set(nextOrders.map(o => o.id))
      setHighlightedOrderIds(prev => ({ ...prev, ...newHighlights }))
      setOrders(nextOrders)
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      toast.success('Status muvaffaqiyatli yangilandi')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-900" size={32} /></div>

  return (
    <div className='space-y-6 max-w-[1200px] mx-auto p-4'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-black tracking-tight text-slate-900'>Buyurtmalar Oqimi</h1>
          <p className='text-sm font-bold text-slate-400 uppercase tracking-[0.2em]'>Jonli monitoring tizimi</p>
        </div>
        <div className='bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4'>
            <div>
              <p className='text-[10px] font-black text-slate-400 uppercase'>Bugungi jami</p>
              <p className='text-2xl font-black leading-none text-slate-900'>{orders.length}</p>
            </div>
            <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600'>
              <Hash size={20} />
            </div>
        </div>
      </div>

      <div className='flex flex-col gap-3'>
        <AnimatePresence mode='popLayout'>
          {orders.map(order => (
            <motion.div 
              key={order.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className={`border-none shadow-sm transition-all overflow-hidden bg-white ${highlightedOrderIds[order.id] ? 'ring-2 ring-blue-500 shadow-blue-100' : ''}`}>
                <CardContent className='p-0 flex items-stretch h-[85px]'>
                  <div className={`w-2 ${STATUS_COLORS[order.status]} transition-colors`} />
                  
                  <div className='flex-1 flex items-center px-6 gap-8'>
                    {/* Time & ID */}
                    <div className='w-24 shrink-0'>
                      <div className='flex items-center gap-1.5 text-slate-400 mb-1'>
                        <Clock size={14} />
                        <span className='text-xs font-black'>
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className='text-sm font-black text-slate-900 tracking-tight'>#{order.id.slice(0, 6).toUpperCase()}</p>
                    </div>

                    {/* Customer Info */}
                    <div className='w-56 shrink-0 border-l border-slate-50 pl-6'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100'>
                          <User size={18} />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-black text-slate-900 truncate'>{order.customer_name}</p>
                          <p className='text-xs font-bold text-slate-400 mt-0.5'>{order.customer_phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location / Table */}
                    <div className='flex-1 min-w-0 border-l border-slate-50 pl-6'>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5'>Joylashuv</p>
                      <div className='flex items-center gap-2'>
                        {order.mode === 'dine-in' ? (
                          <span className='px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black shadow-sm'>STOL #{order.table_number}</span>
                        ) : (
                          <div className='flex items-center gap-2 truncate text-slate-700 font-bold text-sm'>
                            <MapPin size={16} className='text-red-500 shrink-0' /> 
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className='w-40 text-right border-l border-slate-50 px-6'>
                      <p className='text-[10px] font-black text-slate-400 uppercase mb-1'>Umumiy Summa</p>
                      <span className='text-xl font-black text-slate-900 tracking-tighter'>
                        {(order.grand_total ?? 0).toLocaleString('uz-UZ')} so'm
                      </span>
                    </div>

                    {/* Status Select Tool */}
                    <div className='w-48 shrink-0'>
                       <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                        <SelectTrigger className='h-12 bg-slate-50 border-none font-black text-xs rounded-xl hover:bg-slate-100 transition-colors'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl border-none shadow-xl'>
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key} className='py-3 font-bold text-xs'>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}