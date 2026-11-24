import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  parseLocation,
  buildLocalizedPath,
  buildVersionedUrl,
  withVersionParam,
  DEFAULT_PORTFOLIO_VERSION,
} from '../utils/router';
import { useLanguage, DEFAULT_LANGUAGE } from './LanguageContext';
import { runV2PageTransition } from '../v2/v2OpeningState';

const RouterContext = createContext(null);

function isV2PageRouteType(type) {
  return (
    type === 'home' ||
    type === 'study-case-list' ||
    type === 'study-case-detail'
  );
}

function shouldAnimateV2PageSwap(fromLoc, toLoc) {
  if (typeof window === 'undefined' || !fromLoc || !toLoc) return false;
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return false;
  }
  const fromVer = fromLoc.portfolioVersion || DEFAULT_PORTFOLIO_VERSION;
  const toVer = toLoc.portfolioVersion || DEFAULT_PORTFOLIO_VERSION;
  if (fromVer === '1' || toVer === '1') return false;
  if (!isV2PageRouteType(fromLoc.route?.type) || !isV2PageRouteType(toLoc.route?.type)) {
    return false;
  }
  return fromLoc.cleanPath !== toLoc.cleanPath;
}

function preloadV2RouteChunk(routeType) {
  if (routeType === 'study-case-list') {
    import('../v2/WorksListV2');
  } else if (routeType === 'study-case-detail') {
    import('../v2/WorkDetailV2');
  }
}

export const RouterProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(() => parseLocation());
  const { language, setLanguage } = useLanguage();
  const currentLocationRef = useRef(currentLocation);
  const scrollHistoryRef = useRef(new Map());

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  const activeLang =
    currentLocation.langPrefix === 'en' || language === 'en' ? 'en' : 'id';
  const portfolioVersion = currentLocation.portfolioVersion || DEFAULT_PORTFOLIO_VERSION;

  useEffect(() => {
    const handlePopState = () => {
      const prevLoc = currentLocationRef.current;
      const nextLoc = parseLocation(window.location);
      const queryLang = new URLSearchParams(nextLoc.search || '').get('lang');
      const nextLang =
        nextLoc.langPrefix === 'en'
          ? 'en'
          : queryLang === 'en' || queryLang === 'id'
          ? queryLang
          : DEFAULT_LANGUAGE;

      if (shouldAnimateV2PageSwap(prevLoc, nextLoc)) {
        preloadV2RouteChunk(nextLoc.route?.type);
        const savedScrollY = scrollHistoryRef.current.get(nextLoc.cleanPath) ?? 0;
        runV2PageTransition(() => {
          currentLocationRef.current = nextLoc;
          setCurrentLocation(nextLoc);
          setLanguage(nextLang);
          requestAnimationFrame(() => {
            window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
          });
        });
        return;
      }

      currentLocationRef.current = nextLoc;
      setCurrentLocation(nextLoc);
      setLanguage(nextLang);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setLanguage]);

  const localizePath = useCallback(
    (to) => withVersionParam(buildLocalizedPath(to, activeLang), portfolioVersion),
    [activeLang, portfolioVersion]
  );

  const commitNavigation = useCallback(
    (targetUrl, { replace = false, scrollToTop = true, handleHashScroll = true } = {}) => {
      if (typeof window === 'undefined' || !targetUrl) return;

      const currentUrl =
        window.location.pathname + window.location.search + window.location.hash;

      if (targetUrl === currentUrl && !replace) {
        return;
      }

      if (replace) {
        window.history.replaceState({}, '', targetUrl);
      } else {
        window.history.pushState({}, '', targetUrl);
      }

      const newParsed = parseLocation(window.location);
      setCurrentLocation(newParsed);

      if (newParsed.hash && handleHashScroll) {
        window.dispatchEvent(new Event('hashchange'));

        const elementId = newParsed.hash.replace(/^#/, '');
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else if (scrollToTop) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    },
    []
  );

  const navigate = useCallback(
    (to, { replace = false, scrollToTop = true, preserveLang = true } = {}) => {
      if (typeof window === 'undefined' || !to) return;

      // Handle external links directly
      if (/^https?:\/\//i.test(to) || to.startsWith('mailto:') || to.startsWith('tel:')) {
        window.location.href = to;
        return;
      }

      const explicitEn = /^\/en(?=[/?#]|$)/.test(to);
      const localizedUrl =
        !preserveLang || explicitEn
          ? to
          : activeLang === 'en'
          ? buildLocalizedPath(to, 'en')
          : to;
      const targetUrl = withVersionParam(localizedUrl, portfolioVersion);

      const parsedUrl = new URL(targetUrl, window.location.origin);
      const nextParsed = parseLocation(parsedUrl);
      const prevLoc = currentLocationRef.current;

      if (shouldAnimateV2PageSwap(prevLoc, nextParsed)) {
        if (prevLoc?.cleanPath) {
          scrollHistoryRef.current.set(prevLoc.cleanPath, window.scrollY || 0);
        }
        preloadV2RouteChunk(nextParsed.route?.type);
        runV2PageTransition(() => {
          if (explicitEn && language !== 'en') {
            setLanguage('en');
          }
          commitNavigation(targetUrl, { replace, scrollToTop, handleHashScroll: true });
        });
        return;
      }

      if (explicitEn && language !== 'en') {
        setLanguage('en');
      }

      commitNavigation(targetUrl, { replace, scrollToTop, handleHashScroll: true });
    },
    [activeLang, commitNavigation, language, portfolioVersion, setLanguage]
  );

  const switchLanguage = useCallback(
    (targetLang) => {
      if (targetLang !== 'id' && targetLang !== 'en') return;
      setLanguage(targetLang);
      if (typeof window === 'undefined') return;

      const currentFull =
        window.location.pathname + window.location.search + window.location.hash;
      const targetUrl = buildLocalizedPath(currentFull, targetLang);
      commitNavigation(targetUrl, {
        replace: false,
        scrollToTop: false,
        handleHashScroll: false,
      });
    },
    [commitNavigation, setLanguage]
  );

  const switchPortfolioVersion = useCallback(
    (targetVersion) => {
      if (typeof window === 'undefined') return;
      const normalized = targetVersion === '1' ? '1' : DEFAULT_PORTFOLIO_VERSION;
      const targetUrl = buildVersionedUrl(window.location, normalized);
      commitNavigation(targetUrl, {
        replace: false,
        scrollToTop: true,
        handleHashScroll: false,
      });
    },
    [commitNavigation]
  );

  const contextValue = useMemo(
    () => ({
      ...currentLocation,
      portfolioVersion,
      navigate,
      localizePath,
      switchLanguage,
      switchPortfolioVersion,
    }),
    [
      currentLocation,
      portfolioVersion,
      navigate,
      localizePath,
      switchLanguage,
      switchPortfolioVersion,
    ]
  );

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
};

RouterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
};

/**
 * Clean accessible link component that integrates with the client-side router.
 */
export const RouterLink = ({
  to,
  onClick,
  children,
  className = '',
  preserveLang = true,
  ...rest
}) => {
  const { navigate, localizePath } = useRouter();
  const resolvedTo = preserveLang ? localizePath(to) : to;

  const handleClick = (e) => {
    if (onClick) onClick(e);

    // Normal left-click without keyboard modifiers
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey &&
      !rest.target
    ) {
      e.preventDefault();
      navigate(resolvedTo, { preserveLang });
    }
  };

  return (
    <a href={resolvedTo} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};

RouterLink.propTypes = {
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  preserveLang: PropTypes.bool,
};
