import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CACHE_TTL_MS,
  createCloudflarePagesGithubHandler,
} from '../functions/api/github.js';

const SAMPLE_CONTRIB_HTML = `
  <h2>920 contributions in the last year</h2>
  <td data-date="2026-11-18" id="day-1" data-level="1" class="ContributionCalendar-day"></td>
  <td data-date="2026-11-19" id="day-2" data-level="3" class="ContributionCalendar-day"></td>
  <tool-tip for="day-1">2 contributions on Nov 18</tool-tip>
  <tool-tip for="day-2">6 contributions on Nov 19</tool-tip>
`;

const createSuccessFetch = (counter = { user: 0, contrib: 0 }, captured = {}) => async (url, options = {}) => {
  if (url.includes('/users/IGhifari/contributions')) {
    counter.contrib++;
    captured.contribOptions = options;
    return {
      ok: true,
      status: 200,
      text: async () => SAMPLE_CONTRIB_HTML,
    };
  }
  counter.user++;
  captured.userOptions = options;
  return {
    ok: true,
    status: 200,
    json: async () => ({
      login: 'IGhifari',
      name: 'M. Ghifari Bima Khadafi',
      public_repos: 30,
      followers: 25,
      following: 18,
    }),
  };
};

test('Phase 9.1 — Cloudflare Pages GitHub Proxy Hardening (functions/api/github.js)', async (t) => {
  await t.test('1. Cache miss performs upstream fetch and returns live payload with edge Cache-Control', async () => {
    const counter = { user: 0, contrib: 0 };
    const captured = {};
    let now = 1_700_000_000_000;

    const handler = createCloudflarePagesGithubHandler({
      fetchFn: createSuccessFetch(counter, captured),
      nowFn: () => now,
    });

    const res = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
      env: {},
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Data-Source'), 'live');
    assert.equal(res.headers.get('Cache-Control'), 'public, max-age=900, s-maxage=900');
    assert.ok(captured.userOptions?.signal instanceof AbortSignal, 'User fetch must pass an AbortSignal');
    assert.ok(captured.contribOptions?.signal instanceof AbortSignal, 'Contributions fetch must pass an AbortSignal');

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.contributionsLive, true);
    assert.equal(body.data.profile.publicRepos, 30);
    assert.equal(body.data.contributions.total, 920);
    assert.equal(counter.user, 1);
    assert.equal(counter.contrib, 1);
  });

  await t.test('2. Normal cached response serves memory cache within TTL and expires after TTL', async () => {
    const counter = { user: 0, contrib: 0 };
    let now = 1_700_000_000_000;

    const handler = createCloudflarePagesGithubHandler({
      fetchFn: createSuccessFetch(counter),
      nowFn: () => now,
    });

    // Initial cache miss
    await handler({ request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }) });
    assert.equal(counter.user, 1);
    assert.equal(counter.contrib, 1);

    // Within TTL -> cache hit
    now += CACHE_TTL_MS - 1_000;
    const cachedRes = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });
    assert.equal(cachedRes.status, 200);
    assert.equal(cachedRes.headers.get('X-Cache'), 'HIT-MEMORY');
    const cachedBody = await cachedRes.json();
    assert.equal(cachedBody.fromCache, true);
    assert.equal(counter.user, 1);
    assert.equal(counter.contrib, 1);

    // Past TTL -> cache miss & fresh upstream fetch
    now += 2_000;
    const freshRes = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });
    assert.equal(freshRes.status, 200);
    assert.equal(freshRes.headers.get('X-Data-Source'), 'live');
    assert.equal(counter.user, 2);
    assert.equal(counter.contrib, 2);
  });

  await t.test('3. SEC-01 — Public refresh query (?refresh=1) and header (x-refresh: 1) do NOT bypass cache', async () => {
    const counter = { user: 0, contrib: 0 };
    const now = 1_700_000_000_000;

    const handler = createCloudflarePagesGithubHandler({
      fetchFn: createSuccessFetch(counter),
      nowFn: () => now,
    });

    await handler({ request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }) });
    assert.equal(counter.user, 1);

    const resQuery = await handler({
      request: new Request('https://www.ighifari.my.id/api/github?refresh=1', { method: 'GET' }),
    });
    const bodyQuery = await resQuery.json();
    assert.equal(resQuery.headers.get('X-Cache'), 'HIT-MEMORY');
    assert.equal(bodyQuery.fromCache, true);

    const resHeader = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', {
        method: 'GET',
        headers: { 'x-refresh': '1' },
      }),
    });
    const bodyHeader = await resHeader.json();
    assert.equal(resHeader.headers.get('X-Cache'), 'HIT-MEMORY');
    assert.equal(bodyHeader.fromCache, true);

    assert.equal(counter.user, 1, 'Repeated refresh attempts must not trigger upstream user fetches');
    assert.equal(counter.contrib, 1, 'Repeated refresh attempts must not trigger upstream contribution fetches');
  });

  await t.test('4. SEC-02 — Upstream timeout aborts hung requests and falls back gracefully with no-store', async () => {
    let abortedCount = 0;
    const hangingFetch = (_url, options = {}) =>
      new Promise((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          abortedCount++;
          const abortErr = new Error('The operation was aborted');
          abortErr.name = 'AbortError';
          reject(abortErr);
        });
      });

    const handler = createCloudflarePagesGithubHandler({
      fetchFn: hangingFetch,
      timeoutMs: 15,
    });

    const res = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });

    assert.equal(res.status, 200);
    assert.equal(abortedCount, 2, 'Both profile and contributions fetches must be aborted on timeout');
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
    assert.equal(res.headers.get('X-Data-Source'), 'fallback');

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.fallback, true);
    assert.equal(body.contributionsLive, false);
    assert.equal(body.data.profile.login, 'IGhifari');
  });

  await t.test('5. Profile request failure preserves live contributions fallback', async () => {
    const mockFetch = async (url) => {
      if (url.includes('/users/IGhifari/contributions')) {
        return { ok: true, status: 200, text: async () => SAMPLE_CONTRIB_HTML };
      }
      return { ok: false, status: 500 };
    };

    const handler = createCloudflarePagesGithubHandler({ fetchFn: mockFetch });
    const res = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Data-Source'), 'partial-live');
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.fallback, true);
    assert.equal(body.contributionsLive, true);
    assert.equal(body.data.contributions.total, 920);
  });

  await t.test('6. Contribution request failure preserves live profile with static fallback contributions', async () => {
    const mockFetch = async (url) => {
      if (url.includes('/users/IGhifari/contributions')) {
        return { ok: false, status: 503 };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ login: 'IGhifari', public_repos: 33 }),
      };
    };

    const handler = createCloudflarePagesGithubHandler({ fetchFn: mockFetch });
    const res = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Data-Source'), 'live');
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.contributionsLive, false);
    assert.equal(body.data.profile.publicRepos, 33);
    assert.ok(body.data.contributions.total > 0);
  });

  await t.test('7. SEC-03 — Uncaught exception returns generic error message and is NOT cached', async () => {
    const handler = createCloudflarePagesGithubHandler({
      fetchFn: createSuccessFetch(),
      nowFn: () => 1_700_000_000_000,
    });

    // Trigger uncaught exception inside handler via throwing request.method getter
    const badRequest = {
      get method() {
        throw new Error('SENSITIVE_INTERNAL_STACK_DETAIL_XYZ');
      },
    };

    const errRes = await handler({ request: badRequest });
    assert.equal(errRes.status, 200);
    assert.equal(errRes.headers.get('Cache-Control'), 'no-store');
    assert.equal(errRes.headers.get('X-Data-Source'), 'exception-fallback');

    const errBody = await errRes.json();
    assert.equal(errBody.ok, true);
    assert.equal(errBody.fallback, true);
    assert.equal(errBody.error, 'Unable to fetch GitHub activity right now.');
    assert.ok(
      !JSON.stringify(errBody).includes('SENSITIVE_INTERNAL_STACK_DETAIL_XYZ'),
      'Exception response must never leak raw internal error messages'
    );

    // Subsequent valid request must NOT be served a cached error fallback
    const okRes = await handler({
      request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
    });
    assert.equal(okRes.status, 200);
    assert.equal(okRes.headers.get('X-Data-Source'), 'live');
    const okBody = await okRes.json();
    assert.equal(okBody.fallback, undefined);
    assert.equal(okBody.data.profile.publicRepos, 30);
  });

  await t.test('8. Missing optional GITHUB_TOKEN works cleanly without sending Authorization header', async () => {
    const captured = {};
    const prevGithubToken = process.env.GITHUB_TOKEN;
    const prevGhToken = process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    try {
      const handler = createCloudflarePagesGithubHandler({
        fetchFn: createSuccessFetch({ user: 0, contrib: 0 }, captured),
      });

      const res = await handler({
        request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }),
        env: {},
      });

      assert.equal(res.status, 200);
      assert.equal(captured.userOptions?.headers?.Authorization, undefined);
    } finally {
      if (prevGithubToken !== undefined) process.env.GITHUB_TOKEN = prevGithubToken;
      if (prevGhToken !== undefined) process.env.GH_TOKEN = prevGhToken;
    }
  });
});
