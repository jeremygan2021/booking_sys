<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  padding: true,
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto w-full'

  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  }

  const paddingClass = props.padding ? 'px-4 sm:px-6 lg:px-8' : ''

  return [baseClasses, sizeClasses[props.size], paddingClass].filter(Boolean).join(' ')
})
</script>
