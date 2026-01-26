<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <!-- 固定顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div class="flex items-center justify-center p-4">
        <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">设置</h1>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 space-y-4">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-primary-100"></div>
        <div class="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p class="text-gray-600 font-medium">正在加载设置...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="p-6">
      <div class="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-red-800">加载失败</h3>
        </div>
        <p class="text-red-700 mb-4">{{ loadError }}</p>
        <button 
          @click="loadSettings"
          class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          重试
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else class="p-6 space-y-6">
      <!-- 用户信息卡片 -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <User class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-1">{{ getUserDisplayName() }}</h2>
            <p class="text-primary-100">{{ accountsStore.accounts.length }} 个验证器账户</p>
          </div>
          <div class="text-right">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- 连接信息 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Server class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">连接信息</h2>
        </div>
        
        <div class="space-y-6">
          <!-- 服务器地址 -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-gray-700">
                服务器地址
              </label>
              <button @click="openEditConnection" class="text-xs text-primary-600 font-semibold hover:text-primary-700">
                修改连接
              </button>
            </div>
            <div class="relative group">
              <input
                :value="authStore.baseUrl || '未设置'"
                type="text"
                readonly
                class="w-full p-4 pr-12 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 text-sm transition-all group-hover:border-gray-300 font-medium"
              />
              <button
                @click="copyToClipboard(authStore.baseUrl)"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="复制"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- API密钥 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">
              API密钥
            </label>
            <div class="relative group">
              <input
                :value="showApiKey ? (authStore.apiKey || '未设置') : '••••••••••••••••••••••••••••••••'"
                type="text"
                readonly
                class="w-full p-4 pr-20 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 text-sm transition-all group-hover:border-gray-300 font-medium"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                <button
                  @click="showApiKey = !showApiKey"
                  class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="显示/隐藏"
                >
                  <Eye v-if="!showApiKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
                <button
                  @click="copyToClipboard(authStore.apiKey)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="复制"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Users class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-sm text-green-700 font-medium">账户数量</p>
                  <p class="text-lg font-bold text-green-800">{{ accountsStore.accounts.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Folder class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-sm text-purple-700 font-medium">分组数量</p>
                  <p class="text-lg font-bold text-purple-800">{{ accountsStore.groups.length }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">操作</h2>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="refreshData"
            :disabled="isRefreshing"
            class="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw v-if="!isRefreshing" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{{ isRefreshing ? '刷新中...' : '刷新数据' }}</span>
          </button>

          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut class="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <!-- 关于信息 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
            <Info class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">关于</h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">2FAuth 移动端</h3>
            <p class="text-sm text-gray-600 mb-1">版本 1.0.0</p>
            <p class="text-sm text-gray-500">基于 Vue3 + Tauri 构建</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改连接对话框 -->
    <div v-if="showEditConnection" class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-up">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings class="w-6 h-6 mr-2 text-primary-600" />
          修改连接设置
        </h3>
        
        <div class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">服务器地址</label>
            <input 
              v-model="editConnectionData.baseUrl" 
              type="url" 
              class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">API 密钥</label>
            <input 
              v-model="editConnectionData.apiKey" 
              type="password" 
              class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
              placeholder="令牌..."
            />
          </div>
        </div>

        <div class="flex space-x-3 mt-8">
          <button
            @click="showEditConnection = false"
            class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            取消
          </button>
          <button
            @click="saveConnection"
            :disabled="isValidating"
            class="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50"
          >
            {{ isValidating ? '验证中...' : '保存更改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAccountsStore } from '../stores/accounts'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import {
  AlertTriangle, User, Shield, Server, Copy, Eye, EyeOff,
  Users, Folder, Settings, RefreshCw, LogOut, Info
} from 'lucide-vue-next'
import BottomTabBar from '@/components/BottomTabBar.vue'
import api from '@/utils/api'

const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()
const router = useRouter()

// 状态变量
const isLoading = ref(true)
const loadError = ref('')
const showApiKey = ref(false)
const isRefreshing = ref(false)
const showEditConnection = ref(false)
const isValidating = ref(false)
const editConnectionData = ref({
  baseUrl: '',
  apiKey: ''
})

// 复制到剪贴板
const copyToClipboard = async (text) => {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(text)
    appStore.showNotification('success', '已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    appStore.showNotification('error', '复制失败')
  }
}

// 刷新数据
const refreshData = async () => {
  if (isRefreshing.value) return
  
  try {
    isRefreshing.value = true
    await accountsStore.forceRefreshAll()
  } catch (error) {
    console.error('刷新数据失败:', error)
    appStore.showNotification('error', '刷新数据失败')
  } finally {
    isRefreshing.value = false
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    accountsStore.clearAllOTPs()
    router.push('/login')
  }
}

// 修改连接设置
const openEditConnection = () => {
  editConnectionData.value = {
    baseUrl: authStore.baseUrl,
    apiKey: authStore.apiKey
  }
  showEditConnection.value = true
}

const saveConnection = async () => {
  if (!editConnectionData.value.baseUrl || !editConnectionData.value.apiKey) {
    appStore.showNotification('error', '请填写完整信息')
    return
  }

  try {
    isValidating.value = true
    // 使用新的连接信息测试登录
    await authStore.login(editConnectionData.value.baseUrl, editConnectionData.value.apiKey)
    appStore.showNotification('success', '连接配置已更新并验证成功')
    showEditConnection.value = false
    // 强制刷新数据
    await refreshData()
  } catch (error) {
    console.error('连接验证失败:', error)
    let msg = '验证失败，请检查设置是否正确'
    if (error.code === 'TIMEOUT') msg = '连接超时，请确认服务器地址正确且在线'
    if (error.code === 'INVALID_URL') msg = '服务器地址格式错误'
    appStore.showNotification('error', msg)
  } finally {
    isValidating.value = false
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      await router.push('/login')
      return
    }
    
    // 并行执行可以同时进行的操作
    const promises = []
    
    // 尝试获取用户信息（如果还没有的话）
    if (!authStore.user) {
      promises.push(
        api.get('/api/v1/user').then(response => {
          if (response.data) {
            authStore.user = response.data
            console.log('获取用户信息成功:', response.data)
          }
        }).catch(error => {
          console.warn('获取用户信息失败，使用默认显示:', error)
          // 不影响主要功能，继续执行
        })
      )
    }
    
    // 确保有账户数据（如果还没有的话）
    if (accountsStore.accounts.length === 0) {
      promises.push(accountsStore.fetchAccounts().catch(error => {
        console.warn('获取账户数据失败:', error)
      }))
    }
    
    // 并行执行所有操作
    await Promise.allSettled(promises)
    
  } catch (error) {
    console.error('加载设置失败:', error)
    loadError.value = '加载设置失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载
onMounted(() => {
  loadSettings()
})

// 获取服务器名称（从URL提取域名）
const getServerName = (url) => {
  if (!url) return '未知服务器'
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return '本地服务器'
  }
}

// 获取用户显示名称
const getUserDisplayName = () => {
  // 尝试从不同来源获取用户信息
  if (authStore.user?.name) {
    return authStore.user.name
  }
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0] // 使用邮箱前缀
  }
  if (authStore.baseUrl) {
    const serverName = getServerName(authStore.baseUrl)
    return `${serverName} 用户`
  }
  return '2FAuth 用户'
}
</script> 