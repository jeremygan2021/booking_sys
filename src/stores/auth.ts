import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiClient } from '@/api/client'
import type { User, LoginForm, ApiResponse } from '@/types'

interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function login(credentials: LoginForm): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<AuthResponse> = await apiClient.post('/auth/login', credentials)

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        apiClient.setToken(response.data.token)

        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return true
      } else {
        error.value = response.error?.message || '登录失败'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录过程中发生错误'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Call logout endpoint if needed
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state regardless of API call result
      user.value = null
      token.value = null
      apiClient.setToken(null)
      localStorage.removeItem('user')
      loading.value = false
    }
  }

  async function verifyToken(): Promise<boolean> {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (!storedToken || !storedUser) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<User> = await apiClient.get('/auth/verify')

      if (response.success && response.data) {
        token.value = storedToken
        user.value = response.data
        apiClient.setToken(storedToken)

        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data))

        return true
      } else {
        // Token is invalid, clear everything
        await logout()
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '验证失败'
      await logout()
      return false
    } finally {
      loading.value = false
    }
  }

  function initializeAuth(): void {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        apiClient.setToken(storedToken)
      } catch (err) {
        console.error('Failed to parse stored user data:', err)
        logout()
      }
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    logout,
    verifyToken,
    initializeAuth,
    clearError,
  }
})
