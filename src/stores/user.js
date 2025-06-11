import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { useAppStore } from './app'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const preferences = ref({})
  const settings = ref({})

  const appStore = useAppStore()

  // 获取用户信息
  const fetchUser = async () => {
    try {
      const response = await api.get('/api/v1/user')
      user.value = response.data
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      appStore.showNotification('error', '获取用户信息失败')
      throw error
    }
  }

  // 获取用户名（已废弃，但保留兼容性）
  const fetchUserName = async () => {
    try {
      const response = await api.get('/api/v1/user/name')
      return response.data
    } catch (error) {
      console.error('获取用户名失败:', error)
      throw error
    }
  }

  // 获取所有用户偏好设置
  const fetchUserPreferences = async () => {
    try {
      const response = await api.get('/api/v1/user/preferences')
      preferences.value = response.data
      return response.data
    } catch (error) {
      console.error('获取用户偏好设置失败:', error)
      appStore.showNotification('error', '获取用户偏好设置失败')
      throw error
    }
  }

  // 获取特定偏好设置
  const fetchUserPreference = async (name) => {
    try {
      const response = await api.get(`/api/v1/user/preferences/${name}`)
      return response.data
    } catch (error) {
      console.error(`获取偏好设置 ${name} 失败:`, error)
      throw error
    }
  }

  // 更新用户偏好设置
  const updateUserPreference = async (name, value) => {
    try {
      const response = await api.put(`/api/v1/user/preferences/${name}`, { value })
      preferences.value[name] = response.data.value
      appStore.showNotification('success', '偏好设置已更新')
      return response.data
    } catch (error) {
      console.error(`更新偏好设置 ${name} 失败:`, error)
      appStore.showNotification('error', '更新偏好设置失败')
      throw error
    }
  }

  // 获取所有系统设置
  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/v1/settings')
      settings.value = response.data
      return response.data
    } catch (error) {
      console.error('获取系统设置失败:', error)
      appStore.showNotification('error', '获取系统设置失败')
      throw error
    }
  }

  // 获取特定设置
  const fetchSetting = async (name) => {
    try {
      const response = await api.get(`/api/v1/settings/${name}`)
      return response.data
    } catch (error) {
      console.error(`获取设置 ${name} 失败:`, error)
      throw error
    }
  }

  // 创建自定义设置
  const createSetting = async (settingData) => {
    try {
      const response = await api.post('/api/v1/settings', settingData)
      settings.value[settingData.name] = response.data
      appStore.showNotification('success', '设置已创建')
      return response.data
    } catch (error) {
      console.error('创建设置失败:', error)
      appStore.showNotification('error', '创建设置失败')
      throw error
    }
  }

  // 更新设置
  const updateSetting = async (name, settingData) => {
    try {
      const response = await api.put(`/api/v1/settings/${name}`, settingData)
      settings.value[name] = response.data
      appStore.showNotification('success', '设置已更新')
      return response.data
    } catch (error) {
      console.error(`更新设置 ${name} 失败:`, error)
      appStore.showNotification('error', '更新设置失败')
      throw error
    }
  }

  // 删除自定义设置
  const deleteSetting = async (name) => {
    try {
      await api.delete(`/api/v1/settings/${name}`)
      delete settings.value[name]
      appStore.showNotification('success', '设置已删除')
    } catch (error) {
      console.error(`删除设置 ${name} 失败:`, error)
      appStore.showNotification('error', '删除设置失败')
      throw error
    }
  }

  // 用户状态计算属性
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // 清除用户数据
  const clearUserData = () => {
    user.value = null
    preferences.value = {}
    settings.value = {}
  }

  return {
    // 状态
    user,
    preferences,
    settings,
    
    // 计算属性
    isLoggedIn,
    userName,
    userEmail,
    
    // 用户信息
    fetchUser,
    fetchUserName,
    clearUserData,
    
    // 用户偏好设置
    fetchUserPreferences,
    fetchUserPreference,
    updateUserPreference,
    
    // 系统设置
    fetchSettings,
    fetchSetting,
    createSetting,
    updateSetting,
    deleteSetting
  }
}) 