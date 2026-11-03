/**
 * Shared Serverless Rate Limiting via Upstash Redis REST API.
 *
 * Location: api/_lib/rateLimit.js
 *
 * Uses an atomic Redis Lua script (`EVAL`) executed over the Upstash Redis REST API
 * so counter increment (`INCR`), TTL inspection (`PTTL`), and expiration setup (`PEXPIRE`)
 * are guaranteed to execute atomically without race conditions or fail-open behavior.
 */

export const DEFAULT_RATE_LIMIT_MAX = 10;
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
export const DEFAULT_UPSTASH_TIMEOUT_MS = 4_000;

/**
 * Atomic Lua script for rate limiting:
 * 1. Increments the request counter for KEYS[1].
 * 2. Checks the current PTTL (in milliseconds).
 * 3. If the key was just created (current == 1) or has no positive TTL remaining (pttl <= 0),
 *    sets PEXPIRE to ARGV[1] (windowMs) inside the same atomic execution.
 * 4. Returns { current, pttl }.
 */
export const RATE_LIMIT_LUA_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
local pttl = redis.call("PTTL", KEYS[1])
if current == 1 or pttl <= 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  pttl = tonumber(ARGV[1])
end
return { current, pttl }
`.trim();

/**
 * Validates a TCP/UDP port string (1-65535).
 */
const isValidPort = (portStr) => {
  if (!/^\d{1,5}$/.test(String(portStr || ''))) return false;
  const port = Number(portStr);
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * Parses a dotted-quad IPv4 string into an array of 4 octets (0-255), or null if invalid.
 */
const parseIpv4Octets = (input) => {
  const parts = String(input || '').split('.');
  if (parts.length !== 4) return null;
  const octets = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    if (part.length > 1 && part.startsWith('0')) return null;
    const num = Number(part);
    if (!Number.isInteger(num) || num < 0 || num > 255) return null;
    octets.push(num);
  }
  return octets;
};

/**
 * Parses an IPv6 string into 8 numeric 16-bit hextets (0x0000 - 0xffff), or null if invalid.
 */
const parseIpv6Hextets = (input) => {
  let ipv6Str = String(input || '').trim();
  if (!ipv6Str.includes(':')) return null;

  // Handle embedded IPv4 in the trailing segment (e.g., ::ffff:203.0.113.10)
  const lastColon = ipv6Str.lastIndexOf(':');
  const trailingSegment = ipv6Str.slice(lastColon + 1);
  if (trailingSegment.includes('.')) {
    const ipv4Octets = parseIpv4Octets(trailingSegment);
    if (!ipv4Octets) return null;
    const high = ((ipv4Octets[0] << 8) | ipv4Octets[1]).toString(16);
    const low = ((ipv4Octets[2] << 8) | ipv4Octets[3]).toString(16);
    ipv6Str = `${ipv6Str.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const doubleColonParts = ipv6Str.split('::');
  if (doubleColonParts.length > 2) return null;

  const head = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
  const tail =
    doubleColonParts.length === 2 && doubleColonParts[1]
      ? doubleColonParts[1].split(':')
      : [];

  const isValidHexGroup = (group) => /^[0-9a-fA-F]{1,4}$/.test(group);
  if (!head.every(isValidHexGroup) || !tail.every(isValidHexGroup)) {
    return null;
  }

  let groups;
  if (doubleColonParts.length === 2) {
    const missing = 8 - (head.length + tail.length);
    if (missing < 1) return null;
    groups = [...head, ...Array(missing).fill('0'), ...tail];
  } else {
    if (head.length !== 8) return null;
    groups = head;
  }

  return groups.map((g) => parseInt(g, 16));
};

/**
 * Normalizes a single client IP address for rate-limiting:
 * - Canonicalizes valid IPv4 addresses to `a.b.c.d`.
 * - Extracts IPv4-mapped IPv6 addresses (`::ffff:a.b.c.d`) to their canonical IPv4 `/32` form
 *   so unrelated IPv4 clients are never grouped together.
 * - Normalizes valid standard IPv6 addresses to their `/64` subnet prefix (`h1:h2:h3:h4::/64`).
 *   Under SLAAC / RFC 8981 privacy extensions, end-user devices within a single LAN segment
 *   share a `/64` prefix and can freely rotate the lower 64-bit interface identifier (IID).
 *   Normalizing to `/64` prevents single-host IID rotation bypasses while scoping the shared
 *   bucket to a single local network (analogous to a single NATed IPv4 address, avoiding the
 *   collateral impact of wider `/56` or `/48` aggregation across unrelated subscribers).
 * - Returns `'anonymous'` for any invalid, malformed, or arbitrary non-IP string.
 */
