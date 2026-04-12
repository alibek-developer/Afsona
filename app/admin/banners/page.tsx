// app/admin/website/banners/page.tsx

'use client';

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Website_Banner } from '@/lib/banner'
import { bannerService } from '@/lib/supabase-queries'
import { LayoutGrid, Plus, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import BannerModal from './BannerModal'
import BannerTable from './BannerTable'
import DeleteConfirmDialog from './DeleteConfirmDialog'

export default function BannersPage() {
  const [banners, setBanners] = useState<Website_Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branchId, setBranchId] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Website_Banner | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'position' | 'title' | 'created_at'>('position');

  useEffect(() => {
    const getBranchId = async () => {
      try {
        // 1. LocalStorage dan tekshir
        const stored = localStorage.getItem('selectedBranchId');
        if (stored) {
          setBranchId(stored);
          return;
        }

        // 2. Profile dan ol
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.branch_id) {
            setBranchId(data.branch_id);
            localStorage.setItem('selectedBranchId', data.branch_id);
            return;
          }
        }

        // 3. Supabase dan branches ni to'g'ridan ol
        const { createClient } = await import('@/lib/supabaseClient');
        // supabaseClient export const supabase = ... bo'lsa:
        const { supabase } = await import('@/lib/supabaseClient');
        const { data: branches } = await supabase
          .from('branches')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (branches?.id) {
          setBranchId(branches.id);
          localStorage.setItem('selectedBranchId', branches.id);
        } else {
          toast.error('Branch topilmadi. Avval branch yarating.');
        }
      } catch (error) {
        console.error('Error getting branch:', error);
        toast.error('Branch ma\'lumotlarini olishda xatolik');
      }
    };

    getBranchId();
  }, []);

  const fetchBanners = useCallback(async () => {
    if (!branchId) return;

    setIsLoading(true);
    try {
      const result = await bannerService.fetchAll(branchId, {
        page: '1',
        limit: '100',
        sort: sortBy,
        status: statusFilter,
      });

      if (result.success) {
        setBanners(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch banners');
      }
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [branchId, statusFilter, sortBy]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (banner?: Website_Banner) => {
    setEditingBanner(banner || null);
    setModalOpen(true);
  };

  const handleToggleActive = async (banner: Website_Banner) => {
    try {
      const result = await bannerService.update(banner.id, { is_active: !banner.is_active });
      if (result.success) {
        setBanners(banners.map((b) => (b.id === banner.id ? result.data as Website_Banner : b)));
        toast.success(`Banner ${!banner.is_active ? 'faollashtirildi' : 'o\'chirildi'}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Yangilashda xatolik');
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    setIsDeleting(true);
    try {
      const result = await bannerService.delete(deleteData.id);
      if (result.success) {
        setBanners(banners.filter((b) => b.id !== deleteData.id));
        toast.success('Banner o\'chirildi');
        setDeleteData(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'O\'chirishda xatolik');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (newOrder: Website_Banner[]) => {
    const previousBanners = [...banners];
    setBanners(newOrder);
    try {
      const result = await bannerService.reorder(newOrder.map(b => ({ id: b.id, position: b.position })));
      if (!result.success) {
        setBanners(previousBanners);
        toast.error(result.error || 'Tartibni saqlashda xatolik');
      } else {
        toast.success('Tartib saqlandi');
      }
    } catch (error) {
      setBanners(previousBanners);
      toast.error('Tartibni saqlashda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111] p-6 md:p-12 space-y-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 dark:border-[#2e2e2e] pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Marketing Engine</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-[#e8e8e8] leading-tight">
            Afsona <span className="text-red-600 dark:text-red-400">Banners</span>
          </h1>
          <p className="text-gray-400 dark:text-[#888] text-xl font-medium max-w-2xl leading-relaxed">
            Mijozlar uchun eng jozibador takliflar va yangiliklarni boshqarish markazi.
          </p>
          {/* Debug: branchId ko'rinishi */}
          {!branchId && (
            <p className="text-amber-500 text-sm font-medium">
              ⚠️ Branch yuklanmoqda...
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchBanners()}
            disabled={isLoading}
            className="w-16 h-16 rounded-3xl hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-all active:scale-90"
          >
            <RefreshCw className={`w-6 h-6 text-gray-400 dark:text-[#888] ${isLoading ? 'animate-spin text-red-600 dark:text-red-400' : ''}`} />
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            disabled={!branchId}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white shadow-2xl shadow-red-200 dark:shadow-red-900/40 gap-3 px-10 h-16 rounded-3xl font-black text-lg transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            Banner Qo'shish
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-gray-400 dark:text-[#888] group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors" />
          </div>
          <Input
            placeholder="Bannerlarni nomi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-16 h-[72px] bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-[#2e2e2e] focus:border-red-500 dark:focus:border-red-400 rounded-[28px] text-xl font-medium shadow-sm transition-all outline-none text-gray-900 dark:text-[#e8e8e8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[200px] h-[72px] rounded-[28px] border-2 border-gray-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] font-bold text-gray-900 dark:text-[#e8e8e8] px-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-[#1a1a1a]">
              <SelectItem value="all">Barcha Holatlar</SelectItem>
              <SelectItem value="active">Faqat Faol</SelectItem>
              <SelectItem value="inactive">Nofaol</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[200px] h-[72px] rounded-[28px] border-2 border-gray-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] font-bold text-gray-900 dark:text-[#e8e8e8] px-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-[#1a1a1a]">
              <SelectItem value="position">Tartib bo'yicha</SelectItem>
              <SelectItem value="title">Nomi bo'yicha</SelectItem>
              <SelectItem value="created_at">Sana bo'yicha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Banner Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-[#2e2e2e] overflow-hidden min-h-[500px]">
        {isLoading && banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-red-50 dark:border-red-900/20 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-gray-400 dark:text-[#888] font-bold text-xl uppercase tracking-widest animate-pulse">
              Ma'lumotlar yuklanmoqda...
            </p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 text-center px-8">
            <div className="w-40 h-40 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 animate-bounce">
              <LayoutGrid className="w-16 h-16" />
            </div>
            <div className="space-y-3 max-w-md">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                Bannerlar topilmadi
              </h3>
              <p className="text-gray-400 dark:text-[#888] text-lg font-medium">
                {searchQuery
                  ? `"${searchQuery}" so'ziga mos keladigan ma'lumot yo'q`
                  : 'Hozircha hech qanday promo-banner yaratilmagan.'}
              </p>
            </div>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="h-14 px-10 rounded-2xl border-2 border-gray-200 dark:border-[#2e2e2e] font-bold hover:bg-gray-50 dark:hover:bg-[#111] text-gray-900 dark:text-[#e8e8e8]"
              >
                Qidiruvni tozalash
              </Button>
            ) : (
              <Button
                onClick={() => handleOpenModal()}
                disabled={!branchId}
                className="bg-red-600 dark:bg-red-500 text-white h-16 px-12 rounded-[28px] font-black shadow-xl shadow-red-200 dark:shadow-red-900/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Birinchi bannerni qo'shish
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            <BannerTable
              banners={filteredBanners}
              onEdit={handleOpenModal}
              onDelete={(b) => setDeleteData({ id: b.id, title: b.title })}
              onToggleActive={handleToggleActive}
              onReorder={handleReorder}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <BannerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBanner(null);
        }}
        editingBanner={editingBanner}
        onSave={fetchBanners}
        branchId={branchId}
      />

      {deleteData && (
        <DeleteConfirmDialog
          isOpen={!!deleteData}
          onClose={() => setDeleteData(null)}
          onConfirm={handleDelete}
          title={deleteData.title}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}