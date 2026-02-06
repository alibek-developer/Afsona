'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuth'
import { cn } from '@/lib/utils'
import {
	Armchair,
	BarChart3,
	LayoutDashboard,
	LayoutGrid,
	Loader2,
	LogOut,
	Menu,
	Moon,
	Sun,
	UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuthGuard({ allowRoles: ['admin'] })
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark =
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)

    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // NAV ITEMS
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/order', label: 'Buyurtmalar', icon: LayoutDashboard },
    { href: '/admin/reservation', label: 'Xonalar & Stollar', icon: Armchair },
    { href: '/admin/category', label: 'Kategoriyalar', icon: LayoutGrid },
    { href: '/admin/menu', label: 'Menu tahrirlash', icon: UtensilsCrossed },
  ]

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]'>
        <Loader2 className='h-10 w-10 animate-spin text-red-600' />
      </div>
    )
  }

  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 transition-colors duration-300'>
      <div className='p-8 border-b border-slate-100 dark:border-slate-800/50'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20'>
            <UtensilsCrossed size={20} className='text-white' />
          </div>
          <h1 className='font-black text-2xl tracking-tighter uppercase text-slate-900 dark:text-white'>
            Afsona<span className='text-red-600'>.</span>
          </h1>
        </div>
        <p className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]'>
          Boshqaruv Paneli
        </p>
      </div>

      <nav className='flex-1 px-4 space-y-2 py-8 overflow-y-auto'>
        {navItems.map(item => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'group flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 text-sm font-black uppercase tracking-wider',
                isActive
                  ? 'bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-white' : 'group-hover:scale-110',
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className='p-6 border-t border-slate-100 dark:border-slate-800/50 space-y-2'>
        <Button
          variant='ghost'
          onClick={toggleDarkMode}
          className='w-full justify-start text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest'
        >
          {darkMode ? (
            <Sun className='h-5 w-5 mr-3 text-yellow-500' />
          ) : (
            <Moon className='h-5 w-5 mr-3' />
          )}
          {darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
        </Button>

        <Button
          variant='ghost'
          onClick={handleLogout}
          className='w-full justify-start text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest'
        >
          <LogOut className='h-5 w-5 mr-3' />
          Chiqish
        </Button>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-[#020617] flex transition-colors duration-300'>
      <aside className='hidden md:block w-72 shrink-0 h-screen sticky top-0'>
        <SidebarContent />
      </aside>

      <main className='flex-1 flex flex-col min-w-0'>
        <div className='md:hidden h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40'>
          <h1 className='font-black text-xl tracking-tighter uppercase'>
            Afsona<span className='text-red-600'>.</span>
          </h1>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-xl bg-slate-100 dark:bg-slate-800'
              >
                <Menu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-80 border-none'>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className='p-6 md:p-10'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </div>
      </main>
    </div>
  )
}