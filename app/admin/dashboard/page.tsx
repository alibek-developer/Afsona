'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Price } from '@/components/ui/price'
import { motion } from 'framer-motion'
import {
	ArrowDownRight,
	ArrowUpRight,
	Clock,
	ShoppingBag,
	TrendingUp,
	Users
} from 'lucide-react'
import { useState } from 'react'
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts'

// Grafik uchun test ma'lumotlar (Buni keyinchalik DB dan olasiz)
const data = [
  { time: '08:00', amount: 1200000 },
  { time: '10:00', amount: 2500000 },
  { time: '12:00', amount: 4800000 },
  { time: '14:00', amount: 3500000 },
  { time: '16:00', amount: 4200000 },
  { time: '18:00', amount: 6500000 },
  { time: '20:00', amount: 5800000 },
  { time: '22:00', amount: 2800000 },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 29350000,
    orders: 156,
    customers: 1240,
    avgTime: 32
  })

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Tizim Analitikasi</h1>
        <p className="text-slate-500 font-medium flex items-center gap-2">
          Bugungi ko'rsatkichlar va jonli statistika 
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase">Live</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Kunlik Tushum" 
          value={stats.revenue} 
          isPrice 
          trend="+12.5%" 
          trendUp={true} 
          icon={TrendingUp} 
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
        <StatCard 
          title="Buyurtmalar" 
          value={stats.orders} 
          unit="ta" 
          trend="+8%" 
          trendUp={true} 
          icon={ShoppingBag} 
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <StatCard 
          title="Mijozlar" 
          value={stats.customers} 
          unit="nafar" 
          trend="-2%" 
          trendUp={false} 
          icon={Users} 
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
        />
        <StatCard 
          title="O'rtacha vaqt" 
          value={stats.avgTime} 
          unit="daqiqa" 
          trend="-5 min" 
          trendUp={true} 
          icon={Clock} 
          iconColor="text-emerald-500" 
          iconBg="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sotuvlar Dinamikasi Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black">Sotuvlar Dinamikasi (Bugun)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} so'm`, 'Tushum']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eng ko'p sotilganlar */}
        <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="text-xl font-black">Eng ko'p sotilganlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TopItem name="Palov" count={120} color="bg-red-500" percentage={90} />
            <TopItem name="Manti" count={98} color="bg-orange-500" percentage={75} />
            <TopItem name="Lagmon" count={86} color="bg-blue-500" percentage={65} />
            <TopItem name="Shashlik" count={72} color="bg-emerald-500" percentage={50} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Yordamchi komponentlar
function StatCard({ title, value, isPrice, trend, trendUp, icon: Icon, iconColor, iconBg, unit }: any) {
  return (
    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${iconBg} ${iconColor}`}>
            <Icon size={24} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-black ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend} {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {isPrice ? <Price value={value} /> : value.toLocaleString()}
            </span>
            {unit && <span className="text-[10px] font-black text-slate-400 uppercase">{unit}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopItem({ name, count, color, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="font-bold text-slate-700">{name}</span>
        <span className="text-xs font-black text-slate-400">{count} ta</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`} 
        />
      </div>
    </div>
  )
}