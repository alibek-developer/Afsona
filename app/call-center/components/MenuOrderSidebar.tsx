'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/types'
import {
  CheckCircle2,
  Hash,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  Truck,
} from 'lucide-react'
import { InteractiveMap } from '@/components/InteractiveMap'
import { useState } from 'react'

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

interface MenuOrderSidebarProps {
  customerName: string
  setCustomerName: (value: string) => void
  phone: string
  setPhone: (value: string) => void
  mode: 'delivery' | 'dine-in'
  setMode: (mode: 'delivery' | 'dine-in') => void
  address: string
  setAddress: (value: string) => void
  landmark: string
  setLandmark: (value: string) => void
  latitude: number | null
  setLatitude: (value: number | null) => void
  longitude: number | null
  setLongitude: (value: number | null) => void
  tableNumber: string
  setTableNumber: (value: string) => void
  cart: CartItem[]
  onUpdateQuantity: (itemId: string, delta: number) => void
  onAddToCart: (item: MenuItem) => void
  totalSum: number
  onSubmit: () => void
  isSubmitting: boolean
  tables?: TableStatus[]
  onReset?: () => void
}

export function MenuOrderSidebar({
  customerName,
  setCustomerName,
  phone,
  setPhone,
  mode,
  setMode,
  address,
  setAddress,
  landmark,
  setLandmark,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  tableNumber,
  setTableNumber,
  cart,
  onUpdateQuantity,
  onAddToCart,
  totalSum,
  onSubmit,
  isSubmitting,
  tables = [],
  onReset,
}: MenuOrderSidebarProps) {
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.2995, 69.2401])

  const handleMapSearch = async (query: string) => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Uzbekistan')}&countrycodes=UZ&limit=1`
      )
      if (!response.ok) throw new Error('Qidiruvda xatolik yuz berdi')
      const results = await response.json()
      if (results && results.length > 0) {
        const result = results[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        setLatitude(lat)
        setLongitude(lng)
        setMapCenter([lat, lng])
        if (result.display_name) setAddress(result.display_name)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+]/g, '')
    const filteredValue = cleaned.startsWith('+')
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setPhone(filteredValue)
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat)
          setLongitude(lng)
          setMapCenter([lat, lng])
        },
        () => {
          alert('Joylashuvni aniqlab bo\'lmadi')
        }
      )
    }
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU')

  return (
    <div className="bg-[#0a0a0a] border-l border-white/7 flex flex-col h-full w-[420px] shrink-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('dine-in')}
            className={cn(
              'flex-1 py-3.5 rounded-2xl text-[15px] font-semibold transition flex items-center justify-center gap-2',
              mode === 'dine-in'
                ? 'bg-red-500 text-white'
                : 'bg-[#111] border border-white/10 text-zinc-500 hover:text-white'
            )}
          >
            <Hash size={18} /> Zalda
          </button>
          <button
            onClick={() => setMode('delivery')}
            className={cn(
              'flex-1 py-3.5 rounded-2xl text-[15px] font-semibold transition flex items-center justify-center gap-2',
              mode === 'delivery'
                ? 'bg-red-500 text-white'
                : 'bg-[#111] border border-white/10 text-zinc-500 hover:text-white'
            )}
          >
            <Truck size={18} /> Yetkazish
          </button>
        </div>

        {/* Customer info */}
        <div>
          <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
            Mijoz
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5">
              <Hash className="w-5 h-5 text-zinc-500 shrink-0" />
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ism Familiya"
                className="flex-1 bg-transparent text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5">
              <Hash className="w-5 h-5 text-zinc-500 shrink-0" />
              <input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 000 00 00"
                className="flex-1 bg-transparent text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ZALDA: Table number grid */}
        {mode === 'dine-in' && (
          <div>
            <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
              Zal raqami
            </label>
            <div className="flex items-center gap-4 mb-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Bo&apos;sh
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" /> Band
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tanlangan
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {(tables.length > 0 ? tables : Array.from({ length: 12 }, (_, i) => ({
                id: `fallback-${i}`,
                table_number: String(i + 1),
                name: `Stol ${i + 1}`,
                is_available: true,
                status: 'available'
              }))).map(table => {
                const isSelected = tableNumber === table.table_number
                const isBooked = !table.is_available
                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      if (!isBooked) setTableNumber(table.table_number)
                    }}
                    disabled={isBooked}
                    className={cn(
                      'h-12 rounded-xl text-[15px] font-bold transition-all',
                      isSelected
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                        : isBooked
                          ? 'bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 cursor-not-allowed opacity-60'
                          : 'bg-[#111] border border-white/10 text-zinc-300 hover:border-red-500/40 hover:text-red-400'
                    )}
                  >
                    {table.table_number}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* YETKAZISH: Address + Map */}
        {mode === 'delivery' && (
          <div>
            <label className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
              Manzil
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ko'cha, uy raqami..."
                  className="flex-1 bg-transparent text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              {/* Map */}
              <div className="h-[220px] rounded-2xl overflow-hidden border border-white/10 relative bg-[#111]" style={{ minHeight: '220px' }}>
                <div className="absolute inset-0 z-0">
                  <InteractiveMap
                    latitude={latitude}
                    longitude={longitude}
                    mapCenter={mapCenter}
                    onLocationSelect={(lat, lng, addr) => {
                      setLatitude(lat)
                      setLongitude(lng)
                      if (addr) setAddress(addr)
                    }}
                    height="100%"
                    onSearch={handleMapSearch}
                    searchQuery={mapSearchQuery}
                    onSearchQueryChange={setMapSearchQuery}
                    isSearching={isSearching}
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="text-[12px] text-zinc-500 flex items-center gap-1.5 mb-2">
                  Mo&apos;ljal
                  <span className="text-[10px] text-zinc-600">ⓘ</span>
                </label>
                <textarea
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Masalan: 'Evos yonida, 3-qavat, 5-eshik'"
                  rows={2}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-[14px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cart summary */}
        <div className="pt-2 border-t border-white/7">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] text-zinc-400 font-medium">
              Ovqatlar
            </label>
            <span className="text-[13px] text-zinc-500 font-mono">
              {fmt(totalSum)} so&apos;m
            </span>
          </div>

          {cart.length > 0 && (
            <div className="space-y-2 mb-4">
              {cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#111] border border-white/8 rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-zinc-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-zinc-500">
                      {fmt(item.price)} × {quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-full border border-white/15 text-zinc-300 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-[15px] font-bold w-6 text-center tabular-nums text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-white/7">
            <span className="text-[16px] font-bold text-white">JAMI:</span>
            <span className="text-[22px] font-bold text-red-500 font-mono">
              {fmt(totalSum)} so&apos;m
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-6 pt-4 border-t border-white/7 bg-[#0a0a0a] space-y-3">
        <button
          disabled={isSubmitting || cart.length === 0}
          onClick={onSubmit}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-[16px] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Yuborilmoqda...
            </>
          ) : (
            'Zakaz Qabul Qilish'
          )}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="w-full border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 py-3.5 rounded-2xl text-[14px] transition"
          >
            Bekor qilish
          </button>
        )}
      </div>
    </div>
  )
}
