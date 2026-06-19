<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0 md:h-screen md:overflow-hidden">
    <!-- 固定顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 md:hidden">
      <div class="flex items-center justify-center p-4">
        <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">设置</h1>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 space-y-4">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-primary-100"></div>
        <div class="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p class="text-gray-600 font-medium">正在加载设置...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="p-6">
      <div class="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-red-800">加载失败</h3>
        </div>
        <p class="text-red-700 mb-4">{{ loadError }}</p>
        <button 
          @click="loadSettings"
          class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          重试
        </button>
      </div>
    </div>

    <!-- 移动端视图 (在桌面端隐藏) -->
    <div v-if="!isLoading && !loadError" class="p-6 space-y-6 md:hidden">
      <!-- 用户信息卡片 -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <User class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-1">{{ getUserDisplayName() }}</h2>
            <p class="text-primary-100">{{ accountsStore.accounts.length }} 个验证器账户</p>
          </div>
          <div class="text-right">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- 连接信息 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Server class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">连接信息</h2>
        </div>
        
        <div class="space-y-6">
          <!-- 服务器地址 -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-gray-700">
                服务器地址
              </label>
              <button @click="openEditConnection" class="text-xs text-primary-600 font-semibold hover:text-primary-700">
                修改连接
              </button>
            </div>
            <div class="relative group">
              <input
                :value="authStore.baseUrl || '未设置'"
                type="text"
                readonly
                class="w-full p-4 pr-12 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 text-sm transition-all group-hover:border-gray-300 font-medium"
              />
              <button
                @click="copyToClipboard(authStore.baseUrl)"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="复制"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- API密钥 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">
              API密钥
            </label>
            <div class="relative group">
              <input
                :value="showApiKey ? (authStore.apiKey || '未设置') : '••••••••••••••••••••••••••••••••'"
                type="text"
                readonly
                class="w-full p-4 pr-20 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 text-sm transition-all group-hover:border-gray-300 font-medium"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                <button
                  @click="showApiKey = !showApiKey"
                  class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="显示/隐藏"
                >
                  <Eye v-if="!showApiKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
                <button
                  @click="copyToClipboard(authStore.apiKey)"
                  class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="复制"
                >
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Users class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-sm text-green-700 font-medium">账户数量</p>
                  <p class="text-lg font-bold text-green-800">{{ accountsStore.accounts.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Folder class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-sm text-purple-700 font-medium">分组数量</p>
                  <p class="text-lg font-bold text-purple-800">{{ accountsStore.groups.length }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">操作</h2>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="refreshData"
            :disabled="isRefreshing"
            class="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw v-if="!isRefreshing" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{{ isRefreshing ? '刷新中...' : '刷新数据' }}</span>
          </button>

          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogOut class="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <!-- 关于信息 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
            <Info class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900">关于</h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">2FAuth 移动端</h3>
            <p class="text-sm text-gray-600 mb-1">版本 2.0.0</p>
            <p class="text-sm text-gray-500">基于 Vue3 + Tauri 构建</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端原生高级设置视图 (在移动端隐藏) -->
    <div v-if="!isLoading && !loadError" class="hidden md:flex md:max-w-7xl md:mx-auto md:h-screen w-full">
      
      <!-- 侧边栏 (透明悬浮感) -->
      <div class="w-80 flex flex-col pt-12 pb-8 px-6">
        <div class="mb-12 px-4 flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-900/20 flex-shrink-0">
            <User class="w-7 h-7 text-white" />
          </div>
          <div class="overflow-hidden">
            <h2 class="text-xl font-extrabold text-gray-900 truncate tracking-tight">{{ getUserDisplayName() }}</h2>
            <p class="text-sm font-medium text-gray-500">2FAuth 管理员</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 no-scrollbar px-2">
          <button @click="activeTab = 'account'" :class="['w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300', activeTab === 'account' ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-primary-600 scale-[1.02]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900']">
            <div :class="['p-2 rounded-xl transition-colors', activeTab === 'account' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400']">
              <User class="w-5 h-5" />
            </div>
            <span>账户与统计</span>
          </button>
          
          <button @click="activeTab = 'connection'" :class="['w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300', activeTab === 'connection' ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-primary-600 scale-[1.02]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900']">
            <div :class="['p-2 rounded-xl transition-colors', activeTab === 'connection' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400']">
              <Server class="w-5 h-5" />
            </div>
            <span>连接设置</span>
          </button>
          
          <button @click="activeTab = 'about'" :class="['w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300', activeTab === 'about' ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-primary-600 scale-[1.02]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900']">
            <div :class="['p-2 rounded-xl transition-colors', activeTab === 'about' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400']">
              <Info class="w-5 h-5" />
            </div>
            <span>关于</span>
          </button>
        </div>
      </div>

      <!-- 内容区 (毛玻璃高级卡片) -->
      <div class="flex-1 overflow-y-auto no-scrollbar py-12 px-10">
        <!-- 账户与统计 -->
        <div v-if="activeTab === 'account'" class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">账户与统计</h2>
          
          <div class="space-y-8 max-w-4xl">
            <div class="bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">数据概览</h3>
              <div class="grid grid-cols-2 gap-6">
                <div class="flex items-center space-x-5 bg-white/80 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
                    <Users class="w-7 h-7" />
                  </div>
                  <div>
                    <p class="text-3xl font-black text-gray-900">{{ accountsStore.accounts.length }}</p>
                    <p class="text-sm font-bold text-gray-400 mt-1">验证器账户</p>
                  </div>
                </div>
                <div class="flex items-center space-x-5 bg-white/80 p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                    <Folder class="w-7 h-7" />
                  </div>
                  <div>
                    <p class="text-3xl font-black text-gray-900">{{ accountsStore.groups.length }}</p>
                    <p class="text-sm font-bold text-gray-400 mt-1">文件夹</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">系统操作</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-6 bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                  <div class="flex items-center space-x-5">
                    <div class="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600"><RefreshCw class="w-6 h-6"/></div>
                    <div>
                      <p class="font-extrabold text-gray-900 text-lg">强制刷新数据</p>
                      <p class="text-sm font-medium text-gray-500 mt-1">从服务器重新拉取最新数据</p>
                    </div>
                  </div>
                  <button @click="refreshData" :disabled="isRefreshing" class="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md">
                    {{ isRefreshing ? '刷新中...' : '立即刷新' }}
                  </button>
                </div>

                <div class="flex items-center justify-between p-6 bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                  <div class="flex items-center space-x-5">
                    <div class="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center text-red-600 shadow-inner"><LogOut class="w-6 h-6"/></div>
                    <div>
                      <p class="font-extrabold text-gray-900 text-lg">退出登录</p>
                      <p class="text-sm font-medium text-gray-500 mt-1">清除本地缓存并返回登录页</p>
                    </div>
                  </div>
                  <button @click="handleLogout" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20">
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连接设置 -->
        <div v-if="activeTab === 'connection'" class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">连接设置</h2>
          
          <div class="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden max-w-4xl">
            <div class="p-8 space-y-8">
              <div class="space-y-3">
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">服务器地址</label>
                <div class="flex items-center space-x-4">
                  <input :value="authStore.baseUrl || '未设置'" readonly class="flex-1 p-4 bg-white/80 border border-white rounded-2xl text-gray-800 font-bold font-mono text-sm shadow-inner outline-none" />
                  <button @click="copyToClipboard(authStore.baseUrl)" class="p-4 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl border border-white transition-all shadow-sm hover:shadow-md hover:scale-105">
                    <Copy class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">API 密钥</label>
                <div class="flex items-center space-x-4">
                  <input :value="showApiKey ? (authStore.apiKey || '未设置') : '••••••••••••••••••••••••••••••••'" readonly type="text" class="flex-1 p-4 bg-white/80 border border-white rounded-2xl text-gray-800 font-bold font-mono text-sm tracking-widest shadow-inner outline-none" />
                  <button @click="showApiKey = !showApiKey" class="p-4 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl border border-white transition-all shadow-sm hover:shadow-md hover:scale-105">
                    <Eye v-if="!showApiKey" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                  <button @click="copyToClipboard(authStore.apiKey)" class="p-4 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white rounded-2xl border border-white transition-all shadow-sm hover:shadow-md hover:scale-105">
                    <Copy class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-6 bg-white/40 border-t border-white/50 flex justify-end">
              <button @click="openEditConnection" class="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5">
                修改连接参数
              </button>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div v-if="activeTab === 'about'" class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">关于</h2>
          
          <div class="flex flex-col items-center justify-center py-16 text-center bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-4xl relative overflow-hidden">
            <!-- 装饰性背景球 -->
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-200/50 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200/50 rounded-full blur-3xl"></div>
            
            <div class="w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-gray-900/10 mb-8 relative z-10 bg-white border border-white">
              <img src="/logo.png" alt="2FAuth Logo" class="w-full h-full object-contain rounded-[2rem] p-1" />
            </div>
            <h3 class="text-3xl font-black text-gray-900 mb-3 relative z-10">2FAuth App</h3>
            <p class="text-gray-500 mb-10 font-mono font-bold tracking-widest relative z-10">v2.0.0</p>
            
            <div class="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm text-left space-y-5 relative z-10">
              <div class="flex justify-between items-center border-b border-gray-100/50 pb-4">
                <span class="text-gray-400 font-bold uppercase text-xs tracking-wider">核心框架</span>
                <span class="font-black text-gray-800">Vue 3 + Tauri 2.0</span>
              </div>
              <div class="flex justify-between items-center border-b border-gray-100/50 pb-4">
                <span class="text-gray-400 font-bold uppercase text-xs tracking-wider">UI 引擎</span>
                <span class="font-black text-gray-800">TailwindCSS</span>
              </div>
              <div class="flex justify-between items-center border-b border-gray-100/50 pb-4">
                <span class="text-gray-400 font-bold uppercase text-xs tracking-wider">平台架构</span>
                <span class="font-black text-gray-800">Windows 原生 (WebView2)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400 font-bold uppercase text-xs tracking-wider">开源主页</span>
                <a href="#" @click.prevent="openExternalLink('https://github.com/Nostalgia546/2FAuth-app')" class="font-black text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors cursor-pointer">GitHub 项目地址</a>
              </div>
              <div class="flex justify-between items-center mt-3 border-t border-gray-100 pt-3">
                <span class="text-gray-400 font-bold uppercase text-xs tracking-wider">作者</span>
                <a href="#" @click.prevent="openExternalLink('https://github.com/Nostalgia546')" class="font-black text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors cursor-pointer">Nostalgia546</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 修改连接对话框 -->
    <div v-if="showEditConnection" class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-up">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings class="w-6 h-6 mr-2 text-primary-600" />
          修改连接设置
        </h3>
        
        <div class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">服务器地址</label>
            <input 
              v-model="editConnectionData.baseUrl" 
              type="url" 
              class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">API 密钥</label>
            <input 
              v-model="editConnectionData.apiKey" 
              type="password" 
              class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
              placeholder="令牌..."
            />
          </div>
        </div>

        <div class="flex space-x-3 mt-8">
          <button
            @click="showEditConnection = false"
            class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            取消
          </button>
          <button
            @click="saveConnection"
            :disabled="isValidating"
            class="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50"
          >
            {{ isValidating ? '验证中...' : '保存更改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAccountsStore } from '../stores/accounts'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import {
  AlertTriangle, User, Shield, Server, Copy, Eye, EyeOff,
  Users, Folder, Settings, RefreshCw, LogOut, Info
} from 'lucide-vue-next'
import BottomTabBar from '@/components/BottomTabBar.vue'
import api from '@/utils/api'

const authStore = useAuthStore()
const accountsStore = useAccountsStore()
const appStore = useAppStore()
const router = useRouter()

// 状态变量
const activeTab = ref('account')
const isLoading = ref(true)
const loadError = ref('')
const showApiKey = ref(false)
const isRefreshing = ref(false)
const showEditConnection = ref(false)
const isValidating = ref(false)
const editConnectionData = ref({
  baseUrl: '',
  apiKey: ''
})

// 复制到剪贴板
const copyToClipboard = async (text) => {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(text)
    appStore.showNotification('success', '已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    appStore.showNotification('error', '复制失败')
  }
}

// 刷新数据
const refreshData = async () => {
  if (isRefreshing.value) return
  
  try {
    isRefreshing.value = true
    await accountsStore.forceRefreshAll()
  } catch (error) {
    console.error('刷新数据失败:', error)
    appStore.showNotification('error', '刷新数据失败')
  } finally {
    isRefreshing.value = false
  }
}

// 退出登录
const openExternalLink = async (url) => {
  try {
    if (window.__TAURI_INTERNALS__) {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(url)
    } else {
      window.open(url, '_blank')
    }
  } catch (e) {
    console.error('Failed to open link:', e)
    window.open(url, '_blank')
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    accountsStore.clearAllOTPs()
    router.push('/login')
  }
}

// 修改连接设置
const openEditConnection = () => {
  editConnectionData.value = {
    baseUrl: authStore.baseUrl,
    apiKey: authStore.apiKey
  }
  showEditConnection.value = true
}

const saveConnection = async () => {
  if (!editConnectionData.value.baseUrl || !editConnectionData.value.apiKey) {
    appStore.showNotification('error', '请填写完整信息')
    return
  }

  try {
    isValidating.value = true
    // 使用新的连接信息测试登录
    await authStore.login(editConnectionData.value.baseUrl, editConnectionData.value.apiKey)
    appStore.showNotification('success', '连接配置已更新并验证成功')
    showEditConnection.value = false
    // 强制刷新数据
    await refreshData()
  } catch (error) {
    console.error('连接验证失败:', error)
    let msg = '验证失败，请检查设置是否正确'
    if (error.code === 'TIMEOUT') msg = '连接超时，请确认服务器地址正确且在线'
    if (error.code === 'INVALID_URL') msg = '服务器地址格式错误'
    appStore.showNotification('error', msg)
  } finally {
    isValidating.value = false
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      await router.push('/login')
      return
    }
    
    // 并行执行可以同时进行的操作
    const promises = []
    
    // 尝试获取用户信息（如果还没有的话）
    if (!authStore.user) {
      promises.push(
        api.get('/api/v1/user').then(response => {
          if (response.data) {
            authStore.user = response.data
            console.log('获取用户信息成功:', response.data)
          }
        }).catch(error => {
          console.warn('获取用户信息失败，使用默认显示:', error)
          // 不影响主要功能，继续执行
        })
      )
    }
    
    // 确保有账户数据（如果还没有的话）
    if (accountsStore.accounts.length === 0) {
      promises.push(accountsStore.fetchAccounts().catch(error => {
        console.warn('获取账户数据失败:', error)
      }))
    }
    
    // 并行执行所有操作
    await Promise.allSettled(promises)
    
  } catch (error) {
    console.error('加载设置失败:', error)
    loadError.value = '加载设置失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载
onMounted(() => {
  loadSettings()
})

// 获取服务器名称（从URL提取域名）
const getServerName = (url) => {
  if (!url) return '未知服务器'
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return '本地服务器'
  }
}

// 获取用户显示名称
const getUserDisplayName = () => {
  // 尝试从不同来源获取用户信息
  if (authStore.user?.name) {
    return authStore.user.name
  }
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0] // 使用邮箱前缀
  }
  if (authStore.baseUrl) {
    const serverName = getServerName(authStore.baseUrl)
    return `${serverName} 用户`
  }
  return '2FAuth 用户'
}
</script> 