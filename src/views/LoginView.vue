<template>
  <div class="login-view">
    <div class="login-card card max-w-md mx-auto mt-20">
      <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">管理员登录</h1>

      <!-- Login method tabs -->
      <div class="flex mb-6 border-b border-gray-200">
        <button
          @click="loginMethod = 'email'"
          :class="[
            'flex-1 py-3 text-center font-medium transition-colors',
            loginMethod === 'email'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          邮箱登录
        </button>
        <button
          @click="loginMethod = 'sms'"
          :class="[
            'flex-1 py-3 text-center font-medium transition-colors',
            loginMethod === 'sms'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          手机验证码
        </button>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <!-- Email login form -->
      <form v-if="loginMethod === 'email'" @submit.prevent="handleEmailSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium mb-2 text-gray-700">邮箱</label>
          <input
            id="email"
            v-model="emailForm.email"
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
            v-model="emailForm.password"
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

      <!-- SMS login form -->
      <form v-else @submit.prevent="handleSmsSubmit" class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium mb-2 text-gray-700">手机号</label>
          <input
            id="phone"
            v-model="smsForm.phone"
            type="tel"
            required
            :disabled="loading"
            pattern="^1[3-9]\d{9}$"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white placeholder:text-gray-400"
            placeholder="请输入手机号"
          />
        </div>

        <div>
          <label for="code" class="block text-sm font-medium mb-2 text-gray-700">验证码</label>
          <div class="flex gap-2">
            <input
              id="code"
              v-model="smsForm.code"
              type="text"
              required
              :disabled="loading"
              maxlength="6"
              pattern="\d{6}"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white placeholder:text-gray-400"
              placeholder="请输入6位验证码"
            />
            <button
              type="button"
              @click="handleSendCode"
              :disabled="loading || countdown > 0"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading || !smsForm.code"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { LoginForm } from '@/types'

const router = useRouter()
const { login, sendSmsCode, loginWithSms, clearError, isAuthenticated, loading, error } = useAuth()

const loginMethod = ref<'email' | 'sms'>('email')
const countdown = ref(0)
let countdownTimer: number | null = null

const emailForm = ref<LoginForm>({
  email: '',
  password: '',
})

const smsForm = ref({
  phone: '',
  code: '',
})

onMounted(() => {
  // Clear any previous errors
  clearError()

  // If already authenticated, redirect to admin dashboard
  if (isAuthenticated.value) {
    router.push('/admin')
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

async function handleEmailSubmit() {
  clearError()

  const success = await login(emailForm.value)

  if (success) {
    router.push('/admin')
  }
}

async function handleSendCode() {
  if (!smsForm.value.phone) {
    return
  }

  clearError()

  const success = await sendSmsCode(smsForm.value.phone)

  if (success) {
    // Start countdown
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000) as unknown as number
  }
}

async function handleSmsSubmit() {
  clearError()

  const success = await loginWithSms(smsForm.value)

  if (success) {
    router.push('/admin')
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-cream) 0%, rgba(212, 175, 55, 0.1) 100%);
  padding: 2rem;
}
</style>
