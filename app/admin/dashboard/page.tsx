'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChefHat,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activeOrders: number
  todayCustomers: number
  orderGrowth: number
  revenueGrowth: number
}

interface TopItem {
  name: string
  count: number
  revenue: number
}

// Animated Counter
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="font-display text-3xl font-bold text-foreground">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  color,
  compare,
  delay = 0,
}: {
  title: string
  value: number
  trend: number
  trendUp: boolean
  icon: React.ElementType
  color: string
  compare: string
  delay?: number
}) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div>
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
                colorClasses[color]
              )}
            >
              <Icon size={24} />
            </div>
            
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <AnimatedCounter value={value} />

            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  'flex items-center gap-0.5 text-sm font-semibold',
                  trendUp ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(trend)}%
              </div>
              <span className="text-xs text-muted-foreground">{compare.startsWith('Hozir') ? compare : `vs ${compare}`}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Revenue Chart (Dynamic)
function RevenueChart({ data }: { data: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] shadow-sm h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">Sotuvlar Dinamikasi</h3>
            <p className="text-sm text-muted-foreground">Daromadni vaqtga nisbatan kuzatish</p>
          </div>
        </div>

        <div className="mt-4 w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF0000" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888', dy: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip 
                cursor={{ stroke: '#FF0000', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                formatter={(val: number) => [`${val.toLocaleString()} so'm`, 'Daromad']}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF0000" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#FF0000', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

// Top Items List
function TopItems({ items, delay = 0 }: { items: TopItem[]; delay?: number }) {
  const maxCount = Math.max(1, ...items.map((i) => i.count))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">Top Taomlar</h3>
            <p className="text-sm text-muted-foreground">Davr bo'yicha eng xaridorgirlar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 flex items-center justify-center transition-transform hover:scale-110">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.name} className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm',
                      index === 0
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                        : index === 1
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                          : index === 2
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                            : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="font-semibold text-foreground text-base tracking-tight">{item.name}</span>
                </div>
                <span className="text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full">{item.count} ta</span>
              </div>
              <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: delay + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'h-full rounded-full',
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-foreground'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton Loading
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

// Main Dashboard
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'daily'|'weekly'|'monthly'|'yearly'>('daily')
  const [allOrdersData, setAllOrdersData] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: allOrders, error } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, customer_name, customer_id, items')
        
        if (error) throw error
        setAllOrdersData(allOrders || [])
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const analysis = useMemo(() => {
     const defaultResult = {
        stats: { totalOrders: 0, totalRevenue: 0, activeOrders: 0, todayCustomers: 0, orderGrowth: 0, revenueGrowth: 0 },
        customerGrowth: 0,
        topItems: [{ name: 'Ma\'lumot yo\'q', count: 0, revenue: 0 }],
        chartData: [] as any[]
     }
     
     if (!allOrdersData || allOrdersData.length === 0) {
        const arr = Array.from({length: 12}).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (11 - i)); return { label: `${d.getDate()}.${d.getMonth()+1}`, value: 0 } })
        return { ...defaultResult, chartData: arr }
     }

     const now = new Date()
     let currentStart: number = 0;
     let prevStart: number = 0;
     let prevEnd: number = 0;

     if (period === 'daily') {
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        prevEnd = currentStart
        prevStart = currentStart - 24*3600*1000
     } else if (period === 'weekly') {
        currentStart = now.getTime() - 7*24*3600*1000
        prevEnd = currentStart
        prevStart = currentStart - 7*24*3600*1000
     } else if (period === 'monthly') {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        prevEnd = currentStart
        prevStart = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime()
     } else if (period === 'yearly') {
        currentStart = new Date(now.getFullYear(), 0, 1).getTime()
        prevEnd = currentStart
        prevStart = new Date(now.getFullYear()-1, 0, 1).getTime()
     }

     let curRev = 0, prevRev = 0
     let curOrd = 0, prevOrd = 0
     let curCust = new Set(), prevCust = new Set()
     let activeOrders = 0

     const itemCounts: Record<string, {count: number; revenue: number}> = {}

     // Chart Setup
     const map: Record<string, number> = {}
     let arr: any[] = []
     if (period === 'daily') {
        arr = Array.from({length: 12}).map((_, i) => { const d = new Date(now); d.setDate(d.getDate() - (11 - i)); return d.toLocaleDateString('en-CA') })
     } else if (period === 'weekly') {
        arr = Array.from({length: 8}).map((_, i) => `Hafta ${8 - i} oldin`).reverse()
     } else if (period === 'monthly') {
        arr = Array.from({length: 6}).map((_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1); return d.toLocaleString('uz-UZ', { month: 'short' }) })
     } else {
        arr = [now.getFullYear() - 1, now.getFullYear()]
     }
     arr.forEach(a => map[a] = 0)

     allOrdersData.forEach(o => {
        const t = new Date(o.created_at).getTime()
        const amt = Number(o.total_amount || 0)
        
        if (['new', 'preparing', 'ready', 'yangi', 'tayyorlanmoqda'].includes(o.status)) activeOrders++;

        // For current vs prev periods
        if (t >= currentStart) {
           curRev += amt;
           curOrd++;
           curCust.add(o.customer_id || o.customer_name || o.id)
           
           if (Array.isArray(o.items)) {
               o.items.forEach((item: any) => {
                  const name = item.name || item.item_name || 'Noma\'lum'
                  if (!itemCounts[name]) itemCounts[name] = { count: 0, revenue: 0 }
                  itemCounts[name].count += (item.quantity||1)
                  itemCounts[name].revenue += (item.quantity||1) * (item.price||0)
               })
           }
        } else if (t >= prevStart && t < prevEnd) {
           prevRev += amt;
           prevOrd++;
           prevCust.add(o.customer_id || o.customer_name || o.id)
        }

        // Chart aggregation
        if (period === 'daily') {
           const ds = new Date(o.created_at).toLocaleDateString('en-CA')
           if (map[ds] !== undefined) map[ds] += amt
        } else if (period === 'weekly') {
           const diffDays = Math.floor((now.getTime() - t) / (1000 * 3600 * 24))
           if (diffDays < 56) {
              const weekIdx = Math.floor(diffDays / 7)
              const key = `Hafta ${weekIdx === 0 ? 1 : weekIdx + 1} oldin`
              if (map[key] !== undefined) map[key] += amt
           }
        } else if (period === 'monthly') {
           const ds = new Date(o.created_at).toLocaleString('uz-UZ', { month: 'short' })
           if (map[ds] !== undefined) map[ds] += amt
        } else {
           const y = new Date(o.created_at).getFullYear()
           if (map[y] !== undefined) map[y] += amt
        }
     });

     const revGrowth = prevRev === 0 ? (curRev > 0 ? 100 : 0) : Number((((curRev - prevRev) / prevRev) * 100).toFixed(1))
     const ordGrowth = prevOrd === 0 ? (curOrd > 0 ? 100 : 0) : Number((((curOrd - prevOrd) / prevOrd) * 100).toFixed(1))
     const cC = curCust.size; const pC = prevCust.size;
     const custGrowth = pC === 0 ? (cC > 0 ? 100 : 0) : Number((((cC - pC) / pC) * 100).toFixed(1))

     const sortedItems = Object.entries(itemCounts).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.count - a.count).slice(0, 5)

     let finChart = []
     if (period === 'daily') finChart = arr.map(k => { const p = k.split('-'); return { label: `${p[2]}.${p[1]}`, value: map[k] }})
     else if (period === 'weekly') finChart = arr.map(k => ({ label: k.replace(' oldin', ''), value: map[k] })).reverse()
     else finChart = arr.map(k => ({ label: String(k), value: map[k] }))

     return {
        stats: { totalOrders: curOrd, totalRevenue: curRev, activeOrders, todayCustomers: cC, orderGrowth: ordGrowth, revenueGrowth: revGrowth },
        customerGrowth: custGrowth,
        topItems: sortedItems.length > 0 ? sortedItems : defaultResult.topItems,
        chartData: finChart
     }
  }, [allOrdersData, period])

  if (loading) {
    return <DashboardSkeleton />
  }

  const { stats, customerGrowth, topItems, chartData } = analysis;
  const compareLabel = period === 'daily' ? 'kechagiga' : period === 'weekly' ? 'o\'tgan haftaga' : period === 'monthly' ? 'o\'tgan oyga' : 'o\'tgan yilga';

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto htext-foreground overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Umumiy ko'rsatkichlarning mufassal analitikasi</p>
        </div>

        {/* Global Period Toggle */}
        <div className="flex bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] shadow-sm rounded-full p-1 self-start sm:self-auto">
          {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={cn(
                'px-5 py-2.5 rounded-full text-xs font-semibold transition-all', 
                period === p ? 'bg-[#FF0000] text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {{daily: 'Kunlik', weekly: 'Haftalik', monthly: 'Oylik', yearly: 'Yillik'}[p]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Buyurtmalar"
          value={stats.totalOrders}
          trend={stats.orderGrowth}
          trendUp={stats.orderGrowth >= 0}
          icon={Package}
          color="blue"
          compare={compareLabel}
          delay={0}
        />
        <StatCard
          title="Daromad"
          value={stats.totalRevenue}
          trend={stats.revenueGrowth}
          trendUp={stats.revenueGrowth >= 0}
          icon={DollarSign}
          color="green"
          compare={compareLabel}
          delay={0.1}
        />
        <StatCard
          title="Mijozlar"
          value={stats.todayCustomers}
          trend={customerGrowth}
          trendUp={customerGrowth >= 0}
          icon={Users}
          color="red"
          compare={compareLabel}
          delay={0.2}
        />
        <StatCard
          title="Jarayondagi (Aktiv)"
          value={stats.activeOrders}
          trend={0}
          trendUp={true}
          icon={Clock}
          color="orange"
          compare="Hozir ochiq"
          delay={0.3}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>
        <div>
          <TopItems items={topItems} delay={0.4} />
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="p-5 rounded-3xl bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] shadow-sm hover:shadow-md hover:border-red-100 dark:hover:border-red-900/30 transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center transition-transform group-hover:scale-110">
              <ChefHat size={28} className="text-[#FF0000]" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-foreground">Oshxonaga o'tish</h4>
              <p className="text-sm tracking-tight text-muted-foreground">Buyurtmalarni boshqarish</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
