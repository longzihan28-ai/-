import { createRouter,createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login.vue'

const routes = [
    {
        path: '/',
        component: MainLayout
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