import { useState, useEffect, useRef, useCallback } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { FiSun, FiMoon, FiDownload, FiBriefcase } from 'react-icons/fi';
import { Link } from 'react-scroll';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useRouter, RouterLink } from '../context/RouterContext';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';
import { siteConfig } from '../config/site';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { route, navigate } = useRouter();
  const mobileDrawerRef = useRef(null);
  const menuBtnRef = useRef(null);

  const isHome = route?.type === 'home';

  // Desktop Header: Curated 5 core high-impact destinations for clean, editorial layout
  const desktopNavItems = [
    { to: 'projects', label: t('nav.work') },
    { to: '/study-case', label: t('nav.caseStudies'), isRoute: true },
    { to: 'experience', label: t('nav.experience') },
    { to: 'about', label: t('nav.about') },
    { to: 'contact', label: t('nav.contact') },
  ];

  // Mobile Drawer: Comprehensive navigation covering all portfolio sections
  const mobileNavItems = [
    { to: 'projects', label: t('nav.work') },
    { to: '/study-case', label: t('nav.caseStudies'), isRoute: true },
    { to: 'about', label: t('nav.about') },
    { to: 'experience', label: t('nav.experience') },
    { to: 'journey', label: t('nav.journey') },
    { to: 'stack', label: t('nav.stack') },
    { to: 'github', label: t('nav.github') },
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

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Trap focus inside mobile navigation drawer and toggle button, Escape key, and restore focus on close
  useFocusTrap({
    isOpen: isMenuOpen,
    containerRef: mobileDrawerRef,
    triggerRef: menuBtnRef,
    additionalElements: [menuBtnRef],
    onClose: closeMenu,
  });

  return (
    <header
      className={`dark-navbar fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'dark-navbar-scrolled pt-2.5 sm:pt-3.5 px-3 sm:px-6 pointer-events-none'
          : 'dark-navbar-transparent pt-0 px-0'
      }`}
    >
      <div
        className={`w-full mx-auto flex items-center justify-between transition-all duration-300 ease-out ${
          isScrolled
            ? 'pointer-events-auto max-w-5xl h-14 px-4 sm:px-6 rounded-full bg-[var(--nav-bg)] backdrop-blur-xl border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_16px_50px_-8px_rgba(0,0,0,0.7)]'
            : 'max-w-6xl h-16 px-5 sm:px-6'
        }`}
      >
        {/* Brand */}
        {isHome ? (
          <Link
            to="profile"
            href="#profile"
            smooth={true}
            duration={600}
            offset={-80}
            className="group cursor-pointer font-grotesk font-black text-base sm:text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target shrink-0 mr-3 xl:mr-6 flex items-center gap-1"
            data-cursor-label="Home"
            aria-label={`${siteConfig.shortName || siteConfig.brandName} - Home`}
          >
            <span>{siteConfig.brandName}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] group-hover:scale-125 transition-transform" />
          </Link>
        ) : (
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="group cursor-pointer font-grotesk font-black text-base sm:text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target shrink-0 mr-3 xl:mr-6 flex items-center gap-1"
            data-cursor-label="Home"
            aria-label={`${siteConfig.shortName || siteConfig.brandName} - Home`}
          >
            <span>{siteConfig.brandName}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] group-hover:scale-125 transition-transform" />
          </a>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
          {desktopNavItems.map(({ to, label, isRoute }) => {
            if (isRoute) {
              const isActive = route?.cleanPath?.startsWith('/study-case');
              return (
                <a
                  key={to}
                  href={to}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(to);
                  }}
                  className={`dark-nav-link cursor-pointer uppercase px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                    isActive
                      ? '!text-[var(--text-primary)] !bg-[var(--surface-alt)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {label}
                </a>
              );
            }

            if (isHome) {
              return (
                <Link
                  key={to}
                  to={to}
                  href={`#${to}`}
                  smooth={true}
                  duration={600}
                  offset={-70}
                  spy={true}
                  activeClass="!text-[var(--text-primary)] !bg-[var(--surface-alt)] font-bold shadow-xs"
                  className="dark-nav-link cursor-pointer uppercase px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-150 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  {label}
                </Link>
              );
            }

            return (
              <a
                key={to}
                href={`/#${to}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/#${to}`);
                }}
                className="dark-nav-link cursor-pointer uppercase px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-150 hover:text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Desktop Controls (Recruiter Mode + CV + Language Selector + Theme Toggle) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Subtle Dock Divider */}
          <div className="h-4 w-px bg-[var(--border)] dark:bg-white/[0.1] mx-1 select-none" aria-hidden="true" />

          {/* Recruiter Mode Overview Trigger */}
          <RouterLink
            to="/recruiter"
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full font-mono text-[11px] font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target ${
              route?.cleanPath === '/recruiter'
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                : 'bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            data-cursor-label="Recruiter"
            title={t('nav.forRecruiters')}
            aria-label={t('nav.forRecruiters')}
          >
            <FiBriefcase size={12} aria-hidden="true" />
            <span className="hidden xl:inline">{t('nav.recruiter')}</span>
            <span className="xl:hidden">RECRUITER</span>
          </RouterLink>

          {RESUME_AVAILABLE && (
            <a
              href={RESUME_URL}
              download={RESUME_FILENAME}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('hero.downloadCvAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer cursor-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              data-cursor-label="CV"
            >
              <FiDownload size={12} aria-hidden="true" />
              <span>{t('nav.downloadCv')}</span>
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
            </a>
          )}

          {/* Language Selector: Compact Segmented Toggle ala Raycast */}
          <div
            role="group"
            aria-label={t('nav.langGroup')}
            className="flex items-center h-8 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]"
          >
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`h-full px-2 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target ${
                language === 'id'
                  ? 'bg-[var(--surface-alt)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              data-cursor-label="ID"
              aria-pressed={language === 'id'}
              title="ID — Bahasa Indonesia"
            >
              ID
            </button>
            <span className="text-[var(--border)] select-none text-[9px] px-0.5" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`h-full px-2 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target ${
                language === 'en'
                  ? 'bg-[var(--surface-alt)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              data-cursor-label="EN"
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-target"
            data-cursor-label="Theme"
            title={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
          >
            {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
        </div>

        {/* Mobile/Tablet Actions: Language Selector + Theme Toggle + Menu Button */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* Mobile Language Selector */}
          <div
            role="group"
            aria-label={t('nav.langGroup')}
            className="flex items-center h-8 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]"
          >
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`h-full px-2 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'id'
                  ? 'bg-[var(--surface-alt)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={language === 'id'}
              title="ID — Bahasa Indonesia"
            >
              ID
            </button>
            <span className="text-[var(--border)] select-none text-[9px]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`h-full px-2 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                language === 'en'
                  ? 'bg-[var(--surface-alt)] text-[var(--text-primary)] shadow-xs'
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            title={isDark ? t('nav.themeToLight') : t('nav.themeToDark')}
          >
            {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>

          <button
            ref={menuBtnRef}
            type="button"
            id="mobile-nav-toggle"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-drawer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            {isMenuOpen ? <IoClose size={18} /> : <IoMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay / Drawer */}
      <div
        id="mobile-nav-drawer"
        ref={mobileDrawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mobileMenu') || 'Mobile navigation'}
        className={`lg:hidden fixed z-50 pointer-events-auto transition-all duration-300 ease-in-out overflow-y-auto ${
          isScrolled
            ? 'inset-x-3 sm:inset-x-4 top-[4.25rem] max-w-lg mx-auto rounded-2xl bg-[var(--surface)]/95 dark:bg-[#0c1017]/95 backdrop-blur-2xl border border-[var(--border)] dark:border-white/[0.1] shadow-2xl'
            : 'inset-x-0 top-16 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border)]'
        } ${
          isMenuOpen
            ? 'max-h-[calc(100vh-5rem)] opacity-100 py-5 visible'
            : 'max-h-0 opacity-0 py-0 invisible'
        }`}
        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-5 flex flex-col gap-1.5">
          {mobileNavItems.map(({ to, label, isRoute }) => {
            if (isRoute) {
              const isActive = route?.cleanPath?.startsWith('/study-case');
              return (
                <a
                  key={to}
                  href={to}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    navigate(to);
                  }}
                  className={`py-2.5 px-4 rounded-xl font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                    isActive
                      ? '!text-[var(--accent)] !bg-[var(--surface-alt)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {label}
                </a>
              );
            }

            if (isHome) {
              return (
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
                  className="py-2.5 px-4 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-xl font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  {label}
                </Link>
              );
            }

            return (
              <a
                key={to}
                href={`/#${to}`}
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  navigate(`/#${to}`);
                }}
                className="py-2.5 px-4 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded-xl font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                {label}
              </a>
            );
          })}
          {/* Mobile Recruiter Mode Link */}
          <RouterLink
            to="/recruiter"
            onClick={closeMenu}
            className={`py-2.5 px-4 rounded-xl font-grotesk font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
              route?.cleanPath === '/recruiter'
                ? '!text-[var(--accent)] !bg-[var(--surface-alt)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiBriefcase size={15} aria-hidden="true" className="text-[var(--accent)]" />
              <span>{t('nav.recruiter')}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              HIRING
            </span>
          </RouterLink>

          {RESUME_AVAILABLE && (
            <a
              href={RESUME_URL}
              download={RESUME_FILENAME}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              aria-label={`${t('hero.downloadCvAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
              className="mt-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-grotesk font-bold text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiDownload size={15} aria-hidden="true" />
              <span>{t('nav.downloadCv')}</span>
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
            </a>
          )}

          {/* Mobile Drawer Language Controls */}
          <div className="pt-3 mt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between px-3">
            <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
              {language === 'id' ? 'Bahasa' : 'Language'}
            </span>
            <div
              role="group"
              aria-label={t('nav.langGroup')}
              className="flex items-center h-8 p-0.5 rounded-full bg-[var(--surface-muted)] dark:bg-white/[0.04] border border-[var(--border)] dark:border-white/[0.08]"
            >
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`h-full px-3 rounded-full text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                  language === 'id'
                    ? 'bg-[var(--surface-alt)] dark:bg-white/[0.12] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                ID
              </button>
              <span className="text-[var(--border)] dark:text-white/[0.1] select-none text-[10px]" aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`h-full px-3 rounded-full text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                  language === 'en'
                    ? 'bg-[var(--surface-alt)] dark:bg-white/[0.12] text-[var(--text-primary)]'
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
