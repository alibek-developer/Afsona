'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuth'
import { cn } from '@/lib/utils'
import {
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
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<Loader2 className='h-6 w-6 animate-spin' />
			</div>
		)
	}

	const handleLogout = async () => {
		try {
			// Sessiyani to'liq o'chirish
			await supabase.auth.signOut()
			// Hard redirect - middleware sessiya yo'qligini tanishi uchun
			window.location.href = '/login'
		} catch (error) {
			console.error('Logout error:', error)
			// Xatolik bo'lsa ham login sahifasiga o'tish
			window.location.href = '/login'
		}
	}

	const navItems = [
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
		<div className='flex flex-col h-full bg-[#0A0A0A] text-white border-r-2 border-slate-700'>
			<div className='p-6 border-b-2 border-slate-700'>
				<h1 className='font-display text-xl font-black tracking-tight'>
					Admin Panel
				</h1>
				<p className='text-xs text-slate-400 mt-1'>admin@restoran.uz</p>
			</div>
			<nav className='flex-1 p-4 space-y-2'>
				{navItems.map(item => (
					<Link
						key={item.href}
						href={item.href}
						onClick={() => setIsMobileOpen(false)}
						className={cn(
							'flex items-center gap-3 px-4 py-3 rounded-md transition-transform duration-150 text-sm font-extrabold border-2 border-slate-700',
							pathname === item.href || pathname.startsWith(item.href)
								? 'bg-primary text-black shadow-[3px_3px_0_#000]'
								: 'hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-slate-900 text-white'
						)}
					>
						<item.icon className='h-5 w-5' />
						{item.label}
					</Link>
				))}
			</nav>
			<div className='p-4 border-t-2 border-slate-700'>
				<Button
					variant='ghost'
					className='w-full justify-start text-primary hover:text-primary hover:bg-white/10'
					onClick={handleLogout}
				>
					<LogOut className='h-5 w-5 mr-3' />
					Chiqish
				</Button>
			</div>
		</div>
	)

	return (
		<div className='min-h-screen bg-background flex'>
			{/* Desktop Sidebar */}
			<aside className='hidden md:block w-64 shrink-0'>
				<div className='fixed inset-y-0 w-64'>
					<SidebarContent />
				</div>
			</aside>

			{/* Mobile Header */}
			<div className='md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b-2 border-black px-4 flex items-center justify-between z-40'>
				<span className='font-display font-black tracking-tight'>
					Admin Panel
				</span>
				<Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
					<SheetTrigger asChild>
						<Button variant='ghost' size='icon'>
							<Menu className='h-6 w-6' />
						</Button>
					</SheetTrigger>
					<SheetContent side='left' className='p-0 w-72 border-r-0'>
						<SidebarContent />
					</SheetContent>
				</Sheet>
			</div>

			{/* Main Content */}
			<main className='flex-1 pt-20 md:pt-8 w-full overflow-x-hidden'>
				<div className='max-w-7xl mx-auto px-4 py-12'>{children}</div>
			</main>
		</div>
	)
}
