import PropTypes from 'prop-types';
import {
  FiGithub,
  FiArrowUpRight,
  FiLayers,
  FiCheckCircle,
  FiCpu,
  FiUserCheck,
  FiAlertCircle,
  FiBookOpen,
} from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';

import { RouterLink } from '@/context/RouterContext';

/**
 * Scrollable Body + Action Footer inside the Portfolio V1 Project Detail Modal.
 */
export default function ProjectModalContent({
  project,
  language,
  t,
  resolve,
  opensNewTabLabel,
  onClose,
}) {
  return (
    <>
      {/* Modal Body */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-[var(--bg-primary)]">
        {/* Preview Banner */}
        <div className="aspect-video w-full rounded-md overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]">
          <img
            src={project.image}
            alt={`${project.title} full preview`}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Overview */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {resolve(project.description)}
        </p>

        {/* Case Study Details */}
        {project.details && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.details.problem && (
              <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <FiAlertCircle size={14} aria-hidden="true" />
                  <span>{t('projects.modal.problem')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {resolve(project.details.problem)}
                </p>
              </div>
            )}

            {project.details.solution && (
              <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <FiCheckCircle size={14} aria-hidden="true" />
                  <span>{t('projects.modal.solution')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {resolve(project.details.solution)}
                </p>
              </div>
            )}

            {project.details.architecture && (
              <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <FiCpu size={14} aria-hidden="true" />
                  <span>{t('projects.modal.architecture')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {resolve(project.details.architecture)}
                </p>
              </div>
            )}

            {project.details.features && (
              <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <FiLayers size={14} aria-hidden="true" />
                  <span>{t('projects.modal.features')}</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] list-disc list-inside">
                  {(resolve(project.details.features) || []).map((feat) => (
                    <li key={feat} className="leading-relaxed">
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.details.contribution && (
              <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <FiUserCheck size={14} aria-hidden="true" />
                  <span>{t('projects.modal.contribution')}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {resolve(project.details.contribution)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tech Stack */}
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] block">
            {t('projects.modal.techStack')}
          </span>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-mono text-[var(--text-primary)] bg-[var(--surface-alt)] border border-[var(--border)] rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--surface-muted)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <RouterLink
            to={`/study-case/${project.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
          >
            <FiBookOpen size={14} />
            <span>{language === 'id' ? 'Buka Halaman Studi Kasus' : 'Open Full Case Study'}</span>
            <FiArrowUpRight size={13} />
          </RouterLink>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent)] border border-[var(--border)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
            >
              <FiGithub size={14} />
              <span>{t('projects.sourceCode')}</span>
              <span className="sr-only"> ({opensNewTabLabel})</span>
            </a>
          )}
          {project.npm && (
            <a
              href={project.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent)] border border-[var(--border)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
            >
              <SiNpm size={14} aria-hidden="true" />
              <span>{t('projects.npmPackage')}</span>
              <FiArrowUpRight size={13} aria-hidden="true" />
              <span className="sr-only"> ({opensNewTabLabel})</span>
            </a>
          )}
          {project.live ? (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
            >
              <span>{t('projects.liveDemo')}</span>
              <FiArrowUpRight size={14} />
              <span className="sr-only"> ({opensNewTabLabel})</span>
            </a>
          ) : !project.npm ? (
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {t('projects.modal.noLiveNote')}
            </span>
          ) : null}
        </div>

        <span className="font-mono text-[11px] text-[var(--text-muted)] hidden sm:inline">
          {t('projects.modal.dismissHint')}
        </span>
      </div>
    </>
  );
}

ProjectModalContent.propTypes = {
  project: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  resolve: PropTypes.func.isRequired,
  opensNewTabLabel: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
