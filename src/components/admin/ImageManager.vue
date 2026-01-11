<template>
  <div class="image-manager">
    <div class="manager-header">
      <h3 class="text-lg font-semibold">图片管理</h3>
      <div class="header-actions">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileSelect"
          class="hidden"
        />
        <AdminButton variant="primary" @click="triggerFileInput">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          上传图片
        </AdminButton>
        <AdminButton
          v-if="selectedImages.length > 0"
          variant="danger"
          @click="deleteSelectedImages"
        >
          删除选中 ({{ selectedImages.length }})
        </AdminButton>
      </div>
    </div>

    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="text-sm text-gray-600 mt-2">上传中... {{ uploadProgress }}%</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载图片中...</p>
    </div>

    <div v-else-if="images.length === 0" class="empty-state">
      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p class="text-gray-600 mt-4">暂无图片</p>
      <AdminButton variant="primary" @click="triggerFileInput" class="mt-4">
        上传第一张图片
      </AdminButton>
    </div>

    <div v-else class="images-grid">
      <div
        v-for="image in images"
        :key="image.id"
        :class="['image-item', { selected: isSelected(image.id) }]"
        @click="toggleSelection(image.id)"
      >
        <div class="image-wrapper">
          <img :src="getImageUrl(image.file_path)" :alt="image.original_name" />
          <div class="image-overlay">
            <button
              @click.stop="copyImageUrl(image.file_path)"
              class="overlay-btn"
              title="复制链接"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button @click.stop="deleteImage(image.id)" class="overlay-btn" title="删除">
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
          <div v-if="isSelected(image.id)" class="selection-indicator">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div class="image-info">
          <p class="image-name">{{ image.original_name }}</p>
          <p class="image-size">{{ formatFileSize(image.file_size) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AdminButton } from '@/components/admin'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const images = ref<
  Array<{
    id: string
    file_path: string
    original_name: string
    file_size: number
  }>
>([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const selectedImages = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  loadImages()
})

async function loadImages() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_BASE}/api/upload/images`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    images.value = response.data.success ? response.data.data : response.data
  } catch (error) {
    console.error('Failed to load images:', error)
    alert('加载图片失败')
  } finally {
    loading.value = false
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file) {
        formData.append('images', file)
      }
    }

    const token = localStorage.getItem('token')
    await axios.post(`${API_BASE}/api/upload/images`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
    })

    await loadImages()
    alert('图片上传成功')
  } catch (error) {
    console.error('Failed to upload images:', error)
    alert('图片上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function toggleSelection(id: string) {
  const index = selectedImages.value.indexOf(id)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(id)
  }
}

function isSelected(id: string) {
  return selectedImages.value.includes(id)
}

async function deleteImage(id: string) {
  if (!confirm('确定要删除这张图片吗？')) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_BASE}/api/upload/image/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    await loadImages()
    alert('图片已删除')
  } catch (error) {
    console.error('Failed to delete image:', error)
    alert('删除图片失败')
  }
}

async function deleteSelectedImages() {
  if (!confirm(`确定要删除选中的 ${selectedImages.value.length} 张图片吗？`)) return

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_BASE}/api/upload/images`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ids: selectedImages.value },
    })
    selectedImages.value = []
    await loadImages()
    alert('图片已删除')
  } catch (error) {
    console.error('Failed to delete images:', error)
    alert('删除图片失败')
  }
}

function copyImageUrl(filePath: string) {
  const fullUrl = `${API_BASE}${filePath}`
  navigator.clipboard.writeText(fullUrl)
  alert('图片链接已复制到剪贴板')
}

function getImageUrl(filePath: string) {
  return `${API_BASE}${filePath}`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.image-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.upload-progress {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-deep-blue);
  transition: width 0.3s;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: var(--color-deep-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-item {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: var(--color-deep-blue);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: var(--color-deep-blue);
  background-color: #eff6ff;
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background-color: #f3f4f6;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 0.5rem;
  background-color: white;
  border: none;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.overlay-btn:hover {
  background-color: var(--color-deep-blue);
  color: white;
}

.selection-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--color-deep-blue);
  background-color: white;
  border-radius: 50%;
}

.image-info {
  padding: 0.75rem;
  background-color: white;
}

.image-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.hidden {
  display: none;
}
</style>
