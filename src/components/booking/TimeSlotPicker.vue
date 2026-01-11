<template>
  <div class="time-slot-picker">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">选择用餐时间</h3>

    <!-- 日期选择 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">用餐日期</label>
      <input
        type="date"
        v-model="selectedDate"
        :min="minDate"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
      />
    </div>

    <!-- 用餐类型切换 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">用餐时段</label>
      <div class="flex gap-4">
        <button
          @click="selectedMealType = 'lunch'"
          :class="[
            'flex-1 py-3 px-6 rounded-lg border-2 transition-all',
            selectedMealType === 'lunch'
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="text-2xl">🌞</span>
            <span>午餐</span>
          </div>
        </button>
        <button
          @click="selectedMealType = 'dinner'"
          :class="[
            'flex-1 py-3 px-6 rounded-lg border-2 transition-all',
            selectedMealType === 'dinner'
              ? 'border-gold bg-gold/10 text-gold font-semibold'
              : 'border-gray-200 hover:border-gray-300',
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <span class="text-2xl">🌙</span>
            <span>晚餐</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 时间段选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">可用时间段</label>

      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="bg-gray-200 h-20 rounded-lg"></div>
        </div>
      </div>

      <div v-else-if="!selectedDate" class="text-center py-8 text-gray-500">
        <p>请先选择用餐日期</p>
      </div>

      <div v-else-if="availableSlots.length === 0" class="text-center py-8 text-gray-500">
        <p>该日期暂无可用时间段</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="slot in availableSlots"
          :key="slot.id"
          @click="selectTimeSlot(slot)"
          :disabled="!slot.is_available"
          :class="[
            'relative p-4 rounded-lg border-2 transition-all',
            selectedTimeSlot?.id === slot.id
              ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
              : slot.is_available
                ? 'border-gray-200 hover:border-gold/50 hover:shadow-md'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50',
          ]"
        >
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-900">
              {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
            </div>
            <div class="mt-2 text-sm">
              <span
                :class="[
                  'inline-block px-2 py-1 rounded-full',
                  slot.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                ]"
              >
                {{ slot.is_available ? `剩余 ${slot.available_capacity} 位` : '已满' }}
              </span>
            </div>
          </div>
          <div
            v-if="selectedTimeSlot?.id === slot.id"
            class="absolute top-2 right-2 bg-gold text-white rounded-full p-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- 选择摘要 -->
    <div
      v-if="selectedDate && selectedTimeSlot"
      class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
    >
      <h4 class="font-semibold text-blue-900 mb-2">已选择</h4>
      <div class="text-sm text-blue-800">
        <p>日期: {{ formatDate(selectedDate) }}</p>
        <p>时段: {{ selectedMealType === 'lunch' ? '午餐' : '晚餐' }}</p>
        <p>
          时间: {{ formatTime(selectedTimeSlot.start_time) }} -
          {{ formatTime(selectedTimeSlot.end_time) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  max_capacity: number
  booked_guests: number
  available_capacity: number
  is_available: boolean
}

const emit = defineEmits<{
  'update:date': [value: string]
  'update:mealType': [value: 'lunch' | 'dinner']
  'update:timeSlot': [value: TimeSlot | null]
}>()

const props = defineProps<{
  date?: string
  mealType?: 'lunch' | 'dinner'
  timeSlot?: TimeSlot | null
}>()

const selectedDate = ref(props.date || '')
const selectedMealType = ref<'lunch' | 'dinner'>(props.mealType || 'lunch')
const selectedTimeSlot = ref<TimeSlot | null>(props.timeSlot || null)
const availableSlots = ref<TimeSlot[]>([])
const loading = ref(false)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5) // HH:MM
}

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fetchAvailability = async () => {
  if (!selectedDate.value) {
    availableSlots.value = []
    return
  }

  try {
    loading.value = true
    const response = await fetch(
      `/api/restaurant/availability?date=${selectedDate.value}&meal_type=${selectedMealType.value}`,
    )
    const data = await response.json()

    if (data.success) {
      availableSlots.value = data.data.available_slots
    }
  } catch (error) {
    console.error('获取可用性失败:', error)
    availableSlots.value = []
  } finally {
    loading.value = false
  }
}

const selectTimeSlot = (slot: TimeSlot) => {
  if (!slot.is_available) return

  selectedTimeSlot.value = slot
  emit('update:timeSlot', slot)
}

watch(selectedDate, (newValue) => {
  emit('update:date', newValue)
  selectedTimeSlot.value = null
  emit('update:timeSlot', null)
  fetchAvailability()
})

watch(selectedMealType, (newValue) => {
  emit('update:mealType', newValue)
  selectedTimeSlot.value = null
  emit('update:timeSlot', null)
  fetchAvailability()
})

watch(
  () => props.date,
  (newValue) => {
    if (newValue) {
      selectedDate.value = newValue
    }
  },
)

watch(
  () => props.mealType,
  (newValue) => {
    if (newValue) {
      selectedMealType.value = newValue
    }
  },
)

watch(
  () => props.timeSlot,
  (newValue) => {
    selectedTimeSlot.value = newValue ?? null
  },
)

onMounted(() => {
  if (selectedDate.value) {
    fetchAvailability()
  }
})
</script>

<style scoped>
.time-slot-picker {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
