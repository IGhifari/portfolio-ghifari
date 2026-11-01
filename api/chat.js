/**
 * Vercel Serverless Function: AI Portfolio Assistant Chat Endpoint
 *
 * Route: POST /api/chat
 * Provider: Google Gemini API (`@google/genai`)
 * Mode: STRICT KNOWLEDGE ONLY
 */

import { z } from 'zod';
import {
  retrieveKnowledge,
  detectPromptInjection,
  detectQueryLanguage,
} from './_lib/retrieval.js';
import {
  createUpstashRateLimiter,
  getClientIdentifier,
} from './_lib/rateLimit.js';
import {
  generateGroundedAnswer,
  getRefusalMessage,
  DEFAULT_GEMINI_MODEL,
} from './_lib/gemini.js';

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY_ITEMS = 6;
export const MAX_PAYLOAD_BYTES = 16_384; // 16 KB

const SUPPORTED_LANGUAGES = ['id', 'en'];

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

export const chatRequestSchema = z
  .object({
    message: z.string(),
    lang: z.enum(SUPPORTED_LANGUAGES).optional(),
    language: z.enum(SUPPORTED_LANGUAGES).optional(),
    history: z.array(historyMessageSchema).max(MAX_HISTORY_ITEMS).optional(),
  })
  .strict();

