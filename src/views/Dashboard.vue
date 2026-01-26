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

    <main class="px-4 py-6 pt-20" @click="resetAllCards">
      <!-- 初始加载状态 -->
      <div v-if="isLoadingInitial" class="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div class="relative mb-6">
          <div class="w-16 h-16 rounded-full border-4 border-primary-100 flex items-center justify-center">
            <div class="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <div class="absolute -bottom-2 -right-2 bg-white rounded-lg p-1 shadow-md">
            <RefreshCw class="w-4 h-4 text-primary-500 animate-spin" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">正在同步数据</h3>
        <p class="text-gray-500 text-sm">连接到服务器中，请稍候...</p>
      </div>

      <!-- 连接错误状态 -->
      <div v-else-if="initialLoadError" class="flex flex-col items-center justify-center py-12 px-4 animate-scale-up">
        <div class="bg-red-50 rounded-3xl p-8 w-full max-sm border border-red-100 shadow-xl shadow-red-50 text-center">
          <div class="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <WifiOff class="w-10 h-10 text-red-600 -rotate-3" />
          </div>
          <h3 class="text-xl font-bold text-red-900 mb-3">连接服务器失败</h3>
          <p class="text-red-700 text-sm mb-8 leading-relaxed">
            无法连接到您的 2FAuth 服务器。这可能是由于：<br/>
            - 服务器地址或 API 密钥已更改<br/>
            - 服务器当前处于离线状态<br/>
            - 您的网络连接存在故障
          </p>
          <div class="space-y-3">
            <button 
              @click="initializeData"
              class="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
            >
              重试连接
            </button>
            <button 
              @click="router.push('/settings')"
              class="w-full py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
            >
              修改设置
            </button>
          </div>
        </div>
      </div>

      <template v-else>
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
            class="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-white/80"
            @click="copyOTP(account)"
            @touchstart="handleTouchStart($event, account)"
            @touchmove="handleTouchMove($event, account)"
            @touchend="handleTouchEnd($event, account)"
          >
            <!-- 隐藏的操作按钮 -->
            <div 
              :style="{ transform: `translateX(${getCardTransform(account.id) < -40 ? '0' : '100%'})` }"
              class="absolute right-0 top-0 h-full w-40 flex items-center justify-end z-10 transition-transform duration-300 ease-out"
            >
              <button
                @click.stop="editAccount(account)"
                class="h-full w-20 bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                title="编辑"
              >
                <Edit class="w-6 h-6" />
              </button>
              <button
                @click.stop="deleteAccount(account)"
                class="h-full w-20 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Trash2 class="w-6 h-6" />
              </button>
            </div>
            
            <!-- 主要内容区域 -->
            <div 
              :style="{ transform: `translateX(${getCardTransform(account.id)}px)` }"
              class="bg-white/70 backdrop-blur-sm rounded-2xl p-5 min-h-[100px] transition-transform duration-300 ease-out relative z-20"
            >
              <div class="flex items-center space-x-4 h-full">
                <AccountIcon :account="account" size="medium" class="flex-shrink-0" />

                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">
                    {{ account.service || account.account || '未知服务' }}
                  </h3>
                  <p class="text-gray-600 truncate text-sm mt-1">
                    {{ account.account || account.service || '未知账户' }}
                  </p>
                </div>

                <div class="text-right flex-shrink-0">
                  <div v-if="getAccountOTP(account.id)" class="space-y-1">
                    <div class="font-mono font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent text-2xl">
                      {{ formatOTP(getAccountOTP(account.id).otp_value) }}
                    </div>
                  </div>
                  <div v-else-if="isGeneratingOTP" class="space-y-1">
                    <div class="text-gray-400 font-medium text-sm">正在生成...</div>
                    <div class="flex items-center justify-end">
                      <div class="w-8 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div v-else class="space-y-1">
                    <div class="text-gray-400 font-medium text-sm">暂无验证码</div>
                  </div>
                </div>

                <button
                  @click.stop="copyOTP(account)"
                  :disabled="!getAccountOTP(account.id)"
                  class="p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
                  :class="getAccountOTP(account.id) ? 'text-gray-400 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'"
                >
                  <Copy class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- 底部导航 -->
    <BottomTabBar />

    <!-- 删除确认对话框 -->
    <div v-if="accountToDelete" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-up">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle class="w-8 h-8 text-red-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">确认删除</h3>
          <p class="text-gray-600 mb-6">
            确定要删除账户 <span class="font-semibold text-gray-900">"{{ accountToDelete.service || accountToDelete.account }}"</span> 吗？此操作无法撤销。
          </p>
          <div class="flex space-x-3">
            <button
              @click="accountToDelete = null"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  Shield, Users, Folder, Copy, Trash2, AlertTriangle, RefreshCw, WifiOff, Edit
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import HeaderOTPTimer from '@/components/HeaderOTPTimer.vue'
import GlobalOTPTimer from '@/components/GlobalOTPTimer.vue'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

