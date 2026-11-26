import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/ticket/list',
    children: [
      {
        path: 'ticket/list',
        component: () => import('../views/TicketList.vue'),
        meta: {
          requiredAuth: true
        }
      },
      {
        path: 'ticket/submit',
        component: () => import('../views/TicketSubmit.vue'),
        meta: {
          requiredAuth: true
        }
      },
      {
        path: 'ticket/:id',
        component: () => import('../views/TicketDetail.vue'),
        meta: {
          requiredAuth: true
        }
      },
      {
        path: 'knowledge',
        component: () => import('../views/Knowledge.vue'),
        meta: {
          requiredAuth: true,
          adminOnly: true
        }
      },
      {
        path: 'chat',
        component: () => import('../views/Chat.vue'),
        meta: {
          requiredAuth: true
        }
      }
    ]
  },
  {
    path: '/login',
    component: Login
  }
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

// 路由守卫：未登录跳登录页；已登录访问登录页回首页；非管理员禁止访问管理页
router.beforeEach((to) => {
  const token = localStorage.getItem('ticket_token')
  const userStr = localStorage.getItem('ticket_user')

  if (to.meta.requiredAuth && !token) {
    return '/login'
  }

  if (to.path === '/login' && token) {
    return '/ticket/list'
  }

  if (to.meta.adminOnly && userStr) {
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      return '/ticket/list'
    }
  }

  return true
})

export default router
