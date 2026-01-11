<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'
import ConnectionStatus from './components/realtime/ConnectionStatus.vue'
import Toast from './components/ui/Toast.vue'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt.vue'
import { useGlobalLoading } from './composables/useLoading'

const { loading, message } = useGlobalLoading()
</script>

<template>
  <MainLayout>
    <RouterView />
    <ConnectionStatus />
    <Toast />
    <LoadingOverlay :show="loading" :message="message" />
    <PWAInstallPrompt />
  </MainLayout>
</template>
