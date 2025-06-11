<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 固定顶部导航栏 -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield class="h-5 w-5 text-white" />
            </div>
            <h1 class="text-xl font-semibold text-gray-900">2FAuth</h1>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              @click="$router.push('/add-account')"
              class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus class="h-5 w-5" />
            </button>
            <button
              @click="showUserMenu = !showUserMenu"
              class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative"
            >
              <Menu class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 用户菜单 -->
    <div v-if="showUserMenu" class="fixed inset-0 z-50" @click="showUserMenu = false">
      <div class="absolute top-16 right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48">
        <router-link
          to="/accounts"
          class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
          @click="showUserMenu = false"
        >
          <Users class="h-4 w-4" />
          <span>账户管理</span>
        </router-link>
        <router-link
          to="/groups"
          class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
          @click="showUserMenu = false"
        >
          <Folder class="h-4 w-4" />
          <span>分组管理</span>
        </router-link>
        <router-link
          to="/settings"
          class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
          @click="showUserMenu = false"
        >
          <Settings class="h-4 w-4" />
          <span>设置</span>
        </router-link>
        <hr class="my-2" />
        <button
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50"
        >
          <LogOut class="h-4 w-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>

    <!-- 主要内容 - 添加顶部间距 -->
    <main class="px-4 py-6 pt-20">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">总账户数</p>
              <p class="text-2xl font-bold text-gray-900">{{ accounts.length }}</p>
            </div>
            <div class="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users class="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">分组数量</p>
              <p class="text-2xl font-bold text-gray-900">{{ groups.length }}</p>
            </div>
            <div class="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Folder class="h-6 w-6 text-green-600" />
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
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap',
              selectedGroupId === null
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            ]"
          >
            全部
          </button>
          <button
            v-for="group in groups"
            :key="group.id"
            @click="setSelectedGroup(group.id)"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap',
              selectedGroupId === group.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            ]"
          >
            {{ group.name }}
          </button>
        </div>
      </div>

      <!-- 账户列表 -->
      <div class="space-y-4">
        <div v-if="filteredAccounts.length === 0" class="text-center py-12">
          <div class="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无账户</h3>
          <p class="text-gray-600 mb-6">添加您的第一个2FA账户开始使用</p>
          <router-link to="/add-account" class="btn-primary">
            添加账户
          </router-link>
        </div>

        <div
          v-for="account in filteredAccounts"
          :key="account.id"
          class="card hover:shadow-md transition-all cursor-pointer hover:bg-gray-50 active:scale-95"
          @click="copyOTP(account)"
          title="点击复制验证码"
        >
          <div class="flex items-center space-x-4">
            <!-- 账户图标 -->
            <AccountIcon :account="account" size="medium" />

            <!-- 账户信息 -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">
                {{ account.service || account.account || '未知服务' }}
              </h3>
              <p class="text-sm text-gray-600 truncate">
                {{ account.account || account.service || '未知账户' }}
              </p>
            </div>

            <!-- OTP显示 -->
            <div class="text-right">
              <div v-if="getAccountOTP(account.id)" class="space-y-1">
                <div class="text-lg font-mono font-bold text-primary-600">
                  {{ formatOTP(getAccountOTP(account.id).otp_value) }}
                </div>
                <div class="flex items-center justify-end space-x-1">
                  <div
                    class="h-1 bg-gray-200 rounded-full"
                    style="width: 30px;"
                  >
                    <div
                      class="h-1 bg-primary-600 rounded-full transition-all duration-1000"
                      :style="`width: ${(getAccountOTP(account.id).period - getAccountOTP(account.id).remaining_time) / getAccountOTP(account.id).period * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ getAccountOTP(account.id).remaining_time }}s</span>
                </div>
              </div>
              <div v-else-if="isGeneratingOTP" class="space-y-1">
                <div class="text-sm text-gray-400">
                  正在生成...
                </div>
                <div class="h-1 bg-gray-100 rounded-full animate-pulse" style="width: 30px;"></div>
              </div>
              <div v-else class="space-y-1">
                <div class="text-sm text-gray-400">
                  暂无验证码
                </div>
                <div class="h-1 bg-gray-100 rounded-full" style="width: 30px;"></div>
              </div>
            </div>

            <!-- 复制按钮 -->
            <button
              @click.stop="copyOTP(account)"
              :disabled="!getAccountOTP(account.id)"
              class="p-2 transition-colors"
              :class="getAccountOTP(account.id) ? 'text-gray-400 hover:text-primary-600' : 'text-gray-300 cursor-not-allowed'"
              title="复制验证码"
            >
              <Copy class="h-5 w-5" />
            </button>


          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div class="flex justify-around">
        <router-link
          to="/dashboard"
          class="flex flex-col items-center space-y-1 p-2 text-primary-600"
        >
          <Home class="h-5 w-5" />
          <span class="text-xs">首页</span>
        </router-link>
        <router-link
          to="/accounts"
          class="flex flex-col items-center space-y-1 p-2 text-gray-400"
        >
          <Users class="h-5 w-5" />
          <span class="text-xs">账户</span>
        </router-link>
        <div class="relative">
          <button
            @click="showAddMenu = !showAddMenu"
            class="flex flex-col items-center space-y-1 p-2 text-gray-400"
          >
            <Plus class="h-5 w-5" />
            <span class="text-xs">添加</span>
          </button>
          
          <!-- 添加菜单 -->
          <div v-if="showAddMenu" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-32">
            <router-link
              to="/qr-scanner"
              @click="showAddMenu = false"
              class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <QrCode class="h-4 w-4" />
              <span>扫描二维码</span>
            </router-link>
            <router-link
              to="/add-account"
              @click="showAddMenu = false"
              class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit class="h-4 w-4" />
              <span>手动添加</span>
            </router-link>
          </div>
        </div>
        <router-link
          to="/settings"
          class="flex flex-col items-center space-y-1 p-2 text-gray-400"
        >
          <Settings class="h-5 w-5" />
          <span class="text-xs">设置</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  Shield, Plus, Menu, Users, Folder, Settings, LogOut, Home,
  QrCode, Edit, Copy
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const showUserMenu = ref(false)
const showAddMenu = ref(false)

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

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    // 使用全局OTP管理系统
    await accountsStore.initOTPSystem()
  } catch (error) {
    console.error('初始化失败:', error)
    appStore.showNotification('error', '初始化失败')
  }
})

onUnmounted(() => {
  // OTP系统由store全局管理，这里不需要清理
})
</script> 