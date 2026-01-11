<template>
  <aside :class="sidebarClasses">
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
            />
          </svg>
        </div>
        <div>
          <h2 class="font-playfair text-lg font-bold text-deep-blue">管理后台</h2>
          <p class="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>
    </div>

    <!-- Navigation Items -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link :to="item.path" :class="menuItemClasses" active-class="menu-item-active">
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
            <Badge v-if="item.badge" variant="gold" size="sm" class="ml-auto">
              {{ item.badge }}
            </Badge>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-gray-200">
      <button
        class="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        @click="handleLogout"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span class="font-medium">退出登录</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '../ui/Badge.vue'

interface MenuItem {
  label: string
  path: string
  icon: string
  badge?: string | number
}

interface Props {
  menuItems: MenuItem[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  logout: []
}>()

const sidebarClasses = computed(() => {
  const baseClasses = 'flex flex-col bg-white border-r border-gray-200 transition-all duration-300'
  const widthClass = props.collapsed ? 'w-20' : 'w-64'
  return [baseClasses, widthClass].join(' ')
})

const menuItemClasses = computed(() => {
  return 'flex items-center space-x-3 px-4 py-3 text-text-gray hover:bg-gold/5 hover:text-gold rounded-lg transition-all duration-200 font-medium'
})

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.menu-item-active {
  background-color: rgba(212, 175, 55, 0.1);
  color: #d4af37;
}

.menu-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 0.25rem;
  height: 2rem;
  background-color: #d4af37;
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>
