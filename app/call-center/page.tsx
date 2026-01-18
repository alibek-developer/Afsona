'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import type { MenuItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { useAuthGuard } from '@/lib/useAuth'
import {
	CheckCircle2,
	Hash,
	Loader2,
	LogOut,
	MapPin,
	Minus,
	Plus,
	Search,
	ShoppingBag
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { submitOrder } from './actions'

export default function ProfessionalCallCenter() {
  const { loading: authLoading } = useAuthGuard({ allowRoles: ['admin', 'operator'] })
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
  const [address, setAddress] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase.from('menu_items').select('*').eq('available_on_website', true).order('category')
    if (!error) setItems(data || [])
    setLoading(false)
  }

  // TIZIMDAN CHIQISH MANTIQI
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Tizimdan chiqildi")
      window.location.href = '/login'
    } catch (error: any) {
      toast.error("Xatolik: " + error.message)
    }
  }

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.item.id === item.id)
    if (existing) {
      setCart(cart.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(i => i.item.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0))
  }

  const calculateTotal = () => cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("Savatcha bo'sh")
    if (!customerName || !phone) return toast.error("Mijoz ma'lumotlarini kiriting")
    setSubmitting(true)
    const orderData = {
      customer_name: customerName,
      customer_phone: phone,
      mode,
      delivery_address: mode === 'delivery' ? address : null,
      table_number: mode === 'dine-in' ? tableNumber : null,
      items: cart,
      total: calculateTotal(),
      payment_method: 'cash',
    }
    const result = await submitOrder(orderData)
    if (result.success) {
      toast.success('Buyurtma qabul qilindi!')
      setCustomerName(''); setPhone(''); setAddress(''); setTableNumber(''); setCart([]);
    } else {
      toast.error('Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-white font-sans"><Loader2 className="animate-spin text-red-500" /></div>

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased text-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 text-white">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">CALL-CENTER PANEL</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Online Monitoring</span>
              </div>
            </div>
          </div>
          
          {/* TO'G'RILANGAN CHIQISH TUGMASI */}
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="rounded-xl hover:bg-red-50 hover:text-red-500 font-black transition-all px-6 border border-transparent hover:border-red-100"
          >
            <LogOut className="h-5 w-5 mr-2" /> CHIQUV
          </Button>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-8 gap-8 grid grid-cols-12 h-[calc(100vh-100px)]">
        
        {/* LEFT: Menu Section */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Taom yoki ichimlik qidirish..." 
              className="w-full bg-white border-none h-16 pl-14 pr-6 rounded-2xl shadow-sm text-lg font-bold focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
            <div className="p-8 space-y-10">
              {CATEGORIES.map(category => {
                const catItems = items.filter(i => i.category === category.id && i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                if (catItems.length === 0) return null
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-sm">{category.name}</h3>
                      <div className="h-px bg-slate-100 flex-1 ml-4" />
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                      {catItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="group p-6 rounded-3xl border border-slate-50 bg-white hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/10 transition-all text-left relative overflow-hidden active:scale-95"
                        >
                          <div className="relative z-10">
                            <p className="font-black text-lg text-slate-800 mb-1 group-hover:text-red-600 transition-colors">{item.name}</p>
                            <Price value={item.price} className="text-sm font-black text-slate-400" />
                          </div>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                            <Plus size={24} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT: Order Form Section */}
        <div className="col-span-4 h-full">
          <Card className="h-full border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] flex flex-col bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-black flex justify-between items-center tracking-tighter">
                YANGI BUYURTMA
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black">LIVE</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8 flex-1 overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Mijoz</Label>
                    <Input 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ismi"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 font-black text-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Tel</Label>
                    <Input 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+998"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 font-black text-slate-700" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Xizmat</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setMode('delivery')}
                      className={`h-16 rounded-[1.25rem] border-2 flex items-center justify-center gap-2 font-black transition-all ${mode === 'delivery' ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-500/10' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <MapPin size={20} /> YETKAZISH
                    </button>
                    <button 
                      onClick={() => setMode('dine-in')}
                      className={`h-16 rounded-[1.25rem] border-2 flex items-center justify-center gap-2 font-black transition-all ${mode === 'dine-in' ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-500/10' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <Hash size={20} /> ZALDA
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">{mode === 'delivery' ? 'Manzil' : 'Stol'}</Label>
                  {mode === 'delivery' ? (
                    <Textarea 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Manzilni batafsil yozing..."
                      className="rounded-[1.25rem] bg-slate-50 border-transparent focus:bg-white focus:border-red-500 min-h-[100px] font-bold text-slate-700 p-4" 
                    />
                  ) : (
                    <Input 
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="Masalan: 5"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 font-black text-slate-700" 
                    />
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <Label className="text-xs font-black text-slate-400 uppercase block mb-6 tracking-[0.2em]">Savatcha</Label>
                <div className="space-y-4">
                  {cart.length === 0 && <p className="text-center text-slate-300 font-bold py-4">Hali taom tanlanmadi</p>}
                  {cart.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100/50 shadow-sm">
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">{item.name}</p>
                        <Price value={item.price * quantity} className="text-xs font-black text-red-500" />
                      </div>
                      <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1.5 gap-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus size={16}/></button>
                        <span className="w-10 text-center text-sm font-black">{quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1 hover:text-red-500 transition-colors"><Plus size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="p-8 pt-4 bg-white border-t border-slate-100">
              <div className="flex justify-between items-end mb-8 px-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Umumiy hisob</p>
                  <Price value={calculateTotal()} className="text-4xl font-black text-slate-900 tracking-tighter" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase">Tayyor</span>
                </div>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full h-20 bg-red-500 hover:bg-red-600 text-white rounded-[1.5rem] text-xl font-black shadow-2xl shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                BUYURTMANI YUBORISH
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}