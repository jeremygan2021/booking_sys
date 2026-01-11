<template>
  <div class="timeslot-management">
    <div class="management-header">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Breakfast Time Slots -->
    <div v-if="activeTab === 'breakfast'" class="content-section">
      <AdminCard title="早餐时间段配置" subtitle="管理早餐的可用时间段">
        <div class="timeslots-list">
          <div v-for="slot in breakfastSlots" :key="slot.id" class="timeslot-item">
            <div class="timeslot-info">
              <div class="time-display">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="time-text">{{ slot.start_time }} - {{ slot.end_time }}</span>
              </div>
              <div class="capacity-info">
                <span class="capacity-label">容量:</span>
                <span class="capacity-value">{{ slot.max_capacity }} 人</span>
              </div>
              <div class="status-info">
                <span :class="['status-indicator', slot.is_active ? 'active' : 'inactive']"></span>
                <span class="status-text">{{ slot.is_active ? '启用' : '禁用' }}</span>
              </div>
            </div>
            <div class="timeslot-actions">
              <button @click="editTimeSlot(slot)" class="action-btn edit-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                编辑
              </button>
              <button @click="toggleTimeSlot(slot)" class="action-btn toggle-btn">
                {{ slot.is_active ? '禁用' : '启用' }}
              </button>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="addTimeSlot('breakfast')" class="mt-4">
          添加早餐时间段
        </AdminButton>
      </AdminCard>
    </div>

    <!-- Lunch Time Slots -->
    <div v-if="activeTab === 'lunch'" class="content-section">
      <AdminCard title="午餐时间段配置" subtitle="管理午餐的可用时间段">
        <div class="timeslots-list">
          <div v-for="slot in lunchSlots" :key="slot.id" class="timeslot-item">
            <div class="timeslot-info">
              <div class="time-display">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="time-text">{{ slot.start_time }} - {{ slot.end_time }}</span>
              </div>
              <div class="capacity-info">
                <span class="capacity-label">容量:</span>
                <span class="capacity-value">{{ slot.max_capacity }} 人</span>
              </div>
              <div class="status-info">
                <span :class="['status-indicator', slot.is_active ? 'active' : 'inactive']"></span>
                <span class="status-text">{{ slot.is_active ? '启用' : '禁用' }}</span>
              </div>
            </div>
            <div class="timeslot-actions">
              <button @click="editTimeSlot(slot)" class="action-btn edit-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                编辑
              </button>
              <button @click="toggleTimeSlot(slot)" class="action-btn toggle-btn">
                {{ slot.is_active ? '禁用' : '启用' }}
              </button>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="addTimeSlot('lunch')" class="mt-4">
          添加午餐时间段
        </AdminButton>
      </AdminCard>
    </div>

    <!-- Dinner Time Slots -->
    <div v-if="activeTab === 'dinner'" class="content-section">
      <AdminCard title="晚餐时间段配置" subtitle="管理晚餐的可用时间段">
        <div class="timeslots-list">
          <div v-for="slot in dinnerSlots" :key="slot.id" class="timeslot-item">
            <div class="timeslot-info">
              <div class="time-display">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="time-text">{{ slot.start_time }} - {{ slot.end_time }}</span>
              </div>
              <div class="capacity-info">
                <span class="capacity-label">容量:</span>
                <span class="capacity-value">{{ slot.max_capacity }} 人</span>
              </div>
              <div class="status-info">
                <span :class="['status-indicator', slot.is_active ? 'active' : 'inactive']"></span>
                <span class="status-text">{{ slot.is_active ? '启用' : '禁用' }}</span>
              </div>
            </div>
            <div class="timeslot-actions">
              <button @click="editTimeSlot(slot)" class="action-btn edit-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                编辑
              </button>
              <button @click="toggleTimeSlot(slot)" class="action-btn toggle-btn">
                {{ slot.is_active ? '禁用' : '启用' }}
              </button>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="addTimeSlot('dinner')" class="mt-4">
          添加晚餐时间段
        </AdminButton>
      </AdminCard>
    </div>

    <!-- Edit/Add Time Slot Modal -->
    <AdminModal
      v-model="showTimeSlotModal"
      :title="isEditing ? '编辑时间段' : '添加时间段'"
      :close-on-overlay="false"
    >
      <div v-if="editingSlot" class="form-group">
        <label class="form-label">用餐类型</label>
        <select v-model="editingSlot.meal_type" class="form-input" :disabled="isEditing">
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
        </select>

        <label class="form-label mt-4">开始时间</label>
        <input v-model="editingSlot.start_time" type="time" class="form-input" />

        <label class="form-label mt-4">结束时间</label>
        <input v-model="editingSlot.end_time" type="time" class="form-input" />

        <label class="form-label mt-4">最大容量（人数）</label>
        <input v-model.number="editingSlot.max_capacity" type="number" min="1" class="form-input" />

        <label class="form-label mt-4">
          <input v-model="editingSlot.is_active" type="checkbox" class="mr-2" />
          启用此时间段
        </label>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showTimeSlotModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="saveTimeSlot" :loading="saving">保存</AdminButton>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AdminCard, AdminButton, AdminModal } from '@/components/admin'
