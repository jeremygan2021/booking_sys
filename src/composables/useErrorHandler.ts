import { useNotification } from './useNotification'
import type { ApiResponse } from '@/types'

export function useErrorHandler() {
  const { error: showError } = useNotification()

  const handleError = (error: unknown, customMessage?: string) => {
    console.error('Error occurred:', error)

    let message = customMessage || '操作失败，请稍后重试'

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    showError(message)
  }

  const handleApiError = <T>(response: ApiResponse<T>, customMessage?: string) => {
    if (!response.success && response.error) {
      const message = customMessage || response.error.message || '请求失败'
      showError(message)
      return true
    }
    return false
  }

  const handleNetworkError = () => {
    showError('网络连接失败，请检查您的网络设置')
  }

  const handleValidationError = (errors: Record<string, string>) => {
    const firstError = Object.values(errors)[0]
    if (firstError) {
      showError(firstError)
    }
  }

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
  }
}
