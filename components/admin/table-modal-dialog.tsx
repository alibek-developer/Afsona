'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react'; // X o'chirildi
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

// Propsdan onClose olib tashlandi
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
      const bucketName = 'table images' 

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success("Rasm yuklandi!")
    } catch (error: any) {
      toast.error("Xato: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!formData.image_url) return toast.error("Iltimos, rasm yuklang!")
    if (!formData.name) return toast.error("Nomini kiriting!")
    
    setLoading(true)
    const finalData = {
      ...formData,
      capacity: parseInt(formData.capacity.toString()) || 0,
      price_per_hour: parseFloat(formData.price_per_hour.toString()) || 0
    }

    try {
      const response = data?.id 
        ? await supabase.from('tables').update(finalData).eq('id', data.id)
        : await supabase.from('tables').insert([finalData])

      if (response.error) throw response.error
      toast.success("Saqlandi!")
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [&>button]:hidden klassi Shadcn ning standart X tugmasini ham yashirishi mumkin edi, 
          lekin bizga bittasi kerak bo'lgani uchun uni qoldirdik va o'zimiznikini o'chirdik */}
      <DialogContent className="max-w-xl bg-card border-border text-foreground p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <DialogTitle className="sr-only">Xona Boshqaruvi</DialogTitle>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                     <ImagePlus className="text-primary-foreground" size={20} />
                 </div>
                 <div>
                     <h2 className="text-xl font-black uppercase tracking-tight italic">
                        {data ? 'Tahrirlash' : 'Yangi Xona'}
                     </h2>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Luxury Control</p>
                 </div>
              </div>
              {/* O'zimiz qo'shgan qo'lda yozilgan Close tugmasi o'chirildi */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Xona Rasmi</Label>
                <div 
                  className={cn(
                    "relative h-48 w-full rounded-3xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden",
                    formData.image_url ? "border-primary" : "border-border bg-muted/30 hover:border-primary/50"
                  )}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={32} />
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
                        <UploadCloud className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rasm yuklash</span>
                    </label>
                  )}
                  <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Xona Nomi</Label>
                <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Masalan: VIP Sultan" 
                    className="bg-muted/50 border-border h-14 rounded-2xl focus-visible:ring-primary/20 font-bold"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Narxi (1 Soat)</Label>
                    <Input 
                        type="number"
                        value={formData.price_per_hour} 
                        onChange={e => setFormData({...formData, price_per_hour: e.target.value})}
                        className="bg-muted/50 border-border h-14 rounded-2xl font-mono text-primary font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sig'imi</Label>
                    <Input 
                        type="number"
                        value={formData.capacity} 
                        onChange={e => setFormData({...formData, capacity: e.target.value})}
                        className="bg-muted/50 border-border h-14 rounded-2xl font-bold"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tavsif</Label>
                <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="bg-muted/50 border-border min-h-[100px] rounded-2xl resize-none p-4"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                    Bekor Qilish
                </Button>
                <Button disabled={loading || uploading} type="submit" className="flex-[1.5] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="animate-spin" /> : 'SAQLASH'}
                </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}