'use client'

import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import {
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  Search,
  TableProperties,
  Truck,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { InteractiveMap } from '@/components/InteractiveMap'
import { MenuOrderSidebar } from '../components/MenuOrderSidebar'

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description?: string
  image_url?: string
  is_available: boolean
}

interface CartItem {
  item: MenuItem
  quantity: number
}

interface TableStatus {
  id: string
  table_number: string
  name: string
  is_available: boolean
  status: string
}

const fmt = (n: number) => n.toLocaleString('ru-RU')

const categoryEmojis: Record<string, string> = {
  salatlar: '🥗',
  shorvalar: '🍲',
  asosiy: '🍛',
  ichimliklar: '☕',
  nonlar: '🫓',
  desertlar: '🍰',
  default: '️',
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'delivery' | 'dine-in'>('delivery')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tables, setTables] = useState<TableStatus[]>([])

  useEffect(() => {
    fetchItems()
    fetchCategories()
    fetchTables()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      console.error('[call-center] Menu fetch error:', err)
      toast.error("Menyuni yuklashda xatolik: " + (err.message || "Noma'lum xato"))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('[call-center] Categories fetch error:', err)
    }
  }

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('id, table_number, name, is_available, status')
        .order('table_number', { ascending: true })

      if (error) throw error
      setTables(data || [])
    } catch (err) {
      console.error('[call-center] Tables fetch error:', err)
    }
  }

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
    () => cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
    [cart],
  )

  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh!")
    if (!customerName || !phone) return toast.error("Mijoz ma'lumotlarini to'ldiring")
    if (mode === 'delivery' && !address) return toast.error('Manzilni kiriting')
    if (mode === 'dine-in' && !tableNumber) return toast.error('Stol raqamini tanlang')

    setIsSubmitting(true)
    try {
      const orderData: any = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        type: mode === 'delivery' ? 'delivery' : 'dine-in',
        delivery_address: mode === 'delivery' ? address : `Stol: ${tableNumber}`,
        status: 'yangi',
        items: cart.map(c => ({
          id: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
        })),
        total_amount: totalSum,
        source: 'call-center',
      }

      if (mode === 'delivery') {
        orderData.landmark = landmark
        if (latitude && longitude) {
          orderData.latitude = latitude
          orderData.longitude = longitude
        }
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) throw error

      toast.success('Buyurtma muvaffaqiyatli qabul qilindi!')
      handleReset()
    } catch (err: any) {
      toast.error(err.message || 'Buyurtmani yuborishda xatolik')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCart([])
    setCustomerName('')
    setPhone('')
    setAddress('')
    setLandmark('')
    setLatitude(null)
    setLongitude(null)
    setTableNumber('')
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = !selectedCategory || item.category === selectedCategory
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [items, selectedCategory, searchTerm])

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {}
    filteredItems.forEach(item => {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [filteredItems])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* LEFT: MENU */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-5 gap-6 flex-wrap">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight">Menyu</h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              Taom va ichimliklarni tanlang
            </p>
          </div>
          <div className="relative w-64 max-w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Taom qidirish..."
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-zinc-200 placeholder:text-zinc-700 focus:border-red-500/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-[14px] transition ${
              selectedCategory === null
                ? 'bg-red-500 text-white font-bold'
                : 'bg-[#111] border border-white/8 text-zinc-500 hover:text-white'
            }`}
          >
            Hammasi
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-[14px] transition ${
                selectedCategory === cat.id
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-[#111] border border-white/8 text-zinc-500 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu items grouped by category */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            if (categoryItems.length === 0) return null
            const emoji = categoryEmojis[category.toLowerCase()] || categoryEmojis.default
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[18px]">{emoji}</span>
                  <h3 className="text-[16px] font-bold text-zinc-200">
                    {categories.find(c => c.id === category)?.name || category}
                  </h3>
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[12px] text-zinc-500">{categoryItems.length}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryItems.map(item => {
                    const inCart = cart.find(c => c.item.id === item.id)
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl p-4 border transition ${
                          inCart
                            ? 'bg-red-500/5 border-red-500/40'
                            : 'bg-[#0a0a0a] border-white/7 hover:border-red-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-[32px] leading-none">{emoji}</div>
                          {inCart && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0.8, 1.15, 1] }}
                              className="w-7 h-7 rounded-full bg-red-500 text-white font-bold text-[14px] flex items-center justify-center"
                            >
                              {inCart.quantity}
                            </motion.div>
                          )}
                        </div>
                        <div className="text-[14px] font-semibold text-zinc-100 mt-2">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-[14px] font-bold text-red-500 font-mono">
                            {fmt(item.price)}
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-lg border border-white/15 text-zinc-300 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[14px] font-bold w-5 text-center tabular-nums">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <span className="text-[32px]">🍽️</span>
              </div>
              <h3 className="text-[18px] font-semibold text-zinc-400 mb-2">
                Taomlar topilmadi
              </h3>
              <p className="text-[13px] text-zinc-600">
                Qidiruv parametrlarini o'zgartiring
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: ORDER SIDEBAR */}
      <MenuOrderSidebar
        customerName={customerName}
        setCustomerName={setCustomerName}
        phone={phone}
        setPhone={setPhone}
        mode={mode}
        setMode={setMode}
        address={address}
        setAddress={setAddress}
        landmark={landmark}
        setLandmark={setLandmark}
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onAddToCart={addToCart}
        totalSum={totalSum}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        tables={tables}
        onReset={handleReset}
      />
    </div>
  )
}
