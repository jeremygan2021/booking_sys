<template>
  <header class="bg-white shadow-md sticky top-0 z-50 border-b-2 border-gold/20">
    <Container>
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo and Brand -->
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="french-ornament">
            <svg class="w-8 h-8 md:w-10 md:h-10 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
              />
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="font-playfair text-xl md:text-2xl font-bold text-deep-blue">爱云香舍</h1>
            <p class="font-dancing text-xs md:text-sm text-gold -mt-1">Maison de Charme</p>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            active-class="nav-link-active"
          >
            {{ item.label }}
          </router-link>

          <!-- Auth Links -->
          <template v-if="isAuthenticated">
            <router-link to="/admin" class="nav-link" active-class="nav-link-active"
              >管理后台</router-link
            >
            <button @click="handleLogout" class="nav-link">退出</button>
          </template>
          <router-link v-else to="/login" class="nav-link" active-class="nav-link-active"
            >登录</router-link
          >
        </nav>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!isMobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <nav v-if="isMobileMenuOpen" class="md:hidden py-4 border-t border-gray-100">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </router-link>

          <!-- Mobile Auth Links -->
          <template v-if="isAuthenticated">
            <router-link
              to="/admin"
              class="mobile-nav-link"
              active-class="mobile-nav-link-active"
              @click="closeMobileMenu"
            >
              管理后台
            </router-link>
            <button @click="handleLogout" class="mobile-nav-link w-full text-left">退出</button>
          </template>
          <router-link
            v-else
            to="/login"
            class="mobile-nav-link"
            active-class="mobile-nav-link-active"
            @click="closeMobileMenu"
          >
            登录
          </router-link>
        </nav>
      </transition>
    </Container>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Container from '../ui/Container.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isAuthenticated, logout } = useAuth()

interface NavigationItem {
  label: string
  path: string
}

const navigationItems: NavigationItem[] = [
  { label: '首页', path: '/' },
  { label: '房间预订', path: '/booking/rooms' },
  { label: '餐厅订餐', path: '/booking/restaurant' },
  { label: '关于我们', path: '/about' },
]

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  logout()
  closeMobileMenu()
  router.push('/login')
}
</script>

<style scoped>
.french-ornament {
  position: relative;
}

.french-ornament::before {
  content: '';
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  bottom: -0.25rem;
  left: -0.25rem;
  background-color: rgba(212, 175, 55, 0.1);
  border-radius: 9999px;
  filter: blur(4px);
}

.nav-link {
  position: relative;
  font-weight: 500;
  color: #374151;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #d4af37;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #d4af37;
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link-active {
  color: #d4af37;
}

.nav-link-active::after {
  width: 100%;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1rem;
  color: #374151;
  transition: all 0.2s;
  border-radius: 0.5rem;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background-color: rgba(212, 175, 55, 0.05);
  color: #d4af37;
}

.mobile-nav-link-active {
  background-color: rgba(212, 175, 55, 0.1);
  color: #d4af37;
}
</style>
