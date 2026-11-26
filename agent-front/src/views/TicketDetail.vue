<template>
  <el-card v-loading="loading">
    <div v-if="ticket">
      <!-- 返回行：返回箭头 + 工单标题 -->
      <el-page-header style="margin-bottom:16px" @back="$router.back()">
        <template #content>
          <span style="font-size:18px;font-weight:600">工单 #{{ ticket.id }} - {{ ticket.title }}</span>
        </template>
      </el-page-header>

      <!-- 基本信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="故障类型">
          <el-tag>{{ categoryLabel[ticket.faultType] || ticket.faultType || '未识别' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-select v-if="isAdmin" v-model="ticket.status" style="width:100%" @change="onSave">
            <el-option label="待处理" value="PENDING" />
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已解决" value="RESOLVED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
          <el-tag v-else :type="statusTag[ticket.status]">{{ statusLabel[ticket.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交人ID">{{ ticket.submitterId }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ ticket.createTime }}</el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">{{ ticket.description }}</el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2">
          <el-input
            v-if="isAdmin"
            v-model="ticket.resolution"
            type="textarea"
            :rows="3"
            placeholder="请填写处理结果"
            @change="onSave"
          />
          <span v-else>{{ ticket.resolution || '未填写' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <!-- AI 初步建议 -->
      <h3>🤖 AI 初步建议</h3>
      <el-alert
        v-if="ticket.aiSuggestion"
        :title="ticket.aiSuggestion"
        type="info"
        :closable="false"
        show-icon
      />

      <!-- 相似历史工单 -->
      <h3 style="margin-top:24px">📎 相似历史工单</h3>
      <template v-if="similarTickets.length">
        <el-card
          v-for="s in similarTickets"
          :key="'t-' + s.id"
          shadow="never"
          style="margin-bottom:8px"
        >
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:600">#{{ s.id }} {{ s.title }}</div>
            <el-tag size="small" type="warning">相似度 {{ s.score }}</el-tag>
          </div>
          <div style="color:#666;margin-top:6px;line-height:1.6">{{ s.content }}</div>
        </el-card>
      </template>
      <el-empty v-else description="暂无相似历史工单（可多提交几条工单试试）" :image-size="80" />

      <!-- 知识库参考 -->
      <h3 style="margin-top:24px">📚 知识库参考</h3>
      <template v-if="similarKnowledge.length">
        <el-card
          v-for="s in similarKnowledge"
          :key="'k-' + s.id"
          shadow="never"
          style="margin-bottom:8px"
        >
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:600">#{{ s.id }} {{ s.title }}</div>
            <el-tag size="small" type="success">相似度 {{ s.score }}</el-tag>
          </div>
          <div style="color:#666;margin-top:6px;line-height:1.6;white-space:pre-line">{{ s.content }}</div>
        </el-card>
      </template>
      <el-empty v-else description="暂无知识库命中" :image-size="80" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

// 状态/分类 中文映射
const statusLabel: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭'
}

const statusTag: Record<string, 'warning' | 'primary' | 'success' | 'info'> = {
  PENDING: 'warning',
  PROCESSING: 'primary',
  RESOLVED: 'success',
  CLOSED: 'info'
}

const categoryLabel: Record<string, string> = {
  network: '网络',
  hardware: '硬件',
  software: '软件',
  account: '账号'
}

// 管理员视角（演示写死）
const isAdmin = computed(() => true)

// 工单类型（与后端接口对齐，similarTickets/similarKnowledge 后端返回 JSON 字符串）
interface Ticket {
  id: number
  title: string
  faultType: string
  status: string
  submitterId: number
  createTime: string
  description: string
  resolution: string
  aiSuggestion: string
  similarTickets: string
  similarKnowledge: string
}

// 演示数据写死，不调用接口、不读取路由与 localStorage
const ticket = ref<Ticket>({
  id: 6,
  title: '浏览器网页打不开/报错',
  faultType: 'software',
  status: 'PENDING',
  submitterId: 1,
  createTime: '2026-10-23T13:53:27',
  description: '用户反馈打开浏览器后大部分网页无法正常加载，部分页面显示空白或"连接超时"提示。已尝试清除浏览器缓存和重启浏览器，问题依旧存在。涉及 Chrome 和 Edge 两个浏览器。',
  resolution: '',
  aiSuggestion: '根据故障描述，疑似网络 DNS 解析或浏览器代理设置异常。建议排查：1) 检查系统代理设置是否被意外修改；2) 使用 ipconfig /flushdns 刷新 DNS 缓存；3) 测试不同网络环境（手机热点）是否仍有问题，以区分是本机还是网络侧问题。',
  similarTickets: JSON.stringify([
    { id: 3, title: 'Chrome 打开页面一直转圈', score: 0.542357987322083, content: 'Chrome 浏览器打开任何网站都一直转圈，无法加载。重启后短暂恢复，几分钟后再次出现。' }
  ]),
  similarKnowledge: JSON.stringify([])
})

// 加载状态恒为 false（演示数据不需要加载）
const loading = ref(false)

// 相似工单：后端以 JSON 字符串返回，解析失败时返回空数组
const similarTickets = computed(() => {
  try {
    return JSON.parse(ticket.value.similarTickets) || []
  } catch {
    return []
  }
})

// 相似知识：后端以 JSON 字符串返回，解析失败时返回空数组
const similarKnowledge = computed(() => {
  try {
    return JSON.parse(ticket.value.similarKnowledge) || []
  } catch {
    return []
  }
})

// 保存：演示数据写死，不调用接口
const onSave = () => {
  ElMessage.success('已保存')
}
</script>
