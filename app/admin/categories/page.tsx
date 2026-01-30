'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import {
  ChevronLeft, ChevronRight, Edit2,
  LayoutGrid, Loader2, Plus, Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [catName, setCatName] = useState('')
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Pagination
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
    if (!catName.trim()) return toast.error("Kategoriya nomini yozing")
    setLoading(true)

    if (editingCategory) {
      // UPDATE
      const { error } = await supabase
        .from('categories')
        .update({ name: catName.trim() })
        .eq('id', editingCategory.id)

      if (error) {
        toast.error("Xatolik: " + error.message)
      } else {
        toast.success("Kategoriya yangilandi")
        setIsModalOpen(false)
        fetchCategories()
      }
    } else {
      // INSERT
      // ID-ni nomdan avtomatik yasash
      const generatedId = catName.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const { error } = await supabase.from('categories').insert([
        { id: generatedId, name: catName.trim() }
      ])
      
      if (error) {
        toast.error("Xatolik: " + error.message)
      } else {
        toast.success("Kategoriya qo'shildi")
        setIsModalOpen(false)
        fetchCategories()
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return
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
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0f172a]/40 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">
            <LayoutGrid size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Kategoriyalar</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Boshqaruv</p>
          </div>
        </div>

        <Button 
          onClick={handleOpenAdd}
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 h-14 font-black shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} className="mr-2 stroke-[3px]" /> QO'SHISH
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#0f172a] border-slate-800 text-white rounded-[2rem] sm:max-w-[400px] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black uppercase text-center">
                {editingCategory ? "Tahrirlash" : "Yangi Kategoriya"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">Nomi</label>
                <Input 
                  placeholder="Masalan: Pitsalar" 
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="bg-[#1e293b] border-slate-800 h-16 rounded-2xl text-white font-bold text-lg focus:ring-red-600"
                />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full h-16 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-lg shadow-lg shadow-red-600/20">
                {loading ? <Loader2 className="animate-spin" /> : (editingCategory ? "SAQLASH" : "QO'SHISH")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List Ko'rinishi */}
      <div className="bg-[#0f172a]/60 rounded-[2.5rem] border border-slate-800/60 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr>
                <th className="p-6 pl-10 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">Kategoriya Nomi</th>
                <th className="p-6 pr-10 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {fetching ? (
                <tr><td colSpan={2} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-red-600" size={40} /></td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={2} className="p-32 text-center text-slate-600 font-black uppercase tracking-widest">Ro'yxat bo'sh</td></tr>
              ) : (
                currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/20 transition-all group">
                    <td className="p-7 pl-10 font-black text-lg text-slate-200 uppercase tracking-tight">
                      {cat.name}
                      <span className="block text-[10px] font-mono text-slate-600 font-normal lowercase mt-1">{cat.id}</span>
                    </td>
                    <td className="p-7 pr-10 text-right space-x-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(cat)}
                        className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl w-11 h-11 border border-transparent hover:border-slate-700"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(cat.id)} 
                        className="text-slate-500 hover:text-white hover:bg-red-600 rounded-xl w-11 h-11"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 px-10 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/20">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sahifa {currentPage} / {totalPages || 1}</span>
          <div className="flex gap-3">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="border-slate-800 bg-slate-900/50 text-slate-400 rounded-xl h-11 font-bold hover:bg-slate-800 hover:text-white">
              <ChevronLeft size={20} />
            </Button>
            <Button variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="border-slate-800 bg-slate-900/50 text-slate-400 rounded-xl h-11 font-bold hover:bg-slate-800 hover:text-white">
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}