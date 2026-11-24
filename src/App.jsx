import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './styles/Components.css';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { isPlayRouteType } from './utils/router';
import { updateDocumentMetadata } from './utils/seo';
import { siteConfig, ENABLE_SEASONAL_THEMES } from './config/site';

// Eagerly loaded critical components (Hero & Above/Near-Fold Showcase)
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Project from './components/Project';
import PortfolioSwitcher from './components/PortfolioSwitcher';
import PortfolioV2 from './v2/PortfolioV2';
import V2PageTransition from './v2/V2PageTransition';
import { hasCompletedV2Opening } from './v2/v2OpeningState';

// Lazy-loaded below-the-fold components
const SoundButton = lazy(() => import('./components/SoundButton'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));
const About = lazy(() => import('./components/About'));
const Experience = lazy(() => import('./components/Experience'));
const Journey = lazy(() => import('./components/Journey'));
const Skills = lazy(() => import('./components/Skill'));
const GithubActivity = lazy(() => import('./components/GithubActivity'));
const Certificate = lazy(() => import('./components/Certificate'));
const AcademicBackground = lazy(() => import('./components/AcademicBackground'));
const DeveloperTerminal = lazy(() => import('./components/DeveloperTerminal'));
const TargetCursor = lazy(() => import('./components/TargetCursor'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const CaseStudyList = lazy(() => import('./components/CaseStudyList'));
const CaseStudyDetail = lazy(() => import('./components/CaseStudyDetail'));
const WorksListV2 = lazy(() => import('./v2/WorksListV2'));
const WorkDetailV2 = lazy(() => import('./v2/WorkDetailV2'));
const RecruiterMode = lazy(() => import('./components/RecruiterMode'));
const GameHub = lazy(() => import('./game/hub/GameHub'));
const GamePage = lazy(() => import('./game/GamePage'));
const StackPage = lazy(() => import('./game/stack/StackPage'));
const BugsPage = lazy(() => import('./game/bugs/BugsPage'));
const RunnerPage = lazy(() => import('./game/runner/RunnerPage'));
const SeasonalEffects = lazy(() => import('./components/SeasonalEffects'));
const NotFound = lazy(() => import('./components/NotFound'));

/**
 * Defers mounting of below-the-fold lazy sections until the user scrolls near
 * them or navigation triggers, keeping fallback null to guarantee 0 CLS.
 */
const DeferredSection = ({ children, rootMargin = '400px 0px', minHeight = 'min-h-[200px]' }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (shouldRender) return;

        // Immediately mount if user navigated via URL hash
        if (window.location.hash) {
            setShouldRender(true);
            return;
        }

        const el = containerRef.current;
        let observer;
        if (el && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        setShouldRender(true);
                        observer.disconnect();
                    }
                },
                { rootMargin }
            );
            observer.observe(el);
        }

        const onHash = () => setShouldRender(true);
        window.addEventListener('hashchange', onHash, { once: true });

        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener('hashchange', onHash);
        };
    }, [rootMargin, shouldRender]);

    return (
        <div ref={containerRef} className={shouldRender ? undefined : minHeight}>
            {shouldRender ? (
                <Suspense fallback={null}>{children}</Suspense>
            ) : null}
        </div>
    );
};

DeferredSection.propTypes = {
    children: PropTypes.node.isRequired,
    rootMargin: PropTypes.string,
    minHeight: PropTypes.string,
};

