import { useCallback, useEffect, useRef, useState } from 'react';
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
import { FiArrowUpRight, FiCheck, FiCopy, FiMinus, FiPlus, FiX } from 'react-icons/fi';

import { siteConfig } from '../config/site';
import { profileData } from '../data/profile';
import { selectedProjects, otherProjects, allProjects } from '../data/projects';
import { experiences } from '../data/experience';
import { educationMetadata } from '../data/education';
import { techCategoriesData } from '../data/skills';
import { directEmail, contactChannelsData } from '../data/contact';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink, useRouter } from '../context/RouterContext';
import './v2.css';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1];

/* ==========================================================================
   Helper Components
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

function EditorialReveal({ children, className = '', delay = 0, shouldReduceMotion = false }) {
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.56, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

EditorialReveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  shouldReduceMotion: PropTypes.bool,
};

function ScrollWord({ word, progress, range }) {
  const color = useTransform(progress, range, ['#323232', '#f5f5f5']);

  return (
    <motion.span style={{ color }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

ScrollWord.propTypes = {
  word: PropTypes.string.isRequired,
  progress: PropTypes.object.isRequired,
  range: PropTypes.arrayOf(PropTypes.number).isRequired,
};

/**
 * Sticky Full-Viewport Scroll-Scrubbed Editorial Statement.
 * Bounded `245vh` track with `-100vh` bottom overlap margin on desktop/tablet so:
 * 1) `(ABOUT)` enters naturally after Hero and locks at `top: 0`.
 * 2) Words reveal deliberately from `#323232` to `#f5f5f5`, paired with a hairline progress rail.
 * 3) Completed text dwells clearly before `SELECTED WORK` rises progressively over the final `100vh`.
 */
function StickyAboutSection({ text, shouldReduceMotion = false, zIndex = 20 }) {
  const trackRef = useRef(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 70%', 'end end'],
  });

  const progressScaleY = useTransform(scrollYProgress, [0, 0.82], [0, 1]);
  const words = text.split(' ');
  const useOverlapLayer = !shouldReduceMotion && !isMobileViewport;

  return (
    <div
      id="v2-about"
      ref={trackRef}
      style={{
        zIndex,
        height: useOverlapLayer ? '245vh' : '175vh',
        marginBottom: useOverlapLayer ? '-100vh' : undefined,
      }}
      className="relative w-full border-t border-[#161618]"
    >
      <section
        style={{ position: 'sticky', top: 0 }}
        className="v2-stack-layer flex h-screen w-full items-center bg-[#0a0a0a]"
      >
        <div className="v2-container w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-2 lg:col-start-2 flex lg:flex-col items-center lg:items-start gap-4 lg:pt-3">
              <span className="v2-section-tag text-[#d4d4d4]">(ABOUT)</span>
              <div
                className="relative h-px w-16 lg:h-16 lg:w-px bg-[#222226] overflow-hidden"
                aria-hidden="true"
              >
                <motion.div
                  style={{
                    scaleY: progressScaleY,
                    transformOrigin: 'top center',
                  }}
                  className="hidden lg:block h-full w-full bg-[#ff4925]"
                />
                <motion.div
                  style={{
                    scaleX: progressScaleY,
                    transformOrigin: 'left center',
                  }}
                  className="lg:hidden h-full w-full bg-[#ff4925]"
                />
              </div>
            </div>

            <div className="lg:col-span-8">
              <p className="max-w-[22ch] text-[clamp(2rem,4.1vw,3.75rem)] font-semibold tracking-[-0.045em] leading-[1.08] text-[#323232]">
                {words.map((word, index) => {
                  const total = words.length;
                  const start = (index / total) * 0.72;
                  const end = Math.min(0.82, start + 1.15 / total);
                  return (
                    <ScrollWord
                      key={`${word}-${index}`}
                      word={word}
                      progress={scrollYProgress}
                      range={[start, end]}
                    />
                  );
                })}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

StickyAboutSection.propTypes = {
  text: PropTypes.string.isRequired,
  shouldReduceMotion: PropTypes.bool,
  zIndex: PropTypes.number,
};

/**
 * Controlled Sticky Overlap Curtain (used intentionally for closing CTA -> Footer reveal).
 * Bounded outer track ensures the section never remains permanently fixed once covered.
 */
function OverlappingSection({
  id,
  zIndex,
  dwellRatio = 0.22,
  className = '',
  shouldReduceMotion = false,
  children,
}) {
  const sectionRef = useRef(null);
  const [layoutMetrics, setLayoutMetrics] = useState({
    stickyTop: 0,
    wrapperHeight: null,
    overlapMargin: 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;
    const el = sectionRef.current;
    if (!el) return undefined;

    const updateStickyOffset = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 768) {
        setLayoutMetrics({
          stickyTop: 0,
          wrapperHeight: null,
          overlapMargin: 0,
          isMobile: true,
        });
        return;
      }
      const height = Math.max(vh, el.offsetHeight);
      const nextTop = height > vh ? vh - height : 0;
      const dwellPx = Math.round(vh * dwellRatio);
      const overlapPx = vh;
      setLayoutMetrics({
        stickyTop: nextTop,
        wrapperHeight: height + dwellPx + overlapPx,
        overlapMargin: -overlapPx,
        isMobile: false,
      });
    };

    updateStickyOffset();

    let resizeObserver;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateStickyOffset);
      resizeObserver.observe(el);
    }
    window.addEventListener('resize', updateStickyOffset, { passive: true });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateStickyOffset);
    };
  }, [dwellRatio, shouldReduceMotion]);

  const useStickyLayer = !shouldReduceMotion && !layoutMetrics.isMobile;

  return (
    <div
      id={id}
      style={{
        zIndex,
        height:
          useStickyLayer && layoutMetrics.wrapperHeight
            ? `${layoutMetrics.wrapperHeight}px`
            : undefined,
        marginBottom:
          useStickyLayer && layoutMetrics.overlapMargin
            ? `${layoutMetrics.overlapMargin}px`
            : undefined,
      }}
      className="relative w-full"
    >
      <section
        ref={sectionRef}
        style={{
          position: useStickyLayer ? 'sticky' : 'relative',
          top: useStickyLayer ? `${layoutMetrics.stickyTop}px` : undefined,
        }}
        className={`v2-stack-layer min-h-screen flex flex-col justify-center ${
          useStickyLayer ? 'v2-stack-layer--sticky-bottom' : ''
        } ${className}`}
      >
        {children}
      </section>
    </div>
  );
}

