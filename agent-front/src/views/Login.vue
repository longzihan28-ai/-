<template>
  <!-- 最外层：全屏渐变背景 + 居中卡片 -->
  <div class="login-wrap">
    <el-card class="login-card">
      <!-- 标题与副标题 -->
      <h2 style="text-align:center">IT运维工单智能Agent</h2>
      <p style="text-align:center;color:#888">登录后即可体验 AI 自动工单分析</p>

      <!-- 登录表单 -->
      <el-form :model="form" label-width="80px" style="margin-top:24px" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="employee / admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="123456 / admin123" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 演示账号提示 -->
      <el-alert type="info" :closable="false" show-icon style="margin-top:8px">
        <p>演示账号：</p>
        <p>员工：employee / 123456</p>
        <p>管理员：admin / admin123</p>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '../api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

// 演示账号默认填充，登录走真实接口
const form = ref({
  username: 'employee',
  password: '123456'
})


// 登录按钮 loading 状态，请求期间置为 true
const loading = ref(false)

// 登录：校验非空 → 调接口 → 存 token 与用户信息 → 跳转工单列表
const onLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号密码')
    return
  }
  loading.value = true
  try {
    const data = await login(form.value)
    localStorage.setItem('ticket_token', data.token)
    localStorage.setItem('ticket_user', JSON.stringify(data))
    ElMessage.success('登录成功')
    router.push('/ticket/list')
  } catch {
    // 失败提示已由 request.ts 响应拦截器统一处理，此处保留登录页
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>
