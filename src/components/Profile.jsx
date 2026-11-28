import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'react-scroll';
import { FiArrowUpRight, FiArrowDown, FiGithub, FiLinkedin, FiDownload, FiBriefcase } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '../data/resume';
import { profileData } from '../data/profile';
import { RouterLink } from '../context/RouterContext';
import { generateLanyardTextures } from '../utils/lanyardCardGenerator';
import Threads from './reactbits/Threads';
import TechText from './reactbits/TechText';

const Lanyard = lazy(() => import('./Lanyard'));

const Profile = () => {
  const shouldReduceMotion = useReducedMotion();
  const { isDark, season } = useTheme();
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  const [textures, setTextures] = useState(null);
  const [isLanyardReady, setIsLanyardReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    generateLanyardTextures({
      isDark,
      seasonId: season?.id,
      accent: season?.palette?.accent,
      bg: season?.palette?.bgPrimary,
      surface: season?.palette?.surface,
      surfaceAlt: season?.palette?.surfaceAlt,
      border: season?.palette?.border,
    }).then((generated) => {
      if (active && generated) {
        setTextures(generated);
        // Stagger Lanyard mount by 1 animation frame so DOM & Threads settle cleanly
        requestAnimationFrame(() => {
          if (active) setIsLanyardReady(true);
        });
      }
    });
    return () => {
      active = false;
    };
  }, [isDark, season]);

  // Controlled, subtle scroll transformations away from hero
  const scrollScale = useTransform(scrollY, isDesktop ? [0, 520] : [380, 980], [1, 0.96]);
  const scrollOpacity = useTransform(scrollY, isDesktop ? [0, 500] : [380, 950], [1, 0]);
  const scrollYOffset = useTransform(scrollY, isDesktop ? [0, 520] : [380, 980], [0, 24]);

  const heroScale = shouldReduceMotion ? 1 : scrollScale;
  const heroOpacity = shouldReduceMotion ? 1 : scrollOpacity;
  const heroY = shouldReduceMotion ? 0 : scrollYOffset;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  const shortcutLabel = isMac ? '⌘J' : 'Ctrl+J';

  // Snappy, modern spring-like curve for entrance
  const easeCurve = [0.16, 1, 0.3, 1];

  const getMotionProps = (delay, yOffset = 16) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 1, y: yOffset },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  return (
    <div className="hero-wrapper bg-[var(--bg-primary)] relative min-h-screen w-full flex flex-col justify-start lg:justify-center items-center overflow-hidden">
      {/* Background layer: ReactBits Threads WebGL animation with seasonal theme color */}
      <Threads
        color={season?.threadsColor || (isDark ? [0.23, 0.51, 0.96] : [0.15, 0.39, 0.92])}
        amplitude={1.1}
        distance={0.38}
        enableMouseInteraction={true}
      />

      {/* Subtle radial vignette overlay adapted to seasonal background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 15%, var(--bg-primary) 96%)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Full-Screen Unbounded 3D Lanyard Overlay (Fades in smoothly once textures are ready to prevent Chromium swapchain stall) */}
      <div
        className={`absolute inset-0 w-full h-full z-30 pointer-events-none transition-opacity duration-500 ease-out ${
          isLanyardReady && textures ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isLanyardReady && textures && (
          <Suspense fallback={null}>
            <Lanyard
              frontImage={textures.frontImage}
              backImage={textures.backImage}
              strapImage={textures.strapImage}
              cardColor={season?.palette?.surface || (isDark ? '#141418' : '#F7F7F5')}
              strapColor={season?.palette?.surfaceAlt || (isDark ? '#111116' : '#18181B')}
              finish="glossy"
              orientation="portrait"
              cornerRadius={0.22}
              anchor={isDesktop ? 'right' : 'center'}
              anchorOffsetY={isDesktop ? 62 : 46}
              size={isDesktop ? 0.38 : 0.28}
              strapLength={isDesktop ? 0.22 : 0.03}
              strapWidth={0.65}
              metal={isDark ? 'silver' : 'graphite'}
              gravity={1}
              damping={0.45}
              elasticity={0.52}
              breeze={0.35}
              interactive={true}
              intro={true}
            />
          </Suspense>
        )}
      </div>

      {/* Main Hero Text Content (z-10 behind the 3D Lanyard at z-30) */}
      <motion.div
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY,
          zIndex: 10,
        }}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-[580px] pb-28 lg:py-24 relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Primary Identity & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Status Indicator & Recruiter Mode Shortcut */}
            <motion.div {...getMotionProps(0.05, -8)}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)]/90 backdrop-blur-md text-[11px] font-mono tracking-wider text-[var(--text-secondary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('hero.available')}</span>
                </div>

                <RouterLink
                  to="/recruiter"
                  data-cursor-label="Recruiter"
                  className="cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] backdrop-blur-md text-[11px] font-mono tracking-wider text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  <FiBriefcase size={11} className="text-[var(--accent)]" aria-hidden="true" />
                  <span>{t('nav.forRecruiters')} &rarr;</span>
                </RouterLink>
              </div>
            </motion.div>

            {/* Person's Name: Primary Visual Element (Single semantic H1 with full name) */}
            <h1 className="space-y-0.5 sm:space-y-1 w-full select-none pointer-events-auto" aria-label={profileData.fullName}>
              <span className="sr-only">{profileData.fullName}</span>
              <div className="w-full h-[54px] xs:h-[64px] sm:h-[74px] md:h-[86px] lg:h-[96px] relative" aria-hidden="true">
                <TechText
                  text={profileData.nameLines.first}
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight={800}
                  fontSize={90}
                  align={isDesktop ? 'left' : 'center'}
                  color={season?.palette?.textPrimary || (isDark ? '#F7F7F5' : '#141418')}
                  accentColor={season?.palette?.accent || (isDark ? '#60A5FA' : '#2563EB')}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={12}
                  intro="none"
                  clickKick
                  guides={false}
                />
              </div>
              <div className="w-full h-[54px] xs:h-[64px] sm:h-[74px] md:h-[86px] lg:h-[96px] relative" aria-hidden="true">
                <TechText
                  text={profileData.nameLines.second}
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight={800}
                  fontSize={90}
                  align={isDesktop ? 'left' : 'center'}
                  color={season?.palette?.textSecondary || (isDark ? '#94A3B8' : '#64748B')}
                  accentColor={season?.palette?.accent || (isDark ? '#60A5FA' : '#2563EB')}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={12}
                  intro="none"
                  clickKick
                  guides={false}
                />
              </div>
            </h1>

            {/* Role with subtle framing dividers */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-0.5">
              <span
                className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[var(--border)] hidden xs:inline-block lg:hidden"
                aria-hidden="true"
              />
              <span
                className="h-[2px] w-8 bg-[var(--accent)] hidden lg:inline-block"
                aria-hidden="true"
              />
              <p className="font-mono text-[11px] xs:text-xs sm:text-sm md:text-base tracking-[0.16em] sm:tracking-[0.22em] text-[var(--accent)] uppercase font-semibold">
                {t('hero.role')}
              </p>
              <span
                className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[var(--border)] hidden xs:inline-block lg:hidden"
                aria-hidden="true"
              />
            </div>

            {/* Value Proposition */}
            <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-normal px-2 sm:px-0">
              {t('hero.valueProp')}
            </p>

            {/* Call to Actions & Social Links */}
            <motion.div
              className="pt-2 flex flex-col items-center lg:items-start gap-4 sm:gap-5 w-full pointer-events-auto"
              {...getMotionProps(0.4, 12)}
            >
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  to="projects"
                  href="#projects"
                  smooth={true}
                  duration={600}
                  offset={-70}
                  data-cursor-label="Explore"
                  className="cursor-target w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:px-7 sm:py-3.5 bg-[var(--accent)] text-[var(--accent-contrast)] font-grotesk font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-[var(--accent-hover)] hover:translate-y-[-1px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                >
                  {t('hero.exploreWork')}
                </Link>

                {RESUME_AVAILABLE && (
                  <a
                    href={RESUME_URL}
                    download={RESUME_FILENAME}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('hero.downloadCvAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                    data-cursor-label="CV"
                    className="cursor-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-[var(--surface-muted)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text-primary)] font-grotesk font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                  >
                    <FiDownload size={15} aria-hidden="true" />
                    <span>{t('hero.downloadCv')}</span>
                    <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                  </a>
                )}

                <a
                  href={profileData.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="GitHub"
                  className="cursor-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border)] text-[var(--text-primary)] font-grotesk font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                >
                  <span>{t('hero.githubCta')}</span>
                  <FiArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                </a>
              </div>

              {/* Developer Terminal Invoke Button (Image 1 Style) */}
              <div className="pt-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => window.dispatchEvent(new CustomEvent('open-developer-terminal', { detail: { trigger: e.currentTarget } }))}
                  data-cursor-label="Terminal"
                  className="group cursor-target inline-flex items-center justify-between gap-5 sm:gap-7 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-200 shadow-md hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
                  aria-label={t('terminal.invokeBtn') || 'INVOKE TERMINAL'}
                  title={t('terminal.invokeHint')}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--accent)] font-mono text-sm sm:text-base font-bold animate-pulse" aria-hidden="true">
                      _
                    </span>
                    <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {t('terminal.invokeBtn') || 'INVOKE TERMINAL'}
                    </span>
                  </div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--border-hover)] transition-colors">
                    {shortcutLabel}
                  </kbd>
                </button>
              </div>

              {/* Subtle Social Links */}
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)] pt-0.5">
                <a
                  href={profileData.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('hero.githubAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                  data-cursor-label="GitHub"
                  className="cursor-target p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-all duration-150 relative after:content-[''] after:absolute after:-inset-1 after:min-w-[44px] after:min-h-[44px] touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiGithub size={17} aria-hidden="true" />
                  <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                </a>
                <span className="text-[var(--border)] select-none text-xs" aria-hidden="true">/</span>
                <a
                  href={profileData.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('hero.linkedinAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                  data-cursor-label="LinkedIn"
                  className="cursor-target p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-all duration-150 relative after:content-[''] after:absolute after:-inset-1 after:min-w-[44px] after:min-h-[44px] touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiLinkedin size={17} aria-hidden="true" />
                  <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        {...getMotionProps(0.5, 0)}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 hidden lg:block"
      >
        <Link
          to="projects"
          href="#projects"
          smooth={true}
          duration={600}
          offset={-70}
          data-cursor-label="Scroll"
          className="cursor-target flex flex-col items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded p-1"
          aria-label={t('hero.scrollAria')}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase">{t('hero.scroll')}</span>
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <FiArrowDown size={14} className="group-hover:text-[var(--accent)] transition-colors" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Profile;
