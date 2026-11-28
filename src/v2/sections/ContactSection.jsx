import { lazy, Suspense, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiCheck, FiCopy } from 'react-icons/fi';

import { directEmail } from '@/data/contact';
import { useLanguage } from '@/context/LanguageContext';
import { useClipboardCopy } from '../hooks/useClipboardCopy';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';

const ContactFormV2 = lazy(() => import('./ContactFormSection'));

/**
 * Portfolio V2 Pre-Footer Contact CTA & Inquiry Section (`#v2-contact`)
 * Parallax spotlight + masked heading + clipboard copy + lazy inquiry form.
 */
export default function ContactSection({ shouldReduceMotion }) {
  const { t } = useLanguage();
  const ctaSectionRef = useRef(null);
  const { copied: copiedEmail, copy: copyToClipboard } = useClipboardCopy(2200);

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ['start end', 'end start'],
  });
  const ctaSpotlightY = useTransform(ctaProgress, [0, 1], [0, 72]);

  const handleCopyEmail = useCallback(() => {
    copyToClipboard(directEmail);
  }, [copyToClipboard]);

  const headingLines = t('v2.contact.headingLines');

  return (
    <section
      id="v2-contact"
      ref={ctaSectionRef}
      className="relative z-[2] overflow-hidden bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
    >
      {/* Downward Parallax Spotlight Layer (`translateY 0 -> 72px`, exact Nakula `.framer-1t4kn25`) */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: ctaSpotlightY }}
        className="v2-cta-spotlight pointer-events-none absolute -inset-y-20 inset-x-0 will-change-transform"
      />

      <div className="v2-container relative z-10 space-y-16 sm:space-y-24">
        {/* Top Nakula Editorial Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-7 relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({t('v2.contact.tag')})
            </p>
            <MaskedDisplayHeading
              lines={Array.isArray(headingLines) ? headingLines : []}
              lineClassNames={['md:pl-28 lg:pl-36', '']}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pb-2">
            <p className="text-[20px] sm:text-[24px] font-medium tracking-[-0.04em] leading-[1.2] text-[var(--v2-text-muted)] max-w-md">
              {t('v2.contact.homeIntro')}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label={t('v2.common.copyEmailAria')}
                className="v2-pill-btn !h-[48px] !px-5 !text-[13px]"
              >
                {copiedEmail ? (
                  <>
                    <FiCheck size={14} className="text-[#47c554]" />
                    <span>{t('v2.common.emailCopied')}</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={14} />
                    <span>{t('v2.common.copyEmail')}</span>
                  </>
                )}
              </button>

              <span className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.02em] text-[var(--v2-text-muted)] pl-1">
                <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
                <span>{t('v2.contact.openForOpportunities')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Asymmetric 2-Column Editorial Inquiry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-6 lg:pt-2">
            <div className="space-y-2">
              <p className="text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                ({t('v2.contact.directEmailLabel')})
              </p>
              <a
                href={`mailto:${directEmail}`}
                className="inline-block text-[22px] sm:text-[26px] font-semibold tracking-[-0.045em] leading-[1.1] text-[var(--v2-text)] hover:text-[var(--v2-accent)] transition-colors break-all"
              >
                {directEmail}
              </a>
            </div>

            <div className="space-y-1.5 text-[15px] tracking-[-0.02em] text-[var(--v2-text-muted)]">
              <p className="text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                ({t('v2.contact.baseLabel')})
              </p>
              <p>Bogor / Jakarta, Indonesia (GMT+7)</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Suspense
              fallback={
                <div className="border-t border-[var(--v2-border-strong)] divide-y divide-[var(--v2-border-strong)]">
                  {[0, 1, 2, 3].map((row) => (
                    <div key={row} className="py-7">
                      <div className="h-7 w-2/3 rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
                    </div>
                  ))}
                </div>
              }
            >
              <ContactFormV2 />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

ContactSection.propTypes = {
  shouldReduceMotion: PropTypes.bool.isRequired,
};
