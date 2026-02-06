'use client'

import TableManagerModal from '@/components/admin/table-modal-dialog'; // Modalni alohida faylda qilamiz
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { cn } from "@/lib/utils"
import {
  Armchair,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'

interface TableData {
  id: string
  name: string
  capacity: number
  price_per_hour: number
  is_available: boolean
  description: string
  image_url: string
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<TableData | null>(null)

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTables(data || [])
    } catch (err: any) {
      toast.error("Xatolik: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTables() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu xonani o'chirmoqchimisiz?")) return
    try {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (error) throw error
      toast.success("O'chirildi")
      fetchTables()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header Qismi */}
      <div className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Armchair className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Xonalar Boshqaruvi</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Premium Sector</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#020617] border-white/5 text-white rounded-xl focus:ring-indigo-500/20"
            />
          </div>
          <Button 
            onClick={() => { setEditingTable(null); setIsModalOpen(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-widest px-6 h-11"
          >
            <Plus className="w-4 h-4 mr-2" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* Jadval Qismi */}
      <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Xona Nomi</th>
                  <th className="px-8 py-6">Sig'im</th>
                  <th className="px-8 py-6">Narxi (Soat)</th>
                  <th className="px-8 py-6">Holati</th>
                  <th className="px-8 py-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTables.map((table) => (
                  <tr key={table.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={table.image_url} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                        <span className="text-sm font-bold text-white uppercase tracking-wide">{table.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-slate-400">
                      {table.capacity} kishi
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-indigo-400 font-mono">
                        {Number(table.price_per_hour).toLocaleString()} <span className="text-[10px] text-slate-500">SO'M</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <Badge className={cn(
                        "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        table.is_available ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {table.is_available ? "BO'SH" : "BAND"}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => { setEditingTable(table); setIsModalOpen(true) }}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg" onClick={() => handleDelete(table.id)}>
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

      {/* Modal */}
      <TableManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTables}
        data={editingTable}
      />
    </div>
  )
}