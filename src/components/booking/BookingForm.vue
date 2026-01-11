<template>
  <div class="booking-form">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
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
          返回
        </button>

        <h1 class="text-4xl font-playfair font-bold text-gray-800 mb-8">预订房间</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 左侧：日历和表单 -->
          <div>
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">选择日期</h2>
              <BookingCalendar :room-type-id="roomTypeId" @dates-selected="onDatesSelected" />
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">预订信息</h2>

              <form @submit.prevent="submitBooking">
                <!-- 客人数量 -->
                <div class="mb-4">
                  <label class="block text-gray-700 font-semibold mb-2">客人数量</label>
                  <input
                    v-model.number="form.guestCount"
                    type="number"
                    min="1"
                    :max="maxOccupancy"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <p v-if="maxOccupancy" class="text-sm text-gray-500 mt-1">
                    最多容纳 {{ maxOccupancy }} 人
                  </p>
                </div>

                <!-- 特殊要求 -->
                <div class="mb-6">
                  <label class="block text-gray-700 font-semibold mb-2">特殊要求（可选）</label>
                  <textarea
                    v-model="form.specialRequests"
                    rows="4"
                    placeholder="请告诉我们您的特殊需求..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  ></textarea>
                </div>

                <!-- 错误提示 -->
                <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600">{{ error }}</p>
                </div>

                <!-- 提交按钮 -->
                <button
                  type="submit"
                  :disabled="!canSubmit || submitting"
                  class="w-full py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors duration-300 font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <span v-if="submitting">提交中...</span>
                  <span v-else>确认预订</span>
                </button>
              </form>
            </div>
          </div>

          <!-- 右侧：预订摘要 -->
          <div>
            <div class="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">预订摘要</h2>

              <!-- 房间信息 -->
              <div v-if="roomType" class="mb-6">
                <div v-if="roomType.images && roomType.images.length > 0" class="mb-4">
                  <img
                    :src="roomType.images[0]"
                    :alt="roomType.name"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ roomType.name }}</h3>
                <p class="text-gray-600 mb-2">{{ roomType.description }}</p>
                <p class="text-2xl font-bold text-gold">¥{{ roomType.base_price }} / 晚</p>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <!-- 日期信息 -->
                <div v-if="form.checkInDate && form.checkOutDate" class="space-y-2 mb-4">
                  <div class="flex justify-between">
                    <span class="text-gray-600">入住日期:</span>
                    <span class="font-semibold">{{ formatDate(form.checkInDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">退房日期:</span>
                    <span class="font-semibold">{{ formatDate(form.checkOutDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">住宿天数:</span>
                    <span class="font-semibold">{{ nightsCount }} 晚</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">客人数量:</span>
                    <span class="font-semibold">{{ form.guestCount }} 人</span>
                  </div>
                </div>

                <!-- 价格计算 -->
                <div v-if="totalPrice > 0" class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">房费 ({{ nightsCount }} 晚):</span>
                    <span>¥{{ roomPrice }}</span>
                  </div>
                  <div class="flex justify-between text-xl font-bold text-gray-800 mt-4">
                    <span>总计:</span>
                    <span class="text-gold">¥{{ totalPrice }}</span>
                  </div>
                </div>

                <div v-else class="text-center text-gray-500 py-8">请选择入住和退房日期</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功模态框 -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeSuccessModal"
    >
      <div class="bg-white rounded-lg p-8 max-w-md w-full" @click.stop>
        <div class="text-center">
          <div class="mb-4">
            <svg
              class="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">预订成功！</h3>
          <p class="text-gray-600 mb-6">您的预订已成功提交。我们会尽快与您联系确认预订详情。</p>
          <div v-if="bookingResult" class="bg-cream p-4 rounded-lg mb-6 text-left">
            <p class="text-sm text-gray-600 mb-1">预订编号:</p>
            <p class="font-mono font-semibold">{{ bookingResult.id }}</p>
          </div>
          <button
            @click="closeSuccessModal"
            class="w-full py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors duration-300 font-semibold"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BookingCalendar from './BookingCalendar.vue'
import type { RoomType, RoomBooking } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 状态
const roomTypeId = ref<string>('')
const roomType = ref<RoomType | null>(null)
const form = ref({
  checkInDate: '',
  checkOutDate: '',
  guestCount: 1,
  specialRequests: '',
})
const submitting = ref(false)
const error = ref('')
const showSuccessModal = ref(false)
const bookingResult = ref<RoomBooking | null>(null)

// 计算属性
const maxOccupancy = computed(() => roomType.value?.max_occupancy || 10)

const nightsCount = computed(() => {
  if (form.value.checkInDate && form.value.checkOutDate) {
    const checkIn = new Date(form.value.checkInDate)
    const checkOut = new Date(form.value.checkOutDate)
    const diff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  return 0
})

const roomPrice = computed(() => {
  if (roomType.value) {
    return parseFloat(roomType.value.base_price) * nightsCount.value
  }
  return 0
})

const totalPrice = computed(() => {
  return roomPrice.value
})

const canSubmit = computed(() => {
  return (
    form.value.checkInDate &&
    form.value.checkOutDate &&
    form.value.guestCount > 0 &&
    form.value.guestCount <= maxOccupancy.value &&
    !submitting.value
  )
})

// 获取房间类型信息
const fetchRoomType = async () => {
  if (!roomTypeId.value) return

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/rooms/types/${roomTypeId.value}`,
    )
    const data = await response.json()

    if (data.success) {
      roomType.value = data.data
    }
  } catch (err) {
    console.error('Error fetching room type:', err)
  }
}

// 日期选择回调
const onDatesSelected = (checkIn: string, checkOut: string) => {
  form.value.checkInDate = checkIn
  form.value.checkOutDate = checkOut
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 提交预订
const submitBooking = async () => {
  if (!canSubmit.value) return

  // 检查是否登录
  if (!authStore.isAuthenticated) {
    router.push({
      name: 'login',
      query: { redirect: route.fullPath },
    })
    return
  }

  submitting.value = true
  error.value = ''

  try {
    // 首先获取可用房间
    const availabilityResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/rooms/availability/check?check_in_date=${form.value.checkInDate}&check_out_date=${form.value.checkOutDate}&room_type_id=${roomTypeId.value}`,
    )
    const availabilityData = await availabilityResponse.json()

    if (!availabilityData.success || availabilityData.data.available_rooms.length === 0) {
      error.value = '抱歉，所选日期没有可用房间'
      return
    }

    // 选择第一个可用房间
    const availableRoom = availabilityData.data.available_rooms[0]

    // 创建预订
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        room_id: availableRoom.id,
        check_in_date: form.value.checkInDate,
        check_out_date: form.value.checkOutDate,
        guest_count: form.value.guestCount,
        special_requests: form.value.specialRequests,
      }),
    })

    const data = await response.json()

    if (data.success) {
      bookingResult.value = data.data
      showSuccessModal.value = true
    } else {
      error.value = data.error?.message || '预订失败，请重试'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error('Error creating booking:', err)
  } finally {
    submitting.value = false
  }
}

// 关闭成功模态框
const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push({ name: 'home' })
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  roomTypeId.value = route.query.roomTypeId as string
  if (roomTypeId.value) {
    fetchRoomType()
  }
})
</script>

<style scoped>
.bg-cream {
  background-color: #faf9f6;
}

.bg-gold {
  background-color: #d4af37;
}

.text-gold {
  color: #d4af37;
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
