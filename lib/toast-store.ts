import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
	id: string
	type: ToastType
	title: string
	description?: string
	duration?: number
}

interface ToastStore {
	toasts: Toast[]
	addToast: (toast: Omit<Toast, 'id'>) => string
	removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
	toasts: [],
	addToast: toast => {
		const id = Math.random().toString(36).substring(2, 9)
		const currentToasts = get().toasts

		// Ketma-ket bir xil xato chiqishini oldini olish
		if (currentToasts.some(t => t.title === toast.title)) return id

		set(state => ({
			toasts: [
				...state.toasts,
				{ ...toast, id, duration: toast.duration || 4000 },
			],
		}))

		setTimeout(() => get().removeToast(id), toast.duration || 4000)
		return id
	},
	removeToast: id =>
		set(state => ({
			toasts: state.toasts.filter(t => t.id !== id),
		})),
}))
