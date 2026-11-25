import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Lenis from 'lenis';
import { FiArrowUpRight, FiCheck, FiCopy, FiMinus, FiPlus, FiX } from 'react-icons/fi';

import { siteConfig, ENABLE_SEASONAL_THEMES } from '../config/site';
import { profileData } from '../data/profile';
import { selectedProjects, allProjects } from '../data/projects';
import { experiences } from '../data/experience';
import { educationMetadata } from '../data/education';
import { techCategoriesData } from '../data/skills';
import { directEmail, contactChannelsData } from '../data/contact';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { RouterLink, useRouter } from '../context/RouterContext';
import V2OpeningSequence from './V2OpeningSequence';
import V2SeasonDrawerPicker, { V2SeasonHeaderBadge } from './V2SeasonSelector';
import { buildV2SeasonTokens } from './v2SeasonPalette';
import { hasCompletedV2Opening } from './v2OpeningState';
import './v2.css';

const SeasonalEffects = lazy(() => import('../components/SeasonalEffects'));
const DeveloperTerminal = lazy(() => import('../components/DeveloperTerminal'));
const GithubActivityV2 = lazy(() => import('./GithubActivityV2'));
const ContactFormV2 = lazy(() => import('./ContactFormV2'));

const NAKULA_EASE = [0.22, 1, 0.36, 1];
const SERVICES_EASE = [0.4, 0, 0.2, 1];

/* ==========================================================================
   Scroll & Typography Primitives (1:1 Nakula Mechanics)
   ========================================================================== */

function RolloverLabel({ text }) {
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

RolloverLabel.propTypes = {
  text: PropTypes.string.isRequired,
};

/**
 * Animated Count-Up Metric Cell (Exact Nakula video 00:03–00:05:
 * staggered upward rise into a level 4-column horizontal strip + ease-out integer count-up)
 */
function CountUpMetricCell({ numeral, suffix, label, index, isTriggered, shouldReduceMotion }) {
  const target = Number(numeral) || 0;
  const [count, setCount] = useState(() => (shouldReduceMotion ? target : 0));

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(target);
      return undefined;
    }
    if (!isTriggered) return undefined;

    const controls = animate(0, target, {
      duration: 1.75,
      delay: index * 0.12,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [index, isTriggered, shouldReduceMotion, target]);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 52 }}
      animate={
        shouldReduceMotion || isTriggered
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 52 }
      }
      transition={{
        duration: 0.72,
        delay: index * 0.12,
        ease: NAKULA_EASE,
      }}
      className="v2-metric-cell will-change-transform"
    >
      <div className="v2-metric-ticks" aria-hidden="true" />
      <div className="flex items-baseline" aria-label={`${target}${suffix}`}>
        <span className="text-[52px] sm:text-[76px] xl:text-[80px] font-semibold tracking-[-0.07em] leading-none text-[var(--v2-text)]">
          {count}
        </span>
        <span className="text-[44px] sm:text-[68px] font-semibold tracking-[-0.06em] leading-none text-[var(--v2-accent)]">
          {suffix}
        </span>
      </div>
      <p className="mt-12 max-w-[185px] text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] leading-[1.3] text-[var(--v2-text-muted)]">
        {label}
      </p>
    </motion.div>
  );
}

CountUpMetricCell.propTypes = {
  numeral: PropTypes.string.isRequired,
  suffix: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isTriggered: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};

/**
 * Masked Character-by-Character Display Heading Rise (Exact Nakula h2 viewport-entry reveal)
 */
