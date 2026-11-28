import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';
import {
  parseLocation,
  buildLocalizedPath,
  buildVersionedUrl,
  withVersionParam,
  DEFAULT_PORTFOLIO_VERSION,
} from '../utils/router';
import { useLanguage, DEFAULT_LANGUAGE } from './LanguageContext';

const RouterContext = createContext(null);

export const RouterProvider = ({
  children,
  shouldAnimateTransition,
  onRunTransition,
  onPreloadRoute,
}) => {
  const [currentLocation, setCurrentLocation] = useState(() => parseLocation());
  const { language, setLanguage } = useLanguage();
  const currentLocationRef = useRef(currentLocation);
  const scrollHistoryRef = useRef(new Map());
  const transitionHooksRef = useRef({
    shouldAnimateTransition,
    onRunTransition,
    onPreloadRoute,
  });

  useEffect(() => {
    transitionHooksRef.current = {
      shouldAnimateTransition,
      onRunTransition,
      onPreloadRoute,
    };
  }, [shouldAnimateTransition, onRunTransition, onPreloadRoute]);

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

      const { shouldAnimateTransition: canAnimate, onRunTransition: runTransition, onPreloadRoute: preloadRoute } =
        transitionHooksRef.current;

      if (typeof canAnimate === 'function' && typeof runTransition === 'function' && canAnimate(prevLoc, nextLoc)) {
        if (typeof preloadRoute === 'function') {
          preloadRoute(nextLoc.route?.type);
        }
        const savedScrollY = scrollHistoryRef.current.get(nextLoc.cleanPath) ?? 0;
        runTransition(() => {
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

      const { shouldAnimateTransition: canAnimate, onRunTransition: runTransition, onPreloadRoute: preloadRoute } =
        transitionHooksRef.current;

      if (typeof canAnimate === 'function' && typeof runTransition === 'function' && canAnimate(prevLoc, nextParsed)) {
        if (prevLoc?.cleanPath) {
          scrollHistoryRef.current.set(prevLoc.cleanPath, window.scrollY || 0);
        }
        if (typeof preloadRoute === 'function') {
          preloadRoute(nextParsed.route?.type);
        }
        runTransition(() => {
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

      const applyLanguageSwitch = () => {
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
      };

      const prefersReduced =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (
        !prefersReduced &&
        typeof document !== 'undefined' &&
        typeof document.startViewTransition === 'function'
      ) {
        document.startViewTransition(() => {
          flushSync(() => {
            applyLanguageSwitch();
          });
        });
        return;
      }

      applyLanguageSwitch();
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
  shouldAnimateTransition: PropTypes.func,
  onRunTransition: PropTypes.func,
  onPreloadRoute: PropTypes.func,
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
