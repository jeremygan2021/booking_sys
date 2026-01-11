<template>
  <div :class="containerClasses">
    <div v-if="!$slots.default" :class="lineClasses"></div>
    <template v-else>
      <div :class="lineClasses"></div>
      <span :class="textClasses">
        <slot />
      </span>
      <div :class="lineClasses"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'solid' | 'dashed' | 'dotted' | 'elegant'
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  orientation: 'horizontal',
  spacing: 'md',
})

const containerClasses = computed(() => {
  const baseClasses = 'flex items-center'

  const orientationClasses = {
    horizontal: 'w-full',
    vertical: 'h-full flex-col',
  }

  const spacingClasses = {
    sm: props.orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: props.orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: props.orientation === 'horizontal' ? 'my-6' : 'mx-6',
  }

  return [baseClasses, orientationClasses[props.orientation], spacingClasses[props.spacing]].join(
    ' ',
  )
})

const lineClasses = computed(() => {
  const baseClasses = 'flex-1'

  const variantClasses = {
    solid: 'border-gray-200',
    dashed: 'border-gray-200 border-dashed',
    dotted: 'border-gray-200 border-dotted',
    elegant: 'border-gold',
  }

  const borderClass = props.orientation === 'horizontal' ? 'border-t' : 'border-l'

  return [baseClasses, variantClasses[props.variant], borderClass].join(' ')
})

const textClasses = computed(() => {
  return props.orientation === 'horizontal'
    ? 'px-3 text-sm text-gray-500 font-medium'
    : 'py-3 text-sm text-gray-500 font-medium'
})
</script>
