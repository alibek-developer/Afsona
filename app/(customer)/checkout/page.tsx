'use client'

import { LocationPicker } from '@/components/customer/location-picker'
import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'; // Toaster importi shu yerda
import { useMounted } from '@/lib/useMounted'
import { ArrowLeft, Check, Loader2, Map, MapPin, ShoppingBag, User, Utensils } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type OrderMode = 'dine-in' | 'delivery'

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const mounted = useMounted()

  const [orderMode, setOrderMode] = useState<OrderMode>('delivery')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [subtotal, setSubtotal] = useState(0)

  useEffect(() => {
    if (mounted) setSubtotal(getTotal())
  }, [items, mounted, getTotal])

  const handlePhoneChange = (val: string) => {
    if (val === '' || /^\+?[0-9]*$/.test(val)) setCustomerPhone(val)
  }

  const handlePlaceOrder = async () => {
    if (isSubmitting) return
    
    // Validatsiya va Toast xabari
    if (!customerName.trim() || customerPhone.trim().length < 9) {
      toast.error("Iltimos, ma'lumotlarni to'liq to'ldiring")
      return
    }

    if (orderMode === 'dine-in' && !tableNumber) {
      toast.error("Stol raqamini kiriting")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: customerName.trim(),
        phone: customerPhone.trim(),
        delivery_address: orderMode === 'delivery' ? deliveryAddress : `Stol: ${tableNumber}`,
        type: orderMode,
        status: 'yangi',
        items,
        total_amount: subtotal,
      }])

      if (error) throw error
      
      toast.success("Buyurtma qabul qilindi!")
      setOrderPlaced(true)
      clearCart()
    } catch (err) {
      toast.error('Xatolik yuz berdi, qaytadan urinib koʻring')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  if (orderPlaced) return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080B12] p-6'>
      <div className='w-20 h-20 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20'>
        <Check size={40} strokeWidth={3} />
      </div>
      <h1 className='text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter'>Rahmat!</h1>
      <p className='text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8 font-medium'>Buyurtmangiz muvaffaqiyatli qabul qilindi.</p>
      <Link href='/menu'>
        <Button className='bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-red-600/20 text-white uppercase italic'>
          Menyoga qaytish
        </Button>
      </Link>
    </div>
  )

  return (
    <div className='bg-white dark:bg-[#080B12] min-h-screen transition-colors duration-300'>
      {/* Header section */}
      <div className='max-w-6xl mx-auto px-6 py-10'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='flex items-center gap-5'>
            <Link href='/menu' className='w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 transition-all shadow-sm'>
              <ArrowLeft size={22} className='text-slate-600 dark:text-slate-300'/>
            </Link>
            <div>
              <h1 className='text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none'>Checkout</h1>
              <p className='text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest'>Buyurtmani rasmiylashtirish</p>
            </div>
          </div>
          <div className='inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-slate-800'>
              <ShoppingBag size={18} className='text-red-600'/>
              <span className='font-black text-sm text-slate-700 dark:text-slate-200 uppercase'>{items.length} ta mahsulot</span>
          </div>
        </div>
      </div>

      <main className='max-w-6xl mx-auto px-6 pb-24'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
          
          <div className='lg:col-span-7 space-y-10'>
            <div className='relative'>
              <div className='absolute -left-3 top-0 bottom-0 w-1 bg-red-600 rounded-full hidden md:block' />
              
              <section className='mb-12'>
                <div className='flex items-center gap-3 mb-8'>
                  <div className='p-2 bg-red-600/10 rounded-lg text-red-600'><User size={20} strokeWidth={2.5}/></div>
                  <h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>Mijoz ma'lumotlari</h2>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>Ism va Familiya</label>
                    <input 
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ali Valiyev"
                      className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-14 px-5 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all dark:text-white text-slate-900 font-bold'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1'>Telefon raqam</label>
                    <input 
                      type="tel"
                      value={customerPhone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      placeholder="+998"
                      className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-14 px-5 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all dark:text-white text-slate-900 font-bold'
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className='flex items-center gap-3 mb-8'>
                  <div className='p-2 bg-red-600/10 rounded-lg text-red-600'><Map size={20} strokeWidth={2.5}/></div>
                  <h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>Qabul qilish usuli</h2>
                </div>
                
                <div className='flex p-1.5 bg-slate-100 dark:bg-[#0F1420] rounded-[22px] border border-slate-200 dark:border-slate-800 mb-8'>
                  <button 
                    onClick={() => setOrderMode('delivery')}
                    className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-[16px] font-black text-xs transition-all duration-300 ${orderMode === 'delivery' ? 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-sm dark:shadow-red-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
                  >
                    <MapPin size={16} /> YETKAZIB BERISH
                  </button>
                  <button 
                    onClick={() => setOrderMode('dine-in')}
                    className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-[16px] font-black text-xs transition-all duration-300 ${orderMode === 'dine-in' ? 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-sm dark:shadow-red-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
                  >
                    <Utensils size={16} /> RESTORANDA
                  </button>
                </div>

                {orderMode === 'delivery' ? (
                  <div className='rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-[#0F1420]'>
                    <LocationPicker onLocationSelect={setDeliveryAddress} />
                  </div>
                ) : (
                  <div className='animate-in fade-in slide-in-from-top-4 duration-500'>
                    <label className='text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block ml-1'>Stol raqami</label>
                    <input 
                      type="number"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="7"
                      className='w-full bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 h-16 px-6 rounded-2xl outline-none focus:border-red-600 transition-all dark:text-white text-slate-900 font-black text-2xl'
                    />
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className='lg:col-span-5'>
            <div className='bg-slate-50 dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 sticky top-10 shadow-2xl dark:shadow-none'>
              <div className='flex items-center justify-between mb-10'>
                <h2 className='text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none'>Xulosa</h2>
                <div className='h-1 w-12 bg-red-600 rounded-full' />
              </div>

              <div className='space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar'>
                {items.map(item => (
                  <div key={item.id} className='flex justify-between items-center group'>
                    <div className='flex items-center gap-4'>
                      <div className='w-14 h-14 bg-white dark:bg-[#080B12] rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800'>
                        <span className='font-black text-red-600 text-sm'>x{item.quantity}</span>
                      </div>
                      <div>
                        <p className='text-sm font-black text-slate-800 dark:text-white uppercase leading-tight'>{item.name}</p>
                        <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider'><Price value={item.price} /></p>
                      </div>
                    </div>
                    {/* Narxdan italic olib tashlandi va o'lcham text-sm qilindi */}
                    <p className='text-sm font-black text-slate-900 dark:text-slate-100'><Price value={item.price * item.quantity} /></p>
                  </div>
                ))}
              </div>

              <div className='pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6'>
                <div className='flex justify-between items-end'>
                  <div className='space-y-1'>
                    <span className='block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]'>Jami to'lov:</span>
                    {/* Jami narxdan italic olib tashlandi va o'lcham text-3xl qilindi */}
                    <Price value={subtotal} className='text-3xl font-black text-red-600 tracking-tighter block' />
                  </div>
                </div>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || items.length === 0}
                  className='w-full h-16 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-red-600/30 active:scale-[0.96] flex items-center justify-center gap-3 uppercase tracking-tight'
                >
                  {isSubmitting ? <Loader2 className='animate-spin' /> : (
                    <>Tasdiqlash <Check size={24} strokeWidth={4} /></>
                  )}
                </button>
                
                <p className='text-[10px] text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest'>Tasdiqlash orqali shartlarga rozilik berasiz</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}