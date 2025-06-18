<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <!-- 固定顶部导航栏 -->
    <header class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 z-40">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16 justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
              <Shield class="h-5 w-5 text-white" />
            </div>
            <h1 class="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">2FAuth</h1>
          </div>
          
          <!-- 顶栏版本的时间组件 - 根据内容区可见性显示 -->
          <HeaderOTPTimer 
            v-if="accounts.length > 0" 
            :contentTimerVisible="contentTimerVisible"
          />
        </div>
      </div>
    </header>

    <main class="px-4 py-6 pt-20">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">总账户数</p>
              <p class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{{ accounts.length }}</p>
            </div>
            <div class="h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users class="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">分组数量</p>
              <p class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{{ groups.length }}</p>
            </div>
            <div class="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Folder class="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区版本的时间组件 -->
      <GlobalOTPTimer 
        v-if="accounts.length > 0" 
        position="content" 
        @visibility-change="onTimerVisibilityChange"
      />

      <!-- 分组筛选 -->
      <div class="flex space-x-2 overflow-x-auto pb-4 mb-6" v-if="groups.length > 0">
        <button
          @click="setSelectedGroup(null)"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap shadow-sm',
            selectedGroupId === null
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary-200'
              : 'bg-white/70 text-gray-600 hover:bg-white/80 border border-gray-200'
          ]"
        >
          全部 ({{ accounts.length }})
        </button>
        <button
          v-for="group in groups"
          :key="group.id"
          @click="setSelectedGroup(group.id)"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap shadow-sm',
            selectedGroupId === group.id
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary-200'
              : 'bg-white/70 text-gray-600 hover:bg-white/80 border border-gray-200'
          ]"
        >
          {{ group.name }}
        </button>
      </div>

      <!-- 账户列表 -->
      <div class="space-y-4">
        <div v-if="filteredAccounts.length === 0" class="text-center py-12">
          <div class="h-16 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无账户</h3>
          <p class="text-gray-600 mb-6">添加您的第一个2FA账户开始使用</p>
          <router-link to="/add-account" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            添加账户
          </router-link>
        </div>

        <div
          v-for="account in filteredAccounts"
          :key="account.id"
          class="bg-white/70 backdrop-blur-sm rounded-2xl p-[5vw] min-h-[24vw] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-white/80 active:scale-95"
          @click="copyOTP(account)"
          @contextmenu.prevent="editAccount(account)"
          @touchstart="handleTouchStart(account)"
          @touchend="handleTouchEnd"
          title="点击复制验证码，长按编辑"
        >
          <div class="flex items-center space-x-[4vw] h-full">
            <!-- 账户图标 - 响应式尺寸 -->
            <AccountIcon :account="account" :size="'medium'" class="flex-shrink-0 w-[14vw] h-[14vw]" style="min-width: 52px; min-height: 52px; max-width: 72px; max-height: 72px;" />

            <!-- 账户信息 -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate text-[4.5vw]" style="font-size: clamp(18px, 4.5vw, 22px);">
                {{ account.service || account.account || '未知服务' }}
              </h3>
              <p class="text-gray-600 truncate text-[3.5vw] mt-1" style="font-size: clamp(14px, 3.5vw, 18px);">
                {{ account.account || account.service || '未知账户' }}
              </p>
            </div>

            <!-- OTP显示区域 - 响应式 -->
            <div class="text-right flex-shrink-0">
              <div v-if="getAccountOTP(account.id)" class="space-y-1">
                <div class="font-mono font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent text-[5.5vw]" style="font-size: clamp(20px, 5.5vw, 30px);">
                  {{ formatOTP(getAccountOTP(account.id).otp_value) }}
                </div>
              </div>
              <div v-else-if="isGeneratingOTP" class="space-y-1">
                <div class="text-gray-400 font-medium text-[4vw]" style="font-size: clamp(16px, 4vw, 20px);">
                  正在生成...
                </div>
                <div class="flex items-center justify-end">
                  <div class="w-[7vw] h-1 bg-gray-200 rounded-full animate-pulse" style="width: clamp(28px, 7vw, 36px);"></div>
                </div>
              </div>
              <div v-else class="space-y-1">
                <div class="text-gray-400 font-medium text-[4vw]" style="font-size: clamp(16px, 4vw, 20px);">
                  暂无验证码
                </div>
              </div>
            </div>

            <!-- 复制按钮 - 响应式 -->
            <button
              @click.stop="copyOTP(account)"
              :disabled="!getAccountOTP(account.id)"
              class="p-[2vw] rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0 w-[12vw] h-[12vw] flex items-center justify-center"
              style="padding: clamp(10px, 2vw, 14px); min-width: 44px; min-height: 44px; max-width: 52px; max-height: 52px;"
              :class="getAccountOTP(account.id) ? 'text-gray-400 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'"
              title="复制验证码"
            >
              <Copy class="w-[6vw] h-[6vw]" style="width: clamp(22px, 6vw, 26px); height: clamp(22px, 6vw, 26px);" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <BottomTabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  Shield, Users, Folder, Copy
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import HeaderOTPTimer from '@/components/HeaderOTPTimer.vue'
import GlobalOTPTimer from '@/components/GlobalOTPTimer.vue'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

