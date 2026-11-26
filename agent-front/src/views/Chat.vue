<template>
  <el-card
    style="height: calc(100vh - 96px)"
    :body-style="{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }"
  >
    <!-- 顶部 -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="margin:0">💬 AI 助手</h2>
      <div>
        <el-tag size="small" type="info" style="margin-right:8px">session: {{ sessionId ? sessionId.slice(-6) : '-' }}</el-tag>
        <el-button size="small" @click="newSession">+ 新建会话</el-button>
      </div>
    </div>

    <!-- 对话区 -->
    <div ref="scrollRef" class="chat-body">
      <!-- 快捷能力卡片（只在欢迎语后展示一次） -->
      <div v-if="messages.length === 1" class="quick-actions">
        <div
          v-for="(q, i) in quickActions"
          :key="i"
          class="quick-card"
          :style="{ borderColor: q.color }"
          @click="fillExample(q.example)"
        >
          <div class="quick-emoji" :style="{ background: q.color }">{{ q.emoji }}</div>
          <div class="quick-body">
            <div class="quick-name" :style="{ color: q.color }">{{ q.name }}</div>
            <div class="quick-example">{{ q.example }}</div>
          </div>
        </div>
      </div>

      <div v-for="(m, idx) in messages" :key="idx" :class="['msg', m.role]">
        <div class="bubble">
          <!-- 用户气泡：只显示文字 -->
          <div v-if="m.role === 'user'" class="content">{{ m.content }}</div>
          <div v-else>
            <!-- AI 工具调用链 -->
            <div v-if="m.toolCalls.length">
              <div class="chain-header">
                <span class="chain-icon">📎</span>
                <span>调用了<b>{{ m.toolCalls.length }}</b>个工具</span>
                <el-tag size="small" :type="m.finished ? 'success' : 'warning'" style="margin-left:8px">
                  {{ m.finished ? '已完成' : '中断' }}
                </el-tag>
              </div>
              <div class="step-list">
                <div
                  v-for="(tc, i) in m.toolCalls"
                  :key="i"
                  :class="['step', 'step-' + stepType(tc)]"
                >
                  <div class="step-marker">
                    <div class="step-num">{{ i + 1 }}</div>
                    <div v-if="i < m.toolCalls.length - 1" class="step-line"></div>
                  </div>
                  <div class="step-body">
                    <div class="step-title">
                      <div class="step-emoji">{{ toolEmoji(tc.tool) }}</div>
                      <div class="step-name">{{ toolDisplayName(tc.tool) }}</div>
                      <code class="step-tool-raw" :title="'原始工具名：' + tc.tool">{{ tc.tool }}</code>
                      <el-tag v-if="tc.needs_confirm" size="small" type="warning" effect="dark">写操作</el-tag>
                      <el-tag v-else size="small" type="info" effect="dark">只读</el-tag>
                    </div>
                    <el-collapse v-model="tc._open" class="step-collapse">
                      <el-collapse-item title="参数与返回值" name="data">
                        <div class="kv">
                          <div class="kv-label">入参</div>
                          <pre class="kv-val">{{ formatJson(tc.args) }}</pre>
                        </div>
                        <div class="kv">
                          <div class="kv-label">返回：</div>
                          <pre class="kv-val">{{ formatJson(tc.result_preview) }}</pre>
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI 最终回复 -->
            <div v-if="m.content" class="content final-answer">
              <el-divider style="margin: 8px 0"><span style="color:#999;font-size:12px">AI 回复</span></el-divider>
              {{ m.content }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="msg assistant">
        <div class="bubble loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span style="margin-left:6px">AI 正在思考与调用工具…</span>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input">
      <el-input
        v-model="input"
        type="textarea"
        :rows="2"
        placeholder="试试：今天有哪些工单？/ 工单 #3 怎么处理的？/ 帮我新建一个网络故障工单"
        @keydown.enter.exact.prevent="onSend"
      />
      <el-button type="primary" :loading="loading" @click="onSend">发送</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { chat, type ChatToolCall } from '../api/chat'

// 工具调用（带折叠面板展开态）
interface ToolCallView extends ChatToolCall {
  _open: string[]
}

// 单条消息
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  toolCalls: ToolCallView[]
  finished?: boolean
}

