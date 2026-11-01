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

      // 2. Read Request Body as Text
      let rawBody = '';
      try {
        rawBody = await request.text();
      } catch {
        rawBody = '';
      }

      // 3. Size-Check using Web Standards TextEncoder
      const payloadBytes = new TextEncoder().encode(rawBody).length;
      if (payloadBytes > MAX_PAYLOAD_BYTES) {
        return new Response(
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
      }

      // 4. Resolve Client IP from Cloudflare Connecting IP header
      const clientIp =
        request?.headers?.get?.('cf-connecting-ip') ||
        request?.headers?.get?.('x-forwarded-for') ||
        'anonymous';

      const req = {
        method: 'POST',
        body: rawBody,
        headers: {
          'x-forwarded-for': clientIp,
          'x-real-ip': clientIp,
          'content-type': request?.headers?.get?.('content-type') || 'application/json',
          get: (headerName) => {
            const lower = String(headerName || '').toLowerCase();
            if (lower === 'cf-connecting-ip' || lower === 'x-forwarded-for' || lower === 'x-real-ip') {
              return clientIp;
            }
            return request?.headers?.get?.(headerName);
          },
        },
        socket: {
          remoteAddress: clientIp,
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

      // 5. Explicitly inject environment variables into handler factory
      const handler = chatHandlerFactory({ env });
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