const AppContent = () => {
    const { route, langPrefix, portfolioVersion, switchPortfolioVersion } = useRouter();
    const { language, t } = useLanguage();
    const isPlayMode = isPlayRouteType(route.type);
    const isV2Route =
        route.type === 'home' ||
        route.type === 'study-case-list' ||
        route.type === 'study-case-detail';
    const isV2Active = isV2Route && portfolioVersion !== '1';

    // Restore localized home page document metadata on returning to home or toggling language
    useEffect(() => {
        if (route.type === 'home') {
            const isEn = language === 'en' || langPrefix === 'en';
            const homeTitle = `${siteConfig.name} | Web Developer & Software Engineer Portfolio`;
            const homeDesc = isEn
                ? 'Official portfolio of M. Ghifari Bima Khadafi (IGhifari) — Web Developer from Bogor, Indonesia. Focused on Frontend React, TypeScript & Tailwind CSS, with backend experience in Node.js and Laravel.'
                : 'Portofolio resmi M. Ghifari Bima Khadafi (IGhifari) — Web Developer asal Bogor, Indonesia. Berfokus pada Frontend React, TypeScript & Tailwind CSS, serta berpengalaman dengan Node.js dan Laravel.';
            updateDocumentMetadata({
                title: homeTitle,
                description: homeDesc,
                canonicalPath: '/',
                ogTitle: homeTitle,
                ogDescription: homeDesc,
                ogImage: siteConfig.seo?.ogImage || '/portfolio.png',
                ogType: 'profile',
                lang: isEn ? 'en' : 'id',
            });
        }
    }, [route.type, language, langPrefix]);

    // Scroll restoration for anchor links when switching back to home view
    useEffect(() => {
        if (!isV2Active && route.type === 'home' && window.location.hash) {
            const id = window.location.hash.replace(/^#/, '');
            const timer = setTimeout(() => {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 80);
            return () => clearTimeout(timer);
        }
    }, [isV2Active, route.type]);

    if (isV2Active) {
        const v2FallbackBg = hasCompletedV2Opening() ? 'bg-[#0a0a0a]' : 'bg-[#0b0c0f]';
        return (
            <>
                <V2PageTransition />
                {route.type === 'home' && <PortfolioV2 />}
                {route.type === 'study-case-list' && (
                    <Suspense fallback={<div className={`min-h-screen ${v2FallbackBg}`} />}>
                        <WorksListV2 />
                    </Suspense>
                )}
                {route.type === 'study-case-detail' && (
                    <Suspense fallback={<div className={`min-h-screen ${v2FallbackBg}`} />}>
                        <WorkDetailV2 slug={route.slug} />
                    </Suspense>
                )}
                <PortfolioSwitcher
                    version={portfolioVersion}
                    onChange={switchPortfolioVersion}
                />
            </>
        );
    }

    return (
        <div
            className='tampilan'
            data-portfolio-version="1"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}
        >
            {/* Skip Navigation Link for Keyboard & Screen Reader Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:rounded-md focus:bg-[var(--accent)] focus:text-[var(--accent-contrast)] focus:font-mono focus:text-xs focus:font-bold focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] transition-all cursor-target"
                data-cursor-label="Skip"
                onClick={() => {
                    const mainEl = document.getElementById('main-content');
                    if (mainEl) {
                        mainEl.focus();
                    }
                }}
            >
                {t('nav.skipToContent') || 'Skip to main content'}
            </a>
            {!isPlayMode && <Navbar />}
            {!isPlayMode && ENABLE_SEASONAL_THEMES && (
                <Suspense fallback={null}>
                    <SeasonalEffects />
                </Suspense>
            )}

            <main id="main-content" tabIndex={-1} className="focus:outline-none">
                {route.type === 'home' && (
                    <>
                        {/* Hero */}
                        <section id="profile" className="min-h-screen bg-[var(--bg-primary)]">
                            <Profile/>
                        </section>

                        {/* Projects (Eagerly rendered for immediate showcase availability) */}
                        <section id="projects" className="bg-[var(--bg-primary)]">
                            <Project/>
                        </section>

                        {/* About */}
                        <section id="about" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <DeferredSection>
                                <About/>
                            </DeferredSection>
                        </section>

                        {/* Work Experience */}
                        <section id="experience" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <DeferredSection>
                                <Experience/>
                            </DeferredSection>
                        </section>

                        {/* Journey */}
                        <section id="journey" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <DeferredSection>
                                <Journey/>
                            </DeferredSection>
                        </section>

                        {/* Tech Stack */}
                        <section id="stack" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <div id="skills" aria-hidden="true" />
                            <DeferredSection>
                                <Skills/>
                            </DeferredSection>
                        </section>

                        {/* GitHub Activity */}
                        <section id="github" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <DeferredSection>
                                <GithubActivity />
                            </DeferredSection>
                        </section>

                        {/* Certificates */}
                        <section id="certificates" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <DeferredSection>
                                <Certificate/>
                            </DeferredSection>
                        </section>

                        {/* Academic Background / Education */}
                        <section id="education" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <div id="academic" aria-hidden="true" />
                            <div id="AcademicBackground" aria-hidden="true" />
                            <DeferredSection>
                                <AcademicBackground/>
                            </DeferredSection>
                        </section>

                        {/* Contact */}
                        <section id="contact" className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                            <div id="contact2" aria-hidden="true" />
                            <DeferredSection>
                                <Contact/>
                            </DeferredSection>
                        </section>
                    </>
                )}

                {route.type === 'study-case-list' && (
                    <Suspense fallback={<div className="min-h-screen pt-28 max-w-6xl mx-auto px-5 sm:px-6" />}>
                        <CaseStudyList />
                    </Suspense>
                )}

                {route.type === 'study-case-detail' && (
                    <Suspense fallback={<div className="min-h-screen pt-28 max-w-4xl mx-auto px-5 sm:px-6" />}>
                        <CaseStudyDetail slug={route.slug} />
                    </Suspense>
                )}

                {route.type === 'recruiter' && (
                    <Suspense fallback={<div className="min-h-screen pt-28 max-w-5xl mx-auto px-5 sm:px-6" />}>
                        <RecruiterMode />
                    </Suspense>
                )}

                {route.type === 'play' && (
                    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
                        <GameHub />
                    </Suspense>
                )}

                {route.type === 'play-explore' && (
                    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
                        <GamePage />
                    </Suspense>
                )}

                {route.type === 'play-stack' && (
                    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
                        <StackPage />
                    </Suspense>
                )}

                {route.type === 'play-bugs' && (
                    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
                        <BugsPage />
                    </Suspense>
                )}

                {route.type === 'play-runner' && (
                    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
                        <RunnerPage />
                    </Suspense>
                )}

                {route.type === 'not-found' && (
                    <Suspense fallback={<div className="min-h-screen pt-28 max-w-4xl mx-auto px-5 sm:px-6" />}>
                        <NotFound />
                    </Suspense>
                )}
            </main>

            {/* Footer */}
            {!isPlayMode && (
                <Suspense fallback={null}>
                    <Footer />
                </Suspense>
            )}

            {/* Floating Utilities (Placed after main content for logical tab order; DeveloperTerminal remains mounted on /play* for Ctrl+J) */}
            <aside aria-label={t('nav.floatingUtilities') || 'Floating Utilities'}>
                {!isPlayMode && (
                    <PortfolioSwitcher
                        version={portfolioVersion}
                        onChange={switchPortfolioVersion}
                    />
                )}
                <Suspense fallback={null}>
                    {!isPlayMode && <SoundButton />}
                    {!isPlayMode && <ChatAssistant />}
                    <DeveloperTerminal />
                    {!isPlayMode && <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn />}
                </Suspense>
            </aside>
        </div>
    );
};

const App = () => {
    return (
        <ThemeProvider>
          <LanguageProvider>
            <RouterProvider>
              <AppContent />
            </RouterProvider>
          </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
