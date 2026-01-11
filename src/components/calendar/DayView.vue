<template>
  <div class="day-view">
    <div class="grid grid-cols-12 gap-4">
      <!-- Time column -->
      <div class="col-span-2">
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-20 flex items-center justify-end pr-4 text-sm font-medium text-gray-600"
        >
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- Schedule column -->
      <div class="col-span-10 relative">
        <!-- Time slot grid -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-20 border-t border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="handleTimeSlotClick(hour)"
        >
          <div class="h-10 border-b border-gray-100"></div>
        </div>

        <!-- Current time indicator -->
        <div
          v-if="showCurrentTimeIndicator"
          class="absolute left-0 right-0 flex items-center"
          :style="{ top: currentTimePosition }"
        >
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="flex-1 h-0.5 bg-red-500"></div>
        </div>

        <!-- Bookings overlay -->
        <div
          v-for="booking in dayBookings"
          :key="booking.id"
          class="absolute left-0 right-0 mx-2 rounded-lg p-3 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          :class="getBookingClasses(booking)"
          :style="getBookingStyle(booking)"
          @click="handleBookingClick(booking)"
        >
          <div class="font-semibold mb-1">
            {{ getBookingTitle(booking) }}
          </div>
          <div class="text-sm opacity-90">
            {{ getBookingDetails(booking) }}
          </div>
          <div class="text-sm mt-1">
            {{ getBookingTime(booking) }}
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="dayBookings.length === 0"
          class="absolute inset-0 flex items-center justify-center text-gray-400"
        >
          <div class="text-center">
            <svg
              class="w-16 h-16 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>当天暂无预订</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { RoomBooking, RestaurantBooking } from '@/types'

interface Props {
  currentDate: Date
  bookings: (RoomBooking | RestaurantBooking)[]
  showRoomBookings: boolean
  showRestaurantBookings: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'time-slot-click': [date: Date, hour: number]
  'booking-click': [booking: RoomBooking | RestaurantBooking]
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)
const currentTime = ref(new Date())
let timeInterval: number | null = null

const dayBookings = computed(() => {
  const dateStr = formatDateToString(props.currentDate)

  return props.bookings.filter((booking) => {
    if ('checkInDate' in booking) {
      if (!props.showRoomBookings) return false
      return booking.checkInDate === dateStr
    } else {
      if (!props.showRestaurantBookings) return false
      return booking.bookingDate === dateStr
    }
  })
})

const showCurrentTimeIndicator = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDay = new Date(props.currentDate)
  currentDay.setHours(0, 0, 0, 0)
  return today.getTime() === currentDay.getTime()
})

const currentTimePosition = computed(() => {
  const hours = currentTime.value.getHours()
  const minutes = currentTime.value.getMinutes()
  const totalMinutes = hours * 60 + minutes
  const pixelsPerMinute = 80 / 60 // 80px per hour
  return `${totalMinutes * pixelsPerMinute}px`
})

const getBookingClasses = (booking: RoomBooking | RestaurantBooking) => {
  if ('checkInDate' in booking) {
    return 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
  } else {
    return 'bg-green-100 text-green-900 border-l-4 border-green-500'
  }
}

const getBookingStyle = (booking: RoomBooking | RestaurantBooking) => {
  let top = 0
  let height = 160 // Default height

  if ('checkInDate' in booking) {
    // Room booking - show at 14:00 (check-in time)
    top = 14 * 80
    height = 240 // 3 hours display
  } else {
    // Restaurant booking
    const time = booking.timeSlot.split(':')
    const hour = parseInt(time[0] || '0')
    const minute = parseInt(time[1] || '0')
    top = hour * 80 + (minute / 60) * 80
    height = 160 // 2 hours for meal
  }

  return {
    top: `${top}px`,
    height: `${height}px`,
  }
}

const getBookingTitle = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    return `房间预订`
  } else {
    return `${booking.mealType === 'lunch' ? '午餐预订' : '晚餐预订'}`
  }
}

const getBookingDetails = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    return `${booking.guestCount}位客人 · 入住至${formatShortDate(booking.checkOutDate)}`
  } else {
    return `${booking.guestCount}位客人`
  }
}

const getBookingTime = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    return '14:00 入住'
  } else {
    return booking.timeSlot
  }
}

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const handleTimeSlotClick = (hour: number) => {
  emit('time-slot-click', props.currentDate, hour)
}

const handleBookingClick = (booking: RoomBooking | RestaurantBooking) => {
  emit('booking-click', booking)
}

const updateCurrentTime = () => {
  currentTime.value = new Date()
}

onMounted(() => {
  // Update current time every minute
  timeInterval = window.setInterval(updateCurrentTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Styles are inline in the template */
</style>
