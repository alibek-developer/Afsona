'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Loader2, UtensilsCrossed } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import type { MenuItem } from '@/lib/types'
import { MenuItemsList } from '../components/MenuItemsList'
import { MenuOrderSidebar } from '../components/MenuOrderSidebar'
import { submitOrder } from '../actions'

interface CartItem {
  item: MenuItem
  quantity: number
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
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

  useEffect(() => {
    fetchItems()
  }, [])

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

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.item.id === itemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const totalSum = useMemo(
    () =>
      cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0),
    [cart]
  )

  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh!")
    if (!customerName || !phone)
      return toast.error("Mijoz ma'lumotlarini to'ldiring")
    if (mode === 'delivery' && !address) return toast.error('Manzilni kiriting')
    if (mode === 'dine-in' && !tableNumber)
      return toast.error('Stol raqamini kiriting')
    
    // Validation for delivery orders
    if (mode === 'delivery' && (!latitude || !longitude || !landmark)) {
      return toast.error("Xaritadan manzilni belgilang va mo'ljal kiriting")
    }

    setIsSubmitting(true)
    try {
      const result = await submitOrder({
        customer_name: customerName,
        phone,
        type: mode === 'delivery' ? 'delivery' : 'dine_in',
        delivery_address: mode === 'delivery' ? address : `Stol: ${tableNumber}`,
        items: cart.map((c) => ({
          id: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
        })),
        total_amount: totalSum,
        status: 'yangi',
        ...(mode === 'delivery' && {
          latitude,
          longitude,
          landmark,
        }),
      })

      if (result.success) {
        toast.success('Buyurtma muvaffaqiyatli qabul qilindi!')
        setCart([])
        setCustomerName('')
        setPhone('')
        setAddress('')
        setLandmark('')
        setLatitude(null)
        setLongitude(null)
        setTableNumber('')
        // Reset map search state in the sidebar component
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      const errorMessage =
        err.message || 'Buyurtmani yuborishda xatolik yuz berdi'
      toast.error(
        errorMessage.includes('payment_method')
          ? "Bazada xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
          : errorMessage.includes('Could not find')
          ? "Bazada xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
          : errorMessage
      )
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
            <UtensilsCrossed className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              TAOMLAR
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Buyurtma qilish paneli
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
          size={22}
        />
        <input
          type="text"
          placeholder="Taom yoki ichimlik qidirish..."
          className="w-full h-16 pl-14 pr-6 rounded-[1.25rem] bg-white dark:bg-[#111827] border-none shadow-sm text-lg font-medium focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-slate-200"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side - Menu Items */}
        <div className="lg:col-span-8">
          <MenuItemsList
            items={items}
            searchTerm={searchTerm}
            onAddToCart={addToCart}
          />
        </div>

        {/* Right Side - Order Sidebar */}
        <div className="lg:col-span-4">
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
          />
        </div>
      </div>
    </div>
  )
}
