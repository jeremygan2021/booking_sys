import { ref } from 'vue'

const globalLoading = ref(false)
const globalLoadingMessage = ref('')

export function useLoading() {
  const loading = ref(false)

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const withLoading = async <T>(
    fn: () => Promise<T>,
    errorHandler?: (error: unknown) => void,
  ): Promise<T | null> => {
    startLoading()
    try {
      const result = await fn()
      return result
    } catch (error) {
      if (errorHandler) {
        errorHandler(error)
      } else {
        console.error('Error in withLoading:', error)
      }
      return null
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  }
}

export function useGlobalLoading() {
  const show = (message: string = '加载中...') => {
    globalLoading.value = true
    globalLoadingMessage.value = message
  }

  const hide = () => {
    globalLoading.value = false
    globalLoadingMessage.value = ''
  }

  return {
    loading: globalLoading,
    message: globalLoadingMessage,
    show,
    hide,
  }
}
