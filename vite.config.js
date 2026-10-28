import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toISOString().split('T')[0]

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-ogl': ['ogl'],
          'vendor-icons': ['react-icons'],
        },
      },
    },
  },
})
