<template>
  <div class="content-management">
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

    <!-- Room Content Management -->
    <div v-if="activeTab === 'rooms'" class="content-section">
      <AdminCard title="房间内容管理" subtitle="编辑房间类型的介绍和信息">
        <div class="flex justify-between items-center mb-4">
          <div class="room-types-list flex-1">
            <div
              v-for="roomType in roomTypes"
              :key="roomType.id"
              class="room-type-item"
              @click="editRoomType(roomType)"
            >
              <div class="room-type-info">
                <h4>{{ roomType.name }}</h4>
                <p class="text-sm text-gray-600">
                  {{ roomType.description?.substring(0, 100) }}...
                </p>
              </div>
              <div class="action-btns">
                <button class="edit-btn" @click.stop="editRoomType(roomType)" title="编辑">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button class="delete-btn" @click.stop="deleteRoomType(roomType.id)" title="删除">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <AdminButton variant="primary" @click="createRoomType"> + 添加房间类型 </AdminButton>
      </AdminCard>
    </div>

    <!-- Restaurant Content Management -->
    <div v-if="activeTab === 'restaurant'" class="content-section">
      <AdminCard title="餐厅内容管理" subtitle="编辑餐厅介绍信息">
        <div class="content-editor">
          <div class="editor-toolbar">
            <button
              v-for="action in editorActions"
              :key="action.name"
              @click="applyFormat(action.command)"
              class="toolbar-btn"
              :title="action.name"
            >
              <component :is="action.icon" />
            </button>
          </div>
          <div
            ref="editorRef"
            class="editor-content"
            contenteditable="true"
            @input="handleEditorInput"
            v-html="restaurantContent"
          ></div>
        </div>

        <label class="form-label mt-4">餐厅图片</label>
        <div class="image-selector">
          <div v-if="restaurantImages && restaurantImages.length > 0" class="selected-images">
            <div v-for="(img, index) in restaurantImages" :key="index" class="selected-image-item">
              <img :src="getFullImageUrl(img)" :alt="`餐厅图片 ${index + 1}`" />
              <button @click="removeRestaurantImage(index)" class="remove-image-btn" type="button">
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
          <AdminButton variant="secondary" @click="openImagePicker('restaurant')" type="button">
            选择图片
          </AdminButton>
        </div>

        <div class="preview-section mt-4">
          <h4 class="preview-title">实时预览</h4>
          <div class="preview-content" v-html="restaurantContent"></div>
        </div>

        <div class="action-buttons">
          <AdminButton variant="secondary" @click="resetContent">重置</AdminButton>
          <AdminButton variant="primary" @click="saveRestaurantContent" :loading="saving">
            保存更改
          </AdminButton>
        </div>
      </AdminCard>

      <div class="info-card mt-6">
        <div class="info-content">
          <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 class="info-title">菜系和套餐管理</h4>
            <p class="info-text">
              如需管理餐厅的菜系分类和套餐，请前往
              <RouterLink to="/admin/menu" class="info-link">菜单管理</RouterLink>
              页面
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Management -->
    <div v-if="activeTab === 'images'" class="content-section">
      <AdminCard title="图片管理" subtitle="上传和管理房间及餐厅图片">
        <ImageManager />
      </AdminCard>
    </div>

    <!-- Edit Room Type Modal -->
    <AdminModal
      v-model="showRoomModal"
      :title="isCreating ? '添加房间类型' : '编辑房间类型'"
      :close-on-overlay="false"
    >
      <div v-if="editingRoom" class="form-group">
        <label class="form-label">房间名称</label>
        <input v-model="editingRoom.name" type="text" class="form-input" />

        <label class="form-label mt-4">房间描述</label>
        <textarea v-model="editingRoom.description" rows="4" class="form-input"></textarea>

        <label class="form-label mt-4">基础价格</label>
        <input v-model.number="editingRoom.base_price" type="number" class="form-input" />

        <label class="form-label mt-4">最大入住人数</label>
        <input v-model.number="editingRoom.max_occupancy" type="number" class="form-input" />

        <label class="form-label mt-4">房间设施</label>
        <div class="amenities-manager">
          <div class="amenities-input-group">
            <input
              v-model="newAmenity"
              type="text"
              class="form-input"
              placeholder="输入设施名称后按回车添加"
              @keyup.enter="addAmenity"
            />
            <button class="add-btn" @click="addAmenity" type="button">添加</button>
          </div>
          <div
            v-if="editingRoom.amenities && editingRoom.amenities.length > 0"
            class="amenities-list"
          >
            <span
              v-for="(amenity, index) in editingRoom.amenities"
              :key="index"
              class="amenity-tag"
            >
              {{ amenity }}
              <button class="remove-amenity-btn" @click="removeAmenity(index)" type="button">
                ×
              </button>
            </span>
          </div>
        </div>

        <label class="form-label mt-4">房间图片</label>
        <div class="image-selector">
          <div v-if="editingRoom.images && editingRoom.images.length > 0" class="selected-images">
            <div
              v-for="(img, index) in editingRoom.images"
              :key="index"
              class="selected-image-item"
            >
              <img :src="getFullImageUrl(img)" :alt="`房间图片 ${index + 1}`" />
              <button @click="removeRoomImage(index)" class="remove-image-btn" type="button">
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
          <AdminButton variant="secondary" @click="openImagePicker('room')" type="button">
            选择图片
          </AdminButton>
        </div>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showRoomModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="saveRoomType" :loading="saving">保存</AdminButton>
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
import { RouterLink } from 'vue-router'
import { ref, onMounted, h } from 'vue'
import { AdminCard, AdminButton, AdminModal } from '@/components/admin'
import ImageManager from '@/components/admin/ImageManager.vue'
import axios from 'axios'

