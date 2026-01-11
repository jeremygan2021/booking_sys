<template>
  <nav :class="navClasses">
    <ul class="flex items-center space-x-1">
      <li v-for="(item, index) in items" :key="item.path">
        <router-link :to="item.path" :class="linkClasses" active-class="nav-item-active">
          <component v-if="item.icon" :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>
        <span v-if="showDividers && index < items.length - 1" class="mx-2 text-gray-300"> / </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NavigationItem {
  label: string
  path: string
  icon?: string
}

interface Props {
  items: NavigationItem[]
  variant?: 'horizontal' | 'vertical'
  showDividers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
  showDividers: false,
})

const navClasses = computed(() => {
  return props.variant === 'horizontal' ? 'flex items-center' : 'flex flex-col space-y-2'
})

const linkClasses = computed(() => {
  const baseClasses =
    'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200'
  const hoverClasses = 'hover:bg-gold/10 hover:text-gold'
  const activeClasses = 'text-text-gray'

  return [baseClasses, hoverClasses, activeClasses].join(' ')
})
</script>

<style scoped>
.nav-item-active {
  background-color: rgba(212, 175, 55, 0.1);
  color: #d4af37;
}
</style>
