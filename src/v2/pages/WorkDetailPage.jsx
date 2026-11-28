import { Fragment, Suspense, lazy, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

import { allProjects, getProjectBySlug } from '@/data/projects';
import { profileData } from '@/data/profile';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import { updateDocumentMetadata, generateCaseStudyDetailSchema } from '@/utils/seo';
import V2SubpageShell, { V2WorkGridCard } from '../components/layout/V2Chrome';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import RolloverLabel from '../components/ui/RolloverLabel';
import { useV2TransitionState } from '../components/motion/openingState';

const DETAIL_EASE = [0.22, 1, 0.36, 1];

const IdKitPlayground = lazy(() => import('@/components/IdKitPlayground'));

/**
 * Downward Scroll Parallax Image Box (Exact `/works/arjuna` `inset: -90px 0 0` downward translate)
 */
function ParallaxImageBox({ src, alt, className = '', rangePx = 84, eager = false, shouldReduceMotion = false }) {
  const boxRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: boxRef,
    offset: ['start end', 'end start'],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [0, rangePx]);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden rounded-[12px] bg-[var(--v2-surface)] border border-[var(--v2-border)] ${className}`}
    >
      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                y: translateY,
                top: `-${rangePx}px`,
              }
        }
        className={`w-full ${
          shouldReduceMotion ? 'h-full' : 'absolute inset-x-0 bottom-0'
        } will-change-transform`}
      >
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          className="h-full w-full object-cover object-top"
        />
      </motion.div>
    </div>
  );
}

ParallaxImageBox.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  rangePx: PropTypes.number,
  eager: PropTypes.bool,
  shouldReduceMotion: PropTypes.bool,
};

/**
 * Portfolio V2 — Individual Project / Case Study Detail Page (`/study-case/:slug` when `portfolioVersion !== '1'`)
 * Exact 1:1 visual, typographic & scroll reconstruction of `https://nakula.framer.website/works/arjuna`:
 * - Section 1 (`max-w-[1200px]`, `gap: 200px` desktop / `140px` mobile):
 *   1. Hero Header (`Anton` H1 + 2-line subtitle left; 4-row metadata table `(CATEGORY)`, `(ROLE)`, `(STACK)`, `Live Website ↗` right)
 *      + Parallax Hero Cover (`1.446` ratio) + 2-Column `1:1` Square Gallery
 *   2. `Challenges.` asymmetric block (`330px` left label + `680px` indented `32px` right copy)
 *   3. `Solutions.` asymmetric block (`330px` left label + `680px` indented `32px` right copy + key features)
 *   4. Full-Width `1200px` Showcase Frame (plus interactive `IdKitPlayground` when viewing `id-kit`)
 *   5. `Results.` asymmetric block (`330px` left label + `680px` indented summary + 3-col `72px` metrics row)
 * - Section 2: Centered `920px` two-tone reflection quote + animated `1px` divider + `88x88` author profile
 * - Section 3: `MORE WORKS` (`Anton 140px` + `SEE ALL ↗` pill + 2-column project cards)
 * - Section 4 & 5: `"LET'S WORK TOGETHER"` CTA + Nakula Footer
 */
export default function WorkDetailV2({ slug }) {
  const { language, t, resolve } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { subpageRevealReady, openingCompleted } = useV2TransitionState();
  const isHeroReady = Boolean(
    shouldReduceMotion || (openingCompleted && subpageRevealReady)
  );

  const project = getProjectBySlug(slug);

  useEffect(() => {
    if (project) {
      const pageTitle = `${t('v2.workDetail.seoTitlePrefix')}: ${project.title} | ${siteConfig.name}`;
      const pageDesc =
        resolve(project.description) ||
        `Technical case study for ${project.title}.`;

      updateDocumentMetadata({
        title: pageTitle,
        description: pageDesc,
        canonicalPath: `/study-case/${project.id}`,
        ogTitle: pageTitle,
        ogDescription: pageDesc,
        ogImage: project.image || '/portfolio.png',
        ogType: 'article',
        schemaData: generateCaseStudyDetailSchema(project, language),
        lang: language,
      });
    } else {
      const notFoundTitle = t('v2.workDetail.notFoundSeoTitle');
      updateDocumentMetadata({
        title: notFoundTitle,
        description: t('v2.workDetail.notFoundDesc').replace('{slug}', slug || ''),
        canonicalPath: `/study-case/${slug || ''}`,
        noindex: true,
        lang: language,
      });
    }
  }, [language, project, resolve, slug, t]);

  if (!project) {
    return (
      <V2SubpageShell scrollKey={`not-found-${slug}`}>
        <section className="relative z-[2] min-h-[75vh] flex items-center bg-[var(--v2-bg)] pt-[140px] pb-[100px]">
          <div className="v2-container max-w-[900px] space-y-8">
            <p className="v2-section-tag !text-[var(--v2-accent)]">(404 · NOT FOUND)</p>
            <h1 className="v2-section-heading">
              {t('v2.workDetail.notFoundHeading')}
            </h1>
            <p className="text-[20px] sm:text-[24px] font-medium tracking-[-0.04em] text-[var(--v2-text-muted)] max-w-xl">
              {t('v2.workDetail.notFoundDesc').replace('{slug}', slug || '')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <RouterLink
                to="/study-case"
                className="v2-pill-btn v2-pill-btn--accent !h-[54px] !px-7"
              >
                <RolloverLabel text={t('v2.workDetail.allWorks')} />
                <FiArrowUpRight size={18} />
              </RouterLink>
              <RouterLink to="/" className="v2-pill-btn !h-[54px] !px-7">
                <RolloverLabel text={t('v2.workDetail.backHome')} />
              </RouterLink>
            </div>
          </div>
        </section>
      </V2SubpageShell>
    );
  }

  const details = project.details || {};
  const categoryRaw = resolve(project.category) || 'Web Application';
  const categoryParts = categoryRaw.split('/').map((s) => s.trim()).filter(Boolean);

  const contributionFull = resolve(details.contribution) || 'Full-Stack Developer';
  const roleShort = contributionFull.split('—')[0].trim();

  const descriptionText = resolve(project.description);
  const problemText = resolve(details.problem) || descriptionText;
  const goalsText = resolve(details.goals) || null;
  const solutionText = resolve(details.solution);
  const architectureText = resolve(details.architecture);
  const featuresList = details.features?.[language] || details.features?.en || [];
  const processList = details.process?.[language] || details.process?.en || [];
  const learningsText = resolve(details.learnings) || contributionFull;

  // Authentic 3-column Results metrics derived strictly from verified project data
  const resultMetrics = project.metrics
    ? project.metrics.slice(0, 3).map((m) => ({
        value: m.value,
        label: resolve(m.label),
      }))
    : [
        {
          value: String(featuresList.length || 3).padStart(2, '0'),
          label: t('v2.workDetail.fallbackCapabilities'),
        },
        {
          value: `${project.tags?.length || 4}`,
          label: t('v2.workDetail.fallbackStack'),
        },
        {
          value: project.live ? 'Live' : 'Web',
          label:
            project.id === 'project-management'
              ? t('v2.workDetail.fallbackInternal')
              : t('v2.workDetail.fallbackProduction'),
        },
      ];

  // Next 2 projects for "MORE WORKS"
  const currentIdx = allProjects.findIndex((p) => p.id === project.id);
  const moreWorks = [
    allProjects[(currentIdx + 1) % allProjects.length],
    allProjects[(currentIdx + 2) % allProjects.length],
  ].filter((p) => p && p.id !== project.id);

  // Split learnings/reflection into 2-tone Nakula quote (first sentence bright #cacaca, remainder #555555)
  const firstPeriodIdx = learningsText.indexOf('. ');
  const quoteLead =
    firstPeriodIdx !== -1 ? learningsText.slice(0, firstPeriodIdx + 1) : learningsText;
  const quoteRest =
    firstPeriodIdx !== -1 ? learningsText.slice(firstPeriodIdx + 1).trim() : architectureText;

  return (
    <V2SubpageShell scrollKey={project.id}>
      {/* ====================================================================
          SECTION 1 — CASE STUDY CONTENT (`max-width: 1200px`, `gap: 200px` desktop)
          ==================================================================== */}
      <section className="relative z-[2] bg-[var(--v2-bg)] pt-[130px] pb-[100px] md:pt-[150px] md:pb-[150px] px-4 md:px-6">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-[120px] md:gap-[200px]">
          {/* 1. HERO + IMAGES BLOCK */}
          <div className="flex flex-col gap-[48px] md:gap-[64px]">
            {/* Hero Header Row (`gap: 64px` desktop) */}
            <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-[64px]">
              {/* Left Column: Title + 2-line Description */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                <MaskedDisplayHeading
                  as="h1"
                  lines={[project.title]}
                  className="v2-display-heading text-[clamp(3.5rem,8.4vw,8.75rem)] leading-[0.96] text-[var(--v2-text)] break-words"
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                  reveal={isHeroReady}
                />
                <motion.p
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 18, filter: 'blur(8px)' }
                  }
                  animate={
                    isHeroReady
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 18, filter: 'blur(8px)' }
                  }
                  transition={{ duration: 0.65, delay: 0.12, ease: DETAIL_EASE }}
                  className="max-w-[780px] text-[20px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.12] text-[var(--v2-text-muted)] will-change-transform"
                >
                  {descriptionText}
                </motion.p>
              </div>

              {/* Right Column: 4-Row Metadata Table (`width: 400px` desktop) */}
              <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-5 lg:pt-2">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={
                    isHeroReady
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 14, filter: 'blur(6px)' }
                  }
                  transition={{ duration: 0.58, delay: 0.08, ease: DETAIL_EASE }}
                  className="flex items-baseline gap-6 will-change-transform"
                >
                  <span className="w-[100px] shrink-0 text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text-dim)] uppercase">
                    ({t('v2.workDetail.categoryLabel')})
                  </span>
                  <span className="text-[20px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.08] text-[var(--v2-text)]">
                    {categoryParts.map((part, idx) => (
                      <Fragment key={part}>
                        {idx > 0 && <span className="mx-2 text-[var(--v2-accent)]">•</span>}
                        <span>{part}</span>
                      </Fragment>
                    ))}
                  </span>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={
                    isHeroReady
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 14, filter: 'blur(6px)' }
                  }
                  transition={{ duration: 0.58, delay: 0.15, ease: DETAIL_EASE }}
                  className="flex items-baseline gap-6 will-change-transform"
                >
                  <span className="w-[100px] shrink-0 text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text-dim)] uppercase">
                    ({t('v2.workDetail.roleLabel')})
                  </span>
                  <span className="text-[20px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.08] text-[var(--v2-text)]">
                    {roleShort}
                  </span>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={
                    isHeroReady
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : { opacity: 0, y: 14, filter: 'blur(6px)' }
                  }
                  transition={{ duration: 0.58, delay: 0.22, ease: DETAIL_EASE }}
                  className="flex items-baseline gap-6 will-change-transform"
                >
                  <span className="w-[100px] shrink-0 text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text-dim)] uppercase">
                    (STACK)
                  </span>
                  <span className="text-[20px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.08] text-[var(--v2-text)]">
                    {(project.tags || []).slice(0, 3).map((tag, idx) => (
                      <Fragment key={tag}>
                        {idx > 0 && <span className="mx-2 text-[var(--v2-accent)]">•</span>}
                        <span>{tag}</span>
                      </Fragment>
                    ))}
                  </span>
                </motion.div>

                {(project.live || project.npm || project.github) && (
                  <motion.div
                    initial={
                      shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }
                    }
                    animate={
                      isHeroReady
                        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                        : { opacity: 0, y: 14, filter: 'blur(6px)' }
                    }
                    transition={{ duration: 0.58, delay: 0.29, ease: DETAIL_EASE }}
                    className="flex items-baseline gap-6 pt-1 will-change-transform"
                  >
                    <span className="w-[100px] shrink-0" aria-hidden="true" />
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[20px] sm:text-[24px] font-medium tracking-[-0.05em] leading-[1.08]">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[var(--v2-accent)] hover:opacity-85 transition-opacity"
                        >
                          <span>{t('v2.workDetail.liveWebsite')}</span>
                          <FiArrowUpRight size={20} />
                        </a>
                      )}
                      {project.npm && (
                        <a
                          href={project.npm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[var(--v2-accent)] hover:opacity-85 transition-opacity"
                        >
                          <span>npm Package</span>
                          <FiArrowUpRight size={20} />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-85 ${
                            project.live || project.npm ? 'text-[var(--v2-text)]' : 'text-[var(--v2-accent)]'
                          }`}
                        >
                          <span>GitHub</span>
                          <FiArrowUpRight size={20} className="text-[var(--v2-accent)]" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Hero Cover Image + 2-Column Square Gallery (`gap: 24px`) */}
            <div className="flex flex-col gap-6">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 48 }}
                animate={isHeroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
                transition={{ duration: 0.78, delay: 0.18, ease: DETAIL_EASE }}
                className="will-change-transform"
              >
                <ParallaxImageBox
                  src={project.image}
                  alt={project.title}
                  eager={true}
                  rangePx={86}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                  className="aspect-[1.446] w-full"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left 1:1 Square Card — System Architecture & Full Tech Stack */}
                <div className="aspect-square rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] p-7 sm:p-10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                      ({t('v2.workDetail.architectureLabel')})
                    </span>
                    <span className="font-mono text-[13px] text-[var(--v2-accent)]">
                      {project.number || '01'}.
                    </span>
                  </div>

                  <p className="text-[20px] sm:text-[24px] font-semibold tracking-[-0.045em] leading-[1.2] text-[var(--v2-text)]">
                    {architectureText}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(project.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--v2-border-strong)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--v2-text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right 1:1 Square Card — Parallax Detail Interface Crop */}
                <ParallaxImageBox
                  src={project.image}
                  alt={`${project.title} interface detail`}
                  rangePx={68}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                  className="aspect-square w-full"
                />
              </div>
            </div>
          </div>

          {/* 2. CHALLENGES BLOCK (`330px` Left Label + `680px` Indented Right Copy) */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12">
            <h2 className="lg:w-[330px] shrink-0 text-[24px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-text-dim)]">
              {t('v2.workDetail.challengesHeading')}
              <span className="text-[var(--v2-accent)]">.</span>
            </h2>
            <div className="w-full lg:max-w-[680px] space-y-8">
              <p className="text-[20px] sm:text-[28px] xl:text-[32px] font-semibold tracking-[-0.055em] leading-[1.12] text-[var(--v2-text)] indent-[calc(8%+16px)]">
                {problemText}
              </p>
              {goalsText && (
                <p className="text-[18px] sm:text-[22px] font-medium tracking-[-0.04em] leading-[1.28] text-[var(--v2-text-muted)]">
                  {goalsText}
                </p>
              )}
            </div>
          </div>

          {/* 3. SOLUTIONS BLOCK (`330px` Left Label + `680px` Indented Right Copy + Features) */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12">
            <h2 className="lg:w-[330px] shrink-0 text-[24px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-text-dim)]">
              {t('v2.workDetail.solutionsHeading')}
              <span className="text-[var(--v2-accent)]">.</span>
            </h2>
            <div className="w-full lg:max-w-[680px] space-y-10">
              <p className="text-[20px] sm:text-[28px] xl:text-[32px] font-semibold tracking-[-0.055em] leading-[1.12] text-[var(--v2-text)] indent-[calc(8%+16px)]">
                {solutionText}
              </p>

              {featuresList.length > 0 && (
                <ul className="border-t border-[var(--v2-border)] divide-y divide-[var(--v2-border)]">
                  {featuresList.map((feat, idx) => (
                    <li
                      key={feat}
                      className="py-4 flex items-baseline gap-4 text-[16px] sm:text-[18px] font-medium tracking-[-0.025em] leading-[1.35] text-[var(--v2-text-muted)]"
                    >
                      <span className="font-mono text-[12px] text-[var(--v2-accent)] shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 4. FULL-WIDTH SHOWCASE BLOCK (+ Interactive Playground for `@ghifari29/id-kit`) */}
          <div className="space-y-12">
            <div className="rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)] p-5 sm:p-12 space-y-10">
              <div className="overflow-hidden rounded-[10px] border border-[var(--v2-border)] bg-[var(--v2-bg)]">
                <img
                  src={project.image}
                  alt={`${project.title} full showcase`}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>

              {processList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {processList.map((stepText, idx) => (
                    <div
                      key={stepText}
                      className="border-t border-[var(--v2-border)] pt-4 space-y-2"
                    >
                      <p className="text-[13px] font-semibold uppercase tracking-[-0.02em] text-[var(--v2-accent)]">
                        STEP {idx + 1}.
                      </p>
                      <p className="text-[15px] sm:text-[16px] leading-[1.4] text-[var(--v2-text-muted)]">
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {project.id === 'id-kit' && (
              <div id="playground" className="pt-4">
                <Suspense
                  fallback={
                    <div className="h-64 rounded-[12px] border border-[var(--v2-border)] bg-[var(--v2-bg-elevated)]" />
                  }
                >
                  <IdKitPlayground />
                </Suspense>
              </div>
            )}
          </div>

          {/* 5. RESULTS BLOCK (`330px` Left Label + `680px` Summary & 3-Col `72px` Metrics) */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-12">
            <h2 className="lg:w-[330px] shrink-0 text-[24px] sm:text-[32px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-text-dim)]">
              {t('v2.workDetail.resultsHeading')}
              <span className="text-[var(--v2-accent)]">.</span>
            </h2>
            <div className="w-full lg:max-w-[680px] space-y-12">
              <p className="text-[20px] sm:text-[28px] xl:text-[32px] font-semibold tracking-[-0.055em] leading-[1.12] text-[var(--v2-text)] indent-[calc(8%+16px)]">
                {contributionFull}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">
                {resultMetrics.map((m) => (
                  <div key={m.label} className="space-y-2">
                    <p className="text-[44px] sm:text-[60px] xl:text-[68px] font-semibold tracking-[-0.055em] leading-none text-[var(--v2-text)]">
                      {m.value}
                    </p>
                    <p className="text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] text-[var(--v2-text)]">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2 — CENTERED ENGINEERING REFLECTION QUOTE (`max-w-[920px]`)
          ==================================================================== */}
      <section className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-[150px] px-4 md:px-6">
        <div className="mx-auto w-full max-w-[920px] space-y-12">
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -top-2 left-0 text-[56px] sm:text-[80px] font-semibold leading-none text-[var(--v2-accent)] select-none"
            >
              “
            </span>
            <blockquote className="text-[28px] sm:text-[44px] xl:text-[52px] font-semibold tracking-[-0.06em] leading-[1.04] indent-12 sm:indent-20">
              <span className="text-[var(--v2-text)]">{quoteLead} </span>
              {quoteRest && <span className="text-[var(--v2-text-dim)]">{quoteRest}</span>}
            </blockquote>
          </div>

          <div className="w-full overflow-hidden">
            <motion.div
              initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="h-[1px] w-full bg-[#585858]"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="h-[76px] w-[76px] sm:h-[88px] sm:w-[88px] shrink-0 overflow-hidden rounded-[16px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)]">
              <img
                src={profileData.avatarImage}
                alt={siteConfig.name}
                loading="lazy"
                className="h-full w-full object-cover object-[51%_60%] scale-[2.4]"
              />
            </div>
            <div>
              <p className="text-[22px] sm:text-[24px] font-medium tracking-[-0.04em] text-[var(--v2-text)]">
                {siteConfig.name}
              </p>
              <p className="text-[15px] sm:text-[16px] text-[var(--v2-text-muted)] mt-0.5">{roleShort}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3 — MORE WORKS (`max-width: 1400px`, 2-Column Project Cards)
          ==================================================================== */}
      <section className="relative z-[2] bg-[var(--v2-bg)] py-24 sm:py-[150px]">
        <div className="v2-container flex flex-col gap-[56px] md:gap-[72px]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <MaskedDisplayHeading
              as="h2"
              lines={[t('v2.works.moreWorksHeading')]}
              className="v2-section-heading"
              shouldReduceMotion={Boolean(shouldReduceMotion)}
            />

            <RouterLink
              to="/study-case"
              className="v2-pill-btn !min-w-[190px] !h-[52px] justify-between !text-[var(--v2-accent)] hover:!border-[var(--v2-accent)]"
            >
              <RolloverLabel text={t('v2.common.seeAll')} />
              <FiArrowUpRight size={16} />
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[56px] gap-x-[24px]">
            {moreWorks.map((item, idx) => (
              <V2WorkGridCard
                key={item.id}
                project={item}
                index={idx}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            ))}
          </div>
        </div>
      </section>
    </V2SubpageShell>
  );
}

WorkDetailV2.propTypes = {
  slug: PropTypes.string,
};
