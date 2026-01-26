<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-500 to-primary-700">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo和标题 -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <Shield class="h-8 w-8 text-primary-600" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-white">
          2FAuth 管理器
        </h2>
        <p class="mt-2 text-primary-100">
          连接到您的2FAuth服务器
        </p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 服务器地址 -->
          <div>
            <label for="baseUrl" class="block text-sm font-medium text-gray-700 mb-2">
              服务器地址
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="baseUrl"
                v-model="formData.baseUrl"
                type="url"
                required
                class="input-field pl-10"
                placeholder="https://your-2fauth-server.com"
                :disabled="isLoading"
                @dblclick="$event.target.select()"
              />
            </div>
          </div>

          <!-- API密钥 -->
          <div>
            <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">
              API密钥
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="apiKey"
                v-model="formData.apiKey"
                :type="showApiKey ? 'text' : 'password'"
                required
                class="input-field pl-10 pr-10"
                placeholder="输入您的API密钥"
                :disabled="isLoading"
                @dblclick="$event.target.select()"
              />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="isLoading"
              >
                <Eye v-if="!showApiKey" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ isLoading ? '连接中...' : '登录' }}</span>
          </button>
        </form>

        <!-- 帮助信息 -->
        <div class="mt-6 p-4 bg-blue-50 rounded-xl">
          <div class="flex items-start space-x-3">
            <Info class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-blue-700">
              <p class="font-medium mb-1">如何获取API密钥？</p>
              <p>在2FAuth设置页面的OAUTH部分点击"生成新令牌"来创建API密钥。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { Shield, Server, Key, Eye, EyeOff, Info } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const isLoading = ref(false)
const showApiKey = ref(false)

const formData = reactive({
  baseUrl: '',
  apiKey: ''
})

const handleLogin = async () => {
  if (!formData.baseUrl || !formData.apiKey) return

  try {
    isLoading.value = true
    await authStore.login(formData.baseUrl, formData.apiKey)
    appStore.showNotification('success', '登录成功！')
    router.push('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    let errorMessage = error.message || '登录失败，请检查服务器设置'
    
    if (error.response?.status === 401) {
      errorMessage = 'API密钥无效，请登录 2FAuth 网页版生成正确的令牌'
    } else if (error.code === 'INVALID_URL') {
      errorMessage = '服务器地址格式错误，必须以 http:// 或 https:// 开头'
    } else if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
      errorMessage = '连接服务器超时，请确认地址无误且服务器在线'
    } else if (error.message === 'Network Error') {
      errorMessage = '网络连接错误，请检查网络设置或服务器地址'
    }
    
    appStore.showNotification('error', errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script> 