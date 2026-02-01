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
import {
	CheckCircle2,
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
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { submitOrder } from './actions'

export default function ProfessionalCallCenter() {
  // 1. Auth Guard
  const { loading: authLoading } = useAuthGuard({
    allowRoles: ['admin', 'operator'],
  })

  // 2. State-lar
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Forma state-lari
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
  const [address, setAddress] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])

  // 3. Effektlar
  useEffect(() => {
    fetchItems()
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

  // --- TUZATISH 1: TELEFON INPUTI UCHUN FILTER ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Faqat raqamlar va boshidagi "+" belgisiga ruxsat berish, harflarni o'chirib tashlash
    const cleaned = value.replace(/[^\d+]/g, '')
    // + belgisi faqat boshida bo'lishi kerak
    const filteredValue = cleaned.startsWith('+') 
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setPhone(filteredValue)
  }

  // 4. Savatcha mantiig'i
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

  // --- TUZATISH 2: BUYURTMA BERISH MANTIG'I (PAYLOAD) ---
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

  if (authLoading || loading)
    return (
      <div className='h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950'>
        <Loader2 className='animate-spin text-red-500' size={40} />
      </div>
    )

  return (
    <div className='min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50'>
      <header className='h-20 border-b bg-white dark:bg-slate-900 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='bg-red-500 p-2.5 rounded-xl shadow-lg shadow-red-500/20'>
            <ShoppingBag className='text-white' size={24} />
          </div>
          <div>
            <h1 className='font-black text-xl tracking-tight leading-none'>CALL-CENTER PANEL</h1>
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
            <LogOut size={20} /> CHIQUV
          </Button>
        </div>
      </header>

      <main className='max-w-[1800px] mx-auto p-8 grid grid-cols-12 gap-8'>
        <div className='col-span-8 space-y-6'>
          <div className='relative group'>
            <Search className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors' size={22} />
            <input
              type='text'
              placeholder='Taom yoki ichimlik qidirish...'
              className='w-full h-16 pl-14 pr-6 rounded-[1.25rem] bg-white dark:bg-slate-900 border-none shadow-sm text-lg font-medium focus:ring-2 focus:ring-red-500/10 transition-all outline-none'
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='space-y-10'>
            {CATEGORIES.map(category => {
              const filteredItems = items.filter(i => i.category === category.id && i.name.toLowerCase().includes(searchTerm.toLowerCase()))
              if (filteredItems.length === 0) return null
              return (
                <section key={category.id}>
                  <div className='flex items-center gap-4 mb-6'>
                    <span className='text-2xl'>{category.icon}</span>
                    <h2 className='font-black text-sm uppercase tracking-[0.2em] text-slate-400'>{category.name}</h2>
                    <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1' />
                  </div>
                  <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredItems.map(item => (
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
        </div>

        <div className='col-span-4'>
          <Card className='rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 sticky top-28 overflow-hidden'>
            <CardHeader className='p-8 pb-4'>
              <CardTitle className='text-xl font-black flex items-center justify-between'>
                YANGI BUYURTMA <span className='text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-full animate-pulse'>LIVE</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='p-8 space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Mijoz</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder='Ismi' className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Tel</Label>
                  {/* TUZATILGAN INPUT */}
                  <Input 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    placeholder='+998' 
                    className='rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold' 
                  />
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
                <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}