import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { parseLocation } from '../utils/router';

const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(() => parseLocation());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentLocation(parseLocation(window.location));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to, { replace = false, scrollToTop = true } = {}) => {
    if (typeof window === 'undefined') return;

    if (!to) return;

    // Handle external links directly
    if (/^https?:\/\//i.test(to) || to.startsWith('mailto:') || to.startsWith('tel:')) {
      window.location.href = to;
      return;
    }

    const currentUrl =
      window.location.pathname + window.location.search + window.location.hash;

    // If already at target without replace, do nothing
    if (to === currentUrl && !replace) {
      return;
    }

    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    const newParsed = parseLocation(window.location);
    setCurrentLocation(newParsed);

    // Scroll restoration & Anchor handling
    if (newParsed.hash) {
      // Dispatch hashchange so any listener (like DeferredSection) wakes up
      window.dispatchEvent(new Event('hashchange'));

      const elementId = newParsed.hash.replace(/^#/, '');
      // Delay slightly so DOM can mount if navigating across routes
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      ...currentLocation,
      navigate,
    }),
    [currentLocation, navigate]
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
export const RouterLink = ({ to, onClick, children, className = '', ...rest }) => {
  const { navigate } = useRouter();

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
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};

RouterLink.propTypes = {
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
