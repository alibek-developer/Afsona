// app/admin/website/banners/page.tsx

'use client';

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Website_Banner } from '@/lib/banner'
import { Plus, Search, RefreshCw, LayoutGrid, Filter } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import BannerModal from './BannerModal'
import BannerTable from './BannerTable'
import DeleteConfirmDialog from './DeleteConfirmDialog'

export default function BannersPage() {
  const [banners, setBanners] = useState<Website_Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branchId, setBranchId] = useState<string>('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Website_Banner | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'position' | 'title' | 'created_at'>('position');

  // Load branch information
  useEffect(() => {
    const getBranchId = async () => {
      try {
        const stored = localStorage.getItem('selectedBranchId');
        if (stored) {
          setBranchId(stored);
          return;
        }

        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.branch_id) {
          setBranchId(data.branch_id);
          localStorage.setItem('selectedBranchId', data.branch_id);
        }
      } catch (error) {
        console.error('Error getting branch:', error);
      }
    };

    getBranchId();
  }, []);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    if (!branchId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        branchId,
        page: '1',
        limit: '100', // Load all for drag/drop reordering
        sort: sortBy,
        status: statusFilter,
      });

      const response = await fetch(`/api/banners?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      if (data.success) {
        setBanners(data.data || []);
      } else {
        toast.error(data.error || 'Failed to fetch banners');
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

  // Search local filter
  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (banner?: Website_Banner) => {
    setEditingBanner(banner || null);
    setModalOpen(true);
  };

  const handleToggleActive = async (banner: Website_Banner) => {
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });

      const result = await response.json();

      if (result.success) {
        setBanners(banners.map((b) => (b.id === banner.id ? result.data : b)));
        toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/banners/${deleteData.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setBanners(banners.filter((b) => b.id !== deleteData.id));
        toast.success('Banner deleted successfully');
        setDeleteData(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (newOrder: Website_Banner[]) => {
    // Optimistic UI update
    const previousBanners = [...banners];
    setBanners(newOrder);

    try {
      const response = await fetch('/api/banners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: newOrder.map(b => ({ id: b.id, position: b.position })) }),
      });

      const result = await response.json();
      if (!result.success) {
        setBanners(previousBanners);
        toast.error(result.error || 'Failed to save new order');
      } else {
        toast.success('Order saved');
      }
    } catch (error) {
      setBanners(previousBanners);
      toast.error('Failed to save new order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Marketing</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Website Banners</h1>
          <p className="text-gray-500 text-lg">Promotional slides visible only on the customer website.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchBanners()} 
            disabled={isLoading}
            className="hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 gap-2 px-6 h-11"
          >
            <Plus className="w-5 h-5" />
            Create Banner
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            <span>Show:</span>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[160px] h-11 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banners</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full md:w-[160px] h-11 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="position">By Position</SelectItem>
              <SelectItem value="title">By Title</SelectItem>
              <SelectItem value="created_at">By Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading && banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-50 border-t-red-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <RefreshCw className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Fetching your banners...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center px-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <LayoutGrid className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-xl font-bold text-gray-900">No banners found</h3>
              <p className="text-gray-500">
                {searchQuery ? `No results match "${searchQuery}"` : "You haven't created any promotional banners yet."}
              </p>
            </div>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
            ) : (
              <Button onClick={() => handleOpenModal()} className="bg-red-600">Create Your First Banner</Button>
            )}
          </div>
        ) : (
          <div className="p-1">
            <BannerTable
              banners={filteredBanners}
              onEdit={handleOpenModal}
              onDelete={(b) => setDeleteData({ id: b.id, title: b.title })}
              onToggleActive={handleToggleActive}
              onReorder={handleReorder}
            />
            {filteredBanners.length > 0 && (
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <p>💡 Tip: Drag the handles on the left to reorder banners.</p>
                <p>Showing {filteredBanners.length} banners</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {branchId && (
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
      )}

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