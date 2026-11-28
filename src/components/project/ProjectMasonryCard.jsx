import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiGithub, FiArrowUpRight, FiBookOpen, FiTerminal } from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';

import SpotlightCard from '../reactbits/SpotlightCard';
import { RouterLink } from '@/context/RouterContext';

const MASONRY_ASPECT_CLASSES = {
  akseskita: 'aspect-video lg:aspect-[5/4]',
  'project-management': 'aspect-video lg:aspect-[16/10]',
  'id-kit': 'aspect-video',
  'food-ecommerce': 'aspect-video lg:aspect-[16/11]',
  'internship-journal': 'aspect-video lg:aspect-[5/4]',
  studyflow: 'aspect-video lg:aspect-[4/3]',
  'blue-horizon': 'aspect-video',
};

const getDisplayHost = (project) => {
  if (project.live) {
    try {
      return new URL(project.live).host;
    } catch {
      return project.live;
    }
  }
  if (project.npm) {
    return `npmjs.com/package/${project.title}`;
  }
  if (project.id === 'project-management') {
    return 'internal // pt-ama-salam';
  }
  if (project.github) {
    try {
      const parsed = new URL(project.github);
      return `${parsed.host}${parsed.pathname}`;
    } catch {
      return project.github;
    }
  }
  return project.id;
};

/**
 * Featured Project Masonry Card for Portfolio V1.
 */
export default function ProjectMasonryCard({
  project,
  orderIndex,
  fadeMotion,
  language,
  t,
  resolve,
  opensNewTabLabel,
  onOpenModal,
}) {
  const aspectClass = MASONRY_ASPECT_CLASSES[project.id] || 'aspect-video';
  const displayHost = getDisplayHost(project);

  return (
    <motion.article {...fadeMotion} className="group min-w-0">
      <SpotlightCard className="project-masonry-card rounded-lg flex flex-col">
        {/* Clickable Screenshot & Authentic Frame Header */}
        <button
          type="button"
          onClick={(e) => onOpenModal(project, e.currentTarget)}
          aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
          data-cursor-label="Preview"
          className="cursor-target w-full text-left appearance-none bg-transparent border-0 p-0 m-0 cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <div className="px-3.5 py-2 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-[#ff5f56]/75 group-hover:bg-[#ff5f56] transition-colors" />
              <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/75 group-hover:bg-[#ffbd2e] transition-colors" />
              <span className="w-2 h-2 rounded-full bg-[#27c93f]/75 group-hover:bg-[#27c93f] transition-colors" />
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wide truncate">
              {displayHost}
            </span>
            {project.version ? (
              <span className="font-mono text-[9px] text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border-subtle)] font-semibold shrink-0">
                {project.version}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                {project.number}
              </span>
            )}
          </div>

          <div
            className={`relative ${aspectClass} w-full bg-[var(--bg-primary)] overflow-hidden border-b border-[var(--border-subtle)]`}
          >
            <img
              src={project.image}
              alt={`${project.title} interface preview`}
              loading={orderIndex === 0 ? 'eager' : 'lazy'}
              // eslint-disable-next-line react/no-unknown-property
              fetchpriority={orderIndex === 0 ? 'high' : undefined}
              decoding="async"
              width={1280}
              height={720}
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        </button>

        {/* Restrained Editorial Metadata Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] font-bold text-[var(--accent)] tracking-widest shrink-0">
                {project.number}
              </span>
              <span className="text-[var(--border)]" aria-hidden="true">/</span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] tracking-wider uppercase truncate">
                {resolve(project.category)}
              </span>
            </div>
            {project.year && (
              <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                {project.year}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-grotesk font-bold text-lg sm:text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wide mt-0.5 line-clamp-1">
                {resolve(project.subtitle)}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
            {resolve(project.description)}
          </p>

          {/* Authentic Engineering Metrics (rendered only when present in data) */}
          {Array.isArray(project.metrics) && project.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {project.metrics.map((metric) => (
                <div
                  key={metric.value}
                  className="px-2.5 py-1.5 rounded bg-[var(--bg-primary)]/40 border border-[var(--border-subtle)]"
                >
                  <span className="font-mono text-[11px] font-bold text-[var(--accent)] block">
                    {metric.value}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] leading-tight block">
                    {resolve(metric.label)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Compact Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="linear-tag-pill inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--surface-alt)]/80 border border-[var(--border-subtle)] rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Compact Footer Actions */}
          <div className="pt-3 mt-0.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
            <RouterLink
              to={`/study-case/${project.id}`}
              data-cursor-label="Study"
              className="cursor-target inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded px-1 py-0.5"
              aria-label={`${t('caseStudies.readCaseStudy')}: ${project.title}`}
            >
              <FiBookOpen size={13} aria-hidden="true" />
              <span>{t('caseStudies.readCaseStudy')}</span>
            </RouterLink>

            <div className="flex items-center gap-1.5">
              {project.id === 'id-kit' && (
                <RouterLink
                  to="/study-case/id-kit#playground"
                  data-cursor-label="Demo"
                  className="cursor-target inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] font-mono text-[10px] font-semibold uppercase text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiTerminal size={11} aria-hidden="true" />
                  <span>{language === 'id' ? 'Demo' : 'Playground'}</span>
                </RouterLink>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="Code"
                  className="cursor-target p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={`${t('projects.sourceCodeAria')}: ${project.title} (${opensNewTabLabel})`}
                  title={t('projects.sourceCode')}
                >
                  <FiGithub size={15} aria-hidden="true" />
                  <span className="sr-only"> ({opensNewTabLabel})</span>
                </a>
              )}
              {project.npm && (
                <a
                  href={project.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="npm"
                  className="cursor-target p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={`${t('projects.npmPackageAria')}: ${project.title} (${opensNewTabLabel})`}
                  title={t('projects.npmPackage')}
                >
                  <SiNpm size={15} aria-hidden="true" />
                  <span className="sr-only"> ({opensNewTabLabel})</span>
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="Live Demo"
                  className="cursor-target inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-mono text-[10px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={`${t('projects.liveDemoAria')}: ${project.title} (${opensNewTabLabel})`}
                >
                  <span>Live</span>
                  <FiArrowUpRight size={12} aria-hidden="true" />
                  <span className="sr-only"> ({opensNewTabLabel})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.article>
  );
}

ProjectMasonryCard.propTypes = {
  project: PropTypes.object.isRequired,
  orderIndex: PropTypes.number.isRequired,
  fadeMotion: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  resolve: PropTypes.func.isRequired,
  opensNewTabLabel: PropTypes.string.isRequired,
  onOpenModal: PropTypes.func.isRequired,
};
