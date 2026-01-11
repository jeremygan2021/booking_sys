<template>
  <footer class="bg-deep-blue text-white mt-auto">
    <!-- Decorative Top Border -->
    <div class="h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

    <Container>
      <div class="py-12">
        <Grid :cols="3" gap="lg" class="mb-8">
          <!-- Brand Section -->
          <div class="col-span-3 md:col-span-1">
            <div class="flex items-center space-x-3 mb-4">
              <svg class="w-10 h-10 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
                />
              </svg>
              <div>
                <h3 class="font-playfair text-xl font-bold">爱云香舍</h3>
                <p class="font-dancing text-sm text-gold">Maison de Charme</p>
              </div>
            </div>
            <p class="text-sm text-gray-300 leading-relaxed">
              体验法式优雅与中式温馨的完美融合，在爱云香舍开启您的浪漫之旅。
            </p>
          </div>

          <!-- Quick Links -->
          <div class="col-span-3 sm:col-span-1 md:col-span-1">
            <h4 class="font-playfair text-lg font-semibold mb-4 text-gold">快速链接</h4>
            <ul class="space-y-2">
              <li v-for="link in quickLinks" :key="link.path">
                <router-link
                  :to="link.path"
                  class="text-sm text-gray-300 hover:text-gold transition-colors duration-200 inline-flex items-center group"
                >
                  <span
                    class="w-1.5 h-1.5 bg-gold rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  ></span>
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="col-span-3 sm:col-span-1 md:col-span-1">
            <h4 class="font-playfair text-lg font-semibold mb-4 text-gold">联系我们</h4>
            <ul class="space-y-3">
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-gold mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="text-sm text-gray-300">中国·云南·大理</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-gold mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@aiyunxiangshe.com"
                  class="text-sm text-gray-300 hover:text-gold transition-colors"
                >
                  info@aiyunxiangshe.com
                </a>
              </li>
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-gold mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span class="text-sm text-gray-300">+86 123 4567 8900</span>
              </li>
            </ul>
          </div>
        </Grid>

        <!-- Decorative Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/20"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-4 bg-deep-blue">
              <svg class="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </span>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-sm text-gray-400">© {{ currentYear }} 爱云香舍. All rights reserved.</p>
          <div class="flex items-center space-x-6">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              :aria-label="social.name"
              class="text-gray-400 hover:text-gold transition-colors duration-200"
            >
              <component :is="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </Container>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Container from '../ui/Container.vue'
import Grid from '../ui/Grid.vue'

interface QuickLink {
  label: string
  path: string
}

interface SocialLink {
  name: string
  url: string
  icon: string
}

const quickLinks: QuickLink[] = [
  { label: '首页', path: '/' },
  { label: '房间预订', path: '/booking/rooms' },
  { label: '餐厅订餐', path: '/booking/restaurant' },
  { label: '关于我们', path: '/about' },
  { label: '联系我们', path: '/contact' },
]

const socialLinks: SocialLink[] = [
  { name: 'WeChat', url: '#', icon: 'IconWeChat' },
  { name: 'Weibo', url: '#', icon: 'IconWeibo' },
  { name: 'Instagram', url: '#', icon: 'IconInstagram' },
]

const currentYear = computed(() => new Date().getFullYear())
</script>
