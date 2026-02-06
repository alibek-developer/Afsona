'use client'

import { supabase } from '@/lib/supabaseClient'
import confetti from 'canvas-confetti'
import { format, setHours, setMinutes } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Hash, Loader2, Phone, Star, User, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast, Toaster } from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

// Supabase Table Interface
interface TableData {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  description: string
  image_url: string
  is_available: boolean
  type: string
}

export default function XonaBuyurtmaPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableData[]>([])
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Form State
  const [date, setDate] = useState<Date | null>(new Date())
  const [startTime, setStartTime] = useState<Date | null>(setMinutes(setHours(new Date(), 12), 0))
  const [endTime, setEndTime] = useState<Date | null>(setMinutes(setHours(new Date(), 14), 0))
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [peopleCount, setPeopleCount] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 1. MA'LUMOTLARNI YUKLASH (FETCH)
  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTables(data || [])
    } catch (err: any) {
      toast.error("Ma'lumotlarni yuklashda xatolik!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()

    // 2. REAL-TIME YANGILANISH
    const channel = supabase
      .channel('tables-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        fetchTables()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleCardClick = (table: TableData) => {
    setSelectedTable(table)
    setIsSheetOpen(true)
  }

  // 3. BRON QILISH (INSERT)
  const handleSubmit = async () => {
    if (!customerName || !phone || !peopleCount || !date || !startTime || !endTime) {
      toast.error('Barcha maydonlarni to‘ldiring!')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('reservations').insert([
        {
          table_id: selectedTable?.id,
          customer_name: customerName,
          phone: phone,
          reservation_date: format(date, 'yyyy-MM-dd'),
          start_time: format(startTime, 'HH:mm:ss'),
          end_time: format(endTime, 'HH:mm:ss'),
          people_count: parseInt(peopleCount),
          comment: comment,
        }
      ])

      if (error) throw error

      fireConfetti()
      setIsSheetOpen(false)
      toast.success("Muvaffaqiyatli band qilindi!")
      
      // Reset form
      setCustomerName(''); setPhone(''); setPeopleCount(''); setComment('')
    } catch (err: any) {
      toast.error("Xatolik yuz berdi: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fireConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ef4444', '#ffffff', '#000000'] });
  }

  // Styllar
  const containerClass = isDark 
    ? "min-h-screen text-red-50 font-sans selection:bg-red-600/30 overflow-x-hidden transition-colors duration-500"
    : "min-h-screen bg-white text-gray-900 font-sans selection:bg-red-200 overflow-x-hidden transition-colors duration-500"

  const cardClass = isDark
    ? "group relative bg-[#0F172A]/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden cursor-pointer flex flex-col h-full transform-gpu"
    : "group relative bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer flex flex-col h-full transform-gpu shadow-sm hover:shadow-xl"

  return (
    <div className={containerClass}>
      <Toaster position="top-center" />

      {/* Dark Mode Glows */}
      {isDark && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <h1 className={cn(
            "text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text uppercase italic",
            isDark ? "bg-gradient-to-b from-white via-red-200 to-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.6)]" : "bg-gradient-to-b from-gray-900 via-red-800 to-red-600"
          )}>
            Luxury Booking
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
            <p className="mt-4 animate-pulse text-red-500 font-bold uppercase tracking-widest">Yuklanmoqda...</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {tables.map((table) => (
                <motion.div
                  key={table.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className={cardClass}
                  onClick={() => handleCardClick(table)}
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <img src={table.image_url} alt={table.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10"><Users className="w-3 h-3 mr-1" /> {table.capacity} kishi</Badge>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-red-600 text-white font-bold">{Number(table.price_per_hour).toLocaleString()} so'm</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>{table.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{table.description}</p>
                    <div className="mt-4 flex justify-between items-center text-xs font-bold text-red-500">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3"/> PREMIUM</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className={cn("w-full sm:max-w-2xl p-0 overflow-y-auto", isDark ? "bg-[#050505] border-white/10 text-white" : "bg-white")}>
          {selectedTable && (
            <div className="flex flex-col">
              <div className="relative h-72 w-full">
                <img src={selectedTable.image_url} alt={selectedTable.name} className="w-full h-full object-cover" />
                <div className={cn("absolute inset-0 bg-gradient-to-t", isDark ? "from-[#050505]" : "from-white")} />
                <SheetClose className="absolute right-4 top-4 p-2 bg-black/50 rounded-full text-white border border-white/10"><X className="w-5 h-5"/></SheetClose>
                <div className="absolute bottom-6 left-8">
                   <Badge className="bg-red-600 mb-2">{selectedTable.type}</Badge>
                   <h2 className="text-4xl font-black">{selectedTable.name}</h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50")}>
                    <Users className="text-red-500 mb-1" />
                    <p className="text-xs text-gray-500 uppercase">Sig'im</p>
                    <p className="text-lg font-bold">{selectedTable.capacity} kishi</p>
                  </div>
                  <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50")}>
                    <Hash className="text-red-500 mb-1" />
                    <p className="text-xs text-gray-500 uppercase">Narx</p>
                    <p className="text-lg font-bold">{Number(selectedTable.price_per_hour).toLocaleString()} so'm</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-red-500 font-bold uppercase tracking-widest">Sana va Vaqt</Label>
                    <DatePicker selected={date} onChange={(d) => setDate(d)} minDate={new Date()} dateFormat="dd MMMM yyyy" className={cn("w-full p-4 rounded-xl border text-center font-mono text-lg", isDark ? "bg-black border-white/10 text-white" : "bg-white")} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <DatePicker selected={startTime} onChange={(t) => setStartTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className={cn("w-full p-3 rounded-xl border text-center font-mono", isDark ? "bg-white/5 border-white/10" : "bg-gray-50")} />
                      <DatePicker selected={endTime} onChange={(t) => setEndTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className={cn("w-full p-3 rounded-xl border text-center font-mono", isDark ? "bg-white/5 border-white/10" : "bg-gray-50")} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                        <Input placeholder="Ismingiz..." value={customerName} onChange={e => setCustomerName(e.target.value)} className={cn("pl-10 h-12 rounded-xl", isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50")} />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                        <Input placeholder="+998..." value={phone} onChange={e => setPhone(e.target.value)} className={cn("pl-10 h-12 rounded-xl", isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50")} />
                      </div>
                    </div>
                    <Input type="number" placeholder={`Odamlar soni (Maks: ${selectedTable.capacity})`} value={peopleCount} onChange={e => setPeopleCount(e.target.value)} className={cn("h-12 rounded-xl", isDark ? "bg-white/5 border-white/10" : "bg-gray-50")} />
                    <Textarea placeholder="Izoh..." value={comment} onChange={e => setComment(e.target.value)} className={cn("rounded-xl min-h-[100px]", isDark ? "bg-white/5 border-white/10" : "bg-gray-50")} />
                  </div>
                  
                  <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-8 rounded-2xl font-black text-xl hover:scale-[1.02] transition-all">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : "BRON QILISH"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}