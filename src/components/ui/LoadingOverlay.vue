<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4">
          <LoadingSpinner size="lg" color="primary" />
          <p v-if="message" class="mt-4 text-center text-gray-700 font-medium">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  show: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: '加载中...',
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
