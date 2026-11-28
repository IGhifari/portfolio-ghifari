import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiX,
  FiArrowUpRight,
  FiGithub,
  FiMail,
  FiBookOpen,
  FiBriefcase,
  FiLayers,
  FiUser,
} from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { selectedProjects } from '@/data/projects';
import { profileData } from '@/data/profile';
import { techCategoriesData } from '@/data/skills';
import { experiences } from '@/data/experience';
import { directEmail, contactChannelsData } from '@/data/contact';
import { siteConfig } from '@/config/site';

const InfoPanel = ({ building, onClose }) => {
  const { language, t, resolve } = useLanguage();
  const containerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useFocusTrap({
    isOpen: Boolean(building),
    containerRef,
    initialFocusRef: closeBtnRef,
    onClose,
  });

  if (!building) return null;

  const isId = language === 'id';
  const topProjects = selectedProjects.slice(0, 4);
  const aboutStackTags = Array.from(
    new Set(
      profileData.lanyardCard.capabilities.flatMap((cap) =>
        cap.stack.split(',').map((s) => s.trim())
      )
    )
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center pt-16 sm:pt-20 pb-4 px-4 sm:pb-6 sm:px-6 backdrop-blur-sm"
      style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.75))' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-info-panel-title"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[calc(100vh-5.5rem)] flex flex-col rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="block font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider font-semibold">
              {building.number} {'//'} {t(building.subtitleKey)}
            </span>
            <h2
              id="game-info-panel-title"
              className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight truncate"
            >
              {t(building.labelKey)}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('game.closePanelAria')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <FiX size={15} aria-hidden="true" />
            <span>ESC</span>
          </button>
        </div>

        {/* Modal Body — Compact View Only (Title, Short Summary, Tech Stack, Links) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {/* 1. PROJECTS BUILDING */}
          {building.id === 'projects' && (
            <div className="space-y-2.5">
              <p className="font-sans text-xs text-[var(--text-secondary)] line-clamp-2">
                {t('projects.intro')}
              </p>
              <div className="space-y-2.5">
                {topProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block truncate">
                          {proj.number} / {resolve(proj.category)}
                        </span>
                        <h3 className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">
                          {proj.title}
                        </h3>
                      </div>
                      <RouterLink
                        to={`/study-case/${proj.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface)] hover:border-[var(--accent)] border border-[var(--border)] font-mono text-[11px] text-[var(--accent)] font-semibold shrink-0"
                      >
                        <FiBookOpen size={11} aria-hidden="true" />
                        <span>{t('projects.viewDetails')}</span>
                      </RouterLink>
                    </div>

                    <p className="font-sans text-xs text-[var(--text-secondary)] line-clamp-2">
                      {resolve(proj.description)}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                          >
                            <FiGithub size={12} aria-hidden="true" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {proj.npm && (
                          <a
                            href={proj.npm}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                          >
                            <SiNpm size={12} aria-hidden="true" />
                            <span>npm</span>
                          </a>
                        )}
                        {proj.live && (
                          <a
                            href={proj.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--accent)] hover:underline"
                          >
                            <span>Live</span>
                            <FiArrowUpRight size={12} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ABOUT BUILDING */}
          {building.id === 'about' && (
            <div className="p-4 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] space-y-3">
              <div>
                <div className="flex items-center gap-2 font-grotesk font-bold text-base text-[var(--text-primary)]">
                  <FiUser size={14} className="text-[var(--accent)]" aria-hidden="true" />
                  <span>{profileData.fullName}</span>
                </div>
                <p className="font-mono text-xs text-[var(--accent)] mt-0.5">
                  {profileData.lanyardCard.roleTitle} · {profileData.lanyardCard.baseLocation}
                </p>
              </div>

              <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('about.statement')}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {aboutStackTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. STACK BUILDING */}
          {building.id === 'stack' && (
            <div className="space-y-2.5">
              <p className="font-sans text-xs text-[var(--text-secondary)] line-clamp-2">
                {t('stack.intro')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {techCategoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {t(`stack.categories.${cat.id}.title`, cat.title)}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--accent)]">{cat.badge}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill.name}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                            skill.highlight
                              ? 'bg-[var(--surface)] border-[var(--accent)]/60 text-[var(--accent)] font-semibold'
                              : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXPERIENCE / JOURNEY BUILDING */}
          {building.id === 'experience' && (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-[var(--accent)] uppercase font-semibold">
                        {resolve(exp.type)} · {resolve(exp.period)}
                      </span>
                      <h3 className="font-grotesk font-bold text-sm sm:text-base text-[var(--text-primary)]">
                        {resolve(exp.role)} — {exp.company}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]">
                      {resolve(exp.duration)}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[var(--text-secondary)] line-clamp-2">
                    {resolve(exp.description)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {exp.projectRef && (
                      <RouterLink
                        to={`/study-case/${exp.projectRef}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface)] hover:border-[var(--accent)] border border-[var(--border)] font-mono text-[11px] text-[var(--accent)] font-semibold shrink-0"
                      >
                        <FiBookOpen size={11} aria-hidden="true" />
                        <span>{t('projects.viewDetails')}</span>
                      </RouterLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. CONTACT BUILDING */}
          {building.id === 'contact' && (
            <div className="space-y-3">
              <p className="font-sans text-xs text-[var(--text-secondary)] line-clamp-2">
                {t('contact.intro')}
              </p>

              <div className="p-3.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider block">
                    {t('contact.inquiriesTitle')}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-[var(--text-primary)] font-semibold">
                    {directEmail}
                  </span>
                </div>
                <a
                  href={`mailto:${directEmail}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-xs font-bold"
                >
                  <FiMail size={12} aria-hidden="true" />
                  <span>Email</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {contactChannelsData.map((ch) => (
                  <a
                    key={ch.key}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-grotesk font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                        {ch.name}
                      </span>
                      <FiArrowUpRight size={12} className="text-[var(--accent)]" aria-hidden="true" />
                    </div>
                    <span className="block font-mono text-[11px] text-[var(--accent)] truncate">
                      {ch.handle}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Links to Real Sections */}
        <div className="px-5 py-3 bg-[var(--surface-alt)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <RouterLink
              to={building.sectionHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider transition-opacity"
            >
              <FiLayers size={12} aria-hidden="true" />
              <span>{t('game.goToSection')}</span>
              <FiArrowUpRight size={12} aria-hidden="true" />
            </RouterLink>

            {building.secondaryHref && (
              <RouterLink
                to={building.secondaryHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <FiBriefcase size={12} aria-hidden="true" />
                <span>
                  {building.secondaryHref === '/study-case'
                    ? t('caseStudies.viewAll')
                    : isId
                    ? 'Lihat Detail'
                    : 'View Details'}
                </span>
              </RouterLink>
            )}
          </div>

          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {siteConfig.brandName} {'//'} {building.number}
          </span>
        </div>
      </div>
    </div>
  );
};

InfoPanel.propTypes = {
  building: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    subtitleKey: PropTypes.string.isRequired,
    sectionHref: PropTypes.string.isRequired,
    secondaryHref: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default InfoPanel;
