'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/ui/price'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES } from '@/lib/types'
import {
	Hash,
	Loader2,
	LogOut,
	MapPin,
	Minus,
	Plus,
	Search,
	ShoppingBag,
} from 'lucide-react'

// ... (importlar o'zgarishsiz qoladi)

export default function ProfessionalCallCenter() {
	// ... (statelar va funksiyalar o'zgarishsiz qoladi)

	// Neobrutalizm uchun umumiy klasslar
	const brutalBorder =
		'border-4 border-black dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none'
	const brutalInput =
		'border-2 border-black dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-0 focus:border-red-500 rounded-xl font-bold transition-all'

	return (
		<div className='min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-white transition-colors duration-300'>
			{/* Header - Yanada qalinroq va ajralib turadigan */}
			<header className='bg-white dark:bg-slate-900 border-b-4 border-black dark:border-slate-800 sticky top-0 z-50 transition-colors'>
				<div className='max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white'>
							<ShoppingBag size={28} strokeWidth={3} />
						</div>
						<div>
							<h1 className='text-2xl font-black tracking-tighter uppercase leading-none'>
								CALL-CENTER <span className='text-red-500'>PRO</span>
							</h1>
							<p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1'>
								Operator Terminal v2.0
							</p>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						{/* Dark Mode toggle - brutal style */}
						<Button
							variant='outline'
							onClick={() => setDarkMode(!darkMode)}
							className='border-2 border-black rounded-xl font-bold hover:bg-yellow-400 transition-colors'
						>
							{darkMode ? 'YORUG‘' : 'TUNGI'}
						</Button>
						<Button
							onClick={handleSignOut}
							className='h-12 rounded-xl bg-black hover:bg-red-600 text-white font-black px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none'
						>
							<LogOut className='h-5 w-5 mr-2' /> CHIQUV
						</Button>
					</div>
				</div>
			</header>

			<main className='max-w-[1800px] mx-auto p-8 gap-8 grid grid-cols-12 h-[calc(100vh-100px)]'>
				{/* LEFT: Menu Section */}
				<div className='col-span-7 flex flex-col gap-6'>
					<div className='relative'>
						<Search
							className='absolute left-5 top-1/2 -translate-y-1/2 text-black'
							size={24}
						/>
						<input
							type='text'
							placeholder='Qidiruv (masalan: Lavash, Coca-cola...)'
							className={`w-full h-20 pl-16 pr-6 rounded-2xl text-xl placeholder-slate-400 ${brutalInput}`}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>

					<ScrollArea
						className={`flex-1 bg-white dark:bg-slate-900 rounded-[2rem] ${brutalBorder}`}
					>
						<div className='p-8 space-y-12'>
							{CATEGORIES.map(category => {
								const catItems = items.filter(
									i =>
										i.category.toUpperCase() === category.id.toUpperCase() &&
										i.name.toLowerCase().includes(searchTerm.toLowerCase()),
								)
								if (catItems.length === 0) return null
								return (
									<div key={category.id} className='space-y-6'>
										<div className='flex items-center gap-4'>
											<div className='bg-black text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest'>
												{category.name}
											</div>
											<div className='h-1 bg-black/5 dark:bg-white/5 flex-1' />
										</div>
										<div className='grid grid-cols-2 xl:grid-cols-3 gap-6'>
											{catItems.map(item => (
												<button
													key={item.id}
													onClick={() => addToCart(item)}
													className='group p-6 rounded-2xl border-2 border-black bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
												>
													<div className='flex justify-between items-start mb-4'>
														<p className='font-black text-lg leading-tight uppercase'>
															{item.name}
														</p>
														<div className='bg-red-500 text-white p-1 rounded-lg'>
															<Plus size={20} strokeWidth={3} />
														</div>
													</div>
													<Price
														value={item.price}
														className='text-sm font-black opacity-60'
													/>
												</button>
											))}
										</div>
									</div>
								)
							})}
						</div>
					</ScrollArea>
				</div>

				{/* RIGHT: Order Form Section */}
				<div className='col-span-5 h-full'>
					<Card
						className={`h-full flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden ${brutalBorder}`}
					>
						<CardHeader className='p-8 bg-black text-white'>
							<CardTitle className='text-xl font-black flex justify-between items-center italic tracking-tighter'>
								OPERATOR: {customerName || '...'}
								<span className='not-italic text-[10px] bg-red-500 px-3 py-1 rounded-full animate-pulse'>
									ACTIVE
								</span>
							</CardTitle>
						</CardHeader>

						<CardContent className='p-8 space-y-8 flex-1 overflow-y-auto'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label className='text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1'>
										Mijoz ismi
									</Label>
									<Input
										value={customerName}
										onChange={e => setCustomerName(e.target.value)}
										placeholder='Ism...'
										className={`h-14 ${brutalInput}`}
									/>
								</div>
								<div className='space-y-2'>
									<Label className='text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1'>
										Telefon raqami
									</Label>
									<Input
										value={phone}
										onChange={e => setPhone(e.target.value)}
										placeholder='+998'
										className={`h-14 ${brutalInput}`}
									/>
								</div>
							</div>

							{/* Service Mode Selector */}
							<div className='grid grid-cols-2 gap-4'>
								{[
									{
										id: 'delivery',
										label: 'YETKAZIB BERISH',
										icon: <MapPin size={20} />,
									},
									{
										id: 'dine-in',
										label: 'ZALDA (STOL)',
										icon: <Hash size={20} />,
									},
								].map(s => (
									<button
										key={s.id}
										onClick={() => setMode(s.id as any)}
										className={`h-16 rounded-xl border-2 font-black flex items-center justify-center gap-3 transition-all ${
											mode === s.id
												? 'bg-black text-white border-black scale-105'
												: 'border-slate-200 text-slate-400 hover:border-black hover:text-black'
										}`}
									>
										{s.icon} {s.label}
									</button>
								))}
							</div>

							<div className='space-y-2'>
								<Label className='text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1'>
									{mode === 'delivery'
										? 'Yetkazib berish manzili'
										: 'Stol raqami'}
								</Label>
								{mode === 'delivery' ? (
									<Textarea
										value={address}
										onChange={e => setAddress(e.target.value)}
										className={`min-h-[100px] p-4 ${brutalInput}`}
										placeholder='Ko‘cha, uy raqami, mo‘ljal...'
									/>
								) : (
									<Input
										value={tableNumber}
										onChange={e => setTableNumber(e.target.value)}
										className={`h-14 ${brutalInput}`}
										placeholder='Masalan: 12'
									/>
								)}
							</div>

							{/* Savatcha qismi - List ko'rinishida */}
							<div className='pt-6 border-t-2 border-slate-100 dark:border-slate-800'>
								<h4 className='text-xs font-black uppercase mb-4 tracking-widest text-slate-400'>
									Tanlangan mahsulotlar ({cart.length})
								</h4>
								<div className='space-y-3'>
									{cart.map(({ item, quantity }) => (
										<div
											key={item.id}
											className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-black'
										>
											<div className='flex-1'>
												<p className='font-black text-sm uppercase'>
													{item.name}
												</p>
												<Price
													value={item.price * quantity}
													className='text-xs font-bold text-red-500'
												/>
											</div>
											<div className='flex items-center bg-black rounded-lg p-1 text-white gap-2'>
												<button
													onClick={() => updateQuantity(item.id, -1)}
													className='p-1 hover:bg-red-500 rounded transition-colors'
												>
													<Minus size={14} />
												</button>
												<span className='w-8 text-center font-black'>
													{quantity}
												</span>
												<button
													onClick={() => addToCart(item)}
													className='p-1 hover:bg-red-500 rounded transition-colors'
												>
													<Plus size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardContent>

						{/* Footer: Hisob-kitob va Yuborish */}
						<div className='p-8 bg-slate-50 dark:bg-slate-800 border-t-4 border-black'>
							<div className='flex justify-between items-center mb-6'>
								<div>
									<p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>
										To'lov summasi
									</p>
									<Price
										value={calculateTotal()}
										className='text-4xl font-black tracking-tighter'
									/>
								</div>
								<div className='bg-emerald-500 text-white font-black px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
									NAQD
								</div>
							</div>
							<Button
								onClick={handleSubmit}
								disabled={submitting || cart.length === 0}
								className='w-full h-20 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all'
							>
								{submitting ? (
									<Loader2 className='animate-spin' />
								) : (
									'BUYURTMANI TASDIQLASH'
								)}
							</Button>
						</div>
					</Card>
				</div>
			</main>
		</div>
	)
}
