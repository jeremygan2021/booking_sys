<template>
  <div class="menu-management">
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

    <!-- Cuisines Management -->
    <div v-if="activeTab === 'cuisines'" class="content-section">
      <AdminCard title="菜系管理" subtitle="管理餐厅的菜系分类">
        <div class="cuisines-grid">
          <div v-for="cuisine in cuisines" :key="cuisine.id" class="cuisine-card">
            <div v-if="cuisine.image_url" class="cuisine-image">
              <img :src="getFullImageUrl(cuisine.image_url)" :alt="cuisine.name" />
            </div>
            <div v-else class="cuisine-image-placeholder">
              <span class="text-4xl">🍽️</span>
            </div>
            <div class="cuisine-info">
              <h3 class="cuisine-name">{{ cuisine.name }}</h3>
              <p v-if="cuisine.description" class="cuisine-description">
                {{ cuisine.description }}
              </p>
            </div>
            <div class="cuisine-actions">
              <button @click="editCuisine(cuisine)" class="action-btn edit-btn">
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
              <button @click="confirmDeleteCuisine(cuisine)" class="action-btn delete-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="addCuisine" class="mt-4"> 添加菜系 </AdminButton>
      </AdminCard>
    </div>

    <!-- Packages Management -->
    <div v-if="activeTab === 'packages'" class="content-section">
      <AdminCard title="套餐管理" subtitle="管理餐厅的套餐选项">
        <div class="packages-list">
          <div v-for="pkg in packages" :key="pkg.id" class="package-item">
            <div class="package-info">
              <div class="package-header">
                <h3 class="package-name">{{ pkg.name }}</h3>
                <span :class="['meal-type-badge', pkg.meal_type]">
                  {{ getMealTypeLabel(pkg.meal_type) }}
                </span>
              </div>
              <p v-if="pkg.description" class="package-description">
                {{ pkg.description }}
              </p>
              <div class="package-meta">
                <span class="meta-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  ¥{{ pkg.price }} / 人
                </span>
                <span class="meta-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  最多 {{ pkg.max_guests }} 人
                </span>
                <span v-if="pkg.cuisine_name" class="meta-item cuisine-tag">
                  {{ pkg.cuisine_name }}
                </span>
              </div>
            </div>
            <div class="package-actions">
              <button @click="editPackage(pkg)" class="action-btn edit-btn">
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
              <button @click="confirmDeletePackage(pkg)" class="action-btn delete-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="addPackage" class="mt-4"> 添加套餐 </AdminButton>
      </AdminCard>
    </div>

    <!-- Cuisine Modal -->
    <AdminModal
      v-model="showCuisineModal"
      :title="isEditingCuisine ? '编辑菜系' : '添加菜系'"
      :close-on-overlay="false"
    >
      <div v-if="editingCuisine" class="form-group">
        <label class="form-label">菜系名称 <span class="text-red-500">*</span></label>
        <input
          v-model="editingCuisine.name"
          type="text"
          class="form-input"
          placeholder="例如：川菜"
        />

        <label class="form-label mt-4">菜系描述</label>
        <textarea
          v-model="editingCuisine.description"
          class="form-input"
          rows="3"
          placeholder="简要描述菜系特点"
        ></textarea>

        <label class="form-label mt-4">菜系封面</label>
        <div class="image-selector">
          <div v-if="editingCuisine.image_url" class="selected-images">
            <div class="selected-image-item">
              <img :src="getFullImageUrl(editingCuisine.image_url)" alt="菜系封面" />
              <button @click="editingCuisine.image_url = ''" class="remove-image-btn" type="button">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <AdminButton variant="secondary" @click="openImagePicker" type="button">
            选择封面图片
          </AdminButton>
        </div>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showCuisineModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="saveCuisine" :loading="saving">保存</AdminButton>
      </template>
    </AdminModal>

    <!-- Package Modal -->
    <AdminModal
      v-model="showPackageModal"
      :title="isEditingPackage ? '编辑套餐' : '添加套餐'"
      :close-on-overlay="false"
    >
      <div v-if="editingPackage" class="form-group">
        <label class="form-label">套餐名称 <span class="text-red-500">*</span></label>
        <input
          v-model="editingPackage.name"
          type="text"
          class="form-input"
          placeholder="例如：经典川菜套餐"
        />

        <label class="form-label mt-4">套餐描述</label>
        <textarea
          v-model="editingPackage.description"
          class="form-input"
          rows="3"
          placeholder="描述套餐内容"
        ></textarea>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="form-label">价格（元/人） <span class="text-red-500">*</span></label>
            <input
              v-model.number="editingPackage.price"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="form-label">最大人数 <span class="text-red-500">*</span></label>
            <input
              v-model.number="editingPackage.max_guests"
              type="number"
              min="1"
              class="form-input"
              placeholder="10"
            />
          </div>
        </div>

        <label class="form-label mt-4">用餐类型 <span class="text-red-500">*</span></label>
        <select v-model="editingPackage.meal_type" class="form-input">
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
        </select>

        <label class="form-label mt-4">所属菜系</label>
        <select v-model="editingPackage.cuisine_id" class="form-input">
          <option :value="null">无</option>
          <option v-for="cuisine in cuisines" :key="cuisine.id" :value="cuisine.id">
            {{ cuisine.name }}
          </option>
        </select>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showPackageModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="savePackage" :loading="saving">保存</AdminButton>
      </template>
    </AdminModal>

    <!-- Image Picker Modal -->
    <AdminModal v-model="showImagePicker" title="选择图片" size="large">
      <div class="image-picker-content">
        <div v-if="loadingImages" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="mt-2">加载图片中...</p>
        </div>
        <div v-else-if="availableImages.length === 0" class="text-center py-8">
          <p class="text-gray-600">暂无可用图片，请先上传图片</p>
        </div>
        <div v-else class="images-picker-grid">
          <div
            v-for="image in availableImages"
            :key="image.id"
            :class="['picker-image-item', { selected: isImageSelected(image.file_path) }]"
            @click="selectImage(image.file_path)"
          >
            <img :src="getFullImageUrl(image.file_path)" :alt="image.original_name" />
            <div v-if="isImageSelected(image.file_path)" class="selection-check">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showImagePicker = false">取消</AdminButton>
        <AdminButton variant="primary" @click="confirmImageSelection">确认选择</AdminButton>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AdminCard, AdminButton, AdminModal } from '@/components/admin'
