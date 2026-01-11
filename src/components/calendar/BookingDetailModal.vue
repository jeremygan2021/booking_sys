<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    @click="handleClose"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-2xl font-playfair font-bold text-gray-800">
          {{ isRoomBooking ? '房间预订详情' : '餐厅预订详情' }}
        </h3>
        <button @click="handleClose" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Status Badge -->
        <div class="flex items-center gap-3">
          <span
            class="px-4 py-2 rounded-full text-sm font-semibold"
            :class="getStatusClasses(booking.status)"
          >
            {{ getStatusLabel(booking.status) }}
          </span>
          <span
            class="px-4 py-2 rounded-full text-sm font-semibold"
            :class="isRoomBooking ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
          >
            {{ isRoomBooking ? '房间预订' : '餐厅预订' }}
          </span>
        </div>

        <!-- Room Booking Details -->
        <div v-if="isRoomBooking" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">入住日期</label>
              <p class="text-lg font-semibold">
                {{ formatDate((booking as RoomBooking).checkInDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">退房日期</label>
              <p class="text-lg font-semibold">
                {{ formatDate((booking as RoomBooking).checkOutDate) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">客人数量</label>
              <p class="text-lg font-semibold">{{ booking.guestCount }} 人</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">住宿天数</label>
              <p class="text-lg font-semibold">
                {{
                  calculateNights(
                    (booking as RoomBooking).checkInDate,
                    (booking as RoomBooking).checkOutDate,
                  )
                }}
                晚
              </p>
            </div>
          </div>
        </div>

        <!-- Restaurant Booking Details -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">用餐日期</label>
              <p class="text-lg font-semibold">
                {{ formatDate((booking as RestaurantBooking).bookingDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">用餐时间</label>
              <p class="text-lg font-semibold">{{ (booking as RestaurantBooking).timeSlot }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">用餐类型</label>
              <p class="text-lg font-semibold">
                {{ (booking as RestaurantBooking).mealType === 'lunch' ? '午餐' : '晚餐' }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">客人数量</label>
              <p class="text-lg font-semibold">{{ booking.guestCount }} 人</p>
            </div>
          </div>
        </div>

        <!-- Common Details -->
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-600">预订编号</label>
            <p class="text-lg font-mono">{{ booking.id }}</p>
          </div>

          <div>
            <label class="text-sm text-gray-600">总价</label>
            <p class="text-2xl font-bold text-gold">¥{{ booking.totalPrice }}</p>
          </div>

          <div v-if="booking.specialRequests">
            <label class="text-sm text-gray-600">特殊要求</label>
            <p class="text-base">{{ booking.specialRequests }}</p>
          </div>

          <div>
            <label class="text-sm text-gray-600">预订时间</label>
            <p class="text-base">{{ formatDateTime(booking.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
        <button
          @click="handleClose"
          class="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          关闭
        </button>
        <button
          v-if="booking.status === 'pending'"
          @click="handleConfirm"
          class="px-6 py-2 rounded-lg bg-gold text-white hover:bg-opacity-90 transition-colors"
        >
          确认预订
        </button>
        <button
          v-if="booking.status !== 'cancelled'"
          @click="handleCancel"
          class="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-opacity-90 transition-colors"
        >
          取消预订
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomBooking, RestaurantBooking } from '@/types'

interface Props {
  booking: RoomBooking | RestaurantBooking
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [booking: RoomBooking | RestaurantBooking]
  cancel: [booking: RoomBooking | RestaurantBooking]
}>()

const isRoomBooking = computed(() => 'checkInDate' in props.booking)

const getStatusClasses = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成',
  }
  return labels[status] || status
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm', props.booking)
}

const handleCancel = () => {
  emit('cancel', props.booking)
}
</script>

<style scoped>
.bg-gold {
  background-color: #d4af37;
}

.text-gold {
  color: #d4af37;
}

.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>
