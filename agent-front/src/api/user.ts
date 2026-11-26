import request from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  id: number
  username: string
  realName: string
  role: string
  token: string
}

// 登录接口 —— 对应后端 POST /api/user/login
export function login(data: LoginParams): Promise<LoginResult> {
  return request.post<LoginResult>('/user/login', data)
}
