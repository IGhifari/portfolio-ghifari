import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiGithub, FiArrowUpRight, FiBookOpen } from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';

import SpotlightCard from '../reactbits/SpotlightCard';
import { RouterLink } from '@/context/RouterContext';

/**
 * Compact Archive Project Card (2x2 Other Projects grid) for Portfolio V1.
 */
export default function ProjectArchiveCard({
  project,
  fadeMotion,
  t,
  resolve,
  opensNewTabLabel,
  onOpenModal,
}) {
  return (
    <motion.article {...fadeMotion} className="group min-w-0">
      <SpotlightCard className="other-project-card rounded-lg h-full flex flex-col justify-between">
        {/* Project Image Preview (MED-04 semantic button) */}
        <button
          type="button"
          onClick={(e) => onOpenModal(project, e.currentTarget)}
          aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
          data-cursor-label="Preview"
          className="cursor-target w-full text-left appearance-none p-0 m-0 relative aspect-video bg-[var(--bg-primary)] overflow-hidden border-0 border-b border-[var(--border)] cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <img
            src={project.image}
            alt={`${project.title} thumbnail`}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </button>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              {project.category && (
                <span className="font-mono text-[10px] text-[var(--accent)] tracking-[0.16em] uppercase truncate">
                  {resolve(project.category)}
                </span>
              )}
              {project.year && (
                <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                  {project.year}
                </span>
              )}
            </div>
            <h4 className="font-grotesk font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
              {project.title}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 line-clamp-2">
              {resolve(project.description)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-3">
            {/* Tech tags - Subtle Editorial Badges */}
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="linear-tag-pill inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--surface-alt)]/80 border border-[var(--border-subtle)] rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions: Study Case link + Modal Details + External Links */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <RouterLink
                to={`/study-case/${project.id}`}
                data-cursor-label="Study"
                className="cursor-target inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded px-1 py-0.5"
                aria-label={`${t('caseStudies.readCaseStudy')}: ${project.title}`}
              >
                <FiBookOpen size={12} aria-hidden="true" />
                <span>{t('caseStudies.readCaseStudy')}</span>
              </RouterLink>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => onOpenModal(project, e.currentTarget)}
                  data-cursor-label="Details"
                  className="cursor-target px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wide text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border)] rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
                >
                  {t('projects.viewDetails')}
                </button>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="Code"
                    className="cursor-target p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                    aria-label={`${t('projects.sourceCodeAria')}: ${project.title} (${opensNewTabLabel})`}
                    title={t('projects.githubRepo')}
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
                    className="cursor-target p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                    aria-label={`${t('projects.liveDemoAria')}: ${project.title} (${opensNewTabLabel})`}
                    title={t('projects.liveDeployment')}
                  >
                    <FiArrowUpRight size={16} aria-hidden="true" />
                    <span className="sr-only"> ({opensNewTabLabel})</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.article>
  );
}

ProjectArchiveCard.propTypes = {
  project: PropTypes.object.isRequired,
  fadeMotion: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  resolve: PropTypes.func.isRequired,
  opensNewTabLabel: PropTypes.string.isRequired,
  onOpenModal: PropTypes.func.isRequired,
};
