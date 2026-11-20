/**
 * Pure router helper functions for parsing URLs and matching routes.
 * Decoupled from React components for clean testability and Fast Refresh compliance.
 */

import {
  ENABLE_3D_GAME,
  ENABLE_STACK_GAME,
  ENABLE_BUG_GAME,
  ENABLE_RUNNER_GAME,
} from '../config/site.js';

export const isPlayRouteType = (type) =>
  type === 'play' ||
  type === 'play-explore' ||
  type === 'play-stack' ||
  type === 'play-bugs' ||
  type === 'play-runner';

const NON_SPA_PREFIX_RE = /^\/(?:docs|images|audio|assets|api)(?:\/|$)/i;
const FILE_EXT_RE = /\.[a-z0-9]{1,8}$/i;

/**
 * Converts an internal SPA URL to the target language prefix ('id' -> unprefixed, 'en' -> '/en...'),
 * preserving query string and hash while leaving external URLs, bare hashes, and static assets untouched.
 */
export const buildLocalizedPath = (to = '/', targetLang = 'id') => {
  if (!to || typeof to !== 'string') return targetLang === 'en' ? '/en' : '/';
  if (/^(?:https?:|mailto:|tel:)/i.test(to) || to.startsWith('#')) return to;

  const match = to.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const rawPath = (match?.[1] || '/').replace(/\/+$/, '') || '/';
  const search = match?.[2] || '';
  const hash = match?.[3] || '';

  if (NON_SPA_PREFIX_RE.test(rawPath) || FILE_EXT_RE.test(rawPath)) {
    return to;
  }

  const withoutEn = rawPath.replace(/^\/en(?=\/|$)/, '') || '/';
  if (targetLang === 'en') {
    const enPath = withoutEn === '/' ? '/en' : `/en${withoutEn}`;
    return `${enPath}${search}${hash}`;
  }

  return `${withoutEn}${search}${hash}`;
};

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
 * - '/play/runner' -> { type: 'play-runner' } (Stack Runner Mini-Game)
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
    enableRunnerGame = ENABLE_RUNNER_GAME,
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

    if (cleanPath === '/play/runner' && enableRunnerGame) {
      return {
        pathname,
        cleanPath: '/play/runner',
        langPrefix,
        search,
        hash,
        route: { type: 'play-runner' },
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
