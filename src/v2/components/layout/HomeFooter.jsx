import { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

import { siteConfig } from '@/config/site';
import { directEmail, contactChannelsData } from '@/data/contact';
import { RESUME_AVAILABLE, RESUME_URL, RESUME_FILENAME } from '@/data/resume';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import RolloverLabel from '../ui/RolloverLabel';

/**
 * Portfolio V2 Home Footer (`z-3` Dark Upper Footer + `z-0` Curtain-Sliding Bottom Accent Banner)
 */
export default function HomeFooter({
  isTabletUp,
  shouldReduceMotion,
  onScrollToSection,
}) {
  const { t } = useLanguage();
  const footerRef = useRef(null);
  const { scrollYProgress: footerProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const accentBannerY = useTransform(footerProgress, [0, 1], [-340, 0]);

  return (
    <footer ref={footerRef} className="relative bg-[var(--v2-bg)]">
      {/* Upper Dark Footer (`z-index: 3`, exact Nakula `.framer-11myxzf`) */}
      <div className="relative z-[3] bg-[var(--v2-bg)] border-t border-[var(--v2-border)]">
        <div className="v2-container pt-14 pb-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-5">
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="w-[82px] shrink-0 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                  (EMAIL)
                </span>
                <a
                  href={`mailto:${directEmail}`}
                  className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-accent)] hover:underline break-all"
                >
                  {directEmail}
                </a>
              </div>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="w-[82px] shrink-0 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                  (LOCATION)
                </span>
                <p className="text-[20px] sm:text-[24px] font-semibold tracking-[-0.04em] leading-none text-[var(--v2-text)]">
                  Bogor / Jakarta, ID
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              <div>
                <p className="mb-4 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                  (LINKS)
                </p>
                <ul className="space-y-2 text-[19px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                  <li>
                    <button
                      type="button"
                      onClick={() => onScrollToSection('v2-top')}
                      className="hover:text-[var(--v2-accent)] transition-colors"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onScrollToSection('v2-about')}
                      className="hover:text-[var(--v2-accent)] transition-colors"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onScrollToSection('v2-work')}
                      className="hover:text-[var(--v2-accent)] transition-colors"
                    >
                      Works
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onScrollToSection('v2-contact')}
                      className="hover:text-[var(--v2-accent)] transition-colors"
                    >
                      Contact
                    </button>
                  </li>
                  <li>
                    <RouterLink to="/study-case" className="hover:text-[var(--v2-accent)] transition-colors">
                      Case Studies
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/recruiter" className="hover:text-[var(--v2-accent)] transition-colors">
                      Recruiter
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/play" className="hover:text-[var(--v2-accent)] transition-colors">
                      3D World
                    </RouterLink>
                  </li>
                </ul>
              </div>

              <div>
                <p className="mb-4 text-[13px] uppercase tracking-[-0.03em] text-[var(--v2-text-dim)]">
                  (SOCIALS)
                </p>
                <ul className="space-y-2 text-[19px] font-medium tracking-[-0.03em] text-[var(--v2-text)]">
                  {contactChannelsData.map((channel) => (
                    <li key={channel.key}>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                      >
                        <span>{channel.name}</span>
                        <FiArrowUpRight size={15} className="text-[var(--v2-text-dim)]" />
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="https://www.npmjs.com/package/@ghifari29/id-kit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[var(--v2-accent)] transition-colors"
                    >
                      <span>npm</span>
                      <FiArrowUpRight size={15} className="text-[var(--v2-text-dim)]" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <p className="text-[15px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text)] max-w-[280px]">
                {t('v2.common.downloadCvDesc')}
              </p>

              <div className="border-b border-[var(--v2-border-strong)] pb-3 flex items-center justify-between text-[16px] text-[var(--v2-text-dim)]">
                <span className="truncate pr-3">{RESUME_FILENAME}</span>
                <span className="text-[12px] font-semibold uppercase text-[var(--v2-accent)]">PDF</span>
              </div>

              {RESUME_AVAILABLE && (
                <a
                  href={RESUME_URL}
                  download={RESUME_FILENAME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-pill-btn w-full !h-[52px] !text-[14px]"
                >
                  <RolloverLabel text={t('v2.common.downloadCv')} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
            <p className="uppercase">
              @{new Date().getFullYear()} {siteConfig.brandName}. ALL RIGHTS RESERVED
            </p>
            <p className="uppercase font-medium text-[var(--v2-text)]">
              ENGINEERED BY {siteConfig.brandName}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Accent Banner (`z-index: 0`, slides out `-340px -> 0px` from behind `z-3` Footer!) */}
      <div className="relative z-[0] overflow-hidden bg-[var(--v2-accent)]">
        <motion.div
          style={isTabletUp && !shouldReduceMotion ? { y: accentBannerY } : undefined}
          className="bg-[var(--v2-accent)] text-[var(--v2-accent-ink)] pt-24 pb-10 sm:pt-[100px] sm:pb-12 will-change-transform"
        >
          <div className="v2-container flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <p className="v2-display-heading !text-[var(--v2-accent-ink)] text-[clamp(4.75rem,15.5vw,13rem)] leading-[0.80]">
              {siteConfig.brandName}
              <span className="text-[0.28em] align-top ml-1 font-sans font-normal">®</span>
            </p>
            <p className="text-left sm:text-right text-[clamp(2.1rem,3.8vw,3.35rem)] font-semibold tracking-[-0.055em] leading-[0.96] text-[var(--v2-accent-ink)] max-w-[260px]">
              {t('v2.common.beyondVisualsTagline')}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

HomeFooter.propTypes = {
  isTabletUp: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool.isRequired,
  onScrollToSection: PropTypes.func.isRequired,
};
