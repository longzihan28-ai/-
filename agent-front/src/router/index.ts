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
        component: () => import('../views/TicketList.vue')
      },
      {
        path: 'ticket/submit',
        component: () => import('../views/TicketSubmit.vue')
      },
      {
        path: 'knowledge',
        component: () => import('../views/Knowledge.vue')
      },
      {
        path: 'chat',
        component: () => import('../views/Chat.vue')
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

export default router
