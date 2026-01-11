<template>
  <div class="room-booking-view">
    <!-- Hero Section -->
    <section class="hero-section bg-cream py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-playfair font-bold text-gray-800 mb-4">精致客房</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          体验法式优雅与现代舒适的完美融合，每一间客房都是精心设计的艺术品
        </p>
      </div>
    </section>

    <!-- Room Gallery -->
    <RoomGallery />
  </div>
</template>

<script setup lang="ts">
import RoomGallery from '@/components/booking/RoomGallery.vue'
</script>

<style scoped>
.bg-cream {
  background-color: #faf9f6;
}

.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>
