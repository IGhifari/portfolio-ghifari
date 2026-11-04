import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiAward,
  FiX,
  FiClock,
  FiExternalLink,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { RouterLink } from '../context/RouterContext';
import { experiences } from '../data/experience';

const Experience = () => {
  const [activeCert, setActiveCert] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const { language, t } = useLanguage();

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-50px' },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  const modalContainerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastTriggerRef = useRef(null);

  const closeModal = useCallback(() => {
    setActiveCert(null);
  }, []);

  const openCertModal = useCallback((cert, triggerEl) => {
    lastTriggerRef.current = triggerEl || (typeof document !== 'undefined' ? document.activeElement : null);
    setActiveCert(cert);
  }, []);

  // Trap focus inside modal, manage initial focus, Escape key, and restore focus on close
  useFocusTrap({
    isOpen: Boolean(activeCert),
    containerRef: modalContainerRef,
    initialFocusRef: closeBtnRef,
    triggerRef: lastTriggerRef,
    onClose: closeModal,
  });

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeCert) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeCert]);

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 03 / WORK EXPERIENCE
          ================================================== */}
      <motion.header {...getFadeMotion(0)} className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
            {t('experience.sectionTag')}
          </span>
          <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
            {t('experience.subTag')}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] uppercase leading-none">
            {t('experience.heading')}<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {t('experience.intro')}
          </p>
        </div>
      </motion.header>

      {/* ==================================================
          EXPERIENCE CARDS LIST
          ================================================== */}
      <div className="space-y-8">
        {experiences.map((exp, index) => {
          const roleTitle = exp.role[language] || exp.role.en;
          const locationText = exp.location[language] || exp.location.en;
          const periodText = exp.period[language] || exp.period.en;
          const durationText = exp.duration[language] || exp.duration.en;
          const typeText = exp.type[language] || exp.type.en;
          const descriptionText = exp.description[language] || exp.description.en;
          const responsibilitiesList =
            exp.responsibilities[language] || exp.responsibilities.en;

          return (
            <motion.article
              key={exp.id}
              {...getFadeMotion(index * 0.1)}
              className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--border)] rounded-lg p-6 sm:p-8 md:p-10 transition-colors space-y-6 sm:space-y-8"
            >
              {/* Header: Role, Organization, and Metadata Badges */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[var(--accent)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] tracking-wider uppercase">
                      {typeText}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] tracking-wider">
                      {exp.badge}
                    </span>
                  </div>

                  <h3 className="font-grotesk font-black text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
                    {roleTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <FiBriefcase className="text-[var(--accent)] shrink-0" size={15} aria-hidden="true" />
                      {exp.company}
                    </span>
                    {exp.companyShort && (
                      <span className="text-[var(--text-muted)] text-xs">
                        ({exp.companyShort})
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Column: Period, Duration, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 font-mono text-xs text-[var(--text-secondary)] lg:text-right shrink-0">
                  <div className="flex items-center lg:justify-end gap-2">
                    <FiCalendar className="text-[var(--accent)] shrink-0" size={14} aria-hidden="true" />
                    <span>{periodText}</span>
                  </div>
                  <div className="flex items-center lg:justify-end gap-2">
                    <FiClock className="text-[var(--text-muted)] shrink-0" size={14} aria-hidden="true" />
                    <span className="text-[var(--text-muted)]">{durationText}</span>
                  </div>
                  <div className="flex items-center lg:justify-end gap-2">
                    <FiMapPin className="text-[var(--accent)] shrink-0" size={14} aria-hidden="true" />
                    <span>{locationText}</span>
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {descriptionText}
              </p>

              {/* Responsibilities & Technical Contributions */}
              <div className="space-y-3 pt-2">
                <h4 className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
                  {t('experience.responsibilitiesHeader')}
                </h4>
                <ul className="space-y-2.5 list-none p-0 m-0">
                  {responsibilitiesList.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-3 font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                    >
                      <FiCheckCircle
                        className="text-[var(--accent)] shrink-0 mt-1"
                        size={15}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies Applied */}
              <div className="space-y-3 pt-2">
                <h4 className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
                  {t('experience.techHeader')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-xs px-3 py-1 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Credential & Case Study Footer */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  <FiAward className="text-[var(--accent)] shrink-0" size={16} aria-hidden="true" />
                  <span>{t('experience.credentialVerified')}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <RouterLink
                    to="/study-case/project-management"
                    data-cursor-label="Project"
                    className="cursor-target inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--accent)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] self-start sm:self-auto"
                  >
                    <span>{language === 'id' ? 'Studi Kasus Proyek Magang' : 'Internship Case Study'}</span>
                    <FiExternalLink size={13} aria-hidden="true" />
                  </RouterLink>

                  {exp.certificate && (
                    <button
                      type="button"
                      onClick={(e) => openCertModal(exp.certificate, e.currentTarget)}
                      data-cursor-label="Certificate"
                      className="cursor-target inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-mono font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] self-start sm:self-auto"
                    >
                      <FiAward size={14} aria-hidden="true" />
                      <span>{t('experience.viewCertificate')}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* ==================================================
          CERTIFICATE PREVIEW MODAL
          ================================================== */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={activeCert.title}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeCurve }}
              className="relative w-full max-w-3xl bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block font-semibold">
                    {t('experience.verifiedBadge')}
                  </span>
                  <h3 className="font-grotesk font-bold text-lg sm:text-xl text-[var(--text-primary)]">
                    {activeCert.title}
                  </h3>
                  <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                    {activeCert.issuer} · {activeCert.period}
                  </p>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  aria-label={t('experience.closeModal')}
                  data-cursor-label="Close"
                  className="cursor-target p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiX size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Certificate Image Preview */}
              <div className="w-full rounded border border-[var(--border-subtle)] overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={activeCert.image}
                  alt={activeCert.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                  loading="lazy"
                />
              </div>

              {/* Skills and Direct Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {activeCert.skills?.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <a
                  href={activeCert.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="Open"
                  className="cursor-target inline-flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] hover:underline self-end sm:self-auto"
                >
                  <span>Open Full Image</span>
                  <FiExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default Experience;
