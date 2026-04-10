'use client';

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Banner</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{title}"</span>?
            This action cannot be undone and will remove the banner from the website.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-6 border-t mt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm transition-all active:scale-95"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Yes, Delete Banner'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
