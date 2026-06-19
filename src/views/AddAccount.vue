<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0 md:h-screen md:overflow-hidden" :class="{ 'overflow-hidden': addMethod === 'qr' }">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 z-40 md:hidden">
      <div class="px-4 py-4">
        <div class="flex items-center justify-center">
          <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">添加账户</h1>
        </div>
      </div>
    </header>

    <!-- 添加方式选择 - 添加顶部间距 -->
    <div class="px-4 py-6 mt-[80px] md:mt-8 md:max-w-7xl md:mx-auto md:flex md:gap-8 md:h-[calc(100vh-64px)] md:items-stretch" :class="{ 'overflow-hidden': addMethod === 'qr' }">
      <!-- 移动端：扫码/手动 切换按钮 -->
      <div class="grid grid-cols-2 gap-4 mb-6 md:hidden">
        <button
          @click="addMethod = 'qr'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
            addMethod === 'qr'
              ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 shadow-primary-200'
              : 'border-gray-200 bg-white/70 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80'
          ]"
        >
          <QrCode class="h-8 w-8 mx-auto mb-3" :class="addMethod === 'qr' ? 'text-primary-600' : 'text-gray-400'" />
          <p class="font-semibold" :class="addMethod === 'qr' ? 'text-primary-900' : 'text-gray-900'">扫码添加</p>
          <p class="text-sm mt-1" :class="addMethod === 'qr' ? 'text-primary-600' : 'text-gray-600'">
            扫描二维码自动填充
          </p>
        </button>

        <button
          @click="addMethod = 'manual'"
          :class="[
            'p-6 rounded-2xl border-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
            addMethod === 'manual'
              ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 shadow-primary-200'
              : 'border-gray-200 bg-white/70 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80'
          ]"
        >
          <Edit class="h-8 w-8 mx-auto mb-3" :class="addMethod === 'manual' ? 'text-primary-600' : 'text-gray-400'" />
          <p class="font-semibold" :class="addMethod === 'manual' ? 'text-primary-900' : 'text-gray-900'">手动添加</p>
          <p class="text-sm mt-1" :class="addMethod === 'manual' ? 'text-primary-600' : 'text-gray-600'">
            手动输入账户信息
          </p>
        </button>
      </div>

      <!-- 左侧：二维码智能解析区 (移动端依条件显示，桌面端固定在左侧) -->
      <div :class="[addMethod === 'qr' ? 'flex' : 'hidden', 'md:flex md:w-5/12 lg:w-1/3 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/60 shadow-xl mb-6 md:mb-0 md:h-full items-center flex-col justify-center']">
        <div class="text-center w-full">
          <div class="h-16 w-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <QrCode class="h-8 w-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">扫描二维码</h3>
          <p class="text-gray-600 mb-6">
            使用专业的QR码扫描器来识别和添加2FA账户
          </p>
          
          <!-- 扫描选项 -->
          <div class="space-y-4 w-full max-w-xs mx-auto mt-8">
            <div class="hidden md:block mb-8">
              <div class="border-2 border-dashed border-primary-300 rounded-2xl p-8 bg-primary-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-colors group">
                <Upload class="h-10 w-10 text-primary-400 mb-3 group-hover:text-primary-500 group-hover:scale-110 transition-transform" />
                <p class="text-sm font-medium text-primary-700 leading-relaxed">点击、拖拽图片<br/>或 <strong class="text-primary-800">Ctrl+V 粘贴</strong>二维码</p>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div class="relative flex items-center py-4">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium tracking-wider">或</span>
                <div class="flex-grow border-t border-gray-200"></div>
              </div>
            </div>

            <button
              @click="goToQRScanner"
              class="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Camera class="h-5 w-5" />
              <span>启动QR码扫描器</span>
            </button>
            
            <label class="w-full flex md:hidden items-center justify-center space-x-2 py-4 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all cursor-pointer shadow-sm">
              <Upload class="h-5 w-5" />
              <span>上传二维码图片</span>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- 右侧：手动添加表单 (移动端依条件显示，桌面端固定在右侧) -->
      <div :class="[addMethod === 'manual' ? 'block' : 'hidden', 'md:block md:w-7/12 lg:w-2/3 md:h-full md:overflow-y-auto no-scrollbar md:pr-4 pb-20 md:pb-0']">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 图标选择 -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              图标选择
            </label>
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <AccountIcon v-if="formData.icon || formData.service || formData.account" :account="formData" size="large" />
                <div v-else class="h-16 w-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                  <ImageIcon class="w-7 h-7" />
                </div>
              </div>
              <div class="flex-1">
                <button
                  type="button"
                  @click="toggleIconPicker"
                  class="w-full py-3 px-4 bg-gray-100/80 text-gray-700 rounded-xl font-medium hover:bg-gray-200/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  选择图标
                </button>
              </div>
            </div>
            
            <!-- 图标选择器 -->
            <div v-if="showIconPicker" class="mt-4 p-4 bg-gray-50 rounded-xl">
              <!-- 自定义上传 -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  上传自定义图标
                </label>
                <label class="flex items-center justify-center w-full py-3 px-4 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 transition-all">
                  <Upload class="w-5 h-5 text-gray-400 mr-2" />
                  <span class="text-gray-600">选择图片文件</span>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleIconUpload"
                    class="hidden"
                  />
                </label>
              </div>
              
              <!-- 图标来源切换 -->
              <div class="flex p-1 bg-gray-100 rounded-xl mb-4">
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

              <!-- 预定义图标 -->
              <div v-if="iconSource === 'predefined'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  选择精选图标
                </label>
                <div class="grid grid-cols-5 md:grid-cols-6 gap-4">
                  <button
                    v-for="icon in predefinedIcons"
                    :key="icon.name"
                    type="button"
                    @click="selectIcon(icon.value)"
                    class="p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative group"
                    :class="formData.icon === icon.value ? 'bg-white shadow-[0_4px_20px_rgb(59,130,246,0.15)] ring-2 ring-primary-500 scale-105 z-10' : 'bg-gray-50/80 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-100'"
                  >
                    <img :src="icon.value" :alt="icon.name" class="w-10 h-10 mx-auto drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
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
                <div v-else class="grid grid-cols-5 md:grid-cols-6 gap-4 max-h-64 overflow-y-auto p-2 no-scrollbar">
                  <button
                    v-for="icon in serverIcons"
                    :key="icon"
                    type="button"
                    @click="selectIcon(icon)"
                    class="p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative group"
                    :class="formData.icon === icon ? 'bg-white shadow-[0_4px_20px_rgb(59,130,246,0.15)] ring-2 ring-primary-500 scale-105 z-10' : 'bg-gray-50/80 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-100'"
                  >
                    <img :src="accountsStore.getIconUrl(icon)" class="w-10 h-10 mx-auto object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300 rounded-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 两列网格容器：服务名称与账户名称 -->
          <div class="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
            <!-- 服务名称 -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                服务名称 *
              </label>
              <input
                v-model="formData.service"
                type="text"
                required
                class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                placeholder="例如：Google、GitHub、Microsoft"
                @dblclick="$event.target.select()"
              />
            </div>

            <!-- 账户名称 -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                账户名称 *
              </label>
              <input
                v-model="formData.account"
                type="text"
                required
                class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                placeholder="例如：your@email.com"
                @dblclick="$event.target.select()"
              />
            </div>
          </div>

          <!-- 两列网格容器：密钥与分组 -->
          <div class="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
            <!-- 密钥 -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                密钥 (Secret) *
              </label>
              <div class="relative">
                <input
                  v-model="formData.secret"
                  :type="showSecret ? 'text' : 'password'"
                  required
                  class="w-full p-4 pr-12 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                  placeholder="输入16位以上的密钥"
                  @dblclick="$event.target.select()"
                />
                <button
                  type="button"
                  @click="showSecret = !showSecret"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Eye v-if="!showSecret" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- 分组选择 -->
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                分组
              </label>
              <select v-model="formData.group_id" class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                <option value="">选择分组（可选）</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="w-full flex items-center justify-between p-6 hover:bg-gray-50/80 rounded-2xl transition-all"
            >
              <span class="font-semibold text-gray-900">高级设置</span>
              <ChevronDown 
                class="h-5 w-5 text-gray-400 transition-transform" 
                :class="{ 'rotate-180': showAdvanced }"
              />
            </button>

            <div v-if="showAdvanced" class="px-6 pb-6 space-y-4">
              <div class="border-t border-gray-200 pt-4 md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
                <!-- OTP类型 -->
                <div class="mb-4 md:mb-0">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    OTP类型
                  </label>
                  <select v-model="formData.otp_type" class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                    <option value="totp">TOTP (基于时间)</option>
                    <option value="hotp">HOTP (基于计数器)</option>
                  </select>
                </div>

                <!-- 数字位数 -->
                <div class="mb-4 md:mb-0">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    验证码位数
                  </label>
                  <select v-model="formData.digits" class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                    <option value="6">6位</option>
                    <option value="8">8位</option>
                  </select>
                </div>

                <!-- 时间周期 (仅TOTP) -->
                <div v-if="formData.otp_type === 'totp'" class="mb-4 md:mb-0">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    时间周期 (秒)
                  </label>
                  <select v-model="formData.period" class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                    <option value="30">30秒</option>
                    <option value="60">60秒</option>
                  </select>
                </div>

                <!-- 算法 -->
                <div class="mb-4 md:mb-0">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    算法
                  </label>
                  <select v-model="formData.algorithm" class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                    <option value="sha1">SHA1</option>
                    <option value="sha256">SHA256</option>
                    <option value="sha512">SHA512</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {{ isLoading ? '添加中...' : '添加账户' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomTabBar />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  QrCode, Edit, Camera, Upload, Eye, EyeOff, ChevronDown, Image as ImageIcon
} from 'lucide-vue-next'
import jsQR from 'jsqr'
import BottomTabBar from '@/components/BottomTabBar.vue'
import AccountIcon from '@/components/AccountIcon.vue'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const addMethod = ref('qr') // 默认扫码添加
const showSecret = ref(false)
const showAdvanced = ref(false)
const showIconPicker = ref(false)
const iconSource = ref('predefined') // 'predefined' or 'server'
const isFetchingIcons = ref(false)
const isLoading = ref(false)
const serverIcons = computed(() => accountsStore.icons)

const formData = reactive({
  service: '',
  account: '',
  secret: '',
  group_id: '',
  otp_type: 'totp',
  digits: 6,
  period: 30,
  algorithm: 'sha1',
  icon: null // 添加图标字段
})

// 预定义图标
const predefinedIcons = [
  { name: 'Google', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/google.svg' },
  { name: 'GitHub', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/github.svg' },
  { name: 'Microsoft', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/microsoft.svg' },
  { name: 'Apple', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/apple.svg' },
  { name: 'Amazon', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/amazon.svg' },
  { name: 'Facebook', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/facebook.svg' },
  { name: 'Twitter', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/twitter.svg' },
  { name: 'Discord', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/discord.svg' },
  { name: 'Dropbox', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/dropbox.svg' },
  { name: 'Steam', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/steam.svg' },
  { name: 'LinkedIn', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/linkedin.svg' },
  { name: 'Telegram', value: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/telegram.svg' }
]

const groups = computed(() => accountsStore.groups.filter(g => !['所有账户', '所有账号', 'All accounts'].includes(g.name)))

const selectIcon = (iconValue) => {
  formData.icon = iconValue
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

const goToQRScanner = () => {
  router.push('/qr-scanner')
}

const parseOtpauthUrl = (url) => {
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol !== 'otpauth:') {
      throw new Error('不是有效的OTP认证URL')
    }

    const type = urlObj.hostname // totp 或 hotp
    const label = decodeURIComponent(urlObj.pathname.slice(1))
    const params = new URLSearchParams(urlObj.search)

    // 解析标签（通常格式为 "服务:账户" 或 "账户"）
    let service = ''
    let account = ''
    
    if (label.includes(':')) {
      const parts = label.split(':')
      service = parts[0].trim()
      account = parts.slice(1).join(':').trim()
    } else {
      account = label.trim()
      service = params.get('issuer') || ''
    }

    // 尝试根据服务名称匹配图标
    let matchedIcon = null
    const serviceLower = service.toLowerCase()
    const matchedIconDef = predefinedIcons.find(icon => 
      icon.name.toLowerCase() === serviceLower || 
      serviceLower.includes(icon.name.toLowerCase())
    )
    if (matchedIconDef) {
      matchedIcon = matchedIconDef.value
    }

    return {
      service: service || params.get('issuer') || '',
      account: account,
      secret: params.get('secret') || '',
      otp_type: type === 'hotp' ? 'hotp' : 'totp',
      digits: parseInt(params.get('digits')) || 6,
      period: parseInt(params.get('period')) || 30,
      algorithm: params.get('algorithm')?.toLowerCase() || 'sha1',
      icon: matchedIcon
    }
  } catch (error) {
    console.error('解析OTP URL失败:', error)
    throw new Error('二维码格式不正确')
  }
}

const processImageFile = async (file) => {
  if (!file) return

  try {
    appStore.setLoading(true)
    
    // 创建图片对象
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    await new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // 使用jsQR解析二维码
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          try {
            // 解析OTP认证URL
            const otpData = parseOtpauthUrl(code.data)
            
            // 填充表单数据
            Object.assign(formData, otpData)
            
            // 切换到手动添加模式显示解析结果
            addMethod.value = 'manual'
            
            appStore.showNotification('success', '二维码解析成功！请确认信息后添加账户')
            resolve()
          } catch (parseError) {
            reject(new Error('二维码内容不是有效的2FA认证信息'))
          }
        } else {
          reject(new Error('未能识别图片中的二维码，请确保图片清晰且包含二维码'))
        }
      }
      
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
    
  } catch (error) {
    console.error('解析二维码失败:', error)
    appStore.showNotification('error', error.message || '解析二维码失败')
  } finally {
    appStore.setLoading(false)
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await processImageFile(file)
    event.target.value = ''
  }
}

const handlePaste = async (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        await processImageFile(file)
        break
      }
    }
  }
}

const handleIconUpload = (event) => {
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
    // 创建FileReader来读取文件
    const reader = new FileReader()
    
    reader.onload = (e) => {
      // 将图片转换为base64 data URL
      formData.icon = e.target.result
      showIconPicker.value = false
      appStore.showNotification('success', '自定义图标上传成功')
    }
    
    reader.onerror = () => {
      appStore.showNotification('error', '图片读取失败')
    }
    
    // 读取文件为data URL
    reader.readAsDataURL(file)
    
  } catch (error) {
    console.error('上传图标失败:', error)
    appStore.showNotification('error', '上传图标失败')
  } finally {
    // 清空文件输入
    event.target.value = ''
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
      ...(formData.icon && { icon: formData.icon }),
      ...(formData.group_id && { group_id: parseInt(formData.group_id) }),
      ...(formData.otp_type === 'totp' && { period: parseInt(formData.period) })
    }

    await accountsStore.createAccount(accountData)
    appStore.showNotification('success', '账户添加成功')
    router.push('/dashboard')
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
  window.addEventListener('paste', handlePaste)
  // 确保分组数据已加载
  if (accountsStore.groups.length === 0) {
    try {
      await accountsStore.fetchGroups()
    } catch (error) {
      console.error('加载分组失败:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})
</script>