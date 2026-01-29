<template>
  <div class="room-manager">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">客房管理</h2>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/90 transition-all"
      >
        + 添加房间
      </button>
    </div>

    <!-- 房间列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <!-- 房间图片 (使用房型的第一张图片) -->
        <div class="relative h-48 bg-gray-200">
          <img
            v-if="(room.images || []).length > 0"
            :src="(room.images || [])[0]"
            :alt="room.room_number"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            暂无图片
          </div>
          <div
            :class="[
              'absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold',
              room.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
            ]"
          >
            {{ getStatusLabel(room.status) }}
          </div>
        </div>

        <!-- 房间信息 -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ room.room_number }}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ room.description || '—' }}</p>

          <!-- 房间类型和容量 -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-500">{{ room.room_type_name }}</span>
            <span class="text-sm text-gray-700 font-medium">容纳 {{ room.max_occupancy }} 人</span>
          </div>

          <!-- 设施标签 -->
          <div class="flex flex-wrap gap-1 mb-4">
            <span
              v-for="(amenity, index) in (room.amenities || []).slice(0, 3)"
              :key="index"
              class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {{ amenity }}
            </span>
            <span
              v-if="(room.amenities || []).length > 3"
              class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              +{{ (room.amenities || []).length - 3 }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <!-- 房间信息主要由房型决定，这里主要提供删除功能，或者简单的状态修改 -->
            <button
              @click="deleteRoom(room.id)"
              class="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建模态框 -->
    <AdminModal v-model:modelValue="showModal" title="添加房间">
      <form @submit.prevent="saveRoom" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">房间号</label>
          <input
            v-model="formData.room_number"
            type="text"
            required
            placeholder="例如：101"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">房间类型</label>
          <select
            v-model="formData.room_type_id"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          >
            <option v-for="type in roomTypes" :key="type.id" :value="type.id">
              {{ type.name }} ({{ type.max_occupancy }}人, ¥{{ type.base_price }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            v-model="formData.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          >
            <option value="available">空闲</option>
            <option value="maintenance">维护中</option>
            <option value="occupied">已占用</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="showModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/90 transition-all"
          >
            保存
          </button>
        </div>
      </form>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AdminModal from './AdminModal.vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const authStore = useAuthStore()

interface RoomType {
  id: string
  name: string
  base_price: string
  max_occupancy: number
  description: string
  amenities: string[]
  images: string[]
}

interface Room {
  id: string
  room_number: string
  status: string
  room_type_id: string
  room_type_name: string
  description: string
  base_price: string
  max_occupancy: number
  amenities: string[]
  images: string[]
}

const rooms = ref<Room[]>([])
const roomTypes = ref<RoomType[]>([])
const showModal = ref(false)

const formData = ref({
  room_number: '',
  room_type_id: '',
  status: 'available',
})

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    available: '空闲',
    maintenance: '维护中',
    occupied: '已占用',
  }
  return labels[status] || status
}

const loadRoomTypes = async () => {
  try {
    const response = await fetch(`${API_BASE}/rooms/types`)
    const result = await response.json()
    if (result.success) {
      roomTypes.value = result.data
    }
  } catch (error) {
    console.error('加载房型失败:', error)
  }
}

const loadRooms = async () => {
  try {
    const response = await fetch(`${API_BASE}/rooms`)
    const result = await response.json()
    if (result.success) {
      rooms.value = result.data
    }
  } catch (error) {
    console.error('加载房间失败:', error)
  }
}

const openCreateModal = () => {
  formData.value = {
    room_number: '',
    room_type_id: roomTypes.value[0]?.id || '',
    status: 'available',
  }
  showModal.value = true
}

const saveRoom = async () => {
  try {
    const token = authStore.token ?? localStorage.getItem('auth_token')
    const url = `${API_BASE}/rooms`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData.value),
    })

    const result = await response.json()

    if (result.success) {
      alert('房间创建成功')
      showModal.value = false
      loadRooms()
    } else {
      const msg = result.error?.message || result.error?.code || '操作失败'
      alert(typeof msg === 'string' ? msg : '操作失败')
    }
  } catch (error) {
    console.error('保存房间失败:', error)
    alert('保存房间失败')
  }
}

const deleteRoom = async (id: string) => {
  if (!confirm('确定要删除这个房间吗？')) return

  try {
    const token = authStore.token ?? localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (result.success) {
      alert('房间删除成功')
      loadRooms()
    } else {
      const msg = result.error?.message || result.error?.code || '删除失败'
      alert(typeof msg === 'string' ? msg : '删除失败')
    }
  } catch (error) {
    console.error('删除房间失败:', error)
    alert('删除房间失败')
  }
}

onMounted(() => {
  loadRoomTypes()
  loadRooms()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
