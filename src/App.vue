<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
    
    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- 全局提示消息 -->
    <div v-if="notification.show" 
         class="fixed top-4 left-4 right-4 z-50 animate-slide-up"
         :class="notificationClasses">
      <div class="flex items-center space-x-3">
        <component :is="notificationIcon" class="w-5 h-5 flex-shrink-0" />
        <p class="flex-1">{{ notification.message }}</p>
        <button @click="clearNotification" class="p-1">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-vue-next'

const appStore = useAppStore()

const isLoading = computed(() => appStore.isLoading)
const notification = computed(() => appStore.notification)

const notificationClasses = computed(() => {
  const baseClasses = 'rounded-xl p-4 shadow-lg border'
  switch (notification.value.type) {
    case 'success':
      return `${baseClasses} bg-green-50 border-green-200 text-green-800`
    case 'error':
      return `${baseClasses} bg-red-50 border-red-200 text-red-800`
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`
    default:
      return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`
  }
})

const notificationIcon = computed(() => {
  switch (notification.value.type) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'warning':
      return AlertCircle
    default:
      return CheckCircle
  }
})

const clearNotification = () => {
  appStore.clearNotification()
}
</script> 