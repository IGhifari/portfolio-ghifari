import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ENABLE_SEASONAL_THEMES } from '../config/site';
import {
  SEASON_PREVIEW_STORAGE_KEY,
  SEASONAL_CSS_VAR_KEYS,
  buildSeasonCssVariables,
  parseSeasonMonth,
  resolveSeasonalTheme,
} from '../config/seasonalEvents';

const ThemeContext = createContext();

const readInitialPreviewMonth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramVal = params.get('season');
    if (paramVal) {
      return paramVal === 'auto' ? null : parseSeasonMonth(paramVal);
    }
    const stored = window.sessionStorage?.getItem(SEASON_PREVIEW_STORAGE_KEY);
    if (stored) {
      return stored === 'auto' ? null : parseSeasonMonth(stored);
    }
  } catch {
    // Ignore storage/URL errors
  }
  return null;
};

const readStoredManualMode = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage?.getItem('nb-theme');
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
};

export const ThemeProvider = ({ children }) => {
  const [calendarMonth, setCalendarMonth] = useState(() => parseSeasonMonth(null, new Date()));
  const [previewMonth, setPreviewMonthState] = useState(readInitialPreviewMonth);
  const [sessionModeOverride, setSessionModeOverride] = useState(null);

  const activeMonth = previewMonth ?? calendarMonth;

  // Determine effective mode ('dark' | 'light')
  const requestedMode = useMemo(() => {
    if (sessionModeOverride) return sessionModeOverride;
    if (!ENABLE_SEASONAL_THEMES) {
      return readStoredManualMode() || 'dark';
    }
    // December always defaults to the dramatic Light Winter transformation unless toggled this session
    if (activeMonth === 12) return 'light';
    // Non-December months respect stored preference if explicitly light, otherwise seasonal dark
    const stored = readStoredManualMode();
    return stored === 'light' ? 'light' : 'dark';
  }, [activeMonth, sessionModeOverride]);

  const season = useMemo(() => {
    if (!ENABLE_SEASONAL_THEMES) {
      return resolveSeasonalTheme(11, requestedMode); // Default theme untouched
    }
    return resolveSeasonalTheme(activeMonth, requestedMode);
  }, [activeMonth, requestedMode]);

  const isDark = season.isDark;

  const setPreviewMonth = useCallback((nextMonthOrNull) => {
    setSessionModeOverride(null);
    if (nextMonthOrNull === null || nextMonthOrNull === undefined || nextMonthOrNull === 'auto') {
      setPreviewMonthState(null);
      try {
        window.sessionStorage?.removeItem(SEASON_PREVIEW_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }
    const parsed = parseSeasonMonth(nextMonthOrNull);
    setPreviewMonthState(parsed);
    try {
      window.sessionStorage?.setItem(SEASON_PREVIEW_STORAGE_KEY, String(parsed));
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = isDark ? 'light' : 'dark';
    setSessionModeOverride(nextMode);
    try {
      window.localStorage?.setItem('nb-theme', nextMode);
    } catch {
      // ignore
    }
  }, [isDark]);

  // Apply seasonal CSS variables, or remove overrides cleanly during default months
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', season.mode);

    if (ENABLE_SEASONAL_THEMES && season.isSeasonalActive) {
      root.setAttribute('data-season', season.id);
      root.setAttribute('data-season-month', String(season.month));
      const vars = buildSeasonCssVariables(season);
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value);
      }
    } else {
      root.setAttribute('data-season', 'default');
      root.setAttribute('data-season-month', String(season.month));
      for (const key of SEASONAL_CSS_VAR_KEYS) {
        root.style.removeProperty(key);
      }
    }
  }, [season]);

  // Automatically sync if local calendar crosses month boundary cleanly without reload
  useEffect(() => {
    const syncCalendar = () => {
      const current = parseSeasonMonth(null, new Date());
      setCalendarMonth((prev) => (prev !== current ? current : prev));
    };
    const interval = setInterval(syncCalendar, 60_000);
    document.addEventListener('visibilitychange', syncCalendar);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', syncCalendar);
    };
  }, []);

  // Expose runtime preview hook for dev/testing and terminal command integration
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onSeasonEvent = (e) => {
      setPreviewMonth(e?.detail?.month ?? null);
    };
    window.__setSeasonalMonth = setPreviewMonth;
    window.addEventListener('set-seasonal-month', onSeasonEvent);
    return () => {
      if (window.__setSeasonalMonth === setPreviewMonth) {
        delete window.__setSeasonalMonth;
      }
      window.removeEventListener('set-seasonal-month', onSeasonEvent);
    };
  }, [setPreviewMonth]);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        season,
        month: activeMonth,
        isPreviewing: previewMonth !== null,
        setPreviewMonth,
        seasonalEnabled: ENABLE_SEASONAL_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
