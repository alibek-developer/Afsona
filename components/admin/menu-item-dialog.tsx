'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { ImagePlus, Loader2, UtensilsCrossed, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function MenuItemDialog({
  open,
  onOpenChange,
  editItem,
  refreshData,
}: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<any[]>([]) // Dynamic categories
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available_on_website: true,
    available_on_mobile: true,
  })

  // Fetch categories on mount or when dialog opens
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        description: editItem.description || '',
        price: editItem.price?.toString() || '',
        category: editItem.category || '',
        image_url: editItem.image_url || '',
        available_on_website: !!editItem.available_on_website,
        available_on_mobile: !!editItem.available_on_mobile,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available_on_website: true,
        available_on_mobile: true,
      })
    }
  }, [open, editItem])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Fayl hajmini tekshirish (masalan max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Rasm hajmi 2MB dan oshmasligi kerak")
      }

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      // Yuklash
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // URL olish
      const { data } = supabase.storage.from('images').getPublicUrl(filePath)
      
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }))
      toast.success('Rasm tayyor!')
    } catch (error: any) {
      toast.error('Yuklashda xatolik: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) return toast.error('Kategoriyani tanlang')
    if (!formData.image_url) return toast.error('Rasm yuklang')
    
    setLoading(true)

    // Faqat bazada bor ustunlarni yuboramiz
    const itemData = { 
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      image_url: formData.image_url,
      available_on_website: formData.available_on_website,
      available_on_mobile: formData.available_on_mobile,
    }

    try {
      let result;

      if (editItem) {
        // Tahrirlash: .update() ishlatiladi
        result = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editItem.id)
      } else {
        // Yangi qo'shish: .insert() ishlatiladi
        result = await supabase
          .from('menu_items')
          .insert([itemData])
      }

      if (result.error) throw result.error

      toast.success(editItem ? 'Yangilandi!' : "Qo'shildi!")
      onOpenChange(false)
      refreshData?.()
    } catch (err: any) {
      // RLS xatosi bo'lsa, bu yerda ko'rinadi
      console.error("Xatolik tafsiloti:", err)
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const inputStyles = 'h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 transition-all font-medium text-sm'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[440px] max-h-[95vh] overflow-y-auto p-0 border-none rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl'>
        <div className='bg-slate-900 dark:bg-black p-5 text-white flex items-center gap-4 sticky top-0 z-10'>
          <div className='w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center'>
            <UtensilsCrossed size={20} />
          </div>
          <div className='flex-1'>
            <DialogTitle className='text-lg font-bold uppercase tracking-tight'>
              {editItem ? 'Tahrirlash' : 'Yangi Taom'}
            </DialogTitle>
            <p className='text-[10px] opacity-50 font-bold uppercase tracking-widest'>Admin Panel</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/10 rounded-full">
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div className='space-y-1.5'>
            <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Taom rasmi</Label>
            <div className={`relative h-44 w-full rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
              ${formData.image_url ? 'border-solid border-indigo-500' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-500'}`}>
              
              {formData.image_url ? (
                <>
                  <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Label htmlFor="image-upload" className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-slate-100">O'zgartirish</Label>
                  </div>
                </>
              ) : (
                <Label htmlFor="image-upload" className='flex flex-col items-center justify-center cursor-pointer w-full h-full'>
                  {uploading ? (
                    <div className='flex flex-col items-center gap-2'>
                       <Loader2 className="animate-spin text-indigo-500" size={32} />
                       <span className='text-[10px] font-bold text-indigo-500 uppercase'>Yuklanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="text-slate-400 mb-2" size={32} />
                      <span className='text-[10px] font-bold text-slate-400 uppercase'>Rasm tanlang</span>
                    </>
                  )}
                </Label>
              )}
              <input type="file" id="image-upload" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Taom nomi</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputStyles} placeholder='Masalan: Milliy Palov' />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Narxi (UZS)</Label>
              <Input required type='number' value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className={inputStyles} placeholder="0.00" />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Kategoriya</Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder='Tanlang' />
                </SelectTrigger>
                <SelectContent className='rounded-xl border-slate-200 font-bold'>
                  {categories.length === 0 ? (
                    <div className='p-2 text-xs text-center text-slate-500'>Yuklanmoqda...</div>
                  ) : (
                    categories.map(c => (
                      <SelectItem key={c.id} value={c.id} className='text-xs uppercase'>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-[10px] font-black uppercase text-slate-400 ml-1'>Tavsif</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className='min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 resize-none text-sm' placeholder='Taom tarkibi va tavsifi...' />
          </div>

          <div className='flex gap-2'>
            {[{ id: 'available_on_website', label: 'Veb-sayt' }, { id: 'available_on_mobile', label: 'Mobil' }].map(sw => (
              <div 
                key={sw.id} 
                onClick={() => setFormData(p => ({ ...p, [sw.id]: !(p as any)[sw.id] }))} 
                className={`flex-1 flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${ (formData as any)[sw.id] ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50' }`}
              >
                <span className='text-[10px] font-bold uppercase text-slate-500'>{sw.label}</span>
                <Checkbox checked={(formData as any)[sw.id]} className='rounded-md border-slate-300 pointer-events-none' />
              </div>
            ))}
          </div>

          <div className='flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2'>
            <Button type='button' variant='ghost' onClick={() => onOpenChange(false)} className='flex-1 h-12 rounded-xl font-bold uppercase text-xs'>Bekor qilish</Button>
            <Button type='submit' disabled={loading || uploading} className='flex-[1.5] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-xs shadow-lg shadow-indigo-500/20'>
              {loading ? <Loader2 className='animate-spin' size={18} /> : 'Saqlash'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}