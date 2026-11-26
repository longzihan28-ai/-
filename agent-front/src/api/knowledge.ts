import request from '../utils/request'

export interface Knowledge {
  id: number
  title: string
  category?: string
  content: string
  createTime: string
}

export interface AddKnowledgeParams {
  title: string
  category?: string
  content: string
}

// 知识库列表 —— 对应后端 GET /api/knowledge
export function listKnowledge(): Promise<Knowledge[]> {
  return request.get<Knowledge[]>('/knowledge')
}

// 新增知识 —— 对应后端 POST /api/knowledge
export function addKnowledge(data: AddKnowledgeParams): Promise<Knowledge> {
  return request.post<Knowledge>('/knowledge', data)
}

// 删除知识 —— 对应后端 DELETE /api/knowledge/{id}
export function deleteKnowledge(id: number): Promise<void> {
  return request.delete<void>(`/knowledge/${id}`)
}
