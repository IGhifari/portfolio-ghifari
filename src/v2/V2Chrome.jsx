import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Lenis from 'lenis';
import { FiArrowUpRight, FiCheck, FiCopy, FiX } from 'react-icons/fi';

import { siteConfig, ENABLE_SEASONAL_THEMES } from '../config/site';
import { directEmail, contactChannelsData } from '../data/contact';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { RouterLink, useRouter } from '../context/RouterContext';
import V2OpeningSequence from './V2OpeningSequence';
import V2SeasonDrawerPicker, { V2SeasonHeaderBadge } from './V2SeasonSelector';
import { buildV2SeasonTokens } from './v2SeasonPalette';
import { hasCompletedV2Opening, useV2TransitionState } from './v2OpeningState';
import './v2.css';

const SeasonalEffects = lazy(() => import('../components/SeasonalEffects'));
const DeveloperTerminal = lazy(() => import('../components/DeveloperTerminal'));

const NAKULA_EASE = [0.22, 1, 0.36, 1];

export function V2RolloverLabel({ text }) {
  return (
    <span className="v2-rollover-wrap">
      <span className="v2-rollover-track">
        <span className="v2-rollover-line">{text}</span>
        <span className="v2-rollover-line" aria-hidden="true">
          {text}
        </span>
      </span>
    </span>
  );
}

V2RolloverLabel.propTypes = {
  text: PropTypes.string.isRequired,
};

/**
 * Masked Character-by-Character Display Heading Rise (Shared across V2 subpages)
 */
