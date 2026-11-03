/**
 * Cloudflare Pages Function: AI Portfolio Assistant Chat Endpoint
 *
 * Route: POST /api/chat
 * Target Runtime: Cloudflare Workers / Pages Functions
 * Provider: Google Gemini API (`@google/genai`)
 *
 * Bridges Cloudflare Pages request/response lifecycle (`Request` / `Response` Web Standards)
 * to the shared portfolio chat handler logic in `api/chat.js`.
 */

import { createChatHandler } from '../../api/chat.js';

export const MAX_PAYLOAD_BYTES = 16_384; // 16 KB

/**
 * Creates the Cloudflare Pages Function handler with optional dependency injection for testing.
 */
export const createCloudflarePagesChatHandler = ({
  chatHandlerFactory = createChatHandler,
} = {}) => {
  return async function handleCloudflareRequest(context) {
    try {
      const { request, env = {} } = context;

      // 1. Validate HTTP Method
      const method = (request?.method || '').toUpperCase();
      if (method !== 'POST') {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'METHOD_NOT_ALLOWED',
              message: 'Metode HTTP tidak didukung. Gunakan metode POST.',
            },
          }),
          {
            status: 405,
            headers: {
              Allow: 'POST',
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      // Helper for returning 413 PAYLOAD_TOO_LARGE
      const createPayloadTooLargeResponse = () =>
        new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: 'Ukuran payload melebihi batas maksimum yang diizinkan (16 KB).',
            },
          }),
          {
            status: 413,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          }
        );

      // 2. Read Request Body via Bounded Streaming Reader (max 16 KB) with early cancellation
      let rawBody = '';
      let isPayloadTooLarge = false;

      if (request?.body && typeof request.body.getReader === 'function') {
        const reader = request.body.getReader();
        const chunks = [];
        let accumulatedBytes = 0;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              accumulatedBytes += value.byteLength;
              if (accumulatedBytes > MAX_PAYLOAD_BYTES) {
                isPayloadTooLarge = true;
                try {
                  await reader.cancel('PAYLOAD_TOO_LARGE');
                } catch {
                  // Ignore cancel errors if stream is already closed
                }
                break;
              }
              chunks.push(value);
            }
          }
        } catch {
          if (!isPayloadTooLarge) {
            rawBody = '';
          }
        } finally {
          try {
            reader.releaseLock();
          } catch {
            // Ignore releaseLock errors if stream was cancelled
          }
        }

        if (isPayloadTooLarge) {
          return createPayloadTooLargeResponse();
        }

        if (chunks.length > 0) {
          const merged = new Uint8Array(accumulatedBytes);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
          }
          rawBody = new TextDecoder('utf-8').decode(merged);
        }
      } else if (typeof request?.text === 'function') {
        // Fallback for mock environments without stream reader: strictly enforce 16 KB
        try {
          rawBody = await request.text();
        } catch {
          rawBody = '';
        }
        if (new TextEncoder().encode(rawBody).length > MAX_PAYLOAD_BYTES) {
          return createPayloadTooLargeResponse();
        }
      } else if (typeof request?.body === 'string') {
        // Direct string fallback: strictly enforce 16 KB
        rawBody = request.body;
        if (new TextEncoder().encode(rawBody).length > MAX_PAYLOAD_BYTES) {
          return createPayloadTooLargeResponse();
        }
      }

      // 4. Resolve Client IP from Cloudflare Connecting IP header
      const cfConnectingIp = request?.headers?.get?.('cf-connecting-ip') || 'anonymous';

      const req = {
        method: 'POST',
        body: rawBody,
        isCloudflarePages: true,
        headers: {
          'cf-connecting-ip': cfConnectingIp,
          'x-forwarded-for': cfConnectingIp,
          'x-real-ip': cfConnectingIp,
          'content-type': request?.headers?.get?.('content-type') !== null
            ? request.headers.get('content-type')
            : undefined,
          'sec-fetch-site': request?.headers?.get?.('sec-fetch-site') !== null
            ? request?.headers?.get?.('sec-fetch-site')
            : undefined,
          'origin': request?.headers?.get?.('origin') !== null
            ? request?.headers?.get?.('origin')
            : undefined,
          get: (headerName) => {
            const lower = String(headerName || '').toLowerCase();
            if (lower === 'cf-connecting-ip' || lower === 'x-forwarded-for' || lower === 'x-real-ip') {
              return cfConnectingIp;
            }
            return request?.headers?.get?.(headerName);
          },
        },
        socket: {
          remoteAddress: cfConnectingIp !== 'anonymous' ? cfConnectingIp : undefined,
        },
      };

      let statusCode = 200;
      const responseHeaders = new Headers();
      let responseBody = '';

      const res = {
        statusCode: 200,
        setHeader(name, value) {
          if (value !== undefined && value !== null) {
            responseHeaders.set(name, String(value));
          }
        },
        status(code) {
          statusCode = code;
          this.statusCode = code;
          return this;
        },
        json(payload) {
          responseBody = JSON.stringify(payload);
          return payload;
        },
        end(data) {
          if (typeof data === 'string') {
            responseBody = data;
          } else if (data) {
            responseBody = JSON.stringify(data);
          }
        },
      };

      // 5. Explicitly inject environment variables and verified Cloudflare Pages runtime into handler factory
      const handler = chatHandlerFactory({
        env,
        trustCloudflare: true,
        runtime: 'cloudflare-pages',
      });
      await handler(req, res);

      if (!responseHeaders.has('Content-Type')) {
        responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
      }
      if (!responseHeaders.has('Cache-Control')) {
        responseHeaders.set('Cache-Control', 'no-store');
      }

      // Fallback if handler returned empty response
      if (!responseBody) {
        responseBody = JSON.stringify({
          ok: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi kesalahan internal pada server.',
          },
        });
        if (statusCode === 200) {
          statusCode = 500;
        }
      }

      return new Response(responseBody, {
        status: statusCode,
        headers: responseHeaders,
      });
    } catch (unhandledError) {
      console.error(
        '[/api/chat cloudflare worker unhandled error]:',
        unhandledError?.message || unhandledError
      );

      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi kesalahan internal pada server.',
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }
      );
    }
  };
};

const defaultPagesHandler = createCloudflarePagesChatHandler();

export const onRequestPost = defaultPagesHandler;
export const onRequest = defaultPagesHandler;
export default defaultPagesHandler;
