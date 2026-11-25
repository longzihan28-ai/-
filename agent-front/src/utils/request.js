import axios from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'ticket_token'
const USER_KEY = 'ticket_user'

const request = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 清除本地登录状态
export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 认证参数 —— 从 localStorage 读取 token
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    const data = response.data
    // 判断业务状态码是否为 200
    if (data.code === 200) {
      return data.data
    }
    ElMessage.error(data.msg || '请求失败')
    return Promise.reject(new Error(data.msg || '请求失败'))
  },
  function (error) {
    const status = error.response?.status
    const msg = error.response?.data?.msg

    if (status === 401) {
      clearLogin()
      ElMessage.error(msg || '登录过期，请重新登录')
      import('../router').then((r) => {
        if (r.default.currentRoute.value.path !== '/login') {
          r.default.push('/login')
        }
      })
    } else {
      ElMessage.error(msg || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default request
