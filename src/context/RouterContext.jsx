import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { parseLocation, buildLocalizedPath } from '../utils/router';
import { useLanguage } from './LanguageContext';

const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(() => parseLocation());
  const { language, setLanguage } = useLanguage();

  const activeLang =
    currentLocation.langPrefix === 'en' || language === 'en' ? 'en' : 'id';

  useEffect(() => {
    const handlePopState = () => {
      const nextLoc = parseLocation(window.location);
      setCurrentLocation(nextLoc);
      const queryLang = new URLSearchParams(nextLoc.search || '').get('lang');
      const nextLang =
        nextLoc.langPrefix === 'en'
          ? 'en'
          : queryLang === 'en' || queryLang === 'id'
          ? queryLang
          : 'id';
      setLanguage(nextLang);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setLanguage]);

  const localizePath = useCallback(
    (to) => buildLocalizedPath(to, activeLang),
    [activeLang]
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
      const targetUrl =
        !preserveLang || explicitEn
          ? to
          : activeLang === 'en'
          ? buildLocalizedPath(to, 'en')
          : to;

      if (explicitEn && language !== 'en') {
        setLanguage('en');
      }

      commitNavigation(targetUrl, { replace, scrollToTop, handleHashScroll: true });
    },
    [activeLang, commitNavigation, language, setLanguage]
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

  const contextValue = useMemo(
    () => ({
      ...currentLocation,
      navigate,
      localizePath,
      switchLanguage,
    }),
    [currentLocation, navigate, localizePath, switchLanguage]
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