export const normalizeIpForRateLimit = (rawIp) => {
  if (typeof rawIp !== 'string') return 'anonymous';

  let candidate = rawIp.trim();
  if (!candidate || candidate.toLowerCase() === 'anonymous') {
    return 'anonymous';
  }

  // Single-IP normalizer must reject comma-separated lists or whitespace-injected strings
  if (candidate.includes(',') || /\s/.test(candidate)) {
    return 'anonymous';
  }

  // Allow idempotent re-normalization of already-normalized IPv6 `/64` prefixes only
  let hadPrefix64Suffix = false;
  if (candidate.endsWith('/64')) {
    hadPrefix64Suffix = true;
    candidate = candidate.slice(0, -3);
  } else if (candidate.includes('/')) {
    return 'anonymous';
  }

  // Strip brackets around IPv6 (e.g., [2001:db8::1] or [2001:db8::1]:8080)
  if (candidate.startsWith('[')) {
    if (hadPrefix64Suffix) return 'anonymous';
    const closingBracket = candidate.indexOf(']');
    if (closingBracket <= 1) return 'anonymous';
    const remainder = candidate.slice(closingBracket + 1);
    if (remainder) {
      if (!remainder.startsWith(':') || !isValidPort(remainder.slice(1))) {
        return 'anonymous';
      }
    }
    candidate = candidate.slice(1, closingBracket);
  } else if (candidate.includes(']')) {
    return 'anonymous';
  }

  // Strip IPv6 zone identifier (e.g., fe80::1%eth0)
  const zoneIndex = candidate.indexOf('%');
  if (zoneIndex !== -1) {
    if (hadPrefix64Suffix) return 'anonymous';
    const zoneId = candidate.slice(zoneIndex + 1);
    if (!zoneId || !/^[a-zA-Z0-9._-]+$/.test(zoneId)) {
      return 'anonymous';
    }
    candidate = candidate.slice(0, zoneIndex);
  }

  // Strip port suffix on IPv4 (e.g., 203.0.113.10:54321)
  if (
    candidate.includes('.') &&
    candidate.indexOf(':') !== -1 &&
    candidate.indexOf(':') === candidate.lastIndexOf(':')
  ) {
    if (hadPrefix64Suffix) return 'anonymous';
    const colonIdx = candidate.indexOf(':');
    const portPart = candidate.slice(colonIdx + 1);
    if (!isValidPort(portPart)) {
      return 'anonymous';
    }
    candidate = candidate.slice(0, colonIdx);
  }

  if (!hadPrefix64Suffix) {
    const ipv4Octets = parseIpv4Octets(candidate);
    if (ipv4Octets) {
      return `${ipv4Octets[0]}.${ipv4Octets[1]}.${ipv4Octets[2]}.${ipv4Octets[3]}`;
    }
  }

  const ipv6Hextets = parseIpv6Hextets(candidate);
  if (ipv6Hextets) {
    const isAllZero = ipv6Hextets.every((h) => h === 0);
    if (isAllZero) return 'anonymous';

    const isLoopback =
      ipv6Hextets.slice(0, 7).every((h) => h === 0) && ipv6Hextets[7] === 1;
    if (isLoopback) {
      return hadPrefix64Suffix ? 'anonymous' : '::1';
    }

    const isIpv4Mapped =
      ipv6Hextets.slice(0, 5).every((h) => h === 0) && ipv6Hextets[5] === 0xffff;
    if (isIpv4Mapped) {
      if (hadPrefix64Suffix) return 'anonymous';
      const a = (ipv6Hextets[6] >> 8) & 0xff;
      const b = ipv6Hextets[6] & 0xff;
      const c = (ipv6Hextets[7] >> 8) & 0xff;
      const d = ipv6Hextets[7] & 0xff;
      return `${a}.${b}.${c}.${d}`;
    }

    const prefix64 = ipv6Hextets
      .slice(0, 4)
      .map((h) => h.toString(16).padStart(4, '0'))
      .join(':');
    return `${prefix64}::/64`;
  }

  return 'anonymous';
};

