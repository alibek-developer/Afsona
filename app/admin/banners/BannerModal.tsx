// components/admin/banners/BannerModal.tsx

'use client';

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { BannerFormData, INITIAL_BANNER_FORM, ValidationError, Website_Banner } from '@/lib/banner'
import { validateBannerForm } from '@/lib/banner-validation'
import { bannerService } from '@/lib/supabase-queries'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ColorPicker from './ColorPicker'
import DateRangeSelector from './DateRangeSelector'
import ImageUploadField from './ImageUploadField'
import LinkTypeSelector from './LinkTypeSelector'
import PreviewModal from './PreviewModal'

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBanner?: Website_Banner | null;
  onSave: () => void;
  branchId: string;
}

export default function BannerModal({
  isOpen,
  onClose,
  editingBanner,
  onSave,
  branchId,
}: BannerModalProps) {
  const [formData, setFormData] = useState<BannerFormData>(INITIAL_BANNER_FORM);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Load editing data
  useEffect(() => {
    if (editingBanner) {
      setFormData({
        ...INITIAL_BANNER_FORM,
        ...editingBanner
      } as BannerFormData);
    } else {
      setFormData(INITIAL_BANNER_FORM);
    }
    setErrors([]);
  }, [editingBanner, isOpen]);

  // Load dropdown options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, itemRes, promoRes] = await Promise.all([
          bannerService.getCategories(),
          bannerService.getMenuItems(branchId),
          bannerService.getPromotions(branchId),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (itemRes.data) setMenuItems(itemRes.data);
        if (promoRes.data) setPromotions(promoRes.data);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };

    if (isOpen && branchId) {
      loadOptions();
    }
  }, [isOpen, branchId]);

  const handleSave = async () => {
    const validationErrors = validateBannerForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (editingBanner?.id) {
        result = await bannerService.update(editingBanner.id, formData);
      } else {
        result = await bannerService.create({ ...formData, branch_id: branchId });
      }

      if (!result.success) throw new Error(result.error || 'Failed to save banner');

      toast.success(editingBanner ? 'Banner updated!' : 'Banner created!');
      onClose();
      onSave();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast.error(error.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const getErrorMessage = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const isError = (field: string) => !!errors.find((e) => e.field === field);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 shadow-2xl border-none">
          <DialogHeader className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm">
                {editingBanner ? '✎' : '+'}
              </span>
              {editingBanner ? 'Edit Website Banner' : 'Create New Website Banner'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-600">01.</span> Visual Content
                </Label>
              </div>
              <ImageUploadField
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                branchId={branchId}
              />
              {isError('image_url') && (
                <p className="text-sm text-red-500 font-medium">⚠ {getErrorMessage('image_url')}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="alt_text" className="text-sm font-semibold">Image Alt Text (SEO)</Label>
                <Input
                  id="alt_text"
                  value={formData.image_alt_text || ''}
                  onChange={(e) => setFormData({ ...formData, image_alt_text: e.target.value })}
                  placeholder="e.g. Summer promotion 2024"
                  maxLength={100}
                />
                <div className="flex justify-end">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                    {formData.image_alt_text?.length || 0}/100 chars
                  </p>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-600">02.</span> Banner Content
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Main Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bold, catchy title"
                  maxLength={60}
                  className={isError('title') ? 'border-red-500 bg-red-50/10' : ''}
                />
                <div className="flex justify-between items-center text-[10px]">
                   {isError('title') ? <p className="text-red-500 font-bold uppercase">{getErrorMessage('title')}</p> : <div />}
                   <p className="font-mono text-gray-400 uppercase tracking-tighter">{formData.title.length}/60</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the promotion..."
                  maxLength={200}
                  className="resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center text-[10px]">
                   {isError('description') ? <p className="text-red-500 font-bold uppercase">{getErrorMessage('description')}</p> : <div />}
                   <p className="font-mono text-gray-400 uppercase tracking-tighter">{formData.description?.length || 0}/200</p>
                </div>
              </div>
            </div>

            {/* Link & CTA Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-600">03.</span> Action & Interaction
                </Label>
              </div>

              <LinkTypeSelector
                value={formData.link_type}
                onChange={(type) => setFormData({ ...formData, link_type: type, link_url: '' })}
                linkValue={formData.link_url}
                onLinkValueChange={(url) => setFormData({ ...formData, link_url: url })}
                categories={categories}
                menuItems={menuItems}
                promotions={promotions}
                isError={isError('link_url')}
                errorMessage={getErrorMessage('link_url')}
              />

              <div className="space-y-2">
                <Label htmlFor="button_text" className="text-sm font-semibold">Button Label</Label>
                <Input
                  id="button_text"
                  value={formData.cta_button_text}
                  onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
                  placeholder="e.g. ORDER NOW"
                  maxLength={30}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100 mt-4">
                <ColorPicker
                  label="Background"
                  value={formData.background_color}
                  onChange={(color) => setFormData({ ...formData, background_color: color })}
                />
                <ColorPicker
                  label="Text Color"
                  value={formData.text_color}
                  onChange={(color) => setFormData({ ...formData, text_color: color })}
                />
                <ColorPicker
                  label="Button Theme"
                  value={formData.cta_button_color}
                  onChange={(color) => setFormData({ ...formData, cta_button_color: color })}
                />
              </div>
            </div>

            {/* Config Section */}
            <div className="space-y-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-200">
               <div className="flex items-center justify-between border-b pb-2 mb-4">
                <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-red-600">04.</span> Settings & Visibility
                </Label>
              </div>

              <DateRangeSelector
                startDate={formData.start_date}
                endDate={formData.end_date}
                onStartDateChange={(date) => setFormData({ ...formData, start_date: date })}
                onEndDateChange={(date) => setFormData({ ...formData, end_date: date })}
              />

              <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-semibold">Initial Sort Order</Label>
                    <Input
                      id="position"
                      type="number"
                      min="0"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                      className="bg-white"
                    />
                 </div>

                 <div className="flex items-center justify-between p-3 bg-white border rounded-xl">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold">Live Status</span>
                       <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{formData.is_active ? 'Public' : 'Hidden'}</span>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border rounded-xl mt-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Mobile App Availability</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{formData.display_on_mobile ? 'ENABLED' : 'WEBSITE ONLY'}</span>
                </div>
                <Switch
                  checked={formData.display_on_mobile}
                  onCheckedChange={(checked) => setFormData({ ...formData, display_on_mobile: checked })}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white p-6 border-t flex flex-col md:flex-row gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100 order-2 md:order-1">
              Discard Changes
            </Button>
            <div className="flex-1 order-1 md:order-2 flex gap-3">
               <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex-1 bg-white border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                👁 Live Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
              >
                {isSaving ? 'Processing...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          banner={formData}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}