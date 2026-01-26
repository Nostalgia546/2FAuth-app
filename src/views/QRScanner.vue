<template>
  <div class="min-h-screen bg-gray-900">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-40">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="$router.go(-1)" class="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft class="h-5 w-5 text-white" />
          </button>
          <h1 class="text-lg font-medium text-white">扫描二维码</h1>
          <button
            @click="toggleFlash"
            :disabled="!hasFlash"
            class="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
          >
            <Flashlight class="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </header>

    <!-- 摄像头预览 -->
    <div class="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="!isVideoReady" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900">
        <div class="w-16 h-16 mb-4 relative">
          <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-gray-400 text-sm animate-pulse">{{ scanStatus }}</p>
      </div>

      <video
        ref="videoElement"
        class="w-full h-full object-cover transition-opacity duration-300"
        :class="{ 'opacity-100': isVideoReady, 'opacity-0': !isVideoReady }"
        autoplay
        muted
        playsinline
        @loadedmetadata="onVideoLoaded"
        @canplay="isVideoReady = true"
      ></video>
      
      <!-- 扫描框覆盖层 -->
      <div v-if="isVideoReady" class="absolute inset-0 flex items-center justify-center">
        <!-- 四角遮罩 -->
        <div class="relative">
          <!-- 扫描框 -->
          <div class="w-64 h-64 relative">
            <!-- 四个角的边框 -->
            <div class="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white"></div>
            
            <!-- 扫描线动画 -->
            <div 
              class="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-75 animate-pulse"
              :style="{ top: `${scanLinePosition}%` }"
            ></div>
          </div>
          
          <!-- 提示文字 -->
          <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <p class="text-white text-sm mb-2">{{ scanStatus }}</p>
            <div v-if="isScanning" class="flex items-center justify-center space-x-2">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span class="text-white text-xs">扫描中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-6">
        <div class="flex items-center justify-center space-x-6">
          <button
            @click="showManualInput = true"
            class="flex flex-col items-center space-y-1 text-white"
          >
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Type class="h-6 w-6" />
            </div>
            <span class="text-xs">手动输入</span>
          </button>

          <button
            @click="isScanning ? stopScanning() : startCameraScanning()"
            class="flex flex-col items-center space-y-1 text-white"
          >
            <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white/30">
              <Camera class="h-8 w-8" />
            </div>
            <span class="text-xs">{{ isScanning ? '停止' : '扫描' }}</span>
          </button>

          <label class="flex flex-col items-center space-y-1 text-white cursor-pointer">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Upload class="h-6 w-6" />
            </div>
            <span class="text-xs">选择图片</span>
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
            />
          </label>
        </div>
      </div>

      <!-- 扫描到结果的弹出层 -->
      <div v-if="scannedData" class="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
          <div class="text-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check class="h-8 w-8 text-green-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">扫描成功</h3>
          </div>

          <div v-if="decodedAccount" class="space-y-3 mb-6">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">服务名称</span>
                <span class="text-sm font-medium text-gray-900">{{ decodedAccount.service || '未知' }}</span>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">账户名</span>
                <span class="text-sm font-medium text-gray-900">{{ decodedAccount.account || '未知' }}</span>
              </div>
            </div>
          </div>

          <div v-if="decodeError" class="bg-red-50 rounded-lg p-3 mb-6">
            <p class="text-sm text-red-700">{{ decodeError }}</p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="resetScanner"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              重新扫描
            </button>
            <button
              v-if="decodedAccount"
              @click="addAccount"
              :disabled="isAdding"
              class="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {{ isAdding ? '添加中...' : '添加账户' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 手动输入对话框 -->
      <div v-if="showManualInput" class="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h3 class="text-lg font-medium text-gray-900 mb-4">手动输入二维码内容</h3>
          <textarea
            v-model="manualInput"
            placeholder="请粘贴二维码内容..."
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import jsQR from 'jsqr'
import {
  ArrowLeft, Camera, Upload, Type, Flashlight, Check
} from 'lucide-vue-next'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const videoElement = ref(null)
const canvasElement = ref(null)
const isScanning = ref(false)
const hasFlash = ref(false)
const flashEnabled = ref(false)
const scannedData = ref('')
const decodedAccount = ref(null)
const decodeError = ref('')
const isAdding = ref(false)
const showManualInput = ref(false)
const manualInput = ref('')
const scanLinePosition = ref(0)
const scanStatus = ref('将二维码对准扫描框')
const isVideoReady = ref(false)

let stream = null
let scanningInterval = null
let animationFrame = null

// 扫描线动画
const animateScanLine = () => {
  scanLinePosition.value = (Date.now() / 10) % 100
  if (isScanning.value) {
    animationFrame = requestAnimationFrame(animateScanLine)
  }
}

onMounted(async () => {
  // 自动开始扫描
  await nextTick()
  startCameraScanning()
})

onUnmounted(() => {
  stopScanning()
})

