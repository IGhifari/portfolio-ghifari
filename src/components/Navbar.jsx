import { useState, useEffect } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { FiSun, FiMoon, FiDownload } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { to: 'projects', label: t('nav.work') },
    { to: 'about', label: t('nav.about') },
    { to: 'journey', label: t('nav.journey') },
    { to: 'stack', label: t('nav.stack') },
    { to: 'certificates', label: t('nav.certificates') },
    { to: 'education', label: t('nav.education') },
    { to: 'contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`dark-navbar ${
        isScrolled ? 'dark-navbar-scrolled shadow-sm' : 'dark-navbar-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="profile"
          href="#profile"
          smooth={true}
          duration={600}
          offset={-80}
          className="cursor-pointer font-grotesk font-black text-lg md:text-xl tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          aria-label="Ghifari - Home"
        >
          GHIFARI<span className="text-[var(--accent)]">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main Navigation">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              href={`#${to}`}
              smooth={true}
              duration={600}
              offset={-70}
              spy={true}
              activeClass="!text-[var(--accent)]"
              className="dark-nav-link cursor-pointer uppercase py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Controls (CV + Language Selector + Theme Toggle) */}
        <div className="hidden lg:flex items-center gap-2.5">
          {RESUME_AVAILABLE && (
            <a
              href={RESUME_URL}
              download={RESUME_FILENAME}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('hero.downloadCvAria')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              <FiDownload size={13} aria-hidden="true" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          )}

          {/* Language Selector: Compact Segmented Toggle */}
          <div
            role="group"
            aria-label={t('nav.langGroup')}
            className="flex items-center h-9 p-0.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]"
          >
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`h-full px-2.5 rounded text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'id'
                  ? 'bg-[var(--surface-alt)] text-[var(--accent)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={language === 'id'}
              title="ID — Bahasa Indonesia"
            >
              ID
            </button>
            <span className="text-[var(--border)] select-none text-[10px] px-0.5" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`h-full px-2.5 rounded text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'en'
                  ? 'bg-[var(--surface-alt)] text-[var(--accent)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={language === 'en'}
              title="EN — English"
            >
              EN
            </button>
          </div>

          <button
            id="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            title={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </div>

        {/* Mobile/Tablet Actions: Language Selector + Theme Toggle + Menu Button */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* Mobile Language Selector */}
          <div
            role="group"
            aria-label={t('nav.langGroup')}
            className="flex items-center h-9 p-0.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]"
          >
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`h-full px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'id'
                  ? 'bg-[var(--surface-alt)] text-[var(--accent)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={language === 'id'}
              title="ID — Bahasa Indonesia"
            >
              ID
            </button>
            <span className="text-[var(--border)] select-none text-[10px]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`h-full px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'en'
                  ? 'bg-[var(--surface-alt)] text-[var(--accent)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={language === 'en'}
              title="EN — English"
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all focus-visible:outline-none"
            title={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={isMenuOpen}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            {isMenuOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay / Drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border)] transition-all duration-300 ease-in-out overflow-y-auto ${
          isMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 py-6 visible' : 'max-h-0 opacity-0 py-0 invisible'
        }`}
        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-6 flex flex-col gap-1.5">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              href={`#${to}`}
              smooth={true}
              duration={600}
              offset={-70}
              onClick={closeMenu}
              spy={true}
              activeClass="!text-[var(--accent)] !bg-[var(--surface-alt)]"
              className="py-3 px-4 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-md font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer"
            >
              {label}
            </Link>
          ))}

          {RESUME_AVAILABLE && (
            <a
              href={RESUME_URL}
              download={RESUME_FILENAME}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              aria-label={t('hero.downloadCvAria')}
              className="mt-2 py-3 px-4 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] font-grotesk font-bold text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2"
            >
              <FiDownload size={15} aria-hidden="true" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          )}

          {/* Mobile Drawer Language Controls */}
          <div className="pt-4 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between px-4">
            <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
              {language === 'id' ? 'Bahasa' : 'Language'}
            </span>
            <div
              role="group"
              aria-label={t('nav.langGroup')}
              className="flex items-center h-8 p-0.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)]"
            >
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`h-full px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-[var(--surface-alt)] text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                ID
              </button>
              <span className="text-[var(--border)] select-none text-[10px]" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`h-full px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[var(--surface-alt)] text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
