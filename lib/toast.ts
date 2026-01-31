import { useToastStore } from './toast-store'
import type { ToastType } from './toast-store'

export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToastStore.getState()
    return addToast({ type: 'success', title, description, duration })
  },
  error: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToastStore.getState()
    return addToast({ type: 'error', title, description, duration })
  },
  info: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToastStore.getState()
    return addToast({ type: 'info', title, description, duration })
  },
  warning: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToastStore.getState()
    return addToast({ type: 'warning', title, description, duration })
  },
}

// Export for use in client components
export { useToastStore } from './toast-store'
export type { ToastType } from './toast-store'

