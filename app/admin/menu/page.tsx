'use client'

import { MenuItemDialog } from '@/components/admin/menu-item-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { Edit2, Plus, Search, Trash2, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Ma'lumotlarni yuklash
  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      toast.error('Maʼlumotlarni yuklashda xatolik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // O'chirish funksiyasi
  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu taomni oʻchirishni xohlaysizmi?')) return

    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      toast.error('Oʻchirishda xatolik')
    } else {
      toast.success('Taom oʻchirildi')
      fetchItems()
    }
  }

  // Qidiruv mantiqi
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Sarlavha va Tugma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Taomlar Menyusi</h1>
            <p className="text-sm text-slate-500">Jami {items.length} ta mahsulot</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Qidirish..." 
              className="pl-10 w-[250px] rounded-xl border-slate-200 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
          >
            <Plus className="mr-2" size={18} /> Yangi qo'shish
          </Button>
        </div>
      </div>

      {/* Jadval qismi */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-wider">Taom nomi</th>
              <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-wider">Kategoriya</th>
              <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-wider">Narxi</th>
              <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-wider text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400">Yuklanmoqda...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400">Ma'lumot topilmadi</td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e: any) => e.target.src = '/placeholder.svg'}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-indigo-600">
                    {item.price?.toLocaleString()} so'm
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setSelectedItem(item); setIsDialogOpen(true); }}
                        className="rounded-lg hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Komponenti */}
      <MenuItemDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editItem={selectedItem} 
      />
    </div>
  )
}