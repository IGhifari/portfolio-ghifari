
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const buildDate = new Date().toISOString().split('T')[0]
const rootDir = fileURLToPath(new URL('.', import.meta.url))

export const MAX_DEV_PAYLOAD_BYTES = 16_384 // 16 KB

/**
 * Validates Host header strictly for localhost / loopback interfaces.
 */
export const isAllowedDevHost = (rawHost) => {
  if (typeof rawHost !== 'string' || !rawHost.trim()) return false
  const host = rawHost.trim().toLowerCase()

  // Handle IPv6 bracket notation, e.g., [::1] or [::1]:5173
  if (host.startsWith('[')) {
    const closeBracket = host.indexOf(']')
    if (closeBracket === -1) return false
    const ipPart = host.slice(1, closeBracket)
    if (ipPart !== '::1') return false
    const remainder = host.slice(closeBracket + 1)
    if (remainder) {
      if (!/^:\d{1,5}$/.test(remainder)) return false
      const port = Number(remainder.slice(1))
      if (!Number.isInteger(port) || port < 1 || port > 65535) return false
    }
    return true
  }

  const colonIdx = host.indexOf(':')
  if (colonIdx !== -1) {
    const hostname = host.slice(0, colonIdx)
    const portPart = host.slice(colonIdx + 1)
    if (!/^\d{1,5}$/.test(portPart)) return false
    const port = Number(portPart)
    if (!Number.isInteger(port) || port < 1 || port > 65535) return false
    return hostname === 'localhost' || hostname === '127.0.0.1'
  }

  return host === 'localhost' || host === '127.0.0.1'
}

/**
 * Validates Origin header: if present, must be a strictly serialized RFC 6454 origin
 * (no paths, no credentials, no query, no fragments) belonging to localhost or loopback.
 */
