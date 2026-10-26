import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6825,
    proxy: {
      '/api': {
        target: 'http://localhost:8609',
        changeOrigin: true
      }
    }
  }
})