function MaskedDisplayHeading({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassNames = [],
  shouldReduceMotion = false,
}) {
  if (shouldReduceMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, lineIdx) => (
          <span key={line} className={`block ${lineClassNames[lineIdx] || ''}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  let charCursor = 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
    >
      <Tag className={className}>
        {lines.map((line, lineIdx) => {
          const words = line.split(' ');
          return (
            <span
              key={line}
              className={`block overflow-hidden py-[0.02em] ${lineClassNames[lineIdx] || ''}`}
            >
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
                              duration: 0.58,
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

MaskedDisplayHeading.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  as: PropTypes.elementType,
  className: PropTypes.string,
  lineClassNames: PropTypes.arrayOf(PropTypes.string),
  shouldReduceMotion: PropTypes.bool,
};

/**
 * Threshold-switched About word with exact Nakula `transition: color 0.22s ease-out`
 * Only updates React state when crossing its threshold (2 renders total, zero scroll jank).
 */
function AboutThresholdWord({ word, progress, threshold }) {
  const [isLit, setIsLit] = useState(false);

  useMotionValueEvent(progress, 'change', (latest) => {
    const nextLit = latest >= threshold;
    setIsLit((prev) => (prev !== nextLit ? nextLit : prev));
  });

  return (
    <span
      className="v2-about-word"
      style={{ color: isLit ? 'var(--v2-text)' : 'var(--v2-about-unlit)' }}
    >
      {word}
    </span>
  );
}

AboutThresholdWord.propTypes = {
  word: PropTypes.string.isRequired,
  progress: PropTypes.object.isRequired,
  threshold: PropTypes.number.isRequired,
};

/**
 * Exact Nakula About Section (`height: 200vh`, `z-index: 2`)
 * - Slides cleanly over sticky Hero (`z-index: 1`) while Hero scales/fades out.
 * - Words switch `#555555 -> #cacaca` across `y = 550..1550px`.
 * - Unsticks cleanly at `200vh` and scrolls upward 1:1 with Latest Work following naturally.
 */
function NakulaAboutSection({ text }) {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 40%', 'end end'],
  });

  const words = text.split(' ');

  return (
    <section
      id="v2-about"
      ref={trackRef}
      className="relative z-[2] h-[200vh] w-full bg-[var(--v2-bg)]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center px-4 sm:px-12 lg:px-[150px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col lg:flex-row items-start gap-6 lg:gap-[56px]">
          <div className="shrink-0 lg:pt-3">
            <span className="v2-section-tag">(ABOUT)</span>
          </div>
          <p className="text-[clamp(2rem,3.88vw,3.5rem)] font-semibold tracking-[-0.06em] leading-[1.1] text-[var(--v2-text-dim)]">
            {words.map((word, index) => {
              const threshold = (index / words.length) * 0.78;
              return (
                <AboutThresholdWord
                  key={`${word}-${index}`}
                  word={word}
                  progress={scrollYProgress}
                  threshold={threshold}
                />
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

NakulaAboutSection.propTypes = {
  text: PropTypes.string.isRequired,
};

/**
 * Exact Nakula Work Showcase Card:
 * - Normal-flow stacked card (NOT sticky).
 * - Outer frame scales `0.62 -> 1.0 -> 0.62` with a flat `1.0` centered plateau.
 * - Inner image wrapper applies the inverse counter-scale `1.55 -> 1.0 -> 1.55` inside `overflow-hidden`,
 *   keeping the screenshot optically anchored while the frame expands and contracts!
 */
function WorkShowcaseCard({
  project,
  index,
  onVisible,
  isDesktop,
  isEn,
  shouldReduceMotion,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pillX = useSpring(mouseX, { stiffness: 340, damping: 28, mass: 0.4 });
  const pillY = useSpring(mouseY, { stiffness: 340, damping: 28, mass: 0.4 });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Exact Nakula 3-phase outer scale (0.62 -> 1.0 plateau -> 0.62) + inverse inner counter-scale
  const outerScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.62, 1, 1, 0.62]);
  const innerCounterScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [1.55, 1, 1, 1.55]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(index);
          }
        });
      },
      { rootMargin: '-36% 0px -38% 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

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

  const subtitleText = isEn ? project.subtitle.en : project.subtitle.id;
  const descriptionText = isEn ? project.description.en : project.description.id;
  const useScaleChoreography = isDesktop && !shouldReduceMotion;

  return (
    <article id={`v2-work-item-${project.id}`} ref={cardRef} className="group w-full">
      <motion.div
        style={useScaleChoreography ? { scale: outerScale } : undefined}
        className="origin-center will-change-transform"
      >
        <RouterLink
          to={`/study-case/${project.id}`}
          aria-label={`${project.title} — ${subtitleText}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-[12px]"
        >
          <div
            className="v2-work-card-frame aspect-[16/11] lg:aspect-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
          >
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

            <motion.div
              style={useScaleChoreography ? { scale: innerCounterScale } : undefined}
              className="v2-work-card-img-wrap origin-center"
            >
              <img
                src={project.image}
                alt={project.title}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="v2-work-card-img"
              />
            </motion.div>
          </div>
        </RouterLink>
      </motion.div>

      {/* Mobile & Tablet Project Metadata */}
      <div className="lg:hidden mt-4 space-y-2">
        <h3 className="text-[32px] font-semibold tracking-[-0.05em] leading-[1.05] text-[var(--v2-text)]">
          <RouterLink
            to={`/study-case/${project.id}`}
            className="hover:text-[var(--v2-accent)] transition-colors"
          >
            {project.title}
          </RouterLink>
        </h3>
        <p className="text-[18px] font-medium tracking-[-0.035em] leading-[1.2] text-[var(--v2-text-muted)]">
          {subtitleText}
        </p>
        <p className="text-sm text-[var(--v2-text-dim)] leading-relaxed line-clamp-2">{descriptionText}</p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold uppercase tracking-[-0.02em]">
          <RouterLink
            to={`/study-case/${project.id}`}
            className="inline-flex items-center gap-1 text-[var(--v2-text)] hover:text-[var(--v2-accent)]"
          >
            <span>{isEn ? 'Case Study' : 'Studi Kasus'}</span>
            <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
          </RouterLink>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)]"
            >
              <span>Live</span>
              <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)]"
            >
              <span>GitHub</span>
              <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

WorkShowcaseCard.propTypes = {
  project: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onVisible: PropTypes.func.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  isEn: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};

/**
 * Exact Nakula Sticky Horizontal Process Track (`285vh` outer track, `sticky top-0 h-screen` inner frame):
 * Linearly translates `"HOW I WORK (PROCESS)"` + all 4 `360x560` `STEP 1..4` cards horizontally on desktop,
 * then unsticks cleanly into the next section. Falls back to clean responsive grid on tablet/mobile.
 */
function NakulaProcessSection({ steps, isEn, isDesktop, shouldReduceMotion }) {
  const trackRef = useRef(null);
  const rowRef = useRef(null);
  const [maxPan, setMaxPan] = useState(640);

  useEffect(() => {
    if (typeof window === 'undefined' || !isDesktop || shouldReduceMotion) return undefined;

    const measurePan = () => {
      if (!rowRef.current) return;
      const rowWidth = rowRef.current.scrollWidth;
      const vw = window.innerWidth;
      setMaxPan(Math.max(0, rowWidth - vw + 48));
    };

    measurePan();
    window.addEventListener('resize', measurePan, { passive: true });
    return () => window.removeEventListener('resize', measurePan);
  }, [isDesktop, shouldReduceMotion, steps]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const horizontalX = useTransform(scrollYProgress, [0, 1], [0, -maxPan]);

  if (!isDesktop || shouldReduceMotion) {
    return (
      <section id="v2-experience" className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-32">
        <div className="v2-container mb-12">
          <div className="flex items-start justify-between gap-4">
            <MaskedDisplayHeading
              lines={isEn ? ['HOW I', 'WORK'] : ['JEJAK &', 'PROSES']}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
            <span className="v2-section-tag pt-1">
              ({isEn ? 'PROCESS' : 'PENGALAMAN'})
            </span>
          </div>
        </div>
        <div className="border-t border-b border-[var(--v2-border-strong)]">
          <div className="v2-container !px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--v2-border-strong)]">
              {steps.map((item) => (
                <article
                  key={item.step}
                  className="flex flex-col justify-between min-h-[360px] p-7 bg-[var(--v2-bg)]"
                >
                  <div className="space-y-1">
                    <p className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--v2-text-muted)]">
                      {item.step}
                      <span className="text-[var(--v2-accent)]">.</span>
                    </p>
                    <p className="text-[12px] font-medium uppercase text-[var(--v2-text-dim)]">
                      {item.period}
                    </p>
                  </div>
                  <div className="space-y-3 pt-14">
                    <h3 className="text-[34px] font-semibold tracking-[-0.055em] leading-[1.02] text-[var(--v2-text)]">
                      {item.title}
                    </h3>
                    <p className="text-[14px] font-semibold text-[var(--v2-accent)]">{item.subtitle}</p>
                    <p className="text-[15px] leading-[1.4] text-[var(--v2-text-muted)]">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="v2-experience"
      ref={trackRef}
      className="relative z-[2] h-[285vh] w-full bg-[var(--v2-bg)] overflow-x-clip"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <motion.div
          ref={rowRef}
          style={{ x: horizontalX }}
          className="flex items-center gap-14 px-6 will-change-transform"
        >
          {/* Left Intro Block (`530px` wide — exact Nakula `.framer-1efur92` first child) */}
          <div className="relative w-[530px] shrink-0 h-[560px] flex flex-col justify-between py-2">
            <div className="flex items-start justify-between">
              <MaskedDisplayHeading
                lines={isEn ? ['HOW I', 'WORK'] : ['JEJAK &', 'PROSES']}
                className="v2-section-heading"
                shouldReduceMotion={shouldReduceMotion}
              />
              <span className="v2-section-tag pt-2">
                ({isEn ? 'PROCESS' : 'PENGALAMAN'})
              </span>
            </div>
            <p className="max-w-[360px] text-[20px] font-medium tracking-[-0.04em] leading-[1.2] text-[var(--v2-text-muted)]">
              {isEn
                ? 'Verified track record across industry internship, open-source engineering, and computer science education.'
                : 'Rekam jejak terverifikasi mulai dari magang industri, library open-source, hingga pendidikan informatika.'}
            </p>
          </div>

          {/* Right 4 Horizontal Step Cards (`360 x 560px` each) */}
          <div className="flex shrink-0 border-t border-b border-l border-[var(--v2-border-strong)]">
            {steps.map((item) => (
              <article
                key={item.step}
                className="w-[360px] h-[560px] shrink-0 border-r border-[var(--v2-border-strong)] p-8 flex flex-col justify-between bg-[var(--v2-bg)]"
              >
                <div className="space-y-1.5">
                  <p className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--v2-text-muted)]">
                    {item.step}
                    <span className="text-[var(--v2-accent)]">.</span>
                  </p>
                  <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]">
                    {item.period}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-[40px] font-semibold tracking-[-0.055em] leading-[1.02] text-[var(--v2-text)]">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--v2-accent)]">
                    {item.subtitle}
                  </p>
                  <p className="text-[16px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text-muted)]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

NakulaProcessSection.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  isEn: PropTypes.bool.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};

/* ==========================================================================
   Main Portfolio V2 Component — Exact 1:1 Nakula Scroll & Visual Reconstruction
   ========================================================================== */

export default function PortfolioV2() {
  const shouldReduceMotion = useReducedMotion();
  const { language } = useLanguage();
  const { isDark, season, seasonalEnabled } = useTheme();
  const { navigate, switchLanguage } = useRouter();
  const isEn = language === 'en';
  const v2SeasonVars = useMemo(
    () => buildV2SeasonTokens(season, seasonalEnabled),
    [season, seasonalEnabled]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOpening, setShowOpening] = useState(
    () => !shouldReduceMotion && !hasCompletedV2Opening()
  );
  const [heroIntroComplete, setHeroIntroComplete] = useState(() =>
    Boolean(shouldReduceMotion || hasCompletedV2Opening())
  );
  const [isWordmarkCompact, setIsWordmarkCompact] = useState(false);
  const [isHeroExited, setIsHeroExited] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isTabletUp, setIsTabletUp] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [activeSection, setActiveSection] = useState('v2-top');
  const [activeWorkIdx, setActiveWorkIdx] = useState(0);
  const [openCapabilityIdx, setOpenCapabilityIdx] = useState(-1);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [jakartaTime, setJakartaTime] = useState('');

  const lenisRef = useRef(null);
  const capabilityLeaveTimerRef = useRef(null);
  const metricsGridRef = useRef(null);
  const highlightImgRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const footerRef = useRef(null);

  const isMetricsInView = useInView(metricsGridRef, { once: true, amount: 0.25 });

  const { scrollY } = useScroll();

  // 1) Exact Nakula Hero Exit Transform (`y = 49 -> 500px`):
  // Scales `1 -> 0.9`, lifts `0 -> -100px`, fades `1 -> 0` while sticky as About rises over it!
  const heroOpacity = useTransform(scrollY, [49, 500], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [49, 500], [0, -100]);
  const heroScale = useTransform(scrollY, [49, 500], [1, 0.9]);

  // 2) Exact Nakula Wordmark Variant Switch (`Big -> Small` at `y > 48px`) + Hero pointer lock release
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const compact = latest > 48;
    setIsWordmarkCompact((prev) => (prev !== compact ? compact : prev));
    const exited = latest > 490;
    setIsHeroExited((prev) => (prev !== exited ? exited : prev));
  });

  // 3) Highlight Right Studio Frame Zoom-Out (`scale 1.15 -> 1.0` on scroll entry)
  const { scrollYProgress: highlightProgress } = useScroll({
    target: highlightImgRef,
    offset: ['start end', 'center center'],
  });
  const highlightImgScale = useTransform(highlightProgress, [0, 1], [1.15, 1]);

  // 4) Pre-Footer CTA Spotlight Downward Parallax (`translateY 0 -> 72px`)
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ['start end', 'end start'],
  });
  const ctaSpotlightY = useTransform(ctaProgress, [0, 1], [0, 72]);

  // 5) Footer Bottom Blue Banner Curtain-Slide (`translateY -340px -> 0px` from behind `z-3` Dark Footer)
  const { scrollYProgress: footerProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const accentBannerY = useTransform(footerProgress, [0, 1], [-340, 0]);

  // Viewport responsive breakpoint tracking
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
      setIsTabletUp(window.innerWidth >= 768);
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Initial site entry plays Orbital Telemetry Opening (`showOpening`);
  // Subsequent returns to Home are wiped seamlessly by persistent `<V2PageTransition />` in App.jsx.
  useEffect(() => {
    if (shouldReduceMotion || hasCompletedV2Opening()) {
      setShowOpening(false);
      setHeroIntroComplete(true);
      return undefined;
    }

    setShowOpening(true);
    setHeroIntroComplete(false);
    return undefined;
  }, [shouldReduceMotion]);

  // Scroll to target anchor on hash arrival (e.g. `/#v2-about`); leave normal & popstate scroll to RouterContext
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return undefined;
    const id = window.location.hash.replace(/^#/, '');
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: -72, immediate: true });
        } else {
          el.scrollIntoView({ behavior: 'auto' });
        }
      }
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  // Enable viewport-level position:sticky strictly inside Portfolio V2
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    htmlEl.classList.add('v2-scroll-root');
    return () => {
      htmlEl.classList.remove('v2-scroll-root');
    };
  }, []);

  // Exact Nakula Lenis Smooth Scroll Curve (~1.2s exponential settle matching live measurement)
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

  // Track active section for drawer indicator
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const sectionIds = ['v2-top', 'v2-work', 'v2-about', 'v2-contact'];
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
        setJakartaTime('4:33 PM');
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

  const scrollToSection = useCallback(
    (sectionId) => {
      setIsMenuOpen(false);
      if (sectionId === 'v2-top') {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
        }
        return;
      }
      const el = document.getElementById(sectionId);
      if (!el) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -72 });
      } else {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    },
    [shouldReduceMotion]
  );

  // Cleanup capability hover timer on unmount
  useEffect(
    () => () => {
      if (capabilityLeaveTimerRef.current) {
        clearTimeout(capabilityLeaveTimerRef.current);
      }
    },
    []
  );

  const handleCapabilityEnter = useCallback((idx) => {
    if (capabilityLeaveTimerRef.current) {
      clearTimeout(capabilityLeaveTimerRef.current);
      capabilityLeaveTimerRef.current = null;
    }
    setOpenCapabilityIdx(idx);
  }, []);

  const handleCapabilityLeave = useCallback(() => {
    if (!isDesktopViewport) return;
    if (capabilityLeaveTimerRef.current) {
      clearTimeout(capabilityLeaveTimerRef.current);
    }
    capabilityLeaveTimerRef.current = setTimeout(() => {
      setOpenCapabilityIdx(-1);
      capabilityLeaveTimerRef.current = null;
    }, 140);
  }, [isDesktopViewport]);

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

  const activeWork = selectedProjects[activeWorkIdx] || selectedProjects[0];
  const internship = experiences[0];

  const capabilities = [
    {
      number: '01',
      title: isEn ? 'Frontend Engineering & UI' : 'Rekayasa Frontend & UI',
      summary: isEn
        ? 'Fast, accessible (WCAG 2.1 AA), and modular interfaces built with React, Next.js 15, TypeScript, and Tailwind CSS.'
        : 'Antarmuka cepat, aksesibel (WCAG 2.1 AA), dan modular dengan React, Next.js 15, TypeScript, dan Tailwind CSS.',
      tags: ['React 18', 'Next.js 15', 'TypeScript', 'WCAG 2.1 AA'],
      image: '/images/projects/akseskita.webp',
      featuredProject: 'AksesKita',
      featuredSlug: 'akseskita',
    },
    {
      number: '02',
      title: isEn ? 'Full-Stack Web Systems' : 'Sistem Web Full-Stack',
      summary: isEn
        ? 'End-to-end web platforms pairing reactive frontends with Node.js, Express, Laravel, RBAC auth, and Zod validation.'
        : 'Platform web end-to-end memadukan frontend reaktif dengan Node.js, Express, Laravel, autentikasi RBAC, dan Zod.',
      tags: ['Node.js & Express', 'Laravel', 'REST API', 'Auth & RBAC'],
      image: '/images/projects/project_management.webp',
      featuredProject: 'Project Management System',
      featuredSlug: 'project-management',
    },
    {
      number: '03',
      title: isEn ? 'Databases & Open-Source' : 'Database & Open-Source',
      summary: isEn
        ? 'Relational schemas in PostgreSQL/MySQL with Prisma ORM, plus zero-dependency TypeScript tooling published to npm.'
        : 'Skema relasional PostgreSQL/MySQL dengan Prisma ORM serta paket utilitas TypeScript zero-dependency di npm.',
      tags: ['PostgreSQL', 'Prisma ORM', 'tsup (ESM/CJS)', 'Vitest CI'],
      image: '/images/projects/id-kit.webp',
      featuredProject: '@ghifari29/id-kit',
      featuredSlug: 'id-kit',
    },
    {
      number: '04',
      title: isEn ? 'AI Pipelines & WebGL' : 'Alur AI & WebGL Interaktif',
      summary: isEn
        ? 'Gemini AI document workflows backed by BullMQ + Redis worker queues alongside interactive Three.js browser worlds.'
        : 'Pemrosesan dokumen Gemini AI dengan antrean BullMQ + Redis serta pengalaman browser interaktif Three.js.',
      tags: ['Gemini API', 'BullMQ + Redis', 'Three.js / WebGL', 'Framer Motion'],
      image: '/images/projects/studyflow.webp',
      featuredProject: 'StudyFlow',
      featuredSlug: 'studyflow',
    },
  ];

  const processTrackSteps = [
    {
      step: 'STEP 1',
      period: isEn ? internship.period.en : internship.period.id,
      title: 'PT. AMA Salam',
      subtitle: isEn ? internship.role.en : internship.role.id,
      body: isEn ? internship.description.en : internship.description.id,
    },
    {
      step: 'STEP 2',
      period: '2025 — Present',
      title: '@ghifari29/id-kit',
      subtitle: isEn ? 'Open-Source Author · npm' : 'Penulis Open-Source · npm',
      body: isEn
        ? 'Engineered a zero-dependency offline TypeScript utility library for Indonesian data formats (9 modules, 10 subpath exports, 509 Vitest tests).'
        : 'Merancang library TypeScript offline zero-dependency untuk data Indonesia (9 modul, 10 subpath exports, 509 unit test Vitest).',
    },
    {
      step: 'STEP 3',
      period: isEn ? 'Ongoing' : 'Sedang Berjalan',
      title: educationMetadata.gunadarma.institution,
      subtitle: isEn ? 'Bachelor of Informatics' : 'S1 Informatika',
      body: isEn
        ? 'Focusing on software engineering, algorithms, data structures, relational database design, and distributed web systems.'
        : 'Berfokus pada rekayasa perangkat lunak, algoritma, struktur data, perancangan basis data relasional, dan sistem web.',
    },
    {
      step: 'STEP 4',
      period: educationMetadata.smkn1Cibinong.period,
      title: educationMetadata.smkn1Cibinong.institution,
      subtitle: isEn ? 'Software Engineering (RPL)' : 'Rekayasa Perangkat Lunak',
      body: isEn
        ? 'Vocational software engineering foundation covering full-stack web applications, relational databases, and national educational game competitions.'
        : 'Fondasi kejuruan Rekayasa Perangkat Lunak mencakup pengembangan aplikasi web full-stack, basis data relasional, dan kompetisi game nasional.',
    },
  ];

  // Authentic 4-column desktop metrics matching Nakula's 4 desktop metric columns
  const totalSkillsCount = techCategoriesData.reduce(
    (acc, category) => acc + category.skills.length,
    0
  );

  const metricsData = [
    {
      numeral: String(allProjects.length),
      suffix: '+',
      label: isEn ? 'Completed web & software projects' : 'Proyek web & perangkat lunak selesai',
    },
    {
      numeral: '509',
      suffix: '+',
      label: isEn ? 'Automated unit tests in @ghifari29/id-kit' : 'Unit test otomatis di @ghifari29/id-kit',
    },
    {
      numeral: '100',
      suffix: '%',
      label: isEn ? 'WCAG 2.1 AA accessibility focus' : 'Fokus aksesibilitas WCAG 2.1 AA',
    },
    {
      numeral: String(totalSkillsCount),
      suffix: '+',
      label: isEn ? 'Core technologies & engineering tools' : 'Teknologi inti & perangkat rekayasa',
    },
  ];

  const faqItems = [
    {
      q: isEn
        ? 'What is your primary engineering focus and tech stack?'
        : 'Apa fokus utama rekayasa perangkat lunak dan tech stack Anda?',
      a: isEn
        ? 'My primary focus is Frontend Engineering with React, Next.js 15, TypeScript, and Tailwind CSS, backed by practical full-stack experience building REST APIs and relational schemas using Node.js, Express, Prisma ORM, PostgreSQL, and Laravel.'
        : 'Fokus utama saya adalah Frontend Engineering dengan React, Next.js 15, TypeScript, dan Tailwind CSS, didukung pengalaman full-stack membangun REST API dan database relasional dengan Node.js, Express, Prisma ORM, PostgreSQL, serta Laravel.',
    },
    {
      q: isEn
        ? 'Are you currently available for frontend or full-stack roles?'
        : 'Apakah saat ini tersedia untuk posisi kerja atau proyek pengembangan web?',
      a: isEn
        ? 'Yes. Following my Frontend Developer Internship at PT. AMA Salam Indonesia, I am open to frontend engineer, web developer, and full-stack software engineering opportunities as well as collaborative web projects.'
        : 'Ya. Setelah menyelesaikan magang Frontend Developer di PT. AMA Salam Indonesia, saya terbuka untuk peluang kerja Frontend Engineer, Web Developer, maupun kolaborasi proyek pengembangan aplikasi web.',
    },
    {
      q: isEn
        ? 'Can I inspect your architecture case studies and live code?'
        : 'Bisakah saya meninjau studi kasus arsitektur dan kode sumber proyek Anda?',
      a: isEn
        ? 'Every project in this portfolio includes a dedicated architectural case study (/study-case/:slug) documenting the problem statement, technical architecture, process, and key learnings, plus direct GitHub repository and live demo links where public.'
        : 'Setiap proyek di portofolio ini memiliki halaman studi kasus arsitektur (/study-case/:slug) yang mendokumentasikan masalah, arsitektur teknis, proses, dan pembelajaran, beserta tautan repositori GitHub dan demo langsung.',
    },
    {
      q: isEn
        ? 'How do you approach web performance and accessibility?'
        : 'Bagaimana pendekatan Anda terhadap performa web dan aksesibilitas?',
      a: isEn
        ? 'I build interfaces following WCAG 2.1 AA contrast and keyboard navigation standards, zero layout shift (0 CLS) code-splitting, semantic HTML, and automated test suites.'
        : 'Saya membangun antarmuka dengan standar kontras dan navigasi keyboard WCAG 2.1 AA, pemisahan kode tanpa pergeseran layout (0 CLS), HTML semantik, serta pengujian otomatis.',
    },
  ];

  const featuredCaseStudies = [
    selectedProjects[5], // StudyFlow
    selectedProjects[2], // @ghifari29/id-kit
    selectedProjects[0], // AksesKita
  ].filter(Boolean);

  const aboutStatement = isEn
    ? 'I combine frontend engineering precision with full-stack architecture to craft meaningful, accessible, and story-driven web experiences.'
    : 'Saya memadukan ketelitian rekayasa frontend dengan arsitektur full-stack untuk merancang pengalaman web yang bermakna, aksesibel, dan andal.';

  const drawerLinks = [
    { id: 'v2-top', label: 'HOME', action: () => scrollToSection('v2-top') },
    {
      id: 'v2-work',
      label: 'WORKS',
      action: () => {
        setIsMenuOpen(false);
        navigate('/study-case');
      },
    },
    { id: 'v2-about', label: 'ABOUT', action: () => scrollToSection('v2-about') },
    { id: 'v2-contact', label: 'CONTACT', action: () => scrollToSection('v2-contact') },
  ];

  const useHeroScrollExit = isTabletUp && !shouldReduceMotion;

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
          0. INITIAL SITE ENTRY — ORBITAL TELEMETRY OPENING (`000% -> 100%`)
          ==================================================================== */}
      {showOpening && (
        <V2OpeningSequence
          isEn={isEn}
          onRevealStart={() => setHeroIntroComplete(true)}
          onComplete={() => {
            setHeroIntroComplete(true);
            setShowOpening(false);
          }}
        />
      )}

      {/* ====================================================================
          FIXED NAKULA TOP HEADER (Variant-Switching Wordmark + Blend-Difference Right Nav)
          ==================================================================== */}
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, filter: 'blur(8px)' }}
        animate={
          heroIntroComplete || shouldReduceMotion
            ? { opacity: 1, filter: 'blur(0px)' }
            : { opacity: 0, filter: 'blur(8px)' }
        }
        transition={{ duration: 0.82, delay: 0.04, ease: NAKULA_EASE }}
        className="v2-nav-scrim fixed top-0 left-0 right-0 h-[75px] md:h-[88px] z-[40] pointer-events-none"
      >
        <div className="v2-container flex items-start justify-between pt-4 md:pt-6">
          {/* Desktop Wordmark: Exact Nakula Big -> Small variant switch at scrollY > 48px */}
          <motion.a
            href="#v2-top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('v2-top');
            }}
            initial={false}
            animate={{
              scale: shouldReduceMotion || isWordmarkCompact ? 0.2 : 1,
            }}
            transition={{ duration: 0.48, ease: NAKULA_EASE }}
            style={{ transformOrigin: 'top left' }}
            className="hidden md:inline-block pointer-events-auto v2-display-heading text-[clamp(5.5rem,14.8vw,13.5rem)] leading-[0.80] text-[var(--v2-text)] hover:text-[var(--v2-text-bright)] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-sm will-change-transform"
          >
            {siteConfig.brandName}
            <span className="text-[0.26em] align-top ml-1.5 font-sans font-normal text-[var(--v2-text)]">
              ®
            </span>
          </motion.a>

          {/* Mobile Compact Wordmark */}
          <a
            href="#v2-top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('v2-top');
            }}
            className="md:hidden pointer-events-auto v2-display-heading text-[36px] leading-[0.88] text-[var(--v2-text)] select-none focus-visible:outline-none"
          >
            {siteConfig.brandName}
            <span className="text-[0.34em] align-top ml-0.5 font-sans font-normal text-[var(--v2-text)]">
              ®
            </span>
          </a>

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

              <div className="flex items-center gap-1">
                <a
                  href="#v2-contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('v2-contact');
                  }}
                  className="v2-pill-btn v2-nav-talk-btn"
                >
                  <RolloverLabel text={isEn ? "LET'S TALK" : 'HUBUNGI SAYA'} />
                </a>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label={isEn ? 'Open navigation menu' : 'Buka menu navigasi'}
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
          NAKULA SLIDE-OVER RIGHT MENU DRAWER
          ==================================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="v2-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.56, ease: NAKULA_EASE }}
            className="fixed inset-0 z-[130] flex justify-end bg-black/75 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label={isEn ? 'Navigation Menu' : 'Menu Navigasi'}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              key="v2-menu-panel"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: '0%' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.78, ease: NAKULA_EASE }}
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
                  {drawerLinks.map((item, idx) => {
                    const isCurrent = activeSection === item.id;
                    return (
                      <li key={item.id} className="overflow-hidden">
                        <motion.button
                          type="button"
                          initial={shouldReduceMotion ? false : { y: 28, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.62,
                            delay: 0.16 + idx * 0.08,
                            ease: NAKULA_EASE,
                          }}
                          onClick={item.action}
                          className="v2-drawer-nav-btn group flex w-full items-center py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                        >
                          <span className="v2-drawer-nav-item">
                            <span className="v2-drawer-nav-label v2-display-heading text-[48px] sm:text-[54px] text-[var(--v2-text)] group-hover:text-[var(--v2-text-bright)] transition-colors duration-300">
                              {item.label}
                            </span>
                            {isCurrent && (
                              <span
                                className="inline-block h-2 w-2 bg-[var(--v2-accent)] self-center"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, delay: 0.4, ease: NAKULA_EASE }}
                className="space-y-5 pt-4"
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          MAIN CONTENT
          ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        {/* ------------------------------------------------------------------
            1. HERO SECTION (Sticky `z-1` with exact Nakula scale(0.9) + translateY(-100px) + fade exit)
            ------------------------------------------------------------------ */}
        <motion.section
          id="v2-top"
          style={
            useHeroScrollExit
              ? {
                  opacity: heroOpacity,
                  y: heroTranslateY,
                  scale: heroScale,
                  pointerEvents: isHeroExited ? 'none' : 'auto',
                }
              : undefined
          }
          className="v2-hero-sticky z-[1] min-h-[680px] md:h-screen md:min-h-[700px] w-full flex flex-col justify-between pt-[84px] pb-16 md:pt-28 md:pb-14 overflow-hidden bg-[var(--v2-bg)] origin-center will-change-transform"
        >
          {/* Center Diagonal Cobalt-Blue Spotlight Slit Portrait (Original Profile Photo) */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 1.06, filter: 'blur(10px)' }
            }
            animate={
              heroIntroComplete || shouldReduceMotion
                ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0, scale: 1.06, filter: 'blur(10px)' }
            }
            transition={{ duration: 0.95, delay: 0.05, ease: NAKULA_EASE }}
            className="v2-hero-diagonal-wrap"
            aria-hidden="true"
          >
            <div className="v2-hero-diagonal-mask">
              <img
                src={profileData.avatarImage}
                alt=""
                className="v2-hero-diagonal-img"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Mobile Availability & Clock Row directly below fixed navbar */}
          <div className="v2-container relative z-10 flex md:hidden items-start justify-between gap-4 pb-4">
            <div className="flex flex-col leading-[1.3]">
              <div className="flex items-center gap-2 text-[14px] font-bold tracking-[-0.03em] text-[var(--v2-text)]">
                <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
                <span>{isEn ? 'Available for project' : 'Tersedia untuk proyek'}</span>
              </div>
              <span className="pl-4 text-[12px] uppercase text-[var(--v2-text-muted)]">
                {isEn ? 'OPEN FOR ROLES' : 'TERBUKA UNTUK KERJA'}
              </span>
            </div>
            <div className="flex flex-col text-right leading-[1.3]">
              <span className="text-[14px] font-bold tracking-[-0.03em] text-[var(--v2-text)]">
                {jakartaTime}
              </span>
              <span className="text-[12px] text-[var(--v2-text-muted)]">(GMT+7)</span>
            </div>
          </div>

          {/* Right-Aligned Stacked Display Headline ("Beyond / Visuals. / Built with / Vision.") */}
          <div className="v2-container relative z-10 my-auto flex justify-end pt-4 md:pt-8">
            <h1 className="text-right text-[clamp(2.65rem,3.9vw,3.5rem)] font-semibold tracking-[-0.06em] leading-[1.0] max-w-[300px] sm:max-w-[340px]">
              {[
                { text: isEn ? 'Beyond' : 'Melampaui', highlight: false, delay: 0.1 },
                { text: isEn ? 'Visuals.' : 'Visual.', highlight: false, delay: 0.2 },
                { text: isEn ? 'Built with' : 'Dibangun dengan', highlight: true, delay: 0.32 },
                { text: isEn ? 'Vision.' : 'Visi Rekayasa.', highlight: true, delay: 0.44 },
              ].map((line) => (
                <span key={line.text} className="block py-[0.02em]">
                  <motion.span
                    initial={
                      shouldReduceMotion
                        ? false
                        : { y: 14, opacity: 0, filter: 'blur(12px)' }
                    }
                    animate={
                      heroIntroComplete || shouldReduceMotion
                        ? { y: 0, opacity: 1, filter: 'blur(0px)' }
                        : { y: 14, opacity: 0, filter: 'blur(12px)' }
                    }
                    transition={{ duration: 0.78, delay: line.delay, ease: NAKULA_EASE }}
                    className={`block will-change-transform ${
                      line.highlight ? 'text-[var(--v2-text)]' : 'text-[var(--v2-text-muted)]'
                    }`}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          {/* Bottom Section: Blur-Revealed Two-Tone Statement + Infinite Track Marquee & Outlined Blue Pill CTA */}
          <div className="v2-container relative z-10 space-y-8 md:space-y-12 pt-16 md:pt-0">
            <div className="max-w-[470px]">
              <p className="text-[24px] md:text-[32px] font-semibold tracking-[-0.05em] leading-[1.06] indent-8 md:indent-12">
                <motion.span
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 14, filter: 'blur(14px)' }
                  }
                  animate={
                    heroIntroComplete || shouldReduceMotion
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 14, filter: 'blur(14px)' }
                  }
                  transition={{ duration: 0.86, delay: 0.26, ease: NAKULA_EASE }}
                  className="text-[var(--v2-text)] inline"
                >
                  {isEn
                    ? 'I build web apps, interfaces, and digital systems '
                    : 'Saya membangun aplikasi web, antarmuka, dan sistem digital '}
                </motion.span>
                <motion.span
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 14, filter: 'blur(14px)' }
                  }
                  animate={
                    heroIntroComplete || shouldReduceMotion
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 14, filter: 'blur(14px)' }
                  }
                  transition={{ duration: 0.9, delay: 0.4, ease: NAKULA_EASE }}
                  className="text-[var(--v2-text-dim)] inline"
                >
                  {isEn
                    ? 'with intention, clarity and care.'
                    : 'dengan ketelitian, kejelasan, dan arsitektur terukur.'}
                </motion.span>
              </p>
            </div>

            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 14, filter: 'blur(10px)' }
              }
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 14, filter: 'blur(10px)' }
              }
              transition={{ duration: 0.84, delay: 0.38, ease: NAKULA_EASE }}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex w-full lg:w-auto items-center gap-5 min-w-0">
                <span className="shrink-0 text-[12px] font-medium uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                  {isEn ? 'TRUSTED TRACK:' : 'REKAM JEJAK:'}
                </span>
                <div className="v2-hero-marquee-mask w-full max-w-[500px]">
                  <div className="v2-hero-marquee-track">
                    {[0, 1].map((dupIdx) => (
                      <div
                        key={dupIdx}
                        aria-hidden={dupIdx === 1 ? 'true' : undefined}
                        className="flex items-center gap-10 pr-10"
                      >
                        {[
                          'PT. AMA Salam Indonesia',
                          'Universitas Gunadarma',
                          'SMKN 1 Cibinong',
                          '@ghifari29/id-kit',
                          '509+ Vitest Suite',
                        ].map((brand) => (
                          <span
                            key={`${dupIdx}-${brand}`}
                            className="inline-flex items-center gap-2 whitespace-nowrap text-[14px] sm:text-[15px] font-semibold tracking-[-0.03em] text-[var(--v2-text-muted)]"
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)]/75"
                              aria-hidden="true"
                            />
                            <span>{brand}</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href="#v2-work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('v2-work');
                }}
                className="v2-pill-btn v2-pill-btn--accent w-full lg:w-auto lg:min-w-[310px] !h-[60px] md:!h-[64px] justify-between !px-7 !text-[18px] md:!text-[22px] !font-semibold !tracking-[-0.04em]"
              >
                <RolloverLabel text={isEn ? 'START A PROJECT' : 'LIHAT PROYEK'} />
                <FiArrowUpRight size={24} />
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------------
            2. ABOUT SECTION (`200vh`, sticky `100vh` word reveal, unsticks cleanly at `1800px`)
            ------------------------------------------------------------------ */}
        <NakulaAboutSection text={aboutStatement} />

        {/* ------------------------------------------------------------------
            3. LATEST WORK (Masked Char Rise + Sticky Left Index + Counter-Scaled Right Cards)
            ------------------------------------------------------------------ */}
        <section
          id="v2-work"
          className="relative z-[2] bg-[var(--v2-bg)] pt-12 pb-28 sm:pt-20 sm:pb-36"
        >
          <div className="v2-container">
            {/* Section Heading */}
            <div className="flex flex-col items-start lg:items-center text-left lg:text-center mb-16 lg:mb-[140px]">
              <span className="lg:hidden mb-3 text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text)]">
                ({String(selectedProjects.length).padStart(2, '0')})
              </span>
              <div className="inline-flex items-start">
                <MaskedDisplayHeading
                  lines={isEn ? ['LATEST WORK'] : ['KARYA PILIHAN']}
                  className="v2-section-heading"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
                <span className="hidden lg:inline-block ml-3 mt-1 text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text)]">
                  ({String(selectedProjects.length).padStart(2, '0')})
                </span>
              </div>
            </div>

            {/* 2-Column Showcase: Sticky Left Column (`top: 120px`, `80vh`) + Right Counter-Scaled Cards (`gap: 120px`) */}
            <div className="flex flex-col lg:flex-row items-start gap-12">
              <div className="hidden lg:flex lg:w-[33%] lg:max-w-[330px] shrink-0 sticky top-[120px] h-[80vh] max-h-[680px] flex-col justify-between">
                <div className="space-y-8">
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeWork.number}
                        initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { y: -20, opacity: 0 }}
                        transition={{ duration: 0.22, ease: NAKULA_EASE }}
                        aria-live="polite"
                        className="v2-display-heading text-[116px] leading-[0.88] !text-[var(--v2-big-num)] select-none"
                      >
                        {activeWork.number}.
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <nav aria-label={isEn ? 'Selected projects index' : 'Indeks proyek pilihan'}>
                    <ul className="space-y-2 text-[14px] font-medium tracking-[-0.02em]">
                      {selectedProjects.map((proj, idx) => {
                        const isCurrent = idx === activeWorkIdx;
                        return (
                          <li key={proj.id}>
                            <button
                              type="button"
                              onClick={() => scrollToSection(`v2-work-item-${proj.id}`)}
                              className={`inline-flex items-center gap-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-sm ${
                                isCurrent
                                  ? 'text-[var(--v2-text-bright)] font-semibold'
                                  : 'text-[var(--v2-text-dim)] hover:text-[var(--v2-text)]'
                              }`}
                            >
                              <span
                                className={`inline-block h-[1px] transition-all duration-200 ${
                                  isCurrent ? 'w-3.5 bg-[var(--v2-text)]' : 'w-2 bg-[var(--v2-border-strong)]'
                                }`}
                                aria-hidden="true"
                              />
                              <span>{proj.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWork.id}
                      initial={shouldReduceMotion ? false : { y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { y: -12, opacity: 0 }}
                      transition={{ duration: 0.22, ease: NAKULA_EASE }}
                      className="space-y-2.5"
                    >
                      <h3 className="text-[44px] xl:text-[48px] font-semibold tracking-[-0.055em] leading-[1.0] text-[var(--v2-text)]">
                        <RouterLink
                          to={`/study-case/${activeWork.id}`}
                          className="hover:text-[var(--v2-text-bright)] transition-colors"
                        >
                          {activeWork.title}
                        </RouterLink>
                      </h3>
                      <p className="text-[20px] xl:text-[22px] font-medium tracking-[-0.045em] leading-[1.1] text-[var(--v2-text-muted)]">
                        {isEn ? activeWork.subtitle.en : activeWork.subtitle.id}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-2 text-[12px] font-semibold uppercase tracking-[-0.02em]">
                        <RouterLink
                          to={`/study-case/${activeWork.id}`}
                          className="inline-flex items-center gap-1 text-[var(--v2-text)] hover:text-[var(--v2-accent)] transition-colors"
                        >
                          <span>{isEn ? 'Case Study' : 'Studi Kasus'}</span>
                          <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
                        </RouterLink>
                        {activeWork.live && (
                          <a
                            href={activeWork.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)] transition-colors"
                          >
                            <span>Live</span>
                            <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
                          </a>
                        )}
                        {activeWork.npm && (
                          <a
                            href={activeWork.npm}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)] transition-colors"
                          >
                            <span>npm</span>
                            <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
                          </a>
                        )}
                        {activeWork.github && (
                          <a
                            href={activeWork.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--v2-text-muted)] hover:text-[var(--v2-text-bright)] transition-colors"
                          >
                            <span>GitHub</span>
                            <FiArrowUpRight size={13} className="text-[var(--v2-accent)]" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Scroll Column (`gap: 120px` desktop, exact Nakula card spacing) */}
              <div className="w-full lg:flex-1 flex flex-col gap-16 lg:gap-[120px]">
                {selectedProjects.map((project, idx) => (
                  <WorkShowcaseCard
                    key={project.id}
                    project={project}
                    index={idx}
                    onVisible={setActiveWorkIdx}
                    isDesktop={isDesktopViewport}
                    isEn={isEn}
                    shouldReduceMotion={Boolean(shouldReduceMotion)}
                  />
                ))}
              </div>
            </div>

            {/* Centered "MORE PROJECTS ↗" — navigates directly to V2 Selected Works (/study-case) */}
            <div className="mt-24 lg:mt-32 flex justify-center">
              <RouterLink
                to="/study-case"
                className="v2-pill-btn !px-8 !py-4 !text-[15px]"
              >
                <RolloverLabel text={isEn ? 'MORE PROJECTS' : 'SEMUA PROYEK'} />
                <FiArrowUpRight size={16} className="text-[var(--v2-accent)]" />
              </RouterLink>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            4. WHY US / NUMBERS DON'T LIE (Masked Char Rise + Staggered Count-Up 4-Col Row)
            ------------------------------------------------------------------ */}
        <section
          id="v2-metrics"
          className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
        >
          <div className="v2-container space-y-16 sm:space-y-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="relative">
                <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
                  ({isEn ? 'WHY ME' : 'REKAM JEJAK'})
                </p>
                <MaskedDisplayHeading
                  lines={isEn ? ['NUMBERS', "DON'T LIE"] : ['ANGKA YANG', 'TERBUKTI']}
                  lineClassNames={['md:pl-28 lg:pl-36', '']}
                  className="v2-section-heading"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
              </div>

              <p className="max-w-[360px] text-[20px] sm:text-[24px] font-medium tracking-[-0.045em] leading-[1.12] text-[var(--v2-text-muted)] lg:pb-2">
                {isEn
                  ? 'Grounded in hands-on engineering, I craft accessible interfaces and reliable web systems that deliver results.'
                  : 'Berlandaskan rekayasa terukur, saya merancang antarmuka aksesibel dan sistem web andal yang berdampak nyata.'}
              </p>
            </div>

            {/* Level 4-Column Desktop / 2x2 Mobile Metric Strip with Staggered Rise & Count-Up */}
            <div
              ref={metricsGridRef}
              className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 items-stretch"
            >
              {metricsData.map((stat, idx) => (
                <CountUpMetricCell
                  key={stat.label}
                  numeral={stat.numeral}
                  suffix={stat.suffix}
                  label={stat.label}
                  index={idx}
                  isTriggered={isMetricsInView}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            5. HIGHLIGHT QUOTE (Animated 1px Divider + Scroll Zoom-Out `1.15 -> 1.0` Right Image)
            ------------------------------------------------------------------ */}
        <section className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-[150px]">
          <div className="v2-container">
            <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-[120px]">
              {/* Left Quote Column (`min-width: 55%`) */}
              <div className="w-full lg:w-[55%] space-y-12">
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 left-0 text-[64px] sm:text-[80px] font-semibold leading-none text-[var(--v2-accent)] select-none"
                  >
                    “
                  </span>
                  <blockquote className="text-[32px] sm:text-[48px] xl:text-[56px] font-semibold tracking-[-0.06em] leading-[1.02] indent-12 sm:indent-20">
                    <span className="text-[var(--v2-text)]">
                      {isEn
                        ? 'Building software feels personal. '
                        : 'Membangun perangkat lunak itu personal. '}
                    </span>
                    <span className="text-[var(--v2-text-dim)]">
                      {isEn
                        ? 'Every interface is engineered with type safety, WCAG 2.1 AA accessibility, and clean backend meaning.'
                        : 'Setiap antarmuka dirancang dengan tipe statis ketat, aksesibilitas WCAG 2.1 AA, dan backend yang bersih.'}
                    </span>
                  </blockquote>
                </div>

                {/* Animated 1px Divider Line (Exact Nakula 1s cubic-bezier(0.4, 0, 0.2, 1)) */}
                <div className="w-full overflow-hidden">
                  <motion.div
                    initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1.0, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformOrigin: 'left center' }}
                    className="h-[1px] w-full bg-[var(--v2-border-strong)]"
                  />
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)]">
                    <img
                      src={profileData.avatarImage}
                      alt={siteConfig.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-[51%_60%] scale-[2.4]"
                    />
                  </div>
                  <div>
                    <p className="text-[24px] font-semibold tracking-[-0.04em] leading-tight text-[var(--v2-text)]">
                      {siteConfig.name}
                    </p>
                    <p className="text-[16px] text-[var(--v2-text-dim)] mt-0.5">
                      {isEn
                        ? 'Frontend Intern Alumni at PT. AMA Salam'
                        : 'Alumni Frontend Intern di PT. AMA Salam'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Studio Frame with Scroll Zoom-Out (`1.15 -> 1.0`) */}
              <div ref={highlightImgRef} className="w-full lg:flex-1">
                <RouterLink
                  to="/study-case/project-management"
                  className="block overflow-hidden rounded-[14px] border border-[var(--v2-border)] bg-[var(--v2-surface)] aspect-[4/4.4]"
                >
                  <motion.img
                    src="/images/projects/project_management.webp"
                    alt="Project Management System"
                    loading="lazy"
                    style={shouldReduceMotion ? undefined : { scale: highlightImgScale }}
                    className="h-full w-full object-cover object-top will-change-transform"
                  />
                </RouterLink>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            6. SERVICES / HOW I CAN HELP (Exact Nakula Hover-Triggered 3-Column Morph Row)
            ------------------------------------------------------------------ */}
        <section
          id="v2-capabilities"
          className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
        >
          <div className="v2-container mb-16 sm:mb-24 flex justify-center">
            <div className="inline-flex items-start">
              <MaskedDisplayHeading
                lines={isEn ? ['HOW I CAN HELP'] : ['KEAHLIAN & LAYANAN']}
                className="v2-section-heading text-center"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
              <span className="hidden sm:inline-block ml-3 mt-1 v2-section-tag">
                ({isEn ? 'SERVICES' : 'LAYANAN'})
              </span>
            </div>
          </div>

          <div
            onMouseEnter={() => {
              if (capabilityLeaveTimerRef.current) {
                clearTimeout(capabilityLeaveTimerRef.current);
                capabilityLeaveTimerRef.current = null;
              }
            }}
            onMouseLeave={handleCapabilityLeave}
            className="border-t border-b border-[var(--v2-border)] divide-y divide-[var(--v2-border)]"
          >
            {capabilities.map((cap, idx) => {
              const isOpen = openCapabilityIdx === idx;
              const rowDuration = isOpen ? 0.7 : 0.78;

              return (
                <div key={cap.number}>
                  {/* Desktop (`>= 1024px`): Pure Hover-Expand 3-Column Row (`156px -> 436px`, zero click needed) */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? 436 : 156,
                      backgroundColor: isOpen
                        ? v2SeasonVars['--v2-surface-elevated']
                        : v2SeasonVars['--v2-bg'],
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: rowDuration, ease: SERVICES_EASE }
                    }
                    onMouseEnter={() => handleCapabilityEnter(idx)}
                    onFocus={() => handleCapabilityEnter(idx)}
                    onBlur={handleCapabilityLeave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/study-case/${cap.featuredSlug}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`${cap.number} ${cap.title}`}
                    className="hidden lg:block overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--v2-accent)] will-change-[height,background-color]"
                    onClick={() => navigate(`/study-case/${cap.featuredSlug}`)}
                  >
                    <div className="v2-container h-full grid grid-cols-12 gap-8 relative">
                      {/* Col 1 (`col-span-3`): `01.` scales smoothly from `32px` centered -> `82px` top-left */}
                      <div className="col-span-3 relative h-full">
                        <motion.span
                          initial={false}
                          animate={{
                            scale: isOpen ? 1 : 0.39,
                            y: isOpen ? 54 : 60,
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { duration: rowDuration, ease: SERVICES_EASE }
                          }
                          style={{ transformOrigin: 'left top' }}
                          className="inline-block text-[82px] font-semibold tracking-[-0.055em] leading-[0.88] text-[var(--v2-text-dim)] select-none will-change-transform"
                        >
                          {cap.number}
                          <span className="text-[var(--v2-accent)]">.</span>
                        </motion.span>
                      </div>

                      {/* Col 2 (`col-span-4`): Center Preview Image scales `0.45 -> 1.0` & fades `0 -> 1` */}
                      <div className="col-span-4 flex items-center justify-center h-full">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isOpen ? 1 : 0.45,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { duration: isOpen ? 0.68 : 0.62, ease: SERVICES_EASE }
                          }
                          className={`w-full max-w-[395px] aspect-[1.24] overflow-hidden rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] will-change-[transform,opacity] ${
                            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
                          }`}
                        >
                          <img
                            src={cap.image}
                            alt={cap.featuredProject}
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                          />
                        </motion.div>
                      </div>

                      {/* Col 3 (`col-start-8 col-span-5`): Collapsed `32px` Title morphs into `52px` Title + Summary + Bottom Pill Tags */}
                      <div className="col-start-8 col-span-5 relative h-full">
                        {/* Collapsed State (`32px` title vertically centered) */}
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isOpen ? 0 : 1,
                            y: isOpen ? -18 : 0,
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : {
                                  duration: isOpen ? 0.42 : 0.58,
                                  delay: isOpen ? 0 : 0.14,
                                  ease: SERVICES_EASE,
                                }
                          }
                          aria-hidden={isOpen}
                          className="absolute inset-x-0 top-0 h-[156px] flex items-center pointer-events-none"
                        >
                          <h3 className="text-[32px] font-semibold tracking-[-0.05em] leading-[1.08] text-[var(--v2-text)]">
                            {cap.title}
                          </h3>
                        </motion.div>

                        {/* Hovered/Expanded State (`52px` Title + Description + Bottom Pill Tags) */}
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isOpen ? 1 : 0,
                            y: isOpen ? 0 : 20,
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : {
                                  duration: isOpen ? 0.64 : 0.48,
                                  delay: isOpen ? 0.1 : 0,
                                  ease: SERVICES_EASE,
                                }
                          }
                          aria-hidden={!isOpen}
                          className={`h-full py-[56px] flex flex-col justify-between ${
                            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
                          }`}
                        >
                          <div className="space-y-3.5">
                            <h3 className="text-[44px] xl:text-[52px] font-semibold tracking-[-0.055em] leading-[1.02] text-[var(--v2-text)]">
                              {cap.title}
                            </h3>
                            <p className="text-[18px] xl:text-[20px] font-normal tracking-[-0.03em] leading-[1.3] text-[var(--v2-text-muted)] max-w-[490px]">
                              {cap.summary}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pt-4">
                            {cap.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[var(--v2-border-strong)] px-4 py-2 text-[13px] font-normal tracking-[-0.01em] text-[var(--v2-text-muted)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Mobile / Tablet (`< 1024px`): Clean Touch Fallback (no `+`/`-` clutter) */}
                  <div
                    className={`lg:hidden transition-colors duration-300 ${
                      isOpen ? 'bg-[var(--v2-surface-elevated)]' : 'bg-[var(--v2-bg)]'
                    }`}
                  >
                    <div className="v2-container">
                      <button
                        type="button"
                        onClick={() => setOpenCapabilityIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                        className="flex w-full items-baseline justify-between gap-4 py-8 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                      >
                        <span
                          className={`font-semibold tracking-[-0.05em] text-[var(--v2-text-dim)] transition-all duration-300 ${
                            isOpen ? 'text-[44px] leading-none' : 'text-[24px]'
                          }`}
                        >
                          {cap.number}
                          <span className="text-[var(--v2-accent)]">.</span>
                        </span>
                        <span className="flex-1 text-right sm:text-left sm:pl-6 text-[24px] sm:text-[30px] font-semibold tracking-[-0.05em] leading-[1.08] text-[var(--v2-text)]">
                          {cap.title}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`mobile-service-${cap.number}`}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.36, ease: NAKULA_EASE }}
                            className="overflow-hidden"
                          >
                            <div className="pb-10 space-y-5">
                              <RouterLink
                                to={`/study-case/${cap.featuredSlug}`}
                                className="block overflow-hidden rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] aspect-[16/11]"
                              >
                                <img
                                  src={cap.image}
                                  alt={cap.featuredProject}
                                  loading="lazy"
                                  className="h-full w-full object-cover object-top"
                                />
                              </RouterLink>
                              <p className="text-[17px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text-muted)]">
                                {cap.summary}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cap.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-[var(--v2-border-strong)] px-3.5 py-1.5 text-[12px] text-[var(--v2-text-muted)]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------------
            7. HOW I WORK / PROCESS (Exact Nakula Sticky Horizontal Pan Track!)
            ------------------------------------------------------------------ */}
        <NakulaProcessSection
          steps={processTrackSteps}
          isEn={isEn}
          isDesktop={isDesktopViewport}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
        />

        {/* ------------------------------------------------------------------
            7B. GITHUB ACTIVITY (Live Open-Source Telemetry + Seasonal Heatmap)
            ------------------------------------------------------------------ */}
        <Suspense
          fallback={
            <section
              id="v2-github"
              className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
            >
              <div className="v2-container">
                <div className="h-[320px] rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] motion-safe:animate-pulse" />
              </div>
            </section>
          }
        >
          <GithubActivityV2 isEn={isEn} />
        </Suspense>

        {/* ------------------------------------------------------------------
            8. FAQ SECTION (Exact Nakula 2-Col + `12px` Rounded `#333` Dark Cards)
            ------------------------------------------------------------------ */}
        <section
          id="v2-faq"
          className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
        >
          <div className="v2-container">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-20">
              <div className="lg:w-[220px] shrink-0 space-y-4">
                <MaskedDisplayHeading
                  lines={['FAQ']}
                  className="v2-section-heading"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
                <div className="text-[16px] leading-[1.35] tracking-[-0.02em]">
                  <p className="text-[var(--v2-text)]">
                    {isEn ? 'Got specific questions?' : 'Punya pertanyaan spesifik?'}
                  </p>
                  <a
                    href={`mailto:${directEmail}`}
                    className="font-medium text-[var(--v2-accent)] hover:underline"
                  >
                    {isEn ? 'Contact Me' : 'Hubungi Saya'}
                  </a>
                </div>
              </div>

              <div className="w-full lg:max-w-[800px] space-y-3">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={item.q}
                      className="rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] p-6 sm:p-8"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded"
                      >
                        <span className="text-[22px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-[1.06] text-[var(--v2-text)]">
                          {item.q}
                        </span>
                        <span className="text-[var(--v2-accent)] shrink-0" aria-hidden="true">
                          {isOpen ? <FiMinus size={24} /> : <FiPlus size={24} />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`faq-body-${idx}`}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: NAKULA_EASE }}
                            className="overflow-hidden"
                          >
                            <p className="pt-5 text-[16px] leading-[1.45] tracking-[-0.02em] text-[var(--v2-text-dim)]">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            9. LATEST INSIGHTS / CASE STUDIES (Masked Char Rise + 3-Card Asymmetric Grid)
            ------------------------------------------------------------------ */}
        <section
          id="v2-insights"
          className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
        >
          <div className="v2-container space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="inline-flex items-start">
                <MaskedDisplayHeading
                  lines={isEn ? ['LATEST INSIGHTS'] : ['STUDI KASUS']}
                  className="v2-section-heading"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
                <span className="hidden sm:inline-block ml-3 mt-1 v2-section-tag">
                  ({isEn ? 'CASE STUDIES' : 'ARSITEKTUR'})
                </span>
              </div>

              <RouterLink
                to="/study-case"
                className="v2-pill-btn !min-w-[180px] !py-3.5 justify-between !text-[var(--v2-accent)] hover:!border-[var(--v2-accent)]"
              >
                <RolloverLabel text={isEn ? 'SEE ALL' : 'LIHAT SEMUA'} />
                <FiArrowUpRight size={16} />
              </RouterLink>
            </div>

            {featuredCaseStudies.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Left Featured Card (50%) */}
                <RouterLink
                  to={`/study-case/${featuredCaseStudies[0].id}`}
                  className="group relative lg:col-span-6 min-h-[420px] lg:min-h-[540px] overflow-hidden rounded-[12px] border border-[var(--v2-border)] bg-[#121212] flex flex-col justify-between p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <img
                    src={featuredCaseStudies[0].image}
                    alt={featuredCaseStudies[0].title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/45 to-[#0a0a0a]/20"
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <span className="inline-block rounded-full bg-[#e6e6e6]/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--v2-bg)]">
                      {isEn
                        ? featuredCaseStudies[0].category.en
                        : featuredCaseStudies[0].category.id}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[#a4a4a4]">
                      CASE STUDY · {featuredCaseStudies[0].number}
                    </p>
                    <h3 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.045em] leading-[1.08] text-white group-hover:text-[var(--v2-accent)] transition-colors">
                      {featuredCaseStudies[0].title} —{' '}
                      {isEn
                        ? featuredCaseStudies[0].subtitle.en
                        : featuredCaseStudies[0].subtitle.id}
                    </h3>
                  </div>
                </RouterLink>

                {/* Right 2 Secondary Cards (50%) */}
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuredCaseStudies.slice(1).map((study) => (
                    <RouterLink
                      key={study.id}
                      to={`/study-case/${study.id}`}
                      className="group rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] p-3 flex flex-col justify-between gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                    >
                      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[8px] bg-[var(--v2-surface-elevated)]">
                        <img
                          src={study.image}
                          alt={study.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <span className="absolute top-3 left-3 inline-block rounded-full bg-[#e6e6e6]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.02em] text-[var(--v2-bg)]">
                          {isEn ? study.category.en : study.category.id}
                        </span>
                      </div>

                      <div className="px-2 pb-3 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]">
                          CASE STUDY · {study.number}
                        </p>
                        <div className="space-y-2">
                          <h3 className="text-[22px] font-semibold tracking-[-0.04em] leading-[1.12] text-[var(--v2-text)] group-hover:text-[var(--v2-accent)] transition-colors">
                            {study.title} — {isEn ? study.subtitle.en : study.subtitle.id}
                          </h3>
                          <p className="text-[14px] leading-[1.4] text-[var(--v2-text-dim)] line-clamp-2">
                            {isEn ? study.details?.architecture?.en : study.details?.architecture?.id}
                          </p>
                        </div>
                      </div>
                    </RouterLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------
            10. PRE-FOOTER CONTACT CTA + SEND A MESSAGE FORM (Parallax Spotlight + Masked Heading)
            ------------------------------------------------------------------ */}
        <section
          id="v2-contact"
          ref={ctaSectionRef}
          className="relative z-[2] overflow-hidden bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
        >
          {/* Downward Parallax Spotlight Layer (`translateY 0 -> 72px`, exact Nakula `.framer-1t4kn25`) */}
          <motion.div
            aria-hidden="true"
            style={shouldReduceMotion ? undefined : { y: ctaSpotlightY }}
            className="v2-cta-spotlight pointer-events-none absolute -inset-y-20 inset-x-0 will-change-transform"
          />

          <div className="v2-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* Left Editorial Intro & Direct Channels */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <p className="v2-section-tag">({isEn ? 'CONTACT' : 'KONTAK'})</p>
                <MaskedDisplayHeading
                  lines={isEn ? ["LET'S WORK", 'TOGETHER'] : ['MARI BEKERJA', 'BERSAMA']}
                  className="v2-section-heading"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
              </div>

              <p className="text-[19px] sm:text-[22px] font-medium tracking-[-0.035em] leading-[1.25] text-[var(--v2-text-muted)] max-w-md">
                {isEn
                  ? 'Have a frontend role, web application, or collaborative project in mind? Send a message directly or reach out via email.'
                  : 'Punya peluang frontend, aplikasi web, atau proyek kolaborasi? Kirim pesan langsung atau hubungi lewat email.'}
              </p>

              {/* Quick Direct Email & Copy Pills */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${directEmail}`}
                  className="v2-pill-btn !h-[52px] !px-6 !text-[13px]"
                >
                  <RolloverLabel text={isEn ? 'OPEN MAIL APP' : 'BUKA EMAIL'} />
                  <FiArrowUpRight size={15} className="text-[var(--v2-accent)]" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={isEn ? 'Copy email address' : 'Salin alamat email'}
                  className="v2-pill-btn !h-[52px] !px-5 !text-[13px]"
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

              {/* Availability & Location Hairline Metadata */}
              <div className="pt-6 border-t border-[var(--v2-border)] space-y-2.5 font-mono text-[12px] text-[var(--v2-text-muted)]">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2 w-2 rounded-full bg-[#47c554] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="uppercase tracking-[0.04em] text-[var(--v2-text)]">
                    {isEn ? 'Available for roles & freelance' : 'Tersedia untuk kerja & freelance'}
                  </span>
                </div>
                <p className="text-[var(--v2-text-dim)]">
                  {directEmail} · Bogor / Jakarta, ID
                </p>
              </div>
            </div>

            {/* Right Column: Editorial Send a Message Form */}
            <div className="lg:col-span-7">
              <Suspense
                fallback={
                  <div className="h-[480px] rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg-elevated)] motion-safe:animate-pulse" />
                }
              >
                <ContactFormV2 isEn={isEn} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ====================================================================
            11. FOOTER (`z-3` Dark Upper Footer + `z-0` Curtain-Sliding `#3B82F6` Bottom Banner)
            ==================================================================== */}
        <footer ref={footerRef} className="relative bg-[var(--v2-bg)]">
          {/* Upper Dark Footer (`z-index: 3`, exact Nakula `.framer-11myxzf`) */}
          <div className="relative z-[3] bg-[var(--v2-bg)] border-t border-[var(--v2-border)]">
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
                        <button
                          type="button"
                          onClick={() => scrollToSection('v2-top')}
                          className="hover:text-[var(--v2-accent)] transition-colors"
                        >
                          Home
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('v2-about')}
                          className="hover:text-[var(--v2-accent)] transition-colors"
                        >
                          About
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('v2-work')}
                          className="hover:text-[var(--v2-accent)] transition-colors"
                        >
                          Works
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('v2-contact')}
                          className="hover:text-[var(--v2-accent)] transition-colors"
                        >
                          Contact
                        </button>
                      </li>
                      <li>
                        <RouterLink to="/study-case" className="hover:text-[var(--v2-accent)] transition-colors">
                          Case Studies
                        </RouterLink>
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
                      <RolloverLabel text={isEn ? 'DOWNLOAD CV' : 'UNDUH CV'} />
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

          {/* Bottom Accent Banner (`z-index: 0`, slides out `-340px -> 0px` from behind `z-3` Footer!) */}
          <div className="relative z-[0] overflow-hidden bg-[var(--v2-accent)]">
            <motion.div
              style={isTabletUp && !shouldReduceMotion ? { y: accentBannerY } : undefined}
              className="bg-[var(--v2-accent)] text-[var(--v2-accent-ink)] pt-24 pb-10 sm:pt-[100px] sm:pb-12 will-change-transform"
            >
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
            </motion.div>
          </div>
        </footer>
      </main>

      <Suspense fallback={null}>
        <DeveloperTerminal />
      </Suspense>
    </div>
  );
}
