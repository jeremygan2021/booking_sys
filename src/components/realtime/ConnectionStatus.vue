<template>
  <div
    v-if="showStatus"
    class="fixed bottom-4 right-4 z-50 transition-all duration-300"
    :class="{ 'opacity-0': !visible }"
  >
    <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg" :class="statusClasses">
      <!-- Status Icon -->
      <div class="relative">
        <div
          v-if="realtimeStore.isConnected"
          class="w-3 h-3 rounded-full bg-green-500 animate-pulse"
        ></div>
        <div
          v-else-if="realtimeStore.isOnline"
          class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"
        ></div>
        <div v-else class="w-3 h-3 rounded-full bg-red-500"></div>
      </div>

      <!-- Status Text -->
      <div class="text-sm font-medium">
        <span v-if="realtimeStore.isConnected">实时连接已建立</span>
        <span v-else-if="realtimeStore.isOnline">正在连接...</span>
        <span v-else>离线模式</span>
      </div>

      <!-- Pending Updates Badge -->
      <div
        v-if="realtimeStore.hasPendingUpdates"
        class="px-2 py-1 rounded-full bg-white bg-opacity-20 text-xs font-semibold"
      >
        {{ realtimeStore.pendingUpdates.length }} 待同步
      </div>

      <!-- Close Button -->
      <button
        @click="hideStatus"
        class="ml-2 p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Last Sync Time -->
    <div
      v-if="realtimeStore.lastSyncTime && realtimeStore.isConnected"
      class="mt-2 text-xs text-gray-500 text-right"
    >
      最后同步: {{ formatSyncTime(realtimeStore.lastSyncTime) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRealtimeStore } from '@/stores/realtime'

const realtimeStore = useRealtimeStore()

const visible = ref(true)
const showStatus = ref(false)
const autoHideTimer = ref<number | null>(null)

const statusClasses = computed(() => {
  if (realtimeStore.isConnected) {
    return 'bg-green-500 text-white'
  } else if (realtimeStore.isOnline) {
    return 'bg-yellow-500 text-white'
  } else {
    return 'bg-red-500 text-white'
  }
})

const formatSyncTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return `${seconds}秒前`
  }
}

const hideStatus = () => {
  visible.value = false
  setTimeout(() => {
    showStatus.value = false
  }, 300)
}

const showStatusTemporarily = () => {
  showStatus.value = true
  visible.value = true

  // Auto-hide after 5 seconds if connected
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }

  if (realtimeStore.isConnected) {
    autoHideTimer.value = window.setTimeout(() => {
      hideStatus()
    }, 5000)
  }
}

// Watch for connection changes
watch(
  () => realtimeStore.isConnected,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      showStatusTemporarily()
    }
  },
)

watch(
  () => realtimeStore.isOnline,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      showStatusTemporarily()
    }
  },
)

onMounted(() => {
  // Show status initially
  showStatusTemporarily()
})
</script>

<style scoped>
/* Styles are inline in the template */
</style>
