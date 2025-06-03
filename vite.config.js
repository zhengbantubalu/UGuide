import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    port: 80,
    host: '0.0.0.0',
    proxy: {
      '/api/data': {
        target: 'http://47.93.189.31:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/data', '/mapline/api')
      },
      '/api/arith/path': {
        target: 'http://47.93.189.31:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/arith/path', '/')
      },
      '/api/arith/diary': {
        target: 'http://47.93.189.31:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/arith/diary', '/')
      },
      '/api/upload': {
        target: 'http://47.93.189.31:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/upload', '/upload')
      },
      '/api/ai': {
        target: 'https://spark-api-open.xf-yun.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/ai', '/v2/chat/completions')
      }
    }
  }
})
