'use client'

import { Card } from '@/components/ui/card'
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
import { useEffect, useState } from 'react'

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
  delay = 0,
}: {
  title: string
  value: number
  trend: number
  trendUp: boolean
  icon: React.ElementType
  color: string
  delay?: number
}) {
  const colorClasses: Record<string, string> = {
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden p-6 border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
        {/* Background gradient */}
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -translate-y-1/2 translate-x-1/2',
            colorClasses[color]
          )}
        />

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <AnimatedCounter value={value} />

            <div className="flex items-center gap-1.5 mt-3">
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  trendUp
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-600'
                )}
              >
                {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend)}%
              </div>
              <span className="text-xs text-muted-foreground">vs o'tgan hafta</span>
            </div>
          </div>

          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
              colorClasses[color]
            )}
          >
            <Icon size={24} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Revenue Chart (Simplified)
function RevenueChart() {
  const data = [45, 62, 38, 75, 52, 88, 65, 92, 48, 71, 56, 84]
  const maxValue = Math.max(...data)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Daromad</h3>
            <p className="text-sm text-muted-foreground">So'nggi 12 hafta</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
            <span>Daromad</span>
          </div>
        </div>

        <div className="h-48 flex items-end gap-2">
          {data.map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative group"
            >
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-200',
                  i === data.length - 1
                    ? 'bg-gradient-to-t from-[#FF0000] to-red-400'
                    : 'bg-muted hover:bg-muted-foreground/30'
                )}
                style={{ height: '100%' }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded-md whitespace-nowrap">
                {value}0%
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>Hafta 1</span>
          <span>Hafta 6</span>
          <span>Hafta 12</span>
        </div>
      </Card>
    </motion.div>
  )
}

// Top Items List
function TopItems({ items, delay = 0 }: { items: TopItem[]; delay?: number }) {
  const maxCount = Math.max(...items.map((i) => i.count))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-6 border-border/50 h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Top Taomlar</h3>
            <p className="text-sm text-muted-foreground">Eng ko'p sotilgan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
            <TrendingUp size={20} className="text-orange-500" />
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold',
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
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.count} ta</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: delay + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'h-full rounded-full',
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
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
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    todayCustomers: 0,
    orderGrowth: 12.5,
    revenueGrowth: 8.3,
  })
  const [topItems, setTopItems] = useState<TopItem[]>([])

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setStats({
        totalOrders: 1248,
        totalRevenue: 45280000,
        activeOrders: 23,
        todayCustomers: 156,
        orderGrowth: 12.5,
        revenueGrowth: 8.3,
      })
      setTopItems([
        { name: 'Osh', count: 342, revenue: 10260000 },
        { name: 'Manti', count: 256, revenue: 5120000 },
        { name: 'Shashlik', count: 198, revenue: 7920000 },
        { name: 'Lagman', count: 167, revenue: 5010000 },
        { name: 'Somsa', count: 134, revenue: 2680000 },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Restoran operatsiyalarining umumiy ko'rinishi</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jami buyurtmalar"
          value={stats.totalOrders}
          trend={stats.orderGrowth}
          trendUp={true}
          icon={Package}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Jami daromad"
          value={stats.totalRevenue}
          trend={stats.revenueGrowth}
          trendUp={true}
          icon={DollarSign}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Faol buyurtmalar"
          value={stats.activeOrders}
          trend={5.2}
          trendUp={false}
          icon={Clock}
          color="orange"
          delay={0.2}
        />
        <StatCard
          title="Bugungi mijozlar"
          value={stats.todayCustomers}
          trend={18.7}
          trendUp={true}
          icon={Users}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopItems items={topItems} delay={0.4} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="p-5 border-border/50 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF0000]/10 flex items-center justify-center group-hover:bg-[#FF0000]/20 transition-colors">
              <ChefHat size={24} className="text-[#FF0000]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Oshxonaga o'tish</h4>
              <p className="text-sm text-muted-foreground">Buyurtmalarni boshqarish</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
