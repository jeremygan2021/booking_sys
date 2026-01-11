<template>
  <div class="admin-dashboard">
    <!-- Mobile Menu Toggle -->
    <button
      @click="toggleSidebar"
      class="mobile-menu-toggle lg:hidden fixed top-4 left-4 z-50 bg-deep-blue text-white p-2 rounded-lg shadow-lg"
    >
      <svg
        v-if="!sidebarOpen"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      :class="[
        'admin-sidebar',
        { 'sidebar-open': sidebarOpen },
        'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-40',
      ]"
    >
      <div class="sidebar-header">
        <div class="logo-section">
          <h1 class="text-xl font-bold text-deep-blue">爱云香舍</h1>
          <p class="text-sm text-gray-600">管理后台</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          @click="closeSidebarOnMobile"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div v-if="user" class="user-info">
          <div class="user-avatar">
            {{ user.fullName?.charAt(0) || 'A' }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ user.fullName }}</p>
            <p class="user-role">管理员</p>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="closeSidebar"
      class="sidebar-overlay lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>

    <!-- Main Content -->
    <main class="admin-main">
      <div class="admin-header">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ currentPageTitle }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ currentPageDescription }}</p>
          </div>
          <div class="header-actions">
            <button class="action-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="admin-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ref, computed, h } from 'vue'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

const sidebarOpen = ref(false)

// Navigation items with icons
const navItems = [
  {
    path: '/admin/content',
    label: '内容管理',
    icon: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        }),
      ),
  },
  {
    path: '/admin/bookings',
    label: '预订管理',
    icon: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        }),
      ),
  },
  {
    path: '/admin/menu',
    label: '菜单管理',
    icon: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        }),
      ),
  },
  {
    path: '/admin/timeslots',
    label: '时间配置',
    icon: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        }),
      ),
  },
  {
    path: '/admin/calendar',
    label: '日历视图',
    icon: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        }),
      ),
  },
]

const currentPageTitle = computed(() => {
  const item = navItems.find((item) => item.path === route.path)
  return item?.label || '管理后台'
})

const currentPageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    'admin-content': '管理房间和餐厅的内容信息',
    'admin-bookings': '查看和管理所有预订记录',
    'admin-menu': '管理餐厅菜系和套餐',
    'admin-timeslots': '配置早餐、午餐和晚餐的时间段',
    'admin-calendar': '统一查看预订日历',
  }
  return descriptions[route.name as string] || '欢迎使用管理系统'
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 1024) {
    closeSidebar()
  }
}

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Sidebar Styles */
.admin-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.logo-section h1 {
  color: var(--color-deep-blue);
  font-family: 'Playfair Display', serif;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: var(--color-deep-blue);
}

.nav-item.router-link-active {
  background-color: var(--color-deep-blue);
  color: white;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.sidebar-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-deep-blue), var(--color-gold));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fecaca;
}

/* Mobile Sidebar */
@media (max-width: 1023px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }
}

.sidebar-overlay {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Main Content */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  background-color: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.mobile-menu-toggle {
  background-color: var(--color-deep-blue);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-header {
    padding: 1rem 1.5rem;
  }

  .admin-content {
    padding: 1rem;
  }

  .mobile-menu-toggle {
    top: 1rem;
    left: 1rem;
  }
}

@media (min-width: 1024px) {
  .admin-sidebar {
    position: sticky;
    top: 0;
  }
}
</style>
