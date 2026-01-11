<template>
  <div class="booking-calendar">
    <div class="calendar-header mb-6">
      <div class="flex items-center justify-between">
        <button
          @click="previousMonth"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :disabled="isCurrentMonth"
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

        <h2 class="text-2xl font-playfair font-bold text-gray-800">
          {{ currentMonthName }} {{ currentYear }}
        </h2>

        <button @click="nextMonth" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-semibold text-gray-600 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- 日历网格 -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day aspect-square"
        :class="{
          'opacity-40': !day.isCurrentMonth,
          'cursor-not-allowed': !day.isAvailable,
          'cursor-pointer hover:bg-cream': day.isAvailable && day.isCurrentMonth,
        }"
        @click="selectDate(day)"
      >
        <div
          class="h-full flex flex-col items-center justify-center rounded-lg border-2 transition-all"
          :class="getDayClasses(day)"
        >
          <span class="text-sm font-medium">{{ day.date.getDate() }}</span>
          <span v-if="day.isToday" class="text-xs text-gold">今天</span>
        </div>
      </div>
    </div>

    <!-- 选中的日期范围显示 -->
    <div v-if="selectedRange.start || selectedRange.end" class="mt-6 p-4 bg-cream rounded-lg">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">已选日期</h3>
      <div class="flex items-center gap-4">
        <div v-if="selectedRange.start">
          <span class="text-sm text-gray-600">入住日期:</span>
          <span class="ml-2 font-semibold">{{ formatDate(selectedRange.start) }}</span>
        </div>
        <div v-if="selectedRange.end">
          <span class="text-sm text-gray-600">退房日期:</span>
          <span class="ml-2 font-semibold">{{ formatDate(selectedRange.end) }}</span>
        </div>
      </div>
      <div v-if="selectedRange.start && selectedRange.end" class="mt-2">
        <span class="text-sm text-gray-600">共</span>
        <span class="mx-1 font-semibold text-gold">{{ nightsCount }}</span>
        <span class="text-sm text-gray-600">晚</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="mt-4 text-center text-gray-600">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
      <span class="ml-2">检查可用性...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isAvailable: boolean
  isSelected: boolean
  isInRange: boolean
}

interface DateRange {
  start: Date | null
  end: Date | null
}

interface Props {
  roomTypeId?: string
  unavailableDates?: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:dateRange': [range: DateRange]
  'dates-selected': [checkIn: string, checkOut: string]
}>()

// 状态
const currentDate = ref(new Date())
const selectedRange = ref<DateRange>({ start: null, end: null })
const loading = ref(false)
const unavailableDatesSet = ref<Set<string>>(new Set())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份和年份
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ]
  return months[currentMonth.value]
})

// 检查是否是当前月份
const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth()
})

// 计算住宿天数
const nightsCount = computed(() => {
  if (selectedRange.value.start && selectedRange.value.end) {
    const diff = selectedRange.value.end.getTime() - selectedRange.value.start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  return 0
})

// 生成日历天数
const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 获取第一天是星期几
  const firstDayOfWeek = firstDay.getDay()

  // 添加上个月的日期
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevMonthLastDay)
    date.setDate(prevMonthLastDay.getDate() - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isAvailable: false,
      isSelected: false,
      isInRange: false,
    })
  }

  // 添加当前月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = formatDateToString(date)
    const isToday = date.getTime() === today.getTime()
    const isPast = date < today
    const isUnavailable = unavailableDatesSet.value.has(dateStr)
    const isAvailable = !isPast && !isUnavailable

    const isSelected =
      (selectedRange.value.start && date.getTime() === selectedRange.value.start.getTime()) ||
      (selectedRange.value.end && date.getTime() === selectedRange.value.end.getTime())

    const isInRange = !!(
      selectedRange.value.start &&
      selectedRange.value.end &&
      date > selectedRange.value.start &&
      date < selectedRange.value.end
    )

    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      isAvailable,
      isSelected: !!isSelected,
      isInRange,
    })
  }

  // 添加下个月的日期以填满网格
  const remainingDays = 42 - days.length // 6行 x 7列
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isAvailable: false,
      isSelected: false,
      isInRange: false,
    })
  }

  return days
})

// 获取日期的样式类
const getDayClasses = (day: CalendarDay) => {
  const classes = []

  if (day.isSelected) {
    classes.push('bg-gold text-white border-gold')
  } else if (day.isInRange) {
    classes.push('bg-gold bg-opacity-20 border-gold border-opacity-30')
  } else if (day.isToday) {
    classes.push('border-gold')
  } else if (!day.isAvailable) {
    classes.push('bg-gray-100 text-gray-400 border-gray-200')
  } else {
    classes.push('border-gray-200')
  }

  return classes.join(' ')
}

// 选择日期
const selectDate = (day: CalendarDay) => {
  if (!day.isAvailable || !day.isCurrentMonth) return

  const selectedDate = new Date(day.date)

  // 如果没有选择开始日期，或者已经选择了开始和结束日期，重新开始选择
  if (!selectedRange.value.start || (selectedRange.value.start && selectedRange.value.end)) {
    selectedRange.value = { start: selectedDate, end: null }
  } else {
    // 如果选择的日期在开始日期之前，交换它们
    if (selectedDate < selectedRange.value.start) {
      selectedRange.value = { start: selectedDate, end: selectedRange.value.start }
    } else {
      selectedRange.value.end = selectedDate
    }

    // 发出事件
    if (selectedRange.value.start && selectedRange.value.end) {
      emit('update:dateRange', selectedRange.value)
      emit(
        'dates-selected',
        formatDateToString(selectedRange.value.start),
        formatDateToString(selectedRange.value.end),
      )
    }
  }
}

// 上一个月
const previousMonth = () => {
  if (!isCurrentMonth.value) {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  }
}

// 下一个月
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// 格式化日期
const formatDate = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化日期为字符串 (YYYY-MM-DD)
const formatDateToString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 检查房间可用性
const checkAvailability = async () => {
  if (!props.roomTypeId) return

  loading.value = true

  try {
    const startDate = formatDateToString(new Date(currentYear.value, currentMonth.value, 1))
    const endDate = formatDateToString(new Date(currentYear.value, currentMonth.value + 1, 0))

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/rooms/availability/check?check_in_date=${startDate}&check_out_date=${endDate}&room_type_id=${props.roomTypeId}`,
    )
    const data = await response.json()

    if (data.success) {
      // 这里需要根据API返回的数据更新不可用日期
      // 暂时使用props传入的不可用日期
    }
  } catch (error) {
    console.error('Error checking availability:', error)
  } finally {
    loading.value = false
  }
}

// 监听月份变化
watch([currentYear, currentMonth], () => {
  checkAvailability()
})

// 监听不可用日期变化
watch(
  () => props.unavailableDates,
  (newDates) => {
    if (newDates) {
      unavailableDatesSet.value = new Set(newDates)
    }
  },
  { immediate: true },
)

onMounted(() => {
  checkAvailability()
})
</script>

<style scoped>
.calendar-day {
  min-height: 60px;
}

.bg-cream {
  background-color: #faf9f6;
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

.font-playfair {
  font-family: 'Playfair Display', serif;
}

@media (max-width: 640px) {
  .calendar-day {
    min-height: 50px;
  }
}
</style>
