import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiCheckCircle,
  FiCpu,
  FiShield,
  FiLayers,
  FiTarget,
  FiAlertCircle,
  FiCode,
  FiBookOpen,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink } from '../context/RouterContext';
import { getProjectBySlug } from '../data/projects';
import { updateDocumentMetadata, generateCaseStudyDetailSchema } from '../utils/seo';

const CaseStudyDetail = ({ slug }) => {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const project = getProjectBySlug(slug);

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  // Dynamic SEO metadata
  useEffect(() => {
    if (project) {
      const pageTitle =
        language === 'id'
          ? `Studi Kasus: ${project.title} | M. Ghifari Bima Khadafi`
          : `Case Study: ${project.title} | M. Ghifari Bima Khadafi`;
      const pageDesc =
        project.description[language] ||
        project.description.en ||
        `Technical case study for ${project.title}.`;

      updateDocumentMetadata({
        title: pageTitle,
        description: pageDesc,
        canonicalPath: `/study-case/${project.id}`,
        ogTitle: pageTitle,
        ogDescription: pageDesc,
        ogImage: project.image || '/portfolio.png',
        schemaData: generateCaseStudyDetailSchema(project),
      });
    } else {
      const notFoundTitle =
        language === 'id'
          ? 'Studi Kasus Tidak Ditemukan | M. Ghifari Bima Khadafi'
          : 'Case Study Not Found | M. Ghifari Bima Khadafi';
      updateDocumentMetadata({
        title: notFoundTitle,
        description: 'The requested case study could not be found.',
        canonicalPath: `/study-case/${slug || ''}`,
      });
    }
  }, [project, slug, language]);

  // Handle Project Not Found State
  if (!project) {
    return (
      <div className="w-full min-h-screen text-[var(--text-primary)] pt-32 pb-20 px-5 sm:px-6 flex items-center justify-center">
        <motion.div
          {...getFadeMotion(0)}
          className="max-w-xl w-full p-8 sm:p-10 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-center space-y-6"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center">
            <FiAlertCircle size={24} aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase font-semibold">
              404 // NOT FOUND
            </span>
            <h1 className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] uppercase">
              {t('caseStudies.notFoundTitle')}
            </h1>
            <p className="font-sans text-sm text-[var(--text-secondary)]">
              {t('caseStudies.notFoundDesc')} ({slug})
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <RouterLink
              to="/study-case"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase transition-opacity hover:opacity-90"
            >
              <FiArrowLeft size={14} aria-hidden="true" />
              <span>{t('caseStudies.backToList')}</span>
            </RouterLink>

            <RouterLink
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text-primary)] uppercase transition-colors"
            >
              <span>{t('caseStudies.backToHome')}</span>
            </RouterLink>
          </div>
        </motion.div>
      </div>
    );
  }

  const categoryLabel = project.category[language] || project.category.en;
  const descriptionText = project.description[language] || project.description.en;
  const subtitleText = project.subtitle
    ? project.subtitle[language] || project.subtitle.en
    : null;
  const isInternship = project.id === 'project-management';

  const details = project.details || {};
  const problemText = details.problem
    ? details.problem[language] || details.problem.en
    : null;
  const goalsText = details.goals
    ? details.goals[language] || details.goals.en
    : null;
  const solutionText = details.solution
    ? details.solution[language] || details.solution.en
    : null;
  const architectureText = details.architecture
    ? details.architecture[language] || details.architecture.en
    : null;
  const featuresList = details.features
    ? details.features[language] || details.features.en
    : null;
  const contributionText = details.contribution
    ? details.contribution[language] || details.contribution.en
    : null;
  const processList = details.process
    ? details.process[language] || details.process.en
    : null;
  const learningsText = details.learnings
    ? details.learnings[language] || details.learnings.en
    : null;

  return (
    <div className="w-full min-h-screen text-[var(--text-primary)] pt-24 pb-20 px-5 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Navigation Breadcrumbs */}
        <motion.nav
          {...getFadeMotion(0)}
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-mono text-xs text-[var(--text-muted)] flex-wrap"
        >
          <RouterLink
            to="/"
            className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            <FiArrowLeft size={12} aria-hidden="true" />
            <span>{t('caseStudies.breadcrumbHome')}</span>
          </RouterLink>
          <span className="text-[var(--border)]" aria-hidden="true">/</span>
          <RouterLink
            to="/study-case"
            className="hover:text-[var(--accent)] transition-colors"
          >
            <span>{t('caseStudies.breadcrumbCaseStudies')}</span>
          </RouterLink>
          <span className="text-[var(--border)]" aria-hidden="true">/</span>
          <span className="text-[var(--accent)] truncate max-w-[200px] sm:max-w-none">
            {project.title}
          </span>
        </motion.nav>

        {/* Header Hero Area */}
        <motion.header {...getFadeMotion(0.05)} className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--accent)] tracking-wider uppercase">
              {categoryLabel}
            </span>
            {isInternship && (
              <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800 tracking-wider flex items-center gap-1.5">
                <FiShield size={12} aria-hidden="true" />
                <span>MAGANG PT. AMA SALAM INDONESIA</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-grotesk font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-[var(--text-primary)] leading-none">
              {project.title}<span className="text-[var(--accent)]">.</span>
            </h1>
            {subtitleText && (
              <p className="font-mono text-sm sm:text-base text-[var(--text-muted)]">
                {subtitleText}
              </p>
            )}
          </div>

          <p className="font-sans text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            {descriptionText}
          </p>

          {/* Internal Project Confidentiality Banner (PT. AMA Salam) */}
          {isInternship && (
            <div className="p-4 sm:p-5 rounded-lg bg-[var(--surface-muted)] border-l-4 border-l-blue-500 border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-blue-400 font-semibold uppercase tracking-wider">
                <FiShield size={14} aria-hidden="true" />
                <span>{t('caseStudies.internalNoticeTitle')}</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('caseStudies.internalNoticeDesc')}{' '}
                <RouterLink
                  to="/#experience"
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-mono text-xs ml-1 font-semibold"
                >
                  <span>{language === 'id' ? 'Lihat riwayat magang di profil' : 'View internship details in profile'}</span>
                  <FiExternalLink size={12} aria-hidden="true" />
                </RouterLink>
              </p>
            </div>
          )}

          {/* Tech Stack Pills */}
          <div className="space-y-2 pt-2">
            <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
              {t('caseStudies.techHeader')}
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs px-3 py-1 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Hero Image Showcase */}
        {project.image && (
          <motion.div
            {...getFadeMotion(0.1)}
            className="w-full rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-muted)] aspect-[16/9] shadow-xl"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
        )}

        {/* Detailed Technical Sections */}
        <div className="space-y-10 pt-4 divide-y divide-[var(--border-subtle)]">
          {/* Problem Statement */}
          {problemText && (
            <motion.section {...getFadeMotion(0.15)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiAlertCircle size={15} aria-hidden="true" />
                <h2>{t('caseStudies.problemHeader')}</h2>
              </div>
              <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {problemText}
              </p>
            </motion.section>
          )}

          {/* Engineering Goals */}
          {goalsText && (
            <motion.section {...getFadeMotion(0.18)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiTarget size={15} aria-hidden="true" />
                <h2>{t('caseStudies.goalsHeader')}</h2>
              </div>
              <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {goalsText}
              </p>
            </motion.section>
          )}

          {/* Solution & Approach */}
          {solutionText && (
            <motion.section {...getFadeMotion(0.2)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiCheckCircle size={15} aria-hidden="true" />
                <h2>{t('caseStudies.solutionHeader')}</h2>
              </div>
              <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {solutionText}
              </p>
            </motion.section>
          )}

          {/* System Architecture */}
          {architectureText && (
            <motion.section {...getFadeMotion(0.22)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiLayers size={15} aria-hidden="true" />
                <h2>{t('caseStudies.architectureHeader')}</h2>
              </div>
              <div className="p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)]">
                <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {architectureText}
                </p>
              </div>
            </motion.section>
          )}

          {/* Key Features */}
          {featuresList && featuresList.length > 0 && (
            <motion.section {...getFadeMotion(0.24)} className="pt-8 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiCheckCircle size={15} aria-hidden="true" />
                <h2>{t('caseStudies.featuresHeader')}</h2>
              </div>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {featuresList.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Role & Contributions */}
          {contributionText && (
            <motion.section {...getFadeMotion(0.26)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiCode size={15} aria-hidden="true" />
                <h2>{t('caseStudies.contributionHeader')}</h2>
              </div>
              <div className="p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)]">
                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {contributionText}
                </p>
              </div>
            </motion.section>
          )}

          {/* Development Process (if provided) */}
          {processList && processList.length > 0 && (
            <motion.section {...getFadeMotion(0.28)} className="pt-8 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiCpu size={15} aria-hidden="true" />
                <h2>{t('caseStudies.processHeader')}</h2>
              </div>
              <ol className="space-y-3 list-none p-0 m-0">
                {processList.map((step, idx) => (
                  <li
                    key={idx}
                    className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] flex items-start gap-3.5 font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                  >
                    <span className="font-mono text-xs font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-alt)] shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.section>
          )}

          {/* Challenges & Learnings (if provided) */}
          {learningsText && (
            <motion.section {...getFadeMotion(0.3)} className="pt-8 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
                <FiBookOpen size={15} aria-hidden="true" />
                <h2>{t('caseStudies.learningsHeader')}</h2>
              </div>
              <div className="p-5 rounded-lg bg-[var(--surface-muted)] border-l-2 border-l-[var(--accent)] border border-[var(--border-subtle)]">
                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {learningsText}
                </p>
              </div>
            </motion.section>
          )}
        </div>

        {/* Public Action Links (GitHub, Live Demo) */}
        <motion.div
          {...getFadeMotion(0.32)}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="Code"
                className="cursor-target inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                <FiGithub size={14} aria-hidden="true" />
                <span>{t('caseStudies.githubAction')}</span>
                <FiExternalLink size={12} aria-hidden="true" />
                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
              </a>
            )}

            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="Live Demo"
                className="cursor-target inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] hover:opacity-90 font-mono text-xs font-bold text-[var(--accent-contrast)] transition-opacity"
              >
                <span>{t('caseStudies.liveAction')}</span>
                <FiExternalLink size={12} aria-hidden="true" />
                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
              </a>
            )}
          </div>

          <RouterLink
            to="/study-case"
            data-cursor-label="Back"
            className="cursor-target inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors self-start sm:self-auto"
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{t('caseStudies.backToList')}</span>
          </RouterLink>
        </motion.div>
      </div>
    </div>
  );
};

CaseStudyDetail.propTypes = {
  slug: PropTypes.string,
};

export default CaseStudyDetail;
