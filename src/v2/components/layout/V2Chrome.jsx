import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { FiArrowUpRight, FiCheck, FiCopy } from 'react-icons/fi';

import { siteConfig, ENABLE_SEASONAL_THEMES } from '@/config/site';
import { directEmail, contactChannelsData } from '@/data/contact';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '@/data/resume';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { RouterLink, useRouter } from '@/context/RouterContext';
import { useV2Lenis } from '../../hooks/useV2Lenis';
import { useJakartaClock } from '../../hooks/useJakartaClock';
import { useClipboardCopy } from '../../hooks/useClipboardCopy';
import { V2SeasonHeaderBadge } from '../../theme/ThemeControls';
import { buildV2SeasonTokens } from '../../theme/seasonPalette';
import OpeningSequence from '../motion/OpeningSequence';
import { hasCompletedV2Opening, useV2TransitionState } from '../motion/openingState';
import RolloverLabel from '../ui/RolloverLabel';
import MaskedDisplayHeading from '../ui/MaskedDisplayHeading';
import V2MenuDrawer from './V2MenuDrawer';
import '../../styles/v2.css';

const SeasonalEffects = lazy(() => import('@/components/SeasonalEffects'));
const DeveloperTerminal = lazy(() => import('@/components/DeveloperTerminal'));
const V2ChatAssistant = lazy(() => import('./V2ChatAssistant'));

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Editorial `/works` & `MORE WORKS` Project Grid Card (Nakula-inspired):
 * - Image mask `aspect-ratio: 1.3518`, `border-radius: 12px`
 * - Hover: mask `scale(0.92)` + inner image `scale(1.09)` + spring frosted `"VIEW PROJECT ↗"` cursor pill
 * - Title: Geist `56px` desktop (`40px` mobile), `600`, `-0.06em`, `#cacaca`
 * - Subtitle: Geist `24px` desktop (`19px` mobile), `500`, `-0.05em`, `#858585`
 */
export function V2WorkGridCard({
  project,
  index = 0,
  shouldReduceMotion = false,
  reveal,
}) {
  const { t, resolve } = useLanguage();
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

  const subtitleText = resolve(project.subtitle || project.description);

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
              <span>{t('v2.common.viewProject')}</span>
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
  shouldReduceMotion: PropTypes.bool,
  reveal: PropTypes.bool,
};

/**
 * Shared Portfolio V2 Subpage Shell (`/study-case` & `/study-case/:slug`):
 * - Fixed compact editorial navbar (`120x36` small wordmark at all scroll positions)
 * - Right-side slide-over drawer (`activeNav`: `'works'`)
 * - Scoped single Lenis smooth scroll instance
 * - Pre-Footer `"LET'S WORK TOGETHER"` CTA + Editorial Footer in natural document flow
 */
