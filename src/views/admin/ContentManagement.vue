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
        <div class="room-types-list">
          <div
            v-for="roomType in roomTypes"
            :key="roomType.id"
            class="room-type-item"
            @click="editRoomType(roomType)"
          >
            <div class="room-type-info">
              <h4>{{ roomType.name }}</h4>
              <p class="text-sm text-gray-600">{{ roomType.description?.substring(0, 100) }}...</p>
            </div>
            <button class="edit-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>
      </AdminCard>
    </div>

    <!-- Restaurant Content Management -->
    <div v-if="activeTab === 'restaurant'" class="content-section">
      <AdminCard title="餐厅内容管理" subtitle="编辑餐厅介绍和菜系信息">
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

        <div class="preview-section">
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

      <!-- Cuisines Management -->
      <AdminCard title="菜系管理" subtitle="管理餐厅提供的菜系分类" class="mt-6">
        <div class="cuisines-list">
          <div v-for="cuisine in cuisines" :key="cuisine.id" class="cuisine-item">
            <div class="cuisine-info">
              <h4>{{ cuisine.name }}</h4>
              <p class="text-sm text-gray-600">{{ cuisine.description }}</p>
            </div>
            <div class="cuisine-actions">
              <button @click="editCuisine(cuisine)" class="action-icon-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button @click="deleteCuisine(cuisine.id)" class="action-icon-btn text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <AdminButton variant="primary" @click="showAddCuisineModal = true" class="mt-4">
          添加菜系
        </AdminButton>
      </AdminCard>
    </div>

    <!-- Image Management -->
    <div v-if="activeTab === 'images'" class="content-section">
      <AdminCard title="图片管理" subtitle="上传和管理房间及餐厅图片">
        <ImageManager />
      </AdminCard>
    </div>

    <!-- Edit Room Type Modal -->
    <AdminModal v-model="showRoomModal" title="编辑房间类型" :close-on-overlay="false">
      <div v-if="editingRoom" class="form-group">
        <label class="form-label">房间名称</label>
        <input v-model="editingRoom.name" type="text" class="form-input" />

        <label class="form-label mt-4">房间描述</label>
        <textarea v-model="editingRoom.description" rows="4" class="form-input"></textarea>

        <label class="form-label mt-4">基础价格</label>
        <input v-model.number="editingRoom.base_price" type="number" class="form-input" />

        <label class="form-label mt-4">最大入住人数</label>
        <input v-model.number="editingRoom.max_occupancy" type="number" class="form-input" />
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showRoomModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="saveRoomType" :loading="saving">保存</AdminButton>
      </template>
    </AdminModal>

    <!-- Add/Edit Cuisine Modal -->
    <AdminModal v-model="showAddCuisineModal" title="添加菜系">
      <div class="form-group">
        <label class="form-label">菜系名称</label>
        <input v-model="newCuisine.name" type="text" class="form-input" />

        <label class="form-label mt-4">菜系描述</label>
        <textarea v-model="newCuisine.description" rows="3" class="form-input"></textarea>
      </div>

      <template #footer>
        <AdminButton variant="secondary" @click="showAddCuisineModal = false">取消</AdminButton>
        <AdminButton variant="primary" @click="addCuisine" :loading="saving">添加</AdminButton>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AdminCard, AdminButton, AdminModal } from '@/components/admin'
import ImageManager from '@/components/admin/ImageManager.vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const activeTab = ref('rooms')
const saving = ref(false)
const editorRef = ref<HTMLElement | null>(null)

const tabs = [
  { id: 'rooms', label: '房间内容' },
  { id: 'restaurant', label: '餐厅内容' },
  { id: 'images', label: '图片管理' },
]

// Room Types
const roomTypes = ref<Array<Record<string, unknown>>>([])
const showRoomModal = ref(false)
const editingRoom = ref<Record<string, unknown> | null>(null)

// Restaurant Content
const restaurantContent = ref('<p>欢迎来到爱云香舍餐厅...</p>')
const originalRestaurantContent = ref('')

// Cuisines
const cuisines = ref<Array<Record<string, unknown>>>([])
const showAddCuisineModal = ref(false)
const newCuisine = ref({ name: '', description: '' })

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
  await loadCuisines()
  await loadRestaurantContent()
})

async function loadRoomTypes() {
  try {
    const response = await axios.get(`${API_BASE}/api/content/room-types`)
    roomTypes.value = response.data
  } catch (error) {
    console.error('Failed to load room types:', error)
  }
}

async function loadCuisines() {
  try {
    const response = await axios.get(`${API_BASE}/api/restaurant/cuisines`)
    cuisines.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load cuisines:', error)
  }
}

async function loadRestaurantContent() {
  try {
    const response = await axios.get(`${API_BASE}/api/content/restaurant`)
    if (response.data && response.data.content) {
      restaurantContent.value = response.data.content
      originalRestaurantContent.value = response.data.content
    }
  } catch (error) {
    console.error('Failed to load restaurant content:', error)
  }
}

function editRoomType(room: Record<string, unknown>) {
  editingRoom.value = { ...room }
  showRoomModal.value = true
}

async function saveRoomType() {
  if (!editingRoom.value) return

  saving.value = true
  try {
    await axios.put(`${API_BASE}/api/content/room-types/${editingRoom.value.id}`, editingRoom.value)
    await loadRoomTypes()
    showRoomModal.value = false
    alert('房间类型已更新')
  } catch (error) {
    console.error('Failed to save room type:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
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
  if (editorRef.value) {
    editorRef.value.innerHTML = originalRestaurantContent.value
  }
}

async function saveRestaurantContent() {
  saving.value = true
  try {
    await axios.put(`${API_BASE}/api/content/restaurant`, {
      content: restaurantContent.value,
    })
    originalRestaurantContent.value = restaurantContent.value
    alert('餐厅内容已保存')
  } catch (error) {
    console.error('Failed to save restaurant content:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

function editCuisine(cuisine: Record<string, unknown>) {
  newCuisine.value = { ...cuisine } as { name: string; description: string }
  showAddCuisineModal.value = true
}

async function addCuisine() {
  if (!newCuisine.value.name) {
    alert('请输入菜系名称')
    return
  }

  saving.value = true
  try {
    await axios.post(`${API_BASE}/api/restaurant/cuisines`, newCuisine.value)
    await loadCuisines()
    showAddCuisineModal.value = false
    newCuisine.value = { name: '', description: '' }
    alert('菜系已添加')
  } catch (error) {
    console.error('Failed to add cuisine:', error)
    alert('添加失败，请重试')
  } finally {
    saving.value = false
  }
}

async function deleteCuisine(id: string) {
  if (!confirm('确定要删除这个菜系吗？')) return

  try {
    await axios.delete(`${API_BASE}/api/restaurant/cuisines/${id}`)
    await loadCuisines()
    alert('菜系已删除')
  } catch (error) {
    console.error('Failed to delete cuisine:', error)
    alert('删除失败，请重试')
  }
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

.edit-btn {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background-color: var(--color-deep-blue);
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

/* Cuisines List */
.cuisines-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.cuisine-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.cuisine-item:hover {
  background-color: #f9fafb;
}

.cuisine-info h4 {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.cuisine-actions {
  display: flex;
  gap: 0.5rem;
}

.action-icon-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
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
</style>
