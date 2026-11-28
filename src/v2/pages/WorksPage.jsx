import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

import { allProjects } from '@/data/projects';
import { useLanguage } from '@/context/LanguageContext';
import { updateDocumentMetadata, generateCaseStudyListSchema } from '@/utils/seo';
import V2SubpageShell, { V2WorkGridCard } from '../components/layout/V2Chrome';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import { useV2TransitionState } from '../components/motion/openingState';

/**
 * Portfolio V2 — All Works Page (`/study-case` when `portfolioVersion !== '1'`)
 * Exact 1:1 visual & structural reconstruction of `https://nakula.framer.website/works`:
 * - Fixed compact navbar (`120x36` small wordmark)
 * - Section 1: `padding: 150px 24px`, `max-width: 1400px`, `gap: 72px`
 *   * Oversized `Anton 140px` `"OUR WORKS"` / `"SELECTED WORKS"` heading (no filter clutter)
 *   * 2-column project grid (`gap: 56px 24px`) with `scale(0.92)` mask / `scale(1.09)` inner counter-scale hover + `"VIEW PROJECT ↗"` cursor pill
 * - Section 2 & 3: `"LET'S WORK TOGETHER"` CTA + Nakula Footer
 */
export default function WorksListV2() {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { subpageRevealReady, openingCompleted } = useV2TransitionState();
  const isHeroReady = Boolean(
    shouldReduceMotion || (openingCompleted && subpageRevealReady)
  );

  useEffect(() => {
    const title = t('v2.works.seoTitle');
    const description = t('v2.works.seoDescription');

    updateDocumentMetadata({
      title,
      description,
      canonicalPath: '/study-case',
      ogTitle: title,
      ogDescription: description,
      ogImage: '/portfolio.png',
      schemaData: generateCaseStudyListSchema(allProjects, language),
      lang: language,
    });
  }, [language, t]);

  return (
    <V2SubpageShell scrollKey="works-list">
      <section className="relative z-[2] bg-[var(--v2-bg)] pt-[130px] pb-[100px] md:pt-[150px] md:pb-[150px]">
        <div className="v2-container flex flex-col gap-[56px] md:gap-[72px]">
          <MaskedDisplayHeading
            as="h1"
            lines={[t('v2.works.heading')]}
            className="v2-section-heading"
            shouldReduceMotion={Boolean(shouldReduceMotion)}
            reveal={isHeroReady}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[56px] gap-x-[24px]">
            {allProjects.map((project, idx) => (
              <V2WorkGridCard
                key={project.id}
                project={project}
                index={idx}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
                reveal={idx < 2 ? isHeroReady : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    </V2SubpageShell>
  );
}
