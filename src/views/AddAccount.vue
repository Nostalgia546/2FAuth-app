<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div class="px-4 py-4">
        <div class="flex items-center space-x-3">
          <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </button>
          <h1 class="text-xl font-semibold text-gray-900">添加账户</h1>
        </div>
      </div>
    </header>

    <!-- 添加方式选择 - 添加顶部间距 -->
    <div class="px-4 py-6" style="margin-top: 80px;">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="addMethod = 'qr'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all',
            addMethod === 'qr'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <QrCode class="h-8 w-8 mx-auto mb-3" :class="addMethod === 'qr' ? 'text-primary-600' : 'text-gray-400'" />
          <p class="font-medium" :class="addMethod === 'qr' ? 'text-primary-900' : 'text-gray-900'">扫码添加</p>
          <p class="text-sm mt-1" :class="addMethod === 'qr' ? 'text-primary-600' : 'text-gray-600'">
            扫描二维码自动填充
          </p>
        </button>

        <button
          @click="addMethod = 'manual'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all',
            addMethod === 'manual'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          ]"
        >
          <Edit class="h-8 w-8 mx-auto mb-3" :class="addMethod === 'manual' ? 'text-primary-600' : 'text-gray-400'" />
          <p class="font-medium" :class="addMethod === 'manual' ? 'text-primary-900' : 'text-gray-900'">手动添加</p>
          <p class="text-sm mt-1" :class="addMethod === 'manual' ? 'text-primary-600' : 'text-gray-600'">
            手动输入账户信息
          </p>
        </button>
      </div>

      <!-- 二维码扫描 -->
      <div v-if="addMethod === 'qr'" class="card mb-6">
        <div class="text-center">
          <div class="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode class="h-8 w-8 text-primary-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">扫描二维码</h3>
          <p class="text-gray-600 mb-6">
            使用专业的QR码扫描器来识别和添加2FA账户
          </p>
          
          <!-- 扫描选项 -->
          <div class="space-y-3">
            <button
              @click="goToQRScanner"
              class="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <Camera class="h-5 w-5" />
              <span>启动QR码扫描器</span>
            </button>
            
            <label class="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer">
              <Upload class="h-5 w-5" />
              <span>上传二维码图片</span>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
            </label>
            
            <button
              @click="addMethod = 'manual'"
              class="w-full text-primary-600 font-medium py-2"
            >
              改为手动添加
            </button>
          </div>
        </div>
      </div>

      <!-- 手动添加表单 -->
      <div v-if="addMethod === 'manual'" class="space-y-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 服务名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              服务名称 *
            </label>
            <input
              v-model="formData.service"
              type="text"
              required
              class="input-field"
              placeholder="例如：Google、GitHub、Microsoft"
            />
          </div>

          <!-- 账户名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              账户名称 *
            </label>
            <input
              v-model="formData.account"
              type="text"
              required
              class="input-field"
              placeholder="例如：your@email.com"
            />
          </div>

          <!-- 密钥 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              密钥 (Secret) *
            </label>
            <div class="relative">
              <input
                v-model="formData.secret"
                :type="showSecret ? 'text' : 'password'"
                required
                class="input-field pr-10"
                placeholder="输入16位以上的密钥"
              />
              <button
                type="button"
                @click="showSecret = !showSecret"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showSecret" class="h-5 w-5 text-gray-400" />
                <EyeOff v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- 分组选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              分组
            </label>
            <select v-model="formData.group_id" class="input-field">
              <option value="">选择分组（可选）</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- 高级设置 -->
          <div class="card">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="w-full flex items-center justify-between p-4 -m-4 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span class="font-medium text-gray-900">高级设置</span>
              <ChevronDown 
                class="h-5 w-5 text-gray-400 transition-transform" 
                :class="{ 'rotate-180': showAdvanced }"
              />
            </button>

            <div v-if="showAdvanced" class="pt-4 space-y-4">
              <!-- OTP类型 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  OTP类型
                </label>
                <select v-model="formData.otp_type" class="input-field">
                  <option value="totp">TOTP (基于时间)</option>
                  <option value="hotp">HOTP (基于计数器)</option>
                </select>
              </div>

              <!-- 数字位数 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  验证码位数
                </label>
                <select v-model="formData.digits" class="input-field">
                  <option value="6">6位</option>
                  <option value="8">8位</option>
                </select>
              </div>

              <!-- 时间周期 (仅TOTP) -->
              <div v-if="formData.otp_type === 'totp'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  时间周期 (秒)
                </label>
                <select v-model="formData.period" class="input-field">
                  <option value="30">30秒</option>
                  <option value="60">60秒</option>
                </select>
              </div>

              <!-- 算法 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  算法
                </label>
                <select v-model="formData.algorithm" class="input-field">
                  <option value="sha1">SHA1</option>
                  <option value="sha256">SHA256</option>
                  <option value="sha512">SHA512</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full"
          >
            {{ isLoading ? '添加中...' : '添加账户' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeft, QrCode, Edit, Camera, Upload, Eye, EyeOff, ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const addMethod = ref('qr')
const showSecret = ref(false)
const showAdvanced = ref(false)
const isLoading = ref(false)

const formData = reactive({
  service: '',
  account: '',
  secret: '',
  group_id: '',
  otp_type: 'totp',
  digits: 6,
  period: 30,
  algorithm: 'sha1'
})

const groups = computed(() => accountsStore.groups)

const goToQRScanner = () => {
  router.push('/qr-scanner')
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    appStore.setLoading(true)
    // TODO: 实现二维码解析功能
    appStore.showNotification('info', '二维码解析功能开发中...')
  } catch (error) {
    appStore.showNotification('error', '解析二维码失败')
  } finally {
    appStore.setLoading(false)
  }
}

const handleSubmit = async () => {
  if (!formData.service || !formData.account || !formData.secret) {
    appStore.showNotification('warning', '请填写所有必填字段')
    return
  }

  if (formData.secret.length < 16) {
    appStore.showNotification('warning', '密钥长度至少为16位')
    return
  }

  try {
    isLoading.value = true
    
    const accountData = {
      service: formData.service,
      account: formData.account,
      secret: formData.secret,
      otp_type: formData.otp_type,
      digits: parseInt(formData.digits),
      algorithm: formData.algorithm,
      ...(formData.group_id && { group_id: parseInt(formData.group_id) }),
      ...(formData.otp_type === 'totp' && { period: parseInt(formData.period) })
    }

    await accountsStore.createAccount(accountData)
    router.push('/accounts')
  } catch (error) {
    console.error('添加账户失败:', error)
    let errorMessage = '添加账户失败'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 422) {
      errorMessage = '请检查输入的信息是否正确'
    }
    
    appStore.showNotification('error', errorMessage)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await accountsStore.fetchGroups()
  } catch (error) {
    console.error('加载分组失败:', error)
  }
})
</script> 