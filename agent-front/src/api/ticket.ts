import request from '../utils/request'

export interface TicketQuery {
  page: number
  size: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface TicketItem {
  id: number
  title: string
  faultType?: string
  status: string
  createTime: string
}

export interface TicketPage {
  list: TicketItem[]
  total: number
}

export interface CreateTicketParams {
  title: string
  description: string
  faultType?: string
}

// 工单详情：相似工单/知识以 JSON 字符串返回
export interface TicketDetail extends TicketItem {
  description?: string
  aiSuggestion?: string
  similarTickets?: string
  similarKnowledge?: string
  resolution?: string
  submitterId?: number
}

export interface UpdateTicketParams {
  status?: string
  resolution?: string
}

// 工单列表 —— 对应后端 GET /api/ticket
export function listTickets(params: TicketQuery): Promise<TicketPage> {
  return request.get<TicketPage>('/ticket', { params })
}

// 提交工单 —— 对应后端 POST /api/ticket
export function submitTicket(data: CreateTicketParams): Promise<TicketItem> {
  return request.post<TicketItem>('/ticket', data)
}

// 工单详情 —— 对应后端 GET /api/ticket/{id}
export function getTicket(id: number): Promise<TicketDetail> {
  return request.get<TicketDetail>(`/ticket/${id}`)
}

// 更新工单 —— 对应后端 PUT /api/ticket/{id}
export function updateTicket(id: number, data: UpdateTicketParams): Promise<TicketDetail> {
  return request.put<TicketDetail>(`/ticket/${id}`, data)
}
