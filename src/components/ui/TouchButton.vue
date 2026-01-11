<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'relative overflow-hidden transition-all duration-200',
      'active:scale-95 touch-manipulation',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      className,
    ]"
    @click="handleClick"
  >
    <!-- Ripple effect -->
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      :class="['absolute rounded-full bg-white/30 pointer-events-none animate-ripple']"
      :style="{
        left: `${ripple.x}px`,
        top: `${ripple.y}px`,
        width: `${ripple.size}px`,
        height: `${ripple.size}px`,
      }"
    ></span>

    <!-- Loading spinner -->
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- Button content -->
    <span :class="['relative flex items-center justify-center gap-2', loading ? 'invisible' : '']">
      <slot name="icon-left"></slot>
      <slot></slot>
      <slot name="icon-right"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  className: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const ripples = ref<Ripple[]>([])

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

const variantClasses = {
  primary: 'bg-gold text-white hover:bg-gold-dark focus:ring-gold',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
  outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-white focus:ring-gold',
  ghost: 'text-gold hover:bg-gold/10 focus:ring-gold',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return

  // Create ripple effect
  const button = event.currentTarget as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  const ripple: Ripple = {
    id: Date.now(),
    x,
    y,
    size,
  }

  ripples.value.push(ripple)

  // Remove ripple after animation
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== ripple.id)
  }, 600)

  emit('click', event)
}
</script>

<style scoped>
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}

/* Improve touch target size */
button {
  min-height: 44px;
  min-width: 44px;
}
</style>
