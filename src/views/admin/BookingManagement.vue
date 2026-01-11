<template>
  <div class="booking-management">
    <div class="management-header">
      <div class="filters">
        <select v-model="filterType" class="filter-select">
          <option value="all">所有预订</option>
          <option value="room">房间预订</option>
          <option value="restaurant">餐厅预订</option>
        </select>

        <select v-model="filterStatus" class="filter-select">
          <option value="all">所有状态</option>
          <option value="pending">待确认</option>
          <option value="confirmed">已确认</option>
          <option value="cancelled">已取消</option>
        </select>

        <input v-model="filterDate" type="date" class="filter-input" placeholder="选择日期" />

        <AdminButton variant="secondary" @click="resetFilters">重置筛选</AdminButton>
      </div>
    </div>

    <div class="bookings-section">
      <AdminCard title="预订列表" :subtitle="`共 ${totalBookings} 条预订记录`">
        <AdminTable
          :columns="tableColumns"
          :data="displayBookings"
          :loading="loading"
          empty-text="暂无预订记录"
        >
          <template #cell-type="{ value }">
            <span :class="['type-badge', value === 'room' ? 'badge-room' : 'badge-restaurant']">
              {{ value === 'room' ? '房间' : '餐厅' }}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span :class="['status-badge', `status-${value}`]">
              {{ getStatusText(value) }}
            </span>
          </template>

          <template #cell-date="{ row }">
            {{ formatDate((row as Booking).booking_date || (row as Booking).check_in_date) }}
          </template>

          <template #cell-guest="{ row }">
            <div class="guest-info">
              <p class="font-medium">{{ (row as Booking).user_name || '未知' }}</p>
              <p class="text-xs text-gray-600">{{ (row as Booking).guest_count }} 人</p>
            </div>
          </template>

          <template #cell-actions="{ row }">
            <div class="action-buttons">
              <button
                @click="viewBooking(row as Booking)"
                class="action-btn view-btn"
                title="查看详情"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button @click="editBooking(row as Booking)" class="action-btn edit-btn" title="编辑">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          </template>
        </AdminTable>
      </AdminCard>
    </div>

    <!-- Booking Detail Modal -->
    <AdminModal v-model="showDetailModal" title="预订详情" :close-on-overlay="true">
      <div v-if="selectedBooking" class="booking-detail">
        <div class="detail-section">
          <h4 class="detail-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">预订类型</span>
              <span class="detail-value">{{
                selectedBooking.type === 'room' ? '房间预订' : '餐厅预订'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预订状态</span>
              <span :class="['status-badge', `status-${selectedBooking.status}`]">
                {{ getStatusText(selectedBooking.status) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预订日期</span>
              <span class="detail-value">{{
                formatDate(selectedBooking.booking_date || selectedBooking.check_in_date)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">客人数量</span>
              <span class="detail-value">{{ selectedBooking.guest_count }} 人</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-title">客人信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">姓名</span>
              <span class="detail-value">{{ selectedBooking.user_name || '未知' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">邮箱</span>
              <span class="detail-value">{{ selectedBooking.user_email || '未提供' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">电话</span>
              <span class="detail-value">{{ selectedBooking.user_phone || '未提供' }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedBooking.special_requests" class="detail-section">
          <h4 class="detail-title">特殊要求</h4>
          <p class="detail-text">{{ selectedBooking.special_requests }}</p>
        </div>

        <div class="detail-section">
          <h4 class="detail-title">价格信息</h4>
          <div class="price-info">
            <span class="price-label">总价</span>
            <span class="price-value">¥{{ selectedBooking.total_price }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showDetailModal = false">关闭</AdminButton>
      </template>
    </AdminModal>

    <!-- Edit Booking Modal -->
    <AdminModal v-model="showEditModal" title="编辑预订" :close-on-overlay="false">
      <div v-if="editingBooking" class="form-group">
        <label class="form-label">预订状态</label>
        <select v-model="editingBooking.status" class="form-input">
          <option value="pending">待确认</option>
          <option value="confirmed">已确认</option>
          <option value="cancelled">已取消</option>
        </select>

        <label class="form-label mt-4">特殊要求</label>
        <textarea v-model="editingBooking.special_requests" rows="4" class="form-input"></textarea>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showEditModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="saveBooking" :loading="saving">保存</AdminButton>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AdminCard, AdminButton, AdminTable, AdminModal } from '@/components/admin'
import axios from 'axios'

interface Booking {
  id: string | number
  type?: 'room' | 'restaurant'
  status: string
  booking_date?: string
  check_in_date?: string
  user_name?: string
  user_email?: string
  user_phone?: string
  guest_count?: number
  special_requests?: string
  total_price?: number | string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const loading = ref(false)
const saving = ref(false)
const roomBookings = ref<Booking[]>([])
const restaurantBookings = ref<Booking[]>([])

const filterType = ref('all')
const filterStatus = ref('all')
const filterDate = ref('')

const showDetailModal = ref(false)
const showEditModal = ref(false)
const selectedBooking = ref<Booking | null>(null)
const editingBooking = ref<Booking | null>(null)

const tableColumns = [
  { key: 'type', label: '类型', width: '80px' },
  { key: 'date', label: '日期', width: '120px' },
  { key: 'guest', label: '客人信息', width: '150px' },
  { key: 'status', label: '状态', width: '100px' },
  { key: 'total_price', label: '金额', width: '100px' },
  { key: 'actions', label: '操作', width: '100px' },
]

const allBookings = computed(() => {
  const room = roomBookings.value.map((b) => ({ ...b, type: 'room' }))
  const restaurant = restaurantBookings.value.map((b) => ({ ...b, type: 'restaurant' }))
  return [...room, ...restaurant].sort((a, b) => {
    const dateA = new Date(a.booking_date || a.check_in_date || '')
    const dateB = new Date(b.booking_date || b.check_in_date || '')
    return dateB.getTime() - dateA.getTime()
  })
})

const displayBookings = computed(() => {
  let filtered = allBookings.value

  if (filterType.value !== 'all') {
    filtered = filtered.filter((b) => b.type === filterType.value)
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter((b) => b.status === filterStatus.value)
  }

  if (filterDate.value) {
    filtered = filtered.filter((b) => {
      const bookingDate = b.booking_date || b.check_in_date
      return bookingDate === filterDate.value
    })
  }

  return filtered
})

const totalBookings = computed(() => displayBookings.value.length)

onMounted(() => {
  loadBookings()
})

async function loadBookings() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const [roomRes, restaurantRes] = await Promise.all([
      axios.get(`${API_BASE}/rooms/bookings`, { headers }),
      axios.get(`${API_BASE}/restaurant/bookings`, { headers }),
    ])

    roomBookings.value = roomRes.data.success ? roomRes.data.data : roomRes.data
    restaurantBookings.value = restaurantRes.data.success
      ? restaurantRes.data.data
      : restaurantRes.data
  } catch (error) {
    console.error('Failed to load bookings:', error)
    alert('加载预订失败')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filterType.value = 'all'
  filterStatus.value = 'all'
  filterDate.value = ''
}

function viewBooking(booking: Booking) {
  selectedBooking.value = booking
  showDetailModal.value = true
}

function editBooking(booking: Booking) {
  editingBooking.value = { ...booking }
  showEditModal.value = true
}

async function saveBooking() {
  if (!editingBooking.value) return

  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }
    const endpoint =
      editingBooking.value.type === 'room'
        ? `${API_BASE}/rooms/bookings/${editingBooking.value.id}`
        : `${API_BASE}/restaurant/bookings/${editingBooking.value.id}`

    await axios.put(
      endpoint,
      {
        status: editingBooking.value.status,
        special_requests: editingBooking.value.special_requests,
      },
      { headers },
    )

    await loadBookings()
    showEditModal.value = false
    alert('预订已更新')
  } catch (error) {
    console.error('Failed to save booking:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.booking-management {
  max-width: 1400px;
}

.management-header {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  min-width: 150px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-deep-blue);
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.bookings-section {
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

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-room {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-restaurant {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.guest-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.view-btn:hover {
  background-color: #dbeafe;
  color: #1e40af;
}

.edit-btn:hover {
  background-color: #fef3c7;
  color: #92400e;
}

/* Booking Detail */
.booking-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.detail-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.price-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-deep-blue);
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

.mt-4 {
  margin-top: 1rem;
}
</style>