import axios from 'axios'

interface TimeSlot {
  id?: string | number
  meal_type: string
  start_time: string
  end_time: string
  max_capacity: number
  is_active: boolean
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const activeTab = ref('lunch')
const loading = ref(false)
const saving = ref(false)
const timeSlots = ref<TimeSlot[]>([])

const showTimeSlotModal = ref(false)
const editingSlot = ref<TimeSlot | null>(null)
const isEditing = ref(false)

const tabs = [
  { id: 'breakfast', label: '早餐时间' },
  { id: 'lunch', label: '午餐时间' },
  { id: 'dinner', label: '晚餐时间' },
]

const breakfastSlots = computed(() =>
  timeSlots.value.filter((slot) => slot.meal_type === 'breakfast'),
)
const lunchSlots = computed(() => timeSlots.value.filter((slot) => slot.meal_type === 'lunch'))
const dinnerSlots = computed(() => timeSlots.value.filter((slot) => slot.meal_type === 'dinner'))

onMounted(() => {
  loadTimeSlots()
})

async function loadTimeSlots() {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/restaurant/time-slots`)
    timeSlots.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load time slots:', error)
    alert('加载时间段失败')
  } finally {
    loading.value = false
  }
}

function addTimeSlot(mealType: string) {
  editingSlot.value = {
    meal_type: mealType,
    start_time: '',
    end_time: '',
    max_capacity: 20,
    is_active: true,
  }
  isEditing.value = false
  showTimeSlotModal.value = true
}

function editTimeSlot(slot: TimeSlot) {
  editingSlot.value = { ...slot }
  isEditing.value = true
  showTimeSlotModal.value = true
}

async function saveTimeSlot() {
  if (!editingSlot.value) return

  if (!editingSlot.value.start_time || !editingSlot.value.end_time) {
    alert('请填写开始时间和结束时间')
    return
  }

  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    if (isEditing.value) {
      await axios.put(`${API_BASE}/admin/time-slots/${editingSlot.value.id}`, editingSlot.value, {
        headers,
      })
    } else {
      await axios.post(`${API_BASE}/admin/time-slots`, editingSlot.value, { headers })
    }

    await loadTimeSlots()
    showTimeSlotModal.value = false
    alert('时间段已保存')
  } catch (error) {
    console.error('Failed to save time slot:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function toggleTimeSlot(slot: TimeSlot) {
  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    await axios.put(
      `${API_BASE}/admin/time-slots/${slot.id}`,
      { is_active: !slot.is_active },
      { headers },
    )

    await loadTimeSlots()
    alert(`时间段已${slot.is_active ? '禁用' : '启用'}`)
  } catch (error) {
    console.error('Failed to toggle time slot:', error)
    alert('操作失败，请重试')
  }
}
</script>

<style scoped>
.timeslot-management {
  max-width: 1200px;
}

.management-header {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: var(--color-deep-blue);
}

.tab-btn.active {
  color: var(--color-deep-blue);
  border-bottom-color: var(--color-deep-blue);
}

.content-section {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeslots-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeslot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.timeslot-item:hover {
  border-color: var(--color-deep-blue);
  background-color: #f9fafb;
}

.timeslot-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
}

.time-text {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.capacity-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.capacity-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.capacity-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-indicator.active {
  background-color: #10b981;
}

.status-indicator.inactive {
  background-color: #ef4444;
}

.status-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.timeslot-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.edit-btn:hover {
  border-color: var(--color-deep-blue);
  color: var(--color-deep-blue);
}

.toggle-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-deep-blue);
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.mt-4 {
  margin-top: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
