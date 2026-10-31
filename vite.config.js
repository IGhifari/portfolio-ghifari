
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const buildDate = new Date().toISOString().split('T')[0]

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

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
          'vendor-three': ['three'],
          'vendor-icons': ['react-icons'],
        },
      },
    },
  },
})
