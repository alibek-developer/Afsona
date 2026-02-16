'use client'

import { MenuItemDialog } from '@/components/admin/menu-item-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Edit2, Eye, EyeOff, Plus, Search, Trash2, Utensils } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Menyuni yuklashda xatolik!')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_available: !currentStatus } : item)))

    const { error } = await supabase.from('menu_items').update({ is_available: !currentStatus }).eq('id', id)

    if (error) {
      toast.error("Statusni o'zgartirib bo'lmadi")
      fetchItems()
    } else {
      toast.success(currentStatus ? 'Taom arxivga olindi' : 'Taom sotuvga qaytarildi')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu taomni butunlay oʻchirib yubormoqchimisiz?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      toast.error(error.code === '23503' ? "O'chirib bo'lmaydi: Buyurtmalar tarixida bor" : `Xatolik: ${error.message}`)
    } else {
      toast.success('Muvaffaqiyatli oʻchirildi')
      fetchItems()
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'active' ? item.is_available === true : item.is_available === false
    return matchesSearch && matchesTab
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111] dark:text-white">Menyu</h1>
          <p className="text-sm text-[#666666] dark:text-[#AAAAAA] mt-0.5">
            {activeTab === 'active' ? 'Sotuvdagi taomlar' : 'Arxivdagi taomlar'}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] dark:text-[#AAAAAA]" size={16} />
            <Input
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-white dark:bg-[#181818] border-[#E5E5E5] dark:border-[#2A2A2A] rounded-xl text-sm"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedItem(null)
              setIsDialogOpen(true)
            }}
            className="bg-[#FF0000] hover:bg-[#cc0000] text-white rounded-xl px-4 h-10 font-medium"
          >
            <Plus size={18} className="mr-1.5" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#181818] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'active'
              ? 'bg-[#FF0000] text-white'
              : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-white'
          )}
        >
          Sotuvda ({items.filter((i) => i.is_available).length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'archived'
              ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
              : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-white'
          )}
        >
          Arxiv ({items.filter((i) => !i.is_available).length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Taom nomi</th>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Kategoriya</th>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Narxi</th>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-center">Holati</th>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#666666] dark:text-[#AAAAAA]">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#666666] dark:text-[#AAAAAA]">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#111111] dark:text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F7F7F7] dark:bg-[#1A1A1A] text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#111111] dark:text-white">
                        {item.price?.toLocaleString()}
                        <span className="text-xs text-[#666666] dark:text-[#AAAAAA] ml-1">so'm</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(item.id, item.is_available)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                          item.is_available
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600'
                            : 'bg-[#F7F7F7] dark:bg-[#1A1A1A] border-[#E5E5E5] dark:border-[#2A2A2A] text-[#666666] dark:text-[#AAAAAA]'
                        )}
                      >
                        {item.is_available ? 'Sotuvda' : 'Arxivda'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(item.id, item.is_available)}
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-[#111111] dark:hover:text-white rounded-lg"
                        >
                          {item.is_available ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDialogOpen(true)
                          }}
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666] dark:text-[#AAAAAA]">
            Sahifa {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      <MenuItemDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} editItem={selectedItem} refreshData={fetchItems} />
    </div>
  )
}
