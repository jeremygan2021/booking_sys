<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 bg-black/50" @click="close"></div>
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="modelValue"
        ref="sheetRef"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Drag handle -->
        <div class="flex justify-center py-3 cursor-grab active:cursor-grabbing">
          <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <!-- Header -->
        <div v-if="title || $slots.header" class="px-6 pb-4 border-b border-gray-200">
          <slot name="header">
            <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
          </slot>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  closeOnSwipeDown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeOnSwipeDown: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sheetRef = ref<HTMLElement | null>(null)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const close = () => {
  emit('update:modelValue', false)
}

const handleTouchStart = (e: TouchEvent) => {
  if (!props.closeOnSwipeDown) return

  const touch = e.touches[0]
  if (!touch) return

  startY.value = touch.clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !sheetRef.value) return

  const touch = e.touches[0]
  if (!touch) return

  currentY.value = touch.clientY
  const deltaY = currentY.value - startY.value

  // Only allow downward swipe
  if (deltaY > 0) {
    sheetRef.value.style.transform = `translateY(${deltaY}px)`
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value || !sheetRef.value) return

  const deltaY = currentY.value - startY.value

  // Close if swiped down more than 100px
  if (deltaY > 100) {
    close()
  }

  // Reset position
  sheetRef.value.style.transform = ''
  isDragging.value = false
}
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
