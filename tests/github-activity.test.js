import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GITHUB_USERNAME,
  GITHUB_PROFILE_URL,
  CACHE_STORAGE_KEY,
  CACHE_TTL_MS,
  LANGUAGE_COLORS,
  getLanguageColor,
  formatRepoDate,
  sanitizeUserProfile,
  parseContributionHtml,
  getCachedGithubData,
  setCachedGithubData,
  clearGithubCache,
  fetchGithubData,
  calculateContributionStats,
} from '../src/services/githubService.js';
import { initialContributionsData } from '../src/data/githubContributions.js';
import { createCloudflarePagesGithubHandler } from '../functions/api/github.js';
import { translations } from '../src/data/translations.js';

test('CONF-05A — GitHub Activity Integration & API Service Test Suite', async (t) => {
  // Mock sessionStorage utility
  class MockSessionStorage {
    constructor() {
      this.store = new Map();
    }
    getItem(key) {
      return this.store.has(key) ? this.store.get(key) : null;
    }
    setItem(key, value) {
      this.store.set(key, String(value));
    }
    removeItem(key) {
      this.store.delete(key);
    }
    clear() {
      this.store.clear();
    }
  }

  await t.test('1. Constants & Configuration', () => {
    assert.equal(GITHUB_USERNAME, 'IGhifari');
    assert.equal(GITHUB_PROFILE_URL, 'https://github.com/IGhifari');
    assert.equal(CACHE_STORAGE_KEY, 'portfolio_github_contributions_v4');
    assert.equal(CACHE_TTL_MS, 15 * 60 * 1000);
  });

  await t.test('2. Language Colors & Formatting', async (t2) => {
    await t2.test('maps known programming languages to specific hex colors', () => {
      assert.equal(getLanguageColor('TypeScript'), LANGUAGE_COLORS.TypeScript);
      assert.equal(getLanguageColor('JavaScript'), LANGUAGE_COLORS.JavaScript);
      assert.equal(getLanguageColor('Go'), LANGUAGE_COLORS.Go);
      assert.equal(getLanguageColor('PHP'), LANGUAGE_COLORS.PHP);
      assert.equal(getLanguageColor('Python'), LANGUAGE_COLORS.Python);
      assert.equal(getLanguageColor('HTML'), LANGUAGE_COLORS.HTML);
      assert.equal(getLanguageColor('CSS'), LANGUAGE_COLORS.CSS);
    });

    await t2.test('falls back gracefully to default accent color for unknown or empty languages', () => {
      assert.equal(getLanguageColor(''), 'var(--accent)');
      assert.equal(getLanguageColor(null), 'var(--accent)');
      assert.equal(getLanguageColor(undefined), 'var(--accent)');
      assert.equal(getLanguageColor('BrainfuckLanguage'), 'var(--accent)');
    });

    await t2.test('formats valid ISO date strings for Indonesian and English locales', () => {
      const iso = '2025-02-15T12:00:00Z';
      const idFormatted = formatRepoDate(iso, 'id');
      const enFormatted = formatRepoDate(iso, 'en');

      assert.ok(idFormatted.includes('2025'), 'Indonesian date should contain year 2025');
      assert.ok(enFormatted.includes('2025'), 'English date should contain year 2025');
      assert.ok(enFormatted.includes('Feb'), 'English date should contain Feb abbreviation');
    });

    await t2.test('handles invalid, null, or empty dates safely without throwing', () => {
      assert.equal(formatRepoDate(''), '');
      assert.equal(formatRepoDate(null), '');
      assert.equal(formatRepoDate(undefined), '');
      assert.equal(formatRepoDate('invalid-date-string'), '');
    });
  });

  await t.test('3. Data Sanitization & Calendar Parsing', async (t2) => {
    await t2.test('sanitizes valid GitHub user profile accurately', () => {
      const rawUser = {
        login: 'IGhifari',
        name: 'M. Ghifari Bima Khadafi',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
        html_url: 'https://github.com/IGhifari',
        public_repos: 22,
        followers: 22,
        following: 23,
        bio: 'Software engineer building web apps.',
        created_at: '2023-01-01T00:00:00Z',
      };

      const sanitized = sanitizeUserProfile(rawUser);
      assert.equal(sanitized.login, 'IGhifari');
      assert.equal(sanitized.name, 'M. Ghifari Bima Khadafi');
      assert.equal(sanitized.avatarUrl, 'https://avatars.githubusercontent.com/u/12345?v=4');
      assert.equal(sanitized.profileUrl, 'https://github.com/IGhifari');
      assert.equal(sanitized.publicRepos, 22);
      assert.equal(sanitized.followers, 22);
      assert.equal(sanitized.following, 23);
      assert.equal(sanitized.bio, 'Software engineer building web apps.');
      assert.equal(sanitized.createdAt, '2023-01-01T00:00:00Z');
    });

    await t2.test('provides fallbacks when user profile has missing fields', () => {
      const emptyUser = sanitizeUserProfile({});
      assert.equal(emptyUser.login, 'IGhifari');
      assert.equal(emptyUser.name, 'IGhifari');
      assert.equal(emptyUser.avatarUrl, '');
      assert.equal(emptyUser.profileUrl, 'https://github.com/IGhifari');
      assert.equal(emptyUser.publicRepos, 22);
      assert.equal(emptyUser.followers, 22);
      assert.equal(emptyUser.following, 23);
      assert.equal(emptyUser.bio, '');
    });

    await t2.test('parses contribution calendar html and sorts chronologically', () => {
      const sampleHtml = `
        <h2 class="f4 text-normal mb-2">869 contributions in the last year</h2>
        <td data-date="2026-10-02" id="day-2" data-level="4" class="ContributionCalendar-day"></td>
        <td data-date="2026-10-01" id="day-1" data-level="2" class="ContributionCalendar-day"></td>
        <tool-tip for="day-1">2 contributions on October 1st.</tool-tip>
        <tool-tip for="day-2">12 contributions on October 2nd.</tool-tip>
      `;

      const parsed = parseContributionHtml(sampleHtml);
      assert.equal(parsed.total, 869);
      assert.equal(parsed.days.length, 2);
      // Strictly chronologically sorted: 10-01 comes before 10-02
      assert.equal(parsed.days[0].date, '2026-10-01');
      assert.equal(parsed.days[0].level, 2);
      assert.equal(parsed.days[0].count, 2);
      assert.equal(parsed.days[1].date, '2026-10-02');
      assert.equal(parsed.days[1].level, 4);
      assert.equal(parsed.days[1].count, 12);

      // Fallback for null or invalid HTML returns verified initial dataset
      const emptyParsed = parseContributionHtml(null);
      assert.equal(emptyParsed.total, initialContributionsData.total);
      assert.equal(emptyParsed.days.length, initialContributionsData.days.length);
    });

    await t2.test('initialContributionsData holds verified dataset of 368 days and 870 contributions', () => {
      assert.equal(initialContributionsData.total, 870);
      assert.equal(initialContributionsData.days.length, 368);
      assert.ok(initialContributionsData.days.some((d) => d.level > 0));
    });
  });

  await t.test('4. Session Storage Caching Layer', async (t2) => {
    let originalWindow;

    t2.beforeEach(() => {
      originalWindow = global.window;
      global.window = {
        sessionStorage: new MockSessionStorage(),
      };
    });

    t2.afterEach(() => {
      global.window = originalWindow;
    });

    await t2.test('writes and retrieves cached data when fresh', () => {
      const sampleData = {
        profile: { login: 'IGhifari', publicRepos: 22 },
        contributions: initialContributionsData,
      };

      setCachedGithubData(sampleData);
      const retrieved = getCachedGithubData();
      assert.deepEqual(retrieved, sampleData);
    });

    await t2.test('returns null if cached data is older than TTL', () => {
      const sampleData = { profile: { login: 'IGhifari' } };
      global.window.sessionStorage.setItem(
        CACHE_STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now() - (CACHE_TTL_MS + 1000), // Expired
          data: sampleData,
        })
      );

      const retrieved = getCachedGithubData();
      assert.equal(retrieved, null);
    });

    await t2.test('clears cache on clearGithubCache', () => {
      setCachedGithubData({ profile: { login: 'IGhifari' } });
      assert.ok(getCachedGithubData() !== null);

      clearGithubCache();
      assert.equal(getCachedGithubData(), null);
    });

    await t2.test('survives missing window or sessionStorage gracefully', () => {
      global.window = undefined;
      assert.equal(getCachedGithubData(), null);
      assert.doesNotThrow(() => setCachedGithubData({}));
      assert.doesNotThrow(() => clearGithubCache());
    });
  });

  await t.test('5. API Dispatch & Error Handling (fetchGithubData)', async (t2) => {
    let originalWindow;

    t2.beforeEach(() => {
      originalWindow = global.window;
      global.window = {
        sessionStorage: new MockSessionStorage(),
      };
    });

    t2.afterEach(() => {
      global.window = originalWindow;
    });

    await t2.test('successfully fetches, sanitizes, and caches user and contributions', async () => {
      const mockFetch = async (url) => {
        if (url === '/api/github') {
          return { ok: false, status: 404 }; // Force fallback to direct API
        }
        if (url.includes('/users/IGhifari/contributions')) {
          return {
            ok: true,
            status: 200,
            text: async () => '870 contributions in the last year',
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            login: 'IGhifari',
            name: 'M. Ghifari',
            public_repos: 22,
          }),
        };
      };

      const result = await fetchGithubData({ force: true, fetchFn: mockFetch });
      assert.equal(result.fromCache, false);
      assert.equal(result.data.profile.login, 'IGhifari');
      assert.equal(result.data.profile.publicRepos, 22);
      assert.equal(result.data.contributions.total, 870);

      // Subsequent call should hit cache
      const cachedResult = await fetchGithubData({ force: false, fetchFn: mockFetch });
      assert.equal(cachedResult.fromCache, true);
      assert.equal(cachedResult.data.profile.login, 'IGhifari');
    });

    await t2.test('throws RATE_LIMIT error when GitHub returns 403 or 429', async () => {
      const mockRateLimitedFetch = async (url) => {
        if (url === '/api/github') return { ok: false, status: 404 };
        return {
          ok: false,
          status: 403,
          headers: new Map([['x-ratelimit-remaining', '0']]),
        };
      };

      await assert.rejects(
        async () => {
          await fetchGithubData({ force: true, fetchFn: mockRateLimitedFetch });
        },
        (err) => {
          assert.equal(err.code, 'RATE_LIMIT');
          return true;
        }
      );
    });

    await t2.test('throws API_ERROR when GitHub returns non-200 status', async () => {
      const mockServerErrorFetch = async (url) => {
        if (url === '/api/github') return { ok: false, status: 404 };
        return {
          ok: false,
          status: 500,
        };
      };

      await assert.rejects(
        async () => {
          await fetchGithubData({ force: true, fetchFn: mockServerErrorFetch });
        },
        (err) => {
          assert.equal(err.code, 'API_ERROR');
          assert.equal(err.status, 500);
          return true;
        }
      );
    });

    await t2.test('throws NETWORK_ERROR when fetch throws network rejection', async () => {
      const mockNetworkFailFetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      await assert.rejects(
        async () => {
          await fetchGithubData({ force: true, fetchFn: mockNetworkFailFetch });
        },
        (err) => {
          assert.equal(err.code, 'NETWORK_ERROR');
          return true;
        }
      );
    });
  });

  await t.test('6. Cloudflare Pages Function Adapter (functions/api/github.js)', async (t2) => {
    await t2.test('returns 200 JSON with profile and verified contributions on GET', async () => {
      const mockFetch = async (url) => {
        if (url.includes('/users/IGhifari/contributions')) {
          return { ok: true, status: 200, text: async () => '870 contributions' };
        }
        return { ok: true, status: 200, json: async () => ({ login: 'IGhifari', public_repos: 22 }) };
      };

      const handler = createCloudflarePagesGithubHandler({ fetchFn: mockFetch });
      const req = new Request('https://www.ighifari.my.id/api/github', { method: 'GET' });
      const res = await handler({ request: req });

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('Content-Type').includes('application/json'));
      const body = await res.json();
      assert.equal(body.ok, true);
      assert.equal(body.data.profile.login, 'IGhifari');
      assert.equal(body.data.contributions.total, 870);
    });

    await t2.test('handles OPTIONS preflight with 204 No Content', async () => {
      const handler = createCloudflarePagesGithubHandler();
      const req = new Request('https://www.ighifari.my.id/api/github', { method: 'OPTIONS' });
      const res = await handler({ request: req });
      assert.equal(res.status, 204);
    });

    await t2.test('rejects non-GET HTTP methods with 405 Method Not Allowed', async () => {
      const handler = createCloudflarePagesGithubHandler();
      const req = new Request('https://www.ighifari.my.id/api/github', { method: 'POST' });
      const res = await handler({ request: req });
      assert.equal(res.status, 405);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
    });

    await t2.test('gracefully returns 200 with verified fallback data when GitHub user API returns 403 or 429', async () => {
      const mockRateLimitedFetch = async () => ({
        ok: false,
        status: 429,
        headers: new Map([['x-ratelimit-remaining', '0']]),
      });

      const handler = createCloudflarePagesGithubHandler({ fetchFn: mockRateLimitedFetch });
      const req = new Request('https://www.ighifari.my.id/api/github', { method: 'GET' });
      const res = await handler({ request: req });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.ok, true);
      assert.equal(body.fallback, true);
      assert.equal(body.data.profile.login, 'IGhifari');
      assert.equal(body.data.contributions.total, 870);
    });

    await t2.test('attaches Authorization Bearer token when GITHUB_TOKEN is present in context env', async () => {
      let capturedAuthHeader = null;
      const mockFetch = async (url, options) => {
        if (url.includes('api.github.com')) { capturedAuthHeader = options?.headers?.Authorization; }
        return {
          ok: true,
          status: 200,
          json: async () => ({ login: 'IGhifari', public_repos: 22 }),
        };
      };

      const handler = createCloudflarePagesGithubHandler({ fetchFn: mockFetch });
      const req = new Request('https://www.ighifari.my.id/api/github', { method: 'GET' });
      const res = await handler({ request: req, env: { GITHUB_TOKEN: 'ghp_testsecrettoken123' } });

      assert.equal(res.status, 200);
      assert.equal(capturedAuthHeader, 'Bearer ghp_testsecrettoken123');
    });

    await t2.test('preserves live contributions when user API is 429 and ignores public refresh cache-bypass headers', async () => {
      let contribCallCount = 0;
      const mockFetch = async (url) => {
        if (url.includes('/users/IGhifari/contributions')) {
          contribCallCount++;
          const countToday = contribCallCount === 1 ? 3 : 7;
          return {
            ok: true,
            status: 200,
            text: async () => `
              <h2>975 contributions in the last year</h2>
              <td data-date="2026-11-18" id="d1" data-level="1" class="ContributionCalendar-day"></td>
              <td data-date="2026-11-19" id="d2" data-level="2" class="ContributionCalendar-day"></td>
              <tool-tip for="d1">2 contributions on Nov 18</tool-tip>
              <tool-tip for="d2">${countToday} contributions on Nov 19</tool-tip>
            `,
          };
        }
        return { ok: false, status: 429, headers: new Map() };
      };

      const handler = createCloudflarePagesGithubHandler({ fetchFn: mockFetch });
      const res1 = await handler({ request: new Request('https://www.ighifari.my.id/api/github', { method: 'GET' }) });
      const body1 = await res1.json();
      assert.equal(body1.contributionsLive, true);
      assert.equal(body1.data.contributions.total, 975);
      assert.equal(body1.data.contributions.days[1].count, 3);

      const res2 = await handler({
        request: new Request('https://www.ighifari.my.id/api/github?refresh=1', { method: 'GET', headers: { 'x-refresh': '1' } }),
      });
      const body2 = await res2.json();
      assert.equal(contribCallCount, 1);
      assert.equal(body2.fromCache, true);
      assert.equal(body2.data.contributions.days[1].count, 3);
    });
  });

  await t.test('7. Bilingual Translations Parity for GitHub Activity', async (t2) => {
    await t2.test('defines nav.github in both id and en dictionaries', () => {
      assert.equal(typeof translations.id.nav.github, 'string');
      assert.equal(typeof translations.en.nav.github, 'string');
      assert.equal(translations.id.nav.github, 'GITHUB');
      assert.equal(translations.en.nav.github, 'GITHUB');
    });

    await t2.test('defines github section in both id and en dictionaries with identical keys', () => {
      assert.ok(translations.id.github, 'id.github must exist');
      assert.ok(translations.en.github, 'en.github must exist');

      const idKeys = Object.keys(translations.id.github).sort();
      const enKeys = Object.keys(translations.en.github).sort();
      assert.deepEqual(idKeys, enKeys, 'id and en github keys must match exactly');

      const idStatKeys = Object.keys(translations.id.github.stats).sort();
      const enStatKeys = Object.keys(translations.en.github.stats).sort();
      assert.deepEqual(idStatKeys, enStatKeys, 'id and en github stats keys must match exactly');
    });

    await t2.test('maintains sequential section numbering 01 through 09', () => {
      assert.ok(translations.id.projects.sectionTag.startsWith('01 /'));
      assert.ok(translations.id.about.sectionTag.startsWith('02 /'));
      assert.ok(translations.id.experience.sectionTag.startsWith('03 /'));
      assert.ok(translations.id.journey.sectionTag.startsWith('04 /'));
      assert.ok(translations.id.stack.sectionTag.startsWith('05 /'));
      assert.ok(translations.id.github.sectionTag.startsWith('06 /'));
      assert.ok(translations.id.certificates.sectionTag.startsWith('07 /'));
      assert.ok(translations.id.education.sectionTag.startsWith('08 /'));
      assert.ok(translations.id.contact.sectionTag.startsWith('09 /'));

      assert.ok(translations.en.projects.sectionTag.startsWith('01 /'));
      assert.ok(translations.en.about.sectionTag.startsWith('02 /'));
      assert.ok(translations.en.experience.sectionTag.startsWith('03 /'));
      assert.ok(translations.en.journey.sectionTag.startsWith('04 /'));
      assert.ok(translations.en.stack.sectionTag.startsWith('05 /'));
      assert.ok(translations.en.github.sectionTag.startsWith('06 /'));
      assert.ok(translations.en.certificates.sectionTag.startsWith('07 /'));
      assert.ok(translations.en.education.sectionTag.startsWith('08 /'));
      assert.ok(translations.en.contact.sectionTag.startsWith('09 /'));
    });
  });

  await t.test('7. Streak Calculation and Contribution Metrics (calculateContributionStats)', async (t2) => {
    await t2.test('returns default metrics for empty or invalid input', () => {
      assert.deepEqual(calculateContributionStats([]), {
        currentStreak: 0,
        longestStreak: 21,
        activeDays: 0,
      });
      assert.deepEqual(calculateContributionStats(null), {
        currentStreak: 0,
        longestStreak: 21,
        activeDays: 0,
      });
    });

    await t2.test('calculates active current streak when today has contributions', () => {
      const days = [
        { date: '2026-03-01', count: 0 },
        { date: '2026-03-02', count: 2 },
        { date: '2026-03-03', count: 5 },
        { date: '2026-03-04', count: 1 },
      ];
      const stats = calculateContributionStats(days);
      assert.equal(stats.currentStreak, 3);
      assert.equal(stats.longestStreak, 3);
      assert.equal(stats.activeDays, 3);
    });

    await t2.test('returns 0 longestStreak when non-empty calendar days all have 0 count (no hardcoded 21 leak)', () => {
      const days = [
        { date: '2026-11-18', count: 0 },
        { date: '2026-11-19', count: 0 },
      ];
      const stats = calculateContributionStats(days);
      assert.equal(stats.currentStreak, 0);
      assert.equal(stats.longestStreak, 0);
      assert.equal(stats.activeDays, 0);
    });

    await t2.test('maintains current streak when today has 0 but yesterday was active', () => {
      const days = [
        { date: '2026-03-01', count: 0 },
        { date: '2026-03-02', count: 3 },
        { date: '2026-03-03', count: 4 },
        { date: '2026-03-04', count: 0 },
      ];
      const stats = calculateContributionStats(days);
      assert.equal(stats.currentStreak, 2);
      assert.equal(stats.longestStreak, 2);
      assert.equal(stats.activeDays, 2);
    });

    await t2.test('strictly breaks current streak (0) when both today and yesterday have 0 contributions', () => {
      const days = [
        { date: '2026-02-20', count: 5 },
        { date: '2026-02-21', count: 5 },
        { date: '2026-02-22', count: 5 },
        { date: '2026-02-23', count: 0 },
        { date: '2026-02-24', count: 0 },
      ];
      const stats = calculateContributionStats(days);
      assert.equal(stats.currentStreak, 0, 'Streak must be 0 and not jump backwards to past days');
      assert.equal(stats.longestStreak, 3);
      assert.equal(stats.activeDays, 3);
    });
  });
});