const WELCOME = '你好！我是 IT 运维 AI 助手，点击下方能力卡片直接体验，或输入问题与我对话：'

const input = ref('')
const messages = ref<ChatMessage[]>([{ role: 'assistant', content: WELCOME, toolCalls: [] }])
const loading = ref(false)
const scrollRef = ref<HTMLElement | null>(null)

// 会话 id
const sessionId = ref('sess-' + Date.now() + '-' + Math.floor(Math.random() * 1000))

// 快捷能力卡片
const quickActions = [
  { emoji: '📄', name: '查询工单', example: '今天有哪些待处理的网络工单？', color: '#409eff' },
  { emoji: '✏️', name: '创建工单', example: '我电脑开不了机，帮我报个硬件故障', color: '#e6a23c' },
  { emoji: '🔄', name: '更新工单', example: '把工单 #3 标为已解决，重启路由好了', color: '#67c23a' },
  { emoji: '📚', name: '检索知识', example: '笔记本电池不充电怎么排查？', color: '#909399' }
]

const stepType = (tc: ChatToolCall) => (tc.needs_confirm ? 'warning' : 'primary')

const TOOL_EMOJI: Record<string, string> = {
  list_tickets: '📄',
  get_ticket_detail: '🔍',
  create_ticket: '✏️',
  update_ticket: '🔄',
  query_knowledge: '📚',
  query_history_tickets: '🔁'
}
const toolEmoji = (name: string) => TOOL_EMOJI[name] || '🔧'

const TOOL_DISPLAY: Record<string, string> = {
  list_tickets: '查询工单列表',
  get_ticket_detail: '查询工单详情',
  create_ticket: '创建工单',
  update_ticket: '更新工单',
  query_knowledge: '检索知识库',
  query_history_tickets: '检索历史相似工单'
}
const toolDisplayName = (name: string) => TOOL_DISPLAY[name] || name

const formatJson = (v: unknown): string => {
  if (v == null) return '（空）'
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v, null, 2)
    } catch {
      return String(v)
    }
  }
  const s = String(v)
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try {
      return JSON.stringify(JSON.parse(s), null, 2)
    } catch {
      /* 非 JSON，按原文返回 */
    }
  }
  return s
}

// 点击快捷卡片：填入输入框并聚焦
const fillExample = (text: string) => {
  input.value = text
  nextTick(() => {
    const el = document.querySelector<HTMLTextAreaElement>('.chat-input .el-textarea textarea')
    el?.focus()
  })
}

// 新建会话：重置消息与 sessionId
const newSession = () => {
  messages.value = [{ role: 'assistant', content: WELCOME, toolCalls: [] }]
  sessionId.value = 'sess-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
  scrollBottom()
}

const scrollBottom = () => {
  nextTick(() => {
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  })
}

// 发送消息
const onSend = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return
  if (!sessionId.value) return

  messages.value.push({ role: 'user', content: text, toolCalls: [] })
  input.value = ''
  loading.value = true
  scrollBottom()

  try {
    const res = await chat({ sessionId: sessionId.value, message: text })
    messages.value.push({
      role: 'assistant',
      content: res.reply ?? res.replay ?? '',
      toolCalls: dedupeToolCalls(res.toolCalls ?? res.tool_calls ?? []),
      finished: res.finished
    })
  } catch {
    // 错误提示由 request.ts 统一处理
  } finally {
    loading.value = false
    scrollBottom()
  }
}

// 同一工具多次调用只保留最后一条（成功优先），并初始化折叠态
const dedupeToolCalls = (calls: ChatToolCall[]): ToolCallView[] => {
  if (!calls || !calls.length) return []
  const byTool: Record<string, ChatToolCall> = {}
  for (const tc of calls) byTool[tc.tool] = tc
  const result: ToolCallView[] = []
  for (const tool of Object.keys(byTool)) {
    const allOfTool = calls.filter(t => t.tool === tool)
    const successes = allOfTool.filter(t => t.success === true)
    const picked = successes.length
      ? { ...successes[successes.length - 1], success: true }
      : { ...allOfTool[allOfTool.length - 1], success: false }
    result.push({ ...picked, _open: [] })
  }
  return result
}
</script>

