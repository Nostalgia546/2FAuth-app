import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const notification = ref({
    show: false,
    type: 'info', // success, error, warning, info
    message: ''
  })

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const showNotification = (type, message, duration = 3000) => {
    notification.value = {
      show: true,
      type,
      message
    }

    if (duration > 0) {
      setTimeout(() => {
        clearNotification()
      }, duration)
    }
  }

  const clearNotification = () => {
    notification.value.show = false
  }

  return {
    isLoading,
    notification,
    setLoading,
    showNotification,
    clearNotification
  }
}) 