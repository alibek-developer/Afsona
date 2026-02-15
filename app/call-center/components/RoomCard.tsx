'use client'

import { cn } from '@/lib/utils'
import { Users, Plus, CheckCircle2, Minus, Eye, Check } from 'lucide-react'

interface Order {
  id: string
  table_id: string
  customer_name: string
  phone: string
  status: 'active' | 'completed'
  created_at: string
  completed_at?: string
  total_amount: number
}

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
  floor: string
  active_order: Order | null
}

interface RoomCardProps {
  xona: Xona
  isSelected: boolean
  onSelect: (xona: Xona) => void
  onPreview: (xona: Xona) => void
  onCompleteOrder: (orderId: string) => void
}

export function RoomCard({ xona, isSelected, onSelect, onPreview, onCompleteOrder }: RoomCardProps) {
  return (
    <div
      className={cn(
        'p-5 bg-white dark:bg-[#111827] rounded-3xl border transition-all text-left flex items-center justify-between group',
        isSelected
          ? 'border-red-500/70 shadow-lg shadow-red-500/10'
          : xona.is_available
          ? 'border-transparent hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5'
          : 'border-slate-200 dark:border-slate-700 opacity-50'
      )}
    >
      {/* Left Side - Image & Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          <img
            src={xona.image_url}
            alt={xona.name}
            className="w-full h-full object-cover"
          />
          {/* Status Indicator */}
          <div
            className={cn(
              'absolute top-1 right-1 w-2 h-2 rounded-full',
              xona.is_available ? 'bg-emerald-500' : 'bg-rose-500'
            )}
          />
        </div>

        {/* Info */}
        <div className="space-y-1 flex-1 min-w-0">
          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {xona.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {xona.capacity} kishi
            </span>
            {xona.price_per_hour > 0 && (
              <>
                <span>|</span>
                <span className="font-black text-slate-500 dark:text-slate-400">
                  {Number(xona.price_per_hour).toLocaleString()} so'm/soat
                </span>
              </>
            )}
          </div>
          {/* Status Text */}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-black uppercase',
              xona.is_available ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                xona.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              )}
            />
            {xona.is_available ? "BO'SH" : 'BAND'}
          </span>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* Preview Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview(xona)
          }}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
          )}
          title="Xonani ko'rish"
        >
          <Eye size={18} />
        </button>

        {/* Complete Order Button - Only show if there's an active order */}
        {!xona.is_available && xona.active_order && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCompleteOrder(xona.active_order!.id)
            }}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
              'bg-emerald-500 text-white hover:bg-emerald-600'
            )}
            title="Bronni yakunlash"
          >
            <Check size={20} />
          </button>
        )}

        {/* Select Button */}
        <button
          onClick={() => xona.is_available && onSelect(xona)}
          disabled={!xona.is_available}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
            isSelected
              ? 'bg-red-500 text-white'
              : xona.is_available
              ? 'bg-slate-50 dark:bg-slate-800 group-hover:bg-red-500 group-hover:text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
          )}
        >
          {isSelected ? (
            <CheckCircle2 size={20} />
          ) : xona.is_available ? (
            <Plus size={20} />
          ) : (
            <Minus size={20} />
          )}
        </button>
      </div>
    </div>
  )
}
