<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div class="px-4 py-4">
        <div class="flex items-center space-x-3">
          <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </button>
          <h1 class="text-xl font-semibold text-gray-900">设置</h1>
        </div>
      </div>
    </header>

    <!-- 设置内容 - 添加顶部间距 -->
    <div class="px-4 py-6 space-y-6" style="margin-top: 80px;">
      <!-- 用户信息 -->
      <div class="card" v-if="userStore.user">
        <h2 class="text-lg font-medium text-gray-900 mb-4">用户信息</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
              <User class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ userStore.userName }}</h3>
              <p class="text-sm text-gray-600">{{ userStore.userEmail }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">连接信息</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              服务器地址
            </label>
            <div class="flex items-center space-x-3">
              <input
                :value="authStore.baseUrl"
                type="text"
                readonly
                class="input-field bg-gray-50 text-gray-600"
              />
              <button
                @click="copyToClipboard(authStore.baseUrl)"
                class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title="复制"
              >
                <Copy class="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              API密钥
            </label>
            <div class="flex items-center space-x-3">
              <input
                :value="showApiKey ? authStore.apiKey : '••••••••••••••••'"
                type="text"
                readonly
                class="input-field bg-gray-50 text-gray-600"
              />
              <button
                @click="showApiKey = !showApiKey"
                class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title="显示/隐藏"
              >
                <Eye v-if="!showApiKey" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
              <button
                @click="copyToClipboard(authStore.apiKey)"
                class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title="复制"
              >
                <Copy class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户偏好设置 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">用户偏好</h2>
        <div class="space-y-4">
          <!-- 自动复制 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">自动复制验证码</h3>
              <p class="text-sm text-gray-600">生成验证码时自动复制到剪贴板</p>
            </div>
            <button
              @click="toggleUserPreference('auto_copy')"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                getUserPreference('auto_copy', true) ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  getUserPreference('auto_copy', true) ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>

          <!-- 显示验证码时间 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">显示剩余时间</h3>
              <p class="text-sm text-gray-600">在验证码旁显示剩余有效时间</p>
            </div>
            <button
              @click="toggleUserPreference('show_otp_countdown')"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                getUserPreference('show_otp_countdown', true) ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  getUserPreference('show_otp_countdown', true) ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>

          <!-- 紧凑视图 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">紧凑视图</h3>
              <p class="text-sm text-gray-600">使用更紧凑的账户列表显示</p>
            </div>
            <button
              @click="toggleUserPreference('compact_mode')"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                getUserPreference('compact_mode', false) ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  getUserPreference('compact_mode', false) ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>

          <!-- 暗色主题 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">暗色主题</h3>
              <p class="text-sm text-gray-600">使用暗色界面主题</p>
            </div>
            <button
              @click="toggleUserPreference('theme')"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                getUserPreference('theme', 'light') === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  getUserPreference('theme', 'light') === 'dark' ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">数据管理</h2>
        <div class="space-y-3">
          <button
            @click="refreshData"
            :disabled="isRefreshing"
            class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw :class="['h-5 w-5', { 'animate-spin': isRefreshing }]" />
            <span>{{ isRefreshing ? '刷新中...' : '刷新数据' }}</span>
          </button>
          
          <button
            @click="exportData"
            :disabled="isExporting"
            class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Download :class="['h-5 w-5', { 'animate-pulse': isExporting }]" />
            <span>{{ isExporting ? '导出中...' : '导出账户' }}</span>
          </button>
          
          <label class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors cursor-pointer">
            <Upload class="h-5 w-5" />
            <span>导入账户</span>
            <input
              type="file"
              @change="importData"
              accept=".json,.txt"
              class="hidden"
            />
          </label>
          
          <button
            @click="clearCache"
            class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-yellow-50 text-yellow-600 rounded-xl font-medium hover:bg-yellow-100 transition-colors"
          >
            <Trash class="h-5 w-5" />
            <span>清除缓存</span>
          </button>
        </div>
      </div>

      <!-- 系统设置 -->
      <div class="card" v-if="Object.keys(systemSettings).length > 0">
        <h2 class="text-lg font-medium text-gray-900 mb-4">系统设置</h2>
        <div class="space-y-4">
          <div v-for="(setting, key) in systemSettings" :key="key" class="border-b border-gray-100 pb-3 last:border-b-0">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ formatSettingName(key) }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ setting.description || '系统配置项' }}</p>
              </div>
              <span class="text-sm text-gray-500 ml-4">{{ setting.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图标管理 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">图标管理</h2>
        <div class="space-y-3">
          <label class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors cursor-pointer">
            <ImageIcon class="h-5 w-5" />
            <span>上传自定义图标</span>
            <input
              type="file"
              @change="uploadIcon"
              accept="image/*"
              class="hidden"
            />
          </label>
          
          <p class="text-xs text-gray-500 text-center">
            支持 PNG、JPG、SVG 格式，建议尺寸 64x64 像素
          </p>
        </div>
      </div>

      <!-- 关于 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">关于</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">2FAuth管理器</h3>
              <p class="text-sm text-gray-600">版本 1.1.0</p>
            </div>
          </div>
          
          <p class="text-sm text-gray-600">
            现代化的双因素认证管理工具，基于Vue3构建，专为移动端优化设计。完整支持2FAuth API 1.7.0。
          </p>
          
          <div class="flex items-center space-x-4 pt-2">
            <button @click="showAbout('terms')" class="text-sm text-primary-600 font-medium">
              使用条款
            </button>
            <button @click="showAbout('privacy')" class="text-sm text-primary-600 font-medium">
              隐私政策
            </button>
            <button @click="showAbout('help')" class="text-sm text-primary-600 font-medium">
              帮助中心
            </button>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="card">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut class="h-5 w-5" />
          <span>退出登录</span>
        </button>
      </div>
    </div>

    <!-- 退出确认对话框 -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">退出登录</h3>
          <p class="text-gray-600 mb-6">
            确定要退出当前账户吗？您需要重新输入服务器地址和API密钥才能再次登录。
          </p>
          <div class="flex space-x-3">
            <button
              @click="showLogoutModal = false"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              @click="confirmLogout"
              class="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeft, Copy, Eye, EyeOff, RefreshCw, Trash, Shield, LogOut,
  User, Download, Upload, ImageIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const userStore = useUserStore()
const adminStore = useAdminStore()
const appStore = useAppStore()

const showApiKey = ref(false)
const showLogoutModal = ref(false)
const isRefreshing = ref(false)
const isExporting = ref(false)
const systemSettings = ref({})

const getUserPreference = (key, defaultValue) => {
  return userStore.preferences[key] !== undefined ? userStore.preferences[key] : defaultValue
}

const toggleUserPreference = async (key) => {
  try {
    let newValue
    if (key === 'theme') {
      newValue = getUserPreference(key, 'light') === 'dark' ? 'light' : 'dark'
    } else {
      newValue = !getUserPreference(key, true)
    }
    
    await userStore.updateUserPreference(key, newValue)
    
    if (key === 'theme') {
      // 应用主题变化
      if (newValue === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  } catch (error) {
    console.error('更新偏好设置失败:', error)
  }
}

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      appStore.showNotification('success', '已复制到剪贴板')
    }
  } catch (error) {
    appStore.showNotification('error', '复制失败')
  }
}

const refreshData = async () => {
  try {
    isRefreshing.value = true
    await Promise.all([
      accountsStore.fetchAccounts(),
      accountsStore.fetchGroups(),
      userStore.fetchUserPreferences(),
      loadSystemSettings()
    ])
    appStore.showNotification('success', '数据刷新成功')
  } catch (error) {
    appStore.showNotification('error', '刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

const exportData = async () => {
  try {
    isExporting.value = true
    const data = await accountsStore.exportAccounts()
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `2fauth-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    appStore.showNotification('success', '账户数据导出成功')
  } catch (error) {
    appStore.showNotification('error', '导出失败')
  } finally {
    isExporting.value = false
  }
}

const importData = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    await accountsStore.migrateAccounts(data)
    event.target.value = '' // 清空input
  } catch (error) {
    appStore.showNotification('error', '导入失败，请检查文件格式')
  }
}

const uploadIcon = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    await adminStore.uploadIcon(file)
    event.target.value = '' // 清空input
  } catch (error) {
    // 错误已在store中处理
  }
}

const clearCache = () => {
  // 清除除登录信息外的本地缓存
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('2fauth_') && !key.includes('api_key') && !key.includes('base_url')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
  appStore.showNotification('success', '缓存清除成功')
}

const loadSystemSettings = async () => {
  try {
    const settings = await userStore.fetchSettings()
    systemSettings.value = settings
  } catch (error) {
    console.error('加载系统设置失败:', error)
  }
}

const formatSettingName = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const showAbout = (type) => {
  const messages = {
    terms: '使用条款页面开发中...',
    privacy: '隐私政策页面开发中...',
    help: '帮助中心页面开发中...'
  }
  appStore.showNotification('info', messages[type])
}

const handleLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = () => {
  authStore.logout()
  userStore.clearUserData()
  router.push('/login')
  appStore.showNotification('success', '已安全退出')
}

onMounted(async () => {
  try {
    // 加载用户信息和偏好设置
    await Promise.all([
      userStore.fetchUser(),
      userStore.fetchUserPreferences(),
      loadSystemSettings()
    ])
    
    // 应用主题设置
    const theme = getUserPreference('theme', 'light')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
})
</script> 