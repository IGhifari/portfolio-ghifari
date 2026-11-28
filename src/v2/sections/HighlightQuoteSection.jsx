import { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform } from 'framer-motion';

import { siteConfig } from '@/config/site';
import { profileData } from '@/data/profile';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';

/**
 * Portfolio V2 Highlight Quote Section
 * Animated 1px divider + profile signature + scroll zoom-out (`1.15 -> 1.0`) right studio frame.
 */
export default function HighlightQuoteSection({ shouldReduceMotion }) {
  const { t } = useLanguage();
  const highlightImgRef = useRef(null);
  const { scrollYProgress: highlightProgress } = useScroll({
    target: highlightImgRef,
    offset: ['start end', 'center center'],
  });
  const highlightImgScale = useTransform(highlightProgress, [0, 1], [1.15, 1]);

  return (
    <section className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-[150px]">
      <div className="v2-container">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-[120px]">
          {/* Left Quote Column (`min-width: 55%`) */}
          <div className="w-full lg:w-[55%] space-y-12">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -top-2 left-0 text-[64px] sm:text-[80px] font-semibold leading-none text-[var(--v2-accent)] select-none"
              >
                “
              </span>
              <blockquote className="text-[32px] sm:text-[48px] xl:text-[56px] font-semibold tracking-[-0.06em] leading-[1.02] indent-12 sm:indent-20">
                <span className="text-[var(--v2-text)]">
                  {t('v2.highlight.quoteLead')}
                </span>
                <span className="text-[var(--v2-text-dim)]">
                  {t('v2.highlight.quoteTail')}
                </span>
              </blockquote>
            </div>

            {/* Animated 1px Divider Line (Exact Nakula 1s cubic-bezier(0.4, 0, 0.2, 1)) */}
            <div className="w-full overflow-hidden">
              <motion.div
                initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.0, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: 'left center' }}
                className="h-[1px] w-full bg-[var(--v2-border-strong)]"
              />
            </div>

            <div className="flex items-center gap-5">
              <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)]">
                <img
                  src={profileData.avatarImage}
                  alt={siteConfig.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-[51%_60%] scale-[2.4]"
                />
              </div>
              <div>
                <p className="text-[24px] font-semibold tracking-[-0.04em] leading-tight text-[var(--v2-text)]">
                  {siteConfig.name}
                </p>
                <p className="text-[16px] text-[var(--v2-text-dim)] mt-0.5">
                  {t('v2.highlight.roleSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Studio Frame with Scroll Zoom-Out (`1.15 -> 1.0`) */}
          <div ref={highlightImgRef} className="w-full lg:flex-1">
            <RouterLink
              to="/study-case/project-management"
              className="block overflow-hidden rounded-[14px] border border-[var(--v2-border)] bg-[var(--v2-surface)] aspect-[4/4.4]"
            >
              <motion.img
                src="/images/projects/project_management.webp"
                alt="Project Management System"
                loading="lazy"
                style={shouldReduceMotion ? undefined : { scale: highlightImgScale }}
                className="h-full w-full object-cover object-top will-change-transform"
              />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  );
}

HighlightQuoteSection.propTypes = {
  shouldReduceMotion: PropTypes.bool.isRequired,
};
