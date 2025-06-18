<template>
  <transition 
    name="header-timer-fade"
    enter-active-class="transition-all duration-500 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0 scale-95 translate-x-4"
    enter-to-class="opacity-100 scale-100 translate-x-0"
    leave-from-class="opacity-100 scale-100 translate-x-0"
    leave-to-class="opacity-0 scale-95 translate-x-4"
  >
    <div 
      v-if="showTimer && shouldShowHeader" 
      class="flex items-center space-x-3 mr-4"
    >
      <!-- 加大的紧凑进度环 -->
      <div class="relative w-10 h-10">
        <svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
          <!-- 背景圆环 -->
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            class="text-gray-200"
          />
          <!-- 进度圆环 -->
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="currentColor"
            stroke-width="3"
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
      
      <!-- 紧凑进度条 - 不显示时间文字 -->
      <div class="flex flex-col min-w-0" style="width: 60px;">
        <div class="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <!-- 进度条 -->
          <div
            class="absolute top-0 left-0 h-full rounded-full ease-linear"
            :class="progressClass"
            :style="progressStyle"
            style="transition: width 0.1s ease-linear, background 0.3s ease-out;"
          >
            <!-- 内部高光效果 -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-white/50 to-transparent"></div>
            
            <!-- 动画光点 -->
            <div
              v-if="progressPercentage < 100 && progressPercentage > 0"
              class="absolute top-0 right-0 w-2 h-full bg-white/80 rounded-full"
              style="animation: pulse 2s ease-in-out infinite;"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

// 接收来自父组件的props
const props = defineProps({
  contentTimerVisible: {
    type: Boolean,
    default: false
  }
})

const accountsStore = useAccountsStore()

// 用于平滑动画的状态
const smoothProgress = ref(0)
const smoothRemaining = ref(0)
const lastStoreUpdate = ref(0) // 记录store最后更新时间
const storeRemaining = ref(0) // 记录store中的剩余时间
let animationTimer = null

// 页面可见性状态
let isPageVisible = true

// 组件初始化标记，避免初始化时的动画
const isInitialized = ref(false)

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
    
    console.log(`头部进度条同步: 剩余时间=${actualRemaining}s, 进度=${actualProgress.toFixed(1)}%`)
  }
}

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
  return globalOTPData.value !== null
})

// 只有当内容区计时器不可见时才显示头部计时器
const shouldShowHeader = computed(() => {
  // 如果还没初始化完成，不显示（避免初始化动画）
  if (!isInitialized.value) return false
  return !props.contentTimerVisible
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

// 监听OTP数据变化
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
  
  // 延迟标记为已初始化，避免初始动画
  setTimeout(() => {
    isInitialized.value = true
  }, 200)
})

onUnmounted(() => {
  stopSmoothAnimation()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// 圆环相关计算 - 优化重置动画，调整为新的半径
const circumference = 2 * Math.PI * 15 // r=15
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

const progressStyle = computed(() => {
  return {
    width: `${progressPercentage.value}%`
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>