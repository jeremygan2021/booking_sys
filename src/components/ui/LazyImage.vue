<template>
  <div :class="['relative overflow-hidden', containerClass]">
    <!-- Placeholder -->
    <div
      v-if="!loaded"
      :class="['absolute inset-0 bg-gray-200 animate-pulse', placeholderClass]"
    ></div>

    <!-- Actual image -->
    <img
      ref="imageRef"
      :src="loaded ? src : undefined"
      :alt="alt"
      :class="['transition-opacity duration-300', imageClass, { 'opacity-0': !loaded }]"
      @load="onLoad"
      @error="onError"
    />

    <!-- Error state -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
    >
      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt?: string
  containerClass?: string
  imageClass?: string
  placeholderClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  containerClass: '',
  imageClass: '',
  placeholderClass: '',
})

const imageRef = ref<HTMLImageElement | null>(null)
const loaded = ref(false)
const error = ref(false)
let observer: IntersectionObserver | null = null

const onLoad = () => {
  loaded.value = true
  error.value = false
}

const onError = () => {
  error.value = true
  loaded.value = false
}

onMounted(() => {
  if (!imageRef.value) return

  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.value) {
            imageRef.value.src = props.src
            observer?.unobserve(imageRef.value)
          }
        })
      },
      {
        rootMargin: '50px',
      },
    )

    observer.observe(imageRef.value)
  } else {
    // Fallback: load immediately
    if (imageRef.value) {
      imageRef.value.src = props.src
    }
  }
})

onUnmounted(() => {
  if (observer && imageRef.value) {
    observer.unobserve(imageRef.value)
  }
})
</script>
