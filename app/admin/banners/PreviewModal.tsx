'use client';

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BannerFormData } from '@/lib/banner'
import Image from 'next/image'

interface PreviewModalProps {
  banner: BannerFormData;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ banner, isOpen, onClose }: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Banner Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Banner Preview */}
          <div
            className="relative w-full h-64 rounded-lg overflow-hidden text-white flex flex-col justify-center items-start p-8"
            style={{ backgroundColor: banner.background_color }}
          >
            {banner.image_url && (
              <Image
                src={banner.image_url}
                alt={banner.image_alt_text || 'Banner'}
                fill
                className="object-cover absolute inset-0 -z-10"
                sizes="100vw"
              />
            )}

            <div className="relative z-10 max-w-md">
              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: banner.text_color }}
              >
                {banner.title}
              </h2>

              {banner.description && (
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: banner.text_color }}
                >
                  {banner.description}
                </p>
              )}

              <button
                className="px-6 py-2 rounded font-semibold transition hover:opacity-90"
                style={{ backgroundColor: banner.cta_button_color }}
              >
                {banner.cta_button_text}
              </button>
            </div>
          </div>

          {/* Banner Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Link Type</p>
              <p className="text-sm font-medium capitalize">{banner.link_type}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Position</p>
              <p className="text-sm font-medium">#{banner.position}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Active</p>
              <p className="text-sm font-medium">{banner.is_active ? '✅ Yes' : '❌ No'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Mobile Display</p>
              <p className="text-sm font-medium">{banner.display_on_mobile ? '✅ Yes' : '❌ No (Website only)'}</p>
            </div>

            {banner.start_date && (
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Start Date</p>
                <p className="text-sm font-medium">{new Date(banner.start_date).toLocaleDateString()}</p>
              </div>
            )}

            {banner.end_date && (
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">End Date</p>
                <p className="text-sm font-medium">{new Date(banner.end_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 border rounded">
              <p className="text-xs text-gray-600 mb-2">Background</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: banner.background_color }}></div>
                <code className="text-xs">{banner.background_color}</code>
              </div>
            </div>

            <div className="p-3 border rounded">
              <p className="text-xs text-gray-600 mb-2">Text</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: banner.text_color }}></div>
                <code className="text-xs">{banner.text_color}</code>
              </div>
            </div>

            <div className="p-3 border rounded">
              <p className="text-xs text-gray-600 mb-2">Button</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: banner.cta_button_color }}></div>
                <code className="text-xs">{banner.cta_button_color}</code>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close Preview</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
