<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <!-- 固定头部 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div class="flex items-center p-4">
        <button 
          @click="$router.go(-1)"
          class="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="flex-1 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-center">编辑账户</h1>
        <div class="w-10 h-10"></div> <!-- 占位元素保持标题居中 -->
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 space-y-4">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-primary-100"></div>
        <div class="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p class="text-gray-600 font-medium">正在加载账户信息...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else-if="account" class="p-6 space-y-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 图标设置 -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Image class="w-5 h-5 text-white" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900">图标设置</h2>
          </div>
          
          <div class="flex items-center space-x-6">
            <div class="flex-shrink-0">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg overflow-hidden">
                <AccountIcon :account="formData" size="large" :key="iconKey" />
              </div>
            </div>
            <div class="flex-1 space-y-3">
              <!-- 选择图标按钮 -->
              <button
                type="button"
                @click="toggleIconPicker"
                class="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Image class="w-5 h-5 mr-2" />
                <span>选择图标</span>
              </button>
              
              <!-- 上传与清空 -->
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
                  <Upload class="w-4 h-4 mr-2" />
                  上传
                  <input type="file" accept="image/*" @change="handleIconUpload" class="hidden" />
                </label>
                <button
                  type="button"
                  @click="clearIcon"
                  class="flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                >
                  <X class="w-4 h-4 mr-2" />
                  清空
                </button>
              </div>
            </div>
          </div>

          <!-- 图标选择器面板 -->
          <div v-if="showIconPicker" class="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
            <!-- 图标来源切换 -->
            <div class="flex p-1 bg-gray-200/50 rounded-xl mb-4">
              <button 
                type="button"
                @click="iconSource = 'predefined'"
                class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                :class="iconSource === 'predefined' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'"
              >
                精选图标
              </button>
              <button 
                type="button"
                @click="iconSource = 'server'"
                class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                :class="iconSource === 'server' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'"
              >
                服务器图标
              </button>
            </div>

            <!-- 精选图标 -->
            <div v-if="iconSource === 'predefined'" class="space-y-3">
              <div class="grid grid-cols-5 gap-3">
                <button
                  v-for="icon in predefinedIcons"
                  :key="icon.name"
                  type="button"
                  @click="selectIcon(icon.value)"
                  class="p-2 rounded-xl border-2 transition-all hover:border-primary-300 bg-white"
                  :class="formData.icon === icon.value ? 'border-primary-500 shadow-inner' : 'border-transparent shadow-sm'"
                >
                  <img :src="icon.value" :alt="icon.name" class="w-8 h-8 mx-auto" />
                </button>
              </div>
            </div>

            <!-- 服务器已有图标 -->
            <div v-if="iconSource === 'server'">
              <div v-if="isFetchingIcons" class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <div v-else-if="serverIcons.length === 0" class="text-center py-8 text-gray-500 text-sm">
                服务器上暂无图标
              </div>
              <div v-else class="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
                <button
                  v-for="icon in serverIcons"
                  :key="icon"
                  type="button"
                  @click="selectIcon(icon)"
                  class="p-2 rounded-xl border-2 transition-all hover:border-primary-300 bg-white"
                  :class="formData.icon === icon ? 'border-primary-500 shadow-inner' : 'border-transparent shadow-sm'"
                >
                  <img :src="accountsStore.getIconUrl(icon)" class="w-10 h-10 mx-auto object-contain rounded-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务名称 -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building class="w-4 h-4 text-white" />
            </div>
            <label class="text-sm font-semibold text-gray-700">
              服务名称 *
            </label>
          </div>
          <input
            v-model="formData.service"
            type="text"
            required
            class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium shadow-sm focus:shadow-md"
            placeholder="例如：Google、GitHub、Microsoft"
            @dblclick="$event.target.select()"
          />
        </div>

        <!-- 账户名称 -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <User class="w-4 h-4 text-white" />
            </div>
            <label class="text-sm font-semibold text-gray-700">
              账户名称 *
            </label>
          </div>
          <input
            v-model="formData.account"
            type="text"
            required
            class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium shadow-sm focus:shadow-md"
            placeholder="例如：your@email.com"
            @dblclick="$event.target.select()"
          />
        </div>

        <!-- 分组选择 -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Folder class="w-4 h-4 text-white" />
            </div>
            <label class="text-sm font-semibold text-gray-700">
              分组
            </label>
          </div>
          <select 
            v-model="formData.group_id" 
            class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium shadow-sm focus:shadow-md"
          >
            <option value="">选择分组（可选）</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>

        <!-- 提交按钮 -->
        <div class="pt-4">
          <button
            type="submit"
            :disabled="isSaving"
            class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div v-if="isSaving" class="flex items-center justify-center space-x-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>保存中...</span>
            </div>
            <span v-else>保存更改</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 错误状态 -->
    <div v-else class="p-6">
      <div class="text-center">
        <div class="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="h-8 w-8 text-red-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">账户未找到</h3>
        <p class="text-gray-600 mb-6">请检查账户是否存在</p>
        <button
          @click="$router.go(-1)"
          class="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import api from '@/utils/api'
