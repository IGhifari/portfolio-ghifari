import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';

import { useLanguage } from '@/context/LanguageContext';
import { RouterLink, useRouter } from '@/context/RouterContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';

const NAKULA_EASE = [0.22, 1, 0.36, 1];
const SERVICES_EASE = [0.4, 0, 0.2, 1];

const CAPABILITY_METADATA = [
  {
    number: '01',
    tags: ['React 18', 'Next.js 15', 'TypeScript', 'WCAG 2.1 AA'],
    image: '/images/projects/akseskita.webp',
    featuredProject: 'AksesKita',
    featuredSlug: 'akseskita',
  },
  {
    number: '02',
    tags: ['Node.js & Express', 'Laravel', 'REST API', 'Auth & RBAC'],
    image: '/images/projects/project_management.webp',
    featuredProject: 'Project Management System',
    featuredSlug: 'project-management',
  },
  {
    number: '03',
    tags: ['PostgreSQL', 'Prisma ORM', 'tsup (ESM/CJS)', 'Vitest CI'],
    image: '/images/projects/id-kit.webp',
    featuredProject: '@ghifari29/id-kit',
    featuredSlug: 'id-kit',
  },
  {
    number: '04',
    tags: ['Gemini API', 'BullMQ + Redis', 'Three.js / WebGL', 'Framer Motion'],
    image: '/images/projects/studyflow.webp',
    featuredProject: 'StudyFlow',
    featuredSlug: 'studyflow',
  },
];

/**
 * Portfolio V2 Services / Capabilities Section (`#v2-capabilities`)
 * Desktop: pure hover-expand 3-column morph row (`156px -> 436px`).
 * Mobile/Tablet: clean touch accordion fallback.
 */
export default function CapabilitiesSection({
  isDesktop,
  shouldReduceMotion,
  surfaceElevatedBg,
  defaultBg,
}) {
  const { t } = useLanguage();
  const { navigate } = useRouter();
  const [openCapabilityIdx, setOpenCapabilityIdx] = useState(-1);
  const capabilityLeaveTimerRef = useRef(null);

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
    if (!isDesktop) return;
    if (capabilityLeaveTimerRef.current) {
      clearTimeout(capabilityLeaveTimerRef.current);
    }
    capabilityLeaveTimerRef.current = setTimeout(() => {
      setOpenCapabilityIdx(-1);
      capabilityLeaveTimerRef.current = null;
    }, 140);
  }, [isDesktop]);

  const translatedItems = t('v2.capabilities.items');
  const capabilities = CAPABILITY_METADATA.map((meta, idx) => ({
    ...meta,
    title: translatedItems?.[idx]?.title || '',
    summary: translatedItems?.[idx]?.summary || '',
  }));

  return (
    <section
      id="v2-capabilities"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
    >
      <div className="v2-container mb-16 sm:mb-24 flex justify-center">
        <div className="inline-flex items-start">
          <MaskedDisplayHeading
            lines={[t('v2.capabilities.heading')]}
            className="v2-section-heading text-center"
            shouldReduceMotion={shouldReduceMotion}
          />
          <span className="hidden sm:inline-block ml-3 mt-1 v2-section-tag">
            ({t('v2.capabilities.tag')})
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
                  backgroundColor: isOpen ? surfaceElevatedBg : defaultBg,
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
  );
}

CapabilitiesSection.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool.isRequired,
  surfaceElevatedBg: PropTypes.string.isRequired,
  defaultBg: PropTypes.string.isRequired,
};
