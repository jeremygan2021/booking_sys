<template>
  <div class="dining-booking-form">
    <h3 class="text-xl font-semibold text-gray-900 mb-6">预订信息</h3>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 客人数量 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          客人数量 <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-4">
          <button
            type="button"
            @click="decrementGuests"
            :disabled="formData.guest_count <= 1"
            class="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span class="text-xl">-</span>
          </button>
          <input
            type="number"
            v-model.number="formData.guest_count"
            min="1"
            :max="maxGuests"
            class="w-20 text-center text-xl font-semibold py-2 border-b-2 border-gray-300 focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            @click="incrementGuests"
            :disabled="formData.guest_count >= maxGuests"
            class="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span class="text-xl">+</span>
          </button>
          <span class="text-sm text-gray-500">最多 {{ maxGuests }} 人</span>
        </div>
        <p v-if="errors.guest_count" class="mt-1 text-sm text-red-600">{{ errors.guest_count }}</p>
      </div>

      <!-- 联系人信息 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          联系人姓名 <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          v-model="formData.contact_name"
          placeholder="请输入您的姓名"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
        />
        <p v-if="errors.contact_name" class="mt-1 text-sm text-red-600">
          {{ errors.contact_name }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          联系电话 <span class="text-red-500">*</span>
        </label>
        <input
          type="tel"
          v-model="formData.contact_phone"
          placeholder="请输入您的手机号码"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
        />
        <p v-if="errors.contact_phone" class="mt-1 text-sm text-red-600">
          {{ errors.contact_phone }}
        </p>
      </div>

      <!-- 特殊要求 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> 特殊要求（可选） </label>
        <textarea
          v-model="formData.special_requests"
          rows="4"
          placeholder="如有特殊饮食要求或其他需求，请在此说明"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
        ></textarea>
      </div>

      <!-- 预订摘要 -->
      <div class="bg-cream p-6 rounded-lg border border-gold/20">
        <h4 class="font-semibold text-gray-900 mb-4">预订摘要</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">套餐:</span>
            <span class="font-medium">{{ selectedPackage?.name || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">日期:</span>
            <span class="font-medium">{{ formatDate(bookingDate) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">时段:</span>
            <span class="font-medium">{{
              mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">时间:</span>
            <span class="font-medium">{{ formatTimeSlot(timeSlot) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">人数:</span>
            <span class="font-medium">{{ formData.guest_count }} 人</span>
          </div>
          <div class="border-t border-gray-300 my-3"></div>
          <div class="flex justify-between text-lg">
            <span class="font-semibold text-gray-900">总价:</span>
            <span class="font-bold text-gold">¥{{ totalPrice }}</span>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="flex gap-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="!isFormValid || submitting"
          class="flex-1 py-3 px-6 bg-gold text-white rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
        >
          {{ submitting ? '提交中...' : '确认预订' }}
        </button>
      </div>
    </form>

    <!-- 成功提示 -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="closeSuccess"
    >
      <div class="bg-white rounded-lg p-8 max-w-md mx-4" @click.stop>
        <div class="text-center">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">预订成功！</h3>
          <p class="text-gray-600 mb-6">您的预订已提交，我们会尽快与您联系确认。</p>
          <button
            @click="closeSuccess"
            class="w-full py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-all font-semibold"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface MealPackage {
  id: string
  name: string
  price: number
  max_guests: number
}

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  available_capacity: number
}

const props = defineProps<{
  selectedPackage: MealPackage | null
  bookingDate: string
  mealType: 'breakfast' | 'lunch' | 'dinner'
  timeSlot: TimeSlot | null
}>()

const emit = defineEmits<{
  cancel: []
  success: [bookingId: string]
}>()

const formData = ref({
  guest_count: 2,
  contact_name: '',
  contact_phone: '',
  special_requests: '',
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const showSuccess = ref(false)

const maxGuests = computed(() => {
  if (!props.selectedPackage || !props.timeSlot) return 10
  return Math.min(props.selectedPackage.max_guests, props.timeSlot.available_capacity)
})

const totalPrice = computed(() => {
  if (!props.selectedPackage) return 0
  return props.selectedPackage.price * formData.value.guest_count
})

const isFormValid = computed(() => {
  return (
    props.selectedPackage &&
    props.bookingDate &&
    props.timeSlot &&
    formData.value.guest_count > 0 &&
    formData.value.guest_count <= maxGuests.value &&
    formData.value.contact_name.trim() !== '' &&
    formData.value.contact_phone.trim() !== ''
  )
})

const incrementGuests = () => {
  if (formData.value.guest_count < maxGuests.value) {
    formData.value.guest_count++
  }
}

const decrementGuests = () => {
  if (formData.value.guest_count > 1) {
    formData.value.guest_count--
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatTimeSlot = (slot: TimeSlot | null) => {
  if (!slot) return '-'
  return `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`
}

const validateForm = () => {
  errors.value = {}

  if (formData.value.guest_count < 1) {
    errors.value.guest_count = '至少需要1位客人'
  } else if (formData.value.guest_count > maxGuests.value) {
    errors.value.guest_count = `最多${maxGuests.value}位客人`
  }

  if (!formData.value.contact_name.trim()) {
    errors.value.contact_name = '请输入联系人姓名'
  }

  if (!formData.value.contact_phone.trim()) {
    errors.value.contact_phone = '请输入联系电话'
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.contact_phone)) {
    errors.value.contact_phone = '请输入有效的手机号码'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm() || !isFormValid.value) {
    return
  }

  try {
    submitting.value = true

    const bookingData = {
      booking_date: props.bookingDate,
      meal_type: props.mealType,
      time_slot_id: props.timeSlot!.id,
      guest_name: formData.value.contact_name,
      guest_phone: formData.value.contact_phone,
      guest_count: formData.value.guest_count,
      package_id: props.selectedPackage!.id,
      total_price: totalPrice.value,
      special_requests: formData.value.special_requests || null,
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurant/bookings/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    })

    const data = await response.json()

    if (data.success) {
      showSuccess.value = true
      // 重置表单
      formData.value = {
        guest_count: 2,
        contact_name: '',
        contact_phone: '',
        special_requests: '',
      }
    } else {
      alert(data.error?.message || '预订失败，请重试')
    }
  } catch (error) {
    console.error('提交预订失败:', error)
    alert('预订失败，请检查网络连接后重试')
  } finally {
    submitting.value = false
  }
}

const closeSuccess = () => {
  showSuccess.value = false
  emit('success', 'booking-id')
}

watch(
  () => props.selectedPackage,
  () => {
    // 当套餐改变时，确保客人数量不超过限制
    if (formData.value.guest_count > maxGuests.value) {
      formData.value.guest_count = maxGuests.value
    }
  },
)
</script>

<style scoped>
.dining-booking-form {
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
