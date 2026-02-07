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
			const allowedEmails = ['a1ibekdew0@gmail.com', 'inoqdost478@gmail.com']
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
		<div className='min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 font-sans antialiased p-4 transition-colors duration-300 relative'>
			{/* Orqa fon animatsiyalari (Mavzuga moslangan) */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div
					className={`absolute top-20 right-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${isDark ? 'bg-red-900' : 'bg-red-100'}`}
				></div>
				<div
					className={`absolute bottom-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}
				></div>
			</div>

			<Card className='w-full max-w-[440px] border-none shadow-2xl dark:shadow-[0_0_50px_rgba(239,68,68,0.2)] shadow-slate-200/60 rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden p-4 relative z-10 transition-colors'>
				<CardHeader className='space-y-4 pb-8 text-center relative'>
					{/* TEPADAGI TUGMA ENDI GLOBAL MAVZUNI O'ZGARTIRADI */}
					<button
						type='button'
						onClick={toggleDarkMode}
						className='absolute top-0 right-0 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
					>
						{isDark ? (
							<Sun className='w-5 h-5 text-yellow-500' />
						) : (
							<Moon className='w-5 h-5 text-slate-700' />
						)}
					</button>

					<div className='mx-auto w-16 h-16 bg-red-500 dark:bg-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-[0_0_25px_rgba(239,68,68,0.5)] text-white mb-2 transition-all'>
						<Utensils size={32} />
					</div>
					<CardTitle className='text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase'>
						Tizimga Kirish
					</CardTitle>
					<CardDescription className='text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]'>
						Restoran Boshqaruv Platformasi
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleLogin} className='space-y-6'>
						{error && (
							<Alert
								variant='destructive'
								className='rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold'
							>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className='space-y-2'>
							<Label
								htmlFor='email'
								className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'
							>
								Elektron pochta
							</Label>
							<div className='relative group'>
								<Mail
									className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-red-500 transition-colors'
									size={20}
								/>
								<Input
									id='email'
									type='email'
									placeholder='admin@example.com'
									className='h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:border-red-500 font-bold transition-all'
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label
								htmlFor='password'
								className='text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-widest'
							>
								Parol
							</Label>
							<div className='relative group'>
								<LockKeyhole
									className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-red-500 transition-colors'
									size={20}
								/>
								<Input
									id='password'
									type='password'
									placeholder='••••••••'
									className='h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 focus:border-red-500 font-bold transition-all'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
								/>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full h-16 bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white rounded-2xl text-lg font-black shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-2 border-slate-900 dark:border-red-500'
							disabled={loading}
						>
							{loading ? (
								<Loader2 className='h-6 w-6 animate-spin' />
							) : (
								'KIRISH'
							)}
						</Button>
					</form>

					<div className='mt-8 text-center'>
						<p className='text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest'>
							Xavfsiz ulanish yoqilgan
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
