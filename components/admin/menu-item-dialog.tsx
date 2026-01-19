'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import { CATEGORIES } from '@/lib/types'
import { Loader2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function MenuItemDialog({ open, onOpenChange, editItem }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available_on_website: true,
    available_on_mobile: true,
  })

  useEffect(() => {
    if (!open) return;
    
    if (editItem?.id) {
      setFormData({
        name: editItem.name || '',
        description: editItem.description || '',
        price: editItem.price?.toString() || '',
        category: editItem.category || '',
        image_url: editItem.image_url || '',
        available_on_website: !!editItem.available_on_website,
        available_on_mobile: !!editItem.available_on_mobile,
      });
    } else {
      setFormData({
        name: '', description: '', price: '', category: '', image_url: '',
        available_on_website: true, available_on_mobile: true,
      });
    }
  }, [open, editItem?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) return toast.error("Kategoriyani tanlang")
    
    setLoading(true)
    const itemData = { 
      ...formData, 
      price: parseFloat(formData.price) || 0 
    }

    try {
      const { error } = editItem 
        ? await supabase.from('menu_items').update(itemData).eq('id', editItem.id)
        : await supabase.from('menu_items').insert([itemData])

      if (error) throw error

      toast.success(editItem ? 'Muvaffaqiyatli yangilandi' : 'Yangi taom qo\'shildi')
      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-[30px] bg-white text-slate-900">
        <div className="bg-[#0f172a] p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <UtensilsCrossed size={24} className="text-indigo-400" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">
              {editItem ? 'Tahrirlash' : 'Yangi Taom'}
            </DialogTitle>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Admin boshqaruv paneli</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nomi */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Taom nomi</Label>
            <Input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-xl border-none bg-slate-50 font-semibold px-5 focus:ring-2 ring-indigo-100 shadow-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Narxi</Label>
              <Input 
                required
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="h-12 rounded-xl border-none bg-slate-50 font-semibold px-5 focus:ring-2 ring-indigo-100 shadow-none" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kategoriya</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="h-12 rounded-xl border-none bg-slate-50 font-semibold shadow-none">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl bg-white">
                  {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TAVSIF QISMI (Mana shu joyda description bor) */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Tavsif (Description)</Label>
            <Textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="min-h-[80px] rounded-xl border-none bg-slate-50 font-medium p-4 focus:ring-2 ring-indigo-100 resize-none shadow-none" 
              placeholder="Taom haqida qisqacha ma'lumot..."
            />
          </div>

          {/* Checkboxlar */}
          <div className="flex gap-3">
            <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.available_on_website ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-slate-50'}`}
                 onClick={() => setFormData(p => ({...p, available_on_website: !p.available_on_website}))}>
              <span className="text-[10px] font-bold uppercase text-slate-500">Veb-sayt</span>
              <Checkbox 
                checked={formData.available_on_website} 
                onCheckedChange={(v) => {
                  setFormData(p => ({...p, available_on_website: !!v}));
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.available_on_mobile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}
                 onClick={() => setFormData(p => ({...p, available_on_mobile: !p.available_on_mobile}))}>
              <span className="text-[10px] font-bold uppercase text-slate-500">Mobil</span>
              <Checkbox 
                checked={formData.available_on_mobile} 
                onCheckedChange={(v) => {
                  setFormData(p => ({...p, available_on_mobile: !!v}));
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-400">BEKOR QILISH</Button>
            <Button type="submit" disabled={loading} className="flex-[1.5] h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : 'SAQLASH'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}