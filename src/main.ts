import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { registerServiceWorker } from './utils/serviceWorker'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth store to restore authentication state from localStorage
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')

// Register service worker for offline support
registerServiceWorker()