const ERROR_MESSAGES = {
  id: {
    METHOD_NOT_ALLOWED: 'Metode HTTP tidak didukung. Gunakan metode POST.',
    PAYLOAD_TOO_LARGE: 'Ukuran payload melebihi batas maksimum yang diizinkan (16 KB).',
    INVALID_JSON: 'Format body JSON tidak valid.',
    EMPTY_MESSAGE: 'Pesan tidak boleh kosong.',
    MESSAGE_TOO_LONG: `Pesan terlalu panjang. Maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
    INVALID_LANGUAGE: 'Bahasa tidak valid. Gunakan "id" (Indonesia) atau "en" (Inggris).',
    INVALID_INPUT: 'Data permintaan tidak valid.',
    RATE_LIMIT_EXCEEDED: 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.',
    CONFIGURATION_ERROR: 'Layanan AI belum dikonfigurasi sepenuhnya di server.',
    UPSTREAM_TIMEOUT: 'Waktu tunggu layanan habis (timeout). Silakan coba lagi.',
    GEMINI_RATE_LIMIT: 'Batas kuota layanan AI sedang penuh. Silakan coba lagi beberapa saat.',
    GEMINI_API_ERROR: 'Terjadi gangguan saat menghubungi layanan AI. Silakan coba lagi nanti.',
    INTERNAL_SERVER_ERROR: 'Terjadi kesalahan internal pada server.',
  },
  en: {
    METHOD_NOT_ALLOWED: 'HTTP method not allowed. Please use POST.',
    PAYLOAD_TOO_LARGE: 'Request payload exceeds the maximum allowed size (16 KB).',
    INVALID_JSON: 'Invalid JSON request body.',
    EMPTY_MESSAGE: 'Message cannot be empty.',
    MESSAGE_TOO_LONG: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
    INVALID_LANGUAGE: 'Invalid language. Supported values are "id" (Indonesian) or "en" (English).',
    INVALID_INPUT: 'Invalid request payload.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',
    CONFIGURATION_ERROR: 'The AI service is not fully configured on the server.',
    UPSTREAM_TIMEOUT: 'The upstream request timed out. Please try again.',
    GEMINI_RATE_LIMIT: 'The AI provider quota or rate limit was reached. Please try again shortly.',
    GEMINI_API_ERROR: 'An error occurred while communicating with the AI service. Please try again later.',
    INTERNAL_SERVER_ERROR: 'An internal server error occurred.',
  },
};

const getErrorMessage = (code, lang = 'id') => {
  const dict = lang === 'en' ? ERROR_MESSAGES.en : ERROR_MESSAGES.id;
  return dict[code] || dict.INTERNAL_SERVER_ERROR;
};

/**
 * Scrubs any secret values or API key patterns from diagnostic log strings so
 * server logs never expose credentials.
 */
const sanitizeDiagnosticMessage = (rawMessage, secrets = []) => {
  let sanitized = String(rawMessage || '');
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.trim().length > 4) {
      sanitized = sanitized.split(secret.trim()).join('[REDACTED]');
    }
  }
  sanitized = sanitized.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_API_KEY]');
  return sanitized;
};

/**
 * Helper to send a consistent JSON response in both Vercel Node req/res and standard test mocks.
 */
const sendJson = (res, statusCode, payload, headers = {}) => {
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        res.setHeader(key, String(value));
      }
    }
  }

  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(payload);
  }

  if (res) {
    res.statusCode = statusCode;
    if (typeof res.end === 'function') {
      res.end(JSON.stringify(payload));
    }
  }
  return payload;
};

/**
 * Factory function to create the POST /api/chat handler with injectable dependencies for testing.
 */
export const createChatHandler = ({
  rateLimiter,
  answerGenerator = generateGroundedAnswer,
  retriever = retrieveKnowledge,
  env = process.env,
  fetchImpl = globalThis.fetch,
  geminiClientFactory,
} = {}) => {
  return async function chatHandler(req, res) {
    // 1. Validate HTTP Method
    const method = (req?.method || '').toUpperCase();
    if (method !== 'POST') {
      return sendJson(
        res,
        405,
        {
          ok: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: getErrorMessage('METHOD_NOT_ALLOWED', 'id'),
          },
        },
        { Allow: 'POST' }
      );
    }

    // 2. Parse and Size-Check Request Body (Safely catch @vercel/node getter errors)
    let rawBody;
    try {
      rawBody = req?.body;
    } catch {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: 'INVALID_JSON',
          message: getErrorMessage('INVALID_JSON', 'id'),
        },
      });
    }

    if (Buffer.isBuffer(rawBody) || rawBody instanceof Uint8Array) {
      rawBody = Buffer.from(rawBody).toString('utf8');
    }

    if (typeof rawBody === 'string') {
      if (Buffer.byteLength(rawBody, 'utf8') > MAX_PAYLOAD_BYTES) {
        return sendJson(res, 413, {
          ok: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: getErrorMessage('PAYLOAD_TOO_LARGE', 'id'),
          },
        });
      }
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: {
            code: 'INVALID_JSON',
            message: getErrorMessage('INVALID_JSON', 'id'),
          },
        });
      }
    } else if (rawBody && typeof rawBody === 'object') {
      const serializedLength = Buffer.byteLength(JSON.stringify(rawBody), 'utf8');
      if (serializedLength > MAX_PAYLOAD_BYTES) {
        return sendJson(res, 413, {
          ok: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: getErrorMessage('PAYLOAD_TOO_LARGE', 'id'),
          },
        });
      }
    } else {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: getErrorMessage('INVALID_INPUT', 'id'),
        },
      });
    }

    // Determine preliminary language for localized error messages
    const rawLangHint = rawBody?.lang ?? rawBody?.language;
    const prelimLang = rawLangHint === 'en' ? 'en' : 'id';

    // Explicit pre-checks for language, empty message, and message length for clear error codes
    if (
      rawLangHint !== undefined &&
      !SUPPORTED_LANGUAGES.includes(rawLangHint)
    ) {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: 'INVALID_LANGUAGE',
          message: getErrorMessage('INVALID_LANGUAGE', 'en'),
        },
      });
    }

    if (typeof rawBody?.message === 'string') {
      const trimmedMsg = rawBody.message.trim();
      if (trimmedMsg.length === 0) {
        return sendJson(res, 400, {
          ok: false,
          error: {
            code: 'EMPTY_MESSAGE',
            message: getErrorMessage('EMPTY_MESSAGE', prelimLang),
          },
        });
      }
      if (trimmedMsg.length > MAX_MESSAGE_LENGTH) {
        return sendJson(res, 400, {
          ok: false,
          error: {
            code: 'MESSAGE_TOO_LONG',
            message: getErrorMessage('MESSAGE_TOO_LONG', prelimLang),
          },
        });
      }
    }

    // 3. Full Schema Validation via Zod
    const parsed = chatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: getErrorMessage('INVALID_INPUT', prelimLang),
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    const { message, history = [] } = parsed.data;
    const trimmedMessage = message.trim();
    const requestedLang = parsed.data.lang || parsed.data.language || 'id';
    const effectiveLang = detectQueryLanguage(trimmedMessage, requestedLang);

    // 4. Verify Server Environment Configuration
    const geminiApiKey = env?.GEMINI_API_KEY;
    const upstashUrl = env?.UPSTASH_REDIS_REST_URL;
    const upstashToken = env?.UPSTASH_REDIS_REST_TOKEN;
    const configuredModel = env?.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    const activeRateLimiter =
      rateLimiter ||
      createUpstashRateLimiter({
        restUrl: upstashUrl,
        restToken: upstashToken,
        maxRequests: Number(env?.RATE_LIMIT_MAX_REQUESTS) || undefined,
        windowMs: Number(env?.RATE_LIMIT_WINDOW_MS) || undefined,
        fetchImpl,
      });

    // 5. Execute Shared Rate Limiting (Upstash Redis)
    const clientIp = getClientIdentifier(req);
    let rateStatus;
    try {
      rateStatus = await activeRateLimiter.check(clientIp);
    } catch (rateError) {
      if (rateError?.code === 'CONFIGURATION_ERROR') {
        return sendJson(res, 503, {
          ok: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: getErrorMessage('CONFIGURATION_ERROR', effectiveLang),
          },
        });
      }
      if (rateError?.code === 'UPSTASH_TIMEOUT') {
        return sendJson(res, 504, {
          ok: false,
          error: {
            code: 'UPSTREAM_TIMEOUT',
            message: getErrorMessage('UPSTREAM_TIMEOUT', effectiveLang),
          },
        });
      }
      return sendJson(res, 502, {
        ok: false,
        error: {
          code: 'RATE_LIMIT_SERVICE_ERROR',
          message: getErrorMessage('INTERNAL_SERVER_ERROR', effectiveLang),
        },
      });
    }

    const rateHeaders = {
      'X-RateLimit-Limit': rateStatus.limit,
      'X-RateLimit-Remaining': rateStatus.remaining,
      'X-RateLimit-Reset': Math.ceil((rateStatus.resetMs || 0) / 1000),
    };

    if (!rateStatus.allowed) {
      return sendJson(
        res,
        429,
        {
          ok: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: getErrorMessage('RATE_LIMIT_EXCEEDED', effectiveLang),
            retryAfterSeconds: rateStatus.retryAfterSeconds,
          },
        },
        {
          ...rateHeaders,
          'Retry-After': rateStatus.retryAfterSeconds,
        }
      );
    }

    // Verify GEMINI_API_KEY is configured before proceeding
    if (!geminiApiKey || typeof geminiApiKey !== 'string' || !geminiApiKey.trim()) {
      return sendJson(
        res,
        503,
        {
          ok: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: getErrorMessage('CONFIGURATION_ERROR', effectiveLang),
          },
        },
        rateHeaders
      );
    }

    // 6. Check Prompt Injection in both current message and history
    const messageInjection = detectPromptInjection(trimmedMessage);
    const historyInjection = history.some(
      (item) => detectPromptInjection(item.content).isInjection
    );

    if (messageInjection.isInjection || historyInjection) {
      return sendJson(
        res,
        200,
        {
          ok: true,
          answer: getRefusalMessage(effectiveLang),
          sources: [],
          meta: {
            language: effectiveLang,
            refused: true,
            reason: 'PROMPT_INJECTION',
            isAmbiguous: false,
            model: configuredModel,
            retrievedCount: 0,
          },
        },
        rateHeaders
      );
    }

    // 7. Retrieve Relevant Knowledge Base Entries
    const retrieval = retriever(trimmedMessage, { lang: effectiveLang });

    if (!retrieval.hasRelevantKnowledge || retrieval.results.length === 0) {
      return sendJson(
        res,
        200,
        {
          ok: true,
          answer: getRefusalMessage(effectiveLang),
          sources: [],
          meta: {
            language: effectiveLang,
            refused: true,
            reason: retrieval.refusalReason || 'NO_RELEVANT_KNOWLEDGE',
            isAmbiguous: false,
            model: configuredModel,
            retrievedCount: 0,
          },
        },
        rateHeaders
      );
    }

    // 8. Generate Strictly Grounded Answer via Google Gemini & Validate Source IDs
    try {
      const generation = await answerGenerator({
        message: trimmedMessage,
        history,
        retrievedResults: retrieval.results,
        lang: effectiveLang,
        isAmbiguous: retrieval.isAmbiguous,
        apiKey: geminiApiKey,
        model: configuredModel,
        timeoutMs: Number(env?.GEMINI_TIMEOUT_MS) || undefined,
        ...(geminiClientFactory ? { clientFactory: geminiClientFactory } : {}),
      });

      return sendJson(
        res,
        200,
        {
          ok: true,
          answer: generation.answer,
          sources: generation.sources,
          meta: {
            language: effectiveLang,
            refused: generation.refused,
            reason: generation.reason,
            isAmbiguous: retrieval.isAmbiguous,
            model: generation.model || configuredModel,
            retrievedCount: retrieval.results.length,
            topScore: retrieval.topScore,
          },
        },
        rateHeaders
      );
    } catch (error) {
      const safeDiagnostic = sanitizeDiagnosticMessage(error?.message, [
        geminiApiKey,
        upstashToken,
        upstashUrl,
      ]);
      console.error(
        `[/api/chat] Upstream error (code=${error?.code || 'UNKNOWN'}, status=${error?.status || 502}, model=${configuredModel}): ${safeDiagnostic}`
      );

      if (error?.code === 'CONFIGURATION_ERROR') {
        return sendJson(
          res,
          503,
          {
            ok: false,
            error: {
              code: 'CONFIGURATION_ERROR',
              message: getErrorMessage('CONFIGURATION_ERROR', effectiveLang),
            },
          },
          rateHeaders
        );
      }

      if (error?.code === 'UPSTREAM_TIMEOUT') {
        return sendJson(
          res,
          504,
          {
            ok: false,
            error: {
              code: 'UPSTREAM_TIMEOUT',
              message: getErrorMessage('UPSTREAM_TIMEOUT', effectiveLang),
            },
          },
          rateHeaders
        );
      }

      if (error?.code === 'GEMINI_RATE_LIMIT') {
        return sendJson(
          res,
          429,
          {
            ok: false,
            error: {
              code: 'GEMINI_RATE_LIMIT',
              message: getErrorMessage('GEMINI_RATE_LIMIT', effectiveLang),
            },
          },
          rateHeaders
        );
      }

      return sendJson(
        res,
        502,
        {
          ok: false,
          error: {
            code: 'GEMINI_API_ERROR',
            message: getErrorMessage('GEMINI_API_ERROR', effectiveLang),
          },
        },
        rateHeaders
      );
    }
  };
};

const defaultHandler = createChatHandler();
export default defaultHandler;
