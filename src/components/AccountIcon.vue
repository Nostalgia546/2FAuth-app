<template>
  <div :class="containerClass">
    <!-- 真实图标 -->
    <img
      v-if="iconUrl && !imageError"
      :src="iconUrl"
      :alt="account.service || account.account"
      class="w-full h-full object-cover rounded-xl"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    
    <!-- 回退到首字母 -->
    <div 
      v-else
      :class="[
        'w-full h-full flex items-center justify-center rounded-xl text-white font-bold',
        size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg',
        gradientClass
      ]"
    >
      {{ fallbackText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const accountsStore = useAccountsStore()
const imageError = ref(false)
const iconUrl = ref(null)

// 容器样式
const containerClass = computed(() => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12', 
    large: 'h-16 w-16'
  }
  return `${sizeClasses[props.size]} rounded-xl overflow-hidden`
})

// 渐变背景样式
const gradientClass = computed(() => {
  // 根据账户名生成一致的颜色
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-gray-500 to-gray-600'
  ]
  
  const serviceName = props.account.service || props.account.account || 'unknown'
  const hash = serviceName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
})

// 回退文本
const fallbackText = computed(() => {
  const service = props.account.service || props.account.account || '?'
  return service.charAt(0).toUpperCase()
})

// 获取图标
const loadIcon = async () => {
  // 重置状态
  imageError.value = false
  iconUrl.value = null

  console.log('AccountIcon加载图标:', props.account.service, '图标数据:', props.account.icon)

  if (props.account.icon) {
    // 如果账户已经有图标信息
    iconUrl.value = accountsStore.getIconUrl(props.account.icon)
    console.log('设置图标URL:', iconUrl.value)
  } else {
    // 尝试获取账户详细信息（可能包含图标）
    console.log('尝试获取账户详细信息...')
    try {
      const iconPath = await accountsStore.getAccountIcon(props.account.id)
      if (iconPath) {
        iconUrl.value = accountsStore.getIconUrl(iconPath)
        console.log('从详细信息获取图标URL:', iconUrl.value)
      } else {
        console.log('账户没有图标数据，使用首字母回退')
      }
    } catch (error) {
      console.log('获取详细图标信息失败，使用首字母回退')
    }
  }
}

const handleImageError = (event) => {
  console.error('图标加载失败:', event.target.src, '错误:', event)
  imageError.value = true
}

const handleImageLoad = (event) => {
  console.log('图标加载成功:', event.target.src)
  imageError.value = false
}

// 监听账户变化
watch(() => props.account, loadIcon, { immediate: true })

onMounted(() => {
  loadIcon()
})
</script> 