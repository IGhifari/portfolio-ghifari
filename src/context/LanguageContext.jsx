import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translations } from '../data/translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'portfolio-language';
const DEFAULT_LANGUAGE = 'id';

const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'id' || stored === 'en') {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.setAttribute('lang', language);
    } catch {
      // Ignore storage access errors in restricted environments
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'id' ? 'en' : 'id'));
  }, []);

  /**
   * Helper to retrieve translated string by dot notation path (e.g. 'nav.work')
   * Fallback to en or the key if not found.
   */
  const t = useCallback(
    (keyPath, fallback = '') => {
      if (!keyPath) return fallback;
      const keys = keyPath.split('.');
      let current = translations[language];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          // Fallback to Indonesian then English
          let fb = translations[DEFAULT_LANGUAGE];
          for (const fbKey of keys) {
            if (fb && typeof fb === 'object' && fbKey in fb) {
              fb = fb[fbKey];
            } else {
              fb = undefined;
              break;
            }
          }
          return fb !== undefined ? fb : fallback || keyPath;
        }
      }

      return current !== undefined ? current : fallback || keyPath;
    },
    [language]
  );

  /**
   * Resolves a bilingual field which may be { id: '...', en: '...' } or a plain string
   */
  const resolve = useCallback(
    (field) => {
      if (!field) return '';
      if (typeof field === 'object') {
        return field[language] || field[DEFAULT_LANGUAGE] || field.en || '';
      }
      return field;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      resolve,
    }),
    [language, setLanguage, toggleLanguage, t, resolve]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
