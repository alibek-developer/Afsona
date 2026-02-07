'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { format, setHours, setMinutes } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Calendar, Clock, Loader2, Phone, Sparkles, User, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast, Toaster } from 'react-hot-toast'

interface TableData {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  description?: string
  image_url: string
  is_available?: boolean
  type?: string
}

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }),
  hover: { y: -12, scale: 1.02, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
}

const LuxurySkeleton = ({ isDark }: { isDark: boolean }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("relative overflow-hidden rounded-3xl border backdrop-blur-xl", isDark ? "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-white/5" : "bg-gradient-to-br from-white/90 via-gray-50/90 to-white/90 border-gray-200/50")}>
    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%', transition: { repeat: Infinity, duration: 2, ease: 'linear' }}} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="aspect-[4/3] w-full bg-gradient-to-br from-gray-300/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-800/20" />
    <div className="p-6 space-y-4">
      <div className="h-7 w-3/4 rounded-lg bg-gray-300/30 dark:bg-gray-700/30" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-300/20 dark:bg-gray-700/20" />
        <div className="h-4 w-5/6 rounded bg-gray-300/20 dark:bg-gray-700/20" />
      </div>
      <div className="flex justify-between pt-3">
        <div className="h-5 w-24 rounded-full bg-gray-300/30 dark:bg-gray-700/30" />
        <div className="h-5 w-32 rounded-full bg-gray-300/30 dark:bg-gray-700/30" />
      </div>
    </div>
  </motion.div>
)

