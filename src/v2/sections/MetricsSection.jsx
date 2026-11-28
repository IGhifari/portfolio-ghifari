import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'framer-motion';

import { allProjects } from '@/data/projects';
import { techCategoriesData } from '@/data/skills';
import { useLanguage } from '@/context/LanguageContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import CountUpMetricCell from '../components/ui/CountUpMetricCell';

const TOTAL_SKILLS_COUNT = techCategoriesData.reduce(
  (acc, category) => acc + category.skills.length,
  0
);

/**
 * Portfolio V2 Metrics Strip (`#v2-metrics`, "NUMBERS DON'T LIE")
 * Masked display heading + staggered count-up 4-column metric grid.
 */
export default function MetricsSection({ shouldReduceMotion }) {
  const { t } = useLanguage();
  const metricsGridRef = useRef(null);
  const isMetricsInView = useInView(metricsGridRef, { once: true, amount: 0.25 });

  const headingLines = t('v2.metrics.headingLines');
  const metricsData = [
    {
      numeral: String(allProjects.length),
      suffix: '+',
      label: t('v2.metrics.projectsLabel'),
    },
    {
      numeral: '509',
      suffix: '+',
      label: t('v2.metrics.testsLabel'),
    },
    {
      numeral: '100',
      suffix: '%',
      label: t('v2.metrics.accessibilityLabel'),
    },
    {
      numeral: String(TOTAL_SKILLS_COUNT),
      suffix: '+',
      label: t('v2.metrics.skillsLabel'),
    },
  ];

  return (
    <section
      id="v2-metrics"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
    >
      <div className="v2-container space-y-16 sm:space-y-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({t('v2.metrics.tag')})
            </p>
            <MaskedDisplayHeading
              lines={Array.isArray(headingLines) ? headingLines : []}
              lineClassNames={['md:pl-28 lg:pl-36', '']}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>

          <p className="max-w-[360px] text-[20px] sm:text-[24px] font-medium tracking-[-0.045em] leading-[1.12] text-[var(--v2-text-muted)] lg:pb-2">
            {t('v2.metrics.intro')}
          </p>
        </div>

        {/* Level 4-Column Desktop / 2x2 Mobile Metric Strip with Staggered Rise & Count-Up */}
        <div
          ref={metricsGridRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 items-stretch"
        >
          {metricsData.map((stat, idx) => (
            <CountUpMetricCell
              key={stat.label}
              target={stat.numeral}
              suffix={stat.suffix}
              label={stat.label}
              index={idx}
              isTriggered={isMetricsInView}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

MetricsSection.propTypes = {
  shouldReduceMotion: PropTypes.bool.isRequired,
};
