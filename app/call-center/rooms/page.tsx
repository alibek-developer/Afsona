'use client'

import { supabase } from '@/lib/supabaseClient'
import {
  BedDouble,
  BedSingle,
  CheckCircle,
  Clock,
  Loader2,
  Minus,
  Phone,
  Plus,
  Sparkles,
  User,
  Wrench,
  X,
  ChevronDown,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type RoomStatus = 'available' | 'booked' | 'cleaning' | 'maintenance'
type RoomType = 'standart' | 'lyuks' | 'oilaviy' | 'prezident'

interface Room {
  id: string
  number: string
  type: RoomType
  capacity: number
  price: number
  status: RoomStatus
  bookedUntil?: string
}

const fmt = (n: number) => n.toLocaleString('ru-RU')

const typeBadge: Record<RoomType, string> = {
  standart: 'bg-white/5 text-zinc-400',
  lyuks: 'bg-blue-500/15 text-blue-400',
  oilaviy: 'bg-purple-500/15 text-purple-400',
  prezident: 'bg-red-500/15 text-red-400',
}

const typeLabel: Record<RoomType, string> = {
  standart: 'Standart',
  lyuks: 'Lyuks',
  oilaviy: 'Oilaviy',
  prezident: 'Prezident',
}

const pad = (n: number) => String(n).padStart(2, '0')

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const addDays = (s: string, n: number) => {
  const d = new Date(s)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const nightsBetween = (a: string, b: string) => {
  const da = new Date(a).getTime(),
    db = new Date(b).getTime()
  return Math.max(1, Math.round((db - da) / 86400000))
}

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 12)
  let s = d
  if (!s.startsWith('998')) s = '998' + s
  s = s.slice(0, 12)
  const p = s.slice(3)
  let out = '+998'
  if (p.length) out += ' ' + p.slice(0, 2)
  if (p.length > 2) out += ' ' + p.slice(2, 5)
  if (p.length > 5) out += ' ' + p.slice(5, 7)
  if (p.length > 7) out += ' ' + p.slice(7, 9)
  return out
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsExpanded, setBookingsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)
  const [shake, setShake] = useState(false)
  const [checkInDate, setCheckInDate] = useState(todayStr())
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [checkOutDate, setCheckOutDate] = useState(addDays(todayStr(), 1))
  const [checkOutTime, setCheckOutTime] = useState('12:00')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom && guests > selectedRoom.capacity) {
      setGuests(selectedRoom.capacity)
    }
  }, [selectedRoom])

  useEffect(() => {
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setCheckOutDate(addDays(checkInDate, 1))
    }
  }, [checkInDate])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const mapped: Room[] = (data || []).map((t: any) => ({
        id: t.id,
        number: t.table_number || t.name || '—',
        type: (t.room_type as RoomType) || 'standart',
        capacity: t.capacity || 2,
        price: t.price_per_hour || t.price || 0,
        status: (t.is_available ? 'available' : t.status || 'booked') as RoomStatus,
        bookedUntil: t.booked_until,
      }))

      setRooms(mapped)
    } catch (err: any) {
      console.error('[call-center] Rooms fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    booked: rooms.filter(r => r.status === 'booked').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
  }

  const nights = nightsBetween(checkInDate, checkOutDate)
  const subtotal = selectedRoom ? selectedRoom.price * nights : 0
  const discountPct = nights > 5 ? 0.15 : nights > 2 ? 0.1 : 0
  const discount = Math.round(subtotal * discountPct)
  const total = subtotal - discount

  const resetForm = () => {
    setSelectedRoom(null)
    setName('')
    setPhone('')
    setGuests(1)
    setNote('')
  }

  const submit = async () => {
    if (!selectedRoom || !name || !phone) return
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .insert([
          {
            table_id: selectedRoom.id,
            customer_name: name,
            phone: phone,
            reservation_date: checkInDate,
            start_time: checkInTime,
            end_time: checkOutTime,
            guests: guests,
            total_amount: total,
            source: 'call-center',
            status: 'active',
          },
        ])
        .select()
        .single()

      if (error) throw error

      setBookings(b => [data, ...b])
      setRooms(rs =>
        rs.map(r =>
          r.id === selectedRoom.id
            ? { ...r, status: 'booked' as RoomStatus, bookedUntil: checkOutDate }
            : r
        )
      )
      alert(`✅ Bron qabul qilindi! Xona ${selectedRoom.number}`)
      resetForm()
    } catch (err: any) {
      console.error('[call-center] Booking error:', err)
      alert(err.message || 'Bron qilishda xatolik')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    !!selectedRoom && name.trim() && phone.replace(/\D/g, '').length >= 11 && !isSubmitting

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* LEFT */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-5 gap-6 flex-wrap">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight">Xonalar</h2>
            <div className="flex gap-4 mt-2 text-[13px] font-medium">
              <span className="text-emerald-400">{counts.available} bo&apos;sh</span>
              <span className="text-zinc-700">·</span>
              <span className="text-red-400">{counts.booked} band</span>
              <span className="text-zinc-700">·</span>
              <span className="text-red-400">{counts.cleaning} tozalanmoqda</span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap text-[12px] text-zinc-500">
            {[
              ['bg-emerald-400', "Bo'sh"],
              ['bg-red-400', 'Band'],
              ['bg-red-400', 'Tozalanmoqda'],
              ['bg-zinc-600', "Ta'mirlash"],
            ].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${c}`} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Room grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {rooms.map(room => {
              const selectable = room.status === 'available'
              const isSel = selectedRoom?.id === room.id
              const baseColors = {
                available:
                  'bg-[#0a0a0a] border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5',
                booked: 'bg-red-500/5 border-red-500/25 opacity-70 cursor-not-allowed',
                cleaning: 'bg-red-500/5 border-red-500/25 cursor-not-allowed',
                maintenance: 'bg-zinc-800/40 border-zinc-700 cursor-not-allowed',
              }[room.status]
              const numColor = {
                available: 'text-emerald-400',
                booked: 'text-red-400',
                cleaning: 'text-red-400',
                maintenance: 'text-zinc-500',
              }[room.status]
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={selectable ? { scale: 1.02 } : {}}
                  onClick={() => selectable && setSelectedRoom(room)}
                  className={`rounded-2xl p-5 border-2 transition-all cursor-pointer ${baseColors} ${
                    isSel
                      ? '!border-red-500 !bg-red-500/8 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`text-[32px] font-bold leading-none ${numColor}`}
                    >
                      {room.number}
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${typeBadge[room.type]}`}
                    >
                      {typeLabel[room.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-[12px] text-zinc-500">
                    {room.capacity > 2 ? (
                      <BedDouble className="w-4 h-4" />
                    ) : (
                      <BedSingle className="w-4 h-4" />
                    )}
                    {room.capacity} kishi
                  </div>
                  <div
                    className={`mt-2 text-[14px] font-mono font-bold ${room.status === 'available' ? 'text-zinc-100' : 'text-zinc-600'}`}
                  >
                    {fmt(room.price)}{' '}
                    <span className="text-zinc-600 font-normal">so&apos;m</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px]">
                    {room.status === 'available' && (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Bo&apos;sh</span>
                      </>
                    )}
                    {room.status === 'booked' && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-400 font-medium">Band</span>
                        </div>
                        <span className="text-[11px] text-red-400/70 mt-0.5">
                          Chiqish: {room.bookedUntil || '—'}
                        </span>
                      </div>
                    )}
                    {room.status === 'cleaning' && (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-red-400 font-medium">Tozalanmoqda</span>
                      </>
                    )}
                    {room.status === 'maintenance' && (
                      <>
                        <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-500 font-medium">Ta&apos;mirlash</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Recent bookings */}
        <div className="mt-8 border-t border-white/7 pt-2">
          <button
            onClick={() => setBookingsExpanded(e => !e)}
            className="w-full flex justify-between items-center py-3 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-semibold text-zinc-200">
                Bugungi bronlar
              </span>
              <span className="bg-red-500/15 text-red-400 text-[12px] font-bold px-2 py-0.5 rounded-full">
                {bookings.length}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform ${bookingsExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {bookingsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1">
                  {bookings.slice(0, 5).map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 py-3 border-b border-white/5 text-[13px]"
                    >
                      <span className="bg-red-500/15 text-red-400 font-bold rounded-lg px-2.5 py-1 font-mono">
                        {b.table_id?.slice(0, 4) || '—'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-zinc-200 font-medium truncate">
                          {b.customer_name}
                        </div>
                        <div className="text-zinc-500 text-[12px]">{b.phone}</div>
                      </div>
                      <div className="text-zinc-400 hidden md:block">
                        {b.reservation_date}
                      </div>
                      <div className="text-red-500 font-mono font-bold">
                        {fmt(b.total_amount || 0)}
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full">
                        Tasdiqlangan
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: BOOKING FORM */}
      <aside className="w-96 bg-[#0a0a0a] border-l border-white/7 flex flex-col overflow-hidden shrink-0 h-full">
        <div className="p-6 border-b border-white/7">
          {!selectedRoom ? (
            <div className="text-center py-2">
              <BedDouble className="w-8 h-8 text-zinc-700 mx-auto" />
              <div className="text-[16px] font-semibold text-zinc-600 mt-2">
                Xona tanlang
              </div>
              <div className="text-[12px] text-zinc-700 mt-1">
                Chap tomondan xona tanlash uchun bosing
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-[22px] ${typeBadge[selectedRoom.type]}`}
              >
                {selectedRoom.number}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${typeBadge[selectedRoom.type]}`}
                >
                  {typeLabel[selectedRoom.type]}
                </span>
                <div className="text-[18px] font-bold text-red-500 mt-0.5 font-mono">
                  {fmt(selectedRoom.price)}{' '}
                  <span className="text-[11px] text-zinc-500">so&apos;m</span>
                </div>
                <div className="text-[13px] text-zinc-500">
                  {selectedRoom.capacity} kishilik
                </div>
              </div>
              <button
                onClick={resetForm}
                className="text-[13px] text-zinc-600 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* MEHMON */}
          <div>
            <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
              Mehmon
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-3">
                <User className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ism Familiya"
                  className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-3">
                <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  value={phone}
                  onChange={v => setPhone(formatPhone(v.target.value))}
                  placeholder="+998 90 000 00 00"
                  className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 block mb-2">
                  Mehmonlar soni
                </label>
                <motion.div
                  animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
                  className="flex items-center gap-4 bg-[#111] border border-white/10 rounded-xl p-2"
                >
                  <button
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-zinc-300 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-bold text-[18px] tabular-nums">
                    {guests}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedRoom && guests >= selectedRoom.capacity) {
                        setShake(true)
                        setTimeout(() => setShake(false), 400)
                        return
                      }
                      setGuests(g => g + 1)
                    }}
                    className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-zinc-300 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </motion.div>
                {selectedRoom && guests >= selectedRoom.capacity && (
                  <div className="text-[11px] text-red-400 mt-1.5">
                    Bu xona max {selectedRoom.capacity} kishi
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SANA VA VAQT */}
          <div>
            <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
              Sana va Vaqt
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={checkInDate}
                  min={todayStr()}
                  onChange={e => setCheckInDate(e.target.value)}
                  className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 focus:outline-none focus:border-red-500/40"
                />
                <input
                  type="time"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={checkOutDate}
                  min={addDays(checkInDate, 1)}
                  onChange={e => setCheckOutDate(e.target.value)}
                  className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 focus:outline-none focus:border-red-500/40"
                />
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div className="bg-[#111] border border-white/8 rounded-xl p-4 flex justify-between items-center">
                <span className="text-[13px] text-zinc-500">Muddati:</span>
                <span className="text-[15px] font-bold text-zinc-100">
                  {nights} tun
                </span>
              </div>
            </div>
          </div>

          {/* NARX */}
          {selectedRoom && (
            <div>
              <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
                Narx
              </label>
              <div className="bg-[#111] border border-white/8 rounded-xl p-4 space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{fmt(selectedRoom.price)} × {nights} tun</span>
                  <span className="text-zinc-200">{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-400">-{Math.round(discountPct * 100)}% chegirma</span>
                    <span className="text-emerald-400">-{fmt(discount)}</span>
                  </div>
                )}
                <div className="border-t border-white/8 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold">JAMI:</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-[20px] font-bold text-red-500 font-mono"
                  >
                    {fmt(total)} so&apos;m
                  </motion.span>
                </div>
              </div>
            </div>
          )}

          {/* IZOH */}
          <div>
            <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
              Izoh
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Qo'shimcha izoh yoki so'rovlar..."
              rows={2}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-zinc-200 placeholder:text-zinc-700 focus:border-red-500/40 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/7 bg-[#0a0a0a]">
          {selectedRoom && (
            <div className="flex justify-between items-end mb-4">
              <span className="text-[12px] text-zinc-500">Jami summa</span>
              <span className="text-[22px] font-bold text-red-500 font-mono">
                {fmt(total)} so&apos;m
              </span>
            </div>
          )}
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-[16px] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...
              </>
            ) : (
              'Bron Qilish'
            )}
          </button>
          <button
            onClick={resetForm}
            className="w-full border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 py-3 rounded-xl text-[14px] mt-2 transition"
          >
            Bekor qilish
          </button>
        </div>
      </aside>
    </div>
  )
}
