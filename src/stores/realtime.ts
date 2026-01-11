import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import type { RoomBooking, RestaurantBooking } from '@/types'

export const useRealtimeStore = defineStore('realtime', () => {
  // State
  const isOnline = ref(navigator.onLine)
  const lastSyncTime = ref<Date | null>(null)
  const pendingUpdates = ref<Array<Record<string, unknown>>>([])
  const roomBookings = ref<Map<string, RoomBooking>>(new Map())
  const restaurantBookings = ref<Map<string, RestaurantBooking>>(new Map())

  // WebSocket connection
  const ws = useWebSocket({
    autoConnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  })

  // Computed
  const isConnected = computed(() => ws.isConnected.value)
  const hasPendingUpdates = computed(() => pendingUpdates.value.length > 0)

  // Initialize event listeners
  const initializeListeners = () => {
    // Booking events
    ws.onBookingCreated((data) => {
      console.log('Booking created:', data)
      handleBookingCreated(data)
    })

    ws.onBookingUpdated((data) => {
      console.log('Booking updated:', data)
      handleBookingUpdated(data)
    })

    ws.onBookingCancelled((data) => {
      console.log('Booking cancelled:', data)
      handleBookingCancelled(data)
    })

    ws.onAvailabilityChanged((data) => {
      console.log('Availability changed:', data)
      handleAvailabilityChanged(data)
    })

    // Connection events
    ws.on('connected', () => {
      console.log('Real-time connection established')
      syncPendingUpdates()
    })

    ws.on('disconnected', () => {
      console.log('Real-time connection lost')
    })

    // Online/offline detection
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  // Booking event handlers
  const handleBookingCreated = (data: Record<string, unknown>) => {
    const { bookingType, booking } = data

    if (bookingType === 'room') {
      roomBookings.value.set(booking as string, booking as RoomBooking)
    } else if (bookingType === 'restaurant') {
      restaurantBookings.value.set(booking as string, booking as RestaurantBooking)
    }

    lastSyncTime.value = new Date()

    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('booking-created', { detail: data }))
  }

  const handleBookingUpdated = (data: Record<string, unknown>) => {
    const { bookingType, booking } = data

    if (bookingType === 'room') {
      roomBookings.value.set(booking as string, booking as RoomBooking)
    } else if (bookingType === 'restaurant') {
      restaurantBookings.value.set(booking as string, booking as RestaurantBooking)
    }

    lastSyncTime.value = new Date()

    // Emit custom event
    window.dispatchEvent(new CustomEvent('booking-updated', { detail: data }))
  }

  const handleBookingCancelled = (data: Record<string, unknown>) => {
    const { bookingType, bookingId } = data

    if (bookingType === 'room') {
      roomBookings.value.delete(bookingId as string)
    } else if (bookingType === 'restaurant') {
      restaurantBookings.value.delete(bookingId as string)
    }

    lastSyncTime.value = new Date()

    // Emit custom event
    window.dispatchEvent(new CustomEvent('booking-cancelled', { detail: data }))
  }

  const handleAvailabilityChanged = (data: Record<string, unknown>) => {
    lastSyncTime.value = new Date()

    // Emit custom event
    window.dispatchEvent(new CustomEvent('availability-changed', { detail: data }))
  }

  // Online/offline handlers
  const handleOnline = () => {
    console.log('Network connection restored')
    isOnline.value = true
    ws.connect()
    syncPendingUpdates()
  }

  const handleOffline = () => {
    console.log('Network connection lost')
    isOnline.value = false
  }

  // Sync pending updates when connection is restored
  const syncPendingUpdates = async () => {
    if (!isConnected.value || pendingUpdates.value.length === 0) {
      return
    }

    console.log(`Syncing ${pendingUpdates.value.length} pending updates`)

    const updates = [...pendingUpdates.value]
    pendingUpdates.value = []

    for (const update of updates) {
      try {
        // Attempt to send the update
        await sendUpdate(update)
      } catch (error) {
        console.error('Failed to sync update:', error)
        // Re-add to pending if failed
        pendingUpdates.value.push(update)
      }
    }
  }

  const sendUpdate = async (update: Record<string, unknown>) => {
    // Implementation depends on the update type
    // This is a placeholder for actual API calls
    console.log('Sending update:', update)
  }

  // Queue an update when offline
  const queueUpdate = (update: Record<string, unknown>) => {
    pendingUpdates.value.push({
      ...update,
      timestamp: Date.now(),
    })
  }

  // Get booking by ID
  const getRoomBooking = (id: string): RoomBooking | undefined => {
    return roomBookings.value.get(id)
  }

  const getRestaurantBooking = (id: string): RestaurantBooking | undefined => {
    return restaurantBookings.value.get(id)
  }

  // Clear all bookings
  const clearBookings = () => {
    roomBookings.value.clear()
    restaurantBookings.value.clear()
  }

  // Cleanup
  const cleanup = () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    ws.disconnect()
  }

  return {
    // State
    isOnline,
    isConnected,
    lastSyncTime,
    hasPendingUpdates,
    pendingUpdates,
    roomBookings,
    restaurantBookings,

    // Methods
    initializeListeners,
    queueUpdate,
    syncPendingUpdates,
    getRoomBooking,
    getRestaurantBooking,
    clearBookings,
    cleanup,

    // WebSocket methods
    connect: ws.connect,
    disconnect: ws.disconnect,
  }
})
