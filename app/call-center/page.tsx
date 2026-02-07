'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useAuthGuard } from '@/lib/useAuth'
import { cn } from '@/lib/utils'
import { format, setHours, setMinutes } from 'date-fns'
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  LogOut,
  MapPin,
  Minus,
  Moon,
  Plus,
  Search,
  ShoppingBag,
  Sun,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { submitOrder } from './actions'

interface Table {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
}

type ActiveTab = 'meals' | 'rooms'

export default function UniversalCallCenterPanel() {
  // 1. Auth Guard
  const { loading: authLoading } = useAuthGuard({
    allowRoles: ['admin', 'operator'],
  })

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('meals')

  // 3. Taomlar State-lari
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Taomlar Forma state-lari
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
  const [address, setAddress] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])

  // 4. Xonalar State-lari
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [roomCustomerName, setRoomCustomerName] = useState('')
  const [roomPhone, setRoomPhone] = useState('')
  const [date, setDate] = useState<Date | null>(new Date())
  const [startTime, setStartTime] = useState<Date | null>(setMinutes(setHours(new Date(), 12), 0))
  const [endTime, setEndTime] = useState<Date | null>(setMinutes(setHours(new Date(), 14), 0))
  const [roomSubmitting, setRoomSubmitting] = useState(false)

  // 5. Effektlar
  useEffect(() => {
    fetchItems()
    fetchTables()
    const isDark = localStorage.getItem('theme') === 'dark'
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('category')
      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      toast.error('Menyuni yuklashda xatolik: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTables(data || [])
    } catch (err: any) {
      toast.error('Xonalarni yuklashda xatolik: ' + err.message)
    }
  }

  // Telefon inputi uchun filter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+]/g, '')
    const filteredValue = cleaned.startsWith('+') 
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setPhone(filteredValue)
  }

  const handleRoomPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+]/g, '')
    const filteredValue = cleaned.startsWith('+') 
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setRoomPhone(filteredValue)
  }

  // 6. Taomlar - Savatcha mantiig'i
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i =>
          i.item.id === itemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter(i => i.quantity > 0),
    )
  }

  const totalSum = useMemo(
    () =>
      cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
    [cart],
  )

  // Taomlar - Buyurtma yuborish
  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh!")
    if (!customerName || !phone)
      return toast.error("Mijoz ma'lumotlarini to'ldiring")
    if (mode === 'delivery' && !address) return toast.error('Manzilni kiriting')
    if (mode === 'dine-in' && !tableNumber)
      return toast.error('Stol raqamini kiriting')

    setSubmitting(true)
    try {
      const result = await submitOrder({
        customer_name: customerName,
        phone,
        type: mode === 'delivery' ? 'delivery' : 'dine_in',
        delivery_address: mode === 'delivery' ? address : `Stol: ${tableNumber}`,
        items: cart.map(c => ({
          id: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
        })),
        total_amount: totalSum,
        status: 'yangi'
      })

      if (result.success) {
        toast.success('Buyurtma muvaffaqiyatli qabul qilindi!')
        setCart([]); setCustomerName(''); setPhone(''); setAddress(''); setTableNumber('');
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Buyurtmani yuborishda xatolik yuz berdi'
      toast.error(errorMessage.includes('payment_method') 
        ? 'Bazada xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.' 
        : errorMessage.includes('Could not find') 
        ? 'Bazada xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
        : errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // 7. Xonalar - Xona tanlash
  const handleSelectTable = (table: Table) => {
    if (!table.is_available) {
      toast.error('Bu xona band!')
      return
    }
    setSelectedTable(table)
    toast.success(`${table.name} tanlandi`)
  }

  // Xonalar - Formani tozalash
  const resetRoomForm = () => {
    setSelectedTable(null)
    setRoomCustomerName('')
    setRoomPhone('')
    setDate(new Date())
    setStartTime(setMinutes(setHours(new Date(), 12), 0))
    setEndTime(setMinutes(setHours(new Date(), 14), 0))
  }

  // Xonalar - Bronni saqlash
  const handleRoomSubmit = async () => {
    if (!selectedTable) return toast.error('Xona tanlanmagan!')
    if (!roomCustomerName || !roomPhone) return toast.error("Mijoz ma'lumotlarini to'ldiring")
    if (!date || !startTime || !endTime) return toast.error("Sana va vaqtni to'ldiring")

    setRoomSubmitting(true)
    try {
      const { error } = await supabase.from('table_reservations').insert([{
        table_id: selectedTable.id,
        customer_name: roomCustomerName.trim(),
        phone: roomPhone.trim(),
        reservation_date: format(date, 'yyyy-MM-dd'),
        start_time: format(startTime, 'HH:mm:ss'),
        end_time: format(endTime, 'HH:mm:ss'),
      }])

      if (error) throw error
      
      toast.success('Bron muvaffaqiyatli saqlandi!')
      resetRoomForm()
      fetchTables()
    } catch (err: any) {
      toast.error(err.message || 'Bronni saqlashda xatolik yuz berdi')
    } finally {
      setRoomSubmitting(false)
    }
  }

  // Filtrlangan ma'lumotlar
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading)
    return (
      <div className='h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950'>
        <Loader2 className='animate-spin text-red-500' size={40} />
      </div>
    )

  return (
    <div className='min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50'>
      {/* HEADER */}
      <header className='h-20 border-b bg-white dark:bg-slate-900 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='bg-red-500 p-2.5 rounded-xl shadow-lg shadow-red-500/20'>
            <ShoppingBag className='text-white' size={24} />
          </div>
          <div>
            <h1 className='font-black text-xl tracking-tight leading-none'>UNIVERSAL CALL-CENTER</h1>
            <span className='text-[10px] text-emerald-500 font-bold flex items-center gap-1'>
              <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse' /> ONLINE MONITORING
            </span>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <button onClick={() => setDarkMode(!darkMode)} className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors'>
            {darkMode ? <Sun className='text-yellow-500' /> : <Moon />}
          </button>
          <Button variant='ghost' className='font-bold gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500' onClick={() => supabase.auth.signOut()}>
            <LogOut size={20} /> CHIQISH
          </Button>
        </div>
      </header>

      <main className='max-w-[1800px] mx-auto p-8 grid grid-cols-12 gap-8'>
        {/* CHAP TOMON - KONTENT */}
        <div className='col-span-8 space-y-6'>
          {/* TABS NAVIGATION */}
          <div className='flex gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-sm'>
            <button
              onClick={() => setActiveTab('meals')}
              className={cn(
                'flex-1 h-14 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'meals'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <UtensilsCrossed size={20} />
              TAOMLAR
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={cn(
                'flex-1 h-14 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'rooms'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <Building2 size={20} />
              XONALAR
            </button>
          </div>

          {/* QIDIRUV */}
          <div className='relative group'>
            <Search className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors' size={22} />
            <input
              type='text'
              placeholder={activeTab === 'meals' ? 'Taom yoki ichimlik qidirish...' : 'Xona yoki stol qidirish...'}
              className='w-full h-16 pl-14 pr-6 rounded-[1.25rem] bg-white dark:bg-slate-900 border-none shadow-sm text-lg font-medium focus:ring-2 focus:ring-red-500/10 transition-all outline-none'
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>

          {/* TAOMLAR BO'LIMI */}
          {activeTab === 'meals' && (
            <div className='space-y-10'>
              {CATEGORIES.map(category => {
                const categoryItems = filteredItems.filter(i => i.category === category.id)
                if (categoryItems.length === 0) return null
                return (
                  <section key={category.id}>
                    <div className='flex items-center gap-4 mb-6'>
                      <span className='text-2xl'>{category.icon}</span>
                      <h2 className='font-black text-sm uppercase tracking-[0.2em] text-slate-400'>{category.name}</h2>
                      <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1' />
                    </div>
                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                      {categoryItems.map(item => (
                        <button key={item.id} onClick={() => addToCart(item)} className='p-5 bg-white dark:bg-slate-900 rounded-3xl border border-transparent hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5 transition-all text-left flex items-center justify-between group active:scale-[0.98]'>
                          <div className='space-y-1'>
                            <p className='font-bold text-slate-800 dark:text-slate-200'>{item.name}</p>
                            <Price value={item.price} className='text-sm font-black text-slate-400' />
                          </div>
                          <div className='w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all'>
                            <Plus size={20} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

{/* XONALAR BO'LIMI - Taomlar kartasi uslubida */}
{activeTab === 'rooms' && (
  <div className='space-y-10'>
    <section>
      <div className='flex items-center gap-4 mb-6'>
        <span className='text-2xl'>🏠</span>
        <h2 className='font-black text-sm uppercase tracking-[0.2em] text-slate-400'>BARCHA XONALAR</h2>
        <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1' />
      </div>
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredTables.length === 0 ? (
          <div className='col-span-full text-center py-20 text-slate-400 font-bold'>
            Hech qanday xona topilmadi
          </div>
        ) : (
          filteredTables.map(table => (
            <button
              key={table.id}
              onClick={() => handleSelectTable(table)}
              disabled={!table.is_available}
              className={cn(
                'p-5 bg-white dark:bg-slate-900 rounded-3xl border transition-all text-left flex items-center justify-between group active:scale-[0.98]',
                selectedTable?.id === table.id
                  ? 'border-red-500/70 shadow-lg shadow-red-500/10'
                  : table.is_available
                  ? 'border-transparent hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5'
                  : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
              )}
            >
              {/* CHAP TOMON - RASM */}
              <div className='flex items-center gap-4 flex-1'>
                <div className='relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800'>
                  <img 
                    src={table.image_url} 
                    alt={table.name} 
                    className='w-full h-full object-cover'
                  />
                  {/* HOLAT INDIKATORI */}
                  <div className={cn(
                    'absolute top-1 right-1 w-2 h-2 rounded-full',
                    table.is_available ? 'bg-emerald-500' : 'bg-slate-400'
                  )} />
                </div>

                {/* O'RTA - MA'LUMOTLAR */}
                <div className='space-y-1 flex-1 min-w-0'>
                  <p className='font-bold text-slate-800 dark:text-slate-200 truncate'>
                    {table.name}
                  </p>
                  <div className='flex items-center gap-2 text-xs text-slate-400'>
                    <span className='flex items-center gap-1'>
                      <Users size={12} />
                      {table.capacity} kishi
                    </span>
                    <span>|</span>
                    <span className='font-black text-slate-500 dark:text-slate-400'>
                      {Number(table.price_per_hour).toLocaleString()} so'm/soat
                    </span>
                  </div>
                  {/* HOLAT MATNI */}
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-black uppercase',
                    table.is_available ? 'text-emerald-500' : 'text-slate-400'
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      table.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    )} />
                    {table.is_available ? 'BO\'SH' : 'BAND'}
                  </span>
                </div>
              </div>

              {/* O'NG TOMON - TUGMA */}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
                selectedTable?.id === table.id
                  ? 'bg-red-500 text-white'
                  : table.is_available
                  ? 'bg-slate-50 dark:bg-slate-800 group-hover:bg-red-500 group-hover:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
              )}>
                {selectedTable?.id === table.id ? (
                  <CheckCircle2 size={20} />
                ) : table.is_available ? (
                  <Plus size={20} />
                ) : (
                  <Minus size={20} />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  </div>
)}
        </div>

        {/* O'NG TOMON - FORMA */}
        <div className='col-span-4'>
          <Card className='rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 sticky top-28 overflow-hidden'>
            <CardHeader className='p-8 pb-4'>
              <CardTitle className='text-xl font-black flex items-center justify-between'>
                {activeTab === 'meals' ? 'YANGI BUYURTMA' : 'YANGI BRON'}
                <span className='text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-full animate-pulse'>LIVE</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='p-8 space-y-6'>
              
              {/* TAOMLAR FORMASI */}
              {activeTab === 'meals' && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Mijoz</Label>
                      <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder='Ismi' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Tel</Label>
                      <Input value={phone} onChange={handlePhoneChange} placeholder='+998' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                    </div>
                  </div>

                  <div className='flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl gap-1'>
                    <button onClick={() => setMode('delivery')} className={cn('flex-1 h-12 rounded-[0.8rem] text-xs font-black transition-all flex items-center justify-center gap-2', mode === 'delivery' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-400')}>
                      <MapPin size={16} /> YETKAZISH
                    </button>
                    <button onClick={() => setMode('dine-in')} className={cn('flex-1 h-12 rounded-[0.8rem] text-xs font-black transition-all flex items-center justify-center gap-2', mode === 'dine-in' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-400')}>
                      <Hash size={16} /> ZALDA
                    </button>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>{mode === 'delivery' ? 'Manzil' : 'Stol raqami'}</Label>
                    {mode === 'delivery' ? (
                      <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder='Manzilni batafsil yozing...' className='rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px]' />
                    ) : (
                      <Input value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder='Masalan: 4' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                    )}
                  </div>

                  <div className='pt-6 border-t dark:border-slate-800'>
                    <h4 className='text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest'>Savatcha ({cart.length})</h4>
                    <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                      {cart.length === 0 ? (
                        <div className='text-center py-10 text-slate-300 font-bold'>Hali taom tanlanmadi</div>
                      ) : (
                        cart.map(({ item, quantity }) => (
                          <div key={item.id} className='flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl'>
                            <div className='flex-1'>
                              <p className='font-bold text-sm'>{item.name}</p>
                              <Price value={item.price * quantity} className='text-xs text-red-500 font-black' />
                            </div>
                            <div className='flex items-center bg-white dark:bg-slate-700 rounded-xl p-1 gap-3 border dark:border-slate-600'>
                              <button onClick={() => updateQuantity(item.id, -1)} className='p-1 hover:text-red-500'><Minus size={14} /></button>
                              <span className='font-black text-sm w-4 text-center'>{quantity}</span>
                              <button onClick={() => addToCart(item)} className='p-1 hover:text-red-500'><Plus size={14} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className='pt-6 border-t dark:border-slate-800 space-y-4'>
                    <div className='flex justify-between items-end'>
                      <div>
                        <p className='text-[10px] font-black text-slate-400 uppercase'>Umumiy hisob</p>
                        <Price value={totalSum} className='text-3xl font-black tracking-tighter' />
                      </div>
                      {cart.length > 0 && <span className='text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-md'>TAYYOR</span>}
                    </div>
                    <Button className='w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-red-500/20' disabled={submitting || cart.length === 0} onClick={handleSubmit}>
                      {submitting ? <Loader2 className='animate-spin' /> : <><CheckCircle2 className='mr-2' /> BUYURTMANI YUBORISH</>}
                    </Button>
                  </div>
                </>
              )}

              {/* XONALAR FORMASI */}
              {activeTab === 'rooms' && (
                <>
                  {selectedTable && (
                    <div className='p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-200 dark:border-red-500/20'>
                      <div className='flex items-center gap-3'>
                        <div className='w-16 h-16 rounded-xl overflow-hidden'>
                          <img src={selectedTable.image_url} alt={selectedTable.name} className='w-full h-full object-cover' />
                        </div>
                        <div className='flex-1'>
                          <p className='font-black text-sm text-slate-800 dark:text-slate-200'>{selectedTable.name}</p>
                          <p className='text-xs text-slate-500 flex items-center gap-1'>
                            <Users size={12} /> {selectedTable.capacity} kishi · {Number(selectedTable.price_per_hour).toLocaleString()} so'm/soat
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Mijoz ismi</Label>
                      <Input value={roomCustomerName} onChange={e => setRoomCustomerName(e.target.value)} placeholder='Ismi' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Telefon</Label>
                      <Input value={roomPhone} onChange={handleRoomPhoneChange} placeholder='+998' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <Label className='text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2'>
                      <Calendar size={12} /> SANA VA VAQT
                    </Label>
                    
                    <div className='space-y-3'>
                      <div className='relative'>
                        <Calendar className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10' size={18} />
                        <DatePicker selected={date} onChange={(d) => setDate(d)} className='w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500/20' dateFormat="dd/MM/yyyy" />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div className='relative'>
                          <Clock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10' size={16} />
                          <DatePicker selected={startTime} onChange={(t) => setStartTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className='w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500/20 text-sm' />
                        </div>
                        <div className='relative'>
                          <Clock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10' size={16} />
                          <DatePicker selected={endTime} onChange={(t) => setEndTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={30} dateFormat="HH:mm" className='w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500/20 text-sm' />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='pt-6 border-t dark:border-slate-800'>
                    <Button className='w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-red-500/20' disabled={roomSubmitting || !selectedTable} onClick={handleRoomSubmit}>
                      {roomSubmitting ? <Loader2 className='animate-spin' /> : <><CheckCircle2 className='mr-2' /> BRONNI SAQLASH</>}
                    </Button>
                    {!selectedTable && (
                      <p className='text-center text-xs text-slate-400 mt-3 font-medium'>Avval xona tanlang</p>
                    )}
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </main>

      {/* DATEPICKER STILLARI */}
      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { 
          font-family: inherit; 
          border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; 
          background: ${darkMode ? '#1e293b' : '#ffffff'}; 
          border-radius: 16px; 
          overflow: hidden; 
        }
        .react-datepicker__header { 
          background: ${darkMode ? '#0f172a' : '#f8fafc'}; 
          border-bottom: 1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; 
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { 
          color: ${darkMode ? '#e2e8f0' : '#1e293b'}; 
        }
        .react-datepicker__day--selected { 
          background: #ef4444 !important; 
          color: white !important; 
        }
        .react-datepicker__time-container { 
          border-left: 1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; 
        }
        .react-datepicker__time-list-item--selected { background: #ef4444 !important; }
      `}</style>
    </div>
  )
}