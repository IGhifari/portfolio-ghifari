import { motion, useReducedMotion } from 'framer-motion';
import { FiGithub, FiArrowUpRight } from 'react-icons/fi';
import TiltedCard from './reactbits/TiltedCard';
import { selectedProjects, otherProjects } from '../data/projects';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Project.css';

const Project = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t, resolve } = useLanguage();

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 01 / SELECTED WORK
          ================================================== */}
      <motion.div {...getFadeMotion(0)} className="mb-10 md:mb-16">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
            {t('projects.sectionTag')}
          </span>
          <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
        </div>
        <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
          {t('projects.heading')}<span className="text-[var(--accent)]">.</span>
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
          {t('projects.intro')}
        </p>
      </motion.div>

      {/* ==================================================
          FEATURED PROJECTS (EDITORIAL ALTERNATING SHOWCASE)
          ================================================== */}
      <div className="space-y-20 md:space-y-32">
        {selectedProjects.map((project, index) => {
          const isEven = index % 2 === 1;

          return (
            <motion.article
              key={project.id}
              {...getFadeMotion(0.1)}
              className="group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Visual Screenshot (Desktop Alternating Order) */}
                <div
                  className={`w-full lg:col-span-7 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <TiltedCard
                    maxTilt={2.8}
                    scale={1.012}
                    showGlare={true}
                    className="project-preview-frame rounded-lg overflow-hidden"
                  >
                    {/* Window Header Frame */}
                    <div className="px-3.5 py-2.5 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between select-none">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
                        {project.title.toLowerCase().replace(/\s+/g, '-')}.app
                      </span>
                      <div className="w-10" aria-hidden="true" />
                    </div>

                    {/* Screenshot Preview */}
                    <div className="relative aspect-video w-full bg-[var(--surface-muted)] overflow-hidden">
                      <img
                        src={project.image}
                        alt={`${project.title} interface preview`}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                      />
                    </div>
                  </TiltedCard>
                </div>

                {/* Metadata & Description */}
                <div
                  className={`w-full lg:col-span-5 flex flex-col justify-center ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  {/* Category & Project Index */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-[0.2em]">
                      {project.number}
                    </span>
                    <span className="text-[var(--border)]" aria-hidden="true">/</span>
                    <span className="font-mono text-[11px] text-[var(--text-secondary)] tracking-[0.16em] uppercase">
                      {resolve(project.category)}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="font-grotesk font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--text-primary)] uppercase tracking-tight mt-2.5 leading-none">
                    {project.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="font-mono text-xs text-[var(--text-secondary)] tracking-wider uppercase mt-1.5">
                    {resolve(project.subtitle)}
                  </p>

                  {/* Description */}
                  <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed mt-4 font-normal">
                    {resolve(project.description)}
                  </p>

                  {/* Technologies - Subtle Editorial Tags */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-mono text-[var(--text-secondary)] bg-[var(--surface-alt)]/70 border border-[var(--border-subtle)] rounded-sm tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Verified Links */}
                  <div className="flex items-center gap-3 sm:gap-4 mt-7 pt-1">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        aria-label={`${t('projects.sourceCodeAria')}: ${project.title}`}
                      >
                        <FiGithub size={15} />
                        <span>{t('projects.sourceCode')}</span>
                      </a>
                    )}

                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        aria-label={`${t('projects.liveDemoAria')}: ${project.title}`}
                      >
                        <span>{t('projects.liveDemo')}</span>
                        <FiArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* ==================================================
          SECTION DIVIDER
          ================================================== */}
      <div className="w-full h-[1px] bg-[var(--border-subtle)] my-20 md:my-28" aria-hidden="true" />

      {/* ==================================================
          OTHER PROJECTS (COMPACT SECONDARY ARCHIVE)
          ================================================== */}
      <motion.div {...getFadeMotion(0)} className="mb-10 sm:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-[var(--text-muted)] tracking-[0.2em] uppercase font-semibold">
            {t('projects.archiveTag')}
          </span>
          <span className="h-[1px] w-8 bg-[var(--border)]" aria-hidden="true" />
        </div>
        <h3 className="font-grotesk font-bold text-2xl sm:text-3xl text-[var(--text-primary)] uppercase tracking-tight">
          {t('projects.archiveHeading')}<span className="text-[var(--accent)]">.</span>
        </h3>
        <p className="font-mono text-xs text-[var(--text-secondary)] mt-1.5">
          {t('projects.archiveIntro')}
        </p>
      </motion.div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
        {otherProjects.map((project, index) => (
          <motion.div
            key={project.id}
            {...getFadeMotion(index * 0.08)}
            className="other-project-card rounded-lg overflow-hidden flex flex-col justify-between group"
          >
            {/* Project Image Preview */}
            <div className="relative aspect-video w-full bg-[var(--surface-muted)] overflow-hidden border-b border-[var(--border)]">
              <img
                src={project.image}
                alt={`${project.title} thumbnail`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-grotesk font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {project.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 line-clamp-2">
                  {resolve(project.description)}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                {/* Tech tags - Subtle Editorial Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--surface-alt)]/70 border border-[var(--border-subtle)] rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none"
                      aria-label={`${t('projects.sourceCodeAria')}: ${project.title}`}
                      title={t('projects.githubRepo')}
                    >
                      <FiGithub size={16} />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] rounded transition-colors focus-visible:outline-none"
                      aria-label={`${t('projects.liveDemoAria')}: ${project.title}`}
                      title={t('projects.liveDeployment')}
                    >
                      <FiArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Project;
