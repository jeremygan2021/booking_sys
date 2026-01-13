import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

/**
 * Composable for accessing authentication state and methods
 * Provides a convenient way to use auth functionality in components
 */
export function useAuth() {
  const authStore = useAuthStore()

  return {
    // State
    user: computed(() => authStore.user),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),

    // Getters
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),

    // Actions
    login: authStore.login,
    sendSmsCode: authStore.sendSmsCode,
    loginWithSms: authStore.loginWithSms,
    logout: authStore.logout,
    verifyToken: authStore.verifyToken,
    clearError: authStore.clearError,
  }
}
