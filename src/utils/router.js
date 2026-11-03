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
export const parseLocation = (loc = typeof window !== 'undefined' ? window.location : { pathname: '/', search: '', hash: '' }) => {
  const pathname = loc.pathname || '/';
  const search = loc.search || '';
  const hash = loc.hash || '';

  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/') {
    return {
      pathname: '/',
      cleanPath: '/',
      search,
      hash,
      route: { type: 'home' },
    };
  }

  if (cleanPath === '/study-case') {
    return {
      pathname,
      cleanPath: '/study-case',
      search,
      hash,
      route: { type: 'study-case-list' },
    };
  }

  const detailMatch = cleanPath.match(/^\/study-case\/([a-zA-Z0-9_-]+)$/);
  if (detailMatch) {
    return {
      pathname,
      cleanPath,
      search,
      hash,
      route: { type: 'study-case-detail', slug: detailMatch[1] },
    };
  }

  return {
    pathname,
    cleanPath,
    search,
    hash,
    route: { type: 'not-found', requestedPath: pathname },
  };
};
