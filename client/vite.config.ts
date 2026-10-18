import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    force: true,
  },
  server: {
    port: 80,
    open: true
  },
  plugins: [react()],
})
