<template>
  <div class="calendar-view p-6">
    <UnifiedCalendar
      title="预订管理日历"
      :initial-view-mode="'month'"
      @booking-selected="handleBookingSelected"
      @date-selected="handleDateSelected"
    />
  </div>
</template>

<script setup lang="ts">
import UnifiedCalendar from '@/components/calendar/UnifiedCalendar.vue'
import type { RoomBooking, RestaurantBooking } from '@/types'

const handleBookingSelected = (booking: RoomBooking | RestaurantBooking) => {
  console.log('Booking selected:', booking)
  // Additional handling can be added here
}

const handleDateSelected = (date: Date) => {
  console.log('Date selected:', date)
  // Additional handling can be added here
}
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
}
</style>
