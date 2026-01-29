// 移动端工具函数

// 检测是否为移动设备
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测是否为Android
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent)
}

// 检测是否为iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 检测是否为Tauri应用
export const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}

// 设置状态栏样式
export const setStatusBarStyle = (style = 'dark') => {
  if (typeof window !== 'undefined') {
    // 设置meta标签
    let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (!statusBarMeta) {
      statusBarMeta = document.createElement('meta')
      statusBarMeta.name = 'apple-mobile-web-app-status-bar-style'
      document.head.appendChild(statusBarMeta)
    }
    statusBarMeta.content = style === 'dark' ? 'black-translucent' : 'default'

    // 设置主题颜色
    let themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      document.head.appendChild(themeColorMeta)
    }

    if (style === 'dark') {
      themeColorMeta.content = '#000000'
      // 为Android设置状态栏颜色
      let statusColorMeta = document.querySelector('meta[name="msapplication-navbutton-color"]')
      if (!statusColorMeta) {
        statusColorMeta = document.createElement('meta')
        statusColorMeta.name = 'msapplication-navbutton-color'
        document.head.appendChild(statusColorMeta)
      }
      statusColorMeta.content = '#000000'
    } else {
      themeColorMeta.content = '#3b82f6'
    }

    // 为Tauri Android应用设置状态栏
    if (isTauri() && isAndroid()) {
      try {
        // 尝试使用Tauri的插件API（如果可用）
        if (window.__TAURI__ && window.__TAURI__.invoke) {
          window.__TAURI__.invoke('set_status_bar_color', { color: '#000000' })
            .catch(err => console.log('Status bar API not available:', err))
        }
      } catch (error) {
        console.log('Tauri status bar setting not available:', error)
      }
    }
  }
}

// 禁用页面滚动回弹 - 仅使用 CSS
export const disableScrollBounce = () => {
  if (typeof window !== 'undefined') {
    console.log('正在应用滚动优化...')

    const style = document.createElement('style')
    style.id = 'mobile-optimizations'
    style.textContent = `
      html {
        height: 100% !important;
        overflow: hidden !important;
      }
      
      body {
        height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        width: 100% !important;
        overscroll-behavior-y: none !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-x pan-y !important;
        position: relative !important;
      }
      
      #app {
        width: 100%;
        min-height: 100%;
      }
      
      /* 修复横向滚动条可能导致的溢出 */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      
      /* 修复移动端点击缩放 */
      input, textarea, select {
        font-size: 16px !important;
      }
      
      button, .card, [role="button"] {
        touch-action: manipulation !important;
      }
    `

    const existingStyle = document.getElementById('mobile-optimizations')
    if (existingStyle) {
      existingStyle.remove()
    }

    document.head.appendChild(style)
    console.log('滚动优化应用完成')
  }
}

// 处理页面可见性变化
export const handleVisibilityChange = (callback) => {
  if (typeof document !== 'undefined') {
    const visibilityHandler = () => {
      const isVisible = !document.hidden
      callback(isVisible)
    }

    document.addEventListener('visibilitychange', visibilityHandler)

    // 监听应用状态变化（针对移动端）
    window.addEventListener('pageshow', () => callback(true))
    window.addEventListener('pagehide', () => callback(false))

    // 监听焦点变化
    window.addEventListener('focus', () => callback(true))
    window.addEventListener('blur', () => callback(false))

    // 返回清理函数
    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler)
      window.removeEventListener('pageshow', () => callback(true))
      window.removeEventListener('pagehide', () => callback(false))
      window.removeEventListener('focus', () => callback(true))
      window.removeEventListener('blur', () => callback(false))
    }
  }
}

// 初始化移动端优化
export const initMobileOptimizations = () => {
  if (isMobile()) {
    console.log('检测到移动设备，应用移动端优化...')

    // 设置黑色状态栏
    setStatusBarStyle('dark')

    // 禁用滚动回弹
    disableScrollBounce()

    // 禁用选择文本（在某些元素上）
    document.addEventListener('selectstart', (e) => {
      // 只在特定元素上禁用文本选择
      const tagName = e.target.tagName.toLowerCase()
      if (['div', 'span', 'button', 'nav', 'header', 'main'].includes(tagName)) {
        // 检查是否在输入框内
        if (!e.target.closest('input, textarea, [contenteditable]')) {
          e.preventDefault()
        }
      }
    })

    // 添加viewport meta标签优化
    let viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    }

    console.log('移动端优化完成')
  }
} 