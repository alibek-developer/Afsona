'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Price } from '@/components/ui/price'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/types'
import {
  CheckCircle2,
  Hash,
  Loader2,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'
import { InteractiveMap } from '@/components/InteractiveMap'
import { useState } from 'react'

interface CartItem {
  item: MenuItem
  quantity: number
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
  landmark,         // Qo'shildi
  setLandmark,      // Qo'shildi
  latitude,         // Qo'shildi
  setLatitude,      // Qo'shildi
  longitude,        // Qo'shildi
  setLongitude,     // Qo'shildi
  tableNumber,
  setTableNumber,
  cart,
  onUpdateQuantity,
  onAddToCart,
  totalSum,
  onSubmit,
  isSubmitting,
}: MenuOrderSidebarProps) {
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleMapSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Using OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Uzbekistan')}&countrycodes=UZ&limit=1`
      );
      
      if (!response.ok) throw new Error('Qidiruvda xatolik yuz berdi');
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setLatitude(lat);
        setLongitude(lng);
        
        // Auto-fill address field with found location
        if (result.display_name) {
          setAddress(result.display_name);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Silently fail - user can still click on map
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+]/g, '')
    const filteredValue = cleaned.startsWith('+')
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setPhone(filteredValue)
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#111827] sticky top-28 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-xl font-black flex items-center justify-between">
          YANGI BUYURTMA
          <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-500 px-3 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Mijoz
            </Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ismi"
              className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Tel
            </Label>
            <Input
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+998"
              className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl gap-1">
          <button
            onClick={() => setMode('delivery')}
            className={cn(
              'flex-1 h-12 rounded-[0.8rem] text-xs font-black transition-all flex items-center justify-center gap-2',
              mode === 'delivery'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500'
                : 'text-slate-400'
            )}
          >
            <MapPin size={16} /> YETKAZISH
          </button>
          <button
            onClick={() => setMode('dine-in')}
            className={cn(
              'flex-1 h-12 rounded-[0.8rem] text-xs font-black transition-all flex items-center justify-center gap-2',
              mode === 'dine-in'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500'
                : 'text-slate-400'
            )}
          >
            <Hash size={16} /> ZALDA
          </button>
        </div>

        {/* Address/Table Input */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            {mode === 'delivery' ? 'Manzil' : 'Stol raqami'}
          </Label>
          {mode === 'delivery' ? (
            <>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Manzilni batafsil yozing..."
                className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px] text-slate-800 dark:text-slate-200"
              />
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Mo'ljal
                </Label>
                <Input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Mo'ljalni kiriting (majburiy)"
                  className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="space-y-2 h-[600px]">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Xarita
                </Label>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-full">
                  <InteractiveMap
                    latitude={latitude}
                    longitude={longitude}
                    onLocationSelect={(lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                    onSearch={handleMapSearch}
                    searchQuery={mapSearchQuery}
                    onSearchQueryChange={setMapSearchQuery}
                    isSearching={isSearching}
                  />
                </div>
              </div>
            </>
          ) : (
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Masalan: 4"
              className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
            />
          )}
        </div>

        {/* Order Summary for Delivery */}
        {mode === 'delivery' && (customerName || phone || address || landmark || (latitude !== null && longitude !== null)) && (
          <div className="pt-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
              Buyurtma ma'lumotlari
            </h4>
            <div className="space-y-2 text-sm">
              {customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mijoz:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{customerName}</span>
                </div>
              )}
              {phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{phone}</span>
                </div>
              )}
              {address && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Manzil:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[60%]">{address}</span>
                </div>
              )}
              {landmark && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mo'ljal:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[60%]">{landmark}</span>
                </div>
              )}
              {latitude !== null && longitude !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Koordinatalar:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cart */}
        <div className="pt-6 border-t dark:border-slate-800">
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
            Savatcha ({cart.length})
          </h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-300 font-bold">
                Hali taom tanlanmadi
              </div>
            ) : (
              cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {item.name}
                    </p>
                    <Price
                      value={item.price * quantity}
                      className="text-xs text-red-500 font-black"
                    />
                  </div>
                  <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl p-1 gap-3 border dark:border-slate-600">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:text-red-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-sm w-4 text-center text-slate-800 dark:text-slate-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="p-1 hover:text-red-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total & Submit */}
        <div className="pt-6 border-t dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Umumiy hisob
              </p>
              <Price value={totalSum} className="text-3xl font-black tracking-tighter" />
            </div>
            {cart.length > 0 && (
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-md">
                TAYYOR
              </span>
            )}
          </div>
          <Button
            className="w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-red-500/20"
            disabled={isSubmitting || cart.length === 0}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2" /> BUYURTMANI YUBORISH
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
