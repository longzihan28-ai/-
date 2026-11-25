import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api':{
        target: 'http://43.142.12.54:8080',
        changeOrigin: true
      }
    }
  }
})
