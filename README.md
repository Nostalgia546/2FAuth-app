# 2FAuth 移动端管理应用

<div align="center">

![2FAuth Logo](https://img.shields.io/badge/2FAuth-Mobile%20App-blue?style=for-the-badge&logo=vue.js)

一个现代化的移动端2FAuth管理应用，基于Vue3开发，提供完整的双因子认证管理功能

[![Vue.js](https://img.shields.io/badge/Vue.js-3.0-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.0-FF6B35?style=flat-square)](https://pinia.vuejs.org/)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术架构](#-技术架构) • [使用指南](#-使用指南) • [API文档](#-api文档)

</div>

## ✨ 功能特性

### 🚀 核心功能

#### 全自动OTP管理
- **智能批量生成**: 应用启动时自动为所有账户并发生成验证码，速度提升3-5倍
- **实时自动更新**: 验证码到期时自动刷新，无需手动操作
- **全局状态管理**: OTP数据全局缓存，页面切换即时显示
- **静默生成**: 后台自动处理，不打扰用户操作

#### 智能界面交互
- **一键复制**: 点击整个账户卡片即可复制验证码
- **固定顶栏**: 滚动时顶部导航始终可见
- **触摸反馈**: 专为移动端优化的交互动画
- **智能图标**: 优先显示真实账户图标，自动回退到彩色首字母

### 📱 移动端优化

#### 响应式设计
- **原生级体验**: 专为移动设备设计的界面布局
- **触摸友好**: 大按钮、易点击的交互区域
- **手势支持**: 支持下拉刷新、侧滑导航等移动端手势
- **适配完美**: 支持各种屏幕尺寸和分辨率

#### 性能优化
- **并发请求**: 批量API调用，减少网络延迟
- **智能缓存**: 避免重复请求，提升响应速度
- **懒加载**: 按需加载组件和资源
- **内存优化**: 高效的状态管理和垃圾回收

### 🔐 安全特性

#### 数据保护
- **安全存储**: API密钥本地加密存储
- **Bearer认证**: 标准OAuth2.0认证流程
- **HTTPS传输**: 所有数据加密传输
- **会话管理**: 自动登出和会话过期处理

#### 隐私保护
- **本地处理**: 验证码仅在内存中处理，不持久化
- **权限最小化**: 仅请求必要的系统权限
- **透明操作**: 所有网络请求都有明确的用途说明

### 🎨 用户体验

#### 现代化界面
- **Material Design**: 遵循现代设计原则
- **深色模式**: 支持系统主题切换
- **流畅动画**: 自然的过渡效果和微交互
- **直观导航**: 清晰的信息架构和导航结构

#### 智能功能
- **搜索筛选**: 快速查找特定账户
- **分组管理**: 按服务类型或用途分组
- **批量操作**: 支持多选和批量管理
- **自动备份**: 数据导入导出功能

## 🛠 技术架构

### 前端技术栈

```
Vue 3.4+          现代化响应式框架
├── Composition API   组合式API，更好的逻辑复用
├── TypeScript       类型安全，减少运行时错误
└── Vue Router 4     单页面应用路由管理

Vite 4.5+         极速构建工具
├── HMR              热模块替换，开发体验优异
├── Tree Shaking     按需打包，减小体积
└── Plugin System    丰富的插件生态

Pinia 2.1+        状态管理
├── TypeScript       完整类型支持
├── DevTools         开发者工具集成
└── SSR Support      服务端渲染支持

Tailwind CSS 3.3+ 原子化CSS框架
├── JIT Mode         即时编译，按需生成
├── Dark Mode        深色模式支持
└── Mobile First     移动端优先设计
```

### 项目结构

```
src/
├── components/          可复用组件
│   ├── AccountIcon.vue     智能图标组件
│   └── ...
├── views/              页面组件
│   ├── Dashboard.vue      主控制面板
│   ├── Accounts.vue       账户管理
│   ├── Login.vue          用户登录
│   ├── Settings.vue       系统设置
│   └── ...
├── stores/             状态管理
│   ├── auth.js            认证管理
│   ├── accounts.js        账户和OTP管理
│   ├── app.js             全局状态
│   └── ...
├── router/             路由配置
├── utils/              工具函数
│   ├── api.js             API客户端
│   └── ...
└── assets/             静态资源
```

### 核心架构设计

#### 全局OTP管理系统
```javascript
// 高性能并发OTP生成
const generateAllOTPs = async (accountIds = null) => {
  const otpPromises = targetAccounts.map(async (accountId) => {
    return await generateOTP(accountId) // 并发执行
  })
  return await Promise.all(otpPromises) // 等待所有完成
}

// 智能自动更新机制
const startOTPTimer = () => {
  setInterval(async () => {
    updateOTPTimers()           // 更新倒计时
    await refreshExpiredOTPs()  // 刷新过期OTP
  }, 1000)
}
```

#### 响应式状态管理
```javascript
// Pinia Store with TypeScript
export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const otpData = ref({})
  const isGeneratingOTP = ref(false)
  
  // 计算属性自动更新UI
  const filteredAccounts = computed(() => {
    return accounts.value.filter(/* 筛选逻辑 */)
  })
  
  return { accounts, otpData, filteredAccounts }
})
```

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0
- **2FAuth服务器**: >= 1.7.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Nostalgia546/2FAuth-app.git
   cd 2fauth-mobile-app
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 yarn
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或使用 yarn
   yarn dev
   ```

4. **访问应用**
   ```
   打开浏览器访问: http://localhost:5173
   ```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 静态部署
# 将 dist/ 目录部署到任何静态文件服务器
```

## 📖 使用指南

### 初次配置

1. **连接2FAuth服务器**
   - 打开应用，进入登录页面
   - 输入2FAuth服务器地址（如：`https://your-2fauth.com`）
   - 输入API密钥（在2FAuth设置中生成）

2. **验证连接**
   - 应用会自动测试API连接
   - 成功后显示账户列表

### 主要功能使用

#### Dashboard 主控制面板
- **自动验证码**: 页面自动显示所有账户的当前验证码
- **一键复制**: 点击任意账户卡片复制验证码
- **实时更新**: 验证码自动刷新，显示剩余时间
- **分组筛选**: 快速切换不同账户分组

#### Accounts 账户管理
- **详细信息**: 查看账户完整信息
- **搜索功能**: 按服务名或账户名搜索
- **批量操作**: 选择多个账户进行批量管理
- **编辑删除**: 修改账户信息或删除账户

#### 添加新账户
- **QR码扫描**: 使用摄像头扫描二维码
- **手动添加**: 输入密钥和相关信息
- **预览验证**: 添加前预览验证码

#### 设置管理
- **用户偏好**: 个性化设置
- **数据管理**: 导入导出账户数据
- **系统设置**: 应用行为配置

## 🔌 API文档

### 认证配置

```javascript
// API基础配置
const apiConfig = {
  baseURL: 'https://your-2fauth.com',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
}
```

### 主要端点

#### 账户管理
```javascript
// 获取账户列表
GET /api/v1/twofaccounts

// 获取单个账户
GET /api/v1/twofaccounts/{id}

// 创建账户
POST /api/v1/twofaccounts

// 更新账户
PUT /api/v1/twofaccounts/{id}

// 删除账户
DELETE /api/v1/twofaccounts/{id}
```

#### OTP生成
```javascript
// 生成单个OTP
GET /api/v1/twofaccounts/{id}/otp

// 批量生成OTP (如果支持)
POST /api/v1/twofaccounts/otp
{
  "ids": [1, 2, 3]
}
```

#### 分组管理
```javascript
// 获取分组列表
GET /api/v1/groups

// 创建分组
POST /api/v1/groups

// 分配账户到分组
POST /api/v1/groups/{id}/assign
```

## 🎯 性能优化

### 网络优化
- **请求合并**: 批量API调用减少网络往返
- **智能重试**: 网络失败时自动重试机制
- **缓存策略**: 合理使用本地存储和内存缓存
- **预加载**: 预测用户需求，提前加载数据

### 渲染优化
- **虚拟滚动**: 大列表性能优化
- **懒加载**: 组件和图片按需加载
- **防抖优化**: 搜索和筛选操作防抖处理
- **内存管理**: 及时清理不需要的数据

### 用户体验优化
- **骨架屏**: 数据加载时的占位效果
- **渐进增强**: 核心功能优先，增强功能逐步加载
- **离线支持**: 基础功能离线可用
- **错误恢复**: 优雅的错误处理和恢复机制

## 🔒 安全考虑

### 数据安全
- **加密存储**: 敏感数据本地加密存储
- **传输安全**: 强制HTTPS传输
- **权限控制**: 最小权限原则
- **数据清理**: 应用关闭时清理敏感数据

### 隐私保护
- **本地处理**: 验证码计算尽可能本地化
- **数据最小化**: 只收集必要的数据
- **透明度**: 清晰的隐私政策和数据使用说明
- **用户控制**: 用户完全控制自己的数据

## 🤝 贡献指南

### 开发环境设置

1. **Fork项目** 到你的GitHub账户
2. **克隆Fork** 的仓库到本地
3. **创建分支** 进行功能开发
4. **遵循规范** 代码风格和提交规范
5. **测试验证** 确保功能正常工作
6. **提交PR** 详细描述改动内容

### 代码规范

- **ESLint**: 使用项目配置的ESLint规则
- **Prettier**: 统一代码格式化
- **TypeScript**: 类型安全编程
- **单元测试**: 为核心功能编写测试

### 提交规范

```bash
# 功能添加
git commit -m "feat: 添加批量账户导入功能"

# 问题修复  
git commit -m "fix: 修复OTP倒计时显示错误"

# 文档更新
git commit -m "docs: 更新API使用说明"

# 性能优化
git commit -m "perf: 优化账户列表渲染性能"
```

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Pinia](https://pinia.vuejs.org/) - Vue的状态管理库
- [2FAuth](https://github.com/Bubka/2FAuth) - 原版2FAuth项目
- [Lucide](https://lucide.dev/) - 美观的图标库

## 📞 支持与反馈

- **问题报告**: [GitHub Issues](https://github.com/your-username/2fauth-mobile-app/issues)
- **功能建议**: [GitHub Discussions](https://github.com/your-username/2fauth-mobile-app/discussions)
- **安全问题**: 发送邮件到 security@example.com

---

<div align="center">

**[⬆ 回到顶部](#2fauth-移动端管理应用)**

Made with ❤️ for the 2FAuth community

</div> 