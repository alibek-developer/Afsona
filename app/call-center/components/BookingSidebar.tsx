'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Clock, Loader2, Users } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
  floor: string
}

interface BookingSidebarProps {
  selectedXona: Xona | null
  customerName: string
  setCustomerName: (value: string) => void
  phone: string
  setPhone: (value: string) => void
  startTime: Date | null
  setStartTime: (value: Date | null) => void
  endTime: Date | null
  setEndTime: (value: Date | null) => void
  onSubmit: () => void
  isSubmitting: boolean
  onReset: () => void
  cartTotal?: number
}

// Service fee percentage
const SERVICE_FEE_PERCENT = 0.10

export function BookingSidebar({
  selectedXona,
  customerName,
  setCustomerName,
  phone,
  setPhone,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onSubmit,
  isSubmitting,
  onReset,
  cartTotal = 0,
}: BookingSidebarProps) {
  // Calculate hours difference
  const calculateHours = () => {
    if (!startTime || !endTime) return 0
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return Math.max(0, diffHours)
  }

  const hours = calculateHours()
  const roomRate = selectedXona ? selectedXona.price_per_hour * hours : 0
  const subtotal = roomRate + cartTotal
  const serviceFee = subtotal * SERVICE_FEE_PERCENT
  const total = subtotal + serviceFee
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/[^\d+]/g, '')
    const filteredValue = cleaned.startsWith('+')
      ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '')
      : cleaned.replace(/[^0-9]/g, '')
    setPhone(filteredValue)
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-[#111827] sticky top-28 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-xl font-black flex items-center justify-between">
          YANGI BRON
          <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-500 px-3 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Selected Room Info */}
        {selectedXona && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border-2 border-red-200 dark:border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img
                  src={selectedXona.image_url}
                  alt={selectedXona.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-slate-800 dark:text-slate-200">
                  {selectedXona.name}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Users size={12} /> {selectedXona.capacity} kishi ·{' '}
                  {Number(selectedXona.price_per_hour).toLocaleString()} so'm/soat
                </p>
                {hours > 0 && (
                  <p className="text-xs text-emerald-500 font-bold mt-1">
                    {hours.toFixed(1)} soat = {Number(roomRate).toLocaleString()} so'm
                  </p>
                )}
              </div>
              <button
                onClick={onReset}
                className="text-xs text-red-500 hover:text-red-600 font-bold"
              >
                O'chirish
              </button>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Mijoz ismi
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
              Telefon
            </Label>
            <Input
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+998"
              className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
            <Clock size={12} /> VAQT
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
              <DatePicker
                selected={startTime}
                onChange={(t: Date | null) => setStartTime(t)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                dateFormat="HH:mm"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
              <DatePicker
                selected={endTime}
                onChange={(t: Date | null) => setEndTime(t)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                dateFormat="HH:mm"
                className="w-full h-12 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Price Breakdown with Service Fee */}
        {selectedXona && hours > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">
              Narx tafsilotlari
            </h4>
            
            {roomRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Xona ({hours.toFixed(1)} soat)</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {Number(roomRate).toLocaleString()} so'm
                </span>
              </div>
            )}
            
            {cartTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taomlar</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {Number(cartTotal).toLocaleString()} so'm
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {Number(subtotal).toLocaleString()} so'm
              </span>
            </div>
            
            <div className="flex justify-between text-sm py-2 border-t border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 flex items-center gap-1">
                💼 Xizmat haqi (10%)
              </span>
              <span className="font-bold text-primary">
                +{Number(serviceFee).toLocaleString()} so'm
              </span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">JAMI</span>
              <span className="text-lg font-black text-red-500">
                {Number(total).toLocaleString()} so'm
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            className="w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-red-500/20"
            disabled={isSubmitting || !selectedXona}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2" /> BRONNI SAQLASH
              </>
            )}
          </Button>
          {!selectedXona && (
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
              Avval xona tanlang
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