/**
 * Case-insensitive header lookup supporting both Node header objects and Fetch Headers `.get()`.
 */
const getHeaderValue = (req, headerName) => {
  const target = String(headerName || '').toLowerCase();
  const headers = req?.headers;
  if (!headers) return '';

  if (typeof headers === 'object' && headers !== null) {
    const direct = headers[headerName] ?? headers[target];
    if (typeof direct === 'string' && direct.trim().length > 0) {
      return direct.trim();
    }
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === target && typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  if (typeof headers?.get === 'function') {
    const fetched = headers.get(headerName) ?? headers.get(target);
    if (typeof fetched === 'string' && fetched.trim().length > 0) {
      return fetched.trim();
    }
  }

  return '';
};

/**
 * Checks whether the request is executing in a verified Cloudflare Pages / Workers runtime.
 * Never relies merely on the presence of a `.get` function on the headers object.
 */
const isCloudflarePages = (options = {}, env = {}, req = {}) => {
  if (options?.trustCloudflare === true || options?.runtime === 'cloudflare-pages') {
    return true;
  }
  if (req?.isCloudflarePages === true) {
    return true;
  }
  if (env?.CF_PAGES === '1' || env?.CF_PAGES === true || env?.TRUST_CLOUDFLARE_PROXY === 'true') {
    return true;
  }
  if (typeof navigator !== 'undefined' && navigator?.userAgent === 'Cloudflare-Workers') {
    return true;
  }
  return false;
};

/**
 * Extracts and normalizes a client identifier (IP address) adhering strictly to verified proxy trust.
 *
 * Proxy IP trust model:
 * 1. Cloudflare Pages: When verified via runtime (`trustCloudflare`, `runtime: 'cloudflare-pages'`,
 *    `req.isCloudflarePages`, `CF_PAGES`, or `Cloudflare-Workers`), trust `cf-connecting-ip`.
 *    If missing/invalid/comma-separated, fallback to `req.socket.remoteAddress` or `'anonymous'`.
 *    Never fallback to untrusted headers (`x-forwarded-for`, `x-real-ip`).
 * 2. Plain Node runtime (no verified trusted proxy): Never trust client-supplied proxy headers
 *    (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`, `x-vercel-forwarded-for`).
 *    Use `req.socket.remoteAddress` validated via `normalizeIpForRateLimit()`.
 *    If unavailable or invalid, use `'anonymous'`.
 */
export const getClientIdentifier = (req, options = {}) => {
  const env =
    options?.env !== undefined
      ? options.env
      : (typeof process !== 'undefined' ? process.env : {}) || {};

  // 1. Verified Cloudflare Pages runtime
  if (isCloudflarePages(options, env, req)) {
    const cfConnectingIp = getHeaderValue(req, 'cf-connecting-ip');
    if (cfConnectingIp) {
      const normalized = normalizeIpForRateLimit(cfConnectingIp);
      if (normalized !== 'anonymous') {
        return normalized;
      }
    }

    const socketAddr = req?.socket?.remoteAddress;
    if (typeof socketAddr === 'string' && socketAddr.trim().length > 0) {
      const normalizedSocket = normalizeIpForRateLimit(socketAddr);
      if (normalizedSocket !== 'anonymous') {
        return normalizedSocket;
      }
    }
    return 'anonymous';
  }

  // 2. Plain Node runtime without verified trusted proxy:
  // Never trust client-supplied proxy headers (cf-connecting-ip, x-real-ip, x-forwarded-for, x-vercel-forwarded-for)
  const socketAddr = req?.socket?.remoteAddress;
  if (typeof socketAddr === 'string' && socketAddr.trim().length > 0) {
    const normalizedSocket = normalizeIpForRateLimit(socketAddr);
    if (normalizedSocket !== 'anonymous') {
      return normalizedSocket;
    }
  }

  return 'anonymous';
};

/**
 * Executes an Upstash Redis REST pipeline request with timeout protection and strict
 * response + command-level error validation (fail-closed).
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

    if (!response || !response.ok) {
      const status = response?.status ?? 'UNKNOWN';
      const errorText =
        typeof response?.text === 'function'
          ? await response.text().catch(() => '')
          : '';
      const err = new Error(`Upstash Redis HTTP ${status}: ${errorText}`);
      err.code = 'UPSTASH_HTTP_ERROR';
      err.status = response?.status;
      throw err;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      const err = new Error('Upstash Redis returned invalid JSON');
      err.code = 'UPSTASH_INVALID_RESPONSE';
      throw err;
    }

    if (!Array.isArray(data) || data.length !== commands.length) {
      const err = new Error('Invalid Upstash Redis pipeline response format');
      err.code = 'UPSTASH_INVALID_RESPONSE';
      throw err;
    }

    for (const item of data) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        const err = new Error('Malformed command entry in Upstash Redis pipeline response');
        err.code = 'UPSTASH_INVALID_RESPONSE';
        throw err;
      }

      if (item.error !== undefined && item.error !== null) {
        const err = new Error(`Upstash Redis command error: ${String(item.error)}`);
        err.code = 'UPSTASH_COMMAND_ERROR';
        throw err;
      }

      if (!('result' in item) || item.result === undefined || item.result === null) {
        const err = new Error('Upstash Redis command returned an empty result');
        err.code = 'UPSTASH_INVALID_RESPONSE';
        throw err;
      }
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
 * Validates the `[currentCount, pttl]` tuple returned by the atomic rate-limit Lua script.
 * Requires an array of length exactly 2 where:
 * - `currentCount` is a safe integer >= 1
 * - `pttl` is a safe non-negative integer >= 0 (`PTTL = 0` is normalized to `resetMs = 1` ms
 *   so boundary sub-millisecond TTLs neither fail open nor trigger unnecessary 502 errors).
 */
export const parseRateLimitEvalResult = (evalResult) => {
  if (!Array.isArray(evalResult) || evalResult.length !== 2) {
    const err = new Error('Invalid Upstash EVAL result: expected [currentCount, pttl] tuple of length 2');
    err.code = 'UPSTASH_INVALID_RESPONSE';
    throw err;
  }

  const [rawCount, rawPttl] = evalResult;

  if (
    typeof rawCount !== 'number' ||
    !Number.isInteger(rawCount) ||
    rawCount < 1 ||
    rawCount > Number.MAX_SAFE_INTEGER ||
    typeof rawPttl !== 'number' ||
    !Number.isInteger(rawPttl) ||
    rawPttl < 0 ||
    rawPttl > Number.MAX_SAFE_INTEGER
  ) {
    const err = new Error('Invalid Upstash EVAL result: counter or TTL out of expected integer range');
    err.code = 'UPSTASH_INVALID_RESPONSE';
    throw err;
  }

  const resetMs = rawPttl === 0 ? 1 : rawPttl;

  return { currentCount: rawCount, pttl: rawPttl, resetMs };
};

/**
 * Creates a shared Upstash Redis rate limiter instance compatible with Cloudflare Pages Functions
 * and Node.js environments.
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
  const normalizedMaxRequests =
    Number.isInteger(Number(maxRequests)) && Number(maxRequests) > 0
      ? Number(maxRequests)
      : DEFAULT_RATE_LIMIT_MAX;
  const normalizedWindowMs =
    Number.isInteger(Number(windowMs)) && Number(windowMs) > 0
      ? Number(windowMs)
      : DEFAULT_RATE_LIMIT_WINDOW_MS;

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

      const normalizedId = normalizeIpForRateLimit(String(identifier || 'anonymous'));
      const safeId = String(normalizedId || 'anonymous').replace(/[^a-zA-Z0-9:._-]/g, '_');
      const redisKey = `${keyPrefix}:${safeId}`;

      // Atomically increment counter, inspect TTL, and set expiration if needed via Redis Lua EVAL
      const pipelineRes = await executeUpstashPipeline({
        restUrl,
        restToken,
        fetchImpl,
        timeoutMs,
        commands: [
          ['EVAL', RATE_LIMIT_LUA_SCRIPT, '1', redisKey, String(normalizedWindowMs)],
        ],
      });

      const { currentCount, resetMs } = parseRateLimitEvalResult(pipelineRes[0].result);

      const remaining = Math.max(0, normalizedMaxRequests - currentCount);
      const allowed = currentCount <= normalizedMaxRequests;
      const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));

      return {
        allowed,
        limit: normalizedMaxRequests,
        current: currentCount,
        remaining,
        resetMs,
        retryAfterSeconds,
        provider: 'upstash-redis',
      };
    },
  };
};
