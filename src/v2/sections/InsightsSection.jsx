import PropTypes from 'prop-types';
import { FiArrowUpRight } from 'react-icons/fi';

import { selectedProjects } from '@/data/projects';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import RolloverLabel from '../components/ui/RolloverLabel';

const FEATURED_CASE_STUDIES = [
  selectedProjects[5], // StudyFlow
  selectedProjects[2], // @ghifari29/id-kit
  selectedProjects[0], // AksesKita
].filter(Boolean);

/**
 * Portfolio V2 Latest Insights / Case Studies Section (`#v2-insights`)
 * Masked display heading + 3-card asymmetric grid.
 */
export default function InsightsSection({ shouldReduceMotion }) {
  const { t, resolve } = useLanguage();

  return (
    <section
      id="v2-insights"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px]"
    >
      <div className="v2-container space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="inline-flex items-start">
            <MaskedDisplayHeading
              lines={[t('v2.insights.heading')]}
              className="v2-section-heading"
              shouldReduceMotion={shouldReduceMotion}
            />
            <span className="hidden sm:inline-block ml-3 mt-1 v2-section-tag">
              ({t('v2.insights.tag')})
            </span>
          </div>

          <RouterLink
            to="/study-case"
            className="v2-pill-btn !min-w-[180px] !py-3.5 justify-between !text-[var(--v2-accent)] hover:!border-[var(--v2-accent)]"
          >
            <RolloverLabel text={t('v2.common.seeAll')} />
            <FiArrowUpRight size={16} />
          </RouterLink>
        </div>

        {FEATURED_CASE_STUDIES.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Featured Card (50%) */}
            <RouterLink
              to={`/study-case/${FEATURED_CASE_STUDIES[0].id}`}
              className="group relative lg:col-span-6 min-h-[420px] lg:min-h-[540px] overflow-hidden rounded-[12px] border border-[var(--v2-border)] bg-[#121212] flex flex-col justify-between p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
            >
              <img
                src={FEATURED_CASE_STUDIES[0].image}
                alt={FEATURED_CASE_STUDIES[0].title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/45 to-[#0a0a0a]/20"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-[#e6e6e6]/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--v2-bg)]">
                  {resolve(FEATURED_CASE_STUDIES[0].category)}
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[#a4a4a4]">
                  CASE STUDY · {FEATURED_CASE_STUDIES[0].number}
                </p>
                <h3 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.045em] leading-[1.08] text-white group-hover:text-[var(--v2-accent)] transition-colors">
                  {FEATURED_CASE_STUDIES[0].title} —{' '}
                  {resolve(FEATURED_CASE_STUDIES[0].subtitle)}
                </h3>
              </div>
            </RouterLink>

            {/* Right 2 Secondary Cards (50%) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED_CASE_STUDIES.slice(1).map((study) => (
                <RouterLink
                  key={study.id}
                  to={`/study-case/${study.id}`}
                  className="group rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] p-3 flex flex-col justify-between gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[8px] bg-[var(--v2-surface-elevated)]">
                    <img
                      src={study.image}
                      alt={study.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-3 left-3 inline-block rounded-full bg-[#e6e6e6]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.02em] text-[var(--v2-bg)]">
                      {resolve(study.category)}
                    </span>
                  </div>

                  <div className="px-2 pb-3 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-[12px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]">
                      CASE STUDY · {study.number}
                    </p>
                    <div className="space-y-2">
                      <h3 className="text-[22px] font-semibold tracking-[-0.04em] leading-[1.12] text-[var(--v2-text)] group-hover:text-[var(--v2-accent)] transition-colors">
                        {study.title} — {resolve(study.subtitle)}
                      </h3>
                      <p className="text-[14px] leading-[1.4] text-[var(--v2-text-dim)] line-clamp-2">
                        {resolve(study.details?.architecture)}
                      </p>
                    </div>
                  </div>
                </RouterLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

InsightsSection.propTypes = {
  shouldReduceMotion: PropTypes.bool.isRequired,
};
