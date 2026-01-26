import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const apiKey = ref(localStorage.getItem('2fauth_api_key') || '')
  const baseUrl = ref(localStorage.getItem('2fauth_base_url') || '')
  const user = ref(null)

  const isAuthenticated = computed(() => !!apiKey.value && !!baseUrl.value)

  const login = async (url, key) => {
    try {
      // 基础URL清理
      const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url

      // 验证URL格式
      try {
        new URL(formattedUrl)
      } catch (e) {
        throw new Error('INVALID_URL')
      }

      // 临时保存到localStorage以便拦截器使用
      localStorage.setItem('2fauth_api_key', key)
      localStorage.setItem('2fauth_base_url', formattedUrl)

      // 测试API连接 - 使用更短的超时时间
      const response = await api.get('/api/v1/user', { timeout: 3000 })
      console.log('登录成功，用户信息:', response.data)

      // 正式保存认证信息
      apiKey.value = key
      baseUrl.value = formattedUrl
      user.value = response.data

      return true
    } catch (error) {
      console.error('登录失败:', error)
      // 清除临时保存的信息
      localStorage.removeItem('2fauth_api_key')
      localStorage.removeItem('2fauth_base_url')

      if (error.message === 'INVALID_URL') {
        const err = new Error('服务器地址格式不正确')
        err.code = 'INVALID_URL'
        throw err
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        const err = new Error('连接服务器超时，请检查地址是否正确')
        err.code = 'TIMEOUT'
        throw err
      }
      throw error
    }
  }

  const logout = () => {
    apiKey.value = ''
    baseUrl.value = ''
    user.value = null
    localStorage.removeItem('2fauth_api_key')
    localStorage.removeItem('2fauth_base_url')

    // 清理OTP系统 - 异步导入避免循环依赖
    import('@/stores/accounts').then(({ useAccountsStore }) => {
      const accountsStore = useAccountsStore()
      accountsStore.clearAllOTPs()
    }).catch(error => {
      console.error('清理OTP系统失败:', error)
    })
  }

  const initAuth = () => {
    // 初始化时不需要手动设置，拦截器会自动处理
    if (isAuthenticated.value) {
      console.log('已认证，API密钥和基础URL已从localStorage加载')
    }
  }

  return {
    apiKey,
    baseUrl,
    user,
    isAuthenticated,
    login,
    logout,
    initAuth
  }
}) 