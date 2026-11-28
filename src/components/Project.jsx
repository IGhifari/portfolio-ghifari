import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiX } from 'react-icons/fi';

import { selectedProjects, otherProjects } from '../data/projects';
import { useLanguage } from '../context/LanguageContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { RouterLink } from '../context/RouterContext';
import ProjectMasonryCard from './project/ProjectMasonryCard';
import ProjectArchiveCard from './project/ProjectArchiveCard';
import ProjectModalContent from './project/ProjectModalContent';
import '../styles/Project.css';

const CATEGORY_KEYS = ['all', 'fullstack', 'webapp', 'library', 'game'];

const useMasonryColumnCount = () => {
  const [cols, setCols] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 3;
    if (window.matchMedia('(min-width: 1024px)').matches) return 3;
    if (window.matchMedia('(min-width: 768px)').matches) return 2;
    return 1;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const lgQuery = window.matchMedia('(min-width: 1024px)');
    const mdQuery = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      if (lgQuery.matches) setCols(3);
      else if (mdQuery.matches) setCols(2);
      else setCols(1);
    };
    sync();
    lgQuery.addEventListener('change', sync);
    mdQuery.addEventListener('change', sync);
    return () => {
      lgQuery.removeEventListener('change', sync);
      mdQuery.removeEventListener('change', sync);
    };
  }, []);

  return cols;
};

const Project = () => {
  const shouldReduceMotion = useReducedMotion();
  const { language, t, resolve } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeProject, setActiveProject] = useState(null);
  const columnCount = useMasonryColumnCount();
  const lastTriggerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const modalContainerRef = useRef(null);

  const easeCurve = [0.16, 1, 0.3, 1];
  const opensNewTabLabel = t('nav.opensNewTab') || 'opens in a new tab';

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
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.45, delay, ease: easeCurve },
    };
  };

  const openModal = useCallback((project, triggerEl) => {
    lastTriggerRef.current = triggerEl || document.activeElement;
    setActiveProject(project);
  }, []);

  const closeModal = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Trap focus inside project modal, manage initial focus, Escape key, and restore focus on close
  useFocusTrap({
    isOpen: Boolean(activeProject),
    containerRef: modalContainerRef,
    initialFocusRef: closeBtnRef,
    triggerRef: lastTriggerRef,
    onClose: closeModal,
  });

  useEffect(() => {
    if (activeProject) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeProject]);

  const filteredSelected = useMemo(
    () =>
      activeCategory === 'all'
        ? selectedProjects
        : selectedProjects.filter((p) => p.categoryKey === activeCategory),
    [activeCategory]
  );

  const filteredOther = useMemo(
    () =>
      activeCategory === 'all'
        ? otherProjects
        : otherProjects.filter((p) => p.categoryKey === activeCategory),
    [activeCategory]
  );

  const masonryColumns = useMemo(() => {
    const columns = Array.from({ length: columnCount }, () => []);
    filteredSelected.forEach((project, idx) => {
      columns[idx % columnCount].push({ project, orderIndex: idx });
    });
    return columns.filter((col) => col.length > 0);
  }, [filteredSelected, columnCount]);

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
                  data-cursor-label="Filter"
                  className={`cursor-target px-3.5 py-1.5 rounded-md font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
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
          FEATURED PROJECTS (3-COLUMN ASYMMETRIC MASONRY)
          ================================================== */}
      {filteredSelected.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          {masonryColumns.map((colItems, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-5 lg:gap-6 min-w-0">
              {colItems.map(({ project, orderIndex }) => (
                <ProjectMasonryCard
                  key={project.id}
                  project={project}
                  orderIndex={orderIndex}
                  fadeMotion={getFadeMotion(Math.min(orderIndex * 0.05, 0.25))}
                  language={language}
                  t={t}
                  resolve={resolve}
                  opensNewTabLabel={opensNewTabLabel}
                  onOpenModal={openModal}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ==================================================
          SECTION DIVIDER
          ================================================== */}
      {filteredSelected.length > 0 && filteredOther.length > 0 && (
        <div className="w-full h-[1px] bg-[var(--border-subtle)] my-16 md:my-24" aria-hidden="true" />
      )}

      {/* ==================================================
          OTHER PROJECTS (COMPACT 2x2 ARCHIVE GRID)
          ================================================== */}
      {filteredOther.length > 0 && (
        <>
          <motion.div {...getFadeMotion(0)} className="mb-8 sm:mb-10">
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

          {/* 2x2 Responsive Grid on Desktop & Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {filteredOther.map((project, index) => (
              <ProjectArchiveCard
                key={project.id}
                project={project}
                fadeMotion={getFadeMotion(index * 0.06)}
                t={t}
                resolve={resolve}
                opensNewTabLabel={opensNewTabLabel}
                onOpenModal={openModal}
              />
            ))}
          </div>
        </>
      )}

      {/* ==================================================
          CASE STUDY HUB BANNER (CTA TO /study-case)
          ================================================== */}
      <motion.div
        {...getFadeMotion(0.1)}
        className="mt-16 md:mt-24 p-6 sm:p-8 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">
              {t('caseStudies.heading')}
            </span>
          </div>
          <h3 className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)] uppercase tracking-tight">
            {language === 'id'
              ? 'Analisis Arsitektur & Studi Kasus Mendalam'
              : 'Architectural Analysis & In-Depth Case Studies'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'id'
              ? 'Pelajari problem statement, keputusan teknis, arsitektur sistem, dan proses implementasi di balik proyek-proyek rekayasa perangkat lunak terpilih.'
              : 'Explore the problem statement, technical decisions, system architecture, and implementation process behind selected software engineering projects.'}
          </p>
        </div>
        <div className="shrink-0">
          <RouterLink
            to="/study-case"
            data-cursor-label="Explore"
            className="cursor-target inline-flex items-center gap-2.5 px-5 py-3 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-grotesk font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
          >
            <span>{t('caseStudies.readCaseStudy')}</span>
            <FiArrowUpRight size={16} />
          </RouterLink>
        </div>
      </motion.div>

      {/* ==================================================
          PROJECT CASE STUDY DETAIL MODAL
          ================================================== */}
      <AnimatePresence>
        {activeProject && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--modal-backdrop)] backdrop-blur-md"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            <motion.div
              ref={modalContainerRef}
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
                  data-cursor-label="Close"
                  className="cursor-target px-3 py-1.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer shrink-0"
                  aria-label={t('projects.modal.closeAria')}
                >
                  <FiX size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">{t('projects.modal.close')}</span>
                </button>
              </div>

              <ProjectModalContent
                project={activeProject}
                language={language}
                t={t}
                resolve={resolve}
                opensNewTabLabel={opensNewTabLabel}
                onClose={closeModal}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Project;
