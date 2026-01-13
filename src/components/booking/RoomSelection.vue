<template>
  <div class="room-selection">
    <h3 class="text-2xl font-playfair font-bold text-gray-900 mb-6">选择房间</h3>
    <p class="text-gray-600 mb-8">请选择适合您的用餐空间</p>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- 房间列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="room in rooms"
        :key="room.id"
        @click="selectRoom(room)"
        :class="[
          'room-card cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-xl',
          selectedRoom?.id === room.id ? 'border-gold shadow-lg' : 'border-gray-200',
        ]"
      >
        <!-- 房间图片 -->
        <div class="relative h-48 overflow-hidden">
          <img
            :src="room.image"
            :alt="room.name"
            class="w-full h-full object-cover transition-transform hover:scale-105"
          />
          <div
            v-if="selectedRoom?.id === room.id"
            class="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold"
          >
            已选择
          </div>
        </div>

        <!-- 房间信息 -->
        <div class="p-6">
          <h4 class="text-xl font-semibold text-gray-900 mb-2">{{ room.name }}</h4>
          <p class="text-gray-600 text-sm mb-4">{{ room.description }}</p>

          <!-- 设施标签 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="facility in room.facilities"
              :key="facility"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {{ facility }}
            </span>
          </div>

          <!-- 容纳人数 -->
          <div class="flex items-center text-gray-700">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span class="text-sm">可容纳 {{ room.capacity }} 人</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Room {
  id: string
  name: string
  description: string
  image: string
  facilities: string[]
  capacity: number
  type: string
  room_type?: string
  images?: string[]
}

const selectedRoom = defineModel<Room | null>({ default: null })

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const selectRoom = (room: Room) => {
  selectedRoom.value = room
}

// 从后端加载房间数据
onMounted(async () => {
  try {
    loading.value = true
    const response = await fetch('/api/dining-rooms?is_available=true')
    const result = await response.json()

    if (result.success) {
      // 转换数据格式以匹配组件接口
      rooms.value = result.data.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        image: room.images && room.images.length > 0 ? room.images[0] : '/images/rooms/default.svg',
        facilities: room.facilities || [],
        capacity: room.capacity,
        type: room.room_type,
        images: room.images || [],
      }))
    } else {
      error.value = '加载房间数据失败'
    }
  } catch (err) {
    console.error('加载房间数据失败:', err)
    error.value = '加载房间数据失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.room-card {
  transition: all 0.3s ease;
}

.room-card:hover {
  transform: translateY(-4px);
}
</style>
