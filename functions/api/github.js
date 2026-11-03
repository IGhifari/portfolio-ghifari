/**
 * Cloudflare Pages Function: GitHub Activity & Contribution Proxy
 *
 * Route: GET /api/github
 * Target Runtime: Cloudflare Workers / Pages Functions
 *
 * Proxies and aggregates GitHub public profile and annual contribution calendar
 * data with edge caching to satisfy CSP connect-src ('self') and rate limits.
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
  return async function handleCloudflareRequest(context) {
    try {
      const { request } = context;

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

      const headers = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioGhifari/1.0)',
      };

      const userUrl = `https://api.github.com/users/${GITHUB_USERNAME}`;
      const contribUrl = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

      const [userRes, contribRes] = await Promise.all([
        fetchFn(userUrl, { headers }),
        fetchFn(contribUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }).catch(() => null),
      ]);

      // Handle Rate Limiting
      if (userRes.status === 403 || userRes.status === 429) {
        const remaining = userRes.headers?.get?.('x-ratelimit-remaining') || '0';
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'RATE_LIMIT',
              message: 'GitHub API rate limit exceeded.',
              remaining,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=60',
            },
          }
        );
      }

      if (!userRes.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'API_ERROR',
              message: `GitHub user request failed with status ${userRes.status}`,
            },
          }),
          {
            status: userRes.status,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      const userData = await userRes.json();

      let contributions = initialContributionsData;
      if (contribRes && contribRes.ok) {
        try {
          const contribHtml = await contribRes.text();
          contributions = parseContributionHtml(contribHtml);
        } catch {
          contributions = initialContributionsData;
        }
      }

      const payload = {
        profile: sanitizeUserProfile(userData),
        contributions,
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
          },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: err.message || 'Internal proxy error',
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

const defaultPagesHandler = createCloudflarePagesGithubHandler();

export const onRequestGet = defaultPagesHandler;
export const onRequest = defaultPagesHandler;
export default defaultPagesHandler;
