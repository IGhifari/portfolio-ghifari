import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiGithub, FiArrowUpRight, FiX, FiLayers, FiCheckCircle, FiCpu, FiUserCheck, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import TiltedCard from './reactbits/TiltedCard';
import { selectedProjects, otherProjects } from '../data/projects';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Project.css';

const CATEGORY_KEYS = ['all', 'fullstack', 'webapp', 'game'];

const Project = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t, resolve } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeProject, setActiveProject] = useState(null);
  const lastTriggerRef = useRef(null);
  const closeBtnRef = useRef(null);

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

  const openModal = useCallback((project, triggerEl) => {
    lastTriggerRef.current = triggerEl || document.activeElement;
    setActiveProject(project);
  }, []);

  const closeModal = useCallback(() => {
    setActiveProject(null);
    if (lastTriggerRef.current && typeof lastTriggerRef.current.focus === 'function') {
      setTimeout(() => lastTriggerRef.current?.focus(), 0);
    }
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject, closeModal]);

  useEffect(() => {
    if (activeProject) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeProject]);

  const filteredSelected = activeCategory === 'all'
    ? selectedProjects
    : selectedProjects.filter((p) => p.categoryKey === activeCategory);

  const filteredOther = activeCategory === 'all'
    ? otherProjects
    : otherProjects.filter((p) => p.categoryKey === activeCategory);

  const totalMatches = filteredSelected.length + filteredOther.length;

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 01 / SELECTED WORK + CATEGORY FILTER
          ================================================== */}
      <motion.div {...getFadeMotion(0)} className="mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase font-semibold">
            {t('projects.sectionTag')}
          </span>
          <span className="h-[1px] w-12 bg-[var(--border)]" aria-hidden="true" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] uppercase tracking-tight leading-none">
              {t('projects.heading')}<span className="text-[var(--accent)]">.</span>
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl leading-relaxed">
              {t('projects.intro')}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div
            role="group"
            aria-label={t('projects.filterLabel')}
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORY_KEYS.map((catKey) => {
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  aria-pressed={isActive}
                  className={`px-3.5 py-1.5 rounded-md font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border border-[var(--accent)] shadow-sm'
                      : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] border border-[var(--border)]'
                  }`}
                >
                  {t(`projects.categories.${catKey}`)}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Empty State if no projects match */}
      {totalMatches === 0 && (
        <div className="py-16 px-6 text-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
          <p className="font-mono text-sm text-[var(--text-secondary)] mb-4">
            {t('projects.emptyCategory')}
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 rounded bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            {t('projects.resetFilter')}
          </button>
        </div>
      )}

      {/* ==================================================
          FEATURED PROJECTS (EDITORIAL ALTERNATING SHOWCASE)
          ================================================== */}
      {filteredSelected.length > 0 && (
        <div className="space-y-20 md:space-y-32">
          {filteredSelected.map((project, index) => {
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
                      className="project-preview-frame rounded-lg overflow-hidden cursor-pointer"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => openModal(project, e.currentTarget)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openModal(project, e.currentTarget);
                          }
                        }}
                        aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
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
                            decoding="async"
                            width={1280}
                            height={720}
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                          />
                        </div>
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

                    {/* Verified Links & Case Study Modal Trigger */}
                    <div className="flex flex-wrap items-center gap-3 mt-7 pt-1">
                      <button
                        type="button"
                        onClick={(e) => openModal(project, e.currentTarget)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
                      >
                        <FiBookOpen size={15} />
                        <span>{t('projects.viewDetails')}</span>
                      </button>

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
      )}

      {/* ==================================================
          SECTION DIVIDER
          ================================================== */}
      {filteredSelected.length > 0 && filteredOther.length > 0 && (
        <div className="w-full h-[1px] bg-[var(--border-subtle)] my-20 md:my-28" aria-hidden="true" />
      )}

      {/* ==================================================
          OTHER PROJECTS (COMPACT SECONDARY ARCHIVE)
          ================================================== */}
      {filteredOther.length > 0 && (
        <>
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
            {filteredOther.map((project, index) => (
              <motion.div
                key={project.id}
                {...getFadeMotion(index * 0.08)}
                className="other-project-card rounded-lg overflow-hidden flex flex-col justify-between group"
              >
                {/* Project Image Preview */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => openModal(project, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openModal(project, e.currentTarget);
                    }
                  }}
                  aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
                  className="relative aspect-video w-full bg-[var(--surface-muted)] overflow-hidden border-b border-[var(--border)] cursor-pointer"
                >
                  <img
                    src={project.image}
                    alt={`${project.title} thumbnail`}
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {project.category && (
                      <span className="font-mono text-[10px] text-[var(--accent)] tracking-[0.16em] uppercase block mb-1">
                        {resolve(project.category)}
                      </span>
                    )}
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => openModal(project, e.currentTarget)}
                        className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        aria-label={`${t('projects.viewDetailsAria')} ${project.title}`}
                      >
                        {t('projects.viewDetails')}
                      </button>
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
        </>
      )}

      {/* ==================================================
          PROJECT CASE STUDY DETAIL MODAL
          ================================================== */}
      <AnimatePresence>
        {activeProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--modal-backdrop)] backdrop-blur-md"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: easeCurve }}
              className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl max-w-3xl w-full rounded-lg flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)] gap-4">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider block">
                    {activeProject.number ? `${activeProject.number} / ` : ''}
                    {resolve(activeProject.category)}
                  </span>
                  <h3
                    id="project-modal-title"
                    className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight truncate"
                  >
                    {activeProject.title}
                  </h3>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer shrink-0"
                  aria-label={t('projects.modal.closeAria')}
                >
                  <FiX size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">{t('projects.modal.close')}</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-[var(--bg-primary)]">
                {/* Preview Banner */}
                <div className="aspect-video w-full rounded-md overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]">
                  <img
                    src={activeProject.image}
                    alt={`${activeProject.title} full preview`}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Overview */}
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {resolve(activeProject.description)}
                </p>

                {/* Case Study Details */}
                {activeProject.details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProject.details.problem && (
                      <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <FiAlertCircle size={14} aria-hidden="true" />
                          <span>{t('projects.modal.problem')}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {resolve(activeProject.details.problem)}
                        </p>
                      </div>
                    )}

                    {activeProject.details.solution && (
                      <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <FiCheckCircle size={14} aria-hidden="true" />
                          <span>{t('projects.modal.solution')}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {resolve(activeProject.details.solution)}
                        </p>
                      </div>
                    )}

                    {activeProject.details.architecture && (
                      <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5 md:col-span-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <FiCpu size={14} aria-hidden="true" />
                          <span>{t('projects.modal.architecture')}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {resolve(activeProject.details.architecture)}
                        </p>
                      </div>
                    )}

                    {activeProject.details.features && (
                      <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <FiLayers size={14} aria-hidden="true" />
                          <span>{t('projects.modal.features')}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] list-disc list-inside">
                          {(resolve(activeProject.details.features) || []).map((feat) => (
                            <li key={feat} className="leading-relaxed">
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeProject.details.contribution && (
                      <div className="p-4 rounded-md bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-1.5 md:col-span-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <FiUserCheck size={14} aria-hidden="true" />
                          <span>{t('projects.modal.contribution')}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {resolve(activeProject.details.contribution)}
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
                    {activeProject.tags.map((tag) => (
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
                  {activeProject.github && (
                    <a
                      href={activeProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent)] border border-[var(--border)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
                    >
                      <FiGithub size={14} />
                      <span>{t('projects.sourceCode')}</span>
                    </a>
                  )}
                  {activeProject.live ? (
                    <a
                      href={activeProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] rounded text-xs font-grotesk font-bold tracking-wider uppercase transition-colors"
                    >
                      <span>{t('projects.liveDemo')}</span>
                      <FiArrowUpRight size={14} />
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      {t('projects.modal.noLiveNote')}
                    </span>
                  )}
                </div>

                <span className="font-mono text-[11px] text-[var(--text-muted)] hidden sm:inline">
                  {t('projects.modal.dismissHint')}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Project;
