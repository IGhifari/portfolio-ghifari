import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useScroll, useTransform } from 'framer-motion';

import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';

/**
 * Sticky Horizontal Pan Process Track (`285vh` desktop track, clean grid fallback on tablet/mobile).
 */
export default function ProcessSection({ steps, isEn, isDesktop, shouldReduceMotion = false }) {
  const trackRef = useRef(null);
  const rowRef = useRef(null);
  const [maxPan, setMaxPan] = useState(640);

  useEffect(() => {
    if (typeof window === 'undefined' || !isDesktop || shouldReduceMotion) return undefined;

    const measurePan = () => {
      if (!rowRef.current) return;
      const rowWidth = rowRef.current.scrollWidth;
      const vw = window.innerWidth;
      setMaxPan(Math.max(0, rowWidth - vw + 48));
    };

    measurePan();
    window.addEventListener('resize', measurePan, { passive: true });
    return () => window.removeEventListener('resize', measurePan);
  }, [isDesktop, shouldReduceMotion, steps]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const horizontalX = useTransform(scrollYProgress, [0, 1], [0, -maxPan]);

  if (!isDesktop || shouldReduceMotion) {
    return (
      <section id="v2-experience" className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-32">
        <div className="v2-container mb-12">
          <div className="flex items-start justify-between gap-4">
            <MaskedDisplayHeading
              lines={isEn ? ['HOW I', 'WORK'] : ['JEJAK &', 'PROSES']}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
            <span className="v2-section-tag pt-1">
              ({isEn ? 'PROCESS' : 'PENGALAMAN'})
            </span>
          </div>
        </div>
        <div className="border-t border-b border-[var(--v2-border-strong)]">
          <div className="v2-container !px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--v2-border-strong)]">
              {steps.map((item) => (
                <article
                  key={item.step}
                  className="flex flex-col justify-between min-h-[360px] p-7 bg-[var(--v2-bg)]"
                >
                  <div className="space-y-1">
                    <p className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--v2-text-muted)]">
                      {item.step}
                      <span className="text-[var(--v2-accent)]">.</span>
                    </p>
                    <p className="text-[12px] font-medium uppercase text-[var(--v2-text-dim)]">
                      {item.period}
                    </p>
                  </div>
                  <div className="space-y-3 pt-14">
                    <h3 className="text-[34px] font-semibold tracking-[-0.055em] leading-[1.02] text-[var(--v2-text)]">
                      {item.title}
                    </h3>
                    <p className="text-[14px] font-semibold text-[var(--v2-accent)]">
                      {item.subtitle}
                    </p>
                    <p className="text-[15px] leading-[1.4] text-[var(--v2-text-muted)]">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="v2-experience"
      ref={trackRef}
      className="relative z-[2] h-[285vh] w-full bg-[var(--v2-bg)] overflow-x-clip"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <motion.div
          ref={rowRef}
          style={{ x: horizontalX }}
          className="flex items-center gap-14 px-6 will-change-transform"
        >
          {/* Left Intro Block (`530px` wide) */}
          <div className="relative w-[530px] shrink-0 h-[560px] flex flex-col justify-between py-2">
            <div className="flex items-start justify-between">
              <MaskedDisplayHeading
                lines={isEn ? ['HOW I', 'WORK'] : ['JEJAK &', 'PROSES']}
                className="v2-section-heading"
                shouldReduceMotion={shouldReduceMotion}
              />
              <span className="v2-section-tag pt-2">
                ({isEn ? 'PROCESS' : 'PENGALAMAN'})
              </span>
            </div>
            <p className="max-w-[360px] text-[20px] font-medium tracking-[-0.04em] leading-[1.2] text-[var(--v2-text-muted)]">
              {isEn
                ? 'Verified track record across industry internship, open-source engineering, and computer science education.'
                : 'Rekam jejak terverifikasi mulai dari magang industri, library open-source, hingga pendidikan informatika.'}
            </p>
          </div>

          {/* Right 4 Horizontal Step Cards (`360 x 560px` each) */}
          <div className="flex shrink-0 border-t border-b border-l border-[var(--v2-border-strong)]">
            {steps.map((item) => (
              <article
                key={item.step}
                className="w-[360px] h-[560px] shrink-0 border-r border-[var(--v2-border-strong)] p-8 flex flex-col justify-between bg-[var(--v2-bg)]"
              >
                <div className="space-y-1.5">
                  <p className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--v2-text-muted)]">
                    {item.step}
                    <span className="text-[var(--v2-accent)]">.</span>
                  </p>
                  <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]">
                    {item.period}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-[40px] font-semibold tracking-[-0.055em] leading-[1.02] text-[var(--v2-text)]">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--v2-accent)]">
                    {item.subtitle}
                  </p>
                  <p className="text-[16px] leading-[1.35] tracking-[-0.02em] text-[var(--v2-text-muted)]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

ProcessSection.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  isEn: PropTypes.bool.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool,
};
