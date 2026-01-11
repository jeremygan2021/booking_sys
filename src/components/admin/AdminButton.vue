<template>
  <button
    :class="['admin-btn', `btn-${variant}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<style scoped>
.admin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-deep-blue);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e40af;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-success {
  background-color: #059669;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #047857;
}

.btn-loading {
  position: relative;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
