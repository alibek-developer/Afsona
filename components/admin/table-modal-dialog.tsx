'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const FLOORS = ['1-qavat', '2-qavat', '3-qavat'] as const

interface TableManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  data: {
    id?: string
    name: string
    capacity: number | string
    price_per_hour: number | string
    description?: string
    image_url: string
    is_available: boolean
    floor?: string
  } | null
}

export default function TableManagerModal({ isOpen, onClose, onSuccess, data }: TableManagerModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    image_url: '',
    is_available: true,
    floor: '1-qavat' as typeof FLOORS[number]
  })

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        capacity: data.capacity?.toString() || '',
        image_url: data.image_url || '',
        is_available: data.is_available ?? true,
        floor: (data.floor as typeof FLOORS[number]) || '1-qavat'
      })
    } else {
      setFormData({ 
        name: '', 
        capacity: '', 
        image_url: '', 
        is_available: true,
        floor: '1-qavat'
      })
    }
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
      price_per_hour: 0  // Set to 0 as per new business logic (no hourly rate)
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
      <DialogContent className="max-w-lg bg-[#0B1220] border-border text-foreground p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">Xona Boshqaruvi</DialogTitle>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                     <ImagePlus className="text-white" size={18} />
                 </div>
                 <div>
                     <h2 className="text-lg font-black uppercase tracking-tight italic">
                        {data ? 'Tahrirlash' : 'Yangi Xona'}
                     </h2>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Luxury Control</p>
                 </div>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Compact Image Upload */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Xona Rasmi</Label>
                <div 
                  className={cn(
                    "relative h-28 w-full rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden",
                    formData.image_url ? "border-red-500" : "border-border bg-muted/30 hover:border-red-500/50"
                  )}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-red-500" size={24} />
                    </div>
                  ) : formData.image_url ? (
                    <div className="relative w-full h-full group">
                       <img src={formData.image_url} alt="Room" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">O'zgartirish</label>
                       </div>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer group">
                        <UploadCloud className="text-muted-foreground group-hover:text-red-500 transition-colors" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rasm yuklash</span>
                    </label>
                  )}
                  <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
            </div>

            {/* Row: Xona Nomi | Sig'imi */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Xona Nomi</Label>
                    <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="VIP Sultan" 
                        className="bg-[#111827] border-border h-11 rounded-xl focus-visible:ring-red-500/20 font-bold text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sig'imi</Label>
                    <Input 
                        type="number"
                        value={formData.capacity} 
                        onChange={e => setFormData({...formData, capacity: e.target.value})}
                        placeholder="10"
                        className="bg-[#111827] border-border h-11 rounded-xl font-bold text-sm"
                    />
                </div>
            </div>

            {/* Qavat tanlash - Compact */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qavat</Label>
                <div className="flex p-1 bg-[#111827] rounded-xl border border-border">
                    {FLOORS.map((floor) => (
                        <button
                            key={floor}
                            type="button"
                            onClick={() => setFormData({ ...formData, floor })}
                            className={cn(
                                "flex-1 h-9 rounded-lg font-black text-xs uppercase tracking-wider transition-all",
                                formData.floor === floor
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {floor.replace('-qavat', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Xizmat haqi - Compact Info */}
            <div className="flex items-center justify-between px-3 py-2 bg-red-500/5 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2">
                    <span className="text-base">💼</span>
                    <p className="text-[11px] font-black uppercase text-muted-foreground">Xizmat haqi</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-red-500">10%</p>
                    <p className="text-[9px] text-muted-foreground">Avtomatik</p>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px]">
                    Bekor
                </Button>
                <Button disabled={loading || uploading} type="submit" className="flex-[1.5] h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'SAQLASH'}
                </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}