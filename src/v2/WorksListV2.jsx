import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

import { allProjects } from '../data/projects';
import { siteConfig } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { updateDocumentMetadata, generateCaseStudyListSchema } from '../utils/seo';
import V2SubpageShell, { V2MaskedHeading, V2WorkGridCard } from './V2Chrome';

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
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const isEn = language === 'en';

  useEffect(() => {
    const title = isEn
      ? `Selected Works & Case Studies | ${siteConfig.name}`
      : `Semua Karya & Studi Kasus | ${siteConfig.name}`;
    const description = isEn
      ? `Explore software engineering projects, full-stack web applications, and open-source TypeScript packages by ${siteConfig.name}.`
      : `Jelajahi proyek rekayasa perangkat lunak, aplikasi web full-stack, dan library TypeScript open-source oleh ${siteConfig.name}.`;

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
  }, [isEn, language]);

  return (
    <V2SubpageShell scrollKey="works-list">
      <section className="relative z-[2] bg-[#0a0a0a] pt-[130px] pb-[100px] md:pt-[150px] md:pb-[150px]">
        <div className="v2-container flex flex-col gap-[56px] md:gap-[72px]">
          <V2MaskedHeading
            as="h1"
            lines={isEn ? ['SELECTED WORKS'] : ['SEMUA KARYA']}
            className="v2-section-heading"
            shouldReduceMotion={Boolean(shouldReduceMotion)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[56px] gap-x-[24px]">
            {allProjects.map((project, idx) => (
              <V2WorkGridCard
                key={project.id}
                project={project}
                index={idx}
                isEn={isEn}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            ))}
          </div>
        </div>
      </section>
    </V2SubpageShell>
  );
}
