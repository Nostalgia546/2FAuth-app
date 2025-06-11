<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div class="px-4 py-4">
        <div class="flex items-center space-x-3">
          <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </button>
          <h1 class="text-xl font-semibold text-gray-900">扫描QR码</h1>
        </div>
      </div>
    </header>

    <div class="px-4 py-6 space-y-6" style="margin-top: 80px;">
      <!-- 扫描方式选择 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">选择扫描方式</h2>
        <div class="grid grid-cols-1 gap-3">
          <button
            @click="startCameraScanning"
            :disabled="!isCameraSupported"
            class="flex items-center justify-center space-x-3 py-4 px-4 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera class="h-6 w-6" />
            <span>{{ isCameraSupported ? '使用摄像头扫描' : '摄像头不可用' }}</span>
          </button>
          
          <label class="flex items-center justify-center space-x-3 py-4 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors cursor-pointer">
            <Upload class="h-6 w-6" />
            <span>选择图片文件</span>
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
            />
          </label>
          
          <button
            @click="showManualInput = true"
            class="flex items-center justify-center space-x-3 py-4 px-4 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors"
          >
            <Type class="h-6 w-6" />
            <span>手动输入二维码内容</span>
          </button>
        </div>
      </div>

      <!-- 摄像头扫描区域 -->
      <div v-if="isScanning" class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">摄像头扫描</h2>
        <div class="relative">
          <video
            ref="videoElement"
            class="w-full h-64 bg-black rounded-lg object-cover"
            autoplay
            muted
            playsinline
          ></video>
          <div class="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
            <div class="absolute inset-4 border border-white/50 rounded"></div>
          </div>
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              @click="stopScanning"
              class="px-6 py-2 bg-red-500 text-white rounded-lg font-medium"
            >
              停止扫描
            </button>
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">
          将二维码对准扫描框进行识别
        </p>
      </div>

      <!-- 扫描结果 -->
      <div v-if="scannedData" class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">扫描结果</h2>
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">原始数据</h3>
            <p class="text-sm text-gray-600 font-mono break-all">{{ scannedData }}</p>
          </div>
          
          <div v-if="decodedAccount" class="bg-green-50 rounded-lg p-4">
            <h3 class="font-medium text-green-900 mb-3">识别的账户信息</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-green-700">服务名称:</span>
                <span class="text-sm font-medium text-green-900">{{ decodedAccount.service || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-green-700">账户名:</span>
                <span class="text-sm font-medium text-green-900">{{ decodedAccount.account || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-green-700">算法:</span>
                <span class="text-sm font-medium text-green-900">{{ decodedAccount.algorithm || 'SHA1' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-green-700">位数:</span>
                <span class="text-sm font-medium text-green-900">{{ decodedAccount.digits || 6 }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="decodeError" class="bg-red-50 rounded-lg p-4">
            <h3 class="font-medium text-red-900 mb-2">解码失败</h3>
            <p class="text-sm text-red-700">{{ decodeError }}</p>
          </div>
          
          <div class="flex space-x-3">
            <button
              v-if="decodedAccount"
              @click="addAccount"
              :disabled="isAdding"
              class="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {{ isAdding ? '添加中...' : '添加到账户' }}
            </button>
            <button
              @click="resetScanner"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              重新扫描
            </button>
          </div>
        </div>
      </div>

      <!-- 手动输入对话框 -->
      <div v-if="showManualInput" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h3 class="text-lg font-medium text-gray-900 mb-4">手动输入二维码内容</h3>
          <textarea
            v-model="manualInput"
            placeholder="请粘贴或输入二维码内容..."
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
          <div class="flex space-x-3 mt-4">
            <button
              @click="showManualInput = false"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              取消
            </button>
            <button
              @click="processManualInput"
              :disabled="!manualInput.trim()"
              class="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              解析
            </button>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">使用说明</h2>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex items-start space-x-3">
            <div class="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-primary-600">1</span>
            </div>
            <p>使用摄像头扫描2FA二维码，或选择保存在手机中的二维码图片</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-primary-600">2</span>
            </div>
            <p>系统会自动解析二维码中的账户信息</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-primary-600">3</span>
            </div>
            <p>确认信息无误后，点击"添加到账户"完成导入</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeft, Camera, Upload, Type
} from 'lucide-vue-next'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const videoElement = ref(null)
const isScanning = ref(false)
const isCameraSupported = ref(false)
const scannedData = ref('')
const decodedAccount = ref(null)
const decodeError = ref('')
const isAdding = ref(false)
const showManualInput = ref(false)
const manualInput = ref('')

let stream = null
let scanningInterval = null

// 检查摄像头支持
onMounted(async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    isCameraSupported.value = devices.some(device => device.kind === 'videoinput')
  } catch (error) {
    console.error('检查摄像头失败:', error)
    isCameraSupported.value = false
  }
})

onUnmounted(() => {
  stopScanning()
})

const startCameraScanning = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // 后置摄像头
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    })
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      isScanning.value = true
      
      // 模拟扫描过程（实际项目中需要使用QR码扫描库）
      scanningInterval = setInterval(() => {
        // 这里应该使用实际的QR码扫描库
        // 比如 qr-scanner 或 jsQR
        console.log('扫描中...')
      }, 1000)
    }
  } catch (error) {
    console.error('启动摄像头失败:', error)
    appStore.showNotification('error', '无法访问摄像头')
  }
}

