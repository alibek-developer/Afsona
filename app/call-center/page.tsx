'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Building2,
  UtensilsCrossed,
  ArrowRight,
  Phone,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react'

type TabType = 'xonalar' | 'taomlar'

export default function CallCenterDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('xonalar')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-black text-4xl tracking-tight text-slate-900 dark:text-white">
          CALL-CENTER <span className="text-red-500">PANEL</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Mijozlarni qabul qilish va buyurtmalarni boshqarish tizimi. 
          Quyidagi bo'limlardan birini tanlang.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-white dark:bg-[#111827] rounded-[1.25rem] shadow-sm">
          <button
            onClick={() => setActiveTab('xonalar')}
            className={cn(
              'flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm transition-all',
              activeTab === 'xonalar'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <Building2 size={20} />
            XONALAR
          </button>
          <button
            onClick={() => setActiveTab('taomlar')}
            className={cn(
              'flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm transition-all',
              activeTab === 'taomlar'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <UtensilsCrossed size={20} />
            TAOMLAR
          </button>
        </div>
      </div>

      {/* Content Based on Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {activeTab === 'xonalar' ? (
          <>
            {/* Xonalar Card */}
            <Link href="/call-center/rooms">
              <div className="group p-8 bg-white dark:bg-[#111827] rounded-[2rem] border border-transparent hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all">
                    <Building2 className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" size={24} />
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">
                  Xona Bron Qilish
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Mijozlar uchun xona bron qiling. Barcha xonalar haqida ma'lumot va bandlik holati.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Real-time holat
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    Vaqt tanlash
                  </span>
                </div>
              </div>
            </Link>

            {/* Quick Stats Card */}
            <div className="p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-[2rem] text-white h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Tezkor ish</p>
                  <p className="font-black text-lg">Call-Center</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-6">
                Mijozlarni tez va samarali qabul qiling. Xona bron qilish jarayonini soddalashtiring.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-xl text-center">
                  <p className="text-2xl font-black">11</p>
                  <p className="text-xs opacity-70">Jami xonalar</p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl text-center">
                  <p className="text-2xl font-black">24/7</p>
                  <p className="text-xs opacity-70">Ish vaqti</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Taomlar Card */}
            <Link href="/call-center/menu">
              <div className="group p-8 bg-white dark:bg-[#111827] rounded-[2rem] border border-transparent hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all">
                    <UtensilsCrossed className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" size={24} />
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">
                  Buyurtma Qilish
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Mijozlar uchun taom buyurtma qiling. Yetkazib berish yoki zaldan olish.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    To'liq menu
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-blue-500" />
                    Mijozlar uchun
                  </span>
                </div>
              </div>
            </Link>

            {/* Quick Stats Card */}
            <div className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2rem] text-white h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Tezkor ish</p>
                  <p className="font-black text-lg">Menu</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-6">
                Barcha taomlar va ichimliklarni ko'ring. Mijozlar uchun tez buyurtma qiling.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-xl text-center">
                  <p className="text-2xl font-black">50+</p>
                  <p className="text-xs opacity-70">Taomlar</p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl text-center">
                  <p className="text-2xl font-black">6</p>
                  <p className="text-xs opacity-70">Kategoriyalar</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-[#111827]/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h4 className="font-black text-sm uppercase text-slate-400 mb-4 tracking-wider">
          Foydali maslahatlar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Mijoz bilan aloqa</p>
              <p className="text-slate-400 text-xs">Telefon raqamni to'g'ri yozing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Vaqt boshqaruvi</p>
              <p className="text-slate-400 text-xs">Bron vaqtini aniq belgilang</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Tasdiqlash</p>
              <p className="text-slate-400 text-xs">Buyurtmani yuborishdan oldin tekshiring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
