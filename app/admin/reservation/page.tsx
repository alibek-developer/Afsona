'use client'

import TableManagerModal from '@/components/admin/table-modal-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { cn } from "@/lib/utils"; // cn utilitasi import qilingan
import { Armchair, Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'

interface Xona {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  image_url: string
  is_available: boolean
  floor: string
}

export default function AdminTablesPage() {
  const [xonalar, setXonalar] = useState<Xona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingXona, setEditingXona] = useState<Xona | null>(null)

  useEffect(() => {
    fetchXonalar()
  }, [])

  async function fetchXonalar() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setXonalar(data || [])
    } catch (error: any) {
      toast.error("Ma'lumotlarni yuklashda xato!")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Haqiqatdan ham o'chirmoqchimisiz?")) return
    try {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (error) throw error
      toast.success("O'chirildi")
      fetchXonalar()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Qidiruv filtri
  const filteredXonalar = xonalar.filter(xona =>
    xona.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 text-foreground p-6">
      <Toaster />
      
      {/* Header */}
      <div className="bg-card p-6 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Armchair className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Xonalar Boshqaruvi</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest italic">Admin Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl"
            />
          </div>
          <Button 
            onClick={() => { setEditingXona(null); setIsModalOpen(true) }}
            className="rounded-xl font-black uppercase text-xs tracking-widest px-6"
          >
            <Plus className="w-4 h-4 mr-2" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <th className="px-8 py-6">Xona</th>
                  <th className="px-8 py-6">Qavat</th>
                  <th className="px-8 py-6">Sig'im</th>
                  <th className="px-8 py-6">Narx</th>
                  <th className="px-8 py-6">Holat</th>
                  <th className="px-8 py-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredXonalar.map((xona) => (
                  <tr key={xona.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={xona.image_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <span className="text-sm font-bold uppercase">{xona.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className="rounded-lg px-3 py-1 text-[10px] font-black border-none bg-blue-500/10 text-blue-500">
                        {xona.floor}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono">{xona.capacity} kishi</td>
                    <td className="px-8 py-5 text-sm font-black text-primary">
                      {Number(xona.price_per_hour).toLocaleString()} <small>SO'M</small>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-3 py-1 text-[10px] font-black border-none",
                        xona.is_available ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {xona.is_available ? "BO'SH" : "BAND"}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingXona(xona); setIsModalOpen(true) }}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(xona.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TableManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchXonalar}
        data={editingXona}
      />
    </div>
  )
}