const onVideoLoaded = () => {
  // 检查是否有闪光灯
  if (stream) {
    const track = stream.getVideoTracks()[0]
    const capabilities = track.getCapabilities()
    hasFlash.value = !!capabilities.torch
  }
}

const startCameraScanning = async () => {
  try {
    scanStatus.value = '正在启动摄像头...'
    
    const constraints = {
      video: { 
        facingMode: 'environment', // 后置摄像头
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()
      
      isScanning.value = true
      scanStatus.value = '将二维码对准扫描框'
      
      // 开始扫描线动画
      animateScanLine()
      
      // 开始QR码识别
      startQRDetection()
    }
  } catch (error) {
    console.error('启动摄像头失败:', error)
    scanStatus.value = '摄像头启动失败'
    appStore.showNotification('error', '无法访问摄像头，请检查权限设置')
  }
}

const startQRDetection = () => {
  if (!videoElement.value) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  const detectQR = () => {
    if (!isScanning.value || !videoElement.value.videoWidth) {
      scanningInterval = requestAnimationFrame(detectQR)
      return
    }

    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      console.log('检测到QR码:', code.data)
      scannedData.value = code.data
      decodeQRData(code.data)
      stopScanning()
      return
    }
    
    scanningInterval = requestAnimationFrame(detectQR)
  }
  
  scanningInterval = requestAnimationFrame(detectQR)
}

const stopScanning = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  
  if (scanningInterval) {
    cancelAnimationFrame(scanningInterval)
    scanningInterval = null
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  
  isScanning.value = false
  flashEnabled.value = false
  scanStatus.value = '已停止扫描'
}

const toggleFlash = async () => {
  if (!stream || !hasFlash.value) return
  
  try {
    const track = stream.getVideoTracks()[0]
    await track.applyConstraints({
      advanced: [{ torch: !flashEnabled.value }]
    })
    flashEnabled.value = !flashEnabled.value
  } catch (error) {
    console.error('切换闪光灯失败:', error)
    appStore.showNotification('error', '闪光灯切换失败')
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      context.drawImage(img, 0, 0)
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        scannedData.value = code.data
        decodeQRData(code.data)
      } else {
        appStore.showNotification('error', '未在图片中找到有效的二维码')
      }
    }
    
    img.src = URL.createObjectURL(file)
    event.target.value = '' // 清空input
  } catch (error) {
    console.error('图片解析失败:', error)
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
    // 首先尝试本地解析
    tryLocalDecode(data)
    
    // 如果本地解析成功，再尝试服务器验证，但不要显示错误提示，因为本地解析已经够了
    if (decodedAccount.value) {
      try {
        // 调用 API 时不显示错误通知
        const result = await accountsStore.decodeQRCode({ qrcode: data, silent: true })
        // 如果服务器返回更准确的数据，使用服务器数据
        if (result && result.service) {
          decodedAccount.value = {
            ...decodedAccount.value, // 保留本地解析的基础字段
            ...result // 覆盖服务器返回的信息
          }
        }
      } catch (error) {
        // 服务器解析失败不影响本地解析结果
        process.env.NODE_ENV === 'development' && console.log('服务器解析失败，使用本地解析结果')
      }
    } else {
      // 如果本地也没解析出来，再尝试服务器（最后机会）
      try {
        const result = await accountsStore.decodeQRCode({ qrcode: data })
        if (result && (result.service || result.secret)) {
          decodedAccount.value = result
          decodeError.value = ''
        } else {
          throw new Error('解析失败')
        }
      } catch (error) {
        decodeError.value = '无法解析二维码内容'
        decodedAccount.value = null
      }
    }
  } catch (error) {
    console.error('解码QR码失败:', error)
    decodeError.value = '无法解析二维码内容'
    decodedAccount.value = null
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
        secret: params.get('secret'),
        otp_type: type || 'totp'
      }
      
      decodeError.value = ''
    } else {
      throw new Error('不是有效的OTP URL格式')
    }
  } catch (error) {
    console.error('本地解码失败:', error)
    decodeError.value = '无法识别的二维码格式'
    decodedAccount.value = null
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
      secret: decodedAccount.value.secret,
      otp_type: decodedAccount.value.otp_type || 'totp',
      algorithm: decodedAccount.value.algorithm || 'SHA1',
      digits: decodedAccount.value.digits || 6,
      period: decodedAccount.value.period || 30
    }
    
    // 如果有原始URI，也包含进去
    if (scannedData.value.startsWith('otpauth://')) {
      accountData.uri = scannedData.value
    }
    
    await accountsStore.createAccount(accountData)
    
    appStore.showNotification('success', '账户添加成功')
    router.push('/dashboard')
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
  startCameraScanning()
}
</script>

<style scoped>
.animate-scan-line {
  animation: scanLine 2s linear infinite;
}

@keyframes scanLine {
  0% { top: 0%; }
  100% { top: 100%; }
}
</style> 