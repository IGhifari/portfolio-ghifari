/**
 * Cloudflare Pages Function: GitHub Activity & Contribution Proxy
 *
 * Route: GET /api/github
 * Target Runtime: Cloudflare Workers / Pages Functions
 *
 * Proxies and aggregates GitHub public profile and annual contribution calendar
 * data with edge caching to satisfy CSP connect-src ('self') and rate limits.
 * Gracefully serves verified fallback data when GitHub rate limit (403/429) occurs.
 */

import {
  GITHUB_USERNAME,
  sanitizeUserProfile,
  parseContributionHtml,
} from '../../src/services/githubService.js';
import { initialContributionsData } from '../../src/data/githubContributions.js';

export const createCloudflarePagesGithubHandler = ({
  fetchFn = fetch,
} = {}) => {
  // Worker-scoped cache for edge runtime isolates
  let memoryCache = {
    payload: null,
    timestamp: 0,
  };

  return async function handleCloudflareRequest(context = {}) {
    try {
      const { request, env = {} } = context;

      // Handle CORS Preflight / Method Validation
      const method = (request?.method || 'GET').toUpperCase();
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            Allow: 'GET, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (method !== 'GET') {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'METHOD_NOT_ALLOWED',
              message: 'Metode HTTP tidak didukung. Gunakan metode GET.',
            },
          }),
          {
            status: 405,
            headers: {
              Allow: 'GET, OPTIONS',
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      // 1. Check module-scoped in-memory cache (15 mins TTL)
      const CACHE_TTL_MS = 15 * 60 * 1000;
      const isFresh =
        memoryCache.payload &&
        Date.now() - memoryCache.timestamp < CACHE_TTL_MS;

      if (isFresh) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: memoryCache.payload,
            fromCache: true,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=900, s-maxage=900',
              'X-Cache': 'HIT-MEMORY',
            },
          }
        );
      }

      // 2. Prepare headers (attach GITHUB_TOKEN if available in env or process.env)
      const headers = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioGhifari/1.0)',
      };

      const token =
        env.GITHUB_TOKEN ||
        env.GH_TOKEN ||
        (typeof process !== 'undefined'
          ? process.env?.GITHUB_TOKEN || process.env?.GH_TOKEN
          : undefined);

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const userUrl = `https://api.github.com/users/${GITHUB_USERNAME}`;
      const contribUrl = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

      const [userRes, contribRes] = await Promise.all([
        fetchFn(userUrl, { headers }).catch((err) => {
          console.warn('[GitHub API proxy] User fetch network error:', err?.message || err);
          return null;
        }),
        fetchFn(contribUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }).catch((err) => {
          console.warn('[GitHub API proxy] Contributions fetch network error:', err?.message || err);
          return null;
        }),
      ]);

      const isRateLimited = userRes?.status === 403 || userRes?.status === 429;
      const isUserSuccess = Boolean(userRes && userRes.ok);

      let userData = {};
      if (isUserSuccess) {
        try {
          userData = await userRes.json();
        } catch {
          userData = {};
        }
      }

      let contributions = initialContributionsData;
      if (contribRes && contribRes.ok) {
        try {
          const contribHtml = await contribRes.text();
          contributions = parseContributionHtml(contribHtml);
        } catch {
          contributions = initialContributionsData;
        }
      }

      // If GitHub rate-limited or failed, fallback gracefully to verified static data or stale cache
      if (!isUserSuccess) {
        console.warn(
          `[GitHub API proxy] GitHub user API returned status ${userRes?.status || 'network_error'}. Serving verified fallback data.`
        );

        const fallbackPayload = memoryCache.payload || {
          profile: sanitizeUserProfile(userData),
          contributions,
        };

        // Cache fallback payload for 5 minutes to prevent hammering rate-limited GitHub API
        memoryCache = {
          payload: fallbackPayload,
          timestamp: Date.now(),
        };

        return new Response(
          JSON.stringify({
            ok: true,
            data: fallbackPayload,
            fallback: true,
            rateLimited: isRateLimited,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=300, s-maxage=300',
              'X-Data-Source': 'fallback',
              ...(isRateLimited ? { 'X-RateLimit-Fallback': 'true' } : {}),
            },
          }
        );
      }

      const payload = {
        profile: sanitizeUserProfile(userData),
        contributions,
      };

      // Store fresh live payload in memory cache
      memoryCache = {
        payload,
        timestamp: Date.now(),
      };

      return new Response(
        JSON.stringify({
          ok: true,
          data: payload,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=900, s-maxage=900', // 15 mins edge cache
            'X-Data-Source': 'live',
          },
        }
      );
    } catch (err) {
      console.error('[GitHub API proxy] Uncaught exception:', err);

      const errorFallbackPayload = {
        profile: sanitizeUserProfile({}),
        contributions: initialContributionsData,
      };

      return new Response(
        JSON.stringify({
          ok: true,
          data: errorFallbackPayload,
          fallback: true,
          error: err.message || 'Internal proxy error',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
            'X-Data-Source': 'exception-fallback',
          },
        }
      );
    }
  };
};

const defaultPagesHandler = createCloudflarePagesGithubHandler();

export const onRequestGet = defaultPagesHandler;
export const onRequest = defaultPagesHandler;
export default defaultPagesHandler;
