import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

import { ENABLE_SEASONAL_THEMES } from '@/config/site';
import { experiences } from '@/data/experience';
import { educationMetadata } from '@/data/education';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from '@/context/RouterContext';
import { useV2Lenis } from '../hooks/useV2Lenis';
import { useJakartaClock } from '../hooks/useJakartaClock';
import { buildV2SeasonTokens } from '../theme/seasonPalette';
import OpeningSequence from '../components/motion/OpeningSequence';
import { hasCompletedV2Opening, useV2TransitionState } from '../components/motion/openingState';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import V2MenuDrawer from '../components/layout/V2MenuDrawer';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import LatestWorkSection from '../sections/LatestWorkSection';
import MetricsSection from '../sections/MetricsSection';
import HighlightQuoteSection from '../sections/HighlightQuoteSection';
import CapabilitiesSection from '../sections/CapabilitiesSection';
import ProcessSection from '../sections/ProcessSection';
import FaqSection from '../sections/FaqSection';
import InsightsSection from '../sections/InsightsSection';
import ContactSection from '../sections/ContactSection';
import '../styles/v2.css';

const SeasonalEffects = lazy(() => import('@/components/SeasonalEffects'));
const DeveloperTerminal = lazy(() => import('@/components/DeveloperTerminal'));
const V2ChatAssistant = lazy(() => import('../components/layout/V2ChatAssistant'));
const TechStackSection = lazy(() => import('../sections/TechStackSection'));
const GithubActivityV2 = lazy(() => import('../sections/GithubActivitySection'));
const CertificatesSection = lazy(() => import('../sections/CertificatesSection'));

/* ==========================================================================
   Main Portfolio V2 Home Page — Lightweight Section Composition
   ========================================================================== */