<style scoped>
.chat-body {
  flex: 1; overflow-y: auto; padding: 16px;
  background: #f5f7fa; border-radius: 4px;
}
.msg { display: flex; margin-bottom: 14px; }
.msg.user { justify-content: flex-end; }
.msg.assistant { justify-content: flex-start; }
.bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 10px;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  word-break: break-word; line-height: 1.6;
}
.msg.user .bubble { background: #409eff; color: #fff; }
.bubble.loading { color: #888; font-style: italic; }
.content { white-space: pre-wrap; }

/* ========== 快捷能力卡片 ========== */
.quick-actions {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; margin: 12px 0;
}
.quick-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #fff; border: 1px solid #e4e7ed;
  border-left: 4px solid #409eff;
  border-radius: 8px; cursor: pointer;
  transition: all 0.2s;
}
.quick-card:hover {
  background: #f5f7fa; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.quick-emoji {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: #fff; flex-shrink: 0;
}
.quick-body { flex: 1; min-width: 0; }
.quick-name { font-size: 13px; font-weight: 600; }
.quick-example {
  font-size: 11px; color: #909399; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ========== 工具链样式 ========== */
.chain {
  margin-bottom: 10px; padding: 10px 12px;
  background: #f0f4fa;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}
.chain-header {
  display: flex; align-items: center; font-size: 13px;
  color: #606266; font-weight: 600; margin-bottom: 10px;
}
.chain-icon { font-size: 16px; margin-right: 4px; }

/* 步骤列表（CSS 时间线，零依赖） */
.step-list { padding-left: 4px; }
.step { display: flex; margin-bottom: 8px; }
.step:last-child .step-line { display: none; }

.step-marker {
  position: relative; width: 32px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
}
.step-num {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: #fff;
  background: #409eff;
}
.step-primary .step-num { background: #409eff; }
.step-warning .step-num { background: #e6a23c; }
.step-success .step-num { background: #67c23a; }
.step-info .step-num { background: #909399; }

.step-line {
  width: 2px; flex: 1; min-height: 12px;
  background: #dcdfe6; margin-top: 2px;
}

.step-body {
  flex: 1; background: #fff; border: 1px solid #e4e7ed;
  border-radius: 6px; padding: 8px 10px; margin-left: 6px;
  border-left: 3px solid #409eff;
}
.step-warning .step-body { border-left-color: #e6a23c; }
.step-success .step-body { border-left-color: #67c23a; }
.step-info .step-body { border-left-color: #909399; }

.step-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500;
}
.step-emoji { font-size: 16px; }
.step-name { color: #303133; }
.step-tool-raw {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 11px; color: #909399;
  background: #f5f7fa; border: 1px solid #e4e7ed;
  padding: 0 6px; border-radius: 3px; line-height: 18px;
}

.step-collapse { margin-top: 6px; }
.step-collapse :deep(.el-collapse-item__header) {
  background: transparent; border: none;
  font-size: 12px; color: #909399; padding-left: 0;
  min-height: 32px;
}
.step-collapse :deep(.el-collapse-item__wrap) { border: none; }

.kv { margin: 4px 0; }
.kv-label { font-size: 12px; color: #909399; margin-bottom: 2px; }
.kv-val {
  font-family: Menlo, Monaco, Consolas, monospace;
  font-size: 12px; color: #303133;
  background: #f5f7fa; padding: 6px 8px;
  border-radius: 4px; max-height: 200px; overflow: auto;
  margin: 0; white-space: pre-wrap;
}

.final-answer { font-size: 14px; color: #303133; }

.chat-input { display: flex; gap: 8px; margin-top: 12px; align-items: flex-end; }
.chat-input .el-textarea { flex: 1; }
</style>
