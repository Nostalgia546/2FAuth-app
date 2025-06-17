<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <!-- 固定顶部导航栏 -->
    <header class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 z-40">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
              <Shield class="h-5 w-5 text-white" />
            </div>
            <h1 class="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">2FAuth</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 - 添加顶部间距 -->
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

      <!-- 分组筛选 -->
      <div class="mb-6">
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            @click="setSelectedGroup(null)"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap shadow-sm hover:shadow-md',
              selectedGroupId === null
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 border border-gray-200/50 hover:border-gray-300'
            ]"
          >
            全部
          </button>
          <button
            v-for="group in groups"
            :key="group.id"
            @click="setSelectedGroup(group.id)"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap shadow-sm hover:shadow-md',
              selectedGroupId === group.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 border border-gray-200/50 hover:border-gray-300'
            ]"
          >
            {{ group.name }}
          </button>
        </div>
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
          class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-white/80 active:scale-95"
          @click="copyOTP(account)"
          @contextmenu.prevent="editAccount(account)"
          @touchstart="handleTouchStart(account)"
          @touchend="handleTouchEnd"
          title="点击复制验证码，长按编辑"
        >
          <div class="flex items-center space-x-4">
            <!-- 账户图标 -->
            <AccountIcon :account="account" size="large" />

            <!-- 账户信息 -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate text-lg">
                {{ account.service || account.account || '未知服务' }}
              </h3>
              <p class="text-sm text-gray-600 truncate">
                {{ account.account || account.service || '未知账户' }}
              </p>
            </div>

            <!-- OTP显示 -->
            <div class="text-right">
              <div v-if="getAccountOTP(account.id)" class="space-y-2">
                <div class="text-2xl font-mono font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {{ formatOTP(getAccountOTP(account.id).otp_value) }}
                </div>
                <div class="flex items-center justify-end space-x-2">
                  <div
                    class="h-2 bg-gray-200 rounded-full"
                    style="width: 40px;"
                  >
                    <div
                      class="h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000"
                      :style="`width: ${(getAccountOTP(account.id).period - getAccountOTP(account.id).remaining_time) / getAccountOTP(account.id).period * 100}%`"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-500 font-medium">{{ getAccountOTP(account.id).remaining_time }}s</span>
                </div>
              </div>
              <div v-else-if="isGeneratingOTP" class="space-y-2">
                <div class="text-lg text-gray-400 font-medium">
                  正在生成...
                </div>
                <div class="h-2 bg-gray-100 rounded-full animate-pulse" style="width: 40px;"></div>
              </div>
              <div v-else class="space-y-2">
                <div class="text-lg text-gray-400 font-medium">
                  暂无验证码
                </div>
                <div class="h-2 bg-gray-100 rounded-full" style="width: 40px;"></div>
              </div>
            </div>

            <!-- 复制按钮 -->
            <button
              @click.stop="copyOTP(account)"
              :disabled="!getAccountOTP(account.id)"
              class="p-3 rounded-xl transition-all shadow-sm hover:shadow-md"
              :class="getAccountOTP(account.id) ? 'text-gray-400 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'"
              title="复制验证码"
            >
              <Copy class="h-6 w-6" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  Shield, Users, Folder, Copy
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

// 长按处理
let longPressTimer = null

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