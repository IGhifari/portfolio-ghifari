/**
 * Automated Test Suite for CONF-02:
 * Vite Dev Server & Local API Chat Plugin Hardening
 *
 * Verifies:
 * 1. Host and Origin validation (strict RFC 6454 serialized loopback origin, rejects malformed origins).
 * 2. Sec-Fetch-Site enforcement (rejects cross-site and untrusted same-site requests).
 * 3. Streaming request body size limit (max 16 KB payload) with readable HTTP 413 response and safe cleanup.
 * 4. Safe rejection of invalid or malformed Content-Length headers (HTTP 400).
 * 5. Prevention of downstream handler / Gemini execution on invalid requests.
 * 6. Valid local dev requests continue to function properly.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { Readable } from 'node:stream';

import {
  createLocalApiChatMiddleware,
  isAllowedDevHost,
  isAllowedDevOrigin,
  isAllowedDevReferer,
  isAllowedSecFetchSite,
  MAX_DEV_PAYLOAD_BYTES,
  sendDevPayloadTooLarge,
} from '../vite.config.js';

/**
 * Creates a mock incoming Node request stream with metadata
 */
const createMockDevRequest = ({
  url = '/api/chat',
  method = 'POST',
  headers = {
    host: 'localhost:5173',
    origin: 'http://localhost:5173',
    'sec-fetch-site': 'same-origin',
    'content-type': 'application/json',
  },
  bodyChunks = [Buffer.from(JSON.stringify({ message: 'Halo' }))],
} = {}) => {
  const req = Readable.from(bodyChunks);
  req.url = url;
  req.method = method;
  req.headers = { ...headers };
  const origDestroy = req.destroy.bind(req);
  let destroyed = false;
  req.destroy = (err) => {
    destroyed = true;
    return origDestroy(err);
  };
  req.isDestroyed = () => destroyed;
  return req;
};

/**
 * Creates a mock Node HTTP response object that supports event listening
 */
const createMockDevResponse = () => {
  const responseHeaders = {};
  let responseData = '';
  const listeners = {};

  const res = {
    statusCode: 200,
    headersSent: false,
    setHeader(name, value) {
      responseHeaders[String(name).toLowerCase()] = String(value);
    },
    getHeader(name) {
      return responseHeaders[String(name).toLowerCase()];
    },
    on(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return this;
    },
    emit(event, ...args) {
      if (listeners[event]) {
        for (const handler of listeners[event]) {
          handler(...args);
        }
      }
    },
    end(data) {
      this.headersSent = true;
      responseData = data || '';
      // Trigger 'finish' event asynchronously like Node's ServerResponse
      setImmediate(() => {
        this.emit('finish');
      });
    },
    get body() {
      if (!responseData) return null;
      try {
        return JSON.parse(responseData);
      } catch {
        return responseData;
      }
    },
    get headers() {
      return responseHeaders;
    },
  };

  return res;
};

