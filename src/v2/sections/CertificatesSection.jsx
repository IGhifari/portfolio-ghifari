import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';

import { certificates } from '../../data/certificates';
import { useLanguage } from '../../context/LanguageContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import RolloverLabel from '../components/ui/RolloverLabel';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Portfolio V2 Interactive Archival Credentials Section
 * Asymmetric 12-column studio split:
 * - Left (5 cols): live crossfading document preview stage + certified skill pills + inspect trigger
 * - Right (7 cols): numbered `01.`–`04.` hairline credential ledger (hover/focus switches preview; click opens full-res studio lightbox with prev/next cycling)
 */
export default function CertificatesSection({ isEn: isEnProp }) {
  const { language, t } = useLanguage();
  const isEn = typeof isEnProp === 'boolean' ? isEnProp : language !== 'id';
  const shouldReduceMotion = useReducedMotion();

  const [hoveredIdx, setHoveredIdx] = useState(0);
  const [modalIdx, setModalIdx] = useState(null);

  const modalContainerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastTriggerRef = useRef(null);

  const activePreview = certificates[hoveredIdx] || certificates[0];
  const modalCert = modalIdx !== null ? certificates[modalIdx] : null;

  const openModal = useCallback((idx, triggerEl) => {
    lastTriggerRef.current =
      triggerEl || (typeof document !== 'undefined' ? document.activeElement : null);
    setHoveredIdx(idx);
    setModalIdx(idx);
  }, []);

  const closeModal = useCallback(() => {
    setModalIdx(null);
  }, []);

  const stepModal = useCallback((delta) => {
    setModalIdx((prev) => {
      if (prev === null) return null;
      const next = (prev + delta + certificates.length) % certificates.length;
      setHoveredIdx(next);
      return next;
    });
  }, []);

  useFocusTrap({
    isOpen: modalCert !== null,
    containerRef: modalContainerRef,
    initialFocusRef: closeBtnRef,
    triggerRef: lastTriggerRef,
    onClose: closeModal,
  });

  // Lock body scroll & enable Left/Right arrow cycling inside lightbox
  useEffect(() => {
    if (modalCert === null) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepModal(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepModal(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalCert, stepModal]);

  return (
    <section
      id="v2-certificates"
      aria-labelledby="v2-certificates-heading"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
    >
      <div className="v2-container space-y-16 sm:space-y-24">
        {/* 1. Nakula Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({isEn ? 'CREDENTIALS' : 'SERTIFIKASI'})
            </p>
            <div id="v2-certificates-heading">
              <MaskedDisplayHeading
                as="h2"
                lines={isEn ? ['VERIFIED', 'RECORDS'] : ['ARSIP', 'SERTIFIKAT']}
                lineClassNames={['md:pl-36 lg:pl-44', '']}
                className="v2-section-heading"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>
          </div>

          <p className="max-w-[380px] text-[20px] sm:text-[24px] font-medium tracking-[-0.045em] leading-[1.12] text-[var(--v2-text-muted)] lg:pb-2">
            {isEn
              ? 'Official internship completion, national competition recognition, and technical training records.'
              : 'Bukti resmi penyelesaian magang industri, kompetisi nasional, dan pelatihan teknis.'}
          </p>
        </div>

        {/* 2. Interactive Split-Stage Archival Ledger */}
        <div className="border-t border-b border-[var(--v2-border-strong)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Desktop Preview Stage (5 cols) */}
            <div className="hidden lg:flex lg:col-span-5 lg:border-r lg:border-[var(--v2-border-strong)] py-10 pr-10 flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[13px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                  <span>
                    ({isEn ? 'DOCUMENT PREVIEW' : 'PRATINJAU DOKUMEN'} · {activePreview.number})
                  </span>
                  <span className="text-[var(--v2-accent)] font-medium">
                    {activePreview.period}
                  </span>
                </div>

                {/* Framed Crossfading Certificate Preview */}
                <button
                  type="button"
                  onClick={(e) => openModal(hoveredIdx, e.currentTarget)}
                  aria-label={`${t('certificates.inspectAria')} ${activePreview.title}`}
                  className="group relative block w-full aspect-[16/10.5] overflow-hidden rounded-[10px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activePreview.id}
                      src={activePreview.image}
                      alt={`${activePreview.title} — ${activePreview.issuer}`}
                      loading="lazy"
                      decoding="async"
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, scale: 1.04 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                      transition={{ duration: 0.38, ease: NAKULA_EASE }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </AnimatePresence>

                  <div
                    className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/55 backdrop-blur-md px-4 py-2 text-[12px] font-semibold uppercase tracking-[-0.01em] text-white">
                      <FiMaximize2 size={13} />
                      <span>{isEn ? 'EXPAND FULL VIEW' : 'PERBESAR SERTIFIKAT'}</span>
                    </span>
                  </div>
                </button>
              </div>

              {/* Active Certificate Skills + Inspect CTA */}
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {activePreview.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--v2-border-strong)] px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] text-[var(--v2-text-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => openModal(hoveredIdx, e.currentTarget)}
                    className="v2-pill-btn !h-[48px] !px-6 !text-[13px]"
                  >
                    <RolloverLabel
                      text={isEn ? 'INSPECT CERTIFICATE' : 'LIHAT SERTIFIKAT'}
                    />
                    <FiArrowUpRight
                      size={15}
                      className="text-[var(--v2-accent)]"
                      aria-hidden="true"
                    />
                  </button>

                  {activePreview.credentialUrl && (
                    <a
                      href={activePreview.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="v2-pill-btn v2-pill-btn--accent !h-[48px] !px-6 !text-[13px]"
                    >
                      <RolloverLabel text={isEn ? 'VERIFY' : 'VERIFIKASI'} />
                      <FiArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Interactive Credential Ledger (7 cols desktop, full width mobile) */}
            <div className="lg:col-span-7 divide-y divide-[var(--v2-border-strong)]">
              {certificates.map((cert, idx) => {
                const isActive = hoveredIdx === idx;
                const localizedCategory = t(
                  `certificates.categories.${cert.category}`,
                  cert.category
                );

                return (
                  <div
                    key={cert.id}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    className={`transition-colors duration-300 ${
                      isActive ? 'lg:bg-[var(--v2-surface-elevated)]/65' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onFocus={() => setHoveredIdx(idx)}
                      onClick={(e) => openModal(idx, e.currentTarget)}
                      aria-label={`${t('certificates.inspectAria')} ${cert.title} — ${cert.issuer}`}
                      className="group w-full py-7 sm:py-9 lg:px-10 text-left flex flex-col gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--v2-accent)] cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-5 sm:gap-7 min-w-0">
                          <span
                            className={`pt-1 text-[16px] sm:text-[18px] font-semibold tracking-[-0.04em] tabular-nums transition-colors shrink-0 ${
                              isActive
                                ? 'text-[var(--v2-text-bright)]'
                                : 'text-[var(--v2-text-dim)] group-hover:text-[var(--v2-text)]'
                            }`}
                            aria-hidden="true"
                          >
                            {cert.number}
                            <span className="text-[var(--v2-accent)]">.</span>
                          </span>

                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]">
                              <span className="font-semibold text-[var(--v2-accent)]">
                                {cert.issuer}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{localizedCategory}</span>
                            </div>

                            <h3
                              className={`text-[22px] sm:text-[30px] font-semibold tracking-[-0.045em] leading-[1.08] transition-colors ${
                                isActive
                                  ? 'text-[var(--v2-text-bright)]'
                                  : 'text-[var(--v2-text)] group-hover:text-[var(--v2-text-bright)]'
                              }`}
                            >
                              {cert.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 pt-1">
                          <span className="hidden sm:inline-block text-[13px] font-medium tracking-[-0.02em] text-[var(--v2-text-dim)]">
                            {cert.period}
                          </span>
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                              isActive
                                ? 'border-[var(--v2-accent)] bg-[var(--v2-accent)] text-[var(--v2-accent-ink)]'
                                : 'border-[var(--v2-border-strong)] text-[var(--v2-text-muted)] group-hover:border-[var(--v2-accent)] group-hover:text-[var(--v2-text-bright)]'
                            }`}
                            aria-hidden="true"
                          >
                            <FiArrowUpRight size={17} />
                          </span>
                        </div>
                      </div>

                      {/* Mobile/Tablet Inline Thumbnail & Period */}
                      <div className="lg:hidden pl-10 sm:pl-12 space-y-3">
                        <div className="overflow-hidden rounded-[8px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] aspect-[16/10]">
                          <img
                            src={cert.image}
                            alt={`${cert.title} — ${cert.issuer}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {cert.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-[var(--v2-border-strong)] px-3 py-1 text-[11px] text-[var(--v2-text-muted)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Studio Full-Resolution Lightbox Modal (Focus-Trapped + Prev/Next Cycling) */}
      <AnimatePresence>
        {modalCert && (
          <motion.div
            key="v2-cert-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: NAKULA_EASE }}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="v2-cert-modal-title"
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/82 backdrop-blur-md p-4 sm:p-6 lg:p-10"
          >
            <motion.div
              ref={modalContainerRef}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.36, ease: NAKULA_EASE }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[92dvh] flex flex-col rounded-[14px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
            >
              {/* Modal Top Bar */}
              <div className="px-5 sm:px-7 py-4 border-b border-[var(--v2-border-strong)] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] uppercase tracking-[-0.01em] text-[var(--v2-accent)] font-semibold truncate">
                    ({modalCert.number} / {String(certificates.length).padStart(2, '0')}) ·{' '}
                    {modalCert.issuer} · {modalCert.period}
                  </p>
                  <h3
                    id="v2-cert-modal-title"
                    className="text-[18px] sm:text-[22px] font-semibold tracking-[-0.035em] text-[var(--v2-text-bright)] truncate"
                  >
                    {modalCert.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepModal(-1)}
                    aria-label={isEn ? 'Previous certificate' : 'Sertifikat sebelumnya'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                  >
                    <FiArrowLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepModal(1)}
                    aria-label={isEn ? 'Next certificate' : 'Sertifikat berikutnya'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                  >
                    <FiArrowRight size={16} aria-hidden="true" />
                  </button>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={closeModal}
                    aria-label={t('certificates.modalCloseAria')}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-text-dim)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                  >
                    <FiX
                      size={17}
                      className="transition-transform duration-300 group-hover:rotate-90"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              {/* Modal Document Viewport */}
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-[var(--v2-bg-elevated)]"
              >
                <img
                  src={modalCert.image}
                  alt={`${modalCert.title} full certificate view`}
                  loading="eager"
                  decoding="async"
                  className="max-h-[68dvh] w-auto max-w-full object-contain rounded-[8px] border border-[var(--v2-border)] shadow-2xl"
                />
              </div>

              {/* Modal Bottom Bar */}
              <div className="px-5 sm:px-7 py-3.5 border-t border-[var(--v2-border-strong)] flex flex-wrap items-center justify-between gap-3 text-[12px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {modalCert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--v2-border-strong)] px-3 py-0.5 text-[11px] text-[var(--v2-text-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <span>
                  {isEn
                    ? 'Use ← / → keys to switch · Esc to close'
                    : 'Gunakan ← / → untuk pindah · Esc untuk tutup'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

CertificatesSection.propTypes = {
  isEn: PropTypes.bool,
};
