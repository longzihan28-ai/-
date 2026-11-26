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

// 工单列表接口 —— 对应后端 GET /api/ticket
export function listTickets(params: TicketQuery): Promise<TicketPage> {
  return request.get<TicketPage>('/ticket', { params })
}
