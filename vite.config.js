import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    open: true,
  },
  // Vite는 기본적으로 SPA 라우팅을 지원합니다
  // 모든 경로는 자동으로 index.html로 리다이렉트됩니다
})

