<template>
  <div :class="['flex items-center justify-center', containerClass]">
    <div
      :class="[
        'animate-spin rounded-full border-t-2 border-b-2',
        sizeClasses[size],
        colorClasses[color],
      ]"
    ></div>
    <span v-if="text" :class="['ml-3 text-sm', textColorClasses[color]]">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  text: '',
  containerClass: '',
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const colorClasses = {
  primary: 'border-gold',
  white: 'border-white',
  gray: 'border-gray-600',
}

const textColorClasses = {
  primary: 'text-gray-700',
  white: 'text-white',
  gray: 'text-gray-600',
}
</script>
