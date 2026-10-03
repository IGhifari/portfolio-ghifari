import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'react-scroll';
import { FiArrowUpRight, FiArrowDown, FiGithub, FiLinkedin } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Threads from './reactbits/Threads';
import '../styles/Components.css';

const Profile = () => {
  const shouldReduceMotion = useReducedMotion();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  // Controlled, subtle scroll transformations away from hero
  const scrollScale = useTransform(scrollY, [0, 480], [1, 0.96]);
  const scrollOpacity = useTransform(scrollY, [0, 360], [1, 0]);
  const scrollYOffset = useTransform(scrollY, [0, 480], [0, 24]);

  const heroScale = shouldReduceMotion ? 1 : scrollScale;
  const heroOpacity = shouldReduceMotion ? 1 : scrollOpacity;
  const heroY = shouldReduceMotion ? 0 : scrollYOffset;

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
      initial: { opacity: 0, y: yOffset },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  return (
    <div className="hero-wrapper bg-[var(--bg-primary)] relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background layer: ReactBits Threads WebGL animation with theme-aware color */}
      <Threads
        color={isDark ? [0.98, 0.8, 0.08] : [0.72, 0.55, 0.08]}
        amplitude={1.1}
        distance={0.38}
        enableMouseInteraction={true}
      />

      {/* Subtle radial vignette overlay to preserve high text contrast in both themes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, rgba(8, 8, 8, 0.12) 0%, rgba(8, 8, 8, 0.78) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(247, 247, 245, 0.12) 0%, rgba(247, 247, 245, 0.82) 100%)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Main Hero Content */}
      <motion.div
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          y: heroY,
          zIndex: 10,
        }}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-24 sm:pb-20 md:py-24 text-center flex flex-col items-center justify-center relative"
      >
        <div className="space-y-4 sm:space-y-6 md:space-y-7 w-full flex flex-col items-center">
          {/* Status Indicator */}
          <motion.div {...getMotionProps(0.05, -8)}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] backdrop-blur-md text-[11px] font-mono tracking-wider text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('hero.available')}</span>
            </div>
          </motion.div>

          {/* Person's Name: Primary Visual Element */}
          <div className="space-y-0.5 sm:space-y-1 w-full">
            <motion.h1
              className="hero-name-clamp tracking-tight font-extrabold text-[var(--text-primary)] uppercase select-none"
              {...getMotionProps(0.12, 16)}
            >
              M. GHIFARI
            </motion.h1>
            <motion.h1
              className="hero-name-clamp tracking-tight font-extrabold text-[var(--text-secondary)] uppercase select-none"
              {...getMotionProps(0.2, 16)}
            >
              BIMA KHADAFI
            </motion.h1>
          </div>

          {/* Role with subtle framing dividers */}
          <motion.div
            className="flex items-center justify-center gap-3 sm:gap-4 pt-0.5"
            {...getMotionProps(0.28, 12)}
          >
            <span
              className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[var(--border)] hidden xs:inline-block"
              aria-hidden="true"
            />
            <p className="font-mono text-[11px] xs:text-xs sm:text-sm md:text-base tracking-[0.16em] sm:tracking-[0.22em] text-[var(--accent)] uppercase font-semibold text-center">
              {t('hero.role')}
            </p>
            <span
              className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[var(--border)] hidden xs:inline-block"
              aria-hidden="true"
            />
          </motion.div>

          {/* Value Proposition */}
          <motion.p
            className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-normal px-2 sm:px-4"
            {...getMotionProps(0.36, 12)}
          >
            {t('hero.valueProp')}
          </motion.p>

          {/* Call to Actions & Social Links */}
          <motion.div
            className="pt-2 flex flex-col items-center gap-4 sm:gap-5 w-full"
            {...getMotionProps(0.44, 12)}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                to="projects"
                smooth={true}
                duration={600}
                offset={-70}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:px-7 sm:py-3.5 bg-[var(--accent)] text-[var(--accent-contrast)] font-grotesk font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:bg-[var(--accent-hover)] hover:translate-y-[-1px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              >
                {t('hero.exploreWork')}
              </Link>

              <a
                href="https://github.com/IGhifari"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-transparent border border-[var(--border)] text-[var(--text-primary)] font-grotesk font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              >
                <span>{t('hero.githubCta')}</span>
                <FiArrowUpRight size={16} />
              </a>
            </div>

            {/* Subtle Social Links */}
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)] pt-0.5">
              <a
                href="https://github.com/IGhifari"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('hero.githubAria')}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <FiGithub size={17} />
              </a>
              <span className="text-[var(--border)] select-none text-xs" aria-hidden="true">/</span>
              <a
                href="https://www.linkedin.com/in/ighifari/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('hero.linkedinAria')}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <FiLinkedin size={17} />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        {...getMotionProps(0.55, 0)}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 hidden [@media(min-height:600px)]:block"
      >
        <Link
          to="projects"
          smooth={true}
          duration={600}
          offset={-70}
          className="flex flex-col items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer group focus-visible:outline-none"
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
