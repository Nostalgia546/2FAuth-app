import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 导入移动端优化
import { initMobileOptimizations } from './utils/mobile'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 先挂载应用，避免白屏
app.mount('#app')

// 应用启动时的异步初始化
import { useAuthStore } from './stores/auth'
import { useAccountsStore } from './stores/accounts'

// 异步初始化，不阻塞应用挂载
;(async () => {
  try {
    // 等待路由准备就绪
    await router.isReady()
    
    const authStore = useAuthStore()
    const accountsStore = useAccountsStore()
    
    // 初始化移动端优化
    initMobileOptimizations()
    
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
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})()