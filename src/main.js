import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 应用启动时的初始化
import { useAuthStore } from './stores/auth'
import { useAccountsStore } from './stores/accounts'

// 等待路由准备就绪后初始化
router.isReady().then(async () => {
  const authStore = useAuthStore()
  const accountsStore = useAccountsStore()
  
  // 初始化认证
  authStore.initAuth()
  
  // 如果已登录，启动全局OTP系统
  if (authStore.isAuthenticated) {
    try {
      console.log('应用启动，初始化全局OTP系统...')
      await accountsStore.initOTPSystem()
    } catch (error) {
      console.error('全局OTP系统初始化失败:', error)
    }
  }
  
  // 挂载应用
  app.mount('#app')
}) 