export default function LuxuryBookingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableData[]>([])
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  const [date, setDate] = useState<Date | null>(new Date())
  const [startTime, setStartTime] = useState<Date | null>(setMinutes(setHours(new Date(), 12), 0))
  const [endTime, setEndTime] = useState<Date | null>(setMinutes(setHours(new Date(), 14), 0))
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('+998')
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from('tables').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setTables(data || [])
    } catch (err: any) {
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
    const channel = supabase.channel('tables-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, fetchTables).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleCardClick = (table: TableData) => {
    setSelectedTable(table)
    setIsSheetOpen(true)
    setBookingError(null)
  }

  const resetForm = () => {
    setCustomerName('')
    setPhone('+998')
    setDate(new Date())
    setStartTime(setMinutes(setHours(new Date(), 12), 0))
    setEndTime(setMinutes(setHours(new Date(), 14), 0))
    setBookingError(null)
  }

  const celebrateBooking = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'] })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'] })
    }, 250)
  }

  const handleSubmit = async () => {
    setBookingError(null)
    if (!customerName.trim() || phone.length < 13 || !date || !startTime || !endTime) {
      setBookingError('Iltimos, barcha maydonlarni to`ldiring'); return
    }
    if (startTime >= endTime) {
      setBookingError('Tugash vaqti boshlanish vaqtidan keyin bo`lishi kerak'); return
    }
    setSubmitting(true)
    try {
      const selectedDateStr = format(date, 'yyyy-MM-dd')
      const startStr = format(startTime, 'HH:mm:ss')
      const endStr = format(endTime, 'HH:mm:ss')

      const { data: existingBookings, error: checkError } = await supabase
        .from('table_reservations')
        .select('start_time, end_time')
        .eq('table_id', selectedTable?.id)
        .eq('reservation_date', selectedDateStr)
        .neq('status', 'cancelled')

      if (checkError) throw checkError

      const isOverlap = existingBookings?.some(booking => {
        return (
          (startStr >= booking.start_time && startStr < booking.end_time) ||
          (endStr > booking.start_time && endStr <= booking.end_time) ||
          (startStr <= booking.start_time && endStr >= booking.end_time)
        )
      })

      if (isOverlap) {
        setBookingError('Kechirasiz, bu vaqtda xona band! Boshqa vaqt tanlang.')
        setSubmitting(false); return
      }

      const { error } = await supabase.from('table_reservations').insert([{
        table_id: selectedTable?.id,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        reservation_date: selectedDateStr,
        start_time: startStr,
        end_time: endStr,
      }])
      
      if (error) throw error
      celebrateBooking()
      setIsSheetOpen(false)
      toast.success('Muvaffaqiyatli bron qilindi! 🎉')
      resetForm()
    } catch (err: any) {
      setBookingError(err.message || "Xatolik yuz berdi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn("min-h-screen font-sans antialiased", isDark ? "bg-[#0A0F1E] text-gray-50" : "bg-gray-50 text-gray-900")}>
      <Toaster position="top-center" />

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <header className="text-center mb-16">
            <h1 className="text-6xl font-black uppercase tracking-tighter">Luxury Spaces</h1>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <LuxurySkeleton key={i} isDark={isDark} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tables.map((table, index) => (
              <motion.article key={table.id} custom={index} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" onClick={() => handleCardClick(table)} className={cn("group relative rounded-3xl border cursor-pointer overflow-hidden transition-all", isDark ? "bg-slate-900/90 border-white/5" : "bg-white border-gray-200")}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={table.image_url} alt={table.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">{table.name}</h3>
                  <p className="mt-2 text-red-500 font-black">{Number(table.price_per_hour).toLocaleString()} so'm</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className={cn("w-full sm:max-w-xl p-0 overflow-y-auto border-0 focus:ring-0", isDark ? "bg-[#0A0F1E]" : "bg-white")}>
          <SheetTitle className="sr-only">Bron qilish</SheetTitle>
          {selectedTable && (
            <div className="flex flex-col min-h-full">
              {/* TOP: IMAGE SECTION - Balandlik biroz kamaytirildi */}
              <div className="relative h-[220px] w-full overflow-hidden shrink-0">
                <img src={selectedTable.image_url} alt={selectedTable.name} className="w-full h-full object-cover" />
                <div className={cn("absolute inset-0 bg-gradient-to-t", isDark ? "from-[#0A0F1E] via-[#0A0F1E]/20 to-transparent" : "from-white via-white/20 to-transparent")} />
                <h2 className={cn("absolute bottom-4 left-6 text-3xl font-black", isDark ? "text-white" : "text-gray-900")}>{selectedTable.name}</h2>
              </div>

              {/* MIDDLE CONTENT - Paddinglar va elementlar heighti optimallashdi */}
              <div className="px-6 py-4 space-y-5">
                
                {/* INFO CARDS - Sig'im va Narx (Height kamaydi) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn("py-3 px-4 rounded-2xl border flex flex-col items-center justify-center text-center", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                    <Users className="w-4 h-4 mb-1 text-red-500" />
                    <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">SIG'IM</span>
                    <div className="text-lg font-black">{selectedTable.capacity} kishi</div>
                  </div>
                  <div className={cn("py-3 px-4 rounded-2xl border flex flex-col items-center justify-center text-center", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                    <Sparkles className="w-4 h-4 mb-1 text-red-500" />
                    <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">NARX</span>
                    <div className="text-lg font-black">{Number(selectedTable.price_per_hour).toLocaleString()} <span className="text-xs">so'm</span></div>
                  </div>
                </div>

                {/* CONTACT SECTION - Ixchamroq qator */}
                <div className={cn("py-3 px-4 rounded-2xl border text-center relative overflow-hidden group", isDark ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-100")}>
                  <div className="text-[9px] font-bold uppercase text-gray-500 tracking-widest mb-1">BOG'LANISH</div>
                  <a href="tel:+998901234567" className="text-xl font-black flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    +998 90 123 45 67
                  </a>
                </div>

                {/* FORM SECTION - Masofalar zichlashtirildi */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-red-500 tracking-widest">SANA VA VAQT</Label>
                    
                    {/* DATE */}
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <DatePicker selected={date} onChange={(d) => { setDate(d); setBookingError(null); }} className={cn("w-full h-11 pl-10 rounded-xl border text-base font-medium", isDark ? "bg-slate-900/60 border-white/10" : "bg-gray-50 border-gray-200")} />
                    </div>

                    {/* TIME PICKERS - Height kamaydi */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <DatePicker selected={startTime} onChange={(t) => { setStartTime(t); setBookingError(null); }} showTimeSelect showTimeSelectOnly dateFormat="HH:mm" className={cn("w-full h-11 pl-9 rounded-xl border font-bold text-sm", isDark ? "bg-slate-900/60 border-white/10" : "bg-gray-50 border-gray-200")} />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <DatePicker selected={endTime} onChange={(t) => { setEndTime(t); setBookingError(null); }} showTimeSelect showTimeSelectOnly dateFormat="HH:mm" className={cn("w-full h-11 pl-9 rounded-xl border font-bold text-sm", isDark ? "bg-slate-900/60 border-white/10" : "bg-gray-50 border-gray-200")} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {bookingError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("flex items-center gap-2 p-3 rounded-lg border", isDark ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-600")}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p className="text-xs font-bold leading-tight">{bookingError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* INPUTS - Height optimallashdi */}
                  <div className="flex  gap-3 mb-5">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <Input placeholder="Ismingiz" value={customerName} onChange={e => { setCustomerName(e.target.value); setBookingError(null); }} className="h-11 pl-10 rounded-xl font-bold border-gray-200" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <Input value={phone} onChange={e => {
                        let val = e.target.value;
                        if (!val.startsWith('+998')) val = '+998';
                        const num = val.slice(4).replace(/\D/g, '').substring(0, 9);
                        setPhone('+998' + num);
                        setBookingError(null);
                      }} className="h-11 pl-10 rounded-xl font-bold border-gray-200" />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <Button onClick={handleSubmit} disabled={submitting} className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-lg shadow-red-600/20 transition-all active:scale-95">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 w-5 h-5" />}
                    BRON QILISH
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); font-family: inherit; font-size: 0.9rem; }
        .react-datepicker__day--selected { background: #dc2626 !important; }
        .react-datepicker__header { padding-top: 10px; }
      `}</style>
    </div>
  )
}