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

        <!-- 还原单行横向滚动分组导航 -->
        <div class="flex items-center overflow-x-auto no-scrollbar h-20 mb-2 flex-nowrap w-[calc(100%+2rem)] -mx-4 relative z-30" 
             style="-webkit-overflow-scrolling: touch;" 
             v-if="groups.length > 0 || accounts.length > 0"
             @touchstart="handleGroupContainerTouchStart"
             @touchmove="handleGroupContainerTouchMove"
             @touchend="handleGroupContainerTouchEnd"
        >
          <!-- 物理左边距 (16px) -->
          <div class="w-4 flex-none"></div>

          <!-- 全部 按钮 -->
          <div
            @click="setSelectedGroup(null)"
            :class="[
              'px-4 py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap select-none flex-shrink-0 cursor-pointer mr-3 shadow-sm',
              selectedGroupId === null
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md ring-2 ring-primary-300 ring-offset-1'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            ]"
          >
            全部 ({{ accounts.length }})
          </div>

          <template v-for="group in groups" :key="group.id">
            <div
              v-if="!['所有账户', '所有账号', 'All accounts'].includes(group.name)"
              @click="handleGroupClick(group)"
              :data-group-id="group.id"
              :class="[
                'px-4 py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap select-none flex-shrink-0 cursor-pointer mr-3 shadow-sm group-item',
                selectedGroupId === group.id
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md ring-2 ring-primary-300 ring-offset-1'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              ]"
            >
              {{ group.name }} ({{ getGroupAccountCount(group.id) }})
            </div>
          </template>
          
          <div
            @click="showCreateGroupModal = true"
            class="px-5 py-2.5 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center min-w-[50px] flex-shrink-0 cursor-pointer active:scale-90 transition-transform"
          >
            <Plus class="h-5 w-5" />
          </div>

          <!-- 物理右边距 (16px)，防止遮挡并对齐 -->
          <div class="w-4 flex-none"></div>
        </div>

        <!-- 账户列表 -->
        <div class="space-y-4">
          <div v-if="filteredAccounts.length === 0" class="text-center py-12 px-4">
            <!-- 全部账户为空 -->
            <template v-if="selectedGroupId === null">
              <div class="h-16 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users class="h-8 w-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无账户</h3>
              <p class="text-gray-600 mb-6">添加您的第一个2FA账户开始使用</p>
              <router-link to="/add-account" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                添加账户
              </router-link>
            </template>
            <!-- 选中的分组为空 -->
            <template v-else>
              <div class="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300">
                <Folder class="h-8 w-8 text-gray-300" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">该分组下没有账户</h3>
              <p class="text-gray-500 mb-6 font-medium">您可以编辑账户并将其分配到此分组中</p>
            </template>
          </div>

          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div
              v-for="account in displayAccounts"
              :key="account.id"
              :class="[
                'relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-white/80',
                isSortMode ? 'ring-2 ring-primary-500 shadow-primary-100 scale-[0.98]' : (longPressingId === account.id ? 'scale-[0.98] bg-gray-50' : '')
              ]"
              @click="copyOTP(account)"
              @touchstart="handleTouchStart($event, account)"
              @touchmove="handleTouchMove($event, account)"
              @touchend="handleTouchEnd($event, account)"
              @mousedown="handleMouseDown($event, account)"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
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
                :style="{ transform: `translateX(${isSortMode ? 0 : getCardTransform(account.id)}px)` }"
                class="bg-white/70 backdrop-blur-sm rounded-2xl p-5 min-h-[100px] transition-transform duration-300 ease-out relative z-20"
              >
                <div class="flex items-center space-x-4 h-full">
                  <!-- 排序模式下的移动控制 -->
                  <div v-if="isSortMode" class="flex flex-col space-y-2 mr-2">
                    <button 
                      @click.stop="moveAccount(account, 'up')"
                      :disabled="isFirst(account)"
                      class="p-1 rounded-md hover:bg-gray-100 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp class="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      @click.stop="moveAccount(account, 'down')"
                      :disabled="isLast(account)"
                      class="p-1 rounded-md hover:bg-gray-100 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDownIcon class="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <AccountIcon :account="account" size="medium" class="flex-shrink-0" />

                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 truncate">
                      {{ account.service || account.account || '未知服务' }}
                    </h3>
                    <p class="text-gray-600 truncate text-sm mt-1">
                      {{ account.account || account.service || '未知账户' }}
                    </p>
                  </div>

                  <div v-if="!isSortMode" class="text-right flex-shrink-0">
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
                    v-if="!isSortMode"
                    @click.stop="copyOTP(account)"
                    :disabled="!getAccountOTP(account.id)"
                    class="p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
                    :class="getAccountOTP(account.id) ? 'text-gray-400 hover:text-primary-600 hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'"
                  >
                    <Copy class="w-5 h-5" />
                  </button>

                  <!-- 排序模式下的手柄图标 -->
                  <div v-else class="text-gray-300">
                    <GripVertical class="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- 排序模式下的操作栏 -->
        <div v-if="isSortMode" class="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-gray-200 z-50 animate-bounce-in w-max">
          <button 
            @click="cancelSort"
            class="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 whitespace-nowrap min-w-fit"
          >
            <X class="w-5 h-5" />
            <span>取消</span>
          </button>
          <button 
            @click="saveSort"
            class="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 whitespace-nowrap min-w-fit"
          >
            <Check class="w-5 h-5" />
            <span>保存顺序</span>
          </button>
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

    <!-- 分组删除确认对话框 -->
    <div v-if="groupToDeleteConfirm" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-up text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 class="w-8 h-8 text-red-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">删除分组</h3>
        <p class="text-gray-600 mb-6">
          确认要删除分组 <span class="font-semibold text-gray-900">"{{ groupToDeleteConfirm.name }}"</span> 吗？<br/>
          <span class="text-sm text-red-500 mt-2 block">此操作仅删除分组分类，不会删除账号。</span>
        </p>
        <div class="flex space-x-3">
          <button
            @click="groupToDeleteConfirm = null"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            取消
          </button>
          <button
            @click="confirmDeleteGroup"
            class="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 快捷创建分组对话框 -->
    <div v-if="showCreateGroupModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-up">
        <h3 class="text-xl font-bold text-gray-900 mb-4">创建新分组</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">分组名称</label>
            <input
              v-model="newGroupName"
              type="text"
              class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="例如：社交、工作、理财"
              autofocus
              @keyup.enter="handleCreateGroup"
            />
          </div>
          <div class="flex space-x-3 pt-2">
            <button
              @click="showCreateGroupModal = false; newGroupName = ''"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all transition-all shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleCreateGroup"
              :disabled="!newGroupName.trim() || isCreatingGroup"
              class="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
            >
              {{ isCreatingGroup ? '创建中...' : '确认创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  Shield, Users, Folder, Copy, Trash2, AlertTriangle, RefreshCw, WifiOff, Edit,
  Plus, ArrowDownUp, Check, X, ChevronUp, ChevronDown as ChevronDownIcon, GripVertical
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

// 排序相关状态
const isSortMode = ref(false)
const sortList = ref([])
const longPressTimer = ref(null)
const longPressingId = ref(null)
const LONG_PRESS_DURATION = 600

// 分组弹窗与管理
const showCreateGroupModal = ref(false)
const newGroupName = ref('')
const isCreatingGroup = ref(false)
const groupToDeleteConfirm = ref(null)
const groupLongPressTimer = ref(null)
const groupTouchStartX = ref(0)
const groupTouchStartY = ref(0)

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
  if (isSortMode.value) return
  accountsStore.setSelectedGroup(groupId)
}

const displayAccounts = computed(() => {
  return isSortMode.value ? sortList.value : filteredAccounts.value
})

const enterSortMode = () => {
  if (selectedGroupId.value !== null) return
  isSortMode.value = true
  sortList.value = [...accounts.value]
}

const cancelSort = () => {
  isSortMode.value = false
  sortList.value = []
}

const saveSort = async () => {
  try {
    appStore.setLoading(true)
    const orderedIds = sortList.value.map(acc => acc.id)
    await accountsStore.reorderAccounts(orderedIds)
    isSortMode.value = false
    sortList.value = []
  } catch (error) {
    console.error('Save sort failed:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const moveAccount = (account, direction) => {
  const index = sortList.value.findIndex(acc => acc.id === account.id)
  if (index === -1) return
  
  const newList = [...sortList.value]
  if (direction === 'up' && index > 0) {
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
  } else if (direction === 'down' && index < newList.length - 1) {
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]]
  }
  sortList.value = newList
}

const isFirst = (account) => {
  return sortList.value.findIndex(acc => acc.id === account.id) === 0
}

const isLast = (account) => {
  const index = sortList.value.findIndex(acc => acc.id === account.id)
  return index === sortList.value.length - 1
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
  if (isDragging.value || isSortMode.value) return
  
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
  if (isSortMode.value) return
  
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isDragging.value = false

  // 长按开始
  longPressingId.value = account.id
  longPressTimer.value = setTimeout(() => {
    startLongPress(account)
  }, LONG_PRESS_DURATION)
}

const handleMouseDown = (event, account) => {
  if (isSortMode.value) return
  longPressingId.value = account.id
  longPressTimer.value = setTimeout(() => {
    startLongPress(account)
  }, LONG_PRESS_DURATION)
}

const handleMouseUp = () => {
  clearLongPress()
}

const startLongPress = (account) => {
  if (selectedGroupId.value !== null) {
    appStore.showNotification('info', '请在“全部”分组下进行排序')
    return
  }
  
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50)
  }
  
  enterSortMode()
  appStore.showNotification('info', '已进入排序模式')
}

const clearLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  longPressingId.value = null
}

const handleTouchMove = (event, account) => {
  if (!event.touches[0]) return
  const touch = event.touches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  
  if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
    clearLongPress()
  }

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isDragging.value = true
    event.preventDefault()
    if (deltaX < 0 && !isSortMode.value) {
      cardTransforms.value[account.id] = Math.max(deltaX, -160)
    } else {
      cardTransforms.value[account.id] = 0
    }
  }
}

const handleTouchEnd = (event, account) => {
  clearLongPress()
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
  if (isLoadingInitial.value) return // 如果已经在加载了，直接返回
  
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

const handleGroupClick = (group) => {
  if (isSortMode.value) return
  accountsStore.setSelectedGroup(group.id)
}

const handleGroupContainerTouchStart = (event) => {
  const touch = event.touches[0]
  groupTouchStartX.value = touch.clientX
  groupTouchStartY.value = touch.clientY
  
  // 通过点击点定位具体的分组元素
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  const groupItem = target?.closest('.group-item')
  
  if (groupItem) {
    const groupId = groupItem.getAttribute('data-group-id')
    const group = groups.value.find(g => String(g.id) === String(groupId))
    
    if (group) {
      groupLongPressTimer.value = setTimeout(() => {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50)
        }
        groupToDeleteConfirm.value = group
      }, 800)
    }
  }
}

