import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { FiArrowUpRight, FiPlus, FiMinus, FiX } from 'react-icons/fi';

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

function ScrollWord({ word, progress, range }) {
  const color = useTransform(progress, range, ['#444444', '#cacaca']);

  return (
    <motion.span
      style={{ color }}
      className="inline-block mr-[0.26em]"
    >
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
 * Sticky Full-Viewport Scroll-Scrubbed Statement (Exact Nakula Video 00:00–00:03)
 * Uses a single `sticky top-0 h-screen` layer (`z-index: 20`) followed by a `175vh`
 * scroll-runway spacer so that:
 * 1) As `(ABOUT)` slides up from the bottom, it covers Hero (`z-10`, which stays pinned at `top: 0`).
 * 2) Once `(ABOUT)` reaches `top: 0`, it stays 100% locked in place while the user scrolls
 *    through the `175vh` runway, lighting up every word from `#444444` to `#cacaca`.
 * 3) While `LATEST WORK` (`z-30`) slides up from the bottom, `(ABOUT)` remains locked at `top: 0`
 *    and is covered from below — never pushed upward!
 */
function StickyAboutSection({ text, shouldReduceMotion, zIndex = 20 }) {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end bottom'],
  });

  const words = text.split(' ');

  return (
    <>
      <section
        id="v2-about"
        style={{ zIndex }}
        className={`v2-stack-layer v2-stack-layer--overlap ${
          shouldReduceMotion ? 'relative' : 'sticky top-0'
        } flex h-screen w-full items-center bg-[#0a0a0a]`}
      >
        <div className="v2-container w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-baseline">
            <div className="lg:col-span-2 lg:col-start-2">
              <span className="v2-section-tag tracking-[-0.03em] text-[#cacaca]">
                (ABOUT)
              </span>
            </div>
            <div className="lg:col-span-8">
              <p className="text-[clamp(1.95rem,3.8vw,3.45rem)] font-semibold tracking-[-0.055em] leading-[1.06] text-[#cacaca]">
                {words.map((word, index) => {
                  if (shouldReduceMotion) {
                    return (
                      <span key={`${word}-${index}`} className="inline-block mr-[0.26em]">
                        {word}
                      </span>
                    );
                  }
                  const total = words.length;
                  const start = 0.04 + (index / total) * 0.78;
                  const end = Math.min(0.94, start + 1.2 / total);
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
      {!shouldReduceMotion && (
        <div
          ref={trackRef}
          aria-hidden="true"
          className="pointer-events-none h-[175vh] w-full"
        />
      )}
    </>
  );
}

StickyAboutSection.propTypes = {
  text: PropTypes.string.isRequired,
  shouldReduceMotion: PropTypes.bool,
  zIndex: PropTypes.number,
};

/**
 * Scroll-Driven Overlapping Section Panel.
 * - Sections <= viewport height pin at `top: 0` so the next section immediately slides up over them.
 * - Sections > viewport height scroll their full internal content first, then pin at their bottom edge
 *   (`top = viewportHeight - sectionHeight`) so the incoming section smoothly covers them from below
 *   without clipping any content.
 */
function OverlappingSection({
  id,
  zIndex,
  isFirst = false,
  className = '',
  shouldReduceMotion = false,
  children,
}) {
  const sectionRef = useRef(null);
  const [stickyTop, setStickyTop] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;
    const el = sectionRef.current;
    if (!el) return undefined;

    const updateStickyOffset = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 768) {
        setIsMobileViewport(true);
        setStickyTop(0);
        return;
      }
      setIsMobileViewport(false);
      const height = el.offsetHeight;
      const nextTop = height > vh ? vh - height : 0;
      setStickyTop(nextTop);
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
  }, [shouldReduceMotion]);

  const useStickyLayer = !shouldReduceMotion && !isMobileViewport;

  return (
    <section
      id={id}
      ref={sectionRef}
      style={{
        zIndex,
        top: useStickyLayer ? `${stickyTop}px` : undefined,
      }}
      className={`v2-stack-layer ${
        useStickyLayer ? 'v2-stack-layer--sticky-bottom' : ''
      } ${!isFirst ? 'v2-stack-layer--overlap' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

OverlappingSection.propTypes = {
  id: PropTypes.string,
  zIndex: PropTypes.number.isRequired,
  isFirst: PropTypes.bool,
  className: PropTypes.string,
  shouldReduceMotion: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

/**
 * Scroll-Driven Editorial Project Card with Sticky Layering & Cursor-Following "VIEW PROJECT" Badge
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
  const [orbPos, setOrbPos] = useState({ x: 50, y: 50 });

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOrbPos({ x, y });
  };

  const subtitleText = isEn ? project.subtitle.en : project.subtitle.id;
  const categoryText = isEn ? project.category.en : project.category.id;
  const descriptionText = isEn ? project.description.en : project.description.id;

  return (
    <article
      id={`v2-work-item-${project.id}`}
      ref={cardRef}
      style={{
        zIndex: index + 1,
      }}
      className={`${
        shouldReduceMotion ? 'relative' : 'v2-work-sticky-card'
      } group rounded-[18px] bg-[#0a0a0a] pt-2 pb-10 sm:pb-14 ${
        index > 0 ? 'shadow-[0_-24px_56px_rgba(0,0,0,0.92)]' : ''
      }`}
    >
      <div className="space-y-5">
        {/* Clean Editorial Visual Container (No Fake Browser Chrome) */}
        <RouterLink
          to={`/study-case/${project.id}`}
          aria-label={`${project.title} — ${subtitleText}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925] rounded-[16px]"
        >
          <div
            className="v2-work-mockup-stage"
            onMouseMove={handleMouseMove}
          >
            {/* Floating Cursor-Following Circular "VIEW PROJECT" Badge */}
            <div
              className="v2-view-project-orb"
              style={{
                left: `${orbPos.x}px`,
                top: `${orbPos.y}px`,
              }}
              aria-hidden="true"
            >
              {isEn ? 'VIEW PROJECT' : 'LIHAT PROYEK'}
            </div>

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

        {/* Mobile & Tablet Project Metadata (Desktop displays primary title/number in sticky left rail) */}
        <div className="lg:hidden space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#ff4925]">
              {project.number} / {String(totalCount).padStart(2, '0')}
            </span>
            <span className="text-[#8f8f8f] uppercase">{categoryText}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white">
            {project.title}
          </h3>
          <p className="text-sm font-medium text-[#cacaca]">{subtitleText}</p>
          <p className="text-sm text-[#8f8f8f] leading-relaxed">{descriptionText}</p>
        </div>

        {/* Bottom Bar: Tech Tags + Authentic Project Action Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {project.version && (
              <span className="rounded-full border border-[#ff4925]/40 bg-[#220f0d] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#ff4925]">
                {project.version}
              </span>
            )}
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#262626] bg-[#111111] px-3 py-1 text-[11px] font-medium text-[#9f9f9f]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[-0.02em]">
            <RouterLink
              to={`/study-case/${project.id}`}
              className="inline-flex items-center gap-1 text-[#cacaca] hover:text-[#ff4925] transition-colors"
            >
              <span>{isEn ? 'Case Study' : 'Studi Kasus'}</span>
              <FiArrowUpRight size={14} className="text-[#ff4925]" />
            </RouterLink>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#cacaca] hover:text-[#ff4925] transition-colors"
              >
                <span>{isEn ? 'Live Demo' : 'Demo Langsung'}</span>
                <FiArrowUpRight size={14} className="text-[#ff4925]" />
              </a>
            )}
            {project.npm && (
              <a
                href={project.npm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#cacaca] hover:text-[#ff4925] transition-colors"
              >
                <span>npm</span>
                <FiArrowUpRight size={14} className="text-[#ff4925]" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#8f8f8f] hover:text-[#ff4925] transition-colors"
              >
                <span>GitHub</span>
                <FiArrowUpRight size={14} className="text-[#ff4925]" />
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
   Main Portfolio V2 Component (Exact Nakula Video Layout & Motion)
   ========================================================================== */

export default function PortfolioV2() {
  const shouldReduceMotion = useReducedMotion();
  const { language } = useLanguage();
  const { switchLanguage } = useRouter();
  const isEn = language === 'en';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !shouldReduceMotion);
  const [heroIntroComplete, setHeroIntroComplete] = useState(() => Boolean(shouldReduceMotion));
  const [activeWorkIdx, setActiveWorkIdx] = useState(0);
  const [openCapabilityIdx, setOpenCapabilityIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [showAllWorks, setShowAllWorks] = useState(false);
  const [jakartaTime, setJakartaTime] = useState('');
  const lenisRef = useRef(null);

  // Nakula Initial Splash Preloader (Full-viewport #ff4925 curtain -> masked wordmark rises from bottom -> curtain slides up from bottom to top)
  useEffect(() => {
    if (shouldReduceMotion) {
      setShowSplash(false);
      setHeroIntroComplete(true);
      return undefined;
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1350);

    const readyTimer = setTimeout(() => {
      setHeroIntroComplete(true);
    }, 1500);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(readyTimer);
    };
  }, [shouldReduceMotion]);

  const { scrollY } = useScroll();
  // Top-left wordmark shrinks from Giant Hero size (scale 1) into compact Sticky Nav size (scale 0.25) as user scrolls 0 -> 320px (Exact Nakula Video 00:00–00:05)
  const wordmarkScale = useTransform(scrollY, [0, 320], [1, 0.25]);

  // Enable viewport-level position:sticky inside Portfolio V2 (overrides global html/body overflow-x:hidden from V1 stylesheet while V2 is mounted)
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    htmlEl.classList.add('v2-scroll-root');
    return () => {
      htmlEl.classList.remove('v2-scroll-root');
    };
  }, []);

  // Scoped Lenis smooth scroll exclusively inside Portfolio V2
  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
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

  // Live GMT+7 clock in top header (2-line format matching Nakula video: "6:50 PM" / "(GMT+7)")
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

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -64 });
    } else {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const activeWork = selectedProjects[activeWorkIdx] || selectedProjects[0];

  // Authentic Capabilities mapped from src/data/skills.js & projects
  const capabilities = [
    {
      number: '01.',
      title: isEn ? 'Frontend Engineering & Architecture' : 'Rekayasa & Arsitektur Frontend',
      summary: isEn
        ? 'Building fast, accessible (WCAG 2.1 AA), and modular web interfaces with React, Next.js 15, TypeScript, and Tailwind CSS.'
        : 'Membangun antarmuka web cepat, aksesibel (WCAG 2.1 AA), dan modular menggunakan React, Next.js 15, TypeScript, dan Tailwind CSS.',
      tags: ['React 18', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vite', 'WCAG 2.1 AA'],
      image: '/images/projects/akseskita.webp',
      featuredProject: 'AksesKita',
      featuredSlug: 'akseskita',
    },
    {
      number: '02.',
      title: isEn ? 'Full-Stack Web Systems & REST APIs' : 'Sistem Web Full-Stack & REST API',
      summary: isEn
        ? 'End-to-end web application development pairing reactive frontends with Node.js, Express, Laravel, and strict Zod runtime validation.'
        : 'Pengembangan aplikasi web end-to-end yang memadukan frontend reaktif dengan Node.js, Express, Laravel, serta validasi runtime Zod.',
      tags: ['Node.js', 'Express.js', 'Laravel', 'RESTful API', 'Zod Validation', 'Auth & RBAC'],
      image: '/images/projects/project_management.webp',
      featuredProject: 'Project Management System',
      featuredSlug: 'project-management',
    },
    {
      number: '03.',
      title: isEn ? 'Database Modeling & Open-Source Tooling' : 'Pemodelan Database & Library Open-Source',
      summary: isEn
        ? 'Relational schema design in PostgreSQL/MySQL with Prisma ORM, plus zero-dependency TypeScript package engineering published to npm.'
        : 'Perancangan skema relasional PostgreSQL/MySQL dengan Prisma ORM, serta pembuatan library TypeScript zero-dependency di npm.',
      tags: ['PostgreSQL', 'Prisma ORM', 'MySQL', 'Supabase', 'tsup (ESM + CJS)', 'Vitest CI'],
      image: '/images/projects/id-kit.webp',
      featuredProject: '@ghifari29/id-kit',
      featuredSlug: 'id-kit',
    },
    {
      number: '04.',
      title: isEn ? 'AI Document Processing & Interactive Web' : 'Pemrosesan Dokumen AI & Web Interaktif',
      summary: isEn
        ? 'Integrating Gemini AI with asynchronous BullMQ + Redis worker queues and interactive 3D/WebGL browser experiences.'
        : 'Integrasi Gemini AI dengan antrean latar belakang BullMQ + Redis serta pengalaman browser interaktif 3D/WebGL.',
      tags: ['Gemini API', 'BullMQ', 'Redis', 'Three.js / WebGL', 'Framer Motion'],
      image: '/images/projects/studyflow.webp',
      featuredProject: 'StudyFlow',
      featuredSlug: 'studyflow',
    },
  ];

  // Authentic Track Record (Process / Experience / Academic steps — Tall Cards like Nakula Process Screenshot)
  const careerSteps = [
    {
      step: 'STEP 1',
      title: isEn
        ? 'Frontend Intern — PT. AMA Salam'
        : 'Frontend Intern — PT. AMA Salam',
      body: isEn
        ? experiences[0].description.en
        : experiences[0].description.id,
    },
    {
      step: 'STEP 2',
      title: isEn
        ? 'Author — @ghifari29/id-kit'
        : 'Author — @ghifari29/id-kit',
      body: isEn
        ? 'Engineered a zero-dependency offline TypeScript utility library for Indonesian data formats (9 modules, 10 subpath exports, 509 Vitest unit tests across 3 timezones).'
        : 'Merancang library utilitas TypeScript offline zero-dependency untuk data Indonesia (9 modul, 10 subpath exports, 509 unit test Vitest di 3 zona waktu).',
    },
    {
      step: 'STEP 3',
      title: `${educationMetadata.gunadarma.institution}`,
      body: isEn
        ? 'Pursuing a Bachelor of Informatics degree focusing on software engineering, algorithms, data structures, and distributed web systems.'
        : 'Menempuh pendidikan S1 Informatika dengan fokus pada rekayasa perangkat lunak, algoritma, struktur data, dan sistem web.',
    },
    {
      step: 'STEP 4',
      title: `${educationMetadata.smkn1Cibinong.institution}`,
      body: isEn
        ? 'Vocational software engineering foundation (2023–2026) covering full-stack web development, relational databases, and national game creation achievements.'
        : 'Fondasi kejuruan Rekayasa Perangkat Lunak (2023–2026) mencakup pengembangan web full-stack, basis data relasional, dan kompetisi game nasional.',
    },
  ];

  // Authentic Metrics derived from actual repository data
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
      label: isEn ? 'WCAG 2.1 AA accessibility & zero-CLS focus' : 'Fokus aksesibilitas WCAG 2.1 AA & zero-CLS',
    },
    {
      numeral: String(totalSkillsCount),
      suffix: '+',
      label: isEn ? 'Core technologies & engineering tools' : 'Teknologi inti & perangkat rekayasa',
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

  const introEase = [0.16, 1, 0.3, 1];

  return (
    <div className="v2-portfolio-root" data-portfolio-version="2">
      {/* ====================================================================
          0. NAKULA FULL-SCREEN VERMILION (#FF4925) SPLASH PRELOADER
             1) Wordmark rises smoothly from bottom inside an overflow-hidden mask
             2) Orange background curtain slides smoothly from bottom to top (y: 0% -> -100%)
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
                duration: 0.92,
                ease: [0.76, 0, 0.24, 1],
              },
            }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-[#ff4925] select-none pointer-events-auto will-change-transform"
          >
            <div className="overflow-hidden px-4 py-2">
              <motion.div
                initial={{ y: '115%' }}
                animate={{
                  y: '0%',
                  transition: {
                    duration: 0.72,
                    delay: 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
                exit={{
                  y: '-35%',
                  transition: {
                    duration: 0.78,
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
          Fixed Top Header with Scroll-Shrinking Giant Wordmark (Exact Nakula Video 00:00–00:05)
          ==================================================================== */}
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
        animate={
          heroIntroComplete || shouldReduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -16 }
        }
        transition={{ duration: 0.75, ease: introEase }}
        className="fixed top-0 left-0 right-0 z-[120] pointer-events-none"
      >
        <div className="v2-container flex items-start justify-between pt-5 sm:pt-7">
          {/* Left Wordmark: Starts Giant at y=0, shrinks smoothly on scroll into compact nav logo */}
          <motion.a
            href="#v2-top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('v2-top');
            }}
            style={{
              scale: shouldReduceMotion ? 0.28 : wordmarkScale,
              transformOrigin: 'top left',
            }}
            className="pointer-events-auto v2-display-heading text-[clamp(4.25rem,12.5vw,10.8rem)] leading-[0.82] tracking-[-0.01em] text-[#cacaca] hover:text-white transition-colors select-none focus-visible:outline-none"
          >
            {siteConfig.brandName}
            <span className="text-[0.36em] align-top ml-1 font-sans font-normal text-[#cacaca]">
              ®
            </span>
          </motion.a>

          {/* Right Cluster: 2-line Availability + 2-line Time + Language + LET'S TALK + Circular Menu */}
          <div className="pointer-events-auto flex items-center gap-5 sm:gap-9 bg-[#0a0a0a]/75 backdrop-blur-md px-3 py-1.5 rounded-full">
            {/* 2-Line Availability Block */}
            <div className="hidden md:flex flex-col text-left leading-[1.25]">
              <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[-0.02em] text-[#cacaca]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>{isEn ? 'Available for project' : 'Tersedia untuk proyek'}</span>
              </div>
              <span className="pl-4 text-[11px] font-medium uppercase tracking-[0.02em] text-[#8f8f8f]">
                {isEn ? 'OPEN FOR ROLES' : 'TERBUKA UNTUK KERJA'}
              </span>
            </div>

            {/* 2-Line Clock Block */}
            <div className="hidden lg:flex flex-col text-left leading-[1.25]">
              <span className="text-[12px] font-semibold tracking-[-0.02em] text-[#cacaca]">
                {jakartaTime}
              </span>
              <span className="text-[11px] font-medium text-[#8f8f8f]">(GMT+7)</span>
            </div>

            {/* Action Pills */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => switchLanguage(isEn ? 'id' : 'en')}
                aria-label={isEn ? 'Switch language to Indonesian' : 'Ganti bahasa ke Inggris'}
                className="inline-flex h-10 items-center rounded-full border border-[#333333] bg-[#0a0a0a] px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#cacaca] hover:border-[#ff4925] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
              >
                <span className={!isEn ? 'text-[#ff4925]' : 'text-[#8f8f8f]'}>ID</span>
                <span className="mx-1 text-[#444]">/</span>
                <span className={isEn ? 'text-[#ff4925]' : 'text-[#8f8f8f]'}>EN</span>
              </button>

              <a
                href="#v2-contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('v2-contact');
                }}
                className="v2-pill-btn hidden sm:inline-flex !py-2.5 !px-5 !text-[12px]"
              >
                <RolloverLabel text={isEn ? "LET'S TALK" : 'HUBUNGI SAYA'} />
              </a>

              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label={isEn ? 'Open navigation menu' : 'Buka menu navigasi'}
                aria-expanded={isMenuOpen}
                className="group inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#333333] bg-[#0a0a0a] text-[#cacaca] hover:border-[#4a4a4a] hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
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
          Slide-Over Menu Drawer (Exact Nakula Smooth Right Panel Animation)
          ==================================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="v2-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[130] flex justify-end bg-black/70 backdrop-blur-[2px]"
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
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full w-full max-w-[430px] flex-col justify-between border-l border-[#1f1f1f] bg-[#0a0a0a] px-7 py-7 sm:px-9 sm:py-8 will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Row: ■ MENU + Circular Close Button */}
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-6">
                <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[-0.01em] text-[#8f8f8f]">
                  <span className="inline-block h-1.5 w-1.5 bg-[#ff4925]" aria-hidden="true" />
                  <span>MENU</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={isEn ? 'Close navigation menu' : 'Tutup menu navigasi'}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] text-[#cacaca] hover:border-[#4a4a4a] hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4925]"
                >
                  <FiX size={17} className="transition-transform duration-300 group-hover:rotate-90" />
                </button>
              </div>

              {/* Center Links: HOME ■, WORKS, ABOUT, CONTACT with staggered entrance & orange hover underline */}
              <nav className="my-auto py-4" aria-label="Portfolio V2 Navigation">
                <ul className="divide-y divide-[#1a1a1a]">
                  {[
                    { id: 'v2-top', label: 'HOME', active: true },
                    { id: 'v2-work', label: 'WORKS' },
                    { id: 'v2-about', label: 'ABOUT' },
                    { id: 'v2-contact', label: 'CONTACT' },
                  ].map((item, idx) => (
                    <li key={item.id} className="overflow-hidden">
                      <motion.button
                        type="button"
                        initial={shouldReduceMotion ? false : { y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.48,
                          delay: 0.1 + idx * 0.055,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onClick={() => scrollToSection(item.id)}
                        className="v2-drawer-nav-btn group flex w-full items-center py-4 sm:py-5 text-left focus-visible:outline-none"
                      >
                        <span className="v2-drawer-nav-item">
                          <span className="v2-drawer-nav-label v2-display-heading text-[44px] sm:text-[52px] text-[#cacaca] group-hover:text-white transition-colors duration-300">
                            {item.label}
                          </span>
                          {item.active && (
                            <span
                              className="inline-block h-2 w-2 bg-[#ff4925] self-center"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Bottom Contact & Socials Block */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 pt-4"
              >
                <div>
                  <p className="v2-section-tag mb-1.5 !text-[11px] !text-[#777777]">(EMAIL)</p>
                  <a
                    href={`mailto:${directEmail}`}
                    className="inline-block text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-[#ff4925] hover:opacity-85 transition-opacity"
                  >
                    {directEmail}
                  </a>
                </div>
                <div>
                  <p className="v2-section-tag mb-2.5 !text-[11px] !text-[#777777]">(SOCIALS)</p>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-base font-medium tracking-[-0.03em] text-[#cacaca]">
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
                          size={14}
                          className="text-[#777777] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff4925]"
                        />
                      </a>
                    ))}
                    <RouterLink
                      to="/recruiter"
                      className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span>{isEn ? 'Recruiter' : 'Rekruter'}</span>
                      <FiArrowUpRight
                        size={14}
                        className="text-[#777777] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff4925]"
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
          Main Content (Scroll-Driven Overlapping Layered Sections)
          ==================================================================== */}
      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        {/* ------------------------------------------------------------------
            1. FULL-VIEWPORT HERO SECTION (z-10, Pinned while About slides up over it)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-top"
          zIndex={10}
          isFirst={true}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="min-h-screen w-full flex flex-col justify-between pt-28 pb-10 sm:pt-36 sm:pb-12 overflow-hidden"
        >
          {/* Center Diagonal Spotlight Portrait Slash */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.07 }}
            animate={
              heroIntroComplete || shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1.07 }
            }
            transition={{ duration: 1.05, delay: 0.08, ease: introEase }}
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

          {/* Middle Row: Right-Aligned Stacked Two-Tone Headline ("Beyond / Visuals. / Built with / Vision.") */}
          <div className="v2-container relative z-10 my-auto flex justify-end pt-20 sm:pt-12">
            <h1 className="text-right text-[clamp(2.5rem,5.2vw,4.4rem)] font-semibold tracking-[-0.055em] leading-[0.98]">
              {[
                { text: isEn ? 'Beyond' : 'Melampaui', highlight: false, delay: 0.14 },
                { text: isEn ? 'Visuals.' : 'Visual.', highlight: false, delay: 0.24 },
                { text: isEn ? 'Built with' : 'Dibangun dengan', highlight: true, delay: 0.34 },
                { text: isEn ? 'Vision.' : 'Visi Rekayasa.', highlight: true, delay: 0.44 },
              ].map((line) => (
                <motion.span
                  key={line.text}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={
                    heroIntroComplete || shouldReduceMotion
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 18, filter: 'blur(6px)' }
                  }
                  transition={{ duration: 0.72, delay: line.delay, ease: introEase }}
                  className={`block ${
                    line.highlight ? 'font-bold text-[#cacaca]' : 'text-[#888888]'
                  }`}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Bottom Row: Left Two-Tone Statement + Full-Width Bottom Bar (TRUSTED BY strip + START A PROJECT pill) */}
          <div className="v2-container relative z-10 space-y-10">
            {/* Bottom-Left Two-Tone Statement (Exact Nakula Video 00:03–00:05) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 18 }
              }
              transition={{ duration: 0.78, delay: 0.38, ease: introEase }}
              className="max-w-md"
            >
              <p className="text-[clamp(1.2rem,1.9vw,1.65rem)] font-semibold tracking-[-0.04em] leading-[1.18]">
                <span className="text-[#cacaca]">
                  {isEn
                    ? 'I build web applications, interfaces, and digital systems '
                    : 'Saya membangun aplikasi web, antarmuka, dan sistem digital '}
                </span>
                <span className="text-[#777777]">
                  {isEn
                    ? 'with intention, clarity and engineering care.'
                    : 'dengan ketelitian, kejelasan, dan arsitektur terukur.'}
                </span>
              </p>
            </motion.div>

            {/* Bottom Bar: Left Affiliations/Credentials Strip + Right START A PROJECT Pill */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={
                heroIntroComplete || shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16 }
              }
              transition={{ duration: 0.78, delay: 0.5, ease: introEase }}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2"
            >
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#777777]">
                  {isEn ? 'VERIFIED TRACK:' : 'REKAM JEJAK:'}
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-[-0.03em] text-[#8f8f8f]">
                  PT. AMA Salam
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-[-0.03em] text-[#8f8f8f]">
                  Universitas Gunadarma
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-[-0.03em] text-[#8f8f8f]">
                  SMKN 1 Cibinong
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-[-0.03em] text-[#8f8f8f]">
                  @ghifari29/id-kit
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                <a
                  href="#v2-work"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('v2-work');
                  }}
                  className="v2-pill-btn v2-pill-btn--accent w-full sm:w-auto min-w-[240px] justify-between !px-7 !py-3.5"
                >
                  <RolloverLabel text={isEn ? 'START A PROJECT' : 'LIHAT PROYEK'} />
                  <FiArrowUpRight size={17} />
                </a>
              </div>
            </motion.div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            2. STICKY (ABOUT) SCROLL-REVEAL SECTION (z-20, Covers Hero, Pinned until read)
            ------------------------------------------------------------------ */}
        <StickyAboutSection
          text={aboutStatement}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          zIndex={20}
        />

        {/* ------------------------------------------------------------------
            3. SELECTED WORK (07) — Scroll-Driven Editorial Project Showcase
               (z-30, Slides up to cover About, Sticky Left Rail + Sequential Sticky Visual Cards)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-work"
          zIndex={30}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="pt-16 pb-24 sm:pt-24 sm:pb-36"
        >
          <div className="v2-container">
            {/* 1. Section Introduction: Small Label + Massive Bold Heading */}
            <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
              <p className="v2-section-tag mb-4">
                ({isEn ? 'FEATURED PORTFOLIO' : 'PORTOFOLIO UNGGULAN'})
              </p>
              <div className="relative inline-flex items-start">
                <h2 className="v2-display-heading text-center text-[clamp(4.25rem,11vw,8.75rem)]">
                  {isEn ? 'SELECTED WORK' : 'KARYA PILIHAN'}
                </h2>
                <span className="ml-2.5 mt-1 font-sans text-base sm:text-xl font-semibold tracking-[-0.03em] text-[#cacaca]">
                  ({String(selectedProjects.length).padStart(2, '0')})
                </span>
              </div>
            </div>

            {/* 2. Editorial Showcase Layout: Sticky Left Index/Details Rail & Right Sequential Sticky Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Sticky Column (Desktop) */}
              <div className="hidden lg:flex lg:col-span-4 sticky top-24 flex-col justify-between h-[calc(100vh-8rem)] pr-4 pb-4">
                {/* Top Giant Animated Project Number + Project Index Navigation */}
                <div className="space-y-7">
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeWork.number}
                        initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { y: -24, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        aria-live="polite"
                        className="v2-display-heading text-[clamp(5.5rem,8vw,7.5rem)] leading-none !text-[#2a2a2a] select-none"
                      >
                        {activeWork.number}.
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <nav aria-label={isEn ? 'Selected projects index' : 'Indeks proyek pilihan'}>
                    <ul className="space-y-2 text-sm font-medium">
                      {selectedProjects.map((proj, idx) => {
                        const isCurrent = idx === activeWorkIdx;
                        return (
                          <li key={proj.id}>
                            <button
                              type="button"
                              onClick={() => scrollToSection(`v2-work-item-${proj.id}`)}
                              className={`inline-flex items-center gap-2.5 text-left transition-colors ${
                                isCurrent
                                  ? 'text-white font-semibold'
                                  : 'text-[#666666] hover:text-[#cacaca]'
                              }`}
                            >
                              <span
                                className={`inline-block h-[1.5px] transition-all duration-200 ${
                                  isCurrent ? 'w-3.5 bg-[#ff4925]' : 'w-0 bg-transparent'
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

                {/* Bottom Active Project Category, Title, Subtitle & Short Description */}
                <div className="pt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWork.id}
                      initial={shouldReduceMotion ? false : { y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { y: -14, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-2.5"
                    >
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#ff4925]">
                        {isEn ? activeWork.category.en : activeWork.category.id}
                      </p>
                      <h3 className="text-3xl xl:text-4xl font-semibold tracking-[-0.05em] text-[#cacaca]">
                        {activeWork.title}
                      </h3>
                      <p className="text-base font-medium text-[#cacaca]/90 leading-snug max-w-xs">
                        {isEn ? activeWork.subtitle.en : activeWork.subtitle.id}
                      </p>
                      <p className="text-sm text-[#8f8f8f] leading-relaxed max-w-xs line-clamp-3">
                        {isEn ? activeWork.description.en : activeWork.description.id}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Sequential Sticky Visual Showcase Cards */}
              <div className="lg:col-span-8 space-y-16 lg:space-y-[24vh]">
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

            {/* 6. Other Projects: Clean MORE PROJECTS Transition & Compact Archive Grid */}
            <div className="relative z-20 mt-20 sm:mt-28 border-t border-[#1e1e1e] pt-12 sm:pt-16 bg-[#0a0a0a]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                  <p className="v2-section-tag">
                    ({isEn ? 'PROJECT ARCHIVE' : 'ARSIP PROYEK'} — 0{otherProjects.length})
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-[#cacaca]">
                    {isEn
                      ? 'Additional Web Applications & Educational Games'
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
                            ? 'HIDE MORE PROJECTS'
                            : 'SEMBUNYIKAN ARSIP'
                          : isEn
                          ? `MORE PROJECTS (+${otherProjects.length})`
                          : `PROYEK LAINNYA (+${otherProjects.length})`
                      }
                    />
                  </button>

                  <RouterLink to="/study-case" className="v2-pill-btn v2-pill-btn--accent">
                    <RolloverLabel text={isEn ? 'ALL CASE STUDIES' : 'SEMUA STUDI KASUS'} />
                    <FiArrowUpRight size={16} />
                  </RouterLink>
                </div>
              </div>

              {showAllWorks && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                  {otherProjects.map((proj, index) => (
                    <article
                      key={proj.id}
                      className="rounded-[16px] border border-[#222222] bg-[#0e0e0e] p-5 sm:p-6 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3.5">
                        <div className="aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-[#222222] bg-[#141414]">
                          <img
                            src={proj.image}
                            alt={proj.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#8f8f8f]">
                          <span className="font-mono text-[#ff4925]">
                            0{selectedProjects.length + index + 1}.
                          </span>
                          <span>{isEn ? proj.category.en : proj.category.id}</span>
                        </div>
                        <h4 className="text-xl font-semibold tracking-[-0.04em] text-white">
                          {proj.title}
                        </h4>
                        <p className="text-sm text-[#8f8f8f] line-clamp-2">
                          {isEn ? proj.description.en : proj.description.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <RouterLink
                          to={`/study-case/${proj.id}`}
                          className="v2-pill-btn !py-2 !px-4 !text-xs"
                        >
                          <RolloverLabel text={isEn ? 'CASE STUDY' : 'STUDI KASUS'} />
                          <FiArrowUpRight size={14} className="text-[#ff4925]" />
                        </RouterLink>
                        {proj.live && (
                          <a
                            href={proj.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v2-pill-btn !py-2 !px-4 !text-xs"
                          >
                            <RolloverLabel text="LIVE" />
                            <FiArrowUpRight size={14} className="text-[#ff4925]" />
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v2-pill-btn !py-2 !px-4 !text-xs"
                          >
                            <RolloverLabel text="GITHUB" />
                            <FiArrowUpRight size={14} className="text-[#ff4925]" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            4. NEXT SECTION TRANSITION — BEYOND THE CODE (z-40, Slides up to cover Selected Work)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-metrics"
          zIndex={40}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="py-24 sm:py-36"
        >
          <div className="v2-container space-y-20">
            <div>
              <p className="v2-section-tag mb-4">
                ({isEn ? 'ENGINEERING IN NUMBERS' : 'REKAM JEJAK REKAYASA'})
              </p>
              <h2 className="v2-display-heading text-[clamp(3.5rem,9vw,6.75rem)]">
                {isEn ? 'BEYOND THE CODE' : 'DI BALIK BARIS KODE'}
              </h2>
            </div>

            {/* 2x2 Stat Grid with Subtle Top Tick Marks & Hairline Vertical Dividers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12">
              {metricsData.map((stat) => (
                <div key={stat.label} className="v2-metric-cell">
                  <div className="v2-metric-ticks" aria-hidden="true" />
                  <div className="flex items-baseline">
                    <span className="text-[clamp(4.25rem,8vw,6.75rem)] font-semibold tracking-[-0.06em] leading-none text-[#cacaca]">
                      {stat.numeral}
                    </span>
                    <span className="text-[clamp(3.5rem,6.5vw,5.5rem)] font-semibold tracking-[-0.05em] leading-none text-[#ff4925]">
                      {stat.suffix}
                    </span>
                  </div>
                  <p className="mt-10 max-w-[240px] text-base sm:text-lg font-medium tracking-[-0.03em] leading-snug text-[#8f8f8f]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* 2-Column Editorial Statement + Clean Real Project Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-12">
              <div className="lg:col-span-7 space-y-8">
                <p className="text-[clamp(1.75rem,3.3vw,3rem)] font-semibold tracking-[-0.055em] leading-[1.08]">
                  <span className="text-[#ff4925] mr-3 font-serif text-[1.2em] leading-none">
                    “
                  </span>
                  <span className="text-[#cacaca]">
                    {isEn
                      ? 'Every interface is engineered with strict type safety, WCAG 2.1 AA accessibility, '
                      : 'Setiap antarmuka dirancang dengan tipe statis ketat, aksesibilitas WCAG 2.1 AA, '}
                  </span>
                  <span className="text-[#5c5c5c]">
                    {isEn
                      ? 'and clean backend integration so products remain fast and maintainable.'
                      : 'dan integrasi backend bersih agar produk tetap cepat serta mudah dirawat.'}
                  </span>
                </p>

                <div className="space-y-4">
                  <div className="h-[1px] w-12 bg-[#333333]" />
                  <div className="flex items-center gap-4">
                    <img
                      src={profileData.avatarImage}
                      alt={siteConfig.name}
                      loading="lazy"
                      className="h-14 w-14 rounded-[12px] object-cover border border-[#2a2a2a]"
                    />
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[#cacaca]">
                        {siteConfig.name}
                      </p>
                      <p className="text-sm text-[#6f6f6f]">
                        {isEn
                          ? 'Frontend Developer Intern Alumni at PT. AMA Salam Indonesia'
                          : 'Alumni Frontend Developer Intern di PT. AMA Salam Indonesia'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="v2-work-mockup-stage !aspect-[4/4.2]">
                  <div className="v2-work-device-frame -rotate-2">
                    <img
                      src="/images/projects/project_management.webp"
                      alt="Project Management System"
                      loading="lazy"
                      className="v2-work-device-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            5. (SERVICES) HOW WE CAN HELP — (z-50, Slides up to cover Metrics)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-capabilities"
          zIndex={50}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="py-24 sm:py-36"
        >
          <div className="v2-container">
            <div className="mb-14 sm:mb-20">
              <p className="v2-section-tag mb-4">
                ({isEn ? 'SERVICES' : 'KEAHLIAN'})
              </p>
              <h2 className="v2-display-heading text-[clamp(3.5rem,9vw,6.75rem)]">
                {isEn ? 'HOW I CAN HELP' : 'KEAHLIAN & LAYANAN'}
              </h2>
            </div>

            <div className="space-y-2">
              {capabilities.map((cap, idx) => {
                const isOpen = openCapabilityIdx === idx;
                const dividerWidths = ['w-44', 'w-28', 'w-16', 'w-10'];
                return (
                  <div key={cap.number} className="pt-4 pb-6">
                    {/* Progressive Short Top Line (Nakula Services Signature) */}
                    <div
                      className={`h-[1px] bg-[#2e2e2e] mb-6 ${dividerWidths[idx] || 'w-24'}`}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => setOpenCapabilityIdx(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none group"
                    >
                      <div className="flex items-baseline gap-5 sm:gap-7">
                        <span className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-[#555555]">
                          {cap.number.replace('.', '')}
                          <span className="text-[#ff4925]">.</span>
                        </span>
                        <h3
                          className={`text-2xl sm:text-4xl font-semibold tracking-[-0.05em] transition-colors ${
                            isOpen
                              ? 'text-[#cacaca]'
                              : 'text-[#777777] group-hover:text-[#cacaca]'
                          }`}
                        >
                          {cap.title}
                        </h3>
                      </div>
                      <span className="text-[#ff4925] shrink-0" aria-hidden="true">
                        {isOpen ? <FiMinus size={20} /> : <FiPlus size={20} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pl-0 sm:pl-14 items-center">
                        <div className="lg:col-span-7 space-y-5">
                          <p className="text-base sm:text-lg text-[#8f8f8f] leading-relaxed max-w-2xl">
                            {cap.summary}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cap.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[#333333] bg-[#111111] px-4 py-1.5 text-xs font-medium text-[#cacaca]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="pt-1">
                            <RouterLink
                              to={`/study-case/${cap.featuredSlug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.04em] text-[#ff4925] hover:underline"
                            >
                              <span>
                                {isEn ? 'Case Study:' : 'Studi Kasus:'} {cap.featuredProject}
                              </span>
                              <FiArrowUpRight size={15} />
                            </RouterLink>
                          </div>
                        </div>

                        <div className="lg:col-span-5">
                          <div className="overflow-hidden rounded-[14px] border border-[#242424] bg-[#111111] aspect-[16/10]">
                            <img
                              src={cap.image}
                              alt={cap.featuredProject}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            6. (PROCESS) HOW WE WORK — (z-60, Slides up to cover Services)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-experience"
          zIndex={60}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="py-24 sm:py-36"
        >
          <div className="v2-container">
            <div className="mb-14 sm:mb-20">
              <p className="v2-section-tag mb-4">
                ({isEn ? 'PROCESS & TRACK RECORD' : 'PROSES & PENGALAMAN'})
              </p>
              <h2 className="v2-display-heading text-[clamp(3.5rem,9vw,6.75rem)]">
                {isEn ? 'HOW I WORK' : 'CARA KERJA & JEJAK'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerSteps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[12px] border border-[#1f1f1f] bg-[#0a0a0a] p-8 sm:p-11 flex flex-col justify-between min-h-[380px] sm:min-h-[430px]"
                >
                  <div className="text-lg sm:text-xl font-semibold tracking-[-0.04em] text-[#666666]">
                    {item.step}
                    <span className="text-[#ff4925]">.</span>
                  </div>

                  <div className="space-y-4 pt-16">
                    <h3 className="text-3xl sm:text-[40px] font-semibold tracking-[-0.055em] leading-[1.02] text-[#cacaca]">
                      {item.title}
                    </h3>
                    <p className="text-base sm:text-lg text-[#8f8f8f] leading-[1.35]">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            7. (BLOG / INSIGHTS) LATEST INSIGHTS — (z-70, Slides up to cover Process)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-insights"
          zIndex={70}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="py-24 sm:py-36"
        >
          <div className="v2-container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-14 sm:mb-20">
              <div>
                <p className="v2-section-tag mb-4">(CASE STUDIES)</p>
                <h2 className="v2-display-heading text-[clamp(3.5rem,9vw,6.75rem)]">
                  {isEn ? 'LATEST INSIGHTS' : 'STUDI KASUS TEKNIS'}
                </h2>
              </div>
              <RouterLink to="/study-case" className="v2-pill-btn v2-pill-btn--accent">
                <RolloverLabel text={isEn ? 'SEE ALL' : 'LIHAT SEMUA'} />
                <FiArrowUpRight size={16} />
              </RouterLink>
            </div>

            {featuredCaseStudies.length > 0 && (
              <div className="space-y-6">
                {/* Featured Full-Width Card */}
                <RouterLink
                  to={`/study-case/${featuredCaseStudies[0].id}`}
                  className="group relative block overflow-hidden rounded-[16px] border border-[#222222] bg-[#0e0e0e]"
                >
                  <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                    <img
                      src={featuredCaseStudies[0].image}
                      alt={featuredCaseStudies[0].title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 sm:p-10 space-y-3">
                    <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#0a0a0a]">
                      {isEn ? featuredCaseStudies[0].category.en : featuredCaseStudies[0].category.id}
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-semibold tracking-[-0.05em] text-white group-hover:text-[#ff4925] transition-colors">
                      {featuredCaseStudies[0].title} —{' '}
                      {isEn ? featuredCaseStudies[0].subtitle.en : featuredCaseStudies[0].subtitle.id}
                    </h3>
                    <p className="max-w-3xl text-sm sm:text-base text-[#8f8f8f]">
                      {isEn
                        ? featuredCaseStudies[0].details?.architecture?.en
                        : featuredCaseStudies[0].details?.architecture?.id}
                    </p>
                  </div>
                </RouterLink>

                {/* 2-Column Supporting Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredCaseStudies.slice(1).map((study) => (
                    <RouterLink
                      key={study.id}
                      to={`/study-case/${study.id}`}
                      className="group rounded-[16px] border border-[#222222] bg-[#0e0e0e] overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[#141414]">
                        <img
                          src={study.image}
                          alt={study.title}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6 sm:p-8 space-y-3">
                        <span className="inline-block rounded-full bg-[#e5e5e5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#0a0a0a]">
                          {isEn ? study.category.en : study.category.id}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-white group-hover:text-[#ff4925] transition-colors">
                          {study.title} — {isEn ? study.subtitle.en : study.subtitle.id}
                        </h3>
                        <p className="text-sm text-[#8f8f8f] line-clamp-2">
                          {isEn ? study.details?.architecture?.en : study.details?.architecture?.id}
                        </p>
                      </div>
                    </RouterLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            8. FAQ SECTION — (z-80, Slides up to cover Insights)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-faq"
          zIndex={80}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="py-24 sm:py-36"
        >
          <div className="v2-container">
            <div className="flex flex-wrap items-end gap-6 mb-14 sm:mb-20">
              <h2 className="v2-display-heading text-[clamp(4rem,10vw,7.5rem)]">FAQ</h2>
              <div className="pb-2 text-sm sm:text-base">
                <p className="text-[#cacaca]">
                  {isEn ? 'Got specific questions?' : 'Punya pertanyaan spesifik?'}
                </p>
                <a
                  href={`mailto:${directEmail}`}
                  className="font-semibold text-[#ff4925] hover:underline"
                >
                  {isEn ? 'Contact Me' : 'Hubungi Saya'}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                const indentClasses = [
                  'lg:ml-0',
                  'lg:ml-6',
                  'lg:ml-12',
                  'lg:ml-20',
                ];
                return (
                  <div
                    key={item.q}
                    className={`rounded-[16px] border border-[#242424] bg-[#0c0c0c] px-6 py-6 sm:px-9 sm:py-7 transition-colors ${
                      indentClasses[idx] || ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none"
                    >
                      <span
                        className={`text-lg sm:text-2xl font-semibold tracking-[-0.04em] transition-colors ${
                          isOpen ? 'text-[#cacaca]' : 'text-[#8f8f8f]'
                        }`}
                      >
                        {item.q}
                      </span>
                      <span className="text-[#ff4925] shrink-0" aria-hidden="true">
                        {isOpen ? <FiMinus size={20} /> : <FiPlus size={20} />}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-5 pt-5 border-t border-[#1c1c1c] text-sm sm:text-base text-[#8f8f8f] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </OverlappingSection>

        {/* ------------------------------------------------------------------
            9. PRE-FOOTER CTA — LET'S WORK TOGETHER (z-90, Slides up to cover FAQ)
            ------------------------------------------------------------------ */}
        <OverlappingSection
          id="v2-contact"
          zIndex={90}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className="min-h-screen flex items-center py-24 sm:py-36 relative overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 46% 52%, rgba(255, 73, 37, 0.16) 0%, rgba(10, 10, 10, 0.96) 62%)',
            }}
            aria-hidden="true"
          />
          <div className="v2-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <h2 className="v2-display-heading text-[clamp(4.25rem,10.5vw,8rem)] leading-[0.92]">
                <span className="block">{isEn ? "LET'S" : 'MARI'}</span>
                <span className="block">{isEn ? 'WORK' : 'BEKERJA'}</span>
                <span className="block">{isEn ? 'TOGETHER' : 'BERSAMA'}</span>
              </h2>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <p className="text-xl sm:text-2xl font-medium tracking-[-0.04em] text-[#8f8f8f] leading-[1.28] max-w-lg">
                {isEn
                  ? "Have a project or engineering role in mind? I'd love to hear about it. Let's create something great together!"
                  : 'Punya rencana proyek atau posisi rekayasa perangkat lunak? Mari berdiskusi dan bangun solusi terbaik bersama!'}
              </p>

              <a
                href={`mailto:${directEmail}`}
                className="v2-pill-btn v2-pill-btn--accent w-full !py-6 !text-base sm:!text-lg justify-center"
              >
                <RolloverLabel text={isEn ? 'GET IN TOUCH' : 'HUBUNGI SEKARANG'} />
              </a>
            </div>
          </div>
        </OverlappingSection>

        {/* ====================================================================
            10. NAKULA FOOTER + FULL-BLEED #FF4925 BRAND BANNER (z-[100], Slides up over Pre-Footer CTA)
            ==================================================================== */}
        <footer
          style={{ zIndex: 100 }}
          className="v2-stack-layer v2-stack-layer--overlap bg-[#0a0a0a] pt-16 sm:pt-24"
        >
        <div className="v2-container space-y-16 pb-16">
          {/* Top Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#1c1c1c] pb-12">
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
              <p className="text-2xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#cacaca]">
                Bogor / Jakarta, Indonesia
              </p>
            </div>
          </div>

          {/* Middle 3-Column Navigation & Direct Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <p className="v2-section-tag mb-4">(LINKS)</p>
              <ul className="space-y-2.5 text-lg font-medium tracking-[-0.03em] text-[#cacaca]">
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
                    onClick={() => scrollToSection('v2-contact')}
                    className="hover:text-[#ff4925] transition-colors"
                  >
                    Contact
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
              <ul className="space-y-2.5 text-lg font-medium tracking-[-0.03em] text-[#cacaca]">
                {contactChannelsData.map((channel) => (
                  <li key={channel.key}>
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#ff4925] transition-colors"
                    >
                      <span>{channel.name}</span>
                      <FiArrowUpRight size={15} className="text-[#8f8f8f]" />
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
                    <FiArrowUpRight size={15} className="text-[#8f8f8f]" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <p className="text-base sm:text-lg text-[#8f8f8f] max-w-sm leading-snug">
                {isEn
                  ? 'Download my official curriculum vitae or explore verified engineering case studies.'
                  : 'Unduh curriculum vitae resmi atau jelajahi studi kasus arsitektur perangkat lunak.'}
              </p>

              <div className="border-b border-[#2a2a2a] pb-3 flex items-center justify-between text-lg text-[#777777]">
                <span>{RESUME_FILENAME}</span>
                <span className="font-mono text-xs uppercase text-[#ff4925]">PDF</span>
              </div>

              {RESUME_AVAILABLE && (
                <a
                  href={RESUME_URL}
                  download={RESUME_FILENAME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-pill-btn w-full !py-4"
                >
                  <RolloverLabel text={isEn ? 'DOWNLOAD CV' : 'UNDUH CV'} />
                </a>
              )}
            </div>
          </div>

          {/* Legal Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-[#8f8f8f]">
            <p className="uppercase tracking-[0.02em]">
              @{new Date().getFullYear()} {siteConfig.brandName}. ALL RIGHTS RESERVED
            </p>
            <p className="font-semibold text-[#cacaca]">
              PORTFOLIO V2 • ENGINEERED BY {siteConfig.brandName}
            </p>
          </div>
        </div>

        {/* Full-Width Vermilion #FF4925 Brand Banner (Exact Nakula Footer Block) */}
        <div className="bg-[#ff4925] text-[#0a0a0a] py-8 sm:py-12 pb-20 sm:pb-16">
          <div className="v2-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="v2-display-heading !text-[#0a0a0a] text-[clamp(4.5rem,15vw,12.5rem)] leading-[0.82]">
              {siteConfig.brandName}
              <span className="text-[0.32em] align-top ml-1 font-sans font-normal">®</span>
            </p>
            <p className="text-xl sm:text-3xl font-semibold tracking-[-0.05em] leading-[1.05] text-[#0a0a0a] max-w-[240px]">
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
