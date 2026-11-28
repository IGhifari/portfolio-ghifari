import { useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

import { selectedProjects } from '@/data/projects';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import RolloverLabel from '../components/ui/RolloverLabel';
import WorkShowcaseCard from './WorkShowcaseCard';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Portfolio V2 Latest Work Showcase (`#v2-work`)
 * Masked display heading + sticky left index/details + counter-scaled right project cards.
 */
export default function LatestWorkSection({
  isDesktop,
  shouldReduceMotion,
  onScrollToSection,
}) {
  const { t, resolve } = useLanguage();
  const [activeWorkIdx, setActiveWorkIdx] = useState(0);
  const activeWork = selectedProjects[activeWorkIdx] || selectedProjects[0];

  return (
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
              lines={[t('v2.work.heading')]}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
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

              <nav aria-label={t('v2.work.indexAria')}>
                <ul className="space-y-2 text-[14px] font-medium tracking-[-0.02em]">
                  {selectedProjects.map((proj, idx) => {
                    const isCurrent = idx === activeWorkIdx;
                    return (
                      <li key={proj.id}>
                        <button
                          type="button"
                          onClick={() => onScrollToSection(`v2-work-item-${proj.id}`)}
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
                    {resolve(activeWork.subtitle)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-[12px] font-semibold uppercase tracking-[-0.02em]">
                    <RouterLink
                      to={`/study-case/${activeWork.id}`}
                      className="inline-flex items-center gap-1 text-[var(--v2-text)] hover:text-[var(--v2-accent)] transition-colors"
                    >
                      <span>{t('v2.common.caseStudy')}</span>
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
                isDesktop={isDesktop}
                shouldReduceMotion={shouldReduceMotion}
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
            <RolloverLabel text={t('v2.work.moreProjects')} />
            <FiArrowUpRight size={16} className="text-[var(--v2-accent)]" />
          </RouterLink>
        </div>
      </div>
    </section>
  );
}

LatestWorkSection.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool.isRequired,
  onScrollToSection: PropTypes.func.isRequired,
};
