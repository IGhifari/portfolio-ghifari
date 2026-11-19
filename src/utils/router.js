/**
 * Pure router helper functions for parsing URLs and matching routes.
 * Decoupled from React components for clean testability and Fast Refresh compliance.
 */

import {
  ENABLE_3D_GAME,
  ENABLE_STACK_GAME,
  ENABLE_BUG_GAME,
} from '../config/site.js';

export const isPlayRouteType = (type) =>
  type === 'play' ||
  type === 'play-explore' ||
  type === 'play-stack' ||
  type === 'play-bugs';

/**
 * Parses a window.location-like object into a strongly typed route.
 * Supported routes:
 * - '/' -> { type: 'home' }
 * - '/study-case' -> { type: 'study-case-list' }
 * - '/study-case/:slug' -> { type: 'study-case-detail', slug: string }
 * - '/recruiter' -> { type: 'recruiter' }
 * - '/play' -> { type: 'play' } (Game Hub)
 * - '/play/explore' -> { type: 'play-explore' } (3D World Exploration)
 * - '/play/stack' -> { type: 'play-stack' } (Deploy Stack Mini-Game)
 * - '/play/bugs' -> { type: 'play-bugs' } (Bug Hunter Mini-Game)
 * - other -> { type: 'not-found', requestedPath: string }
 */
export const parseLocation = (
  loc = typeof window !== 'undefined'
    ? window.location
    : { pathname: '/', search: '', hash: '' },
  {
    enable3dGame = ENABLE_3D_GAME,
    enableStackGame = ENABLE_STACK_GAME,
    enableBugGame = ENABLE_BUG_GAME,
  } = {}
) => {
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

  if (enable3dGame) {
    if (cleanPath === '/play') {
      return {
        pathname,
        cleanPath: '/play',
        langPrefix,
        search,
        hash,
        route: { type: 'play' },
      };
    }

    if (cleanPath === '/play/explore') {
      return {
        pathname,
        cleanPath: '/play/explore',
        langPrefix,
        search,
        hash,
        route: { type: 'play-explore' },
      };
    }

    if (cleanPath === '/play/stack' && enableStackGame) {
      return {
        pathname,
        cleanPath: '/play/stack',
        langPrefix,
        search,
        hash,
        route: { type: 'play-stack' },
      };
    }

    if (cleanPath === '/play/bugs' && enableBugGame) {
      return {
        pathname,
        cleanPath: '/play/bugs',
        langPrefix,
        search,
        hash,
        route: { type: 'play-bugs' },
      };
    }
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
