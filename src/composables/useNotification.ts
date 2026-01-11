import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const show = (message: string, type: Notification['type'] = 'info', duration: number = 5000) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration)
  }

  const warning = (message: string, duration?: number) => {
    return show(message, 'warning', duration)
  }

  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications,
    show,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  }
}
