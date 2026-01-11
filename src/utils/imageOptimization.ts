/**
 * Image optimization utilities
 */

interface ImageCacheEntry {
  url: string
  timestamp: number
}

const imageCache = new Map<string, ImageCacheEntry>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.all(sources.map((src) => preloadImage(src)))
}

/**
 * Get cached image URL or fetch new one
 */
export function getCachedImage(url: string): string {
  const cached = imageCache.get(url)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url
  }

  // Update cache
  imageCache.set(url, {
    url,
    timestamp: Date.now(),
  })

  return url
}

/**
 * Clear image cache
 */
export function clearImageCache(): void {
  imageCache.clear()
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src
          observer.unobserve(img)
        }
      })
    })

    observer.observe(img)
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src
  }
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ')
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type,
          quality,
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