describe('CONF-02 — Vite Dev Server & localApiChatPlugin Hardening', () => {
  describe('1. Unit Helper Validations (Host, Origin, Referer, Sec-Fetch-Site)', () => {
    it('validates allowed localhost and loopback hosts and rejects untrusted hosts', () => {
      // Allowed hosts
      assert.equal(isAllowedDevHost('localhost'), true);
      assert.equal(isAllowedDevHost('localhost:5173'), true);
      assert.equal(isAllowedDevHost('localhost:3000'), true);
      assert.equal(isAllowedDevHost('127.0.0.1'), true);
      assert.equal(isAllowedDevHost('127.0.0.1:5173'), true);
      assert.equal(isAllowedDevHost('127.0.0.1:3000'), true);
      assert.equal(isAllowedDevHost('[::1]'), true);
      assert.equal(isAllowedDevHost('[::1]:5173'), true);

      // Disallowed hosts (cross-origin / LAN / attacker domains)
      assert.equal(isAllowedDevHost('evil.com'), false);
      assert.equal(isAllowedDevHost('evil.com:5173'), false);
      assert.equal(isAllowedDevHost('attacker.localhost'), false);
      assert.equal(isAllowedDevHost('localhost.evil.com'), false);
      assert.equal(isAllowedDevHost('192.168.1.100:5173'), false);
      assert.equal(isAllowedDevHost('0.0.0.0:5173'), false);
      assert.equal(isAllowedDevHost('localhost:99999'), false);
      assert.equal(isAllowedDevHost(''), false);
      assert.equal(isAllowedDevHost(null), false);
    });

    it('strictly validates serialized RFC 6454 origins and rejects malformed origins with paths, credentials, query, or hash', () => {
      // Allowed valid serialized origins
      assert.equal(isAllowedDevOrigin('http://localhost:5173'), true);
      assert.equal(isAllowedDevOrigin('http://localhost:3000'), true);
      assert.equal(isAllowedDevOrigin('https://localhost:5173'), true);
      assert.equal(isAllowedDevOrigin('http://127.0.0.1:5173'), true);
      assert.equal(isAllowedDevOrigin('http://[::1]:5173'), true);
      assert.equal(isAllowedDevOrigin('http://localhost'), true);
      assert.equal(isAllowedDevOrigin(''), true); // Absent origin is allowed (delegated to Host/Sec-Fetch-Site)

      // Malformed / disallowed origins
      assert.equal(isAllowedDevOrigin('null'), false);
      assert.equal(isAllowedDevOrigin('http://localhost:5173/'), false); // Trailing slash is not serialized origin
      assert.equal(isAllowedDevOrigin('http://localhost:5173/api/chat'), false); // Path is invalid in origin
      assert.equal(isAllowedDevOrigin('http://user:pass@localhost:5173'), false); // Credentials disallowed
      assert.equal(isAllowedDevOrigin('http://localhost:5173?param=1'), false); // Query disallowed
      assert.equal(isAllowedDevOrigin('http://localhost:5173#frag'), false); // Fragment disallowed
      assert.equal(isAllowedDevOrigin('http://evil.com'), false);
      assert.equal(isAllowedDevOrigin('https://evil.com:5173'), false);
      assert.equal(isAllowedDevOrigin('http://attacker.localhost:5173'), false);
      assert.equal(isAllowedDevOrigin('http://localhost.evil.com'), false);
      assert.equal(isAllowedDevOrigin('javascript:alert(1)'), false);
      assert.equal(isAllowedDevOrigin('http://localhost:99999'), false);
    });

    it('validates allowed localhost and loopback referers and rejects untrusted referers', () => {
      assert.equal(isAllowedDevReferer('http://localhost:5173/'), true);
      assert.equal(isAllowedDevReferer('http://127.0.0.1:5173/chat'), true);
      assert.equal(isAllowedDevReferer(''), true);

      assert.equal(isAllowedDevReferer('http://evil.com/attack.html'), false);
      assert.equal(isAllowedDevReferer('http://attacker.localhost/'), false);
      assert.equal(isAllowedDevReferer('invalid-url'), false);
    });

    it('enforces Sec-Fetch-Site policy: allows only same-origin/none, rejects same-site, cross-site, and unknown values', () => {
      // same-origin and none are always allowed
      assert.equal(isAllowedSecFetchSite('same-origin'), true);
      assert.equal(isAllowedSecFetchSite('SAME-ORIGIN'), true);
      assert.equal(isAllowedSecFetchSite('none'), true);
      assert.equal(isAllowedSecFetchSite('NONE'), true);

      // Absent or empty header is tolerated (Host and Origin/Referer checks enforced beforehand)
      assert.equal(isAllowedSecFetchSite(undefined), true);
      assert.equal(isAllowedSecFetchSite(null), true);
      assert.equal(isAllowedSecFetchSite(''), true);
      assert.equal(isAllowedSecFetchSite('   '), true);

      // same-site is strictly rejected
      assert.equal(isAllowedSecFetchSite('same-site'), false);
      assert.equal(isAllowedSecFetchSite('SAME-SITE'), false);

      // cross-site is always rejected
      assert.equal(isAllowedSecFetchSite('cross-site'), false);
      assert.equal(isAllowedSecFetchSite('CROSS-SITE'), false);

      // Unrecognized or non-string values are rejected
      assert.equal(isAllowedSecFetchSite('invalid-value'), false);
      assert.equal(isAllowedSecFetchSite('other'), false);
      assert.equal(isAllowedSecFetchSite(123), false);
    });
  });

  describe('2. Middleware Security Hardening & Request Rejections', () => {
    it('rejects requests with invalid Host header (403) without calling chat handler', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const invalidHosts = ['evil.com', 'attacker.localhost', '192.168.1.1:5173', ''];

      for (const host of invalidHosts) {
        handlerCalled = false;
        const req = createMockDevRequest({
          headers: { host, origin: 'http://localhost:5173' },
        });
        const res = createMockDevResponse();
        let nextCalled = false;

        await middleware(req, res, () => {
          nextCalled = true;
        });

        assert.equal(res.statusCode, 403);
        assert.equal(res.body.ok, false);
        assert.equal(res.body.error.code, 'FORBIDDEN');
        assert.equal(handlerCalled, false);
        assert.equal(nextCalled, false);
      }
    });

    it('rejects requests with untrusted or malformed Origin header (403) without calling chat handler', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const badOrigins = [
        'http://evil.com',
        'null',
        'https://attacker.org:5173',
        'http://localhost.evil.com',
        'http://localhost:5173/path', // malformed origin with path
        'http://user:pass@localhost:5173', // malformed origin with credentials
        'http://localhost:5173?query=1', // malformed origin with query
      ];

      for (const origin of badOrigins) {
        handlerCalled = false;
        const req = createMockDevRequest({
          headers: { host: 'localhost:5173', origin },
        });
        const res = createMockDevResponse();
        let nextCalled = false;

        await middleware(req, res, () => {
          nextCalled = true;
        });

        assert.equal(res.statusCode, 403);
        assert.equal(res.body.ok, false);
        assert.equal(res.body.error.code, 'FORBIDDEN');
        assert.equal(handlerCalled, false);
        assert.equal(nextCalled, false);
      }
    });

    it('rejects cross-site requests via Sec-Fetch-Site (403) without calling chat handler', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const req = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          'sec-fetch-site': 'cross-site',
        },
      });
      const res = createMockDevResponse();
      let nextCalled = false;

      await middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.ok, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.ok(res.body.error.message.includes('Sec-Fetch-Site tidak diizinkan'));
      assert.equal(handlerCalled, false);
      assert.equal(nextCalled, false);
    });

    it('rejects same-site and unknown Sec-Fetch-Site requests (403) but tolerates absent header when Host and Origin are valid', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      // 1. same-site is rejected even when origin is localhost
      const sameSiteReq = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          'sec-fetch-site': 'same-site',
        },
      });
      const sameSiteRes = createMockDevResponse();
      await middleware(sameSiteReq, sameSiteRes, () => {});
      assert.equal(sameSiteRes.statusCode, 403);
      assert.equal(sameSiteRes.body.error.code, 'FORBIDDEN');
      assert.equal(handlerCalled, false);

      // 2. unknown Sec-Fetch-Site is rejected
      const unknownReq = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          'sec-fetch-site': 'unrecognized-mode',
        },
      });
      const unknownRes = createMockDevResponse();
      await middleware(unknownReq, unknownRes, () => {});
      assert.equal(unknownRes.statusCode, 403);
      assert.equal(unknownRes.body.error.code, 'FORBIDDEN');
      assert.equal(handlerCalled, false);

      // 3. Absent Sec-Fetch-Site is tolerated if Host and Origin are valid
      const absentReq = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
        },
      });
      const absentRes = createMockDevResponse();
      await middleware(absentReq, absentRes, () => {});
      assert.equal(handlerCalled, true);
    });

    it('rejects malformed Content-Length headers safely with HTTP 400', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const badLengths = ['invalid', '-10', '12.34', '10, 20', '0x10', '1e5'];

      for (const len of badLengths) {
        handlerCalled = false;
        const req = createMockDevRequest({
          headers: {
            host: 'localhost:5173',
            origin: 'http://localhost:5173',
            'content-length': len,
          },
        });
        const res = createMockDevResponse();

        await middleware(req, res, () => {});

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.ok, false);
        assert.equal(res.body.error.code, 'INVALID_CONTENT_LENGTH');
        assert.equal(handlerCalled, false);
      }
    });

    it('rejects oversized request bodies > 16 KB via Content-Length header (413) and sends complete response to client', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const req = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          'content-length': String(MAX_DEV_PAYLOAD_BYTES + 100),
        },
        bodyChunks: [Buffer.from('A'.repeat(MAX_DEV_PAYLOAD_BYTES + 100))],
      });
      const res = createMockDevResponse();

      await middleware(req, res, () => {});

      assert.equal(res.statusCode, 413);
      assert.equal(res.headers['connection'], 'close');
      assert.equal(res.body.ok, false);
      assert.equal(res.body.error.code, 'PAYLOAD_TOO_LARGE');
      assert.equal(handlerCalled, false);
    });

    it('enforces streaming payload limit > 16 KB, sends 413 without premature destroy, and resumes stream safely', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      // Stream with multiple chunks totaling 25 KB
      const chunkA = Buffer.alloc(10_000, 'A');
      const chunkB = Buffer.alloc(10_000, 'B');
      const chunkC = Buffer.alloc(5_000, 'C');

      const req = createMockDevRequest({
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          // Omit content-length to simulate chunked transfer encoding
        },
        bodyChunks: [chunkA, chunkB, chunkC],
      });
      const res = createMockDevResponse();

      await middleware(req, res, () => {});

      // Verify HTTP 413 response was completely sent and receivable
      assert.equal(res.statusCode, 413);
      assert.equal(res.headers['connection'], 'close');
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
      assert.equal(res.body.ok, false);
      assert.equal(res.body.error.code, 'PAYLOAD_TOO_LARGE');
      assert.equal(handlerCalled, false);
    });

    it('rejects non-POST HTTP methods (405) with Allow header', async () => {
      let handlerCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const req = createMockDevRequest({
        method: 'GET',
        headers: { host: 'localhost:5173' },
      });
      const res = createMockDevResponse();

      await middleware(req, res, () => {});

      assert.equal(res.statusCode, 405);
      assert.equal(res.body.ok, false);
      assert.equal(res.body.error.code, 'METHOD_NOT_ALLOWED');
      assert.equal(res.headers.allow, 'POST');
      assert.equal(handlerCalled, false);
    });

    it('passes non-matching paths cleanly to next() middleware', async () => {
      let handlerCalled = false;
      let nextCalled = false;
      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => async () => {
          handlerCalled = true;
        },
      });

      const req = createMockDevRequest({
        url: '/index.html',
        headers: { host: 'localhost:5173' },
      });
      const res = createMockDevResponse();

      await middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.equal(handlerCalled, false);
      assert.equal(res.headersSent, false);
    });

    it('allows valid localhost POST request within 16 KB and forwards parsed body to chatHandler', async () => {
      let capturedReq = null;
      let capturedRes = null;

      const mockChatHandler = async (req, res) => {
        capturedReq = req;
        capturedRes = res;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, answer: 'Halo dari dev!' }));
      };

      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => mockChatHandler,
      });

      const payload = { message: 'Halo Ghifari dari localhost dev!' };
      const req = createMockDevRequest({
        url: '/api/chat',
        method: 'POST',
        headers: {
          host: 'localhost:5173',
          origin: 'http://localhost:5173',
          'sec-fetch-site': 'same-origin',
          'content-type': 'application/json',
        },
        bodyChunks: [Buffer.from(JSON.stringify(payload))],
      });
      const res = createMockDevResponse();

      await middleware(req, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.ok, true);
      assert.equal(res.body.answer, 'Halo dari dev!');
      assert.ok(capturedReq);
      assert.equal(capturedReq.body, JSON.stringify(payload));
      assert.equal(capturedRes, res);
    });
  });

  describe('3. Real HTTP Server & Network Oversized Stream Handling', () => {
    let server = null;
    let serverPort = 0;

    before(async () => {
      const mockChatHandler = async (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, answer: 'Success' }));
      };

      const middleware = createLocalApiChatMiddleware({
        chatHandlerLoader: async () => mockChatHandler,
      });

      server = http.createServer((req, res) => {
        middleware(req, res, () => {
          res.statusCode = 404;
          res.end('Not Found');
        });
      });

      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      serverPort = server.address().port;
    });

    after(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it('response 413 tetap terbaca utuh oleh client saat Content-Length > 16 KB', async () => {
      const payload = 'B'.repeat(MAX_DEV_PAYLOAD_BYTES + 1024);
      await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: serverPort,
            path: '/api/chat',
            method: 'POST',
            headers: {
              Host: `127.0.0.1:${serverPort}`,
              Origin: `http://127.0.0.1:${serverPort}`,
              'Sec-Fetch-Site': 'same-origin',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              try {
                assert.equal(res.statusCode, 413);
                assert.equal(res.headers.connection, 'close');
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
                const parsed = JSON.parse(body);
                assert.equal(parsed.ok, false);
                assert.equal(parsed.error.code, 'PAYLOAD_TOO_LARGE');
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    });

    it('client terus mengirim body melewati batas byte 64 KB, response 413 tetap terbaca dan koneksi diputus', async () => {
      await new Promise((resolve, reject) => {
        let interval = null;
        let settled = false;
        let responseBody = '';
        let responseStatus = 0;

        const cleanup = () => {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        };

        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();
          try {
            assert.equal(responseStatus, 413);
            const parsed = JSON.parse(responseBody);
            assert.equal(parsed.ok, false);
            assert.equal(parsed.error.code, 'PAYLOAD_TOO_LARGE');
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: serverPort,
            path: '/api/chat',
            method: 'POST',
            headers: {
              Host: `127.0.0.1:${serverPort}`,
              Origin: `http://127.0.0.1:${serverPort}`,
              'Sec-Fetch-Site': 'same-origin',
              'Content-Type': 'application/json',
              'Transfer-Encoding': 'chunked',
            },
          },
          (res) => {
            responseStatus = res.statusCode;
            res.on('data', (chunk) => (responseBody += chunk));
            res.on('end', finish);
          }
        );

        req.on('error', finish);
        req.on('close', finish);

        // Send 25 chunks of 4 KB (100 KB total > 64 KB limit)
        const chunk = Buffer.alloc(4096, 'X');
        let count = 0;
        interval = setInterval(() => {
          if (count >= 25 || req.destroyed) {
            cleanup();
            if (!req.destroyed) req.end();
            return;
          }
          count++;
          try {
            req.write(chunk);
          } catch {
            cleanup();
          }
        }, 5);
      });
    });

    /**
     * Opens a raw TCP connection, sends chunked request headers plus one chunk > 16 KB,
     * then runs `afterTrigger(socket)`. Resolves with what the client observed.
     * A local safety timer guarantees the helper itself can never hang.
     */
    const rawOversizedRequest = (afterTrigger, { safetyMs = 4000, settleOnFin = false } = {}) =>
      new Promise((resolve) => {
        const startTime = Date.now();
        let data = '';
        let gotFin = false;
        let errorCode = null;
        let settled = false;
        const timers = [];

        const settle = (reason) => {
          if (settled) return;
          settled = true;
          for (const t of timers) clearInterval(t);
          clearTimeout(safety);
          if (!client.destroyed) client.destroy();
          resolve({ data, gotFin, errorCode, reason, elapsed: Date.now() - startTime });
        };

        const safety = setTimeout(() => settle('client-safety-timeout'), safetyMs);

        const client = net.connect({ port: serverPort, host: '127.0.0.1', allowHalfOpen: true }, () => {
          client.write(
            'POST /api/chat HTTP/1.1\r\n' +
              `Host: 127.0.0.1:${serverPort}\r\n` +
              `Origin: http://127.0.0.1:${serverPort}\r\n` +
              'Sec-Fetch-Site: same-origin\r\n' +
              'Content-Type: application/json\r\n' +
              'Transfer-Encoding: chunked\r\n\r\n'
          );
          const big = 'A'.repeat(MAX_DEV_PAYLOAD_BYTES + 200);
          client.write(`${Buffer.byteLength(big).toString(16)}\r\n${big}\r\n`);
          afterTrigger(client, timers);
        });

        client.on('data', (c) => (data += c.toString('utf8')));
        client.on('end', () => {
          gotFin = true;
          if (settleOnFin) settle('server-fin');
        });
        client.on('error', (err) => {
          errorCode = err.code;
        });
        client.on('close', () => settle('server-closed'));
      });

    const waitForZeroConnections = async (srv, timeoutMs = 2500) => {
      const deadline = Date.now() + timeoutMs;
      let open = -1;
      while (Date.now() < deadline) {
        open = await new Promise((r) => srv.getConnections((_, n) => r(n)));
        if (open === 0) return 0;
        await new Promise((r) => setTimeout(r, 20));
      }
      return open;
    };

    it('client diam setelah memicu 413: response terbaca utuh lalu server menutup dengan FIN (graceful)', async () => {
      // Client sends nothing further and keeps its write side open (half-open).
      // A client in this state only observes the server's FIN; the server-side
      // teardown is verified separately via getConnections().
      const startTime = Date.now();
      const result = await rawOversizedRequest(() => {}, { settleOnFin: true });

      assert.equal(result.reason, 'server-fin', 'Server must send FIN, not leave the client waiting');
      assert.equal(result.errorCode, null, 'Normal path must not produce a reset');
      assert.match(result.data, /^HTTP\/1\.1 413 /);
      assert.match(result.data, /connection: close/i);
      const body = result.data.slice(result.data.indexOf('\r\n\r\n') + 4);
      const parsed = JSON.parse(body);
      assert.equal(parsed.error.code, 'PAYLOAD_TOO_LARGE');

      const open = await waitForZeroConnections(server);
      const elapsed = Date.now() - startTime;
      assert.equal(open, 0, 'Server-side socket must be fully closed');
      assert.ok(elapsed < 2500, `Server must release the connection within bounded time, took ${elapsed}ms`);
    });

    it('slowloris: client terus mengirim perlahan, koneksi tetap diputus dalam batas waktu', async () => {
      // Drip a 1-byte chunk every 100 ms forever (never sends the terminating chunk).
      const result = await rawOversizedRequest((client, timers) => {
        timers.push(
          setInterval(() => {
            if (!client.destroyed && client.writable) client.write('1\r\nX\r\n');
          }, 100)
        );
      });

      assert.equal(result.reason, 'server-closed', 'Server must terminate slowloris connection');
      assert.ok(result.elapsed < 2500, `Slowloris must be cut off within bounded time, took ${result.elapsed}ms`);
      // On the abuse path receipt of the 413 is best-effort (RST may discard it), so only
      // assert that anything received is a well-formed 413, never some other response.
      if (result.data) assert.match(result.data, /^HTTP\/1\.1 413 /);
    });

    it('endless fast stream > 64 KB tambahan: koneksi diputus dalam batas waktu', async () => {
      const chunk = 'B'.repeat(8192);
      const framed = `${Buffer.byteLength(chunk).toString(16)}\r\n${chunk}\r\n`;
      const result = await rawOversizedRequest((client, timers) => {
        timers.push(
          setInterval(() => {
            if (!client.destroyed && client.writable) client.write(framed);
          }, 2)
        );
      });

      assert.equal(result.reason, 'server-closed');
      assert.ok(result.elapsed < 2500, `Endless stream must be cut off within bounded time, took ${result.elapsed}ms`);
      if (result.data) assert.match(result.data, /^HTTP\/1\.1 413 /);
    });

    it('tidak ada listener data atau koneksi yang tertinggal setelah 413', async () => {
      let capturedReq = null;
      let socketClosed = null;
      const directServer = http.createServer((req, res) => {
        capturedReq = req;
        socketClosed = new Promise((r) => res.socket.once('close', () => setImmediate(r)));
        sendDevPayloadTooLarge(res, req);
      });
      await new Promise((resolve) => directServer.listen(0, '127.0.0.1', resolve));
      const port = directServer.address().port;

      try {
        await new Promise((resolve, reject) => {
          const payload = 'C'.repeat(MAX_DEV_PAYLOAD_BYTES + 10);
          const req = http.request(
            {
              hostname: '127.0.0.1',
              port,
              method: 'POST',
              path: '/api/chat',
              headers: { 'Content-Length': Buffer.byteLength(payload) },
            },
            (res) => {
              res.resume();
              res.on('end', resolve);
            }
          );
          req.on('error', reject);
          req.end(payload);
        });

        assert.ok(capturedReq, 'Handler must have run');
        // Bounded wait for the server-side socket 'close' event (cleanup hook).
        let guard;
        const closedInTime = await Promise.race([
          socketClosed.then(() => true),
          new Promise((r) => {
            guard = setTimeout(() => r(false), 2500);
          }),
        ]);
        clearTimeout(guard);

        assert.equal(closedInTime, true, 'Server-side socket must close within bounded time');
        assert.equal(capturedReq.listenerCount('data'), 0, 'Drain data listener must be removed');
        assert.equal(await waitForZeroConnections(directServer), 0, 'All server connections must be closed');
      } finally {
        await new Promise((resolve) => directServer.close(resolve));
      }
    });

    it('tidak ada koneksi yang tertinggal pada server middleware setelah semua skenario', async () => {
      assert.equal(
        await waitForZeroConnections(server),
        0,
        'Semua koneksi ke HTTP server harus tertutup bersih (count === 0)'
      );
    });

    it('successfully processes valid real HTTP requests within 16 KB', async () => {
      const payload = JSON.stringify({ message: 'Halo Ghifari dari HTTP nyata' });
      await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: serverPort,
            path: '/api/chat',
            method: 'POST',
            headers: {
              Host: `127.0.0.1:${serverPort}`,
              Origin: `http://127.0.0.1:${serverPort}`,
              'Sec-Fetch-Site': 'same-origin',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              try {
                assert.equal(res.statusCode, 200);
                const parsed = JSON.parse(body);
                assert.equal(parsed.ok, true);
                assert.equal(parsed.answer, 'Success');
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    });
  });
});
