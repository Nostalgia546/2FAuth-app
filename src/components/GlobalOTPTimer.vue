<template>
  <div 
    v-if="showTimer" 
    :class="containerClass"
    ref="timerElement"
  >
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
      <div class="flex items-center justify-between">
        <!-- 时间信息 -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <!-- 外环 -->
            <div class="w-12 h-12 rounded-full bg-gray-100">
              <!-- 进度环 -->
              <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                <!-- 背景圆环 -->
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  class="text-gray-200"
                />
                <!-- 进度圆环 -->
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  stroke-linecap="round"
                  class="transition-all duration-300 ease-out"
                  :class="timeClass"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  style="transition-property: stroke-dashoffset, stroke;"
                />
              </svg>
              
              <!-- 中心时间数字 -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold transition-colors duration-300" :class="textClass">
                  {{ remainingTime }}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <p class="text-sm font-semibold text-gray-900">验证码剩余时间</p>
          </div>
        </div>
      </div>

      <!-- 现代化进度条 -->
      <div class="mt-4">
        <div class="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <!-- 背景渐变 -->
          <div class="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50"></div>
          
          <!-- 进度条 -->
          <div
            class="absolute top-0 left-0 h-full rounded-full ease-linear"
            :class="progressClass"
            :style="progressStyle"
            style="transition: width 0.1s ease-linear, background 0.3s ease-out, box-shadow 0.3s ease-out;"
          >
            <!-- 内部高光效果 -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-white/30 to-transparent"></div>
            
            <!-- 动画光点 -->
            <div
              v-if="progressPercentage < 100 && progressPercentage > 0"
              class="absolute top-0 right-0 w-6 h-full bg-white/60 rounded-full"
              style="animation: pulse 2s ease-in-out infinite;"
            ></div>
          </div>
        </div>
        
        <!-- 时间标记 -->
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span>0s</span>
          <span>{{ period }}s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

// 定义props
const props = defineProps({
  position: {
    type: String,
    default: 'content',
    validator: (value) => ['content', 'header'].includes(value)
  },
  showRefreshButton: {
    type: Boolean,
    default: false
  }
})

// 定义emits用于通知可见性变化
const emit = defineEmits(['visibility-change'])

const accountsStore = useAccountsStore()
const timerElement = ref(null)

// 用于平滑动画的状态
const smoothProgress = ref(0)
const smoothRemaining = ref(0)
const lastStoreUpdate = ref(0) // 记录store最后更新时间
const storeRemaining = ref(0) // 记录store中的剩余时间
let animationTimer = null

// 页面可见性状态
let isPageVisible = true

// Intersection Observer用于可见性检测
let intersectionObserver = null

// 容器样式根据位置决定
const containerClass = computed(() => {
  if (props.position === 'header') {
    return 'fixed top-16 left-4 right-4 z-30'
  } else {
    return 'mb-6'
  }
})

// 获取第一个账户的OTP数据作为全局时间参考
const globalOTPData = computed(() => {
  const accounts = accountsStore.accounts
  if (accounts.length === 0) return null
  
  // 获取第一个有OTP数据的账户
  for (const account of accounts) {
    const otpData = accountsStore.getAccountOTP(account.id)
    if (otpData) return otpData
  }
  return null
})

const showTimer = computed(() => {
  // 只要有账户就显示计时器，不需要等待OTP数据
  return accountsStore.accounts.length > 0
})

const remainingTime = computed(() => {
  return Math.ceil(smoothRemaining.value) || 0
})

const period = computed(() => {
  return globalOTPData.value?.period || 30
})

const progressPercentage = computed(() => {
  return smoothProgress.value
})

// 监听页面可见性变化
const handleVisibilityChange = () => {
  const wasVisible = isPageVisible
  isPageVisible = !document.hidden
  
  if (!wasVisible && isPageVisible && globalOTPData.value) {
    // 页面从隐藏变为可见时，立即同步到store中的最新数据
    const actualRemaining = globalOTPData.value.remaining_time
    const actualProgress = ((period.value - actualRemaining) / period.value) * 100
    
    storeRemaining.value = actualRemaining
    lastStoreUpdate.value = Date.now()
    smoothProgress.value = actualProgress
    smoothRemaining.value = actualRemaining
    
    console.log(`进度条同步: 剩余时间=${actualRemaining}s, 进度=${actualProgress.toFixed(1)}%`)
  }
}

