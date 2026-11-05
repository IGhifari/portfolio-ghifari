import { useRef } from 'react';
import { motion, useScroll, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Journey = () => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const milestones = t('journey.milestones') || [];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 60%'],
  });

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
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.25 },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 03 / JOURNEY
          ================================================== */}
      <motion.div {...getFadeMotion(0)} className="mb-10 md:mb-16">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
            {t('journey.sectionTag')}
          </span>
          <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
        </div>
        <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
          {t('journey.heading')}<span className="text-[var(--accent)]">.</span>
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
          {t('journey.intro')}
        </p>
      </motion.div>

      {/* ==================================================
          CHRONOLOGICAL TIMELINE WITH ACCENT SCROLL PROGRESS
          ================================================== */}
      <div ref={containerRef} className="relative max-w-4xl mx-auto">
        {/* Background Rail Line */}
        <div
          className="absolute left-3.5 sm:left-7 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--border)] to-transparent"
          aria-hidden="true"
        />

        {/* Dynamic Scroll Progress Line */}
        <motion.div
          className="absolute left-3.5 sm:left-7 top-4 bottom-4 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--accent)] via-[var(--accent)] to-[var(--accent)]/10 shadow-[0_0_12px_1px_var(--accent)] origin-top"
          style={{
            scaleY: shouldReduceMotion ? 1 : scrollYProgress,
          }}
          aria-hidden="true"
        />

        {/* Timeline Milestones */}
        <ol className="relative space-y-8 sm:space-y-10 list-none p-0 m-0">
          {milestones.map((item, index) => (
            <motion.li
              key={item.number}
              {...getFadeMotion(index * 0.05)}
              className="relative pl-10 sm:pl-20 group"
            >
              {/* Timeline Node Indicator (latest milestone pulses as "current") */}
              <div
                className={`absolute left-3.5 sm:left-7 top-6 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-2 transition-all duration-200 flex items-center justify-center z-10 shadow-sm ${
                  index === milestones.length - 1
                    ? 'border-[var(--accent)] shadow-[0_0_12px_var(--accent)]'
                    : 'border-[var(--border)] group-hover:border-[var(--accent)]'
                }`}
                aria-hidden="true"
              >
                {index === milestones.length - 1 && !shouldReduceMotion && (
                  <span className="absolute -inset-1 rounded-full bg-[var(--accent)]/30 animate-ping" />
                )}
                <span
                  className={`relative rounded-full transition-transform duration-200 ${
                    index === milestones.length - 1
                      ? 'w-2 h-2 bg-[var(--accent)]'
                      : 'w-1.5 h-1.5 bg-[var(--accent)] group-hover:scale-125'
                  }`}
                />
              </div>

              {/* Milestone Content (Bento Card) */}
              <div className="relative space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 sm:p-7 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:border-[var(--border-hover)] group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.55)] overflow-hidden">
                {/* Top illuminated edge */}
                <span
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />

                {/* Subtle ambient radial glow on hover */}
                <div
                  className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 bg-[var(--accent)]/5 rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-0"
                  aria-hidden="true"
                />

                {/* Stage Number & Focus Category */}
                <div className="flex flex-wrap items-center gap-2.5 relative z-10">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] px-2.5 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border-subtle)] shadow-xs tracking-wider">
                    STAGE {item.number}
                  </span>
                  <span className="h-3 w-px bg-[var(--border)]" aria-hidden="true" />
                  <span className="font-mono text-[11px] sm:text-xs text-[var(--text-secondary)] tracking-wider uppercase font-semibold">
                    {item.focus}
                  </span>
                </div>

                {/* Stage Title */}
                <h3 className="font-grotesk font-black text-xl sm:text-2xl md:text-3xl text-[var(--text-primary)] uppercase tracking-tight leading-tight pt-1 relative z-10">
                  {item.stage}
                </h3>

                {/* Narrative Description */}
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal pt-1 relative z-10">
                  {item.description}
                </p>

                {/* Technical Highlights / Tags */}
                <div className="flex flex-wrap gap-2 pt-3 relative z-10">
                  {item.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="linear-tag-pill inline-flex items-center px-2.5 py-1 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-alt)]/80 border border-[var(--border-subtle)] rounded-md tracking-wide transition-colors hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-hover)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Journey;