import {
  ArrowLeft, AlertTriangle, Upload, Download, X, Image, Building, User, Folder
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'

const router = useRouter()
const route = useRoute()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const account = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const showIconPicker = ref(false)
const iconSource = ref('predefined')
const isFetchingIcons = ref(false)
const iconKey = ref(0)

const formData = reactive({
  service: '',
  account: '',
  group_id: '',
  icon: null
})

const serverIcons = computed(() => accountsStore.icons)

// 预定义图标列表
const predefinedIcons = [
  { name: 'Google', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/google.svg' },
  { name: 'GitHub', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/github.svg' },
  { name: 'Microsoft', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/microsoft.svg' },
  { name: 'Apple', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/apple.svg' },
  { name: 'Amazon', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/amazon.svg' },
  { name: 'Facebook', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/facebook.svg' },
  { name: 'Twitter', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/twitter.svg' },
  { name: 'Discord', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/discord.svg' },
  { name: 'Steam', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/steam.svg' },
  { name: 'Telegram', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/telegram.svg' }
]

const groups = computed(() => accountsStore.groups.filter(g => !['所有账户', '所有账号', 'All accounts'].includes(g.name)))

const loadAccount = async () => {
  try {
    isLoading.value = true
    const accountId = parseInt(route.params.id)
    
    // 确保账户数据已加载
    if (accountsStore.accounts.length === 0) {
      await accountsStore.fetchAccounts()
    }
    
    // 查找账户
    account.value = accountsStore.accounts.find(acc => acc.id === accountId)
    
    if (account.value) {
      // 填充表单数据
      formData.service = account.value.service || ''
      formData.account = account.value.account || ''
      formData.group_id = account.value.group_id ? String(account.value.group_id) : ''
      formData.icon = account.value.icon || null
    }
  } catch (error) {
    console.error('加载账户失败:', error)
    appStore.showNotification('error', '加载账户失败')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formData.service || !formData.account) {
    appStore.showNotification('warning', '请填写所有必填字段')
    return
  }

  try {
    isSaving.value = true
    
    // 先获取完整的账户信息
    const fullAccount = await accountsStore.getAccountDetails(account.value.id)
    if (!fullAccount) {
      throw new Error('无法获取账户详细信息')
    }
    
    // 构建更新数据 - 基于完整账户信息，只更新我们想要修改的字段
    const updateData = {
      ...fullAccount, // 保留所有原始字段
      service: formData.service.trim(),
      account: formData.account.trim()
    }

    // 处理分组字段
    const newGroupId = formData.group_id ? parseInt(formData.group_id) : null
    updateData.group_id = newGroupId

    // 处理图标字段
    if (formData.icon !== account.value.icon) {
      updateData.icon = formData.icon || ''
    }

    // 移除一些可能导致问题的字段
    delete updateData.id
    delete updateData.created_at
    delete updateData.updated_at

    console.log('准备更新的数据:', updateData)

    await accountsStore.updateAccount(account.value.id, updateData)
    appStore.showNotification('success', '账户更新成功')
    router.go(-1)
  } catch (error) {
    console.error('更新账户失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '更新账户失败'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      // 处理Laravel验证错误格式
      const errors = Object.values(error.response.data.errors).flat()
      errorMessage = `验证失败: ${errors.join(', ')}`
    } else if (error.response?.status === 422) {
      errorMessage = '数据验证失败，请检查输入的信息'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器错误，请稍后重试'
    }
    
    appStore.showNotification('error', errorMessage)
  } finally {
    isSaving.value = false
  }
}

// 图标上传功能
const handleIconUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    appStore.showNotification('error', '请选择图片文件')
    event.target.value = ''
    return
  }

  // 检查文件大小 (最大2MB)
  if (file.size > 2 * 1024 * 1024) {
    appStore.showNotification('error', '图片文件大小不能超过2MB')
    event.target.value = ''
    return
  }

  try {
    // 上传图标到2FAuth服务器
    const uploadFormData = new FormData()
    uploadFormData.append('icon', file)
    
    const response = await api.post('/api/v1/icons', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // 使用服务器返回的图标文件名，立即更新显示
    if (response.data && response.data.filename) {
      formData.icon = response.data.filename
      iconKey.value++
      appStore.showNotification('success', '图标上传成功')
    }
    
  } catch (error) {
    console.error('上传图标失败:', error)
    let errorMessage = '上传图标失败'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 413) {
      errorMessage = '图片文件过大'
    } else if (error.response?.status === 422) {
      errorMessage = '图片格式不支持'
    }
    
    appStore.showNotification('error', errorMessage)
  } finally {
    // 清空文件输入
    event.target.value = ''
  }
}

const autoGetIcon = async () => {
  if (!formData.service) {
    appStore.showNotification('warning', '请先填写服务名称')
    return
  }
  
  try {
    // 尝试从常见的图标服务获取
    const serviceName = formData.service.toLowerCase()
    let iconUrl = ''
    
    // 常见服务的图标映射
    const serviceIconMap = {
      'google': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/google.svg',
      'github': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/github.svg',
      'microsoft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/microsoft.svg',
      'apple': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/apple.svg',
      'amazon': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/amazon.svg',
      'facebook': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/facebook.svg',
      'meta': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/meta.svg',
      'twitter': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/twitter.svg',
      'x': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/x.svg',
      'discord': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/discord.svg',
      'dropbox': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/dropbox.svg',
      'steam': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/steam.svg',
      'linkedin': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/linkedin.svg',
      'telegram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/telegram.svg',
      'youtube': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/youtube.svg',
      'instagram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/instagram.svg',
      'tiktok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/tiktok.svg',
      'spotify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/spotify.svg',
      'netflix': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/netflix.svg',
      'twitch': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/twitch.svg'
    }
    
    iconUrl = serviceIconMap[serviceName]
    
    if (iconUrl) {
      formData.icon = iconUrl
      iconKey.value++
      appStore.showNotification('success', '自动获取图标成功')
    } else {
      appStore.showNotification('warning', '未找到该服务的图标，请手动上传')
    }
    
  } catch (error) {
    console.error('自动获取图标失败:', error)
    appStore.showNotification('error', '自动获取图标失败')
  }
}

const selectIcon = (iconValue) => {
  formData.icon = iconValue
  iconKey.value++
  showIconPicker.value = false
}

const toggleIconPicker = async () => {
  showIconPicker.value = !showIconPicker.value
  if (showIconPicker.value && serverIcons.value.length === 0) {
    try {
      isFetchingIcons.value = true
      await accountsStore.fetchIcons()
    } finally {
      isFetchingIcons.value = false
    }
  }
}

const clearIcon = () => {
  formData.icon = null
  iconKey.value++
  appStore.showNotification('success', '图标已清空')
}

onMounted(async () => {
  await loadAccount()
  
  // 确保分组数据已加载
  if (accountsStore.groups.length === 0) {
    try {
      await accountsStore.fetchGroups()
    } catch (error) {
      console.error('加载分组失败:', error)
    }
  }
})
</script> 