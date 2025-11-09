import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000, // Default 5 seconds
    }

    toasts.value.push(newToast)

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, type: 'success', duration })
  }

  const error = (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, type: 'error', duration })
  }

  const warning = (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, type: 'warning', duration })
  }

  const info = (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, type: 'info', duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
})
