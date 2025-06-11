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
            <h1 class="text-xl font-semibold text-gray-900">分组管理</h1>
          </div>
          <button
            @click="showCreateModal = true"
            class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <Plus class="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- 分组列表 - 添加顶部间距 -->
    <div class="px-4 py-4 space-y-3" style="margin-top: 80px;">
      <div v-if="groups.length === 0" class="text-center py-12">
        <div class="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Folder class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无分组</h3>
        <p class="text-gray-600 mb-6">创建分组来更好地组织您的2FA账户</p>
        <button @click="showCreateModal = true" class="btn-primary">
          创建分组
        </button>
      </div>

      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Folder class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ group.name }}</h3>
              <p class="text-sm text-gray-600">
                {{ getGroupAccountCount(group.id) }} 个账户
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="editGroup(group)"
              class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit class="h-5 w-5" />
            </button>
            <button
              @click="deleteGroup(group)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑分组对话框 -->
    <div v-if="showCreateModal || editingGroup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ editingGroup ? '编辑分组' : '创建分组' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              分组名称
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="input-field"
              placeholder="输入分组名称"
              maxlength="50"
            />
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isLoading || !formData.name.trim()"
              class="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {{ isLoading ? '处理中...' : (editingGroup ? '更新' : '创建') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="groupToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">删除分组</h3>
          <p class="text-gray-600 mb-6">
            确定要删除分组 "{{ groupToDelete.name }}" 吗？
            <span v-if="getGroupAccountCount(groupToDelete.id) > 0" class="text-red-600">
              该分组包含 {{ getGroupAccountCount(groupToDelete.id) }} 个账户，删除后这些账户将不再属于任何分组。
            </span>
          </p>
          <div class="flex space-x-3">
            <button
              @click="groupToDelete = null"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeft, Plus, Folder, Edit, Trash2
} from 'lucide-vue-next'

const router = useRouter()
const accountsStore = useAccountsStore()
const appStore = useAppStore()

const showCreateModal = ref(false)
const editingGroup = ref(null)
const groupToDelete = ref(null)
const isLoading = ref(false)

const formData = reactive({
  name: ''
})

const groups = computed(() => accountsStore.groups)
const accounts = computed(() => accountsStore.accounts)

const getGroupAccountCount = (groupId) => {
  return accounts.value.filter(account => account.group_id === groupId).length
}

const editGroup = (group) => {
  editingGroup.value = group
  formData.name = group.name
}

const deleteGroup = (group) => {
  groupToDelete.value = group
}

const closeModal = () => {
  showCreateModal.value = false
  editingGroup.value = null
  formData.name = ''
}

const handleSubmit = async () => {
  if (!formData.name.trim()) return

  try {
    isLoading.value = true

    if (editingGroup.value) {
      await accountsStore.updateGroup(editingGroup.value.id, {
        name: formData.name.trim()
      })
    } else {
      await accountsStore.createGroup({
        name: formData.name.trim()
      })
    }

    closeModal()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async () => {
  try {
    await accountsStore.deleteGroup(groupToDelete.value.id)
    groupToDelete.value = null
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      accountsStore.fetchGroups(),
      accountsStore.fetchAccounts()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script> 