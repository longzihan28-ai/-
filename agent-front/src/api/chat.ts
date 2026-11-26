import request from '../utils/request'

// 单次工具调用记录
export interface ChatToolCall {
  tool: string
  args?: unknown
  result_preview?: unknown
  needs_confirm?: boolean
  success?: boolean
}

// 对话请求参数
export interface ChatParams {
  sessionId: string
  message: string
}

// 对话响应
export interface ChatResult {
  replay?: string
  tool_calls?: ChatToolCall[]
  finished?: boolean
}

// 对话接口 —— 对应后端 POST /api/chat
export function chat(data: ChatParams): Promise<ChatResult> {
  return request.post<ChatResult>('/chat', data)
}
