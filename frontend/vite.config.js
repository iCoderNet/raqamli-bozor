import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Dev mode: proxy /api to backend (npm run dev)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // Production build → FastAPI serves dist/
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  }
})
