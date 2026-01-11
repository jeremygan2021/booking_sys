<template>
  <div class="unified-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-playfair font-bold text-gray-800">
          {{ title }}
        </h2>

        <!-- View Mode Selector -->
        <div class="flex gap-2">
          <button
            v-for="mode in viewModes"
            :key="mode.value"
            @click="currentViewMode = mode.value"
            class="px-4 py-2 rounded-lg transition-all"
            :class="
              currentViewMode === mode.value
                ? 'bg-gold text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button
          @click="navigatePrevious"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 class="text-xl font-semibold text-gray-800">
          {{ currentPeriodLabel }}
        </h3>

        <button @click="navigateNext" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Booking Type Filter -->
      <div class="flex gap-2 mt-4">
        <button
          @click="toggleBookingType('room')"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          :class="
            showRoomBookings
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          <span class="w-3 h-3 rounded-full bg-blue-400"></span>
          房间预订
        </button>
        <button
          @click="toggleBookingType('restaurant')"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          :class="
            showRestaurantBookings
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          <span class="w-3 h-3 rounded-full bg-green-400"></span>
          餐厅预订
        </button>
      </div>
    </div>

    <!-- Calendar Content -->
    <div class="calendar-content">
      <!-- Month View -->
      <div v-if="currentViewMode === 'month'" class="month-view">
        <MonthView
          :current-date="currentDate"
          :bookings="filteredBookings"
          :show-room-bookings="showRoomBookings"
          :show-restaurant-bookings="showRestaurantBookings"
          @day-click="handleDayClick"
        />
      </div>

      <!-- Week View -->
      <div v-else-if="currentViewMode === 'week'" class="week-view">
        <WeekView
          :current-date="currentDate"
          :bookings="filteredBookings"
          :show-room-bookings="showRoomBookings"
          :show-restaurant-bookings="showRestaurantBookings"
          @time-slot-click="handleTimeSlotClick"
        />
      </div>

      <!-- Day View -->
      <div v-else-if="currentViewMode === 'day'" class="day-view">
        <DayView
          :current-date="currentDate"
          :bookings="filteredBookings"
          :show-room-bookings="showRoomBookings"
          :show-restaurant-bookings="showRestaurantBookings"
          @time-slot-click="handleTimeSlotClick"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-4 text-center text-gray-600">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      <span class="ml-2">加载中...</span>
    </div>

    <!-- Booking Detail Modal -->
    <BookingDetailModal
      v-if="selectedBooking"
      :booking="selectedBooking"
      @close="selectedBooking = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { RoomBooking, RestaurantBooking } from '@/types'
import { useRealtimeStore } from '@/stores/realtime'
import MonthView from './MonthView.vue'
import WeekView from './WeekView.vue'
import DayView from './DayView.vue'
import BookingDetailModal from './BookingDetailModal.vue'

interface Props {
  title?: string
  initialViewMode?: 'month' | 'week' | 'day'
  initialDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  title: '预订日历',
  initialViewMode: 'month',
  initialDate: () => new Date(),
})

const emit = defineEmits<{
  'booking-selected': [booking: RoomBooking | RestaurantBooking]
  'date-selected': [date: Date]
}>()

// Realtime store
const realtimeStore = useRealtimeStore()

// State
const currentDate = ref(new Date(props.initialDate))
const currentViewMode = ref<'month' | 'week' | 'day'>(props.initialViewMode)
const showRoomBookings = ref(true)
const showRestaurantBookings = ref(true)
const loading = ref(false)
const roomBookings = ref<RoomBooking[]>([])
const restaurantBookings = ref<RestaurantBooking[]>([])
const selectedBooking = ref<RoomBooking | RestaurantBooking | null>(null)

const viewModes = [
  { value: 'month' as const, label: '月' },
  { value: 'week' as const, label: '周' },
  { value: 'day' as const, label: '日' },
]

// Computed
const currentPeriodLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  const date = currentDate.value.getDate()

  if (currentViewMode.value === 'month') {
    return `${year}年${month}月`
  } else if (currentViewMode.value === 'week') {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = getWeekEnd(currentDate.value)
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
  } else {
    return `${year}年${month}月${date}日`
  }
})

const filteredBookings = computed(() => {
  const bookings: (RoomBooking | RestaurantBooking)[] = []

  if (showRoomBookings.value) {
    bookings.push(...roomBookings.value)
  }

  if (showRestaurantBookings.value) {
    bookings.push(...restaurantBookings.value)
  }

  return bookings
})

// Methods
const navigatePrevious = () => {
  if (currentViewMode.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1,
    )
  } else if (currentViewMode.value === 'week') {
    currentDate.value = new Date(currentDate.value.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() - 24 * 60 * 60 * 1000)
  }
}

