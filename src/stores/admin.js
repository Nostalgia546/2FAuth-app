import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import { useAppStore } from './app'

export const useAdminStore = defineStore('admin', () => {
  const users = ref([])
  const icons = ref([])

  const appStore = useAppStore()

  // 图标管理
  const uploadIcon = async (iconFile) => {
    try {
      appStore.setLoading(true)
      const formData = new FormData()
      formData.append('icon', iconFile)
      
      const response = await api.post('/api/v1/icons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      appStore.showNotification('success', '图标上传成功')
      return response.data
    } catch (error) {
      console.error('上传图标失败:', error)
      appStore.showNotification('error', '上传图标失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const deleteIcon = async (filename) => {
    try {
      await api.delete(`/api/v1/icons/${filename}`)
      appStore.showNotification('success', '图标删除成功')
    } catch (error) {
      console.error('删除图标失败:', error)
      appStore.showNotification('error', '删除图标失败')
      throw error
    }
  }

  // 用户管理
  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/v1/users')
      users.value = response.data.data || response.data
      return response.data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      appStore.showNotification('error', '获取用户列表失败')
      throw error
    }
  }

  const createUser = async (userData) => {
    try {
      appStore.setLoading(true)
      const response = await api.post('/api/v1/users', userData)
      users.value.push(response.data)
      appStore.showNotification('success', '用户创建成功')
      return response.data
    } catch (error) {
      console.error('创建用户失败:', error)
      appStore.showNotification('error', '创建用户失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const fetchUser = async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('获取用户详情失败:', error)
      appStore.showNotification('error', '获取用户详情失败')
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/api/v1/users/${userId}`)
      users.value = users.value.filter(user => user.id !== userId)
      appStore.showNotification('success', '用户删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      appStore.showNotification('error', '删除用户失败')
      throw error
    }
  }

  const promoteUser = async (userId) => {
    try {
      const response = await api.patch(`/api/v1/users/${userId}/promote`)
      const index = users.value.findIndex(user => user.id === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response.data }
      }
      appStore.showNotification('success', '用户已提升为管理员')
      return response.data
    } catch (error) {
      console.error('提升用户失败:', error)
      appStore.showNotification('error', '提升用户失败')
      throw error
    }
  }

  const resetUserPassword = async (userId) => {
    try {
      const response = await api.patch(`/api/v1/users/${userId}/password/reset`)
      appStore.showNotification('success', '用户密码已重置')
      return response.data
    } catch (error) {
      console.error('重置密码失败:', error)
      appStore.showNotification('error', '重置密码失败')
      throw error
    }
  }

  const revokeUserTokens = async (userId) => {
    try {
      await api.delete(`/api/v1/users/${userId}/pats`)
      appStore.showNotification('success', '用户访问令牌已撤销')
    } catch (error) {
      console.error('撤销访问令牌失败:', error)
      appStore.showNotification('error', '撤销访问令牌失败')
      throw error
    }
  }

  const getUserAuthentications = async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}/authentications`)
      return response.data
    } catch (error) {
      console.error('获取用户认证日志失败:', error)
      appStore.showNotification('error', '获取用户认证日志失败')
      throw error
    }
  }

  const revokeUserCredentials = async (userId) => {
    try {
      await api.delete(`/api/v1/users/${userId}/credentials`)
      appStore.showNotification('success', 'WebAuthn凭据已撤销')
    } catch (error) {
      console.error('撤销WebAuthn凭据失败:', error)
      appStore.showNotification('error', '撤销WebAuthn凭据失败')
      throw error
    }
  }

  return {
    // 状态
    users,
    icons,
    
    // 图标管理
    uploadIcon,
    deleteIcon,
    
    // 用户管理
    fetchUsers,
    createUser,
    fetchUser,
    deleteUser,
    promoteUser,
    resetUserPassword,
    revokeUserTokens,
    getUserAuthentications,
    revokeUserCredentials
  }
}) 