const handleGroupContainerTouchMove = (event) => {
  const touch = event.touches[0]
  const deltaX = Math.abs(touch.clientX - groupTouchStartX.value)
  const deltaY = Math.abs(touch.clientY - groupTouchStartY.value)
  
  if (deltaX > 5 || deltaY > 5) {
    if (groupLongPressTimer.value) {
      clearTimeout(groupLongPressTimer.value)
      groupLongPressTimer.value = null
    }
  }
}

const handleGroupContainerTouchEnd = () => {
  if (groupLongPressTimer.value) {
    clearTimeout(groupLongPressTimer.value)
    groupLongPressTimer.value = null
  }
}

const confirmDeleteGroup = async () => {
  if (!groupToDeleteConfirm.value) return
  try {
    appStore.setLoading(true)
    await accountsStore.deleteGroup(groupToDeleteConfirm.value.id)
    if (selectedGroupId.value === groupToDeleteConfirm.value.id) {
      accountsStore.setSelectedGroup(null)
    }
    groupToDeleteConfirm.value = null
  } catch (error) {
    console.error('Delete group failed:', error)
  } finally {
    appStore.setLoading(false)
  }
}

const getGroupAccountCount = (groupId) => {
  return accounts.value.filter(acc => acc.group_id === groupId).length
}

const handleCreateGroup = async () => {
  if (!newGroupName.value.trim() || isCreatingGroup.value) return
  
  try {
    isCreatingGroup.value = true
    await accountsStore.createGroup({ name: newGroupName.value.trim() })
    showCreateGroupModal.value = false
    newGroupName.value = ''
  } catch (error) {
    if (error.response?.data?.message?.includes('name')) {
      appStore.showNotification('error', '分组名格式错误（后端可能不支持中文）')
    }
    console.error('Create group failed:', error)
  } finally {
    isCreatingGroup.value = false
  }
}

onMounted(() => {
  initializeData()
})

onUnmounted(() => {
  // Cleanup managed by store
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

.list-move, /* 对移动中的元素应用过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 确保在排序模式下即使位置变化，内部元素也不会有奇怪的闪烁 */
.list-leave-active {
  position: absolute;
}
</style>