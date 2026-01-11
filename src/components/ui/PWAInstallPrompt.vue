<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showPrompt"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200"
      >
        <div class="max-w-md mx-auto p-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">安装应用</h3>
              <p class="text-sm text-gray-600">将爱云香舍添加到主屏幕，获得更好的使用体验</p>
            </div>
            <button
              @click="dismiss"
              class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="flex gap-3 mt-4">
            <button
              @click="install"
              class="flex-1 px-4 py-2 bg-gold text-white rounded-lg font-medium hover:bg-gold-dark transition-colors"
            >
              立即安装
            </button>
            <button
              @click="dismiss"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              稍后
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const install = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('PWA installed')
  }

  deferredPrompt = null
  showPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
}

const dismiss = () => {
  showPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')

  // Show again after 7 days
  const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem('pwa-install-dismissed-until', dismissedUntil.toString())
}

onMounted(() => {
  // Check if already dismissed recently
  const dismissedUntil = localStorage.getItem('pwa-install-dismissed-until')
  if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
    return
  }

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent

    // Show prompt after a short delay
    setTimeout(() => {
      showPrompt.value = true
    }, 3000)
  })

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showPrompt.value = false
  })
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
