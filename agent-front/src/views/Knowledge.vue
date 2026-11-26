<template>
  <el-card>
    <h2>运维知识库管理</h2>
    <p style="color:#888">新增的知识会自动向量化存入 Milvus，作为 AI Agent 的参考资料</p>

    <!-- 新增知识表单 -->
    <el-form :model="form" label-width="80px" style="max-width:720px;margin-top:16px">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="form.category" placeholder="选填" style="width:100%">
          <el-option label="网络" value="network" />
          <el-option label="硬件" value="hardware" />
          <el-option label="软件" value="software" />
          <el-option label="账号" value="account" />
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="form.content" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="onAdd">添加</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <!-- 知识库列表 -->
    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-popconfirm title="确定删除？" @confirm="onDelete(scope.row.id)">
            <template #reference>
              <el-button size="small" type="danger" :loading="deletingId === scope.row.id">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addKnowledge, listKnowledge, deleteKnowledge, type Knowledge } from '../api/knowledge'

const list = ref<Knowledge[]>([])

const form = ref({ title: '', content: '', category: '' })

const loading = ref(false)
const submitting = ref(false)
const deletingId = ref<number | null>(null)

// 拉取知识库列表
const load = async () => {
  loading.value = true
  try {
    list.value = await listKnowledge()
  } catch {
    ElMessage.error('获取知识库列表失败')
  } finally {
    loading.value = false
  }
}

// 新增知识
const onAdd = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    return ElMessage.warning('请填写标题和内容')
  }
  submitting.value = true
  try {
    await addKnowledge(form.value)
    ElMessage.success('已添加')
    form.value = { title: '', content: '', category: '' }
    await load()
  } catch {
    ElMessage.error('添加知识失败')
  } finally {
    submitting.value = false
  }
}

// 删除知识
const onDelete = async (id: number) => {
  deletingId.value = id
  try {
    await deleteKnowledge(id)
    ElMessage.success('已删除')
    await load()
  } catch {
    ElMessage.error('删除知识失败')
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
</script>