// 启动平滑动画
const startSmoothAnimation = () => {
  if (animationTimer) return
  
  animationTimer = setInterval(() => {
    if (!globalOTPData.value || !isPageVisible) return
    
    const now = Date.now()
    const actualRemaining = globalOTPData.value.remaining_time
    
    // 检查store数据是否有更新
    if (actualRemaining !== storeRemaining.value) {
      // Store数据更新了，重新同步
      storeRemaining.value = actualRemaining
      lastStoreUpdate.value = now
      smoothRemaining.value = actualRemaining
    } else {
      // Store数据没变，在当前秒内平滑递减
      const timeSinceLastUpdate = (now - lastStoreUpdate.value) / 1000
      smoothRemaining.value = Math.max(0, storeRemaining.value - timeSinceLastUpdate)
    }
    
    // 根据平滑的剩余时间计算进度
    const actualProgress = ((period.value - smoothRemaining.value) / period.value) * 100
    smoothProgress.value = Math.min(100, Math.max(0, actualProgress))
    
    // 确保剩余时间为0时进度达到100%
    if (smoothRemaining.value <= 0) {
      smoothProgress.value = 100
      smoothRemaining.value = 0
    }
  }, 50) // 50ms更新一次，更平滑
}

const stopSmoothAnimation = () => {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
}

// 可见性检测 - 使用Intersection Observer
const setupVisibilityObserver = () => {
  if (!timerElement.value || props.position !== 'content') return
  
  // 清理现有的observer
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      const isVisible = entry.isIntersecting
      emit('visibility-change', isVisible)
    },
    {
      threshold: 0.5, // 当元素50%可见时才认为可见，提早切换到顶栏计时器
      root: null,
      rootMargin: '50px 0px 100px 0px' // 向下扩展检测区域，提前触发
    }
  )
  
  intersectionObserver.observe(timerElement.value)
}

// 监听OTP数据变化，启动动画
watch(globalOTPData, (newData) => {
  if (newData) {
    const actualProgress = ((period.value - newData.remaining_time) / period.value) * 100
    storeRemaining.value = newData.remaining_time
    lastStoreUpdate.value = Date.now()
    smoothProgress.value = actualProgress
    smoothRemaining.value = newData.remaining_time
    startSmoothAnimation()
  } else {
    stopSmoothAnimation()
  }
}, { immediate: true })

onMounted(() => {
  if (globalOTPData.value) {
    startSmoothAnimation()
  }
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 设置可见性检测
  if (props.position === 'content') {
    nextTick(() => {
      setupVisibilityObserver()
    })
  }
})

onUnmounted(() => {
  stopSmoothAnimation()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})

// 圆环相关计算 - 优化重置动画
const circumference = 2 * Math.PI * 20 // r=20
const strokeDashoffset = computed(() => {
  const progress = Math.min(100, Math.max(0, progressPercentage.value))
  return circumference - (progress / 100) * circumference
})

// 根据剩余时间改变颜色和样式
const timeClass = computed(() => {
  if (remainingTime.value <= 5) {
    return 'text-red-500'
  } else if (remainingTime.value <= 10) {
    return 'text-yellow-500'
  } else {
    return 'text-green-500'
  }
})

const textClass = computed(() => {
  if (remainingTime.value <= 5) {
    return 'text-red-600'
  } else if (remainingTime.value <= 10) {
    return 'text-yellow-600'
  } else {
    return 'text-green-600'
  }
})

const progressClass = computed(() => {
  if (remainingTime.value <= 5) {
    return 'bg-gradient-to-r from-red-500 to-red-600'
  } else if (remainingTime.value <= 10) {
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  } else {
    return 'bg-gradient-to-r from-green-500 to-green-600'
  }
})

const shadowColor = computed(() => {
  if (remainingTime.value <= 5) {
    return 'rgba(239, 68, 68, 0.4)'
  } else if (remainingTime.value <= 10) {
    return 'rgba(245, 158, 11, 0.4)'
  } else {
    return 'rgba(34, 197, 94, 0.4)'
  }
})

const progressStyle = computed(() => {
  return {
    width: `${progressPercentage.value}%`,
    boxShadow: `0 0 8px ${shadowColor.value}, 0 0 16px ${shadowColor.value}20`
  }
})

const isRefreshing = computed(() => accountsStore.isGeneratingOTP)

const refreshOTPs = async () => {
  try {
    const accountIds = accountsStore.accounts.map(acc => acc.id)
    await accountsStore.generateAllOTPs(accountIds)
  } catch (error) {
    console.error('手动刷新OTP失败:', error)
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>