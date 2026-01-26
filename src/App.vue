<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
    
    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div class="bg-white rounded-3xl p-10 flex flex-col items-center space-y-6 shadow-2xl animate-scale-up">
        <div class="relative">
          <div class="w-16 h-16 rounded-full border-4 border-primary-50/50"></div>
          <div class="w-16 h-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin absolute top-0"></div>
          <Shield class="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div class="text-center">
          <p class="text-gray-900 font-bold text-lg">请稍候</p>
          <p class="text-gray-500 text-sm">正在与服务器同步数据...</p>
        </div>
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
import { CheckCircle, AlertCircle, XCircle, X, Shield } from 'lucide-vue-next'

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