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

// 禁用页面滚动回弹
export const disableScrollBounce = () => {
  if (typeof window !== 'undefined') {
    console.log('正在禁用滚动回弹效果...')
    
    // 添加更强力的CSS样式
    const style = document.createElement('style')
    style.id = 'mobile-optimizations'
    style.textContent = `
      html, body {
        overscroll-behavior: none !important;
        overscroll-behavior-y: none !important;
        overscroll-behavior-x: none !important;
        -webkit-overflow-scrolling: auto !important;
        overflow-x: hidden !important;
        touch-action: pan-y !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      body {
        position: fixed !important;
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
        touch-action: none !important;
      }
      
      #app {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: none !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
      }
      
      .min-h-screen {
        min-height: 100vh !important;
        overscroll-behavior: none !important;
        overscroll-behavior-y: none !important;
        touch-action: pan-y !important;
      }
      
      /* 禁用所有容器的过度滚动 */
      * {
        overscroll-behavior: none !important;
        overscroll-behavior-y: none !important;
        overscroll-behavior-x: none !important;
      }
      
      /* 禁用输入框缩放 */
      input, textarea, select {
        font-size: 16px !important;
        transform-origin: left top;
        transform: scale(1);
      }
      
      /* 优化触摸响应 */
      button, .card, [role="button"] {
        touch-action: manipulation !important;
      }
      
      /* 禁用选择 */
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* 允许输入框选择 */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `
    
    // 移除已存在的样式
    const existingStyle = document.getElementById('mobile-optimizations')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    document.head.appendChild(style)
    
    // 更强力的触摸事件处理
    let isScrolling = false
    let startY = 0
    let startTime = 0
    
    const preventBounce = (e) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // 禁用所有可能导致回弹的事件
    const eventsToPrevent = [
      'touchstart',
      'touchmove', 
      'touchend',
      'gesturestart',
      'gesturechange', 
      'gestureend'
    ]
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY
      startTime = Date.now()
      isScrolling = false
    }
    
    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      const currentY = touch.clientY
      const deltaY = currentY - startY
      const deltaTime = Date.now() - startTime
      
      // 查找可滚动的父元素
      let scrollableElement = null
      let element = e.target
      
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element)
        const overflow = style.overflow + style.overflowY
        
        if (overflow.includes('scroll') || overflow.includes('auto')) {
          if (element.scrollHeight > element.clientHeight) {
            scrollableElement = element
            break
          }
        }
        element = element.parentElement
      }
      
      if (!scrollableElement) {
        scrollableElement = document.documentElement
      }
      
      const { scrollTop, scrollHeight, clientHeight } = scrollableElement
      const isAtTop = scrollTop <= 1
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
      
      // 如果试图在边界滚动，阻止事件
      if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      // 如果滚动速度太快，也阻止（防止惯性滚动导致回弹）
      if (deltaTime > 0) {
        const velocity = Math.abs(deltaY / deltaTime)
        if (velocity > 2) {
          e.preventDefault()
          return false
        }
      }
    }
    
    // 添加事件监听
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // 禁用双击缩放和手势
    document.addEventListener('touchend', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
        return false
      }
    }, { passive: false })
    
    document.addEventListener('gesturestart', preventBounce, { passive: false })
    document.addEventListener('gesturechange', preventBounce, { passive: false })
    document.addEventListener('gestureend', preventBounce, { passive: false })
    
    // 监听窗口大小变化，确保样式持续有效
    window.addEventListener('resize', () => {
      setTimeout(() => {
        document.body.style.height = window.innerHeight + 'px'
      }, 100)
    })
    
    // 立即设置body高度
    document.body.style.height = window.innerHeight + 'px'
    
    console.log('滚动回弹禁用完成')
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