const navigateNext = () => {
  if (currentViewMode.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1,
    )
  } else if (currentViewMode.value === 'week') {
    currentDate.value = new Date(currentDate.value.getTime() + 7 * 24 * 60 * 60 * 1000)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() + 24 * 60 * 60 * 1000)
  }
}

const toggleBookingType = (type: 'room' | 'restaurant') => {
  if (type === 'room') {
    showRoomBookings.value = !showRoomBookings.value
  } else {
    showRestaurantBookings.value = !showRestaurantBookings.value
  }
}

const handleDayClick = (date: Date) => {
  emit('date-selected', date)
}

const handleTimeSlotClick = (date: Date, hour: number) => {
  // This is called when clicking on an empty time slot
  // Could be used to create a new booking
  console.log('Time slot clicked:', date, hour)
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date)
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
}

const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const loadBookings = async () => {
  loading.value = true

  try {
    // Calculate date range based on view mode
    let startDate: string
    let endDate: string

    if (currentViewMode.value === 'month') {
      const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
      const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
      startDate = formatDateToString(firstDay)
      endDate = formatDateToString(lastDay)
    } else if (currentViewMode.value === 'week') {
      startDate = formatDateToString(getWeekStart(currentDate.value))
      endDate = formatDateToString(getWeekEnd(currentDate.value))
    } else {
      startDate = formatDateToString(currentDate.value)
      endDate = startDate
    }

    // Load room bookings
    const roomResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/bookings/room?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    )

    if (roomResponse.ok) {
      const roomData = await roomResponse.json()
      roomBookings.value = roomData.data || []
    }

    // Load restaurant bookings
    const restaurantResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/bookings/restaurant?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    )

    if (restaurantResponse.ok) {
      const restaurantData = await restaurantResponse.json()
      restaurantBookings.value = restaurantData.data || []
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Watchers
watch([currentDate, currentViewMode], () => {
  loadBookings()
})

// Lifecycle
onMounted(() => {
  loadBookings()

  // Initialize real-time listeners
  realtimeStore.initializeListeners()

  // Listen for real-time booking events
  window.addEventListener('booking-created', handleRealtimeBookingCreated)
  window.addEventListener('booking-updated', handleRealtimeBookingUpdated)
  window.addEventListener('booking-cancelled', handleRealtimeBookingCancelled)
  window.addEventListener('availability-changed', handleRealtimeAvailabilityChanged)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('booking-created', handleRealtimeBookingCreated)
  window.removeEventListener('booking-updated', handleRealtimeBookingUpdated)
  window.removeEventListener('booking-cancelled', handleRealtimeBookingCancelled)
  window.removeEventListener('availability-changed', handleRealtimeAvailabilityChanged)
})

// Real-time event handlers
const handleRealtimeBookingCreated = (event: Event) => {
  const customEvent = event as CustomEvent
  const { bookingType, booking } = customEvent.detail

  if (bookingType === 'room') {
    const existingIndex = roomBookings.value.findIndex((b) => b.id === booking.id)
    if (existingIndex === -1) {
      roomBookings.value.push(booking)
    }
  } else if (bookingType === 'restaurant') {
    const existingIndex = restaurantBookings.value.findIndex((b) => b.id === booking.id)
    if (existingIndex === -1) {
      restaurantBookings.value.push(booking)
    }
  }
}

const handleRealtimeBookingUpdated = (event: Event) => {
  const customEvent = event as CustomEvent
  const { bookingType, booking } = customEvent.detail

  if (bookingType === 'room') {
    const index = roomBookings.value.findIndex((b) => b.id === booking.id)
    if (index !== -1) {
      roomBookings.value[index] = booking
    }
  } else if (bookingType === 'restaurant') {
    const index = restaurantBookings.value.findIndex((b) => b.id === booking.id)
    if (index !== -1) {
      restaurantBookings.value[index] = booking
    }
  }
}

const handleRealtimeBookingCancelled = (event: Event) => {
  const customEvent = event as CustomEvent
  const { bookingType, bookingId } = customEvent.detail

  if (bookingType === 'room') {
    roomBookings.value = roomBookings.value.filter((b) => b.id !== bookingId)
  } else if (bookingType === 'restaurant') {
    restaurantBookings.value = restaurantBookings.value.filter((b) => b.id !== bookingId)
  }
}

const handleRealtimeAvailabilityChanged = (event: Event) => {
  const customEvent = event as CustomEvent
  console.log('Availability changed:', customEvent.detail)
  // Reload bookings to reflect availability changes
  loadBookings()
}
</script>

<style scoped>
.bg-gold {
  background-color: #d4af37;
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
