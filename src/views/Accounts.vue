<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 固定头部 -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft class="h-5 w-5 text-gray-600" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">账户管理</h1>
          </div>
          <button
            @click="$router.push('/add-account')"
            class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <Plus class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="px-4 py-4 bg-white border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索账户..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 分组筛选 -->
      <div class="px-4 py-4 bg-white border-b border-gray-200">
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            @click="selectedGroupId = null"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap',
              selectedGroupId === null
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            全部 ({{ accounts.length }})
          </button>
          <button
            v-for="group in groups"
            :key="group.id"
            @click="selectedGroupId = group.id"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap',
              selectedGroupId === group.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ group.name }} ({{ getGroupAccountCount(group.id) }})
          </button>
        </div>
      </div>
    </header>

    <!-- 全局OTP时间组件 -->
    <GlobalOTPTimer v-if="accounts.length > 0" />

    <!-- 账户列表 - 添加顶部间距 -->
    <div class="px-4 py-4 space-y-3" :style="{ marginTop: accounts.length > 0 ? '320px' : '220px' }">
      <div v-if="filteredAndSearchedAccounts.length === 0" class="text-center py-12">
        <div class="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? '未找到匹配的账户' : '暂无账户' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery ? '尝试使用其他关键词搜索' : '添加您的第一个2FA账户' }}
        </p>
        <router-link to="/add-account" class="btn-primary">
          添加账户
        </router-link>
      </div>

      <div
        v-for="account in filteredAndSearchedAccounts"
        :key="account.id"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
        @click="copyOTP(account)"
        title="点击复制验证码"
      >
        <div class="flex items-center space-x-4">
          <!-- 账户图标 -->
          <AccountIcon :account="account" size="medium" />

          <!-- 账户信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 leading-tight break-words">
              {{ account.service || account.account || '未知服务' }}
            </h3>
            <p class="text-sm text-gray-600 leading-tight break-words">
              {{ account.account || account.service || '未知账户' }}
            </p>
            <div class="flex items-center space-x-2 mt-1">
              <span v-if="account.group_id" class="badge badge-success">
                {{ getGroupName(account.group_id) }}
              </span>
              <span class="badge" :class="account.otp_type === 'totp' ? 'badge-success' : 'badge-warning'">
                {{ account.otp_type?.toUpperCase() || 'TOTP' }}
              </span>
            </div>
          </div>

          <!-- OTP显示区域 - 简化版 -->
          <div class="text-right">
            <div v-if="getAccountOTP(account.id)" class="space-y-1">
              <div class="text-xl font-mono font-bold text-primary-600">
                {{ formatOTP(getAccountOTP(account.id).otp_value) }}
              </div>
              <div class="flex items-center justify-end space-x-2">
                <span class="text-xs text-gray-500">点击复制</span>
                <button
                  @click.stop="copyOTP(account)"
                  class="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="复制验证码"
                >
                  <Copy class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div v-else-if="isGeneratingOTP" class="space-y-1">
              <div class="text-lg text-gray-400">
                正在生成...
              </div>
              <div class="w-8 h-1 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div v-else class="space-y-1">
              <div class="text-lg text-gray-400">
                暂无验证码
              </div>
              <span class="text-xs text-gray-400">等待生成</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-2">
            <button
              @click.stop="editAccount(account)"
              class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit class="h-5 w-5" />
            </button>
            <button
              @click.stop="deleteAccount(account)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomTabBar />

    <!-- 删除确认对话框 -->
    <div v-if="accountToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 m-4 max-w-sm w-full">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">删除账户</h3>
          <p class="text-gray-600 mb-6">
            确定要删除账户 "{{ accountToDelete.service || accountToDelete.account }}" 吗？此操作无法撤销。
          </p>
          <div class="flex space-x-3">
            <button
              @click="accountToDelete = null"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeft, Plus, Search, Users, Edit, Trash2, Copy, AlertTriangle
} from 'lucide-vue-next'
import AccountIcon from '@/components/AccountIcon.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import GlobalOTPTimer from '@/components/GlobalOTPTimer.vue'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const searchQuery = ref('')
const selectedGroupId = ref(null)
const accountToDelete = ref(null)

const accounts = computed(() => accountsStore.accounts)
const groups = computed(() => accountsStore.groups)

const filteredAndSearchedAccounts = computed(() => {
  let filtered = accounts.value

  // 按分组筛选
  if (selectedGroupId.value !== null) {
    filtered = filtered.filter(account => account.group_id === selectedGroupId.value)
  }

  // 按搜索词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(account => 
      (account.service || '').toLowerCase().includes(query) ||
      (account.account || '').toLowerCase().includes(query)
    )
  }

  return filtered
})

const getGroupName = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  return group?.name || '未知分组'
}

const getGroupAccountCount = (groupId) => {
  return accounts.value.filter(account => account.group_id === groupId).length
}

const formatOTP = (otp) => {
  if (!otp) return ''
  return otp.toString().replace(/(\d{3})(\d{3})/, '$1 $2')
}

const getAccountOTP = (accountId) => {
  return accountsStore.getAccountOTP(accountId)
}

const isGeneratingOTP = computed(() => accountsStore.isGeneratingOTP)

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
    // 没有验证码时的处理
    if (isGeneratingOTP.value) {
      appStore.showNotification('info', '验证码正在生成中...')
    }
  }
}

const editAccount = (account) => {
  // TODO: 实现编辑功能
  appStore.showNotification('info', '编辑功能开发中...')
}

const deleteAccount = (account) => {
  accountToDelete.value = account
}

const confirmDelete = async () => {
  try {
    await accountsStore.deleteAccount(accountToDelete.value.id)
    accountToDelete.value = null
  } catch (error) {
    appStore.showNotification('error', '删除失败')
  }
}

onMounted(async () => {
  try {
    // 确保账户数据已加载
    if (accountsStore.accounts.length === 0) {
      await accountsStore.fetchAccounts()
      await accountsStore.fetchGroups()
    }
    
    // 使用全局OTP管理系统，如果已经初始化过就不会重复初始化
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