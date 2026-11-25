import { createApp } from 'vue'
import './styles/reset.css'    // 浏览器样式重置（最优先）
import 'element-plus/dist/index.css'  // Element Plus 官方样式
import './style.css'            // 项目全局样式（最后覆盖）
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

const app =createApp(App)

for (const [key,component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key,component)
}

app.use(router)
app.use(ElementPlus)

app.mount('#app')
