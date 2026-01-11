<template>
  <div class="month-view">
    <!-- Week days header -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-semibold text-gray-600 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day min-h-24 cursor-pointer"
        :class="{
          'opacity-40': !day.isCurrentMonth,
        }"
        @click="handleDayClick(day)"
      >
        <div
          class="h-full flex flex-col p-2 rounded-lg border-2 transition-all hover:border-gold"
          :class="getDayClasses(day)"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium">{{ day.date.getDate() }}</span>
            <span v-if="day.isToday" class="text-xs text-gold font-semibold">今天</span>
          </div>

          <!-- Bookings for this day -->
          <div class="flex-1 overflow-y-auto space-y-1">
            <div
              v-for="booking in day.bookings"
              :key="booking.id"
              class="text-xs px-2 py-1 rounded truncate"
              :class="getBookingClasses(booking)"
              @click.stop="handleBookingClick(booking)"
            >
              {{ getBookingLabel(booking) }}
            </div>
          </div>

          <!-- Booking count indicator -->
          <div v-if="day.bookings.length > 3" class="text-xs text-gray-500 mt-1">
            +{{ day.bookings.length - 3 }} 更多
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomBooking, RestaurantBooking } from '@/types'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
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
  'day-click': [date: Date]
  'booking-click': [booking: RoomBooking | RestaurantBooking]
}>()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get first day of week
  const firstDayOfWeek = firstDay.getDay()

  // Add previous month days
  const prevMonthLastDay = new Date(year, month, 0)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevMonthLastDay)
    date.setDate(prevMonthLastDay.getDate() - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      bookings: getBookingsForDate(date),
    })
  }

  // Add current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const isToday = date.getTime() === today.getTime()

    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      bookings: getBookingsForDate(date),
    })
  }

  // Add next month days to fill grid
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      bookings: getBookingsForDate(date),
    })
  }

  return days
})

const getBookingsForDate = (date: Date): (RoomBooking | RestaurantBooking)[] => {
  const dateStr = formatDateToString(date)

  return props.bookings.filter((booking) => {
    if ('checkInDate' in booking) {
      // Room booking
      if (!props.showRoomBookings) return false
      const checkIn = new Date(booking.checkInDate)
      const checkOut = new Date(booking.checkOutDate)
      return date >= checkIn && date < checkOut
    } else {
      // Restaurant booking
      if (!props.showRestaurantBookings) return false
      return booking.bookingDate === dateStr
    }
  })
}

const getDayClasses = (day: CalendarDay) => {
  const classes = ['border-gray-200']

  if (day.isToday) {
    classes.push('border-gold bg-gold bg-opacity-5')
  }

  if (day.bookings.length > 0) {
    classes.push('bg-gray-50')
  }

  return classes.join(' ')
}

const getBookingClasses = (booking: RoomBooking | RestaurantBooking) => {
  if ('checkInDate' in booking) {
    // Room booking
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  } else {
    // Restaurant booking
    return 'bg-green-100 text-green-800 border border-green-200'
  }
}

const getBookingLabel = (booking: RoomBooking | RestaurantBooking): string => {
  if ('checkInDate' in booking) {
    // Room booking
    return `房间 ${booking.guestCount}人`
  } else {
    // Restaurant booking
    return `${booking.mealType === 'lunch' ? '午餐' : '晚餐'} ${booking.guestCount}人`
  }
}

const handleDayClick = (day: CalendarDay) => {
  emit('day-click', day.date)
}

const handleBookingClick = (booking: RoomBooking | RestaurantBooking) => {
  emit('booking-click', booking)
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.calendar-day {
  min-height: 120px;
}

.bg-gold {
  background-color: #d4af37;
}

.text-gold {
  color: #d4af37;
}

.border-gold {
  border-color: #d4af37;
}

@media (max-width: 640px) {
  .calendar-day {
    min-height: 80px;
  }
}
</style>
