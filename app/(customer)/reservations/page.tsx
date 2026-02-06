'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { format, setHours, setMinutes } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock, Loader2, MapPin, Phone, Sparkles, User, Users } from 'lucide-react'
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
  visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}),
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
  const [phone, setPhone] = useState('')
  const [peopleCount, setPeopleCount] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from('tables').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setTables(data || [])
    } catch (err: any) {
      toast.error("Маълумотларни юклашда хатолик юз берди")
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
  }

  const resetForm = () => {
    setCustomerName('')
    setPhone('')
    setPeopleCount('')
    setComment('')
    setDate(new Date())
    setStartTime(setMinutes(setHours(new Date(), 12), 0))
    setEndTime(setMinutes(setHours(new Date(), 14), 0))
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
    if (!customerName.trim() || !phone.trim() || !peopleCount || !date || !startTime || !endTime) {
      toast.error('Илтимос, барча майдонларни тўлдиринг')
      return
    }
    if (parseInt(peopleCount) > (selectedTable?.capacity || 0)) {
      toast.error(`Максимал сиғим: ${selectedTable?.capacity} киши`)
      return
    }
    if (parseInt(peopleCount) < 1) {
      toast.error('Одамлар сони камида 1 та бўлиши керак')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reservations').insert([{
        table_id: selectedTable?.id,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        reservation_date: format(date, 'yyyy-MM-dd'),
        start_time: format(startTime, 'HH:mm:ss'),
        end_time: format(endTime, 'HH:mm:ss'),
        people_count: parseInt(peopleCount),
        comment: comment.trim(),
      }])
      if (error) throw error
      celebrateBooking()
      setIsSheetOpen(false)
      toast.success('Муваффақиятли брон қилинди! 🎉')
      resetForm()
    } catch (err: any) {
      toast.error(err.message || "Хатолик юз берди")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn("min-h-screen font-sans antialiased selection:bg-red-500/20 overflow-x-hidden relative", isDark ? "bg-[#0A0F1E] text-gray-50" : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900")}>
      <Toaster position="top-center" toastOptions={{ duration: 4000, className: cn("backdrop-blur-2xl border shadow-2xl", isDark ? "bg-slate-900/90 text-white border-white/10" : "bg-white/90 text-gray-900 border-gray-200/50"), style: { padding: '16px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: 500 }, success: { iconTheme: { primary: '#DC2626', secondary: '#ffffff' }}}} />

      {isDark && (
        <>
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-20 md:mb-28">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="inline-flex items-center gap-2 mb-8">
            <div className={cn("relative px-6 py-2.5 rounded-full border backdrop-blur-xl overflow-hidden group cursor-default", isDark ? "bg-gradient-to-r from-red-950/40 to-red-900/40 border-red-500/20" : "bg-gradient-to-r from-red-50/80 to-red-100/80 border-red-200/50")}>
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", isDark ? "bg-gradient-to-r from-red-500/10 to-transparent" : "bg-gradient-to-r from-red-200/30 to-transparent")} />
              <div className="relative flex items-center gap-2">
                <Sparkles className={cn("w-4 h-4", isDark ? "text-red-400" : "text-red-600")} />
                <span className={cn("text-xs font-bold tracking-[0.2em] uppercase", isDark ? "text-red-300" : "text-red-700")}>Exclusive Experiences</span>
              </div>
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className={cn("text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.03em] mb-6 bg-clip-text text-transparent", isDark ? "bg-gradient-to-b from-white via-gray-100 to-gray-400" : "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600")} style={{ lineHeight: '0.95', textShadow: isDark ? '0 0 80px rgba(239, 68, 68, 0.15)' : 'none' }}>Luxury<br />Spaces</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className={cn("text-base md:text-lg max-w-2xl mx-auto font-light tracking-wide", isDark ? "text-gray-400" : "text-gray-600")}>Премиум хоналарни брон қилинг ва ўз тадбирингизни мукаммал қилинг</motion.p>
        </motion.header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => <LuxurySkeleton key={i} isDark={isDark} />)}
          </div>
        ) : tables.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className={cn("flex flex-col items-center justify-center min-h-[500px] rounded-3xl border backdrop-blur-xl", isDark ? "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-white/5" : "bg-gradient-to-br from-white/50 to-gray-50/50 border-gray-200/50")}>
            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6", isDark ? "bg-red-950/30" : "bg-red-50")}><MapPin className={cn("w-10 h-10", isDark ? "text-red-400" : "text-red-600")} /></div>
            <h3 className={cn("text-2xl font-bold mb-2", isDark ? "text-gray-200" : "text-gray-800")}>Ҳозирча хоналар мавжуд эмас</h3>
            <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>Тез орада янги премиум майдонлар қўшилади</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {tables.map((table, index) => (
                <motion.article key={table.id} custom={index} variants={cardVariants} initial="hidden" animate="visible" exit="hidden" whileHover="hover" onClick={() => handleCardClick(table)} className={cn("group relative rounded-3xl border backdrop-blur-xl cursor-pointer overflow-hidden transform-gpu transition-all duration-500", isDark ? "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-white/5 hover:border-red-500/30" : "bg-gradient-to-br from-white/90 via-gray-50/90 to-white/90 border-gray-200/50 hover:border-red-300/50", "hover:shadow-2xl", isDark && "hover:shadow-red-900/20")}>
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", isDark && "bg-gradient-to-br from-red-500/5 via-transparent to-transparent")} />
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <motion.img src={table.image_url} alt={table.name} className="w-full h-full object-cover" initial={{ scale: 1 }} whileHover={{ scale: 1.08 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                    <div className={cn("absolute inset-0 bg-gradient-to-t opacity-60 group-hover:opacity-80 transition-opacity duration-500", isDark ? "from-slate-900 via-slate-900/40 to-transparent" : "from-gray-900 via-gray-900/30 to-transparent")} />
                    {table.is_available === false && (
                      <div className="absolute top-4 right-4">
                        <div className={cn("px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl border", isDark ? "bg-red-950/80 border-red-500/30 text-red-300" : "bg-red-100/90 border-red-300/50 text-red-700")}>Банд</div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-end justify-between">
                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border", isDark ? "bg-slate-950/60 border-white/10" : "bg-white/80 border-gray-200/50")}>
                          <Users className={cn("w-4 h-4", isDark ? "text-red-400" : "text-red-600")} />
                          <span className={cn("text-sm font-semibold", isDark ? "text-gray-200" : "text-gray-800")}>{table.capacity}</span>
                        </div>
                        <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }} className={cn("w-10 h-10 rounded-xl backdrop-blur-xl border flex items-center justify-center", isDark ? "bg-red-950/60 border-red-500/30" : "bg-red-100/80 border-red-300/50")}>
                          <ChevronRight className={cn("w-5 h-5", isDark ? "text-red-400" : "text-red-600")} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-6">
                    <h3 className={cn("text-xl font-bold mb-3 line-clamp-1 transition-colors", isDark ? "text-gray-100 group-hover:text-red-400" : "text-gray-900 group-hover:text-red-600")}>{table.name}</h3>
                    {table.description && <p className={cn("text-sm line-clamp-2 mb-4 leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>{table.description}</p>}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      {table.type && <div className={cn("text-xs font-bold tracking-wider uppercase", isDark ? "text-red-400" : "text-red-600")}>{table.type}</div>}
                      <div className="text-right ml-auto">
                        <div className={cn("text-lg font-black", isDark ? "text-gray-100" : "text-gray-900")}>{Number(table.price_per_hour).toLocaleString()}<span className={cn("text-xs font-medium ml-1", isDark ? "text-gray-500" : "text-gray-500")}>сўм</span></div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className={cn("w-full sm:max-w-2xl p-0 overflow-y-auto border-0", isDark ? "bg-gradient-to-b from-[#0A0F1E] to-[#111827]" : "bg-white")} aria-describedby={undefined}>
          <SheetTitle className="sr-only">Брон қилиш: {selectedTable?.name}</SheetTitle>
          {selectedTable && (
            <div className="flex flex-col min-h-full">
              <div className="relative h-80 w-full overflow-hidden">
                <img src={selectedTable.image_url} alt={selectedTable.name} className="w-full h-full object-cover" />
                <div className={cn("absolute inset-0 bg-gradient-to-t", isDark ? "from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" : "from-white via-white/80 to-transparent")} />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  {selectedTable.type && (
                    <div className="mb-4">
                      <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border", isDark ? "bg-red-950/60 border-red-500/30 text-red-300" : "bg-red-100/90 border-red-300/50 text-red-700")}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold tracking-wider uppercase">{selectedTable.type}</span>
                      </div>
                    </div>
                  )}
                  <h2 className={cn("text-4xl md:text-5xl font-black tracking-tight mb-3", isDark ? "text-white" : "text-gray-900")}>{selectedTable.name}</h2>
                  {selectedTable.description && <p className={cn("text-base max-w-xl leading-relaxed", isDark ? "text-gray-300" : "text-gray-700")}>{selectedTable.description}</p>}
                </div>
              </div>
              <div className="flex-1 p-8 space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className={cn("p-6 rounded-2xl border backdrop-blur-xl", isDark ? "bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-white/5" : "bg-gradient-to-br from-gray-50 to-white border-gray-200/50")}>
                    <Users className={cn("w-6 h-6 mb-3", isDark ? "text-red-400" : "text-red-600")} />
                    <div className={cn("text-xs font-bold uppercase tracking-wider mb-2", isDark ? "text-gray-500" : "text-gray-600")}>Сиғим</div>
                    <div className={cn("text-3xl font-black", isDark ? "text-white" : "text-gray-900")}>{selectedTable.capacity}</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className={cn("p-6 rounded-2xl border backdrop-blur-xl", isDark ? "bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-white/5" : "bg-gradient-to-br from-gray-50 to-white border-gray-200/50")}>
                    <Sparkles className={cn("w-6 h-6 mb-3", isDark ? "text-red-400" : "text-red-600")} />
                    <div className={cn("text-xs font-bold uppercase tracking-wider mb-2", isDark ? "text-gray-500" : "text-gray-600")}>Соатлик</div>
                    <div className={cn("text-3xl font-black", isDark ? "text-white" : "text-gray-900")}>{Number(selectedTable.price_per_hour).toLocaleString()}<span className="text-base font-medium ml-1">сўм</span></div>
                  </motion.div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-5">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.15em]", isDark ? "text-red-400" : "text-red-600")}>Сана ва Вақт</Label>
                    <div className="relative">
                      <Calendar className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10", isDark ? "text-gray-500" : "text-gray-400")} />
                      <DatePicker selected={date} onChange={(d) => setDate(d)} minDate={new Date()} dateFormat="dd MMMM yyyy" className={cn("w-full h-14 pl-12 pr-4 rounded-xl border text-center font-medium transition-all", isDark ? "bg-slate-900/60 border-white/10 text-white hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 hover:bg-white focus:bg-white focus:border-red-300")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={cn("text-xs font-semibold uppercase tracking-wide", isDark ? "text-gray-400" : "text-gray-600")}>Бошланиш</label>
                        <div className="relative">
                          <Clock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", isDark ? "text-gray-500" : "text-gray-400")} />
                          <DatePicker selected={startTime} onChange={(t) => setStartTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className={cn("w-full h-12 pl-10 pr-3 rounded-xl border text-center font-mono transition-all", isDark ? "bg-slate-900/60 border-white/10 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 hover:bg-white focus:bg-white focus:border-red-300")} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-xs font-semibold uppercase tracking-wide", isDark ? "text-gray-400" : "text-gray-600")}>Тугаш</label>
                        <div className="relative">
                          <Clock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", isDark ? "text-gray-500" : "text-gray-400")} />
                          <DatePicker selected={endTime} onChange={(t) => setEndTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className={cn("w-full h-12 pl-10 pr-3 rounded-xl border text-center font-mono transition-all", isDark ? "bg-slate-900/60 border-white/10 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 hover:bg-white focus:bg-white focus:border-red-300")} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <Label className={cn("text-xs font-black uppercase tracking-[0.15em]", isDark ? "text-red-400" : "text-red-600")}>Маълумотларингиз</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none", isDark ? "text-gray-500 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-600")} />
                        <Input placeholder="Исмингиз" value={customerName} onChange={e => setCustomerName(e.target.value)} className={cn("h-14 pl-12 rounded-xl border transition-all", isDark ? "bg-slate-900/60 border-white/10 text-white placeholder:text-gray-500 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 placeholder:text-gray-400 hover:bg-white focus:bg-white focus:border-red-300")} />
                      </div>
                      <div className="relative group">
                        <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none", isDark ? "text-gray-500 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-600")} />
                        <Input placeholder="+998 (__) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} className={cn("h-14 pl-12 rounded-xl border transition-all", isDark ? "bg-slate-900/60 border-white/10 text-white placeholder:text-gray-500 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 placeholder:text-gray-400 hover:bg-white focus:bg-white focus:border-red-300")} />
                      </div>
                    </div>
                    <div className="relative group">
                      <Users className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none", isDark ? "text-gray-500 group-hover:text-red-400" : "text-gray-400 group-hover:text-red-600")} />
                      <Input type="number" placeholder={`Одамлар сони (Максимал: ${selectedTable.capacity})`} value={peopleCount} onChange={e => setPeopleCount(e.target.value)} max={selectedTable.capacity} min={1} className={cn("h-14 pl-12 rounded-xl border transition-all", isDark ? "bg-slate-900/60 border-white/10 text-white placeholder:text-gray-500 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 placeholder:text-gray-400 hover:bg-white focus:bg-white focus:border-red-300")} />
                    </div>
                    <Textarea placeholder="Қўшимча изоҳ (ихтиёрий)" value={comment} onChange={e => setComment(e.target.value)} className={cn("rounded-xl min-h-[120px] resize-none border transition-all", isDark ? "bg-slate-900/60 border-white/10 text-white placeholder:text-gray-500 hover:bg-slate-900 focus:bg-slate-900 focus:border-red-500/30" : "bg-gray-50 border-gray-200 placeholder:text-gray-400 hover:bg-white focus:bg-white focus:border-red-300")} />
                  </div>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button onClick={handleSubmit} disabled={submitting} className={cn("w-full h-16 rounded-2xl font-black text-lg tracking-wide transition-all shadow-2xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white border-0 relative overflow-hidden group", isDark ? "shadow-red-900/30" : "shadow-red-600/20", submitting && "opacity-70 cursor-not-allowed")}>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <span className="relative flex items-center justify-center gap-3">{submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Юкланмоқда...</> : <><Sparkles className="w-5 h-5" />БРОН ҚИЛИШ</>}</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        .react-datepicker-wrapper,.react-datepicker__input-container{width:100%;display:block}
        .react-datepicker{font-family:inherit;border:1px solid ${isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'};background:${isDark?'#1e293b':'#ffffff'};border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden}
        .react-datepicker__triangle{display:none}
        .react-datepicker__header{background:${isDark?'#0f172a':'#f8fafc'};border-bottom:1px solid ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'};border-radius:16px 16px 0 0;padding:16px}
        .react-datepicker__current-month,.react-datepicker__day-name{color:${isDark?'#ffffff':'#000000'};font-weight:600}
        .react-datepicker__day{color:${isDark?'#e2e8f0':'#1e293b'};border-radius:10px;margin:2px;transition:all 0.2s;font-weight:500}
        .react-datepicker__day:hover{background:${isDark?'rgba(239,68,68,0.2)':'rgba(239,68,68,0.1)'};transform:scale(1.05)}
        .react-datepicker__day--selected,.react-datepicker__day--keyboard-selected{background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%)!important;color:white!important;font-weight:700;transform:scale(1.05);box-shadow:0 4px 12px rgba(239,68,68,0.3)}
        .react-datepicker__day--disabled{color:${isDark?'rgba(226,232,240,0.3)':'rgba(30,41,59,0.3)'}}
        .react-datepicker__time-container{border-left:1px solid ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'};background:${isDark?'#1e293b':'#ffffff'}}
        .react-datepicker__time,.react-datepicker__time-box{background:${isDark?'#1e293b':'#ffffff'}}
        .react-datepicker__time-list-item{color:${isDark?'#e2e8f0':'#1e293b'};transition:all 0.2s;padding:8px;border-radius:8px;margin:2px 4px}
        .react-datepicker__time-list-item:hover{background:${isDark?'rgba(239,68,68,0.2)':'rgba(239,68,68,0.1)'}!important}
        .react-datepicker__time-list-item--selected{background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%)!important;color:white!important;font-weight:700}
        .react-datepicker__navigation{top:18px}
        .react-datepicker__navigation-icon::before{border-color:${isDark?'#ef4444':'#dc2626'};border-width:2px 2px 0 0}
        @media(max-width:640px){.react-datepicker{font-size:14px}}
      `}</style>
    </div>
  )
}