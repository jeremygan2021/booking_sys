<template>
  <div class="week-view">
    <!-- Time column and day columns -->
    <div class="grid grid-cols-8 gap-2">
      <!-- Time labels column -->
      <div class="col-span-1">
        <div class="h-12"></div>
        <!-- Header spacer -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-16 flex items-center justify-end pr-2 text-sm text-gray-600"
        >
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- Day columns -->
      <div v-for="day in weekDays" :key="day.dateStr" class="col-span-1">
        <!-- Day header -->
        <div
          class="h-12 flex flex-col items-center justify-center rounded-lg mb-2"
          :class="day.isToday ? 'bg-gold text-white' : 'bg-gray-100'"
        >
          <span class="text-xs">{{ day.weekDay }}</span>
          <span class="text-lg font-semibold">{{ day.date.getDate() }}</span>
        </div>

        <!-- Time slots -->
        <div class="relative">
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-16 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
            @click="handleTimeSlotClick(day.date, hour)"
          ></div>

          <!-- Bookings overlay -->
          <div
            v-for="booking in day.bookings"
            :key="booking.id"
            class="absolute left-0 right-0 mx-1 rounded-lg p-2 cursor-pointer shadow-sm"
            :class="getBookingClasses(booking)"
            :style="getBookingStyle(booking)"
            @click="handleBookingClick(booking)"
          >
            <div class="text-xs font-semibold truncate">
              {{ getBookingTitle(booking) }}
            </div>
            <div class="text-xs truncate">
              {{ getBookingTime(booking) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomBooking, RestaurantBooking } from '@/types'

interface WeekDay {
  date: Date
  dateStr: string
  weekDay: string
  isToday: boolean
  bookings: (RoomBooking | RestaurantBooking)[]
}

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
const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']

const weekDays = computed(() => {
  const days: WeekDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get week start (Sunday)
  const weekStart = getWeekStart(props.currentDate)

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = formatDateToString(date)
    const isToday = date.getTime() === today.getTime()

    days.push({
      date,
      dateStr,
      weekDay: weekDayNames[date.getDay()] || '',
      isToday,
      bookings: getBookingsForDate(date),
    })
  }

  return days
})

const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

const getBookingsForDate = (date: Date): (RoomBooking | RestaurantBooking)[] => {
  const dateStr = formatDateToString(date)

  return props.bookings.filter((booking) => {
    if ('checkInDate' in booking) {
      // Room booking - show on check-in date
      if (!props.showRoomBookings) return false
      return booking.checkInDate === dateStr
    } else {
      // Restaurant booking
      if (!props.showRestaurantBookings) return false
      return booking.bookingDate === dateStr
    }
  })
}

const getBookingClasses = (booking: RoomBooking | RestaurantBooking) => {
  if ('checkInDate' in booking) {
    return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
  } else {
    return 'bg-green-100 text-green-800 border-l-4 border-green-500'
  }
}

const getBookingStyle = (booking: RoomBooking | RestaurantBooking) => {
  let top = 0
  let height = 64 // Default 1 hour height

  if ('checkInDate' in booking) {
    // Room booking - show at 14:00 (check-in time)
    top = 14 * 64
    height = 128 // 2 hours
  } else {
    // Restaurant booking
    const time = booking.timeSlot.split(':')
    const hour = parseInt(time[0] || '0')
    top = hour * 64
    height = 128 // 2 hours for meal
  }

  return {
    top: `${top}px`,
    height: `${height}px`,
  }
}

const getBookingTitle = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    return `房间预订 ${booking.guestCount}人`
  } else {
    return `${booking.mealType === 'lunch' ? '午餐' : '晚餐'} ${booking.guestCount}人`
  }
}

const getBookingTime = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    return `入住 - ${booking.checkOutDate}`
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

const handleTimeSlotClick = (date: Date, hour: number) => {
  emit('time-slot-click', date, hour)
}

const handleBookingClick = (booking: RoomBooking | RestaurantBooking) => {
  emit('booking-click', booking)
}
</script>

<style scoped>
.bg-gold {
  background-color: #d4af37;
}

.text-gold {
  color: #d4af37;
}
</style>
