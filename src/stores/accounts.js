import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { useAppStore } from './app'
import { useAuthStore } from './auth'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const groups = ref([])
  const selectedGroupId = ref(null)

  const appStore = useAppStore()
  const authStore = useAuthStore()

  // OTP管理相关状态
  const otpData = ref({}) // 存储所有账户的OTP数据 { accountId: { otp_value, period, remaining_time, generated_at } }
  const isGeneratingOTP = ref(false)
  let otpTimer = null
  let lastUpdateTime = Date.now()
  let isDocumentVisible = true

  // 缓存控制
  const lastFetchTime = ref({
    accounts: 0,
    groups: 0
  })
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  const filteredAccounts = computed(() => {
    if (!selectedGroupId.value) return accounts.value
    return accounts.value.filter(account => account.group_id === selectedGroupId.value)
  })

  const fetchAccounts = async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh && accounts.value.length > 0) {
      const timeSinceLastFetch = Date.now() - lastFetchTime.value.accounts
      if (timeSinceLastFetch < CACHE_DURATION) {
        console.log('使用缓存的账户数据')
        return accounts.value
      }
    }

    try {
      appStore.setLoading(true)
      const response = await api.get('/api/v1/twofaccounts')
      accounts.value = response.data.data || response.data
      lastFetchTime.value.accounts = Date.now()
      
      // 调试图标信息
      if (accounts.value.length > 0) {
        console.log('第一个账户的图标信息:', accounts.value[0].icon)
        console.log('第一个账户的完整数据:', accounts.value[0])
      }
      
      return accounts.value
    } catch (error) {
      console.error('获取账户失败:', error)
      appStore.showNotification('error', '获取账户列表失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const fetchAccount = async (accountId) => {
    try {
      const response = await api.get(`/api/v1/twofaccounts/${accountId}`)
      return response.data
    } catch (error) {
      console.error('获取账户详情失败:', error)
      appStore.showNotification('error', '获取账户详情失败')
      throw error
    }
  }

  const fetchGroups = async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh && groups.value.length > 0) {
      const timeSinceLastFetch = Date.now() - lastFetchTime.value.groups
      if (timeSinceLastFetch < CACHE_DURATION) {
        console.log('使用缓存的分组数据')
        return groups.value
      }
    }

    try {
      const response = await api.get('/api/v1/groups')
      groups.value = response.data.data || response.data
      lastFetchTime.value.groups = Date.now()
      return groups.value
    } catch (error) {
      console.error('获取分组失败:', error)
      appStore.showNotification('error', '获取分组列表失败')
      throw error
    }
  }

  const fetchGroupAccounts = async (groupId) => {
    try {
      const response = await api.get(`/api/v1/groups/${groupId}/twofaccounts`)
      return response.data.data || response.data
    } catch (error) {
      console.error('获取分组账户失败:', error)
      appStore.showNotification('error', '获取分组账户失败')
      throw error
    }
  }

  // 生成OTP - 支持两种方式
  const generateOTP = async (accountId) => {
    try {
      // 先尝试GET方式（推荐）
      const response = await api.get(`/api/v1/twofaccounts/${accountId}/otp`)
      return response.data
    } catch (error) {
      console.error('生成OTP失败:', error)
      appStore.showNotification('error', '生成验证码失败')
      throw error
    }
  }

  // 批量并发生成OTP
  const generateAllOTPs = async (accountIds = null) => {
    if (isGeneratingOTP.value) return // 防止重复生成
    
    try {
      isGeneratingOTP.value = true
      const targetAccounts = accountIds || accounts.value.map(acc => acc.id)
      
      console.log('开始批量生成OTP，账户数量:', targetAccounts.length)
      
      // 并发请求所有OTP
      const otpPromises = targetAccounts.map(async (accountId) => {
        try {
          const otpResponse = await generateOTP(accountId)
          
          // 处理不同的响应数据结构
          let otp
          if (otpResponse.otp_value || otpResponse.password) {
            otp = {
              otp_value: otpResponse.otp_value || otpResponse.password,
              period: otpResponse.period || 30,
              remaining_time: otpResponse.remaining_time || otpResponse.period || 30,
              generated_at: Date.now()
            }
          } else if (otpResponse.data) {
            otp = {
              otp_value: otpResponse.data.otp_value || otpResponse.data.password,
              period: otpResponse.data.period || 30,
              remaining_time: otpResponse.data.remaining_time || otpResponse.data.period || 30,
              generated_at: Date.now()
            }
          } else {
            otp = {
              otp_value: otpResponse,
              period: 30,
              remaining_time: 30,
              generated_at: Date.now()
            }
          }
          
          if (otp.otp_value && otp.otp_value !== 'undefined') {
            otpData.value[accountId] = otp
            console.log(`账户 ${accountId} OTP生成成功:`, otp.otp_value)
            return { accountId, success: true, otp }
          } else {
            console.error(`账户 ${accountId} OTP数据无效`)
            return { accountId, success: false }
          }
        } catch (error) {
          console.error(`账户 ${accountId} OTP生成失败:`, error)
          return { accountId, success: false, error }
        }
      })
      
      // 等待所有请求完成
      const results = await Promise.all(otpPromises)
      
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      
      console.log(`批量OTP生成完成: 成功 ${successCount}, 失败 ${failCount}`)
      
      return results
    } catch (error) {
      console.error('批量生成OTP失败:', error)
      appStore.showNotification('error', '批量生成验证码失败')
      throw error
    } finally {
      isGeneratingOTP.value = false
    }
  }

  // 获取账户的OTP数据
  const getAccountOTP = (accountId) => {
    return otpData.value[accountId] || null
  }

  // 检查OTP是否需要刷新
  const needsOTPRefresh = (accountId) => {
    const otp = otpData.value[accountId]
    if (!otp) return true
    
    // 如果剩余时间少于3秒，需要刷新
    return otp.remaining_time <= 3
  }

  // 更新OTP剩余时间
  const updateOTPTimers = () => {
    const expiredAccountIds = []
    
    Object.keys(otpData.value).forEach(accountId => {
      const otp = otpData.value[accountId]
      if (otp && otp.remaining_time > 0) {
        otp.remaining_time -= 1
        
        // 如果时间刚好到0，标记需要重新生成
        if (otp.remaining_time <= 0) {
          expiredAccountIds.push(accountId)
        }
      }
    })
    
    // 立即重新生成过期的OTP
    if (expiredAccountIds.length > 0) {
      console.log('检测到过期OTP，立即重新生成:', expiredAccountIds)
      generateAllOTPs(expiredAccountIds).catch(error => {
        console.error('重新生成OTP失败:', error)
      })
    }
  }

  // 刷新过期的OTP（备用方法）
  const refreshExpiredOTPs = async () => {
    const expiredAccountIds = Object.keys(otpData.value).filter(accountId => {
      const otp = otpData.value[accountId]
      return otp && otp.remaining_time <= 0
    })
    
    if (expiredAccountIds.length > 0) {
      console.log('刷新过期的OTP:', expiredAccountIds)
      await generateAllOTPs(expiredAccountIds)
    }
  }

  // 监听页面可见性变化
  const handleVisibilityChange = async () => {
    const wasVisible = isDocumentVisible
    isDocumentVisible = !document.hidden
    
    console.log('页面可见性变化:', isDocumentVisible ? '可见' : '隐藏')
    
    if (!wasVisible && isDocumentVisible) {
      // 从后台返回前台
      const now = Date.now()
      const timeDiff = now - lastUpdateTime
      const secondsDiff = Math.floor(timeDiff / 1000)
      
      console.log(`应用从后台返回，后台时间: ${secondsDiff}秒`)
      
      if (accounts.value.length > 0) {
        // 智能更新OTP：根据时间差决定是更新剩余时间还是重新生成
        const accountsNeedingRefresh = []
        
        Object.keys(otpData.value).forEach(accountId => {
          const otp = otpData.value[accountId]
          if (otp) {
            // 计算新的剩余时间
            const newRemainingTime = Math.max(0, otp.remaining_time - secondsDiff)
            
            if (newRemainingTime <= 0) {
              // 如果已经过期，标记需要重新生成
              accountsNeedingRefresh.push(accountId)
              console.log(`账户 ${accountId} OTP已过期，需要重新生成`)
            } else {
              // 如果还没过期，只更新剩余时间
              otp.remaining_time = newRemainingTime
              console.log(`账户 ${accountId} 更新剩余时间: ${newRemainingTime}秒`)
            }
          } else {
            // 如果没有OTP数据，标记需要生成
            accountsNeedingRefresh.push(accountId)
          }
        })
        
        // 如果有账户需要重新生成OTP
        if (accountsNeedingRefresh.length > 0) {
          console.log(`重新生成 ${accountsNeedingRefresh.length} 个过期OTP`)
          await generateAllOTPs(accountsNeedingRefresh)
        }
        
        // 确保所有账户都有OTP数据
        const allAccountIds = accounts.value.map(acc => acc.id)
        const missingOTPAccounts = allAccountIds.filter(id => !otpData.value[id])
        
        if (missingOTPAccounts.length > 0) {
          console.log(`生成 ${missingOTPAccounts.length} 个缺失的OTP`)
          await generateAllOTPs(missingOTPAccounts)
        }
      }
    }
    
    lastUpdateTime = Date.now()
  }

  // 根据时间差更新OTP倒计时
  const updateOTPTimersWithTimeDiff = (timeDiff) => {
    const secondsDiff = Math.floor(timeDiff / 1000)
    
    Object.keys(otpData.value).forEach(accountId => {
      const otp = otpData.value[accountId]
      if (otp && otp.remaining_time > 0) {
        otp.remaining_time = Math.max(0, otp.remaining_time - secondsDiff)
      }
    })
  }

  // 启动OTP自动更新
  const startOTPTimer = () => {
    if (otpTimer) return // 已经启动
    
    // 添加页面可见性监听
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    otpTimer = setInterval(async () => {
      if (isDocumentVisible) {
        updateOTPTimers()
        lastUpdateTime = Date.now()
      }
    }, 1000)
    
    console.log('OTP自动更新已启动')
  }

  // 停止OTP自动更新
  const stopOTPTimer = () => {
    if (otpTimer) {
      clearInterval(otpTimer)
      otpTimer = null
      console.log('OTP自动更新已停止')
    }
    
    // 移除页面可见性监听
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // 清空所有OTP数据
  const clearAllOTPs = () => {
    otpData.value = {}
    stopOTPTimer()
  }

  // 初始化OTP系统
  const initOTPSystem = async () => {
    try {
      // 如果已经有OTP数据且定时器在运行，则不重复初始化
      if (Object.keys(otpData.value).length > 0 && otpTimer) {
        console.log('OTP系统已经初始化，跳过')
        return
      }
      
      // 获取账户数据（使用缓存）
      if (accounts.value.length === 0) {
        await fetchAccounts()
        await fetchGroups()
      }
      
      if (accounts.value.length > 0) {
        console.log('初始化OTP系统，账户数量:', accounts.value.length)
        
        // 启动定时器但不等待OTP生成完成
        startOTPTimer()
        
        // 异步生成OTP，不阻塞初始化
        generateAllOTPs().then(() => {
          console.log('OTP系统初始化完成')
        }).catch(error => {
          console.error('OTP生成失败:', error)
        })
      } else {
        console.log('没有账户，跳过OTP系统初始化')
      }
    } catch (error) {
      console.error('OTP系统初始化失败:', error)
      throw error
    }
  }

  const createAccount = async (accountData) => {
    try {
      appStore.setLoading(true)
      const response = await api.post('/api/v1/twofaccounts', accountData)
      accounts.value.push(response.data)
      appStore.showNotification('success', '账户添加成功')
      return response.data
    } catch (error) {
      console.error('创建账户失败:', error)
      appStore.showNotification('error', '添加账户失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const previewAccount = async (accountData) => {
    try {
      const response = await api.post('/api/v1/twofaccounts/preview', accountData)
      return response.data
    } catch (error) {
      console.error('预览账户失败:', error)
      appStore.showNotification('error', '预览账户失败')
      throw error
    }
  }

  const updateAccount = async (accountId, accountData) => {
    try {
      const response = await api.put(`/api/v1/twofaccounts/${accountId}`, accountData)
      const index = accounts.value.findIndex(acc => acc.id === accountId)
      if (index !== -1) {
        accounts.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新账户失败:', error)
      throw error
    }
  }

  const deleteAccount = async (accountId) => {
    try {
      appStore.setLoading(true)
      await api.delete(`/api/v1/twofaccounts/${accountId}`)
      accounts.value = accounts.value.filter(acc => acc.id !== accountId)
      appStore.showNotification('success', '账户删除成功')
    } catch (error) {
      console.error('删除账户失败:', error)
      appStore.showNotification('error', '删除账户失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const deleteAccounts = async (accountIds) => {
    try {
      appStore.setLoading(true)
      await api.delete('/api/v1/twofaccounts', { data: { ids: accountIds } })
      accounts.value = accounts.value.filter(acc => !accountIds.includes(acc.id))
      appStore.showNotification('success', `成功删除 ${accountIds.length} 个账户`)
    } catch (error) {
      console.error('批量删除账户失败:', error)
      appStore.showNotification('error', '批量删除账户失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const reorderAccounts = async (orderedIds) => {
    try {
      await api.post('/api/v1/twofaccounts/reorder', { orderedIds })
      await fetchAccounts()
      appStore.showNotification('success', '账户顺序已更新')
    } catch (error) {
      console.error('重新排序失败:', error)
      appStore.showNotification('error', '更新账户顺序失败')
      throw error
    }
  }

  const withdrawFromGroups = async (accountIds) => {
    try {
      await api.patch('/api/v1/twofaccounts/withdraw', { ids: accountIds })
      accounts.value = accounts.value.map(acc => 
        accountIds.includes(acc.id) ? { ...acc, group_id: null } : acc
      )
      appStore.showNotification('success', '账户已从分组中移除')
    } catch (error) {
      console.error('移除分组失败:', error)
      appStore.showNotification('error', '移除分组失败')
      throw error
    }
  }

  const exportAccounts = async () => {
    try {
      const response = await api.get('/api/v1/twofaccounts/export')
      return response.data
    } catch (error) {
      console.error('导出账户失败:', error)
      appStore.showNotification('error', '导出账户失败')
      throw error
    }
  }

  const migrateAccounts = async (migrationData) => {
    try {
      appStore.setLoading(true)
      const response = await api.post('/api/v1/twofaccounts/migration', migrationData)
      await fetchAccounts()
      appStore.showNotification('success', '账户迁移成功')
      return response.data
    } catch (error) {
      console.error('账户迁移失败:', error)
      appStore.showNotification('error', '账户迁移失败')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  const getAccountQRCode = async (accountId) => {
    try {
      const response = await api.get(`/api/v1/twofaccounts/${accountId}/qrcode`)
      return response.data
    } catch (error) {
      console.error('获取QR码失败:', error)
      appStore.showNotification('error', '获取QR码失败')
      throw error
    }
  }

  const decodeQRCode = async (qrCodeData) => {
    try {
      const response = await api.post('/api/v1/qrcode/decode', qrCodeData)
      return response.data
    } catch (error) {
      console.error('解码QR码失败:', error)
      appStore.showNotification('error', '解码QR码失败')
      throw error
    }
  }

  const createGroup = async (groupData) => {
    try {
      const response = await api.post('/api/v1/groups', groupData)
      groups.value.push(response.data)
      appStore.showNotification('success', '分组创建成功')
      return response.data
    } catch (error) {
      console.error('创建分组失败:', error)
      appStore.showNotification('error', '创建分组失败')
      throw error
    }
  }

  const updateGroup = async (groupId, groupData) => {
    try {
      const response = await api.put(`/api/v1/groups/${groupId}`, groupData)
      const index = groups.value.findIndex(group => group.id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      appStore.showNotification('success', '分组更新成功')
      return response.data
    } catch (error) {
      console.error('更新分组失败:', error)
      appStore.showNotification('error', '更新分组失败')
      throw error
    }
  }

  const deleteGroup = async (groupId) => {
    try {
      await api.delete(`/api/v1/groups/${groupId}`)
      groups.value = groups.value.filter(group => group.id !== groupId)
      appStore.showNotification('success', '分组删除成功')
    } catch (error) {
      console.error('删除分组失败:', error)
      appStore.showNotification('error', '删除分组失败')
      throw error
    }
  }

  const assignAccountsToGroup = async (groupId, accountIds) => {
    try {
      await api.post(`/api/v1/groups/${groupId}/assign`, { ids: accountIds })
      accounts.value = accounts.value.map(acc => 
        accountIds.includes(acc.id) ? { ...acc, group_id: groupId } : acc
      )
      appStore.showNotification('success', '账户已添加到分组')
    } catch (error) {
      console.error('添加到分组失败:', error)
      appStore.showNotification('error', '添加到分组失败')
      throw error
    }
  }

  const setSelectedGroup = (groupId) => {
    selectedGroupId.value = groupId
  }

  // 获取账户详细信息（包含图标）
  const getAccountDetails = async (accountId) => {
    try {
      const response = await api.get(`/api/v1/twofaccounts/${accountId}`)
      console.log('账户详细信息:', response.data)
      return response.data || null
    } catch (error) {
      console.error('获取账户详细信息失败:', error)
      return null
    }
  }

  // 获取账户图标（如果账户列表中没有包含图标信息）
  const getAccountIcon = async (accountId) => {
    try {
      const accountDetails = await getAccountDetails(accountId)
      return accountDetails?.icon || null
    } catch (error) {
      console.error('获取账户图标失败:', error)
      return null
    }
  }

  // 获取图标URL
  const getIconUrl = (iconPath) => {
    if (!iconPath) return null
    
    console.log('处理图标路径:', iconPath, '基础URL:', authStore.baseUrl)
    
    // 如果是完整的URL，直接返回
    if (iconPath.startsWith('http')) {
      console.log('返回完整URL:', iconPath)
      return iconPath
    }
    
    // 如果是相对路径，构建完整URL
    // 2FAuth通常使用 /storage/icons/ 路径
    let fullUrl
    if (iconPath.startsWith('/')) {
      fullUrl = `${authStore.baseUrl}${iconPath}`
    } else if (iconPath.startsWith('storage/') || iconPath.startsWith('icons/')) {
      fullUrl = `${authStore.baseUrl}/${iconPath}`
    } else {
      // 假设是图标文件名，添加标准路径
      fullUrl = `${authStore.baseUrl}/storage/icons/${iconPath}`
    }
    
    console.log('构建的图标URL:', fullUrl)
    return fullUrl
  }

  // 强制刷新所有数据
  const forceRefreshAll = async () => {
    try {
      appStore.setLoading(true)
      await Promise.all([
        fetchAccounts(true),
        fetchGroups(true)
      ])
      appStore.showNotification('success', '数据刷新成功')
    } catch (error) {
      console.error('刷新数据失败:', error)
      appStore.showNotification('error', '刷新数据失败')
    } finally {
      appStore.setLoading(false)
    }
  }

  return {
    // 状态
    accounts,
    groups,
    selectedGroupId,
    filteredAccounts,
    otpData,
    isGeneratingOTP,
    
    // 基础功能
    fetchAccounts,
    fetchAccount,
    fetchGroups,
    fetchGroupAccounts,
    
    // OTP功能
    generateOTP,
    generateAllOTPs,
    getAccountOTP,
    needsOTPRefresh,
    updateOTPTimers,
    refreshExpiredOTPs,
    startOTPTimer,
    stopOTPTimer,
    clearAllOTPs,
    initOTPSystem,
    
    // 账户管理
    createAccount,
    previewAccount,
    updateAccount,
    deleteAccount,
    deleteAccounts,
    reorderAccounts,
    withdrawFromGroups,
    
    // 导入导出
    exportAccounts,
    migrateAccounts,
    
    // QR码功能
    getAccountQRCode,
    decodeQRCode,
    
    // 分组管理
    createGroup,
    updateGroup,
    deleteGroup,
    assignAccountsToGroup,
    setSelectedGroup,
    
         // 账户图标功能
     getAccountDetails,
     getAccountIcon,
     getIconUrl,
     forceRefreshAll
  }
}) 