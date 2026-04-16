'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, LockKeyhole, Mail, Moon, Sun, Utensils } from 'lucide-react'
import { useTheme } from 'next-themes'; // Qo'shildi
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// next-themes tizimiga ulaymiz
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	// Hydration hatosini oldini olish uchun
	useEffect(() => {
		setMounted(true)
	}, [])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const allowedEmails = ['a1ibekdew0@gmail.com', 'inoqdost478@gmail.com', 'trajabboyev@gmail.com']
			if (!allowedEmails.includes(email.toLowerCase().trim())) {
				throw new Error('Ruxsat etilmagan foydalanuvchi')
			}

			const { data, error: authError } = await supabase.auth.signInWithPassword(
				{
					email: email.trim(),
					password,
				},
			)

			if (authError || !data.user) {
				throw new Error("Email yoki parol noto'g'ri")
			}

			const userEmail = data.user.email?.toLowerCase().trim()
			await new Promise(resolve => setTimeout(resolve, 300))

			if (userEmail === 'a1ibekdew0@gmail.com') {
				window.location.href = '/admin/order'
			} else if (userEmail === 'inoqdost478@gmail.com') {
				window.location.href = '/call-center'
			} else if (userEmail === 'trajabboyev@gmail.com') {
				window.location.href = '/kitchen'
			} else {
				throw new Error('Sizning rolingiz aniqlanmadi')
			}
		} catch (err: any) {
			setError(err.message || 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	// Mavzuni almashtirish funksiyasi
	const toggleDarkMode = () => {
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
	}

	if (!mounted) return null

	const isDark = resolvedTheme === 'dark'

	return (
		<div className='min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300'>
			{/* LEFT AREA: Brand / Welcome */}
			<div className='hidden lg:flex lg:w-[45%] bg-[#0f172a] dark:bg-[#020617] p-16 flex-col justify-between relative overflow-hidden'>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-400/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

				<div className="relative z-10">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/20 mb-12">
                        <Utensils size={32} className="text-white" />
                    </div>
					<h1 className='text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]'>
						Xush kelibsiz,<br/>hamkor!
					</h1>
					<p className='text-slate-400 text-lg font-medium max-w-md leading-relaxed'>
						Afsona boshqaruv tizimiga xush kelibsiz. Ishni davom ettirish uchun bo'limni tanlang va tizimga kiring.
					</p>

                    <div className="flex gap-4 mt-16">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs font-black text-white tracking-widest uppercase">Oshxona</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-black text-white tracking-widest uppercase">Call-center</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-black text-white tracking-widest uppercase">Admin</span>
                        </div>
                    </div>
				</div>

				<div className='relative z-10 text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase'>
					EST. 2024 • SILK ROAD SYSTEMS
				</div>
			</div>

			{/* RIGHT AREA: Login Form */}
			<div className='flex-1 flex flex-col justify-center items-center p-8 relative'>
                {/* Theme Toggle */}
                <button
                    type='button'
                    onClick={toggleDarkMode}
                    className='absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95'
                >
                    {isDark ? (
                        <Sun className='w-5 h-5 text-yellow-500' />
                    ) : (
                        <Moon className='w-5 h-5 text-slate-700' />
                    )}
                </button>

                <div className="w-full max-w-sm space-y-10">
                    <div className="space-y-3">
                        <h2 className='text-4xl font-black text-slate-900 dark:text-white tracking-tight'>
                            Tizimga kirish
                        </h2>
                        <p className='text-slate-500 dark:text-slate-400 font-medium'>
                            Hisobingizga kiring
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className='space-y-6'>
                        {error && (
                            <div className='p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2'>
                                <AlertDescription>{error}</AlertDescription>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className='space-y-2.5'>
                                <Label className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>
                                    Elektron pochta
                                </Label>
                                <div className='relative group'>
                                    <Mail className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors' size={18} />
                                    <Input
                                        type='email'
                                        placeholder='example@afsona.uz'
                                        className='h-14 pl-14 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-red-500 font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700'
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className='space-y-2.5'>
                                <Label className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>
                                    Parol
                                </Label>
                                <div className='relative group'>
                                    <LockKeyhole className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors' size={18} />
                                    <Input
                                        type='password'
                                        placeholder='••••••••'
                                        className='h-14 pl-14 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-red-500 font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700'
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>



                        <Button
                            type='submit'
                            className='w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-base font-black tracking-widest uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3'
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className='h-6 w-6 animate-spin' />
                            ) : (
                                <>KIRISH <span className="text-xl">→</span></>
                            )}
                        </Button>
                    </form>

                    <div className='text-center space-y-6'>
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Xavfsiz ulanish yoqilgan
                        </div>

                        <p className='text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter'>
                            Ushbu panel faqat AFSONA xodimlari uchun mo'ljallangan. Tizimdan ruxsatsiz foydalanish qat'iyan taqiqlanadi.
                        </p>
                    </div>
                </div>
			</div>
		</div>
	)
}
