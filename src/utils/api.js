import axios from 'axios'

const api = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加基础URL
    const baseUrl = localStorage.getItem('2fauth_base_url')
    if (baseUrl && !config.url.startsWith('http')) {
      config.baseURL = baseUrl
    }

    // 添加认证头
    const apiKey = localStorage.getItem('2fauth_api_key')
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
    }

    // 请求日志
    console.log('API请求:', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      hasAuth: !!config.headers.Authorization
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response

      console.error('API错误响应:', {
        status,
        url: error.config?.url,
        data
      })

      if (status === 401) {
        // 未授权，跳转到登录页
        localStorage.removeItem('2fauth_api_key')
        localStorage.removeItem('2fauth_base_url')
        window.location.href = '/login'
      } else if (status === 422) {
        // 验证错误
        console.error('验证错误:', data)
      } else if (status >= 500) {
        // 服务器错误
        console.error('服务器错误:', data)
      }
    } else if (error.request) {
      // 网络错误
      console.error('网络错误:', error.message)
    } else {
      // 其他错误
      console.error('请求错误:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api 