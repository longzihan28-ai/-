<template>
  <el-card>
    <!-- 页面标题与说明 -->
    <h2>提交工单</h2>
    <p style="color:#888">提交后 AI Agent 会自动分析你的故障描述，并返回建议与相似历史工单</p>

    <!-- 工单表单 -->
    <el-form :model="form" label-width="100px" style="max-width:760px;margin-top:24px" v-loading="loading">
      <el-form-item label="故障类型">
        <el-select v-model="form.faultType" placeholder="若不确定可不选，AI 会自动识别" style="width:100%">
          <el-option label="网络" value="network" />
          <el-option label="硬件" value="hardware" />
          <el-option label="软件" value="software" />
          <el-option label="账号" value="account" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="如：电脑无法连接公司内网" />
      </el-form-item>
      <el-form-item label="故障描述" required>
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="6"
          placeholder="详细描述现象、出现时间、已尝试的操作"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">提交并让 AI 分析</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- AI 分析结果 -->
    <el-divider v-if="result" />
    <div v-if="result">
      <h3>🤖 AI 分析结果</h3>
      <p>故障类型：<el-tag>{{ result.fault_type }}</el-tag></p>
      <p>初步建议：</p>
      <el-alert :title="result.suggestion" type="info" :closable="false" show-icon />

      <h4 style="margin-top:20px">📎 相似历史工单</h4>
      <el-table v-if="result.similar_tickets.length" :data="result.similar_tickets" border size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容片段" show-overflow-tooltip />
        <el-table-column prop="score" label="相似度" width="100" />
      </el-table>
      <el-empty v-else description="暂无相似历史工单" :image-size="60" />

      <h4 style="margin-top:20px">📚 知识库参考</h4>
      <el-table v-if="result.similar_knowledge.length" :data="result.similar_knowledge" border size="small">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容片段" show-overflow-tooltip />
        <el-table-column prop="score" label="相似度" width="100" />
      </el-table>
      <el-empty v-else description="暂无知识库命中" :image-size="60" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { submitTicket, getTicket } from '../api/ticket'

// 表单数据，初始为空以展示 placeholder
const form = ref({
  title: '',
  description: '',
  faultType: ''
})

// 提交中状态（演示数据，无需异步等待）
const loading = ref(false)

// AI 分析结果，初始为空时不渲染结果区
const result = ref<{
  fault_type: string
  suggestion: string
  similar_tickets: { id: number; title: string; content: string; score: number }[]
  similar_knowledge: { title: string; content: string; score: number }[]
} | null>(null)

// 后端 AI 建议带外层引号，展示前去掉
const stripQuotes = (s?: string) => (s || '').replace(/^"|"$/g, '')

// 相似工单 / 知识以 JSON 字符串返回，解析失败时返回空数组
const parseList = <T,>(s?: string): T[] => {
  try {
    const v = JSON.parse(s || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

// 提交：校验必填 → 提交工单 → 拉取详情 → 展示 AI 分析结果
const onSubmit = async () => {
  if (!form.value.title || !form.value.description) {
    ElMessage.warning('请填写完整')
    return
  }

  loading.value = true
  try {
    const ticket = await submitTicket(form.value)
    const detail = await getTicket(ticket.id)

    result.value = {
      fault_type: detail.faultType || '-',
      suggestion: stripQuotes(detail.aiSuggestion),
      similar_tickets: parseList(detail.similarTickets),
      similar_knowledge: parseList(detail.similarKnowledge)
    }
    ElMessage.success('工单已提交，工单号 #' + ticket.id)
  } catch {
    // 失败提示由 request.ts 响应拦截器统一处理
  } finally {
    loading.value = false
  }
}

// 重置表单，保留结果区
const onReset = () => {
  form.value = { title: '', description: '', faultType: '' }
}
</script>