const stopScanning = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  if (scanningInterval) {
    clearInterval(scanningInterval)
    scanningInterval = null
  }
  
  isScanning.value = false
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    // 这里应该使用QR码解析库来处理图片
    // 暂时模拟处理过程
    appStore.showNotification('info', 'QR码解析功能开发中...')
    
    // 清空input
    event.target.value = ''
  } catch (error) {
    appStore.showNotification('error', '图片解析失败')
  }
}

const processManualInput = async () => {
  if (!manualInput.value.trim()) return
  
  try {
    scannedData.value = manualInput.value.trim()
    await decodeQRData(scannedData.value)
    showManualInput.value = false
    manualInput.value = ''
  } catch (error) {
    appStore.showNotification('error', '解析失败')
  }
}

const decodeQRData = async (data) => {
  try {
    // 使用2FAuth API解码QR码数据
    const result = await accountsStore.decodeQRCode({ qrcode: data })
    decodedAccount.value = result
    decodeError.value = ''
  } catch (error) {
    console.error('解码QR码失败:', error)
    decodeError.value = error.response?.data?.message || '无法解析二维码内容'
    decodedAccount.value = null
    
    // 尝试本地解析（基本的otpauth URL格式）
    tryLocalDecode(data)
  }
}

const tryLocalDecode = (data) => {
  try {
    if (data.startsWith('otpauth://')) {
      const url = new URL(data)
      const type = url.hostname // totp 或 hotp
      const label = decodeURIComponent(url.pathname.substring(1))
      const params = new URLSearchParams(url.search)
      
      const [service, account] = label.includes(':') ? label.split(':', 2) : ['', label]
      
      decodedAccount.value = {
        service: service || params.get('issuer') || '未知服务',
        account: account || '未知账户',
        algorithm: params.get('algorithm') || 'SHA1',
        digits: parseInt(params.get('digits')) || 6,
        period: parseInt(params.get('period')) || 30,
        secret: params.get('secret')
      }
      
      decodeError.value = ''
    } else {
      throw new Error('不是有效的OTP URL格式')
    }
  } catch (error) {
    console.error('本地解码失败:', error)
    decodeError.value = '无法识别的二维码格式'
  }
}

const addAccount = async () => {
  if (!decodedAccount.value) return
  
  try {
    isAdding.value = true
    
    // 构建账户数据
    const accountData = {
      service: decodedAccount.value.service,
      account: decodedAccount.value.account,
      uri: scannedData.value, // 原始URI
      algorithm: decodedAccount.value.algorithm,
      digits: decodedAccount.value.digits,
      period: decodedAccount.value.period
    }
    
    // 先预览账户
    await accountsStore.previewAccount(accountData)
    
    // 创建账户
    await accountsStore.createAccount(accountData)
    
    appStore.showNotification('success', '账户添加成功')
    router.push('/accounts')
  } catch (error) {
    console.error('添加账户失败:', error)
    appStore.showNotification('error', '添加账户失败')
  } finally {
    isAdding.value = false
  }
}

const resetScanner = () => {
  scannedData.value = ''
  decodedAccount.value = null
  decodeError.value = ''
  stopScanning()
}

// 模拟QR码扫描结果（用于演示）
const simulateQRScan = (data) => {
  scannedData.value = data
  decodeQRData(data)
  stopScanning()
}
</script> 