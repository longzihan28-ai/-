<template>
  <el-card>
    <!-- 标题行：页面标题 + 新建工单 -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">工单列表</h2>
      <el-button type="primary">+ 新建工单</el-button>
    </div>

    <!-- 搜索条件：状态 + 提交时间范围 -->
    <el-form :inline="true" :model="query" class="search-bar">
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width:160px">
          <el-option label="待处理" value="PENDING" />
          <el-option label="处理中" value="PROCESSING" />
          <el-option label="已解决" value="RESOLVED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>
      </el-form-item>
      <el-form-item label="提交时间">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width:260px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工单列表表格 -->
    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.faultType" size="small">{{ row.faultType }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTag[row.status]" size="small">{{ statusLabel[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="$router.push('/ticket/' + row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      :total="total"
      style="margin-top:16px"
      @size-change="onSearch"
      @current-change="load"
    />
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { listTickets, type TicketItem } from '../api/ticket'

// 状态文本映射
const statusLabel: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭'
}

// 状态标签颜色映射
const statusTag: Record<string, 'warning' | 'primary' | 'success' | 'info'> = {
  PENDING: 'warning',
  PROCESSING: 'primary',
  RESOLVED: 'success',
  CLOSED: 'info'
}

// 工单列表数据，由 load 从后端获取
const list = ref<TicketItem[]>([])

// 总条数
const total = ref(6)

// 当前页 / 每页条数
const page = ref(1)
const size = ref(10)

// loading 状态：请求期间置 true
const loading = ref(false)

// 搜索表单：status 单选，dateRange 为 [开始日期, 结束日期]（YYYY-MM-DD）
const query = reactive<{ status: string; dateRange: [string, string] | [] | null }>({
  status: '',
  dateRange: []
})

// 查询 / 切换每页条数：回到第 1 页
const onSearch = () => {
  page.value = 1
  load()
}

// 重置：清空筛选条件后回到第 1 页
const onReset = () => {
  query.status = ''
  query.dateRange = []
  onSearch()
}

// 拉取工单列表；失败提示由 request.ts 统一处理
const load = async () => {
  loading.value = true
  try {
    const [dateFrom, dateTo] = query.dateRange ?? []
    const res = await listTickets({
      page: page.value,
      size: size.value,
      status: query.status,
      dateFrom,
      dateTo
    })
    list.value = res.list || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.search-bar {
  margin-bottom: 8px;
}
</style>
