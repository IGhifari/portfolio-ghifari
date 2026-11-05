/**
 * GitHub API service for fetching public profile statistics and
 * annual contribution calendar data.
 * Uses sessionStorage caching to minimize API calls and respect rate limits.
 * Handles rate limits, network failures, and empty states gracefully.
 */

import { initialContributionsData } from '../data/githubContributions.js';
import { siteConfig } from '../config/site.js';

export const GITHUB_USERNAME = siteConfig.author.githubUsername;
export const GITHUB_PROFILE_URL = siteConfig.author.github;
export const CACHE_STORAGE_KEY = 'portfolio_github_contributions_v4';
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const LANGUAGE_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Go: '#00add8',
  PHP: '#4F5D95',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Blade: '#f7523f',
  Vue: '#41b883',
  Default: 'var(--accent)',
};

/**
 * Returns color code for a given programming language.
 */
export const getLanguageColor = (lang) => {
  if (!lang) return LANGUAGE_COLORS.Default;
  return LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Default;
};

/**
 * Formats ISO date string into readable localized short date.
 */
export const formatRepoDate = (isoString, locale = 'id') => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Reads cached data from sessionStorage if valid and fresh.
 */
export const getCachedGithubData = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - (parsed.timestamp || 0);
    if (age < CACHE_TTL_MS && parsed.data) {
      return parsed.data;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Writes fetched data to sessionStorage cache.
 */
export const setCachedGithubData = (data) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage write quota or access errors in restricted contexts
  }
};

/**
 * Clears cached data (e.g. on manual retry).
 */
export const clearGithubCache = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(CACHE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

/**
 * Formats and sanitizes raw repository objects from GitHub API.
 */
export const sanitizeRepositories = (rawRepos = []) => {
  if (!Array.isArray(rawRepos)) return [];

  return rawRepos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || '',
    language: repo.language || null,
    stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0,
    forks: typeof repo.forks_count === 'number' ? repo.forks_count : 0,
    url: repo.html_url || `${GITHUB_PROFILE_URL}/${repo.name}`,
    updatedAt: repo.updated_at || repo.pushed_at || null,
    isFork: Boolean(repo.fork),
    topics: Array.isArray(repo.topics) ? repo.topics : [],
  }));
};

/**
 * Formats and sanitizes raw user profile from GitHub API.
 */
export const sanitizeUserProfile = (user = {}) => {
  return {
    login: user.login || GITHUB_USERNAME,
    name: user.name || GITHUB_USERNAME,
    avatarUrl: user.avatar_url || '',
    profileUrl: user.html_url || GITHUB_PROFILE_URL,
    publicRepos: typeof user.public_repos === 'number' ? user.public_repos : 22,
    followers: typeof user.followers === 'number' ? user.followers : 22,
    following: typeof user.following === 'number' ? user.following : 23,
    bio: user.bio || '',
    createdAt: user.created_at || null,
  };
};

/**
 * Extracts and chronologically sorts contribution calendar cells from GitHub HTML.
 */
export const parseContributionHtml = (html = '') => {
  if (!html || typeof html !== 'string') {
    return initialContributionsData;
  }

  // 1. Map tooltips by id to extract exact contribution count
  const tooltips = {};
  for (const m of html.matchAll(/<tool-tip[^>]*for=["']([^'"]+)["'][^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const text = m[2].trim();
    const countMatch = text.match(/^([0-9,]+)\s+contribution/i);
    tooltips[m[1]] = {
      text,
      count: countMatch ? parseInt(countMatch[1].replace(/,/g, ''), 10) : 0,
    };
  }

  // 2. Extract calendar day TD cells
  const days = [];
  for (const m of html.matchAll(/<td[^>]+class=["']ContributionCalendar-day["'][^>]*>/g)) {
    const tag = m[0];
    const dateM = tag.match(/data-date=["']([^'"]+)["']/);
    const levelM = tag.match(/data-level=["']([0-9]+)["']/);
    const idM = tag.match(/id=["']([^'"]+)["']/);

    if (dateM && levelM) {
      const id = idM ? idM[1] : '';
      const count = tooltips[id]?.count || 0;
      days.push({
        date: dateM[1],
        level: parseInt(levelM[1], 10),
        count,
      });
    }
  }

  // Fallback to initial verified dataset if no days parsed
  if (days.length === 0) {
    return initialContributionsData;
  }

  // Sort strictly chronologically by date
  days.sort((a, b) => a.date.localeCompare(b.date));

  const match = html.match(/([0-9,]+)\s+contributions/i);
  const total = match
    ? parseInt(match[1].replace(/,/g, ''), 10)
    : days.reduce((acc, d) => acc + d.count, 0) || initialContributionsData.total;

  return { total, days };
};

/**
 * Fetches GitHub profile and verified contribution calendar data.
 * Checks sessionStorage cache first, attempts /api/github proxy next,
 * and falls back seamlessly to direct GitHub REST API + verified static data.
 */
export const fetchGithubData = async ({ force = false, fetchFn = fetch } = {}) => {
  if (!force) {
    const cached = getCachedGithubData();
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  // 1. Try internal /api/github Cloudflare Pages proxy if available
  try {
    const proxyRes = await fetchFn('/api/github');
    if (proxyRes && proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && json.ok && json.data) {
        setCachedGithubData(json.data);
        return { data: json.data, fromCache: false };
      }
    }
  } catch {
    // Fall back to direct GitHub public endpoints
  }

  // 2. Direct GitHub API fallback
  const userUrl = `https://api.github.com/users/${GITHUB_USERNAME}`;
  const contribUrl = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

  try {
    const [userRes, contribRes] = await Promise.all([
      fetchFn(userUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      }),
      fetchFn(contribUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).catch(() => null),
    ]);

    // Handle Rate Limiting (403 or 429)
    if (userRes.status === 403 || userRes.status === 429) {
      const remaining = userRes.headers?.get?.('x-ratelimit-remaining') || '0';
      const error = new Error('GitHub API rate limit exceeded.');
      error.code = 'RATE_LIMIT';
      error.remaining = remaining;
      throw error;
    }

    if (!userRes.ok) {
      const error = new Error(`GitHub user request failed with status ${userRes.status}`);
      error.code = 'API_ERROR';
      error.status = userRes.status;
      throw error;
    }

    const userData = await userRes.json();

    let contributions = initialContributionsData;
    if (contribRes && contribRes.ok) {
      try {
        const html = await contribRes.text();
        contributions = parseContributionHtml(html);
      } catch {
        contributions = initialContributionsData;
      }
    }

    const formattedData = {
      profile: sanitizeUserProfile(userData),
      contributions,
    };

    setCachedGithubData(formattedData);

    return {
      data: formattedData,
      fromCache: false,
    };
  } catch (err) {
    if (err.code === 'RATE_LIMIT' || err.code === 'API_ERROR') {
      throw err;
    }
    const networkError = new Error(err.message || 'Network error while contacting GitHub.');
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  }
};
