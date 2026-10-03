import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiMaximize2, FiX, FiExternalLink, FiCalendar } from 'react-icons/fi';
import { certificates } from '../data/certificates';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Certificate.css';

const Certificate = () => {
  const [activeCert, setActiveCert] = useState(null);
  const { t } = useLanguage();

  // Close modal handler
  const closeModal = useCallback(() => {
    setActiveCert(null);
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeCert) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCert, closeModal]);

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
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* Section Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 md:mb-16"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
            {t('certificates.sectionTag')}
          </span>
          <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
            {t('certificates.subTag')}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] uppercase">
            {t('certificates.heading')}<span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {t('certificates.intro')}
          </p>
        </div>
      </motion.header>

      {/* Certificates Grid: Responsive 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {certificates.map((cert, index) => (
          <motion.article
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="cert-card rounded-lg overflow-hidden flex flex-col justify-between group"
          >
            {/* Top: Image Preview Container with Inspect Trigger */}
            <div
              className="cert-image-container aspect-[16/10] w-full relative cursor-pointer"
              onClick={() => setActiveCert(cert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCert(cert);
                }
              }}
              aria-label={`${t('certificates.inspectAria')} ${cert.title}`}
            >
              <img
                src={cert.image}
                alt={`${cert.title} awarded by ${cert.issuer}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Gradient Scrim & Category Indicator */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--surface-muted)] via-transparent to-transparent opacity-80"
                aria-hidden="true"
              />

              {/* Number Tag & Category Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-muted)]/90 text-[var(--accent)] border border-[var(--border)] backdrop-blur-sm">
                  {"// "}{cert.number}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--surface-alt)]/90 text-[var(--text-secondary)] border border-[var(--border-subtle)] backdrop-blur-sm uppercase">
                  {t(`certificates.categories.${cert.category}`, cert.category)}
                </span>
              </div>

              {/* Hover Inspect Action Prompt */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-hover)] text-[var(--text-primary)] font-mono text-xs tracking-wider backdrop-blur-sm shadow-lg">
                  <FiMaximize2 size={13} className="text-[var(--accent)]" />
                  {t('certificates.previewFull')}
                </span>
              </div>
            </div>

            {/* Bottom: Metadata & Details */}
            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                  <span className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
                    <FiAward size={13} aria-hidden="true" />
                    {cert.issuer}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar size={12} aria-hidden="true" />
                    {cert.period}
                  </span>
                </div>

                <h3 className="font-grotesk font-bold text-lg sm:text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {cert.title}
                </h3>

                {/* Skills / Focus Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Skills certified">
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--tag-bg)] border border-[var(--tag-border)] text-[var(--tag-text)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCert(cert)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] py-1 rounded cursor-pointer"
                >
                  <FiMaximize2 size={12} aria-hidden="true" />
                  <span>{t('certificates.viewCert')}</span>
                </button>

                {cert.credentialUrl ? (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[var(--accent)] hover:underline"
                  >
                    <span>{t('certificates.verifyCred')}</span>
                    <FiExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {t('certificates.archivalCopy')}
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Accessible Lightbox Modal */}
      <AnimatePresence>
        {activeCert && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 cert-modal-backdrop"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="cert-modal-container max-w-4xl w-full rounded-lg flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)] gap-4">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider block">
                    {activeCert.issuer} · {activeCert.period}
                  </span>
                  <h3
                    id="cert-modal-title"
                    className="font-grotesk font-bold text-base sm:text-lg text-[var(--text-primary)] truncate"
                  >
                    {activeCert.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-pointer shrink-0"
                  aria-label={t('certificates.modalCloseAria')}
                >
                  <FiX size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">{t('certificates.modalClose')}</span>
                </button>
              </div>

              {/* Modal Body: Image View */}
              <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-[var(--bg-primary)]">
                <img
                  src={activeCert.image}
                  alt={`${activeCert.title} full certificate view`}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded border border-[var(--border-subtle)] shadow-md"
                />
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span className="truncate">
                  {t('certificates.modalCategory')}{' '}
                  <strong className="text-[var(--text-secondary)] font-normal">
                    {t(`certificates.categories.${activeCert.category}`, activeCert.category)}
                  </strong>
                </span>
                <span className="text-[var(--text-muted)]">{t('certificates.modalDismiss')}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Certificate;
