<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/30 z-50 safe-area-pb">
    <div class="flex items-center justify-around py-3 px-6 max-w-md mx-auto">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.path"
        replace
        class="relative flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-300 group min-w-0 flex-1"
        :class="isActive(tab.path) ? 'transform scale-105' : 'hover:scale-105'"
      >
        <!-- 活跃状态背景 -->
        <div
          v-if="isActive(tab.path)"
          class="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 transition-all duration-300"
        ></div>
        
        <!-- 图标 -->
        <component
          :is="tab.icon"
          class="relative z-10 h-5 w-5 transition-all duration-300 mb-1"
          :class="isActive(tab.path) ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'"
        />
        
        <!-- 标签 -->
        <span
          class="relative z-10 text-xs font-medium transition-all duration-300 text-center"
          :class="isActive(tab.path) ? 'text-white font-semibold' : 'text-gray-600 group-hover:text-primary-600'"
        >
          {{ tab.label }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Plus, Settings } from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  {
    name: 'dashboard',
    path: '/dashboard',
    icon: Home,
    label: '首页'
  },
  {
    name: 'add',
    path: '/add-account',
    icon: Plus,
    label: '添加'
  },
  {
    name: 'settings',
    path: '/settings',
    icon: Settings,
    label: '设置'
  }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>