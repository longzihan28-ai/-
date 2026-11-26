import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'ticket_token'
const USER_KEY = 'ticket_user'

// 后端统一响应结构
interface ApiResult<T = unknown> {
  code: number
  msg: string
  data: T
}

const service = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 清除本地登录状态
export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// 请求拦截器：自动携带 token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：code=200 时解包 data，其余统一提示
service.interceptors.response.use(
  // 返回值已解包为业务 data，与 axios 原始 AxiosResponse 类型不同，故显式放宽
  (response): any => {
    const res = response.data as ApiResult
    if (res.code === 200) {
      return res.data
    }
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || '请求失败'))
  },
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.msg

    if (status === 401) {
      clearLogin()
      ElMessage.error(msg || '登录过期，请重新登录')
      // 动态引入 router，避免与 router → Login → api 形成循环依赖
      import('../router').then(({ default: router }) => {
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
      })
    } else {
      ElMessage.error(msg || '网络异常')
    }
    return Promise.reject(error)
  }
)

// 拦截器已把响应体解包为 data，这里按解包后的形态暴露方法
interface HttpClient {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export default service as unknown as HttpClient
