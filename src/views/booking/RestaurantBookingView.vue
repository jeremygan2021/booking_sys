<template>
  <div class="restaurant-booking-view min-h-screen bg-cream">
    <div class="container mx-auto px-4 py-8">
      <!-- 餐厅展示 -->
      <RestaurantGallery class="mb-12" />

      <!-- 预订流程 -->
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-playfair font-bold text-gray-900 mb-8 text-center">开始预订</h2>

        <!-- 步骤指示器 -->
        <div class="mb-12">
          <div class="flex items-center justify-center">
            <div v-for="(step, index) in steps" :key="index" class="flex items-center">
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    currentStep >= index + 1 ? 'bg-gold text-white' : 'bg-gray-200 text-gray-500',
                  ]"
                >
                  {{ index + 1 }}
                </div>
                <span class="text-sm mt-2 text-gray-600">{{ step }}</span>
              </div>
              <div
                v-if="index < steps.length - 1"
                :class="[
                  'w-24 h-1 mx-4 transition-all',
                  currentStep > index + 1 ? 'bg-gold' : 'bg-gray-200',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- 步骤内容 -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <!-- 步骤 1: 选择菜单 -->
          <div v-show="currentStep === 1">
            <MenuSelection
              v-model:meal-type="bookingData.mealType"
              v-model:package="bookingData.selectedPackage"
            />
            <div class="mt-8 flex justify-end">
              <button
                @click="nextStep"
                :disabled="!bookingData.selectedPackage"
                class="px-8 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                下一步
              </button>
            </div>
          </div>

          <!-- 步骤 2: 选择时间 -->
          <div v-show="currentStep === 2">
            <TimeSlotPicker
              v-model:date="bookingData.date"
              v-model:meal-type="bookingData.mealType"
              v-model:time-slot="bookingData.timeSlot"
            />
            <div class="mt-8 flex justify-between">
              <button
                @click="previousStep"
                class="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                上一步
              </button>
              <button
                @click="nextStep"
                :disabled="!bookingData.date || !bookingData.timeSlot"
                class="px-8 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                下一步
              </button>
            </div>
          </div>

          <!-- 步骤 3: 填写信息 -->
          <div v-show="currentStep === 3">
            <DiningBookingForm
              :selected-package="bookingData.selectedPackage"
              :booking-date="bookingData.date"
              :meal-type="bookingData.mealType"
              :time-slot="bookingData.timeSlot"
              @cancel="previousStep"
              @success="handleBookingSuccess"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RestaurantGallery from '@/components/booking/RestaurantGallery.vue'
import MenuSelection from '@/components/booking/MenuSelection.vue'
import TimeSlotPicker from '@/components/booking/TimeSlotPicker.vue'
import DiningBookingForm from '@/components/booking/DiningBookingForm.vue'

// Use local interfaces that match the API response format
interface MealPackage {
  id: string
  name: string
  description: string
  price: number
  cuisine_id: string
  cuisine_name: string
  meal_type: 'lunch' | 'dinner'
  max_guests: number
}

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  max_capacity: number
  booked_guests: number
  available_capacity: number
  is_available: boolean
}

const router = useRouter()

const steps = ['选择菜单', '选择时间', '填写信息']
const currentStep = ref(1)

const bookingData = ref<{
  mealType: 'lunch' | 'dinner'
  selectedPackage: MealPackage | null
  date: string
  timeSlot: TimeSlot | null
}>({
  mealType: 'lunch',
  selectedPackage: null,
  date: '',
  timeSlot: null,
})

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleBookingSuccess = (bookingId: string) => {
  console.log('预订成功:', bookingId)
  // 可以导航到预订详情页或首页
  setTimeout(() => {
    router.push('/')
  }, 2000)
}
</script>

<style scoped>
.restaurant-booking-view {
  min-height: 100vh;
}
</style>
