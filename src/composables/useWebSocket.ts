import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface WebSocketMessage {
  type: string
  event?: string
  data?: Record<string, unknown>
  message?: string
  timestamp: number
}

interface WebSocketOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = options

  const authStore = useAuthStore()

  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const reconnectAttempts = ref(0)
  const lastError = ref<string | null>(null)

  let reconnectTimer: number | null = null
  let heartbeatTimer: number | null = null

  const eventHandlers = new Map<string, Set<(data: Record<string, unknown>) => void>>()

  const getWebSocketUrl = (): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const host = apiUrl.replace(/^https?:\/\//, '')
    return `${protocol}//${host}/ws`
  }

  const connect = () => {
    if (isConnecting.value || isConnected.value) {
      return
    }

    isConnecting.value = true
    lastError.value = null

    try {
      const wsUrl = getWebSocketUrl()
      console.log('Connecting to WebSocket:', wsUrl)

      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        isConnecting.value = false
        reconnectAttempts.value = 0

        // Authenticate if user is logged in
        if (authStore.token) {
          authenticate(authStore.token)
        }

        // Start heartbeat
        startHeartbeat()

        // Trigger connected event
        triggerEvent('connected', {})
      }

      ws.value.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        lastError.value = 'WebSocket connection error'
        isConnecting.value = false
      }

      ws.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        isConnecting.value = false
        stopHeartbeat()

        // Trigger disconnected event
        triggerEvent('disconnected', {})

        // Attempt to reconnect
        if (reconnectAttempts.value < maxReconnectAttempts) {
          scheduleReconnect()
        } else {
          lastError.value = 'Max reconnection attempts reached'
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      isConnecting.value = false
      lastError.value = 'Failed to create WebSocket connection'
    }
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    stopHeartbeat()

    if (ws.value) {
      ws.value.close()
      ws.value = null
    }

    isConnected.value = false
    isConnecting.value = false
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) {
      return
    }

    reconnectAttempts.value++
    console.log(`Scheduling reconnect attempt ${reconnectAttempts.value}/${maxReconnectAttempts}`)

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      connect()
    }, reconnectInterval)
  }

  const authenticate = (token: string) => {
    send('auth', { token })
  }

  const send = (type: string, data?: Record<string, unknown>) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected')
      return false
    }

    try {
      ws.value.send(JSON.stringify({ type, ...data }))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }

  const handleMessage = (message: WebSocketMessage) => {
    console.log('WebSocket message received:', message)

    switch (message.type) {
      case 'connected':
        console.log('WebSocket connection established')
        break

      case 'auth_success':
        console.log('WebSocket authentication successful')
        triggerEvent('authenticated', message.data)
        break

      case 'auth_error':
        console.error('WebSocket authentication failed:', message.message)
        lastError.value = message.message || 'Authentication failed'
        break

      case 'pong':
        // Heartbeat response
        break

      case 'broadcast':
      case 'message':
        if (message.event) {
          triggerEvent(message.event, message.data)
        }
        break

      case 'error':
        console.error('WebSocket error message:', message.message)
        lastError.value = message.message || 'Unknown error'
        break

      default:
        console.warn('Unknown WebSocket message type:', message.type)
    }
  }

  const on = (event: string, handler: (data: Record<string, unknown>) => void) => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set())
    }
    eventHandlers.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlers.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          eventHandlers.delete(event)
        }
      }
    }
  }

  const off = (event: string, handler?: (data: Record<string, unknown>) => void) => {
    if (!handler) {
      eventHandlers.delete(event)
    } else {
      const handlers = eventHandlers.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          eventHandlers.delete(event)
        }
      }
    }
  }

  const triggerEvent = (event: string, data: Record<string, unknown>) => {
    const handlers = eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  const startHeartbeat = () => {
    stopHeartbeat()

    heartbeatTimer = window.setInterval(() => {
      if (isConnected.value) {
        send('ping')
      }
    }, heartbeatInterval)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // Watch for auth changes
  watch(
    () => authStore.token,
    (newToken) => {
      if (newToken && isConnected.value) {
        authenticate(newToken)
      } else if (!newToken) {
        disconnect()
      }
    },
  )

  // Lifecycle
  onMounted(() => {
    if (autoConnect) {
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    isConnected,
    isConnecting,
    lastError,
    reconnectAttempts,

    // Methods
    connect,
    disconnect,
    send,
    on,
    off,

    // Convenience methods for booking events
    onBookingCreated: (handler: (data: Record<string, unknown>) => void) =>
      on('booking_created', handler),
    onBookingUpdated: (handler: (data: Record<string, unknown>) => void) =>
      on('booking_updated', handler),
    onBookingCancelled: (handler: (data: Record<string, unknown>) => void) =>
      on('booking_cancelled', handler),
    onAvailabilityChanged: (handler: (data: Record<string, unknown>) => void) =>
      on('availability_changed', handler),
  }
}
