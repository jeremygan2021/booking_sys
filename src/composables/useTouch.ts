import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface TouchPosition {
  x: number
  y: number
}

interface SwipeDirection {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

export function useTouch(element: Ref<HTMLElement | null>, threshold: number = 50) {
  const startPos = ref<TouchPosition>({ x: 0, y: 0 })
  const endPos = ref<TouchPosition>({ x: 0, y: 0 })
  const isSwiping = ref(false)
  const swipeDirection = ref<SwipeDirection>({
    left: false,
    right: false,
    up: false,
    down: false,
  })

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return

    startPos.value = {
      x: touch.clientX,
      y: touch.clientY,
    }
    isSwiping.value = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping.value) return

    const touch = e.touches[0]
    if (!touch) return

    endPos.value = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping.value) return

    const deltaX = endPos.value.x - startPos.value.x
    const deltaY = endPos.value.y - startPos.value.y

    // Reset direction
    swipeDirection.value = {
      left: false,
      right: false,
      up: false,
      down: false,
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          swipeDirection.value.right = true
        } else {
          swipeDirection.value.left = true
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          swipeDirection.value.down = true
        } else {
          swipeDirection.value.up = true
        }
      }
    }

    isSwiping.value = false
  }

  onMounted(() => {
    if (element.value) {
      element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.value.addEventListener('touchmove', handleTouchMove, { passive: true })
      element.value.addEventListener('touchend', handleTouchEnd)
    }
  })

  onUnmounted(() => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchmove', handleTouchMove)
      element.value.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    isSwiping,
    swipeDirection,
    startPos,
    endPos,
  }
}

export function useLongPress(
  element: Ref<HTMLElement | null>,
  callback: () => void,
  duration: number = 500,
) {
  let timeout: number | null = null

  const handleTouchStart = () => {
    timeout = window.setTimeout(() => {
      callback()
    }, duration)
  }

  const handleTouchEnd = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  onMounted(() => {
    if (element.value) {
      element.value.addEventListener('touchstart', handleTouchStart)
      element.value.addEventListener('touchend', handleTouchEnd)
      element.value.addEventListener('touchcancel', handleTouchEnd)
    }
  })

  onUnmounted(() => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchend', handleTouchEnd)
      element.value.removeEventListener('touchcancel', handleTouchEnd)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
  })
}

export function usePinchZoom(element: Ref<HTMLElement | null>) {
  const scale = ref(1)
  let initialDistance = 0

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0
    const dx = touches[0]!.clientX - touches[1]!.clientX
    const dy = touches[0]!.clientY - touches[1]!.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const currentDistance = getDistance(e.touches)
      const newScale = (currentDistance / initialDistance) * scale.value
      scale.value = Math.max(0.5, Math.min(3, newScale))
    }
  }

  const handleTouchEnd = () => {
    initialDistance = 0
  }

  onMounted(() => {
    if (element.value) {
      element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.value.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.value.addEventListener('touchend', handleTouchEnd)
    }
  })

  onUnmounted(() => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchmove', handleTouchMove)
      element.value.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    scale,
  }
}
