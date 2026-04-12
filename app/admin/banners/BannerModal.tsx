// components/admin/banners/BannerModal.tsx
'use client';

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { BannerFormData, INITIAL_BANNER_FORM, Website_Banner } from '@/lib/banner'
import { validateBannerForm } from '@/lib/banner-validation'
import { bannerService } from '@/lib/supabase-queries'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ImageUploadField from './ImageUploadField'

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner?: Website_Banner | null;
  onSave: () => void;
  branchId: string;
}

export default function BannerModal({
  isOpen, onClose, editingBanner, onSave, branchId,
}: BannerModalProps) {
  const [formData, setFormData] = useState<BannerFormData>(INITIAL_BANNER_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingBanner) {
      setFormData({ ...INITIAL_BANNER_FORM, ...editingBanner } as BannerFormData);
    } else {
      setFormData(INITIAL_BANNER_FORM);
    }
  }, [editingBanner, isOpen]);

  const handleSave = async () => {
    console.log('editingBanner:', JSON.stringify(editingBanner));
    if (!formData.title || !formData.image_url) {
      toast.error('Nomi va rasm yuklanishi shart');
      return;
    }
    if (!formData.cta_button_text) {
      toast.error('Narxni kiriting');
      return;
    }
    if (!branchId) {
      toast.error('Branch context missing. Please refresh.');
      return;
    }

    const validationErrors = validateBannerForm(formData);
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      let result;
      const createData = { ...formData, branch_id: branchId };

   if (editingBanner?.id && typeof editingBanner.id === 'string' && editingBanner.id !== 'undefined') {
  result = await bannerService.update(editingBanner.id, formData) 
      }
      else {
        result = await bannerService.create(createData);
      }

      if (!result.success) throw new Error(result.error || 'Failed to save');
      toast.success(editingBanner ? 'Banner yangilandi!' : 'Banner yaratildi!');
      onClose();
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 border-none bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-red-600 dark:bg-red-500 px-7 py-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
          <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1">
            {editingBanner ? 'Tahrirlash' : 'Yangi banner'}
          </p>
          <DialogTitle className="text-white text-2xl font-semibold">
            {editingBanner ? 'Bannerni tahrirlash' : 'Banner yaratish'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Banner ma'lumotlarini kiritish va tahrirlash oynasi
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-7 py-7 flex flex-col gap-5">

          {/* Image Upload */}
          <div className="border-[1.5px] border-dashed border-gray-300 dark:border-[#3a3a3a] hover:border-red-500 dark:hover:border-red-400 rounded-xl transition-colors">
            <ImageUploadField
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              branchId={branchId}
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-widest">
              Nomi *
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Milliy To'plam"
              className="h-[46px] bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#2e2e2e] rounded-[10px] px-4 text-[15px] text-gray-900 dark:text-[#e8e8e8] placeholder:text-gray-400 dark:placeholder:text-[#444] focus:border-red-500 dark:focus:border-red-400 focus-visible:ring-0"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-widest">
              Batafsil ma'lumot (Tarkibi)
            </Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Qozon kabob + Mastava + Go'shtli patir + Choy..."
              className="bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#2e2e2e] rounded-[10px] px-4 py-3.5 text-gray-900 dark:text-[#e8e8e8] placeholder:text-gray-400 dark:placeholder:text-[#444] focus:border-red-500 dark:focus:border-red-400 focus-visible:ring-0 min-h-[80px] resize-none"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-widest">
              Narxi *
            </Label>
            <Input
              value={formData.cta_button_text}
              onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
              placeholder="95,000 UZS"
              className="h-[46px] bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#2e2e2e] rounded-[10px] px-4 text-[15px] text-gray-900 dark:text-[#e8e8e8] placeholder:text-gray-400 dark:placeholder:text-[#444] focus:border-red-500 dark:focus:border-red-400 focus-visible:ring-0"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#2e2e2e]">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Banner holati</span>
              <span className="text-[11px] text-gray-500 dark:text-[#666]">Saytda ko'rinishini boshqarish</span>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-5 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-[#2e2e2e] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 dark:text-[#888] hover:text-gray-900 dark:hover:text-white hover:bg-transparent font-medium text-sm px-0"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 px-8 rounded-[10px] bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white font-semibold text-[15px] border-none shadow-none transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saqlanmoqda...</span>
              </div>
            ) : (
              editingBanner ? 'Yangilash' : 'Saqlash'
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}