export function V2MaskedHeading({
  lines,
  as: Tag = 'h1',
  className = '',
  shouldReduceMotion = false,
  reveal,
}) {
  if (shouldReduceMotion) {
    return (
      <Tag className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  let charCursor = 0;
  const isControlled = typeof reveal === 'boolean';

  return (
    <motion.div
      initial="hidden"
      animate={isControlled ? (reveal ? 'visible' : 'hidden') : undefined}
      whileInView={isControlled ? undefined : 'visible'}
      viewport={isControlled ? undefined : { once: true, amount: 0.2 }}
    >
      <Tag className={className}>
        {lines.map((line) => {
          const words = line.split(' ');
          return (
            <span key={line} className="block overflow-hidden py-[0.02em]">
              {words.map((word, wIdx) => (
                <span
                  key={`${word}-${wIdx}`}
                  className="inline-block whitespace-nowrap mr-[0.22em] last:mr-0"
                >
                  {Array.from(word).map((ch, cIdx) => {
                    const delay = charCursor * 0.018;
                    charCursor += 1;
                    return (
                      <motion.span
                        key={`${ch}-${cIdx}`}
                        variants={{
                          hidden: { y: '106%' },
                          visible: {
                            y: '0%',
                            transition: {
                              duration: 0.56,
                              delay,
                              ease: NAKULA_EASE,
                            },
                          },
                        }}
                        className="inline-block will-change-transform"
                      >
                        {ch}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </span>
          );
        })}
      </Tag>
    </motion.div>
  );
}

V2MaskedHeading.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  as: PropTypes.elementType,
  className: PropTypes.string,
  shouldReduceMotion: PropTypes.bool,
  reveal: PropTypes.bool,
};

/**
 * Exact Nakula `/works` & `MORE WORKS` Project Grid Card:
 * - Image mask `aspect-ratio: 1.3518`, `border-radius: 12px`
 * - Hover: mask `scale(0.92)` + inner image `scale(1.09)` + spring frosted `"VIEW PROJECT ↗"` cursor pill
 * - Title: Geist `56px` desktop (`40px` mobile), `600`, `-0.06em`, `#cacaca`
 * - Subtitle: Geist `24px` desktop (`19px` mobile), `500`, `-0.05em`, `#858585`
 */
export function V2WorkGridCard({
  project,
  index = 0,
  isEn,
  shouldReduceMotion = false,
  reveal,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pillX = useSpring(mouseX, { stiffness: 340, damping: 28, mass: 0.4 });
  const pillY = useSpring(mouseY, { stiffness: 340, damping: 28, mass: 0.4 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.jump(e.clientX - rect.left);
    mouseY.jump(e.clientY - rect.top);
    setIsHovered(true);
  };

  const subtitleText = project.subtitle
    ? isEn
      ? project.subtitle.en
      : project.subtitle.id
    : isEn
    ? project.description.en
    : project.description.id;

  const isControlled = typeof reveal === 'boolean';

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 36 }}
      animate={
        shouldReduceMotion || !isControlled
          ? undefined
          : reveal
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 36 }
      }
      whileInView={shouldReduceMotion || isControlled ? undefined : { opacity: 1, y: 0 }}
      viewport={isControlled ? undefined : { once: true, amount: 0.14 }}
      transition={{
        duration: 0.66,
        delay: (isControlled ? 0.14 : 0) + (index % 2) * 0.08,
        ease: NAKULA_EASE,
      }}
      className="v2-works-grid-card group flex flex-col gap-6 sm:gap-8"
    >
      <RouterLink
        to={`/study-case/${project.id}`}
        aria-label={`${project.title} — ${subtitleText}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-[12px]"
      >
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Floating Cursor Badge ("VIEW PROJECT ↗") */}
          {!shouldReduceMotion && (
            <motion.div
              className="v2-view-project-pill hidden lg:inline-flex"
              style={{ left: pillX, top: pillY }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.78,
              }}
              transition={{ duration: 0.18, ease: NAKULA_EASE }}
              aria-hidden="true"
            >
              <span>{isEn ? 'VIEW PROJECT' : 'LIHAT PROYEK'}</span>
              <FiArrowUpRight size={14} />
            </motion.div>
          )}

          <div className="v2-works-grid-mask">
            <img
              src={project.image}
              alt={project.title}
              loading={index < 2 ? 'eager' : 'lazy'}
              className="v2-works-grid-img"
            />
          </div>
        </div>
      </RouterLink>

      <div className="flex flex-col gap-3 sm:gap-4">
        <h3 className="text-[36px] sm:text-[48px] xl:text-[56px] font-semibold tracking-[-0.06em] leading-[1.0] text-[var(--v2-text)]">
          <RouterLink
            to={`/study-case/${project.id}`}
            className="hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-sm"
          >
            {project.title}
          </RouterLink>
        </h3>
        <p className="text-[19px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.08] text-[var(--v2-text-muted)] line-clamp-2">
          {subtitleText}
        </p>
      </div>
    </motion.article>
  );
}

V2WorkGridCard.propTypes = {
  project: PropTypes.object.isRequired,
  index: PropTypes.number,
  isEn: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
  reveal: PropTypes.bool,
};

/**
 * Shared Portfolio V2 Subpage Shell (`/study-case` & `/study-case/:slug`):
 * - Fixed compact Nakula navbar (`120x36` small wordmark at all scroll positions)
 * - Right-side slide-over drawer (`activeNav`: `'works'`)
 * - Scoped single Lenis smooth scroll instance
 * - Pre-Footer `"LET'S WORK TOGETHER"` CTA + Nakula Footer in natural document flow
 */
export default function V2SubpageShell({ children, scrollKey = '' }) {
  const shouldReduceMotion = useReducedMotion();
  const { language } = useLanguage();
  const { isDark, season, seasonalEnabled } = useTheme();
  const { switchLanguage, navigate } = useRouter();
  const isEn = language === 'en';
  const v2SeasonVars = useMemo(
    () => buildV2SeasonTokens(season, seasonalEnabled),
    [season, seasonalEnabled]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [jakartaTime, setJakartaTime] = useState('');
  const [showOpening, setShowOpening] = useState(
    () => !shouldReduceMotion && !hasCompletedV2Opening()
  );
  const { subpageRevealReady } = useV2TransitionState();
  const isNavbarReady = Boolean(shouldReduceMotion || (!showOpening && subpageRevealReady));

  const lenisRef = useRef(null);
  const ctaSectionRef = useRef(null);

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ['start end', 'end start'],
  });
  const ctaSpotlightY = useTransform(ctaProgress, [0, 1], [0, 72]);

  // Enable viewport-level V2 scroll root
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    htmlEl.classList.add('v2-scroll-root');
    return () => {
      htmlEl.classList.remove('v2-scroll-root');
    };
  }, []);

  // Scoped single Lenis smooth scroll instance
  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [shouldReduceMotion]);

  // Reset scroll to top cleanly when switching between projects
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (shouldReduceMotion) {
      setShowOpening(false);
      return undefined;
    }

    if (!hasCompletedV2Opening()) {
      setShowOpening(true);
    }
    return undefined;
  }, [scrollKey, shouldReduceMotion]);

  // Live GMT+7 clock
  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
        setJakartaTime(formatted);
      } catch {
        setJakartaTime('4:50 PM');
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  const scrollToContact = useCallback(() => {
    setIsMenuOpen(false);
    const el = document.getElementById('v2-subpage-contact');
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -64 });
    } else {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [shouldReduceMotion]);

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(directEmail);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      }
    } catch {
      // Ignore restricted clipboard environments
    }
  }, []);

  const drawerItems = [
    { key: 'home', label: 'HOME', action: () => { setIsMenuOpen(false); navigate('/'); } },
    { key: 'works', label: 'WORKS', active: true, action: () => { setIsMenuOpen(false); navigate('/study-case'); } },
    { key: 'about', label: 'ABOUT', action: () => { setIsMenuOpen(false); navigate('/#v2-about'); } },
    { key: 'contact', label: 'CONTACT', action: scrollToContact },
  ];

  return (
    <div
      className="v2-portfolio-root"
      data-portfolio-version="2"
      data-v2-season={season?.isSeasonalActive ? season.id : 'default'}
      style={v2SeasonVars}
    >
      {ENABLE_SEASONAL_THEMES && (
        <Suspense fallback={null}>
          <SeasonalEffects />
        </Suspense>
      )}

      {/* ====================================================================
          INITIAL SITE ENTRY — ORBITAL TELEMETRY OPENING (`000% -> 100%`)
          ==================================================================== */}
      {showOpening && (
        <V2OpeningSequence
          isEn={isEn}
          onComplete={() => setShowOpening(false)}
        />
      )}

      {/* ====================================================================
          FIXED COMPACT NAKULA NAVBAR (Wordmark starts Small on `/works` & `/works/:slug`)
          ==================================================================== */}
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={isNavbarReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.55, ease: NAKULA_EASE }}
        className="v2-nav-scrim fixed top-0 left-0 right-0 h-[75px] md:h-[88px] z-[40] pointer-events-none"
      >
        <div className="v2-container flex items-center justify-between pt-4 md:pt-5">
          {/* Small Compact Wordmark (`~36px` tall, exact Nakula subpage navbar) */}
          <RouterLink
            to="/"
            className="pointer-events-auto v2-display-heading text-[34px] md:text-[38px] leading-[0.88] text-[var(--v2-text)] hover:text-[var(--v2-text-bright)] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-sm"
          >
            {siteConfig.brandName}
            <span className="text-[0.34em] align-top ml-0.5 font-sans font-normal text-[var(--v2-text)]">
              ®
            </span>
          </RouterLink>

          {/* Right Cluster (`mix-blend-difference` in dark mode; direct contrast in Light Winter) */}
          <div
            className={`pointer-events-auto flex items-center gap-5 lg:gap-10 ${
              isDark ? 'mix-blend-difference' : ''
            }`}
          >
            <div className="hidden md:flex flex-col text-left leading-[1.22]">
              <div className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
                <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
                <span>{isEn ? 'Available for project' : 'Tersedia untuk proyek'}</span>
              </div>
              <span className="pl-4 text-[13px] font-normal uppercase tracking-[-0.03em] text-[var(--v2-text-muted)]">
                {isEn ? 'OPEN FOR ROLES' : 'TERBUKA UNTUK KERJA'}
              </span>
            </div>

            <div className="hidden lg:flex flex-col text-left leading-[1.22]">
              <span className="text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
                {jakartaTime}
              </span>
              <span className="text-[13px] font-normal tracking-[-0.03em] text-[var(--v2-text-muted)]">
                (GMT+7)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <V2SeasonHeaderBadge isEn={isEn} onOpenDrawer={() => setIsMenuOpen(true)} />

              <button
                type="button"
                onClick={() => switchLanguage(isEn ? 'id' : 'en')}
                aria-label={isEn ? 'Switch language to Indonesian' : 'Ganti bahasa ke Inggris'}
                className="inline-flex h-[43px] items-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-3 text-[12px] font-bold uppercase tracking-[-0.02em] text-[var(--v2-text)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
              >
                <span className={!isEn ? 'text-[var(--v2-accent)]' : 'text-[var(--v2-text-dim)]'}>ID</span>
                <span className="mx-1 text-[#444444]">/</span>
                <span className={isEn ? 'text-[var(--v2-accent)]' : 'text-[var(--v2-text-dim)]'}>EN</span>
              </button>

              <a
                href="#v2-subpage-contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToContact();
                }}
                className="v2-pill-btn !h-[43px] !py-0 !px-5 !text-[14px]"
              >
                <V2RolloverLabel text={isEn ? "LET'S TALK" : 'HUBUNGI SAYA'} />
              </a>

              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label={isEn ? 'Open navigation menu' : 'Buka menu navigasi'}
                aria-expanded={isMenuOpen}
                className="group inline-flex h-[43px] w-[43px] md:h-[46px] md:w-[46px] items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] text-[var(--v2-text)] hover:border-[var(--v2-text-dim)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
              >
                <span className="flex flex-col gap-1.5" aria-hidden="true">
                  <span className="block h-[1.5px] w-4 bg-current transition-transform duration-300 group-hover:translate-x-[1.5px]" />
                  <span className="block h-[1.5px] w-4 bg-current transition-transform duration-300 group-hover:-translate-x-[1.5px]" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ====================================================================
          SLIDE-OVER RIGHT MENU DRAWER
          ==================================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="v2-subpage-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: NAKULA_EASE }}
            className="fixed inset-0 z-[130] flex justify-end bg-black/75 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? 'Navigation Menu' : 'Menu Navigasi'}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              key="v2-subpage-drawer-panel"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: '0%' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.48, ease: NAKULA_EASE }}
              className="flex h-full w-full max-w-[460px] flex-col justify-between border-l border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-7 py-6 sm:px-9 sm:py-7 will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--v2-border-strong)] pb-5">
                <div className="flex items-center gap-2.5 text-[13px] font-medium uppercase tracking-[-0.02em] text-[var(--v2-text-muted)]">
                  <span className="inline-block h-1.5 w-1.5 bg-[var(--v2-accent)]" aria-hidden="true" />
                  <span>MENU</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={isEn ? 'Close navigation menu' : 'Tutup menu navigasi'}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-text-dim)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <FiX
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>

              <nav className="my-auto py-4" aria-label="Portfolio V2 Navigation">
                <ul className="divide-y divide-[var(--v2-border)]">
                  {drawerItems.map((item, idx) => (
                    <li key={item.key} className="overflow-hidden">
                      <motion.button
                        type="button"
                        initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.42,
                          delay: 0.06 + idx * 0.05,
                          ease: NAKULA_EASE,
                        }}
                        onClick={item.action}
                        className="v2-drawer-nav-btn group flex w-full items-center py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                      >
                        <span className="v2-drawer-nav-item">
                          <span className="v2-drawer-nav-label v2-display-heading text-[48px] sm:text-[54px] text-[var(--v2-text)] group-hover:text-[var(--v2-text-bright)] transition-colors duration-300">
                            {item.label}
                          </span>
                          {item.active && (
                            <span
                              className="inline-block h-2 w-2 bg-[var(--v2-accent)] self-center"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="space-y-5 pt-4">
                <V2SeasonDrawerPicker isEn={isEn} />

                <div>
                  <p className="mb-1.5 text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                    (EMAIL)
                  </p>
                  <a
                    href={`mailto:${directEmail}`}
                    className="inline-block text-[26px] sm:text-[30px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-accent)] hover:opacity-85 transition-opacity break-all"
                  >
                    {directEmail}
                  </a>
                </div>
                <div>
                  <p className="mb-2.5 text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                    (SOCIALS)
                  </p>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-[17px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                    {contactChannelsData.map((ch) => (
                      <a
                        key={ch.key}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 hover:text-[var(--v2-text-bright)] transition-colors"
                      >
                        <span>{ch.name}</span>
                        <FiArrowUpRight
                          size={14}
                          className="text-[var(--v2-text-dim)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--v2-accent)]"
                        />
                      </a>
                    ))}
                    <RouterLink
                      to="/recruiter"
                      onClick={() => setIsMenuOpen(false)}
                      className="group inline-flex items-center gap-1.5 hover:text-[var(--v2-text-bright)] transition-colors"
                    >
                      <span>{isEn ? 'Recruiter' : 'Rekruter'}</span>
                      <FiArrowUpRight
                        size={14}
                        className="text-[var(--v2-text-dim)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--v2-accent)]"
                      />
                    </RouterLink>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          PAGE CONTENT + PRE-FOOTER CTA + NAKULA FOOTER
          ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        {children}

        {/* Pre-Footer Contact CTA (Exact Nakula `/works` & `/works/arjuna` CTA Wrapper) */}
        <section
          id="v2-subpage-contact"
          ref={ctaSectionRef}
          className="relative z-[2] min-h-[580px] sm:min-h-[700px] flex items-center overflow-hidden bg-[var(--v2-bg)] py-24"
        >
          <motion.div
            aria-hidden="true"
            style={shouldReduceMotion ? undefined : { y: ctaSpotlightY }}
            className="v2-cta-spotlight pointer-events-none absolute -inset-y-20 inset-x-0 will-change-transform"
          />

          <div className="v2-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <V2MaskedHeading
                as="h2"
                lines={isEn ? ["LET'S WORK", 'TOGETHER'] : ['MARI BEKERJA', 'BERSAMA']}
                className="v2-section-heading"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>

            <div className="lg:col-span-5 space-y-6 lg:pb-2">
              <p className="text-[20px] sm:text-[24px] font-medium tracking-[-0.04em] leading-[1.2] text-[var(--v2-text-muted)] max-w-md">
                {isEn
                  ? 'Have a frontend role, web application, or collaborative project in mind? Let’s build it with clarity.'
                  : 'Punya peluang frontend, aplikasi web, atau proyek kolaborasi? Mari bangun bersama dengan jelas dan terukur.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${directEmail}`}
                  className="v2-pill-btn v2-pill-btn--accent flex-1 !h-[60px] !text-[16px] justify-between !px-7"
                >
                  <V2RolloverLabel text={isEn ? 'GET IN TOUCH' : 'HUBUNGI SEKARANG'} />
                  <FiArrowUpRight size={20} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={isEn ? 'Copy email address' : 'Salin alamat email'}
                  className="v2-pill-btn !h-[60px] !px-5 !text-[13px]"
                >
                  {copiedEmail ? (
                    <>
                      <FiCheck size={15} className="text-[#47c554]" />
                      <span>{isEn ? 'COPIED' : 'TERSALIN'}</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={15} />
                      <span>{isEn ? 'COPY EMAIL' : 'SALIN EMAIL'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer in normal document flow (exact `/works` & `/works/arjuna` behavior) */}
      <footer className="relative z-[3] bg-[var(--v2-bg)]">
        <div className="bg-[var(--v2-bg)] border-t border-[var(--v2-border)]">
          <div className="v2-container pt-14 pb-8 space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 space-y-5">
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="w-[82px] shrink-0 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                    (EMAIL)
                  </span>
                  <a
                    href={`mailto:${directEmail}`}
                    className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-accent)] hover:underline break-all"
                  >
                    {directEmail}
                  </a>
                </div>
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="w-[82px] shrink-0 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                    (LOCATION)
                  </span>
                  <p className="text-[20px] sm:text-[24px] font-semibold tracking-[-0.04em] leading-none text-[var(--v2-text)]">
                    Bogor / Jakarta, ID
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                <div>
                  <p className="mb-4 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                    (LINKS)
                  </p>
                  <ul className="space-y-2 text-[19px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                    <li>
                      <RouterLink to="/" className="hover:text-[var(--v2-accent)] transition-colors">
                        Home
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/#v2-about" className="hover:text-[var(--v2-accent)] transition-colors">
                        About
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/study-case" className="hover:text-[var(--v2-accent)] transition-colors">
                        Works
                      </RouterLink>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={scrollToContact}
                        className="hover:text-[var(--v2-accent)] transition-colors"
                      >
                        Contact
                      </button>
                    </li>
                    <li>
                      <RouterLink to="/recruiter" className="hover:text-[var(--v2-accent)] transition-colors">
                        Recruiter
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/play" className="hover:text-[var(--v2-accent)] transition-colors">
                        3D World
                      </RouterLink>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="mb-4 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                    (SOCIALS)
                  </p>
                  <ul className="space-y-2 text-[19px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                    {contactChannelsData.map((channel) => (
                      <li key={channel.key}>
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                        >
                          <span>{channel.name}</span>
                          <FiArrowUpRight size={15} className="text-[var(--v2-text-dim)]" />
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href="https://www.npmjs.com/package/@ghifari29/id-kit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                      >
                        <span>npm</span>
                        <FiArrowUpRight size={15} className="text-[var(--v2-text-dim)]" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <p className="text-[15px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text)] max-w-[280px]">
                  {isEn
                    ? 'Download my official CV to review full experience, projects, and engineering credentials.'
                    : 'Unduh CV resmi saya untuk meninjau pengalaman lengkap, proyek, dan kredensial rekayasa.'}
                </p>

                <div className="border-b border-[var(--v2-border-strong)] pb-3 flex items-center justify-between text-[16px] text-[var(--v2-text-dim)]">
                  <span className="truncate pr-3">{RESUME_FILENAME}</span>
                  <span className="text-[12px] font-semibold uppercase text-[var(--v2-accent)]">PDF</span>
                </div>

                {RESUME_AVAILABLE && (
                  <a
                    href={RESUME_URL}
                    download={RESUME_FILENAME}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v2-pill-btn w-full !h-[52px] !text-[14px]"
                  >
                    <V2RolloverLabel text={isEn ? 'DOWNLOAD CV' : 'UNDUH CV'} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
              <p className="uppercase">
                @{new Date().getFullYear()} {siteConfig.brandName}. ALL RIGHTS RESERVED
              </p>
              <p className="uppercase font-medium text-[var(--v2-text)]">
                ENGINEERED BY {siteConfig.brandName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--v2-accent)] text-[var(--v2-accent-ink)] pt-24 pb-10 sm:pt-[100px] sm:pb-12">
          <div className="v2-container flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <p className="v2-display-heading !text-[var(--v2-accent-ink)] text-[clamp(4.75rem,15.5vw,13rem)] leading-[0.80]">
              {siteConfig.brandName}
              <span className="text-[0.28em] align-top ml-1 font-sans font-normal">®</span>
            </p>
            <p className="text-left sm:text-right text-[clamp(2.1rem,3.8vw,3.35rem)] font-semibold tracking-[-0.055em] leading-[0.96] text-[var(--v2-accent-ink)] max-w-[260px]">
              {isEn
                ? 'Beyond Visuals. Built with Vision.'
                : 'Melampaui Visual. Dibangun dengan Visi.'}
            </p>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <DeveloperTerminal />
      </Suspense>
    </div>
  );
}

V2SubpageShell.propTypes = {
  children: PropTypes.node.isRequired,
  scrollKey: PropTypes.string,
};
