<template>
  <div class="w-full">
    <div v-if="label" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm text-gray-500">{{ progress }}%</span>
    </div>
    <div :class="['w-full bg-gray-200 rounded-full overflow-hidden', heightClasses[size]]">
      <div
        :class="['h-full transition-all duration-300 ease-out', colorClasses[color]]"
        :style="{ width: `${progress}%` }"
      >
        <div v-if="animated" class="h-full w-full animate-pulse bg-white/20"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  progress: 0,
  label: '',
  size: 'md',
  color: 'primary',
  animated: false,
})

const heightClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const colorClasses = {
  primary: 'bg-gold',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}
</script>
