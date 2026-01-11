<template>
  <div class="restaurant-gallery">
    <!-- 主图展示 -->
    <div class="main-image-container">
      <div v-if="loading" class="loading-skeleton">
        <div class="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
      </div>
      <div v-else-if="currentImage" class="relative">
        <img
          :src="currentImage"
          :alt="content.title || '餐厅'"
          class="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        <!-- 图片导航按钮 -->
        <button
          v-if="images.length > 1"
          @click="previousImage"
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
          aria-label="上一张"
        >
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          v-if="images.length > 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
          aria-label="下一张"
        >
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <!-- 图片指示器 -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
        >
          <button
            v-for="(_, index) in images"
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-2 h-2 rounded-full transition-all',
              index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50',
            ]"
            :aria-label="`查看第 ${index + 1} 张图片`"
          ></button>
        </div>
      </div>
      <div v-else class="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
        <p class="text-gray-400">暂无图片</p>
      </div>
    </div>

    <!-- 餐厅介绍 -->
    <div class="mt-8">
      <h2 class="text-3xl font-playfair font-bold text-gray-900 mb-4">
        {{ content.title || '爱云香舍餐厅' }}
      </h2>
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-700 leading-relaxed whitespace-pre-line">
          {{ content.content || '欢迎来到爱云香舍餐厅，体验法式优雅与中式美食的完美融合。' }}
        </p>
      </div>
    </div>

    <!-- 特色展示 -->
    <div v-if="features.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="bg-cream p-6 rounded-lg border border-gold/20"
      >
        <div class="text-gold text-3xl mb-3">{{ feature.icon }}</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
        <p class="text-gray-600">{{ feature.description }}</p>
      </div>
    </div>

    <!-- 缩略图网格 -->
    <div v-if="images.length > 1" class="mt-8">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">更多图片</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="currentImageIndex = index"
          :class="[
            'relative overflow-hidden rounded-lg transition-all',
            index === currentImageIndex ? 'ring-2 ring-gold' : 'hover:opacity-80',
          ]"
        >
          <img :src="image" :alt="`餐厅图片 ${index + 1}`" class="w-full h-32 object-cover" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface RestaurantContent {
  section_key: string
  title: string
  content: string
  images: string[]
  metadata: {
    features?: Array<{
      icon: string
      title: string
      description: string
    }>
  }
}

const loading = ref(true)
const content = ref<RestaurantContent>({
  section_key: 'restaurant',
  title: '爱云香舍餐厅',
  content:
    '欢迎来到爱云香舍餐厅，体验法式优雅与中式美食的完美融合。我们的餐厅提供精致的用餐环境，专业的服务团队，以及多样化的菜系选择。无论是午餐还是晚餐，我们都将为您带来难忘的美食体验。',
  images: [],
  metadata: {},
})
const currentImageIndex = ref(0)

const images = computed(() => content.value.images || [])
const currentImage = computed(() => images.value[currentImageIndex.value])
const features = computed(
  () =>
    content.value.metadata?.features || [
      {
        icon: '🍽️',
        title: '精致法式',
        description: '融合法式烹饪技艺，呈现优雅美食体验',
      },
      {
        icon: '🌿',
        title: '新鲜食材',
        description: '精选当季食材，确保每道菜品的品质',
      },
      {
        icon: '✨',
        title: '优雅环境',
        description: '法式装饰风格，营造浪漫用餐氛围',
      },
    ],
)

const nextImage = () => {
  if (images.value.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length
  }
}

const previousImage = () => {
  if (images.value.length > 0) {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + images.value.length) % images.value.length
  }
}

const fetchRestaurantContent = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/restaurant/content')
    const data = await response.json()

    if (data.success && data.data) {
      content.value = data.data
    }
  } catch (error) {
    console.error('获取餐厅内容失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRestaurantContent()
})
</script>

<style scoped>
.restaurant-gallery {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.prose {
  color: #374151;
}
</style>
