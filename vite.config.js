import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 80,
    host: '0.0.0.0',
    proxy: {
      '/api_sb': {
        target: 'http://47.93.189.31:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_sb/, '/mapline/api')
      },
      '/api_fa': {
        target: 'http://47.93.189.31:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_fa/, '/')
      },
    }
  }
})