export const isAllowedDevOrigin = (rawOrigin) => {
  if (typeof rawOrigin !== 'string' || !rawOrigin.trim()) return true
  const origin = rawOrigin.trim()
  if (origin === 'null' || origin.toLowerCase() === 'null') return false

  // Serialized RFC 6454 origin: scheme "://" host [ ":" port ]
  // Strictly disallow credentials (@), path (/...), query (?), or fragment (#)
  if (!/^https?:\/\/([a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(:\d{1,5})?$/.test(origin)) {
    return false
  }

  try {
    const parsed = new URL(origin)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (parsed.username || parsed.password) return false
    if (parsed.search || parsed.hash) return false
    if (parsed.pathname !== '/') return false

    const hostname = parsed.hostname.toLowerCase()
    const isLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '::1'

    if (!isLoopback) return false

    if (parsed.port) {
      const portNum = Number(parsed.port)
      if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validates Referer header: if present, must be localhost or loopback.
 */
export const isAllowedDevReferer = (rawReferer) => {
  if (typeof rawReferer !== 'string' || !rawReferer.trim()) return true
  try {
    const parsed = new URL(rawReferer.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }
    const hostname = parsed.hostname
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '::1'
    )
  } catch {
    return false
  }
}

/**
 * Validates Sec-Fetch-Site header:
 * - Only allows 'same-origin' and 'none'.
 * - Rejects 'same-site', 'cross-site', and any unknown/invalid values.
 * - Absent or nullish values are tolerated only because Host, Origin, and Referer
 *   checks are strictly enforced beforehand as defense-in-depth.
 */
export const isAllowedSecFetchSite = (rawSite) => {
  if (rawSite === undefined || rawSite === null) return true
  if (typeof rawSite !== 'string') return false
  const site = rawSite.trim().toLowerCase()
  if (!site) return true
  return site === 'same-origin' || site === 'none'
}

/**
 * Sends a 413 Payload Too Large response, discards the remaining request body
 * with strict bounds, and closes the connection.
 *
 * Socket-close strategy:
 * - Normal path: once the 413 response has been handed to the socket (`finish`),
 *   the write side is half-closed with `socket.end()` (TCP FIN) while the read side
 *   keeps discarding incoming bytes. Closing gracefully instead of `destroy()` avoids
 *   the RST a kernel typically emits when a socket is closed with unread data in its
 *   receive buffer — an RST can make the client discard the 413 it has not yet read.
 * - Abuse path: if the client sends more than MAX_ADDITIONAL_DRAIN_BYTES or the
 *   connection is still open after HARD_DEADLINE_MS, the socket is destroyed
 *   unconditionally. This keeps slowloris / endless-stream clients bounded, at the
 *   cost that such a client may receive an RST and lose the 413.
 *
 * TCP limitation: neither `res.writableFinished` nor `socket.writableLength === 0`
 * proves the client received the response. They only mean the bytes were handed to
 * the kernel. No server-side signal guarantees receipt; the graceful FIN path makes
 * receipt very likely for well-behaved clients, but it is not an absolute guarantee.
 * Note that Node's HTTP server itself also calls `socket.destroySoon()` after a
 * `Connection: close` response finishes, so a client that keeps writing after the
 * FIN can still observe a reset.
 */
export const sendDevPayloadTooLarge = (res, req) => {
  if (res.headersSent) return

  res.statusCode = 413
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Connection', 'close')
  res.setHeader('Cache-Control', 'no-store')

  const payload = JSON.stringify({
    ok: false,
    error: {
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Ukuran payload melebihi batas maksimum yang diizinkan (16 KB).',
    },
  })

  const HARD_DEADLINE_MS = 1000
  const MAX_ADDITIONAL_DRAIN_BYTES = 64 * 1024

  const socket = res?.socket || req?.socket
  let finished = false
  let deadlineTimer = null
  let additionalBytes = 0

  const cleanup = () => {
    if (finished) return
    finished = true
    if (deadlineTimer) {
      clearTimeout(deadlineTimer)
      deadlineTimer = null
    }
    if (typeof req?.removeListener === 'function') {
      req.removeListener('data', onData)
    }
    if (typeof res?.removeListener === 'function') {
      res.removeListener('finish', onResponseFinish)
    }
    if (socket && typeof socket.removeListener === 'function') {
      socket.removeListener('close', cleanup)
    }
  }

  // Abuse path only: unconditional teardown. May cause RST (see JSDoc).
  const forceDestroy = () => {
    if (finished) return
    cleanup()
    try {
      if (typeof req?.destroy === 'function' && !req.destroyed) req.destroy()
      if (socket && !socket.destroyed) socket.destroy()
    } catch {
      // ignore socket cleanup errors
    }
  }

  // Normal path: half-close write side with FIN; keep discarding reads.
  const onResponseFinish = () => {
    if (finished) return
    if (additionalBytes > MAX_ADDITIONAL_DRAIN_BYTES) {
      forceDestroy()
      return
    }
    try {
      if (socket && typeof socket.end === 'function' && !socket.destroyed) {
        socket.end()
      }
    } catch {
      // ignore socket end errors
    }
  }

  const onData = (chunk) => {
    additionalBytes += chunk?.length || 0
    if (additionalBytes > MAX_ADDITIONAL_DRAIN_BYTES) {
      if (typeof req?.pause === 'function') req.pause()
      if (typeof req?.removeListener === 'function') req.removeListener('data', onData)
      // If the 413 was already handed to the socket, tear down now; otherwise
      // onResponseFinish tears down, and the hard deadline bounds the wait.
      if (res?.writableFinished) forceDestroy()
    }
  }

  // Absolute bound: this timer is never re-armed and never waits on any event.
  deadlineTimer = setTimeout(forceDestroy, HARD_DEADLINE_MS)
  if (typeof deadlineTimer?.unref === 'function') deadlineTimer.unref()

  if (socket && typeof socket.once === 'function') {
    socket.once('close', cleanup)
  }
  if (typeof req?.on === 'function') {
    req.on('data', onData)
  }
  if (typeof res?.once === 'function') {
    res.once('finish', onResponseFinish)
  } else if (typeof res?.on === 'function') {
    res.on('finish', onResponseFinish)
  }

  // Discard the remaining body without buffering it.
  if (typeof req?.resume === 'function') {
    req.resume()
  }

  res.end(payload)
}

/**
 * Creates the hardened local API chat middleware for Vite dev server.
 */
export const createLocalApiChatMiddleware = ({
  mode = 'development',
  rootDirectory = rootDir,
  chatHandlerLoader = async () => (await import('./api/chat.js')).default,
} = {}) => {
  return async function localApiChatMiddleware(req, res, next) {
    const urlPath = (req.url || '').split('?')[0]
    if (urlPath !== '/api/chat') {
      return next()
    }

    // 1. Enforce POST method only
    const method = (req.method || '').toUpperCase()
    if (method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Allow', 'POST')
      res.setHeader('Cache-Control', 'no-store')
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Metode HTTP tidak didukung. Gunakan metode POST.',
          },
        })
      )
      return
    }

    // 2. Validate Host header (localhost / loopback only)
    const hostHeader = req.headers?.host
    if (!isAllowedDevHost(hostHeader)) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message:
              'Host header tidak diizinkan. Hanya akses localhost/loopback yang diperbolehkan.',
          },
        })
      )
      return
    }

    // 3. Validate Origin header (localhost / loopback only if present)
    const originHeader = req.headers?.origin
    if (!isAllowedDevOrigin(originHeader)) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Origin tidak diizinkan. Permintaan cross-origin ditolak.',
          },
        })
      )
      return
    }

    // 4. Validate Referer header (localhost / loopback only if present)
    const refererHeader = req.headers?.referer
    if (!isAllowedDevReferer(refererHeader)) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Referer tidak diizinkan. Permintaan cross-origin ditolak.',
          },
        })
      )
      return
    }

    // 5. Enforce Sec-Fetch-Site validation: only allow same-origin and none; reject same-site, cross-site, unknown
    const secFetchSite = req.headers?.['sec-fetch-site']
    if (!isAllowedSecFetchSite(secFetchSite)) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Connection', 'close')
      res.setHeader('Cache-Control', 'no-store')
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message:
              'Permintaan dengan Sec-Fetch-Site tidak diizinkan. Hanya same-origin dan none yang diperbolehkan.',
          },
        })
      )
      return
    }

    // 6. Check Content-Length: must be valid decimal digits and <= 16 KB
    const rawContentLength = req.headers?.['content-length']
    if (rawContentLength !== undefined) {
      const strLen = String(rawContentLength).trim()
      if (!/^\d+$/.test(strLen)) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Connection', 'close')
        res.setHeader('Cache-Control', 'no-store')
        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'INVALID_CONTENT_LENGTH',
              message: 'Header Content-Length tidak valid.',
            },
          })
        )
        return
      }

      const contentLength = Number(strLen)
      if (!Number.isSafeInteger(contentLength) || contentLength > MAX_DEV_PAYLOAD_BYTES) {
        sendDevPayloadTooLarge(res, req)
        return
      }
    }

    // 7. Stream and enforce max 16 KB body limit
    let totalBytes = 0
    const chunks = []
    let payloadExceeded = false

    try {
      for await (const chunk of req) {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        totalBytes += buf.length
        if (totalBytes > MAX_DEV_PAYLOAD_BYTES) {
          payloadExceeded = true
          break
        }
        chunks.push(buf)
      }
    } catch (streamErr) {
      console.error('[/api/chat dev stream error]:', streamErr?.message || streamErr)
      if (!res.headersSent) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Connection', 'close')
        res.setHeader('Cache-Control', 'no-store')
        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Gagal membaca stream request body.',
            },
          })
        )
      }
      return
    }

    if (payloadExceeded) {
      chunks.length = 0
      sendDevPayloadTooLarge(res, req)
      return
    }

    req.body = Buffer.concat(chunks).toString('utf8')

    // 8. Safely load dev environment variables and dispatch to chatHandler
    try {
      const env = loadEnv(mode, rootDirectory, '')
      for (const [key, value] of Object.entries(env)) {
        process.env[key] = value
      }

      const chatHandler = await chatHandlerLoader()
      await chatHandler(req, res)
    } catch (err) {
      console.error('[/api/chat dev middleware error]:', err?.message || err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
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
  }
}

/**
 * Dev-only middleware so `POST /api/chat` works seamlessly under `npm run dev` (localhost:5173)
 * as well as `npx vercel dev` (localhost:3000). Never executes during production build.
 */
export const localApiChatPlugin = (mode) => ({
  name: 'local-api-chat-middleware',
  configureServer(server) {
    server.middlewares.use(createLocalApiChatMiddleware({ mode }))
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApiChatPlugin(mode)],
  envPrefix: ['VITE_'],

  server: {
    host: 'localhost',
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.key', '*.pem'],
    },
  },

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
