<!--
  主布局组件 —— 左侧菜单 + 顶部 Header + 中间内容区
  技术栈：Vue 3 script setup + Element Plus（已全局注册）+ Vue Router
-->
<template>
  <!-- 外层横向容器 -->
  <el-container style="height: 100vh; flex-direction: row;">

    <!-- ========== 侧边栏 ========== -->
    <el-aside width="220px" style="background-color: #001529; color: #fff;">

      <!-- 顶部 Logo 区 -->
      <div
        style="padding: 20px; text-align: center; font-size: 18px; font-weight: 600; letter-spacing: 2px;"
      >
        运维工单Agent
      </div>

      <!-- 深色菜单 -->
      <el-menu
        background-color="#001529"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        :default-active="route.path"
        style="border-right: none;"
      >
        <!-- 工单列表 -->
        <el-menu-item index="/ticket/list">
          <el-icon><Document /></el-icon>
          <span>工单列表</span>
        </el-menu-item>

        <!-- 提交工单 -->
        <el-menu-item index="/ticket/submit">
          <el-icon><Edit /></el-icon>
          <span>提交工单</span>
        </el-menu-item>

        <!-- 知识库管理（仅管理员可见） -->
        <el-menu-item v-if="isAdmin" index="/knowledge">
          <el-icon><Reading /></el-icon>
          <span>知识库管理</span>
        </el-menu-item>

        <!-- AI 助手 -->
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI 助手</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- ========== 内层纵向容器 ========== -->
    <el-container style="flex-direction: column;">

      <!-- Header：顶部栏 -->
      <el-header
        style="background-color: #fff; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; height: 56px;"
      >
        <!-- 左侧系统标题 -->
        <div style="font-weight: 600; font-size: 16px;">📋 IT 运维智能工单系统</div>

        <!-- 右侧：用户信息 + 退出 -->
        <div style="display: flex; align-items: center;">
          <el-tag type="info" effect="plain">{{ user.realName }}（{{ user.role }}）</el-tag>
          <el-button type="text" style="margin-left: 12px;" @click="onLogout">退出登录</el-button>
        </div>
      </el-header>

      <!-- Main：主内容区 -->
      <el-main style="background-color: #f0f2f5; padding: 0;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

// 当前路由，用于 default-active 绑定高亮菜单项
const route = useRoute()

// 路由实例，用于菜单跳转与退出登录后跳转
const router = useRouter()

// 用户信息 —— 写死，禁止接口调用与 localStorage
const user = { realName: '王五', role: 'admin' }

// 是否管理员 —— 普通变量即可，不需要 computed
const isAdmin = user.role === 'admin'

// 退出登录 —— 弹二次确认框，确认后跳转登录页
const onLogout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      router.push('/login')
    })
    .catch(() => {})
}
</script>