export default function PortfolioV2() {
  const shouldReduceMotion = useReducedMotion();
  const { t, resolve } = useLanguage();
  const { isDark, season, seasonalEnabled } = useTheme();
  const { navigate, switchLanguage } = useRouter();
  const v2SeasonVars = useMemo(
    () => buildV2SeasonTokens(season, seasonalEnabled),
    [season, seasonalEnabled]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { subpageRevealReady } = useV2TransitionState();
  const [showOpening, setShowOpening] = useState(
    () => !shouldReduceMotion && !hasCompletedV2Opening()
  );
  const [heroIntroComplete, setHeroIntroComplete] = useState(() =>
    Boolean(shouldReduceMotion || (hasCompletedV2Opening() && subpageRevealReady))
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

  const lenisRef = useV2Lenis(Boolean(shouldReduceMotion));
  const jakartaTime = useJakartaClock();
  const { scrollY } = useScroll();

  // Exact Nakula Wordmark Variant Switch (`Big -> Small` at `y > 48px`) + Hero pointer lock release
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const compact = latest > 48;
    setIsWordmarkCompact((prev) => (prev !== compact ? compact : prev));
    const exited = latest > 490;
    setIsHeroExited((prev) => (prev !== exited ? exited : prev));
  });

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
  // Subsequent returns & refreshes are wiped seamlessly by persistent `<V2PageTransition />` in App.jsx.
  useEffect(() => {
    if (shouldReduceMotion || hasCompletedV2Opening()) {
      setShowOpening(false);
      setHeroIntroComplete(Boolean(shouldReduceMotion || subpageRevealReady));
      return undefined;
    }

    setShowOpening(true);
    setHeroIntroComplete(false);
    return undefined;
  }, [shouldReduceMotion, subpageRevealReady]);

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
  }, [lenisRef]);

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
    [lenisRef, shouldReduceMotion]
  );

  const internship = experiences[0];
  const processTrackSteps = [
    {
      step: 'STEP 1',
      period: resolve(internship.period),
      title: 'PT. AMA Salam',
      subtitle: resolve(internship.role),
      body: resolve(internship.description),
    },
    {
      step: 'STEP 2',
      period: '2025 — Present',
      title: '@ghifari29/id-kit',
      subtitle: t('v2.process.idKitSubtitle'),
      body: t('v2.process.idKitBody'),
    },
    {
      step: 'STEP 3',
      period: t('v2.process.ongoing'),
      title: educationMetadata.gunadarma.institution,
      subtitle: t('v2.process.gunadarmaSubtitle'),
      body: t('v2.process.gunadarmaBody'),
    },
    {
      step: 'STEP 4',
      period: educationMetadata.smkn1Cibinong.period,
      title: educationMetadata.smkn1Cibinong.institution,
      subtitle: t('v2.process.smkSubtitle'),
      body: t('v2.process.smkBody'),
    },
  ];

  const aboutStatement = t('v2.about.statement');

  const drawerLinks = [
    {
      id: 'v2-top',
      label: 'HOME',
      active: activeSection === 'v2-top',
      action: () => scrollToSection('v2-top'),
    },
    {
      id: 'v2-work',
      label: 'WORKS',
      active: activeSection === 'v2-work',
      action: () => {
        setIsMenuOpen(false);
        navigate('/study-case');
      },
    },
    {
      id: 'v2-about',
      label: 'ABOUT',
      active: activeSection === 'v2-about',
      action: () => scrollToSection('v2-about'),
    },
    {
      id: 'v2-contact',
      label: 'CONTACT',
      active: activeSection === 'v2-contact',
      action: () => scrollToSection('v2-contact'),
    },
  ];

  const reducedMotion = Boolean(shouldReduceMotion);

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

      {showOpening && (
        <OpeningSequence
          onRevealStart={() => setHeroIntroComplete(true)}
          onComplete={() => {
            setHeroIntroComplete(true);
            setShowOpening(false);
          }}
        />
      )}

      <HomeHeader
        isDark={isDark}
        jakartaTime={jakartaTime}
        heroIntroComplete={heroIntroComplete}
        isWordmarkCompact={isWordmarkCompact}
        isMenuOpen={isMenuOpen}
        shouldReduceMotion={reducedMotion}
        onScrollToSection={scrollToSection}
        onSwitchLanguage={switchLanguage}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <V2MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={drawerLinks}
        shouldReduceMotion={reducedMotion}
      />

      <main id="main-content" tabIndex={-1} className="v2-portfolio-main focus:outline-none">
        <HeroSection
          jakartaTime={jakartaTime}
          heroIntroComplete={heroIntroComplete}
          isHeroExited={isHeroExited}
          isTabletUp={isTabletUp}
          shouldReduceMotion={reducedMotion}
          onScrollToSection={scrollToSection}
        />

        <AboutSection text={aboutStatement} />

        <LatestWorkSection
          isDesktop={isDesktopViewport}
          shouldReduceMotion={reducedMotion}
          onScrollToSection={scrollToSection}
        />

        <MetricsSection shouldReduceMotion={reducedMotion} />

        <HighlightQuoteSection shouldReduceMotion={reducedMotion} />

        <CapabilitiesSection
          isDesktop={isDesktopViewport}
          shouldReduceMotion={reducedMotion}
          surfaceElevatedBg={v2SeasonVars['--v2-surface-elevated']}
          defaultBg={v2SeasonVars['--v2-bg']}
        />

        <Suspense
          fallback={
            <section
              id="v2-stack"
              className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
            >
              <div className="v2-container border-t border-b border-[var(--v2-border-strong)] py-16">
                <div className="h-[240px] rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
              </div>
            </section>
          }
        >
          <TechStackSection />
        </Suspense>

        <ProcessSection
          steps={processTrackSteps}
          isDesktop={isDesktopViewport}
          shouldReduceMotion={reducedMotion}
        />

        <Suspense
          fallback={
            <section
              id="v2-github"
              className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
            >
              <div className="v2-container border-t border-b border-[var(--v2-border-strong)] py-16">
                <div className="h-[180px] rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
              </div>
            </section>
          }
        >
          <GithubActivityV2 />
        </Suspense>

        <Suspense
          fallback={
            <section
              id="v2-certificates"
              className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
            >
              <div className="v2-container border-t border-b border-[var(--v2-border-strong)] py-16">
                <div className="h-[260px] rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
              </div>
            </section>
          }
        >
          <CertificatesSection />
        </Suspense>

        <FaqSection shouldReduceMotion={reducedMotion} />

        <InsightsSection shouldReduceMotion={reducedMotion} />

        <ContactSection shouldReduceMotion={reducedMotion} />

        <HomeFooter
          isTabletUp={isTabletUp}
          shouldReduceMotion={reducedMotion}
          onScrollToSection={scrollToSection}
        />
      </main>

      <Suspense fallback={null}>
        <V2ChatAssistant />
        <DeveloperTerminal />
      </Suspense>
    </div>
  );
}