// 滑动处理
const touchStartX = ref(0)
const touchStartY = ref(0)
const cardTransforms = ref({})
const isDragging = ref(false)
const dragThreshold = 50 
const accountToDelete = ref(null)

// 加载状态
const isLoadingInitial = ref(false)
const initialLoadError = ref(false)

// 内容区计时器可见性状态
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

const onTimerVisibilityChange = (isVisible) => {
  contentTimerVisible.value = isVisible
}

const copyOTP = async (account) => {
  if (isDragging.value) return
  
  if (cardTransforms.value[account.id] && cardTransforms.value[account.id] < 0) {
    cardTransforms.value[account.id] = 0
    return
  }
  
  const otp = getAccountOTP(account.id)
  if (otp && otp.otp_value) {
    try {
      await navigator.clipboard.writeText(otp.otp_value.toString())
      appStore.showNotification('success', `验证码 ${formatOTP(otp.otp_value)} 已复制`)
    } catch (error) {
      appStore.showNotification('error', '复制失败')
    }
  }
}

const editAccount = (account) => {
  resetAllCards()
  router.push(`/edit-account/${account.id}`)
}

const deleteAccount = (account) => {
  accountToDelete.value = account
}

const confirmDelete = async () => {
  if (!accountToDelete.value) return
  try {
    await accountsStore.deleteAccount(accountToDelete.value.id)
    appStore.showNotification('success', '账户已删除')
    accountToDelete.value = null
    resetAllCards()
  } catch (error) {
    appStore.showNotification('error', '删除失败')
  }
}

const getCardTransform = (accountId) => {
  return cardTransforms.value[accountId] || 0
}

const handleTouchStart = (event, account) => {
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isDragging.value = false
}

const handleTouchMove = (event, account) => {
  if (!event.touches[0]) return
  const touch = event.touches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isDragging.value = true
    event.preventDefault()
    if (deltaX < 0) {
      cardTransforms.value[account.id] = Math.max(deltaX, -160)
    } else {
      cardTransforms.value[account.id] = 0
    }
  }
}

const handleTouchEnd = (event, account) => {
  if (!isDragging.value) return
  const currentTransform = cardTransforms.value[account.id] || 0
  if (Math.abs(currentTransform) > dragThreshold) {
    cardTransforms.value[account.id] = -160
  } else {
    cardTransforms.value[account.id] = 0
  }
  isDragging.value = false
}

const resetAllCards = () => {
  cardTransforms.value = {}
}

const initializeData = async () => {
  try {
    isLoadingInitial.value = true
    initialLoadError.value = false
    const fetchOptions = { timeout: 3000 }
    await Promise.all([
      accountsStore.fetchAccounts(true, true, fetchOptions),
      accountsStore.fetchGroups(true, true, fetchOptions)
    ])
    await accountsStore.initOTPSystem()
    await nextTick()
    if (accounts.value.length > 0) contentTimerVisible.value = true
  } catch (error) {
    console.error('Initial load failed:', error)
    initialLoadError.value = true
  } finally {
    isLoadingInitial.value = false
  }
}

onMounted(() => {
  initializeData()
})

onUnmounted(() => {
  // Cleanup managed by store
})
</script>