import axios from 'axios'

interface Cuisine {
  id?: string
  name: string
  description: string
  image_url: string
}

interface MealPackage {
  id?: string
  name: string
  description: string
  price: number
  cuisine_id: string | null
  cuisine_name?: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  max_guests: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const activeTab = ref('cuisines')
const loading = ref(false)
const saving = ref(false)

const cuisines = ref<Cuisine[]>([])
const packages = ref<MealPackage[]>([])

const showCuisineModal = ref(false)
const showPackageModal = ref(false)
const editingCuisine = ref<Cuisine | null>(null)
const editingPackage = ref<MealPackage | null>(null)
const isEditingCuisine = ref(false)
const isEditingPackage = ref(false)

// Image Picker
const showImagePicker = ref(false)
const loadingImages = ref(false)
const availableImages = ref<Array<{ id: string; file_path: string; original_name: string }>>([])
const selectedImagePath = ref<string>('')

const tabs = [
  { id: 'cuisines', label: '菜系管理' },
  { id: 'packages', label: '套餐管理' },
]

const getMealTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
  }
  return labels[type] || type
}

onMounted(() => {
  loadCuisines()
  loadPackages()
})

async function loadCuisines() {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/restaurant/cuisines`)
    cuisines.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load cuisines:', error)
    alert('加载菜系失败')
  } finally {
    loading.value = false
  }
}

async function loadPackages() {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/restaurant/packages`)
    packages.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load packages:', error)
    alert('加载套餐失败')
  } finally {
    loading.value = false
  }
}

// Cuisine functions
function addCuisine() {
  editingCuisine.value = {
    name: '',
    description: '',
    image_url: '',
  }
  isEditingCuisine.value = false
  showCuisineModal.value = true
}

function editCuisine(cuisine: Cuisine) {
  editingCuisine.value = { ...cuisine }
  isEditingCuisine.value = true
  showCuisineModal.value = true
}

async function saveCuisine() {
  if (!editingCuisine.value) return

  if (!editingCuisine.value.name) {
    alert('请填写菜系名称')
    return
  }

  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    if (isEditingCuisine.value) {
      await axios.put(
        `${API_BASE}/admin/cuisines/${editingCuisine.value.id}`,
        editingCuisine.value,
        { headers },
      )
    } else {
      await axios.post(`${API_BASE}/admin/cuisines`, editingCuisine.value, { headers })
    }

    await loadCuisines()
    showCuisineModal.value = false
    alert('菜系已保存')
  } catch (error: unknown) {
    console.error('Failed to save cuisine:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function confirmDeleteCuisine(cuisine: Cuisine) {
  if (!confirm(`确定要删除菜系"${cuisine.name}"吗？`)) return

  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    await axios.delete(`${API_BASE}/admin/cuisines/${cuisine.id}`, { headers })
    await loadCuisines()
    alert('菜系已删除')
  } catch (error: unknown) {
    console.error('Failed to delete cuisine:', error)
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    alert(err.response?.data?.error?.message || '删除失败，请重试')
  }
}

