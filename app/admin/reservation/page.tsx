'use client'

import TableManagerModal from '@/components/admin/table-modal-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
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
      const { data, error } = await supabase.from('tables').select('*').order('created_at', { ascending: false })

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

  const filteredXonalar = xonalar.filter((xona) => xona.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111] dark:text-white">Xonalar</h1>
          <p className="text-sm text-[#666666] dark:text-[#AAAAAA] mt-0.5">Xona va stollarni boshqarish</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] dark:text-[#AAAAAA]" size={16} />
            <Input
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 bg-white dark:bg-[#181818] border-[#E5E5E5] dark:border-[#2A2A2A] rounded-xl text-sm"
            />
          </div>
          <Button
            onClick={() => {
              setEditingXona(null)
              setIsModalOpen(true)
            }}
            className="bg-[#FF0000] hover:bg-[#cc0000] text-white rounded-xl px-4 h-10 font-medium"
          >
            <Plus size={18} className="mr-1.5" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-[#FF0000]" size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Xona</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Qavat</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Sig'im</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Narx</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Holat</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
                {filteredXonalar.map((xona) => (
                  <tr key={xona.id} className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={xona.image_url}
                          className="w-10 h-10 rounded-xl object-cover bg-[#F7F7F7] dark:bg-[#1A1A1A]"
                          alt=""
                        />
                        <span className="text-sm font-medium text-[#111111] dark:text-white">{xona.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-xs font-medium text-blue-600">
                        {xona.floor}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#666666] dark:text-[#AAAAAA]">{xona.capacity} kishi</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#111111] dark:text-white">
                        {Number(xona.price_per_hour).toLocaleString()}
                        <span className="text-xs text-[#666666] dark:text-[#AAAAAA] ml-1">so'm</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium',
                          xona.is_available
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                            : 'bg-red-50 dark:bg-red-950/20 text-[#FF0000]'
                        )}
                      >
                        {xona.is_available ? "Bo'sh" : 'Band'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingXona(xona)
                            setIsModalOpen(true)
                          }}
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                          onClick={() => handleDelete(xona.id)}
                        >
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

      <TableManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchXonalar} data={editingXona} />
    </div>
  )
}
