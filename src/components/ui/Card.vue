<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="text-xl font-playfair font-semibold text-text-gray">
          {{ title }}
        </h3>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'elegant' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200'

  const variantClasses = {
    default: 'shadow-md border border-gray-100',
    elegant: 'shadow-lg shadow-gray-200/50 border-2 border-gold',
    bordered: 'border-2 border-gray-200',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const hoverClass = props.hoverable ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''

  return [baseClasses, variantClasses[props.variant], paddingClasses[props.padding], hoverClass]
    .filter(Boolean)
    .join(' ')
})
</script>

<style scoped>
.card-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.card-body {
  color: #374151;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}
</style>
