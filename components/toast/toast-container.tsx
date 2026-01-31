'use client'

import { useToastStore } from '@/lib/toast-store'
import { AnimatePresence } from 'framer-motion'
import { CustomToast } from './custom-toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    /** * bottom-6 right-6: O'ng pastki burchakka joylashtirish
     * flex-col-reverse: Yangi toastlar eskilarining ustidan chiqishi uchun
     */
    <div className='fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none'>
      <AnimatePresence mode='popLayout'>
        {toasts.map(toast => (
          <div key={toast.id} className='pointer-events-auto'>
            <CustomToast toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}