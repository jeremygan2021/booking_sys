<template>
  <div class="login-view">
    <div class="login-card card max-w-md mx-auto mt-20">
      <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">管理员登录</h1>

      <!-- Error message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium mb-2 text-gray-700">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="loading"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white placeholder:text-gray-400"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium mb-2 text-gray-700">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="loading"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white placeholder:text-gray-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { LoginForm } from '@/types'

const router = useRouter()
const { login, clearError, isAuthenticated, loading, error } = useAuth()

const form = ref<LoginForm>({
  email: '',
  password: '',
})

onMounted(() => {
  // Clear any previous errors
  clearError()

  // If already authenticated, redirect to admin dashboard
  if (isAuthenticated.value) {
    router.push('/admin')
  }
})

async function handleSubmit() {
  clearError()

  const success = await login(form.value)

  if (success) {
    // Redirect to admin dashboard on successful login
    router.push('/admin')
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, theme('colors.cream') 0%, theme('colors.gold') / 10% 100%);
  padding: 2rem;
}
</style>
