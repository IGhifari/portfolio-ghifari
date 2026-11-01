
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const buildDate = new Date().toISOString().split('T')[0]
const rootDir = fileURLToPath(new URL('.', import.meta.url))

/**
 * Dev-only middleware so `POST /api/chat` works seamlessly under `npm run dev` (localhost:5173)
 * as well as `npx vercel dev` (localhost:3000). Never executes during production build.
 */
const localApiChatPlugin = (mode) => ({
  name: 'local-api-chat-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const urlPath = (req.url || '').split('?')[0]
      if (urlPath !== '/api/chat') {
        return next()
      }

      try {
        const env = loadEnv(mode, rootDir, '')
        for (const [key, value] of Object.entries(env)) {
          process.env[key] = value
        }

        const chunks = []
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        }
        req.body = Buffer.concat(chunks).toString('utf8')

        const { default: chatHandler } = await import('./api/chat.js')
        await chatHandler(req, res)
      } catch (err) {
        console.error('[/api/chat dev middleware error]:', err?.message || err)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Terjadi kesalahan internal pada server.',
              },
            })
          )
        }
      }
    })
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApiChatPlugin(mode)],
  envPrefix: ['VITE_', 'EMAILJS_'],

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
}))
