<template>
  <div class="admin-table-container">
    <table class="admin-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="loading-cell">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length" class="empty-cell">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="index" class="data-row">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: string
}

defineProps<{
  columns: Column[]
  data: Record<string, unknown>[]
  loading?: boolean
  emptyText?: string
}>()
</script>

<style scoped>
.admin-table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.admin-table thead {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.admin-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #4b5563;
}

.data-row:hover {
  background-color: #f9fafb;
}

.data-row:last-child td {
  border-bottom: none;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: var(--color-deep-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
