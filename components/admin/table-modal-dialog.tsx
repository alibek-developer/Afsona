'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TableManagerModal({ isOpen, onClose, onSuccess, data }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    price_per_hour: '',
    description: '',
    image_url: '',
    is_available: true
  })

  useEffect(() => {
    if (data) setFormData({ ...data })
    else setFormData({ name: '', capacity: '', price_per_hour: '', description: '', image_url: '', is_available: true })
  }, [data, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // BUCKET NOMI: Supabase'da qanday bo'lsa shunday yozilishi shart
      const bucketName = 'table images' 

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success("Rasm yuklandi!")
      
    } catch (error: any) {
      toast.error("Rasmni yuklashda xato: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    
    // Ma'lumotlarni tekshirish
    if (!formData.image_url) return toast.error("Iltimos, rasm yuklang!")
    if (!formData.name) return toast.error("Xona nomini kiriting!")
    
    setLoading(true)

    // Supabase kutyotgan formatga o'tkazamiz
    const finalData = {
      name: formData.name,
      description: formData.description,
      image_url: formData.image_url,
      is_available: formData.is_available,
      capacity: parseInt(formData.capacity.toString()) || 0,
      price_per_hour: parseFloat(formData.price_per_hour.toString()) || 0
    }

    try {
      let response;
      if (data?.id) {
        // TAHRIRLASH
        response = await supabase
          .from('tables')
          .update(finalData)
          .eq('id', data.id)
      } else {
        // YANGI QO'SHISH
        response = await supabase
          .from('tables')
          .insert([finalData])
      }

      if (response.error) throw response.error

      toast.success(data ? "Muvaffaqiyatli yangilandi" : "Yangi xona qo'shildi")
      onSuccess()
      onClose()
    } catch (err: any) {
      // RLS xatosi bo'lsa shu yerda ko'rinadi
      console.error("Xatolik:", err)
      toast.error(err.message || "Saqlashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#0f172a] border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem]">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                     <ImagePlus size={20} />
                 </div>
                 <div>
                     <h2 className="text-xl font-black uppercase tracking-tight">{data ? 'Tahrirlash' : 'Yangi Xona'}</h2>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Admin Control</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Xona Rasmi</Label>
                <div 
                  className={`relative h-48 w-full rounded-3xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
                    ${formData.image_url ? 'border-indigo-500' : 'border-white/10 bg-[#020617] hover:border-indigo-500/50'}`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-indigo-500" size={32} />
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Yuklanmoqda...</span>
                    </div>
                  ) : formData.image_url ? (
                    <div className="relative w-full h-full group">
                       <img src={formData.image_url} alt="Room" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest">O'zgartirish</label>
                       </div>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="flex flex-col items-center gap-3 cursor-pointer group">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                            <UploadCloud className="text-slate-500 group-hover:text-indigo-500" size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center px-4">Rasmni yuklash uchun bosing</span>
                    </label>
                  )}
                  <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Xona Nomi</Label>
                <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Masalan: VIP Sultan" 
                    className="bg-[#020617] border-white/5 h-14 rounded-2xl focus:ring-indigo-500/20 font-bold"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Narxi (1 Soat)</Label>
                    <Input 
                        type="number"
                        value={formData.price_per_hour} 
                        onChange={e => setFormData({...formData, price_per_hour: e.target.value})}
                        placeholder="0.00" 
                        className="bg-[#020617] border-white/5 h-14 rounded-2xl font-mono text-indigo-400 font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sig'imi (Kishi)</Label>
                    <Input 
                        type="number"
                        value={formData.capacity} 
                        onChange={e => setFormData({...formData, capacity: e.target.value})}
                        placeholder="12" 
                        className="bg-[#020617] border-white/5 h-14 rounded-2xl font-bold"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tavsif</Label>
                <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Xona haqida batafsil..." 
                    className="bg-[#020617] border-white/5 min-h-[100px] rounded-2xl resize-none p-4"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 text-slate-500 border border-white/5">
                    Bekor Qilish
                </Button>
                <Button disabled={loading || uploading} type="submit" className="flex-[1.5] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : 'SAQLASH'}
                </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}