<template>
  <div class="dining-room-manager">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">用餐房间管理</h2>
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
        <!-- 房间图片 -->
        <div class="relative h-48 bg-gray-200">
          <img
            v-if="room.images && room.images.length > 0"
            :src="room.images[0]"
            :alt="room.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            暂无图片
          </div>
          <div
            :class="[
              'absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold',
              room.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
            ]"
          >
            {{ room.is_available ? '可用' : '不可用' }}
          </div>
        </div>

        <!-- 房间信息 -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ room.name }}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ room.description }}</p>

          <!-- 房间类型和容量 -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-500">{{ getRoomTypeLabel(room.room_type) }}</span>
            <span class="text-sm text-gray-700 font-medium">容纳 {{ room.capacity }} 人</span>
          </div>

          <!-- 设施标签 -->
          <div class="flex flex-wrap gap-1 mb-4">
            <span
              v-for="(facility, index) in room.facilities.slice(0, 3)"
              :key="index"
              class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {{ facility }}
            </span>
            <span
              v-if="room.facilities.length > 3"
              class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              +{{ room.facilities.length - 3 }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="openEditModal(room)"
              class="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all text-sm"
            >
              编辑
            </button>
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

    <!-- 创建/编辑模态框 -->
    <AdminModal v-model:modelValue="showModal" :title="isEditing ? '编辑房间' : '添加房间'">
      <form @submit.prevent="saveRoom" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">房间名称</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">房间类型</label>
            <select
              v-model="formData.room_type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="mahjong">麻将房</option>
              <option value="private">独立包间</option>
              <option value="public">公开位置</option>
              <option value="tea_room">茶室</option>
              <option value="garden">花园</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">容纳人数</label>
            <input
              v-model.number="formData.capacity"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">设施（每行一个）</label>
          <textarea
            v-model="facilitiesText"
            rows="4"
            placeholder="例如：&#10;空调&#10;独立包间&#10;音响系统"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">房间图片</label>
          <ImageManager v-model="formData.images" :max-images="5" />
        </div>

        <div class="flex items-center">
          <input
            v-model="formData.is_available"
            type="checkbox"
            id="is_available"
            class="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
          />
          <label for="is_available" class="ml-2 text-sm text-gray-700">可预订</label>
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
import { ref, onMounted, computed } from 'vue'
import AdminModal from './AdminModal.vue'
import ImageManager from './ImageManager.vue'

interface DiningRoom {
  id: string
  name: string
  description: string
  room_type: string
  capacity: number
  facilities: string[]
  images: string[]
  is_available: boolean
}

const rooms = ref<DiningRoom[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  name: '',
  description: '',
  room_type: 'private',
  capacity: 1,
  facilities: [] as string[],
  images: [] as string[],
  is_available: true,
})

const facilitiesText = computed({
  get: () => formData.value.facilities.join('\n'),
  set: (value: string) => {
    formData.value.facilities = value
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
  },
})

const getRoomTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    mahjong: '麻将房',
    private: '独立包间',
    public: '公开位置',
    tea_room: '茶室',
    garden: '花园',
    other: '其他',
  }
  return labels[type] || type
}

const loadRooms = async () => {
  try {
    const response = await fetch('/api/dining-rooms')
    const result = await response.json()
    if (result.success) {
      rooms.value = result.data
    }
  } catch (error) {
    console.error('加载房间失败:', error)
    alert('加载房间失败')
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    name: '',
    description: '',
    room_type: 'private',
    capacity: 1,
    facilities: [],
    images: [],
    is_available: true,
  }
  showModal.value = true
}

const openEditModal = (room: DiningRoom) => {
  isEditing.value = true
  editingId.value = room.id
  formData.value = {
    name: room.name,
    description: room.description,
    room_type: room.room_type,
    capacity: room.capacity,
    facilities: [...room.facilities],
    images: [...room.images],
    is_available: room.is_available,
  }
  showModal.value = true
}

const saveRoom = async () => {
  try {
    const token = localStorage.getItem('token')
    const url = isEditing.value
      ? `/api/admin/dining-rooms/${editingId.value}`
      : '/api/admin/dining-rooms'
    const method = isEditing.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData.value),
    })

    const result = await response.json()

    if (result.success) {
      alert(isEditing.value ? '房间更新成功' : '房间创建成功')
      showModal.value = false
      loadRooms()
    } else {
      alert(result.error?.message || '操作失败')
    }
  } catch (error) {
    console.error('保存房间失败:', error)
    alert('保存房间失败')
  }
}

const deleteRoom = async (id: string) => {
  if (!confirm('确定要删除这个房间吗？')) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/dining-rooms/${id}`, {
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
      alert(result.error?.message || '删除失败')
    }
  } catch (error) {
    console.error('删除房间失败:', error)
    alert('删除房间失败')
  }
}

onMounted(() => {
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