interface RoomType {
  id: string | number
  name: string
  description?: string
  base_price?: number
  max_occupancy?: number
  images?: string[]
  amenities?: string[]
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const activeTab = ref('rooms')
const saving = ref(false)
const editorRef = ref<HTMLElement | null>(null)

const tabs = [
  { id: 'rooms', label: '房间内容' },
  { id: 'restaurant', label: '餐厅内容' },
  { id: 'images', label: '图片管理' },
]

// Room Types
const roomTypes = ref<RoomType[]>([])
const showRoomModal = ref(false)
const editingRoom = ref<RoomType | null>(null)
const isCreating = ref(false)
const newAmenity = ref('')

// Restaurant Content
const restaurantContent = ref('<p>欢迎来到爱云香舍餐厅...</p>')
const originalRestaurantContent = ref('')
const restaurantImages = ref<string[]>([])
const originalRestaurantImages = ref<string[]>([])

// Image Picker
const showImagePicker = ref(false)
const loadingImages = ref(false)
const availableImages = ref<Array<{ id: string; file_path: string; original_name: string }>>([])
const selectedImagePath = ref<string>('')
const imagePickerTarget = ref<'room' | 'restaurant'>('room')

// Editor Actions
const editorActions = [
  {
    name: '粗体',
    command: 'bold',
    icon: () =>
      h(
        'svg',
        { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z',
        }),
      ),
  },
  {
    name: '斜体',
    command: 'italic',
    icon: () =>
      h(
        'svg',
        { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M10 4h4M14 4l-4 16M6 20h4',
        }),
      ),
  },
  {
    name: '标题',
    command: 'formatBlock',
    icon: () =>
      h(
        'svg',
        { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M4 6h16M4 12h16M4 18h7',
        }),
      ),
  },
]

onMounted(async () => {
  await loadRoomTypes()
  await loadRestaurantContent()
})

async function loadRoomTypes() {
  try {
    const response = await axios.get(`${API_BASE}/content/room-types`)
    roomTypes.value = response.data
  } catch (error) {
    console.error('Failed to load room types:', error)
  }
}