export default function V2SubpageShell({ children, scrollKey = '' }) {
  const shouldReduceMotion = useReducedMotion();
  const { language, t } = useLanguage();
  const { isDark, season, seasonalEnabled } = useTheme();
  const { switchLanguage, navigate } = useRouter();
  const nextLanguage = language === 'en' ? 'id' : 'en';
  const v2SeasonVars = useMemo(
    () => buildV2SeasonTokens(season, seasonalEnabled),
    [season, seasonalEnabled]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOpening, setShowOpening] = useState(
    () => !shouldReduceMotion && !hasCompletedV2Opening()
  );
  const { subpageRevealReady } = useV2TransitionState();
  const isNavbarReady = Boolean(shouldReduceMotion || (!showOpening && subpageRevealReady));

  const lenisRef = useV2Lenis(Boolean(shouldReduceMotion));
  const jakartaTime = useJakartaClock();
  const { copied: copiedEmail, copy: copyToClipboard } = useClipboardCopy(2200);
  const ctaSectionRef = useRef(null);

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ['start end', 'end start'],
  });
  const ctaSpotlightY = useTransform(ctaProgress, [0, 1], [0, 72]);

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
  }, [lenisRef, scrollKey, shouldReduceMotion]);

  const scrollToContact = useCallback(() => {
    setIsMenuOpen(false);
    const el = document.getElementById('v2-subpage-contact');
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -64 });
    } else {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [lenisRef, shouldReduceMotion]);

  const handleCopyEmail = useCallback(() => {
    copyToClipboard(directEmail);
  }, [copyToClipboard]);

  const drawerItems = [
    { id: 'home', label: 'HOME', action: () => { setIsMenuOpen(false); navigate('/'); } },
    { id: 'works', label: 'WORKS', active: true, action: () => { setIsMenuOpen(false); navigate('/study-case'); } },
    { id: 'about', label: 'ABOUT', action: () => { setIsMenuOpen(false); navigate('/#v2-about'); } },
    { id: 'contact', label: 'CONTACT', action: scrollToContact },
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
        <OpeningSequence
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
          {/* Small Compact Wordmark (`~36px` tall, editorial subpage navbar) */}
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
            className={`pointer-events-auto flex items-center gap-3 lg:gap-10 shrink-0 ${
              isDark ? 'mix-blend-difference' : ''
            }`}
          >
            <div className="hidden lg:flex flex-col text-left leading-[1.22] whitespace-nowrap">
              <div className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
                <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
                <span>{t('v2.common.availableForProject')}</span>
              </div>
              <span className="pl-4 text-[13px] font-normal uppercase tracking-[-0.03em] text-[var(--v2-text-muted)]">
                {t('v2.common.openForRoles')}
              </span>
            </div>

            <div className="hidden lg:flex flex-col text-left leading-[1.22] whitespace-nowrap">
              <span className="text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
                {jakartaTime}
              </span>
              <span className="text-[13px] font-normal tracking-[-0.03em] text-[var(--v2-text-muted)]">
                (GMT+7)
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <V2SeasonHeaderBadge onOpenDrawer={() => setIsMenuOpen(true)} />

              <button
                type="button"
                onClick={() => switchLanguage(nextLanguage)}
                aria-label={t('v2.common.switchLangAria')}
                className="v2-nav-lang-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
              >
                <span className={language === 'id' ? 'text-[var(--v2-accent)] transition-colors duration-300' : 'v2-lang-inactive'}>ID</span>
                <span className="mx-1 text-[#444444]">/</span>
                <span className={language === 'en' ? 'text-[var(--v2-accent)] transition-colors duration-300' : 'v2-lang-inactive'}>EN</span>
              </button>

              <div className="flex items-center gap-1">
                <a
                  href="#v2-subpage-contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToContact();
                  }}
                  className="v2-pill-btn v2-nav-talk-btn"
                >
                  <RolloverLabel text={t('v2.common.letsTalk')} />
                </a>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label={t('v2.common.openMenuAria')}
                  aria-expanded={isMenuOpen}
                  className="v2-nav-menu-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <span className="v2-nav-menu-bars" aria-hidden="true">
                    <span className="v2-nav-menu-bar v2-nav-menu-bar--top" />
                    <span className="v2-nav-menu-bar v2-nav-menu-bar--bottom" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ====================================================================
          SLIDE-OVER RIGHT MENU DRAWER
          ==================================================================== */}
      <V2MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={drawerItems}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
      />

      {/* ====================================================================
          PAGE CONTENT + PRE-FOOTER CTA + NAKULA FOOTER
          ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        {children}

        {/* Pre-Footer Contact CTA (Editorial subpage CTA Wrapper) */}
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
              <MaskedDisplayHeading
                as="h2"
                lines={Array.isArray(t('v2.contact.headingLines')) ? t('v2.contact.headingLines') : []}
                className="v2-section-heading"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>

            <div className="lg:col-span-5 space-y-6 lg:pb-2">
              <p className="text-[20px] sm:text-[24px] font-medium tracking-[-0.04em] leading-[1.2] text-[var(--v2-text-muted)] max-w-md">
                {t('v2.contact.subpageIntro')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${directEmail}`}
                  className="v2-pill-btn v2-pill-btn--accent flex-1 !h-[60px] !text-[16px] justify-between !px-7"
                >
                  <RolloverLabel text={t('v2.contact.getInTouch')} />
                  <FiArrowUpRight size={20} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={t('v2.common.copyEmailAria')}
                  className="v2-pill-btn !h-[60px] !px-5 !text-[13px]"
                >
                  {copiedEmail ? (
                    <>
                      <FiCheck size={15} className="text-[#47c554]" />
                      <span>{t('v2.common.copied')}</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={15} />
                      <span>{t('v2.common.copyEmail')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer in normal document flow (subpage footer layout) */}
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
                    {siteConfig.author.location}
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
                    {siteConfig.author.npm && (
                      <li>
                        <a
                          href={siteConfig.author.npm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                        >
                          <span>npm</span>
                          <FiArrowUpRight size={15} className="text-[var(--v2-text-dim)]" />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <p className="text-[15px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text)] max-w-[280px]">
                  {t('v2.common.downloadCvDesc')}
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
                    <RolloverLabel text={t('v2.common.downloadCv')} />
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
              {t('v2.common.beyondVisualsTagline')}
            </p>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <V2ChatAssistant />
        <DeveloperTerminal />
      </Suspense>
    </div>
  );
}

V2SubpageShell.propTypes = {
  children: PropTypes.node.isRequired,
  scrollKey: PropTypes.string,
};