// 长按处理
let longPressTimer = null

// 内容区计时器可见性状态 - 初始设为true，避免不必要的动画
const contentTimerVisible = ref(true)

// 初始化认证
authStore.initAuth()

const accounts = computed(() => accountsStore.accounts)
const groups = computed(() => accountsStore.groups)
const filteredAccounts = computed(() => accountsStore.filteredAccounts)
const selectedGroupId = computed(() => accountsStore.selectedGroupId)
const isGeneratingOTP = computed(() => accountsStore.isGeneratingOTP)

const setSelectedGroup = (groupId) => {
  accountsStore.setSelectedGroup(groupId)
}

const formatOTP = (otp) => {
  if (!otp) return ''
  return otp.toString().replace(/(\d{3})(\d{3})/, '$1 $2')
}

const getAccountOTP = (accountId) => {
  return accountsStore.getAccountOTP(accountId)
}

// 处理内容区计时器可见性变化
const onTimerVisibilityChange = (isVisible) => {
  contentTimerVisible.value = isVisible
}

const copyOTP = async (account) => {
  const otp = getAccountOTP(account.id)
  if (otp && otp.otp_value) {
    try {
      await navigator.clipboard.writeText(otp.otp_value.toString())
      appStore.showNotification('success', `验证码 ${formatOTP(otp.otp_value)} 已复制到剪贴板`)
    } catch (error) {
      appStore.showNotification('error', '复制失败')
    }
  } else {
    // 没有验证码时的处理，可以选择不显示提示或显示生成中提示
    if (isGeneratingOTP.value) {
      appStore.showNotification('info', '验证码正在生成中...')
    }
  }
}

// 编辑账户
const editAccount = (account) => {
  router.push(`/edit-account/${account.id}`)
}

// 长按处理
const handleTouchStart = (account) => {
  longPressTimer = setTimeout(() => {
    editAccount(account)
  }, 800) // 800ms长按
}

const handleTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

onMounted(async () => {
  try {
    // 显示加载状态但不阻塞UI
    const loadingPromises = []
    
    // 并行执行数据获取和OTP初始化
    if (accountsStore.accounts.length === 0) {
      console.log('首次加载，获取账户数据...')
      loadingPromises.push(accountsStore.fetchAccounts())
    }
    
    if (accountsStore.groups.length === 0) {
      loadingPromises.push(accountsStore.fetchGroups())
    }
    
    // 等待基础数据加载完成
    await Promise.all(loadingPromises)
    
    // 延迟一下让DOM渲染完成，然后设置初始可见性状态
    await nextTick()
    setTimeout(() => {
      // 如果页面有内容区计时器，让它先检测一次可见性
      // 这样可以避免从其他页面回来时的不必要动画
      if (accounts.value.length > 0) {
        // 初始状态假设内容区可见
        contentTimerVisible.value = true
      }
    }, 100)
    
    // 异步初始化OTP系统，不阻塞界面显示
    accountsStore.initOTPSystem().catch(error => {
      console.error('OTP系统初始化失败:', error)
      appStore.showNotification('warning', 'OTP初始化失败，请手动刷新')
    })
    
  } catch (error) {
    console.error('初始化失败:', error)
    appStore.showNotification('error', '加载失败，请重试')
  }
})

onUnmounted(() => {
  // OTP系统由store全局管理，这里不需要清理
  if (longPressTimer) {
    clearTimeout(longPressTimer)
  }
})
</script> 