async function loadRestaurantContent() {
  try {
    const response = await axios.get(`${API_BASE}/content/restaurant`)
    if (response.data) {
      const data = response.data
      restaurantContent.value = data.content || '<p>欢迎来到爱云香舍餐厅...</p>'
      originalRestaurantContent.value = data.content || '<p>欢迎来到爱云香舍餐厅...</p>'
      restaurantImages.value = Array.isArray(data.images) ? data.images : []
      originalRestaurantImages.value = Array.isArray(data.images) ? [...data.images] : []
    }
  } catch (error) {
    console.error('Failed to load restaurant content:', error)
  }
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

function createRoomType() {
  isCreating.value = true
  newAmenity.value = ''
  editingRoom.value = {
    id: 0, // Placeholder
    name: '',
    description: '',
    base_price: 0,
    max_occupancy: 1,
    images: [],
    amenities: [],
  }
  showRoomModal.value = true
}

function editRoomType(room: RoomType) {
  isCreating.value = false
  newAmenity.value = ''
  editingRoom.value = {
    ...room,
    images: Array.isArray(room.images) ? room.images : [],
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
  }
  showRoomModal.value = true
}

function addAmenity() {
  if (!editingRoom.value || !newAmenity.value.trim()) return

  if (!editingRoom.value.amenities) {
    editingRoom.value.amenities = []
  }

  if (!editingRoom.value.amenities.includes(newAmenity.value.trim())) {
    editingRoom.value.amenities.push(newAmenity.value.trim())
  }

  newAmenity.value = ''
}

function removeAmenity(index: number) {
  if (editingRoom.value && editingRoom.value.amenities) {
    editingRoom.value.amenities.splice(index, 1)
  }
}

async function saveRoomType() {
  if (!editingRoom.value) return

  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')

    // 确保数据格式正确
    const roomData = {
      ...editingRoom.value,
      images: Array.isArray(editingRoom.value.images) ? editingRoom.value.images : [],
      amenities: Array.isArray(editingRoom.value.amenities) ? editingRoom.value.amenities : [],
    }

    console.log('Saving room type:', roomData) // 调试日志

    if (isCreating.value) {
      await axios.post(`${API_BASE}/rooms/types`, roomData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('房间类型已创建')
    } else {
      await axios.put(`${API_BASE}/rooms/types/${editingRoom.value.id}`, roomData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('房间类型已更新')
    }

    await loadRoomTypes()
    showRoomModal.value = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to save room type:', error)

    let errorMsg = '保存失败，请重试'
    if (error.response && error.response.data) {
      const data = error.response.data
      if (typeof data.details === 'string') {
        errorMsg = data.details
      } else if (typeof data.error === 'string') {
        errorMsg = data.error
      } else if (typeof data.message === 'string') {
        errorMsg = data.message
      } else if (data.error && typeof data.error === 'object') {
        // 如果 error 是对象（包含 code, message 等），将其转换为字符串
        errorMsg = data.error.message || JSON.stringify(data.error)
      }
    } else if (error instanceof Error) {
      errorMsg = error.message
    }

    alert(errorMsg)
  } finally {
    saving.value = false
  }
}

async function deleteRoomType(id: string | number) {
  if (!confirm('确定要删除这个房间类型吗？此操作不可恢复。')) return

  try {
    const token = localStorage.getItem('auth_token')
    await axios.delete(`${API_BASE}/rooms/types/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    alert('房间类型已删除')
    await loadRoomTypes()
  } catch (error) {
    console.error('Failed to delete room type:', error)
    alert('删除失败，请重试')
  }
}

function removeRoomImage(index: number) {
  if (editingRoom.value && editingRoom.value.images) {
    editingRoom.value.images.splice(index, 1)
  }
}

function applyFormat(command: string) {
  if (command === 'formatBlock') {
    document.execCommand(command, false, '<h3>')
  } else {
    document.execCommand(command, false)
  }
  editorRef.value?.focus()
}

function handleEditorInput(event: Event) {
  const target = event.target as HTMLElement
  restaurantContent.value = target.innerHTML
}

function resetContent() {
  restaurantContent.value = originalRestaurantContent.value
  restaurantImages.value = [...originalRestaurantImages.value]
  if (editorRef.value) {
    editorRef.value.innerHTML = originalRestaurantContent.value
  }
}

async function saveRestaurantContent() {
  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await axios.put(
      `${API_BASE}/content/restaurant`,
      {
        content: restaurantContent.value,
        images: restaurantImages.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    originalRestaurantContent.value = restaurantContent.value
    originalRestaurantImages.value = [...restaurantImages.value]
    alert('餐厅内容已保存')
  } catch (error) {
    console.error('Failed to save restaurant content:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// Image Picker Functions
async function openImagePicker(target: 'room' | 'restaurant') {
  imagePickerTarget.value = target
  selectedImagePath.value = ''
  showImagePicker.value = true
  await loadAvailableImages()
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

  if (imagePickerTarget.value === 'room' && editingRoom.value) {
    if (!editingRoom.value.images) {
      editingRoom.value.images = []
    }
    editingRoom.value.images.push(selectedImagePath.value)
  } else if (imagePickerTarget.value === 'restaurant') {
    restaurantImages.value.push(selectedImagePath.value)
  }

  showImagePicker.value = false
  selectedImagePath.value = ''
}

function removeRestaurantImage(index: number) {
  restaurantImages.value.splice(index, 1)
}

function getFullImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // 图片在服务器根路径，不在 /api 路径下
  const serverUrl = API_BASE.replace('/api', '')
  return `${serverUrl}${path}`
}
</script>

<style scoped>
.content-management {
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

/* Room Types List */
.room-types-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.room-type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.room-type-item:hover {
  border-color: var(--color-deep-blue);
  background-color: #f9fafb;
}

.room-type-info h4 {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.action-btns {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background-color: var(--color-deep-blue);
  color: white;
}

.delete-btn:hover {
  background-color: #ef4444;
  color: white;
}

/* Content Editor */
.content-editor {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.editor-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-btn {
  padding: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.editor-content {
  min-height: 200px;
  padding: 1rem;
  outline: none;
  line-height: 1.6;
}

.editor-content:focus {
  background-color: #fffbeb;
}

/* Preview Section */
.preview-section {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.preview-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.preview-content {
  background-color: white;
  padding: 1rem;
  border-radius: 0.375rem;
  line-height: 1.6;
}

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.info-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-title {
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
}

.info-text {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
}

.info-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.2s;
}

.info-link:hover {
  color: #1d4ed8;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

.mt-6 {
  margin-top: 1.5rem;
}

/* Amenities Manager */
.amenities-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.amenities-input-group {
  display: flex;
  gap: 0.5rem;
}

.add-btn {
  padding: 0.625rem 1rem;
  background-color: var(--color-deep-blue);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #1e40af;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

.remove-amenity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-amenity-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
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
