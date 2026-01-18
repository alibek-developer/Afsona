'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuth'
import { cn } from '@/lib/utils'
import {
	BarChart3,
	LayoutDashboard,
	Loader2,
	LogOut,
	Menu,
	UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuthGuard({ allowRoles: ['admin'] })
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#F8FAFC]'>
        <Loader2 className='h-8 w-8 animate-spin text-red-500' />
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItems = [
    {
      href: '/admin', // Asosiy dashboard
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      href: '/admin/buyurtmalar',
      label: 'Buyurtmalar',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/menu',
      label: 'Menu tahrirlash',
      icon: UtensilsCrossed,
    },
  ]

  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-[#0A0A0A] text-white'>
      <div className='p-8'>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <h1 className='font-black text-xl tracking-tighter uppercase'>
            Oshxona<span className="text-red-500">.</span>
          </h1>
        </div>
        <p className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]'>Super Admin Panel</p>
      </div>

      <nav className='flex-1 px-4 space-y-2'>
        {navItems.map(item => {
          // Aniq mos kelishini tekshirish (faqat /admin bo'lsa)
          const isActive = item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 text-sm font-black uppercase tracking-wider',
                isActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 translate-x-1'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-500')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className='p-6'>
        <Button
          variant='ghost'
          className='w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/10 rounded-2xl h-12 font-black uppercase tracking-widest text-xs'
          onClick={handleLogout}
        >
          <LogOut className='h-5 w-5 mr-3' />
          Chiqish
        </Button>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#F1F5F9] flex'>
      <aside className='hidden md:block w-72 shrink-0 border-r border-slate-200'>
        <div className='fixed inset-y-0 w-72'>
          <SidebarContent />
        </div>
      </aside>

      <main className='flex-1 w-full'>
        {/* Mobile Header */}
        <div className='md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40'>
            <span className='font-black tracking-tighter uppercase'>Oshxona<span className="text-red-500">.</span></span>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className="rounded-xl bg-slate-50">
                  <Menu className='h-6 w-6' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='p-0 w-72 bg-[#0A0A0A] border-none'>
                <SidebarContent />
              </SheetContent>
            </Sheet>
        </div>

        <div className='max-w-7xl mx-auto px-4 md:px-10 py-24 md:py-10'>
          {children}
        </div>
      </main>
    </div>
  )
}