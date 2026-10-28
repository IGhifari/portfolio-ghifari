import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './styles/Components.css';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Eagerly loaded critical components (Hero & Above/Near-Fold Showcase)
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Project from './components/Project';

// Lazy-loaded below-the-fold components
const SoundButton = lazy(() => import('./components/SoundButton'));
const About = lazy(() => import('./components/About'));
const Journey = lazy(() => import('./components/Journey'));
const Skills = lazy(() => import('./components/Skill'));
const Certificate = lazy(() => import('./components/Certificate'));
const AcademicBackground = lazy(() => import('./components/AcademicBackground'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));

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

        const onUserInteract = () => setShouldRender(true);
        window.addEventListener('hashchange', onUserInteract, { once: true });
        window.addEventListener('click', onUserInteract, { once: true, passive: true });
        window.addEventListener('scroll', onUserInteract, { once: true, passive: true });

        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener('hashchange', onUserInteract);
            window.removeEventListener('click', onUserInteract);
            window.removeEventListener('scroll', onUserInteract);
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

const App = () => {
    return (
        <ThemeProvider>
          <LanguageProvider>
            <div className='tampilan' style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>

            <Suspense fallback={null}>
                <SoundButton />
            </Suspense>

            <Navbar />

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

            {/* Footer */}
            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </div>
          </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
