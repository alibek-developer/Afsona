'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'
import { ChevronLeft, ChevronRight, Edit2, LayoutGrid, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [catName, setCatName] = useState('')
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchCategories = async () => {
    setFetching(true)
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (data) setCategories(data)
    setFetching(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setCatName('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category)
    setCatName(category.name)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!catName.trim()) return toast.error('Kategoriya nomini yozing')
    setLoading(true)

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({ name: catName.trim() })
        .eq('id', editingCategory.id)

      if (error) {
        toast.error('Xatolik: ' + error.message)
      } else {
        toast.success('Kategoriya yangilandi')
        setIsModalOpen(false)
        fetchCategories()
      }
    } else {
      const generatedId = catName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const { error } = await supabase.from('categories').insert([{ id: generatedId, name: catName.trim() }])

      if (error) {
        toast.error('Xatolik: ' + error.message)
      } else {
        toast.success("Kategoriya qo'shildi")
        setIsModalOpen(false)
        fetchCategories()
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      fetchCategories()
      toast.success("Kategoriya o'chirildi")
    } else {
      toast.error("O'chirishda xatolik: " + error.message)
    }
  }

  const totalPages = Math.ceil(categories.length / itemsPerPage)
  const currentItems = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111] dark:text-white">Kategoriyalar</h1>
          <p className="text-sm text-[#666666] dark:text-[#AAAAAA] mt-0.5">Menyu kategoriyalarini boshqarish</p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-[#FF0000] hover:bg-[#cc0000] text-white rounded-xl px-6 h-10 font-medium"
        >
          <Plus size={18} className="mr-2" /> Qo'shish
        </Button>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white dark:bg-[#181818] border-[#E5E5E5] dark:border-[#2A2A2A] rounded-2xl sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[#111111] dark:text-white">
                {editingCategory ? 'Tahrirlash' : "Yangi kategoriya"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-[#666666] dark:text-[#AAAAAA] mb-1.5 block">Nomi</label>
                <Input
                  placeholder="Masalan: Pitsalar"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-[#E5E5E5] dark:border-[#2A2A2A] rounded-xl text-[#111111] dark:text-white h-11"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-11 bg-[#FF0000] hover:bg-[#cc0000] rounded-xl font-medium text-white"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editingCategory ? 'Saqlash' : "Qo'shish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA]">Kategoriya nomi</th>
                <th className="px-6 py-4 text-xs font-medium text-[#666666] dark:text-[#AAAAAA] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
              {fetching ? (
                <tr>
                  <td colSpan={2} className="p-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#FF0000]" size={28} />
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-16 text-center text-[#666666] dark:text-[#AAAAAA]">
                    Ro'yxat bo'sh
                  </td>
                </tr>
              ) : (
                currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#111111] dark:text-white">{cat.name}</span>
                      <span className="block text-xs text-[#666666] dark:text-[#AAAAAA] font-mono mt-0.5">{cat.id}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 w-8 text-[#666666] dark:text-[#AAAAAA] hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#2A2A2A] flex items-center justify-between bg-[#F7F7F7] dark:bg-[#1A1A1A]">
            <span className="text-xs text-[#666666] dark:text-[#AAAAAA]">
              Sahifa {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 w-8 p-0 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 w-8 p-0 border-[#E5E5E5] dark:border-[#2A2A2A] text-[#111111] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1A1A1A]"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
