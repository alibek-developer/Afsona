'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, X } from 'lucide-react'

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  image_url: string
  floor: string
}

interface RoomPreviewModalProps {
  xona: Xona | null
  isOpen: boolean
  onClose: () => void
}

export function RoomPreviewModal({ xona, isOpen, onClose }: RoomPreviewModalProps) {
  if (!xona) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#111827] border-none">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black flex items-center justify-between">
            <span className="text-slate-900 dark:text-slate-100">{xona.name}</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Room Image */}
          <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={xona.image_url}
              alt={xona.name}
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div
              className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-black uppercase ${
                xona.is_available
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {xona.is_available ? "Bo'sh" : 'Band'}
            </div>
          </div>

          {/* Room Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase font-bold">Sig'imi</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                {xona.capacity} kishi
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
              <span className="text-2xl block mb-1">💰</span>
              <p className="text-xs text-slate-400 uppercase font-bold">Narx</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                {Number(xona.price_per_hour).toLocaleString()} so'm
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
              <span className="text-2xl block mb-1">🏢</span>
              <p className="text-xs text-slate-400 uppercase font-bold">Qavat</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                {xona.floor}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Bu xona {xona.capacity} kishigacha mehmonlarni qabul qiladi. 
              Xona bron qilish uchun o'ng tomondagi formani to'ldiring.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
