<template>
  <div class="room-booking-form-view">
    <BookingForm />
  </div>
</template>

<script setup lang="ts">
import BookingForm from '@/components/booking/BookingForm.vue'
</script>

<style scoped>
.room-booking-form-view {
  min-height: 100vh;
  background-color: #faf9f6;
}
</style>
