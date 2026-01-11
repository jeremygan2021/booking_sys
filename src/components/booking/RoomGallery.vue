<template>
  <div class="room-gallery">
    <!-- 筛选和搜索 -->
    <div class="filters-section mb-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="w-full md:w-auto">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索房间..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div class="flex gap-4 w-full md:w-auto">
            <select
              v-model="priceFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">所有价格</option>
              <option value="low">低价 (&lt; ¥500)</option>
              <option value="medium">中价 (¥500-¥1000)</option>
              <option value="high">高价 (&gt; ¥1000)</option>
            </select>
            <select
              v-model="occupancyFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">所有容量</option>
              <option value="1">1人</option>
              <option value="2">2人</option>
              <option value="3">3人+</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="container mx-auto px-4">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="fetchRoomTypes"
          class="mt-4 px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark"
        >
          重试
        </button>
      </div>

      <div v-else-if="filteredRooms.length === 0" class="text-center py-12">
        <p class="text-gray-600">没有找到符合条件的房间</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          @click="selectRoom(room)"
        >
          <!-- 房间图片 -->
          <div class="relative h-64 overflow-hidden">
            <img
              :src="getRoomImage(room)"
              :alt="room.name"
              class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
            <div
              class="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              ¥{{ room.base_price }}/晚
            </div>
          </div>

          <!-- 房间信息 -->
          <div class="p-6">
            <h3 class="text-2xl font-playfair font-bold text-gray-800 mb-2">{{ room.name }}</h3>
            <p class="text-gray-600 mb-4 line-clamp-2">{{ room.description }}</p>

            <!-- 房间设施 -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="(amenity, index) in getAmenities(room)"
                :key="index"
                class="px-3 py-1 bg-cream text-gray-700 rounded-full text-sm"
              >
                {{ amenity }}
              </span>
            </div>

            <!-- 容纳人数 -->
            <div class="flex items-center text-gray-600 mb-4">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              最多容纳 {{ room.max_occupancy }} 人
            </div>

            <!-- 查看详情按钮 -->
            <button
              class="w-full py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors duration-300 font-semibold"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RoomType } from '@/types'

const router = useRouter()

// 状态
const roomTypes = ref<RoomType[]>([])
const loading = ref(false)
const error = ref('')

// 筛选条件
const searchQuery = ref('')
const priceFilter = ref('')
const occupancyFilter = ref('')

// 获取房间类型数据
const fetchRoomTypes = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms/types`)
    const data = await response.json()

    if (data.success) {
      roomTypes.value = data.data
    } else {
      error.value = '获取房间信息失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error('Error fetching room types:', err)
  } finally {
    loading.value = false
  }
}

// 筛选房间
const filteredRooms = computed(() => {
  let filtered = roomTypes.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (room) =>
        room.name.toLowerCase().includes(query) || room.description?.toLowerCase().includes(query),
    )
  }

  // 价格筛选
  if (priceFilter.value) {
    filtered = filtered.filter((room) => {
      const price = parseFloat(room.base_price)
      switch (priceFilter.value) {
        case 'low':
          return price < 500
        case 'medium':
          return price >= 500 && price <= 1000
        case 'high':
          return price > 1000
        default:
          return true
      }
    })
  }

  // 容量筛选
  if (occupancyFilter.value) {
    const occupancy = parseInt(occupancyFilter.value)
    filtered = filtered.filter((room) => {
      if (occupancy === 3) {
        return room.max_occupancy >= 3
      }
      return room.max_occupancy >= occupancy
    })
  }

  return filtered
})

// 获取房间图片
const getRoomImage = (room: RoomType) => {
  if (room.images && Array.isArray(room.images) && room.images.length > 0) {
    return room.images[0]
  }
  return 'https://via.placeholder.com/400x300?text=Room+Image'
}

// 获取设施列表
const getAmenities = (room: RoomType) => {
  if (room.amenities && Array.isArray(room.amenities)) {
    return room.amenities.slice(0, 3) // 只显示前3个
  }
  return []
}

// 选择房间
const selectRoom = (room: RoomType) => {
  router.push({
    name: 'room-detail',
    params: { id: room.id },
  })
}

onMounted(() => {
  fetchRoomTypes()
})
</script>

<style scoped>
.room-gallery {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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

.ring-gold {
  --tw-ring-color: #d4af37;
}

.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>
