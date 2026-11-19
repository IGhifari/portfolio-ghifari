/**
 * Pure router helper functions for parsing URLs and matching routes.
 * Decoupled from React components for clean testability and Fast Refresh compliance.
 */

/**
 * Parses a window.location-like object into a strongly typed route.
 * Supported routes:
 * - '/' -> { type: 'home' }
 * - '/study-case' -> { type: 'study-case-list' }
 * - '/study-case/:slug' -> { type: 'study-case-detail', slug: string }
 * - other -> { type: 'not-found', requestedPath: string }
 */
import { ENABLE_3D_GAME } from '../config/site.js';

export const parseLocation = (loc = typeof window !== 'undefined' ? window.location : { pathname: '/', search: '', hash: '' }, { enable3dGame = ENABLE_3D_GAME } = {}) => {
  const pathname = loc.pathname || '/';
  const search = loc.search || '';
  const hash = loc.hash || '';

  const rawCleanPath = pathname.replace(/\/+$/, '') || '/';
  const isEnPrefix = rawCleanPath === '/en' || rawCleanPath.startsWith('/en/');
  const cleanPath = isEnPrefix ? rawCleanPath.slice(3) || '/' : rawCleanPath;
  const langPrefix = isEnPrefix ? 'en' : null;

  if (cleanPath === '/') {
    return {
      pathname: isEnPrefix ? '/en' : '/',
      cleanPath: '/',
      langPrefix,
      search,
      hash,
      route: { type: 'home' },
    };
  }

  if (cleanPath === '/study-case') {
    return {
      pathname,
      cleanPath: '/study-case',
      langPrefix,
      search,
      hash,
      route: { type: 'study-case-list' },
    };
  }

  if (cleanPath === '/recruiter') {
    return {
      pathname,
      cleanPath: '/recruiter',
      langPrefix,
      search,
      hash,
      route: { type: 'recruiter' },
    };
  }

  if (cleanPath === '/play' && enable3dGame) {
    return {
      pathname,
      cleanPath: '/play',
      langPrefix,
      search,
      hash,
      route: { type: 'play' },
    };
  }

  const detailMatch = cleanPath.match(/^\/study-case\/([a-zA-Z0-9_-]+)$/);
  if (detailMatch) {
    return {
      pathname,
      cleanPath,
      langPrefix,
      search,
      hash,
      route: { type: 'study-case-detail', slug: detailMatch[1] },
    };
  }

  return {
    pathname,
    cleanPath,
    langPrefix,
    search,
    hash,
    route: { type: 'not-found', requestedPath: pathname },
  };
};
