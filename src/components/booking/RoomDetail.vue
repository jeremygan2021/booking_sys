<template>
  <div class="room-detail">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="fetchRoomType"
        class="mt-4 px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark"
      >
        重试
      </button>
    </div>

    <div v-else-if="roomType" class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <button
        @click="goBack"
        class="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回房间列表
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 图片展示 -->
        <div>
          <div class="relative h-96 rounded-lg overflow-hidden mb-4">
            <img :src="currentImage" :alt="roomType.name" class="w-full h-full object-cover" />
          </div>

          <!-- 图片缩略图 -->
          <div v-if="roomType.images && roomType.images.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="(image, index) in roomType.images"
              :key="index"
              class="h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
              :class="currentImageIndex === index ? 'border-gold' : 'border-transparent'"
              @click="currentImageIndex = index"
            >
              <img
                :src="getImageUrl(image)"
                :alt="`${roomType.name} ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- 房间信息 -->
        <div>
          <h1 class="text-4xl font-playfair font-bold text-gray-800 mb-4">{{ roomType.name }}</h1>

          <div class="flex items-center mb-6">
            <span class="text-3xl font-bold text-gold">¥{{ roomType.base_price }}</span>
            <span class="text-gray-600 ml-2">/ 晚</span>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">房间介绍</h2>
            <p class="text-gray-600 leading-relaxed">{{ roomType.description }}</p>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">房间信息</h2>
            <div class="space-y-2">
              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                最多容纳 {{ roomType.max_occupancy }} 人
              </div>
            </div>
          </div>

          <div v-if="roomType.amenities && roomType.amenities.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">房间设施</h2>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(amenity, index) in roomType.amenities"
                :key="index"
                class="flex items-center text-gray-600"
              >
                <svg class="w-4 h-4 mr-2 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ amenity }}
              </div>
            </div>
          </div>

          <!-- 预订按钮 -->
          <button
            @click="bookRoom"
            class="w-full py-4 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors duration-300 font-semibold text-lg"
          >
            立即预订
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RoomType } from '@/types'

const router = useRouter()
const route = useRoute()

// 状态
const roomType = ref<RoomType | null>(null)
const loading = ref(false)
const error = ref('')
const currentImageIndex = ref(0)

// 当前显示的图片
const currentImage = computed(() => {
  if (roomType.value?.images && roomType.value.images.length > 0) {
    const imagePath = roomType.value.images[currentImageIndex.value]
    // 如果是完整URL，直接返回
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    // 图片在服务器根路径，不在 /api 路径下
    const serverUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'
    return `${serverUrl}${imagePath}`
  }
  return 'https://via.placeholder.com/800x600?text=Room+Image'
})

// 获取图片URL的辅助函数
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://via.placeholder.com/200x150?text=Image'
  if (imagePath.startsWith('http')) return imagePath
  const serverUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'
  return `${serverUrl}${imagePath}`
}

// 获取房间类型详情
const fetchRoomType = async () => {
  loading.value = true
  error.value = ''

  try {
    const roomId = route.params.id
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiBase}/rooms/types/${roomId}`)
    const data = await response.json()

    if (data.success) {
      roomType.value = data.data
    } else {
      error.value = '获取房间信息失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error('Error fetching room type:', err)
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 预订房间
const bookRoom = () => {
  router.push({
    name: 'room-booking',
    query: { roomTypeId: roomType.value?.id },
  })
}

onMounted(() => {
  fetchRoomType()
})
</script>

<style scoped>
.bg-cream {
  background-color: #faf9f6;
}

.bg-gold {
  background-color: #d4af37;
}

.bg-gold-dark {
  background-color: #b8941f;
}

.bg-navy {
  background-color: #1e3a8a;
}

.bg-navy-dark {
  background-color: #1e40af;
}

.text-gold {
  color: #d4af37;
}

.border-gold {
  border-color: #d4af37;
}

.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>