// Package functions
function addPackage() {
  editingPackage.value = {
    name: '',
    description: '',
    price: 0,
    cuisine_id: null,
    meal_type: 'lunch',
    max_guests: 10,
  }
  isEditingPackage.value = false
  showPackageModal.value = true
}

function editPackage(pkg: MealPackage) {
  editingPackage.value = { ...pkg }
  isEditingPackage.value = true
  showPackageModal.value = true
}

async function savePackage() {
  if (!editingPackage.value) return

  if (
    !editingPackage.value.name ||
    !editingPackage.value.price ||
    !editingPackage.value.max_guests
  ) {
    alert('请填写必填项')
    return
  }

  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    if (isEditingPackage.value) {
      await axios.put(
        `${API_BASE}/admin/packages/${editingPackage.value.id}`,
        editingPackage.value,
        { headers },
      )
    } else {
      await axios.post(`${API_BASE}/admin/packages`, editingPackage.value, { headers })
    }

    await loadPackages()
    showPackageModal.value = false
    alert('套餐已保存')
  } catch (error: unknown) {
    console.error('Failed to save package:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function confirmDeletePackage(pkg: MealPackage) {
  if (!confirm(`确定要删除套餐"${pkg.name}"吗？`)) return

  try {
    const token = localStorage.getItem('auth_token')
    const headers = { Authorization: `Bearer ${token}` }

    await axios.delete(`${API_BASE}/admin/packages/${pkg.id}`, { headers })
    await loadPackages()
    alert('套餐已删除')
  } catch (error: unknown) {
    console.error('Failed to delete package:', error)
    const err = error as { response?: { data?: { error?: { message?: string } } } }
    alert(err.response?.data?.error?.message || '删除失败，请重试')
  }
}

// Helper function to get full image URL
function getFullImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // 图片在服务器根路径，不在 /api 路径下
  const serverUrl = API_BASE.replace('/api', '')
  return `${serverUrl}${path}`
}

// Image Picker Functions
async function openImagePicker() {
  selectedImagePath.value = ''
  showImagePicker.value = true
  await loadAvailableImages()
}

async function loadAvailableImages() {
  loadingImages.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const response = await axios.get(`${API_BASE}/upload/images`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    availableImages.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load images:', error)
  } finally {
    loadingImages.value = false
  }
}

function isImageSelected(path: string) {
  return selectedImagePath.value === path
}

function selectImage(path: string) {
  selectedImagePath.value = path
}

function confirmImageSelection() {
  if (!selectedImagePath.value) {
    alert('请选择一张图片')
    return
  }

  if (editingCuisine.value) {
    editingCuisine.value.image_url = selectedImagePath.value
  }

  showImagePicker.value = false
  selectedImagePath.value = ''
}
</script>

<style scoped>
.menu-management {
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

/* Cuisines Grid */
.cuisines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.cuisine-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.cuisine-card:hover {
  border-color: var(--color-deep-blue);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cuisine-image,
.cuisine-image-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cuisine-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cuisine-info {
  padding: 1rem;
}

.cuisine-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.cuisine-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.cuisine-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Packages List */
.packages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.package-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.package-item:hover {
  border-color: var(--color-deep-blue);
  background-color: #f9fafb;
}

.package-info {
  flex: 1;
}

.package-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.package-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.meal-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.meal-type-badge.breakfast {
  background-color: #fef3c7;
  color: #92400e;
}

.meal-type-badge.lunch {
  background-color: #dbeafe;
  color: #1e40af;
}

.meal-type-badge.dinner {
  background-color: #e0e7ff;
  color: #3730a3;
}

.package-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.package-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.cuisine-tag {
  background-color: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}

.package-actions {
  display: flex;
  gap: 0.5rem;
}

/* Action Buttons */
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

.delete-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
  background-color: #fee2e2;
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

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.gap-4 {
  gap: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-red-500 {
  color: #ef4444;
}

.text-xs {
  font-size: 0.75rem;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-1 {
  margin-top: 0.25rem;
}

/* Image Selector */
.image-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.selected-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.selected-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  padding: 0.25rem;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background-color: rgb(220, 38, 38);
}

/* Image Picker Modal */
.image-picker-content {
  max-height: 60vh;
  overflow-y: auto;
}

.images-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.picker-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.picker-image-item:hover {
  border-color: var(--color-deep-blue);
  transform: scale(1.05);
}

.picker-image-item.selected {
  border-color: var(--color-deep-blue);
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.2);
}

.picker-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selection-check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--color-deep-blue);
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: var(--color-deep-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
