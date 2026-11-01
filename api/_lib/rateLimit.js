/**
 * Shared Serverless Rate Limiting via Upstash Redis REST API.
 *
 * Location: api/_lib/rateLimit.js
 *
 * Uses Upstash Redis HTTP Pipeline (`INCR` + `PTTL` + `PEXPIRE`) so rate limit
 * counters are shared across all Vercel Serverless Function instances without
 * relying on ephemeral in-memory state.
 */

export const DEFAULT_RATE_LIMIT_MAX = 10;
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
export const DEFAULT_UPSTASH_TIMEOUT_MS = 4_000;

/**
 * Extracts a normalized client identifier (IP address) from Vercel / Node request headers.
 */
export const getClientIdentifier = (req) => {
  const forwardedFor = req?.headers?.['x-forwarded-for'] || req?.headers?.get?.('x-forwarded-for');
  if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req?.headers?.['x-real-ip'] || req?.headers?.get?.('x-real-ip');
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return req?.socket?.remoteAddress || 'anonymous';
};

/**
 * Executes an Upstash Redis REST pipeline request with timeout protection.
 */
const executeUpstashPipeline = async ({
  restUrl,
  restToken,
  commands,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_UPSTASH_TIMEOUT_MS,
}) => {
  const cleanUrl = restUrl.replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${cleanUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const err = new Error(`Upstash Redis HTTP ${response.status}: ${errorText}`);
      err.code = 'UPSTASH_HTTP_ERROR';
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      const err = new Error('Invalid Upstash Redis pipeline response format');
      err.code = 'UPSTASH_INVALID_RESPONSE';
      throw err;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutErr = new Error('Upstash Redis request timed out');
      timeoutErr.code = 'UPSTASH_TIMEOUT';
      throw timeoutErr;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Creates a shared Upstash Redis rate limiter instance compatible with Vercel Serverless.
 *
 * @param {object} options
 * @param {string} [options.restUrl] - UPSTASH_REDIS_REST_URL
 * @param {string} [options.restToken] - UPSTASH_REDIS_REST_TOKEN
 * @param {number} [options.maxRequests] - Max requests per window (default 10)
 * @param {number} [options.windowMs] - Window duration in milliseconds (default 60000)
 * @param {string} [options.keyPrefix] - Redis key prefix
 * @param {Function} [options.fetchImpl] - Fetch implementation
 * @param {number} [options.timeoutMs] - Request timeout in ms
 */
export const createUpstashRateLimiter = ({
  restUrl = process.env.UPSTASH_REDIS_REST_URL,
  restToken = process.env.UPSTASH_REDIS_REST_TOKEN,
  maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || DEFAULT_RATE_LIMIT_MAX,
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || DEFAULT_RATE_LIMIT_WINDOW_MS,
  keyPrefix = 'ratelimit:portfolio-ghifari:chat',
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_UPSTASH_TIMEOUT_MS,
} = {}) => {
  return {
    provider: 'upstash-redis',

    async check(identifier = 'anonymous') {
      if (!restUrl || !restToken) {
        const err = new Error(
          'Upstash Redis environment variables (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) are not configured.'
        );
        err.code = 'CONFIGURATION_ERROR';
        throw err;
      }

      const safeId = String(identifier || 'anonymous').replace(/[^a-zA-Z0-9:._-]/g, '_');
      const redisKey = `${keyPrefix}:${safeId}`;

      // Step 1: Atomically increment counter and inspect current TTL
      const pipelineRes = await executeUpstashPipeline({
        restUrl,
        restToken,
        fetchImpl,
        timeoutMs,
        commands: [
          ['INCR', redisKey],
          ['PTTL', redisKey],
        ],
      });

      const currentCount = Number(pipelineRes?.[0]?.result ?? 1);
      let pttl = Number(pipelineRes?.[1]?.result ?? -1);

      // Step 2: If key is new or has no expiration set (pttl < 0), set PEXPIRE
      if (currentCount === 1 || pttl < 0) {
        await executeUpstashPipeline({
          restUrl,
          restToken,
          fetchImpl,
          timeoutMs,
          commands: [['PEXPIRE', redisKey, windowMs]],
        });
        pttl = windowMs;
      }

      const remaining = Math.max(0, maxRequests - currentCount);
      const allowed = currentCount <= maxRequests;
      const retryAfterSeconds = Math.max(1, Math.ceil(pttl / 1000));

      return {
        allowed,
        limit: maxRequests,
        current: currentCount,
        remaining,
        resetMs: pttl,
        retryAfterSeconds,
        provider: 'upstash-redis',
      };
    },
  };
};
