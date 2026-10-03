import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0, yOffset = 20) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: yOffset },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  const focusAreas = t('about.focusAreas') || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* Editorial Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Section Label & Primary Statement */}
        <div className="lg:col-span-5">
          <motion.div {...getFadeMotion(0)}>
            {/* Section Tag */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
                {t('about.sectionTag')}
              </span>
              <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
            </div>

            {/* Heading */}
            <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
              {t('about.heading')}<span className="text-[var(--accent)]">.</span>
            </h2>

            {/* Editorial Statement */}
            <p className="font-grotesk font-bold text-xl sm:text-2xl text-[var(--text-primary)] leading-snug mt-6">
              {t('about.statement')}
            </p>

            {/* Technical Metadata Card */}
            <div className="mt-8 p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">{t('about.metaRoleLabel')}</span>
                <span className="text-[var(--text-primary)] font-semibold">{t('about.metaRoleValue')}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">{t('about.metaLocationLabel')}</span>
                <span className="text-[var(--text-secondary)]">{t('about.metaLocationValue')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">{t('about.metaStatusLabel')}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('about.metaStatusValue')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Detailed Narrative & Focus Areas */}
        <div className="lg:col-span-7 space-y-8">
          {/* Narrative Paragraphs */}
          <motion.div {...getFadeMotion(0.1)} className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
          </motion.div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-[var(--border-subtle)]" aria-hidden="true" />

          {/* Core Focus Areas */}
          <motion.div {...getFadeMotion(0.2)}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <h3 className="font-mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase font-semibold">
                {t('about.focusHeader')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {focusAreas.map((area, index) => (
                <motion.div
                  key={area.title}
                  {...getFadeMotion(0.25 + index * 0.05, 12)}
                  className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
                >
                  <h4 className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)]">
                    {area.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5">
                    {area.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