OverlappingSection.propTypes = {
  id: PropTypes.string,
  zIndex: PropTypes.number.isRequired,
  dwellRatio: PropTypes.number,
  className: PropTypes.string,
  shouldReduceMotion: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

/**
 * Curated Editorial Project Showcase Card with Spring-Driven Cursor Orb (Zero React re-renders on hover move)
 */
function WorkShowcaseCard({
  project,
  index,
  totalCount,
  onVisible,
  isEn,
  shouldReduceMotion,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(mouseX, { stiffness: 320, damping: 28, mass: 0.45 });
  const orbY = useSpring(mouseY, { stiffness: 320, damping: 28, mass: 0.45 });

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
      { rootMargin: '-28% 0px -36% 0px', threshold: 0.15 }
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
  const categoryText = isEn ? project.category.en : project.category.id;
  const descriptionText = isEn ? project.description.en : project.description.id;

  return (
    <article
      id={`v2-work-item-${project.id}`}
      ref={cardRef}
      style={{ zIndex: index + 1 }}
      className={`${
        shouldReduceMotion ? 'relative' : 'v2-work-sticky-card'
      } group bg-[#0a0a0a] border-t border-[#1b1b1d] pt-5 pb-10 sm:pb-14 ${
        index > 0 ? 'lg:shadow-[0_-28px_60px_rgba(0,0,0,0.94)]' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Prominent Editorial Header Strip */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-semibold text-[#ff4925]">
              {project.number}
            </span>
            <h3 className="text-2xl sm:text-[1.75rem] font-semibold tracking-[-0.04em] text-[#f5f5f5]">
              <RouterLink
                to={`/study-case/${project.id}`}
                className="hover:text-[#ff4925] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
              >
                {project.title}
              </RouterLink>
            </h3>
            {project.version && (
              <span className="font-mono text-[11px] text-[#8a8a8e]">{project.version}</span>
            )}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#8a8a8e]">
            {categoryText}
          </span>
        </div>

        {/* Architectural Visual Stage */}
        <RouterLink
          to={`/study-case/${project.id}`}
          aria-label={`${project.title} — ${subtitleText}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-[10px]"
        >
          <div
            className="v2-work-mockup-stage"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Spring-Driven Cursor-Following "VIEW" Badge (Desktop pointer devices) */}
            {!shouldReduceMotion && (
              <motion.div
                className="v2-view-project-orb hidden lg:flex"
                style={{ x: orbX, y: orbY }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.72,
                }}
                transition={{ duration: 0.2, ease: EDITORIAL_EASE }}
                aria-hidden="true"
              >
                {isEn ? 'VIEW' : 'LIHAT'}
              </motion.div>
            )}

            <div className="v2-work-device-frame">
              <img
                src={project.image}
                alt={project.title}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="v2-work-device-img"
              />
            </div>
          </div>
        </RouterLink>

        {/* Mobile & Tablet Subtitle/Description (Desktop shows full editorial narrative in sticky left rail) */}
        <div className="lg:hidden space-y-1.5 pt-1">
          <p className="text-sm font-medium text-[#d4d4d4]">
            {subtitleText}
            <span className="ml-2 font-mono text-[11px] text-[#66666b]">
              ({project.number}/{String(totalCount).padStart(2, '0')})
            </span>
          </p>
          <p className="text-sm text-[#8a8a8e] leading-relaxed">{descriptionText}</p>
        </div>

        {/* Clean Metadata Footer: Restrained Stack List + Direct Action Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="font-mono text-[11px] tracking-[0.02em] text-[#7a7a80]">
            {project.tags.slice(0, 4).join('  ·  ')}
          </p>

          <div className="flex flex-wrap items-center gap-5 text-[11px] font-mono font-semibold uppercase tracking-[0.06em]">
            <RouterLink
              to={`/study-case/${project.id}`}
              className="inline-flex items-center gap-1 text-[#d4d4d4] hover:text-[#ff4925] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
            >
              <span>{isEn ? 'Case Study' : 'Studi Kasus'}</span>
              <FiArrowUpRight size={13} className="text-[#ff4925]" />
            </RouterLink>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#a4a4aa] hover:text-[#f5f5f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
              >
                <span>{isEn ? 'Live' : 'Demo'}</span>
                <FiArrowUpRight size={13} className="text-[#ff4925]" />
              </a>
            )}
            {project.npm && (
              <a
                href={project.npm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#a4a4aa] hover:text-[#f5f5f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
              >
                <span>npm</span>
                <FiArrowUpRight size={13} className="text-[#ff4925]" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#7a7a80] hover:text-[#f5f5f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
              >
                <span>GitHub</span>
                <FiArrowUpRight size={13} className="text-[#ff4925]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

WorkShowcaseCard.propTypes = {
  project: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onVisible: PropTypes.func.isRequired,
  isEn: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};

/* ==========================================================================
   Main Portfolio V2 Component
   ========================================================================== */

export default function PortfolioV2() {
  const shouldReduceMotion = useReducedMotion();
  const { language } = useLanguage();
  const { switchLanguage } = useRouter();
  const isEn = language === 'en';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !shouldReduceMotion);
  const [heroIntroComplete, setHeroIntroComplete] = useState(() => Boolean(shouldReduceMotion));
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('v2-top');
  const [activeWorkIdx, setActiveWorkIdx] = useState(0);
  const [openCapabilityIdx, setOpenCapabilityIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [showAllWorks, setShowAllWorks] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [jakartaTime, setJakartaTime] = useState('');

  const lenisRef = useRef(null);
  const heroRef = useRef(null);

  // Subtle GPU parallax on the Hero diagonal portrait only (Hero itself scrolls 100% naturally)
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroPortraitY = useTransform(heroScrollProgress, [0, 1], [0, -44]);

  // Prompt editorial splash preloader (finishes cleanly so interaction is never sluggish)
  useEffect(() => {
    if (shouldReduceMotion) {
      setShowSplash(false);
      setHeroIntroComplete(true);
      return undefined;
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 760);

    const readyTimer = setTimeout(() => {
      setHeroIntroComplete(true);
    }, 840);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(readyTimer);
    };
  }, [shouldReduceMotion]);

  // Enable viewport-level position:sticky inside Portfolio V2 (scoped so Portfolio V1 is untouched)
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    htmlEl.classList.add('v2-scroll-root');
    return () => {
      htmlEl.classList.remove('v2-scroll-root');
    };
  }, []);

  // Scoped single Lenis smooth scroll instance exclusively inside Portfolio V2
  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.88,
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

  // Show minimal floating menu trigger only after scrolling past Hero (zero Hero elements pinned)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onScroll = () => {
      const threshold = window.innerHeight * 0.82;
      setShowFloatingMenu(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track active section for drawer indicator
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const sectionIds = ['v2-top', 'v2-about', 'v2-work', 'v2-experience', 'v2-contact'];
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

  // Live GMT+7 clock in Hero top bar
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
        setJakartaTime('6:50 PM');
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
      const el = document.getElementById(sectionId);
      if (!el) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: 0 });
      } else {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    },
    [shouldReduceMotion]
  );

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(directEmail);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      }
    } catch {
      // Fallback gracefully if clipboard API is restricted
    }
  }, []);

  const activeWork = selectedProjects[activeWorkIdx] || selectedProjects[0];
  const internship = experiences[0];

  // Authentic Capabilities mapped from repository data
  const capabilities = [
    {
      number: '01',
      title: isEn ? 'Frontend Engineering & Architecture' : 'Rekayasa & Arsitektur Frontend',
      summary: isEn
        ? 'Fast, accessible (WCAG 2.1 AA), and modular web interfaces built with React, Next.js 15, TypeScript, and Tailwind CSS.'
        : 'Antarmuka web cepat, aksesibel (WCAG 2.1 AA), dan modular dengan React, Next.js 15, TypeScript, serta Tailwind CSS.',
      stack: ['React 18', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'WCAG 2.1 AA'],
      image: '/images/projects/akseskita.webp',
      featuredProject: 'AksesKita',
      featuredSlug: 'akseskita',
    },
    {
      number: '02',
      title: isEn ? 'Full-Stack Systems & REST APIs' : 'Sistem Full-Stack & REST API',
      summary: isEn
        ? 'End-to-end web platforms pairing reactive frontends with Node.js, Express, Laravel, RBAC authentication, and Zod validation.'
        : 'Aplikasi web end-to-end memadukan frontend reaktif dengan Node.js, Express, Laravel, autentikasi RBAC, dan validasi Zod.',
      stack: ['Node.js', 'Express.js', 'Laravel', 'REST API', 'Zod Validation'],
      image: '/images/projects/project_management.webp',
      featuredProject: 'Project Management System',
      featuredSlug: 'project-management',
    },
    {
      number: '03',
      title: isEn ? 'Database Modeling & Open-Source Tooling' : 'Pemodelan Database & Open-Source',
      summary: isEn
        ? 'Relational schemas in PostgreSQL and MySQL with Prisma ORM, plus zero-dependency TypeScript packages published to npm.'
        : 'Perancangan skema relasional PostgreSQL dan MySQL dengan Prisma ORM, serta library TypeScript zero-dependency di npm.',
      stack: ['PostgreSQL', 'Prisma ORM', 'MySQL', 'tsup (ESM/CJS)', 'Vitest CI'],
      image: '/images/projects/id-kit.webp',
      featuredProject: '@ghifari29/id-kit',
      featuredSlug: 'id-kit',
    },
    {
      number: '04',
      title: isEn ? 'AI Pipelines & Interactive Web' : 'Alur Kerja AI & Web Interaktif',
      summary: isEn
        ? 'Gemini AI document workflows backed by asynchronous BullMQ + Redis queues alongside interactive Three.js / WebGL scenes.'
        : 'Pemrosesan dokumen Gemini AI dengan antrean latar belakang BullMQ + Redis serta antarmuka interaktif Three.js / WebGL.',
      stack: ['Gemini API', 'BullMQ + Redis', 'Three.js / WebGL', 'Framer Motion'],
      image: '/images/projects/studyflow.webp',
      featuredProject: 'StudyFlow',
      featuredSlug: 'studyflow',
    },
  ];

  // Authentic Chronological Experience, Open Source & Education Timeline
  const timelineEntries = [
    {
      id: 'exp-ama-salam',
      period: isEn ? internship.period.en : internship.period.id,
      meta: isEn
        ? `${internship.type.en} · ${internship.location.en}`
        : `${internship.type.id} · ${internship.location.id}`,
      role: isEn ? internship.role.en : internship.role.id,
      org: internship.company,
      body: isEn ? internship.description.en : internship.description.id,
      stack: internship.technologies.slice(0, 4).join('  ·  '),
      caseStudySlug: internship.projectRef,
    },
    {
      id: 'oss-id-kit',
      period: '2025 — Present',
      meta: isEn ? 'Open-Source Package · npm' : 'Paket Open-Source · npm',
      role: isEn ? 'Author & Maintainer' : 'Penulis & Maintainer',
      org: '@ghifari29/id-kit',
      body: isEn
        ? 'Engineered a zero-dependency offline TypeScript utility library for Indonesian data formats (9 modules, 10 subpath exports, 509 Vitest unit tests verified across 3 timezones).'
        : 'Merancang library utilitas TypeScript offline zero-dependency untuk data Indonesia (9 modul, 10 subpath exports, 509 unit test Vitest di 3 zona waktu).',
      stack: 'TypeScript  ·  tsup  ·  Vitest  ·  npm',
      caseStudySlug: 'id-kit',
    },
    {
      id: 'edu-gunadarma',
      period: isEn ? 'Ongoing' : 'Sedang Berjalan',
      meta: isEn ? 'Undergraduate · Informatics' : 'Sarjana · S1 Informatika',
      role: isEn ? 'Bachelor of Informatics' : 'S1 Informatika',
      org: educationMetadata.gunadarma.institution,
      body: isEn
        ? 'Studying software engineering, algorithms, data structures, relational database systems, and distributed web architecture.'
        : 'Mendalami rekayasa perangkat lunak, algoritma, struktur data, sistem basis data relasional, dan arsitektur web.',
      stack: isEn
        ? 'Software Engineering  ·  Algorithms  ·  Web Systems'
        : 'Rekayasa Perangkat Lunak  ·  Algoritma  ·  Sistem Web',
    },
    {
      id: 'edu-smkn1',
      period: educationMetadata.smkn1Cibinong.period,
      meta: isEn ? 'Vocational · Software Engineering' : 'SMK · Rekayasa Perangkat Lunak',
      role: isEn ? 'Software Engineering (RPL)' : 'Rekayasa Perangkat Lunak (RPL)',
      org: educationMetadata.smkn1Cibinong.institution,
      body: isEn
        ? 'Vocational software engineering foundation covering full-stack web applications, relational database design, and national educational game competitions.'
        : 'Fondasi kejuruan Rekayasa Perangkat Lunak mencakup pengembangan aplikasi web full-stack, basis data relasional, dan kompetisi game edukasi nasional.',
      stack: 'Full-Stack Web  ·  MySQL  ·  Laravel  ·  React',
    },
  ];

  // Authentic Metrics derived from repository data
  const totalSkillsCount = techCategoriesData.reduce(
    (acc, category) => acc + category.skills.length,
    0
  );

  const metricsData = [
    {
      index: '01',
      numeral: String(allProjects.length).padStart(2, '0'),
      suffix: '+',
      label: isEn ? 'Shipped web & software projects' : 'Proyek web & perangkat lunak selesai',
    },
    {
      index: '02',
      numeral: '509',
      suffix: '',
      label: isEn ? 'Unit tests in @ghifari29/id-kit' : 'Unit test di @ghifari29/id-kit',
    },
    {
      index: '03',
      numeral: '05',
      suffix: isEn ? 'mo' : 'bln',
      label: isEn
        ? 'Frontend internship at PT. AMA Salam'
        : 'Magang frontend di PT. AMA Salam',
    },
    {
      index: '04',
      numeral: String(totalSkillsCount),
      suffix: '+',
      label: isEn ? 'Core languages & engineering tools' : 'Bahasa & perangkat rekayasa inti',
    },
  ];

  // Authentic FAQ items
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
    { id: 'v2-top', label: 'HOME' },
    { id: 'v2-about', label: 'ABOUT' },
    { id: 'v2-work', label: 'WORKS' },
    { id: 'v2-experience', label: isEn ? 'EXPERIENCE' : 'PENGALAMAN' },
    { id: 'v2-contact', label: 'CONTACT' },
  ];

  return (
    <div className="v2-portfolio-root" data-portfolio-version="2">
      {/* ====================================================================
          0. PROMPT EDITORIAL SPLASH PRELOADER (#FF4925 Curtain)
          ==================================================================== */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="v2-nakula-splash"
            data-v2-splash="active"
            initial={{ y: '0%' }}
            exit={{
              y: '-100%',
              transition: {
                duration: 0.62,
                ease: [0.76, 0, 0.24, 1],
              },
            }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-[#ff4925] select-none pointer-events-none will-change-transform"
          >
            <div className="overflow-hidden px-4 py-2">
              <motion.div
                initial={{ y: '110%' }}
                animate={{
                  y: '0%',
                  transition: {
                    duration: 0.48,
                    delay: 0.06,
                    ease: EDITORIAL_EASE,
                  },
                }}
                exit={{
                  y: '-30%',
                  transition: {
                    duration: 0.52,
                    ease: [0.76, 0, 0.24, 1],
                  },
                }}
                className="v2-display-heading !text-[#0a0a0a] text-[clamp(3.25rem,6.5vw,5.75rem)] leading-none tracking-[-0.01em] will-change-transform"
              >
                {siteConfig.brandName}
                <span className="text-[0.34em] align-top ml-1 font-sans font-normal text-[#0a0a0a]">
                  ®
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          Minimal Floating Menu Trigger (Appears ONLY after scrolling past Hero)
          ==================================================================== */}
      <AnimatePresence>
        {showFloatingMenu && !isMenuOpen && (
          <motion.div
            key="v2-floating-nav"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
            className="fixed top-5 right-5 sm:top-6 sm:right-8 z-[110] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => switchLanguage(isEn ? 'id' : 'en')}
              aria-label={isEn ? 'Switch language to Indonesian' : 'Ganti bahasa ke Inggris'}
              className="inline-flex h-10 items-center rounded-full border border-[#2a2a2e] bg-[#0a0a0a]/90 backdrop-blur-md px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#d4d4d4] hover:border-[#ff4925] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
            >
              <span className={!isEn ? 'text-[#ff4925]' : 'text-[#7a7a80]'}>ID</span>
              <span className="mx-1 text-[#3a3a40]">/</span>
              <span className={isEn ? 'text-[#ff4925]' : 'text-[#7a7a80]'}>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label={isEn ? 'Open navigation menu' : 'Buka menu navigasi'}
              aria-expanded={isMenuOpen}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2e] bg-[#0a0a0a]/90 backdrop-blur-md text-[#d4d4d4] hover:border-[#55555c] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
            >
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="block h-[1.5px] w-4 bg-current transition-transform duration-300 group-hover:translate-x-[1.5px]" />
                <span className="block h-[1.5px] w-4 bg-current transition-transform duration-300 group-hover:-translate-x-[1.5px]" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          Slide-Over Editorial Menu Drawer
          ==================================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="v2-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: EDITORIAL_EASE }}
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
              transition={{ duration: 0.46, ease: EDITORIAL_EASE }}
              className="flex h-full w-full max-w-[440px] flex-col justify-between border-l border-[#1f1f22] bg-[#0a0a0a] px-7 py-7 sm:px-10 sm:py-8 will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-5">
                <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a8a8e]">
                  <span className="inline-block h-1.5 w-1.5 bg-[#ff4925]" aria-hidden="true" />
                  <span>MENU</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={isEn ? 'Close navigation menu' : 'Tutup menu navigasi'}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2e] text-[#d4d4d4] hover:border-[#55555c] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                >
                  <FiX
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>

              {/* Center Links */}
              <nav className="my-auto py-4" aria-label="Portfolio V2 Navigation">
                <ul className="divide-y divide-[#18181a]">
                  {drawerLinks.map((item, idx) => {
                    const isCurrent = activeSection === item.id;
                    return (
                      <li key={item.id} className="overflow-hidden">
                        <motion.button
                          type="button"
                          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.06 + idx * 0.045,
                            ease: EDITORIAL_EASE,
                          }}
                          onClick={() => scrollToSection(item.id)}
                          className="v2-drawer-nav-btn group flex w-full items-center py-3.5 sm:py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                        >
                          <span className="v2-drawer-nav-item">
                            <span
                              className={`v2-drawer-nav-label v2-display-heading text-[40px] sm:text-[48px] transition-colors duration-300 ${
                                isCurrent
                                  ? '!text-white'
                                  : '!text-[#a4a4aa] group-hover:!text-white'
                              }`}
                            >
                              {item.label}
                            </span>
                            {isCurrent && (
                              <span
                                className="inline-block h-2 w-2 bg-[#ff4925] self-center"
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

              {/* Bottom Contact & Socials */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24, ease: EDITORIAL_EASE }}
                className="space-y-5 border-t border-[#1b1b1d] pt-5"
              >
                <div>
                  <p className="v2-section-tag mb-1.5 !text-[10px]">(EMAIL)</p>
                  <a
                    href={`mailto:${directEmail}`}
                    className="inline-block text-lg sm:text-xl font-semibold tracking-[-0.03em] text-[#ff4925] hover:opacity-85 transition-opacity"
                  >
                    {directEmail}
                  </a>
                </div>
                <div>
                  <p className="v2-section-tag mb-2.5 !text-[10px]">(SOCIALS)</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm font-medium text-[#d4d4d4]">
                    {contactChannelsData.map((ch) => (
                      <a
                        key={ch.key}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <span>{ch.name}</span>
                        <FiArrowUpRight
                          size={13}
                          className="text-[#66666b] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff4925]"
                        />
                      </a>
                    ))}
                    <RouterLink
                      to="/recruiter"
                      className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span>{isEn ? 'Recruiter' : 'Rekruter'}</span>
                      <FiArrowUpRight
                        size={13}
                        className="text-[#66666b] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff4925]"
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
          Main Content
          ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        {/* ------------------------------------------------------------------
            1. HERO SECTION (Normal document flow — scrolls upward cleanly)
            ------------------------------------------------------------------ */}
        <section
          id="v2-top"
          ref={heroRef}
          className="relative min-h-screen w-full flex flex-col justify-between pt-5 pb-9 sm:pt-7 sm:pb-12 overflow-hidden bg-[#0a0a0a]"
        >
          {/* Center Diagonal Spotlight Portrait Slash with subtle scroll parallax */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={
              heroIntroComplete || shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1.04 }
            }
            transition={{ duration: 0.9, delay: 0.04, ease: EDITORIAL_EASE }}
            style={shouldReduceMotion ? undefined : { y: heroPortraitY }}
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
              <div className="v2-hero-diagonal-glow" />
            </div>
          </motion.div>

          {/* Hero Top Bar: Giant Wordmark + Borderless Status & Navigation Controls */}
          <motion.header
            initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
            animate={
              heroIntroComplete || shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -12 }
            }
            transition={{ duration: 0.62, ease: EDITORIAL_EASE }}
            className="relative z-20 w-full"
          >
            <div className="v2-container flex items-start justify-between gap-4">
              <a
                href="#v2-top"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('v2-top');
                }}
                className="v2-display-heading text-[clamp(3.75rem,11.8vw,10.2rem)] leading-[0.82] tracking-[-0.01em] text-[#dcdcdc] hover:text-white transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
              >
                {siteConfig.brandName}
                <span className="text-[0.34em] align-top ml-1 font-sans font-normal text-[#a4a4aa]">
                  ®
                </span>
              </a>

              <div className="flex items-center gap-6 lg:gap-10 pt-1">
                {/* Availability Metadata */}
                <div className="hidden md:flex flex-col text-left leading-[1.3]">
                  <div className="flex items-center gap-2 text-[12px] font-medium tracking-[-0.01em] text-[#d4d4d4]">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{isEn ? 'Available for work' : 'Tersedia untuk proyek'}</span>
                  </div>
                  <span className="pl-3.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[#7a7a80]">
                    {isEn ? 'OPEN FOR ROLES' : 'TERBUKA UNTUK KERJA'}
                  </span>
                </div>

                {/* Live Jakarta Time */}
                <div className="hidden lg:flex flex-col text-left leading-[1.3]">
                  <span className="font-mono text-[12px] font-medium text-[#d4d4d4]">
                    {jakartaTime}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#7a7a80]">
                    BOGOR / GMT+7
                  </span>
                </div>

                {/* Minimal Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchLanguage(isEn ? 'id' : 'en')}
                    aria-label={isEn ? 'Switch language to Indonesian' : 'Ganti bahasa ke Inggris'}
                    className="inline-flex h-10 items-center rounded-full border border-[#2c2c30] bg-[#0a0a0a]/80 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#d4d4d4] hover:border-[#ff4925] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                  >
                    <span className={!isEn ? 'text-[#ff4925]' : 'text-[#7a7a80]'}>ID</span>
                    <span className="mx-1 text-[#3a3a40]">/</span>
                    <span className={isEn ? 'text-[#ff4925]' : 'text-[#7a7a80]'}>EN</span>
                  </button>

                  <a
                    href="#v2-contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('v2-contact');
                    }}
                    className="v2-pill-btn hidden sm:inline-flex !py-2.5 !px-5 !text-[11px]"
                  >
                    <RolloverLabel text={isEn ? "LET'S TALK" : 'HUBUNGI SAYA'} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label={isEn ? 'Open navigation menu' : 'Buka menu navigasi'}
                    aria-expanded={isMenuOpen}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2c2c30] bg-[#0a0a0a]/80 text-[#d4d4d4] hover:border-[#55555c] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
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

          {/* Middle Row: Right-Aligned Masked Editorial Headline */}
          <div className="v2-container relative z-10 my-auto flex justify-end py-10 sm:py-6">
            <h1 className="text-right text-[clamp(2.4rem,5vw,4.35rem)] font-semibold tracking-[-0.05em] leading-[1.0]">
              {[
                { text: isEn ? 'Beyond' : 'Melampaui', highlight: false, delay: 0.08 },
                { text: isEn ? 'Visuals.' : 'Visual.', highlight: false, delay: 0.15 },
                { text: isEn ? 'Built with' : 'Dibangun dengan', highlight: true, delay: 0.22 },
                { text: isEn ? 'Vision.' : 'Visi Rekayasa.', highlight: true, delay: 0.29 },
              ].map((line) => (
                <span key={line.text} className="block overflow-hidden py-[0.04em]">
                  <motion.span
                    initial={shouldReduceMotion ? false : { y: '108%', opacity: 0 }}
                    animate={
                      heroIntroComplete || shouldReduceMotion
                        ? { y: '0%', opacity: 1 }
                        : { y: '108%', opacity: 0 }
                    }
                    transition={{ duration: 0.64, delay: line.delay, ease: EDITORIAL_EASE }}
                    className={`block will-change-transform ${
                      line.highlight ? 'font-semibold text-[#f0f0f0]' : 'text-[#84848a]'
                    }`}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>

          {/* Bottom Row: Editorial Lead + Verified Track Bar & Accent CTA */}
          <div className="v2-container relative z-10 space-y-8">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 14 }
              }
              transition={{ duration: 0.64, delay: 0.28, ease: EDITORIAL_EASE }}
              className="max-w-md"
            >
              <p className="text-[clamp(1.15rem,1.75vw,1.5rem)] font-medium tracking-[-0.035em] leading-[1.24]">
                <span className="text-[#ededed]">
                  {isEn
                    ? 'I engineer web applications, interfaces, and digital systems '
                    : 'Saya membangun aplikasi web, antarmuka, dan sistem digital '}
                </span>
                <span className="text-[#78787e]">
                  {isEn
                    ? 'with clarity, accessibility, and full-stack care.'
                    : 'dengan kejelasan, aksesibilitas, dan ketelitian full-stack.'}
                </span>
              </p>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.64, delay: 0.36, ease: EDITORIAL_EASE }}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-t border-[#1b1b1d] pt-5"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#6a6a70]">
                  {isEn ? 'VERIFIED TRACK' : 'REKAM JEJAK'}
                </span>
                {[
                  'PT. AMA Salam',
                  'Universitas Gunadarma',
                  'SMKN 1 Cibinong',
                  '@ghifari29/id-kit',
                ].map((item) => (
                  <span
                    key={item}
                    className="text-xs sm:text-[13px] font-medium tracking-[-0.02em] text-[#96969c]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="w-full lg:w-auto flex justify-end">
                <a
                  href="#v2-work"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('v2-work');
                  }}
                  className="v2-pill-btn v2-pill-btn--accent w-full sm:w-auto min-w-[230px] justify-between !px-7 !py-3.5"
                >
                  <RolloverLabel text={isEn ? 'SELECTED WORK' : 'LIHAT PROYEK'} />
                  <FiArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            2. STICKY (ABOUT) — Deliberate Word-by-Word Scroll Reveal
            ------------------------------------------------------------------ */}
        <StickyAboutSection
          text={aboutStatement}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          zIndex={20}
        />

        {/* ------------------------------------------------------------------
            3. SELECTED WORK — Curated Sticky Showcase (Rises over About cleanly)
            ------------------------------------------------------------------ */}
        <section
          id="v2-work"
          className="relative z-30 v2-stack-layer v2-stack-layer--overlap bg-[#0a0a0a] pt-20 pb-24 sm:pt-28 sm:pb-32"
        >
          <div className="v2-container">
            {/* Editorial Asymmetrical Section Intro */}
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-16 sm:mb-24"
            >
              <div className="lg:col-span-8">
                <p className="v2-section-tag mb-4">
                  ({isEn ? 'CURATED PORTFOLIO' : 'PORTOFOLIO PILIHAN'})
                </p>
                <div className="inline-flex items-start">
                  <h2 className="v2-display-heading text-[clamp(3.75rem,10.5vw,8.25rem)]">
                    {isEn ? 'SELECTED WORK' : 'KARYA PILIHAN'}
                  </h2>
                  <span className="ml-2.5 mt-1 font-mono text-sm sm:text-lg font-medium text-[#ff4925]">
                    ({String(selectedProjects.length).padStart(2, '0')})
                  </span>
                </div>
              </div>
              <div className="lg:col-span-4 lg:pb-3">
                <p className="text-sm sm:text-base text-[#8a8a8e] leading-relaxed max-w-sm lg:ml-auto">
                  {isEn
                    ? 'Production applications, internal platforms, and open-source TypeScript tooling engineered from architecture to interface.'
                    : 'Aplikasi produksi, platform internal, dan library TypeScript open-source yang dirancang dari arsitektur hingga antarmuka.'}
                </p>
              </div>
            </EditorialReveal>

            {/* Showcase Split: Sticky Left Editorial Index & Right Stacked Project Stages */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Sticky Rail (Desktop) */}
              <div className="hidden lg:flex lg:col-span-4 sticky top-24 flex-col justify-between h-[calc(100vh-7.5rem)] pr-6 pb-4">
                <div className="space-y-7">
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeWork.number}
                        initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { y: -20, opacity: 0 }}
                        transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                        aria-live="polite"
                        className="v2-display-heading text-[clamp(4.75rem,7vw,6.75rem)] leading-none !text-[#26262a] select-none"
                      >
                        {activeWork.number}.
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <nav aria-label={isEn ? 'Selected projects index' : 'Indeks proyek pilihan'}>
                    <ul className="space-y-2 text-[13px] font-medium">
                      {selectedProjects.map((proj, idx) => {
                        const isCurrent = idx === activeWorkIdx;
                        return (
                          <li key={proj.id}>
                            <button
                              type="button"
                              onClick={() => scrollToSection(`v2-work-item-${proj.id}`)}
                              className={`inline-flex items-center gap-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm ${
                                isCurrent
                                  ? 'text-white font-semibold'
                                  : 'text-[#66666b] hover:text-[#d4d4d4]'
                              }`}
                            >
                              <span
                                className={`inline-block h-[1.5px] transition-all duration-200 ${
                                  isCurrent ? 'w-4 bg-[#ff4925]' : 'w-0 bg-transparent'
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

                {/* Active Project Editorial Summary */}
                <div className="border-t border-[#1b1b1d] pt-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWork.id}
                      initial={shouldReduceMotion ? false : { y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { y: -10, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                      className="space-y-2"
                    >
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff4925]">
                        {isEn ? activeWork.category.en : activeWork.category.id}
                      </p>
                      <h3 className="text-2xl xl:text-3xl font-semibold tracking-[-0.045em] text-[#f0f0f0]">
                        {activeWork.title}
                      </h3>
                      <p className="text-sm font-medium text-[#c4c4ca] leading-snug max-w-xs">
                        {isEn ? activeWork.subtitle.en : activeWork.subtitle.id}
                      </p>
                      <p className="text-[13px] text-[#84848a] leading-relaxed max-w-xs line-clamp-3">
                        {isEn ? activeWork.description.en : activeWork.description.id}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Stacked Editorial Project Cards */}
              <div className="lg:col-span-8 space-y-14 lg:space-y-[18vh] lg:pb-[10vh]">
                {selectedProjects.map((project, idx) => (
                  <WorkShowcaseCard
                    key={project.id}
                    project={project}
                    index={idx}
                    totalCount={selectedProjects.length}
                    onVisible={setActiveWorkIdx}
                    isEn={isEn}
                    shouldReduceMotion={Boolean(shouldReduceMotion)}
                  />
                ))}
              </div>
            </div>

            {/* Archive Strip — Clean Editorial Directory */}
            <div className="relative z-20 mt-20 sm:mt-24 border-t border-[#1b1b1d] pt-12 sm:pt-14 bg-[#0a0a0a]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                  <p className="v2-section-tag">
                    ({isEn ? 'ARCHIVE' : 'ARSIP'} — 0{otherProjects.length})
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-[#e8e8e8]">
                    {isEn
                      ? 'Additional Web Apps & Educational Games'
                      : 'Aplikasi Web & Game Edukasi Tambahan'}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAllWorks((prev) => !prev)}
                    aria-expanded={showAllWorks}
                    className="v2-pill-btn"
                  >
                    <RolloverLabel
                      text={
                        showAllWorks
                          ? isEn
                            ? 'HIDE ARCHIVE'
                            : 'TUTUP ARSIP'
                          : isEn
                          ? `VIEW ARCHIVE (+${otherProjects.length})`
                          : `BUKA ARSIP (+${otherProjects.length})`
                      }
                    />
                  </button>

                  <RouterLink to="/study-case" className="v2-pill-btn v2-pill-btn--accent">
                    <RolloverLabel text={isEn ? 'ALL CASE STUDIES' : 'SEMUA STUDI KASUS'} />
                    <FiArrowUpRight size={15} />
                  </RouterLink>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {showAllWorks && (
                  <motion.div
                    key="v2-archive-list"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.36, ease: EDITORIAL_EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-10 divide-y divide-[#1b1b1d] border-t border-b border-[#1b1b1d]">
                      {otherProjects.map((proj, index) => (
                        <article
                          key={proj.id}
                          className="v2-editorial-row grid grid-cols-1 md:grid-cols-12 gap-5 items-center py-6"
                        >
                          <div className="md:col-span-2 aspect-[16/10] w-full overflow-hidden rounded-[6px] border border-[#1f1f22] bg-[#121214]">
                            <img
                              src={proj.image}
                              alt={proj.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="md:col-span-6 space-y-1">
                            <div className="flex items-center gap-3 font-mono text-[11px] text-[#7a7a80]">
                              <span className="text-[#ff4925]">
                                {String(selectedProjects.length + index + 1).padStart(2, '0')}
                              </span>
                              <span className="uppercase">
                                {isEn ? proj.category.en : proj.category.id}
                              </span>
                            </div>
                            <h4 className="text-xl font-semibold tracking-[-0.035em] text-[#f0f0f0]">
                              {proj.title}
                            </h4>
                            <p className="text-sm text-[#84848a] line-clamp-2">
                              {isEn ? proj.description.en : proj.description.id}
                            </p>
                          </div>
                          <div className="md:col-span-4 flex flex-wrap md:justify-end gap-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">
                            <RouterLink
                              to={`/study-case/${proj.id}`}
                              className="inline-flex items-center gap-1 text-[#e8e8e8] hover:text-[#ff4925] transition-colors"
                            >
                              <span>{isEn ? 'Case Study' : 'Studi Kasus'}</span>
                              <FiArrowUpRight size={13} className="text-[#ff4925]" />
                            </RouterLink>
                            {proj.live && (
                              <a
                                href={proj.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#9a9aa0] hover:text-white transition-colors"
                              >
                                <span>Live</span>
                                <FiArrowUpRight size={13} className="text-[#ff4925]" />
                              </a>
                            )}
                            {proj.github && (
                              <a
                                href={proj.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#7a7a80] hover:text-white transition-colors"
                              >
                                <span>GitHub</span>
                                <FiArrowUpRight size={13} className="text-[#ff4925]" />
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            4. METRICS — Swiss Editorial Typographic Composition
            ------------------------------------------------------------------ */}
        <section
          id="v2-metrics"
          className="relative z-30 bg-[#0a0a0a] border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container space-y-20">
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end"
            >
              <div className="lg:col-span-8">
                <p className="v2-section-tag mb-4">
                  ({isEn ? 'BY THE NUMBERS' : 'REKAM JEJAK TERUKUR'})
                </p>
                <h2 className="v2-display-heading text-[clamp(3.25rem,8.5vw,6.25rem)]">
                  {isEn ? 'BEYOND THE CODE' : 'DI BALIK BARIS KODE'}
                </h2>
              </div>
              <div className="lg:col-span-4 lg:pb-2">
                <p className="text-sm text-[#8a8a8e] leading-relaxed max-w-xs lg:ml-auto">
                  {isEn
                    ? 'Verifiable figures drawn directly from shipped repositories, test suites, and industry internship delivery.'
                    : 'Angka terverifikasi langsung dari repositori, rangkaian uji otomatis, dan pengalaman magang industri.'}
                </p>
              </div>
            </EditorialReveal>

            {/* 4-Column Architectural Stat Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-r border-[#1b1b1d]">
              {metricsData.map((stat, idx) => (
                <EditorialReveal
                  key={stat.index}
                  delay={idx * 0.06}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                  className="v2-metric-cell"
                >
                  <div className="v2-metric-ticks" aria-hidden="true" />
                  <span className="font-mono text-[11px] text-[#5c5c62]">{stat.index}</span>
                  <div className="my-8 flex items-baseline">
                    <span className="text-[clamp(3.75rem,6vw,5.25rem)] font-semibold tracking-[-0.06em] leading-none text-[#ededed]">
                      {stat.numeral}
                    </span>
                    {stat.suffix && (
                      <span className="ml-0.5 text-[clamp(2rem,3.4vw,3rem)] font-semibold tracking-[-0.04em] leading-none text-[#ff4925]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="max-w-[22ch] text-sm font-medium tracking-[-0.015em] leading-snug text-[#8a8a8e]">
                    {stat.label}
                  </p>
                </EditorialReveal>
              ))}
            </div>

            {/* Asymmetrical Editorial Statement + Straight Architectural Frame */}
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-6"
            >
              <div className="lg:col-span-7 space-y-8">
                <blockquote className="text-[clamp(1.6rem,3vw,2.65rem)] font-semibold tracking-[-0.045em] leading-[1.12]">
                  <span className="text-[#ff4925] mr-2 font-serif text-[1.15em] leading-none">
                    “
                  </span>
                  <span className="text-[#e8e8e8]">
                    {isEn
                      ? 'Every interface is engineered with strict type safety, WCAG 2.1 AA accessibility, '
                      : 'Setiap antarmuka dirancang dengan tipe statis ketat, aksesibilitas WCAG 2.1 AA, '}
                  </span>
                  <span className="text-[#66666c]">
                    {isEn
                      ? 'and clean backend integration so products remain fast and maintainable.'
                      : 'dan integrasi backend bersih agar produk tetap cepat serta mudah dirawat.'}
                  </span>
                </blockquote>

                <div className="flex items-center gap-4 border-t border-[#1b1b1d] pt-6">
                  <img
                    src={profileData.avatarImage}
                    alt={siteConfig.name}
                    loading="lazy"
                    className="h-12 w-12 rounded-[8px] object-cover border border-[#26262a]"
                  />
                  <div>
                    <p className="text-base font-semibold tracking-[-0.02em] text-[#e8e8e8]">
                      {siteConfig.name}
                    </p>
                    <p className="font-mono text-[11px] text-[#7a7a80]">
                      {isEn
                        ? 'Frontend Developer Intern Alumni · PT. AMA Salam Indonesia'
                        : 'Alumni Frontend Developer Intern · PT. AMA Salam Indonesia'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="v2-work-mockup-stage !aspect-[16/11]">
                  <div className="v2-work-device-frame">
                    <img
                      src="/images/projects/project_management.webp"
                      alt="Project Management System"
                      loading="lazy"
                      className="v2-work-device-img"
                    />
                  </div>
                </div>
              </div>
            </EditorialReveal>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            5. CAPABILITIES — Editorial Accordion with Smooth Reveal
            ------------------------------------------------------------------ */}
        <section
          id="v2-capabilities"
          className="relative z-30 bg-[#0a0a0a] border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container">
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-14 sm:mb-20"
            >
              <div className="lg:col-span-8">
                <p className="v2-section-tag mb-4">
                  ({isEn ? 'CAPABILITIES' : 'KEAHLIAN'})
                </p>
                <h2 className="v2-display-heading text-[clamp(3.25rem,8.5vw,6.25rem)]">
                  {isEn ? 'HOW I CAN HELP' : 'KEAHLIAN & LAYANAN'}
                </h2>
              </div>
              <div className="lg:col-span-4 lg:pb-2">
                <p className="text-sm text-[#8a8a8e] leading-relaxed max-w-xs lg:ml-auto">
                  {isEn
                    ? 'Core disciplines spanning interface architecture, full-stack web APIs, and tested open-source packages.'
                    : 'Disiplin utama mencakup arsitektur antarmuka, API web full-stack, serta paket open-source teruji.'}
                </p>
              </div>
            </EditorialReveal>

            <div className="border-t border-b border-[#1b1b1d] divide-y divide-[#1b1b1d]">
              {capabilities.map((cap, idx) => {
                const isOpen = openCapabilityIdx === idx;
                return (
                  <div key={cap.number} className="py-6 sm:py-8">
                    <button
                      type="button"
                      onClick={() => setOpenCapabilityIdx(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm group"
                    >
                      <div className="flex items-baseline gap-5 sm:gap-8">
                        <span className="font-mono text-sm sm:text-base font-semibold text-[#5c5c62]">
                          {cap.number}
                          <span className="text-[#ff4925]">.</span>
                        </span>
                        <h3
                          className={`text-2xl sm:text-4xl font-semibold tracking-[-0.045em] transition-colors ${
                            isOpen
                              ? 'text-[#f2f2f2]'
                              : 'text-[#84848a] group-hover:text-[#e8e8e8]'
                          }`}
                        >
                          {cap.title}
                        </h3>
                      </div>
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#242428] text-[#ff4925] group-hover:border-[#ff4925] transition-colors"
                        aria-hidden="true"
                      >
                        {isOpen ? <FiMinus size={16} /> : <FiPlus size={16} />}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`cap-body-${cap.number}`}
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.34, ease: EDITORIAL_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="pt-7 pb-2 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:pl-14 items-center">
                            <div className="lg:col-span-7 space-y-5">
                              <p className="text-base sm:text-lg text-[#9a9aa0] leading-relaxed max-w-xl">
                                {cap.summary}
                              </p>
                              <p className="font-mono text-xs tracking-[0.03em] text-[#7a7a80]">
                                {cap.stack.join('  ·  ')}
                              </p>
                              <div className="pt-1">
                                <RouterLink
                                  to={`/study-case/${cap.featuredSlug}`}
                                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[#ff4925] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
                                >
                                  <span>
                                    {isEn ? 'Case Study:' : 'Studi Kasus:'} {cap.featuredProject}
                                  </span>
                                  <FiArrowUpRight size={14} />
                                </RouterLink>
                              </div>
                            </div>

                            <div className="lg:col-span-5">
                              <RouterLink
                                to={`/study-case/${cap.featuredSlug}`}
                                className="block overflow-hidden rounded-[8px] border border-[#222226] bg-[#101012] aspect-[16/10] group/img focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                              >
                                <img
                                  src={cap.image}
                                  alt={cap.featuredProject}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-[1.03]"
                                />
                              </RouterLink>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            6. EXPERIENCE & EDUCATION — Editorial Chronological Timeline
            ------------------------------------------------------------------ */}
        <section
          id="v2-experience"
          className="relative z-30 bg-[#0a0a0a] border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container">
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-14 sm:mb-20"
            >
              <div className="lg:col-span-8">
                <p className="v2-section-tag mb-4">
                  ({isEn ? 'TRACK RECORD' : 'PENGALAMAN & PENDIDIKAN'})
                </p>
                <h2 className="v2-display-heading text-[clamp(3.25rem,8.5vw,6.25rem)]">
                  {isEn ? 'EXPERIENCE & EDUCATION' : 'JEJAK & PENDIDIKAN'}
                </h2>
              </div>
              <div className="lg:col-span-4 lg:pb-2">
                <p className="text-sm text-[#8a8a8e] leading-relaxed max-w-xs lg:ml-auto">
                  {isEn
                    ? 'Industry internship, published open-source tooling, and formal computer science education.'
                    : 'Magang industri, library open-source terpublikasi, serta pendidikan formal informatika.'}
                </p>
              </div>
            </EditorialReveal>

            <div className="border-b border-[#1b1b1d]">
              {timelineEntries.map((item, idx) => (
                <EditorialReveal
                  key={item.id}
                  delay={idx * 0.05}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                >
                  <article className="v2-editorial-row grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 py-8 sm:py-10 items-start">
                    {/* Left Column: Period & Context Metadata */}
                    <div className="lg:col-span-3 space-y-1.5">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[#ff4925]">
                        {item.period}
                      </p>
                      <p className="font-mono text-[11px] text-[#7a7a80] leading-snug">
                        {item.meta}
                      </p>
                    </div>

                    {/* Center Column: Role & Institution */}
                    <div className="lg:col-span-4 space-y-1">
                      <h3 className="text-2xl sm:text-[1.75rem] font-semibold tracking-[-0.04em] leading-tight text-[#f0f0f0]">
                        {item.org}
                      </h3>
                      <p className="text-sm font-medium text-[#a4a4aa]">{item.role}</p>
                    </div>

                    {/* Right Column: Factual Description + Stack + Optional Case Study Link */}
                    <div className="lg:col-span-5 space-y-3">
                      <p className="text-sm sm:text-base text-[#8f8f96] leading-relaxed">
                        {item.body}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="font-mono text-[11px] text-[#66666c]">{item.stack}</span>
                        {item.caseStudySlug && (
                          <RouterLink
                            to={`/study-case/${item.caseStudySlug}`}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#d4d4d4] hover:text-[#ff4925] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm"
                          >
                            <span>{isEn ? 'Inspect Work' : 'Lihat Detail'}</span>
                            <FiArrowUpRight size={13} className="text-[#ff4925]" />
                          </RouterLink>
                        )}
                      </div>
                    </div>
                  </article>
                </EditorialReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            7. ARCHITECTURE CASE STUDIES — Asymmetrical Editorial Feature
            ------------------------------------------------------------------ */}
        <section
          id="v2-insights"
          className="relative z-30 bg-[#0a0a0a] border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container">
            <EditorialReveal
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              className="flex flex-wrap items-end justify-between gap-6 mb-14 sm:mb-20"
            >
              <div>
                <p className="v2-section-tag mb-4">(CASE STUDIES)</p>
                <h2 className="v2-display-heading text-[clamp(3.25rem,8.5vw,6.25rem)]">
                  {isEn ? 'LATEST INSIGHTS' : 'STUDI KASUS TEKNIS'}
                </h2>
              </div>
              <RouterLink to="/study-case" className="v2-pill-btn v2-pill-btn--accent">
                <RolloverLabel text={isEn ? 'ALL CASE STUDIES' : 'LIHAT SEMUA'} />
                <FiArrowUpRight size={15} />
              </RouterLink>
            </EditorialReveal>

            {featuredCaseStudies.length > 0 && (
              <div className="space-y-10">
                {/* Lead Feature: Asymmetrical 12-Col Horizontal Split */}
                <EditorialReveal shouldReduceMotion={Boolean(shouldReduceMotion)}>
                  <RouterLink
                    to={`/study-case/${featuredCaseStudies[0].id}`}
                    className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-b border-[#1b1b1d] py-8 sm:py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                  >
                    <div className="lg:col-span-7 overflow-hidden rounded-[8px] border border-[#1f1f22] bg-[#101012] aspect-[16/10]">
                      <img
                        src={featuredCaseStudies[0].image}
                        alt={featuredCaseStudies[0].title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="lg:col-span-5 space-y-4">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#ff4925]">
                        {isEn
                          ? featuredCaseStudies[0].category.en
                          : featuredCaseStudies[0].category.id}
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-semibold tracking-[-0.045em] leading-[1.08] text-[#f2f2f2] group-hover:text-[#ff4925] transition-colors">
                        {featuredCaseStudies[0].title} —{' '}
                        {isEn
                          ? featuredCaseStudies[0].subtitle.en
                          : featuredCaseStudies[0].subtitle.id}
                      </h3>
                      <p className="text-sm sm:text-base text-[#8a8a8e] leading-relaxed line-clamp-4">
                        {isEn
                          ? featuredCaseStudies[0].details?.architecture?.en
                          : featuredCaseStudies[0].details?.architecture?.id}
                      </p>
                      <span className="inline-flex items-center gap-1.5 pt-2 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[#d4d4d4] group-hover:text-[#ff4925] transition-colors">
                        <span>{isEn ? 'Read Architecture Notes' : 'Baca Studi Kasus'}</span>
                        <FiArrowUpRight size={14} className="text-[#ff4925]" />
                      </span>
                    </div>
                  </RouterLink>
                </EditorialReveal>

                {/* Supporting 2-Column Editorial Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {featuredCaseStudies.slice(1).map((study, idx) => (
                    <EditorialReveal
                      key={study.id}
                      delay={idx * 0.08}
                      shouldReduceMotion={Boolean(shouldReduceMotion)}
                    >
                      <RouterLink
                        to={`/study-case/${study.id}`}
                        className="group block space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-[8px]"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden rounded-[8px] border border-[#1f1f22] bg-[#101012]">
                          <img
                            src={study.image}
                            alt={study.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="space-y-2 pt-1">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff4925]">
                            {isEn ? study.category.en : study.category.id}
                          </p>
                          <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-[#f0f0f0] group-hover:text-[#ff4925] transition-colors">
                            {study.title} — {isEn ? study.subtitle.en : study.subtitle.id}
                          </h3>
                          <p className="text-sm text-[#8a8a8e] leading-relaxed line-clamp-2">
                            {isEn ? study.details?.architecture?.en : study.details?.architecture?.id}
                          </p>
                        </div>
                      </RouterLink>
                    </EditorialReveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------
            8. FAQ — Editorial 12-Column Split (Clean Hairline Accordion)
            ------------------------------------------------------------------ */}
        <section
          id="v2-faq"
          className="relative z-30 bg-[#0a0a0a] border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
                <p className="v2-section-tag">(FAQ)</p>
                <h2 className="v2-display-heading text-[clamp(3.5rem,7.5vw,5.75rem)]">
                  {isEn ? 'QUESTIONS' : 'PERTANYAAN'}
                </h2>
                <div className="text-sm text-[#8a8a8e] space-y-1">
                  <p>{isEn ? 'Have something specific in mind?' : 'Punya pertanyaan spesifik?'}</p>
                  <a
                    href={`mailto:${directEmail}`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[#ff4925] hover:underline"
                  >
                    <span>{isEn ? 'Email Directly' : 'Kirim Email'}</span>
                    <FiArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-8 border-t border-b border-[#1b1b1d] divide-y divide-[#1b1b1d]">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={item.q} className="py-6 sm:py-7">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-sm group"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-[#5c5c62]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-lg sm:text-xl font-semibold tracking-[-0.03em] transition-colors ${
                              isOpen
                                ? 'text-[#f2f2f2]'
                                : 'text-[#96969c] group-hover:text-[#e8e8e8]'
                            }`}
                          >
                            {item.q}
                          </span>
                        </div>
                        <span className="text-[#ff4925] shrink-0 pt-1" aria-hidden="true">
                          {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key={`faq-ans-${idx}`}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
                            className="overflow-hidden"
                          >
                            <p className="pt-4 pl-8 text-sm sm:text-base text-[#8a8a8e] leading-relaxed max-w-2xl">
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
            9. CLOSING CTA — Controlled Overlap Curtain into Footer
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-contact"
          zIndex={40}
          dwellRatio={0.2}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="border-t border-[#1b1b1d] py-24 sm:py-32"
        >
          <div className="v2-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7 space-y-5">
              <p className="v2-section-tag">({isEn ? 'NEXT STEP' : 'LANGKAH SELANJUTNYA'})</p>
              <h2 className="v2-display-heading text-[clamp(4.25rem,10.5vw,8.25rem)] leading-[0.88] !text-[#ededed]">
                <span className="block">{isEn ? "LET'S" : 'MARI'}</span>
                <span className="block">{isEn ? 'BUILD' : 'BANGUN'}</span>
                <span className="block !text-[#ff4925]">{isEn ? 'TOGETHER' : 'BERSAMA'}</span>
              </h2>
            </div>

            <div className="lg:col-span-5 space-y-7 lg:pb-2">
              <p className="text-lg sm:text-xl font-medium tracking-[-0.03em] text-[#9a9aa0] leading-[1.38] max-w-md">
                {isEn
                  ? 'Have a frontend role, full-stack web product, or engineering collaboration in mind? Let’s talk directly.'
                  : 'Punya peluang frontend, produk web full-stack, atau kolaborasi rekayasa perangkat lunak? Mari berdiskusi langsung.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${directEmail}`}
                  className="v2-pill-btn v2-pill-btn--accent flex-1 !py-4 !text-xs sm:!text-sm justify-center"
                >
                  <RolloverLabel text={isEn ? 'GET IN TOUCH' : 'HUBUNGI SEKARANG'} />
                  <FiArrowUpRight size={16} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={isEn ? 'Copy email address' : 'Salin alamat email'}
                  className="v2-pill-btn !py-4 !px-5 !text-xs justify-center"
                >
                  {copiedEmail ? (
                    <>
                      <FiCheck size={14} className="text-emerald-400" />
                      <span>{isEn ? 'COPIED' : 'TERSALIN'}</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={14} />
                      <span>{isEn ? 'COPY EMAIL' : 'SALIN EMAIL'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </OverlappingSection>

        {/* ====================================================================
            10. FOOTER + FULL-BLEED #FF4925 BRAND BANNER
            ==================================================================== */}
        <footer
          style={{ zIndex: 50 }}
          className="v2-stack-layer v2-stack-layer--overlap min-h-screen flex flex-col justify-between bg-[#0a0a0a] pt-16 sm:pt-24"
        >
          <div className="v2-container space-y-14 pb-16">
            {/* Top Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#1b1b1d] pb-12">
              <div>
                <p className="v2-section-tag mb-2">(EMAIL)</p>
                <a
                  href={`mailto:${directEmail}`}
                  className="text-2xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#ff4925] hover:underline break-all"
                >
                  {directEmail}
                </a>
              </div>
              <div>
                <p className="v2-section-tag mb-2">(LOCATION)</p>
                <p className="text-2xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#e0e0e0]">
                  Bogor / Jakarta, Indonesia
                </p>
              </div>
            </div>

            {/* Middle 3-Column Navigation & CV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-3">
                <p className="v2-section-tag mb-4">(NAVIGATION)</p>
                <ul className="space-y-2.5 text-base font-medium tracking-[-0.02em] text-[#d4d4d4]">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('v2-top')}
                      className="hover:text-[#ff4925] transition-colors"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('v2-about')}
                      className="hover:text-[#ff4925] transition-colors"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('v2-work')}
                      className="hover:text-[#ff4925] transition-colors"
                    >
                      Works
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('v2-experience')}
                      className="hover:text-[#ff4925] transition-colors"
                    >
                      {isEn ? 'Experience' : 'Pengalaman'}
                    </button>
                  </li>
                  <li>
                    <RouterLink to="/study-case" className="hover:text-[#ff4925] transition-colors">
                      Case Studies
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/recruiter" className="hover:text-[#ff4925] transition-colors">
                      Recruiter Mode
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/play" className="hover:text-[#ff4925] transition-colors">
                      3D World
                    </RouterLink>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-3">
                <p className="v2-section-tag mb-4">(SOCIALS)</p>
                <ul className="space-y-2.5 text-base font-medium tracking-[-0.02em] text-[#d4d4d4]">
                  {contactChannelsData.map((channel) => (
                    <li key={channel.key}>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-[#ff4925] transition-colors"
                      >
                        <span>{channel.name}</span>
                        <FiArrowUpRight size={14} className="text-[#7a7a80]" />
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="https://www.npmjs.com/package/@ghifari29/id-kit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#ff4925] transition-colors"
                    >
                      <span>npm (@ghifari29/id-kit)</span>
                      <FiArrowUpRight size={14} className="text-[#7a7a80]" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <p className="v2-section-tag">(CURRICULUM VITAE)</p>
                <p className="text-sm sm:text-base text-[#8a8a8e] max-w-md leading-relaxed">
                  {isEn
                    ? 'Download my official curriculum vitae or explore verified engineering case studies.'
                    : 'Unduh curriculum vitae resmi atau jelajahi studi kasus arsitektur perangkat lunak.'}
                </p>

                <div className="border-b border-[#242428] pb-3 flex items-center justify-between text-sm sm:text-base text-[#9a9aa0]">
                  <span className="truncate pr-4">{RESUME_FILENAME}</span>
                  <span className="font-mono text-[11px] uppercase text-[#ff4925]">PDF</span>
                </div>

                {RESUME_AVAILABLE && (
                  <a
                    href={RESUME_URL}
                    download={RESUME_FILENAME}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v2-pill-btn w-full !py-3.5"
                  >
                    <RolloverLabel text={isEn ? 'DOWNLOAD CV' : 'UNDUH CV'} />
                  </a>
                )}
              </div>
            </div>

            {/* Legal Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#18181a] pt-6 font-mono text-[11px] text-[#7a7a80]">
              <p className="uppercase tracking-[0.04em]">
                © {new Date().getFullYear()} {siteConfig.brandName}. ALL RIGHTS RESERVED
              </p>
              <p className="uppercase tracking-[0.04em] text-[#a4a4aa]">
                PORTFOLIO V2 · {siteConfig.name}
              </p>
            </div>
          </div>

          {/* Full-Width Vermilion #FF4925 Brand Banner */}
          <div className="bg-[#ff4925] text-[#0a0a0a] py-8 sm:py-12 pb-20 sm:pb-14">
            <div className="v2-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <p className="v2-display-heading !text-[#0a0a0a] text-[clamp(4.25rem,14.5vw,12rem)] leading-[0.82]">
                {siteConfig.brandName}
                <span className="text-[0.32em] align-top ml-1 font-sans font-normal">®</span>
              </p>
              <p className="text-xl sm:text-3xl font-semibold tracking-[-0.045em] leading-[1.06] text-[#0a0a0a] max-w-[230px]">
                {isEn
                  ? 'Beyond Visuals. Built with Vision.'
                  : 'Melampaui Visual. Dibangun dengan Visi.'}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
