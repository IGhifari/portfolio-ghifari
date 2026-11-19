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

      const headerRefresh = typeof request?.headers?.get === 'function'
        ? request.headers.get('x-refresh')
        : request?.headers?.['x-refresh'];
      const wantsRefresh =
        Boolean(request?.url && String(request.url).includes('refresh=1')) ||
        headerRefresh === '1';

      // 1. Check module-scoped in-memory cache (15 mins TTL, bypassed on explicit refresh)
      const CACHE_TTL_MS = 15 * 60 * 1000;
      const isFresh =
        !wantsRefresh &&
        memoryCache.payload &&
        Date.now() - memoryCache.timestamp < CACHE_TTL_MS;

      if (isFresh) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: memoryCache.payload,
            fromCache: true,
            contributionsLive: Boolean(memoryCache.contributionsLive),
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
      let isContribLive = false;
      if (contribRes && contribRes.ok) {
        try {
          const contribHtml = await contribRes.text();
          contributions = parseContributionHtml(contribHtml);
          isContribLive = Boolean(contribHtml && /ContributionCalendar-day/i.test(contribHtml) && contributions?.days?.length > 0);
        } catch {
          contributions = initialContributionsData;
          isContribLive = false;
        }
      }

      // If GitHub user API rate-limited or failed, preserve live contributions if available
      if (!isUserSuccess) {
        console.warn(
          `[GitHub API proxy] GitHub user API returned status ${userRes?.status || 'network_error'}. Serving ${isContribLive ? 'live contributions + fallback profile' : 'verified fallback data'}.`
        );

        const fallbackPayload = {
          profile: memoryCache.payload?.profile || sanitizeUserProfile(userData),
          contributions: isContribLive ? contributions : (memoryCache.payload?.contributions || contributions),
        };

        // Only cache fallback in memory if live contributions succeeded; otherwise let next call retry live
        if (isContribLive) {
          memoryCache = {
            payload: fallbackPayload,
            timestamp: Date.now(),
            contributionsLive: true,
          };
        }

        return new Response(
          JSON.stringify({
            ok: true,
            data: fallbackPayload,
            fallback: true,
            contributionsLive: isContribLive,
            rateLimited: isRateLimited,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': isContribLive ? 'public, max-age=300, s-maxage=300' : 'no-store',
              'X-Data-Source': isContribLive ? 'partial-live' : 'fallback',
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
        contributionsLive: isContribLive,
      };

      return new Response(
        JSON.stringify({
          ok: true,
          data: payload,
          contributionsLive: isContribLive,
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
