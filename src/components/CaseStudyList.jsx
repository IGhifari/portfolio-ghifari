import { useState, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiSearch,
  FiArrowLeft,
  FiBriefcase,
  FiLayers,
  FiX,
  FiFilter,
  FiSliders,
  FiRotateCcw,
  FiGithub,
  FiExternalLink,
  FiCode,
} from 'react-icons/fi';
import { SiNpm } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink } from '../context/RouterContext';
import { allProjects } from '../data/projects';
import {
  getAvailableTechnologies,
  getAvailableCategories,
  filterProjects,
  DEFAULT_CATEGORY,
  DEFAULT_TECH,
  DEFAULT_SORT,
} from '../utils/projectExplorer';
import { updateDocumentMetadata, generateCaseStudyListSchema } from '../utils/seo';
import { siteConfig } from '../config/site';
import FilterDropdown from './ui/FilterDropdown';

const CaseStudyList = () => {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [selectedTech, setSelectedTech] = useState(DEFAULT_TECH);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

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
    const title =
      language === 'id'
        ? `Penjelajah Proyek & Studi Kasus Rekayasa | ${siteConfig.name}`
        : `Project Explorer & Engineering Case Studies | ${siteConfig.name}`;
    const description =
      language === 'id'
        ? `Jelajahi dan temukan proyek rekayasa perangkat lunak, arsitektur teknis, dan studi kasus pilihan ${siteConfig.name} berdasarkan teknologi, kategori, dan kata kunci.`
        : `Explore and discover software engineering projects, technical architectures, and case studies by ${siteConfig.name} filtered by technology, category, and keywords.`;

    updateDocumentMetadata({
      title,
      description,
      canonicalPath: '/study-case',
      ogTitle: title,
      ogDescription: description,
      ogImage: '/portfolio.png',
      schemaData: generateCaseStudyListSchema(allProjects),
    });
  }, [language]);

  // Dynamically derived categories and technologies from allProjects
  const availableCategories = useMemo(() => getAvailableCategories(allProjects), []);
  const availableTechnologies = useMemo(() => getAvailableTechnologies(allProjects), []);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return filterProjects(allProjects, {
      search: searchQuery,
      category: selectedCategory,
      technology: selectedTech,
      sortBy,
    });
  }, [searchQuery, selectedCategory, selectedTech, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== DEFAULT_CATEGORY ||
    selectedTech !== DEFAULT_TECH ||
    sortBy !== DEFAULT_SORT;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(DEFAULT_CATEGORY);
    setSelectedTech(DEFAULT_TECH);
    setSortBy(DEFAULT_SORT);
  };

  const getCategoryLabel = (catKey) => {
    switch (catKey) {
      case 'all':
        return t('caseStudies.filterAll');
      case 'fullstack':
        return t('caseStudies.filterFullstack');
      case 'webapp':
        return t('caseStudies.filterWebapp');
      case 'library':
        return t('caseStudies.filterLibrary');
      case 'game':
        return t('caseStudies.filterGame');
      default:
        return catKey.toUpperCase();
    }
  };

  return (
    <div className="w-full min-h-screen text-[var(--text-primary)] pt-24 pb-20 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumb / Back Button */}
        <motion.div {...getFadeMotion(0)} className="flex items-center justify-between">
          <RouterLink
            to="/"
            data-cursor-label="Back"
            className="cursor-target inline-flex items-center gap-2 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{t('caseStudies.backToHome')}</span>
          </RouterLink>

          <span
            role="status"
            aria-live="polite"
            className="font-mono text-xs text-[var(--text-muted)]"
          >
            {t('caseStudies.showingProjects')
              .replace('{count}', filteredProjects.length)
              .replace('{total}', allProjects.length)}
          </span>
        </motion.div>

        {/* Section Header */}
        <motion.header {...getFadeMotion(0.05)} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
              {t('caseStudies.sectionTag')}
            </span>
            <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
            <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
              {t('caseStudies.subTag')}
            </span>
          </div>

          <h1 className="font-grotesk font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-[var(--text-primary)] uppercase leading-none">
            {t('caseStudies.heading')}
            <span className="text-[var(--accent)]">.</span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {t('caseStudies.intro')}
          </p>
        </motion.header>

        {/* ==================================================
            ADVANCED SEARCH & FILTER CONTROLS TOOLBAR
            ================================================== */}
        <motion.div
          {...getFadeMotion(0.1)}
          className="relative z-20 space-y-4 p-5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)]"
        >
          {/* Top Row: Search Input + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                size={16}
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('caseStudies.searchPlaceholder')}
                aria-label={t('caseStudies.searchLabel')}
                className="w-full h-10 pl-10 pr-9 bg-[var(--surface-alt)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-md font-mono text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title={t('caseStudies.clearSearchAria')}
                  aria-label={t('caseStudies.clearSearchAria')}
                  data-cursor-label="Clear"
                  className="cursor-target absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiX size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Technology & Sort Dropdowns (custom listbox, consistent on mobile) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 shrink-0">
              <FilterDropdown
                value={selectedTech}
                onChange={setSelectedTech}
                label={t('caseStudies.techLabel')}
                icon={FiCode}
                cursorLabel="Tech"
                className="w-full sm:w-48 lg:w-52"
                options={[
                  { value: DEFAULT_TECH, label: t('caseStudies.allTech') },
                  ...availableTechnologies.map((tech) => ({ value: tech, label: tech })),
                ]}
              />
              <FilterDropdown
                value={sortBy}
                onChange={setSortBy}
                label={t('caseStudies.sortLabel')}
                icon={FiSliders}
                align="end"
                cursorLabel="Sort"
                className="w-full sm:w-48 lg:w-52"
                options={[
                  { value: 'featured', label: t('caseStudies.sortFeatured') },
                  { value: 'title-asc', label: t('caseStudies.sortNameAsc') },
                  { value: 'title-desc', label: t('caseStudies.sortNameDesc') },
                ]}
              />
            </div>
          </div>

          {/* Bottom Row: Category Filter Pills + Active Filter Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('caseStudies.categoryLabel')}>
              {availableCategories.map((catKey) => {
                const active = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    aria-pressed={active}
                    data-cursor-label="Filter"
                    className={`cursor-target px-3 py-1.5 rounded-md font-mono text-xs font-semibold tracking-wider whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                        : 'bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {getCategoryLabel(catKey)}
                  </button>
                );
              })}
            </div>

            {/* Reset Filters CTA if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                data-cursor-label="Reset"
                className="cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                <FiRotateCcw size={12} aria-hidden="true" />
                <span>{t('caseStudies.resetFilters')}</span>
              </button>
            )}
          </div>

          {/* Active Filter Summary Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-[var(--text-muted)]">
              <span className="text-[11px] uppercase tracking-wider">{t('caseStudies.activeFiltersLabel')}</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[11px]">
                  <span>&quot;{searchQuery.trim()}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-[var(--accent)] cursor-pointer"
                    aria-label={t('caseStudies.clearSearchAria')}
                  >
                    <FiX size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {selectedCategory !== DEFAULT_CATEGORY && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[11px]">
                  <span>{getCategoryLabel(selectedCategory)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(DEFAULT_CATEGORY)}
                    className="hover:text-[var(--accent)] cursor-pointer"
                    aria-label="Reset category"
                  >
                    <FiX size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {selectedTech !== DEFAULT_TECH && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--accent)] text-[11px]">
                  <span>{selectedTech}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTech(DEFAULT_TECH)}
                    className="hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label="Reset tech filter"
                  >
                    <FiX size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {sortBy !== DEFAULT_SORT && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[11px]">
                  <span>{sortBy === 'title-asc' ? 'A–Z' : 'Z–A'}</span>
                  <button
                    type="button"
                    onClick={() => setSortBy(DEFAULT_SORT)}
                    className="hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label="Reset sort"
                  >
                    <FiX size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* ==================================================
            PROJECT EXPLORER GRID & EMPTY STATE
            ================================================== */}
        {filteredProjects.length === 0 ? (
          <motion.div
            {...getFadeMotion(0.15)}
            className="p-12 text-center rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] mx-auto flex items-center justify-center text-[var(--text-muted)]">
              <FiFilter size={20} aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-grotesk font-black text-xl text-[var(--text-primary)] uppercase">
                {t('caseStudies.noResultsHeading')}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                {t('caseStudies.noResultsSub')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--accent)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiRotateCcw size={13} aria-hidden="true" />
              <span>{t('caseStudies.resetFilters')}</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => {
              const categoryLabel = project.category[language] || project.category.en;
              const descriptionText =
                project.description[language] || project.description.en;
              const subtitleText = project.subtitle
                ? project.subtitle[language] || project.subtitle.en
                : null;
              const isInternship = project.id === 'project-management';

              return (
                <motion.article
                  key={project.id}
                  {...getFadeMotion(0.06 * (idx % 6))}
                  className="group bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md"
                >
                  <div>
                    {/* Project Thumbnail */}
                    <div className="relative aspect-[16/9] w-full bg-[var(--surface-alt)] overflow-hidden border-b border-[var(--border-subtle)]">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-mono text-xs">
                          <FiLayers size={24} aria-hidden="true" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[var(--accent)] border border-[var(--border)] tracking-wider uppercase">
                          {categoryLabel}
                        </span>
                        {isInternship && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/85 backdrop-blur-sm text-blue-300 border border-blue-800 tracking-wider flex items-center gap-1">
                            <FiBriefcase size={10} aria-hidden="true" />
                            <span>PT. AMA SALAM</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <h2 className="font-grotesk font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {project.title}
                        </h2>
                        {subtitleText && (
                          <p className="font-mono text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                            {subtitleText}
                          </p>
                        )}
                      </div>

                      <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {descriptionText}
                      </p>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags.slice(0, 5).map((tag) => {
                          const isHighlighted =
                            selectedTech !== DEFAULT_TECH &&
                            tag.toLowerCase().includes(selectedTech.toLowerCase());

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setSelectedTech(tag)}
                              className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                isHighlighted
                                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]'
                                  : 'bg-[var(--surface-alt)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                              }`}
                              title={`Filter by ${tag}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                        {project.tags.length > 5 && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 text-[var(--text-muted)]">
                            +{project.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: External links (if available) + Read Case Study CTA */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] flex items-center justify-between">
                    <RouterLink
                      to={`/study-case/${project.id}`}
                      data-cursor-label="Study"
                      className="cursor-target inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
                    >
                      <span>{t('caseStudies.readCaseStudy')}</span>
                      <FiArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </RouterLink>

                    {/* Subtle External Links (GitHub & Live) if present */}
                    <div className="flex items-center gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="GitHub Repository"
                          aria-label={`${project.title} GitHub Repository (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                          data-cursor-label="Code"
                          className="cursor-target text-[var(--text-muted)] hover:text-[var(--accent)] p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        >
                          <FiGithub size={14} aria-hidden="true" />
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}
                      {project.npm && (
                        <a
                          href={project.npm}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="npm Package"
                          aria-label={`${project.title} npm Package (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                          data-cursor-label="npm"
                          className="cursor-target text-[var(--text-muted)] hover:text-[var(--accent)] p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        >
                          <SiNpm size={14} aria-hidden="true" />
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Live Demo"
                          aria-label={`${project.title} Live Demo (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                          className="text-[var(--text-muted)] hover:text-[var(--accent)] p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        >
                          <FiExternalLink size={14} aria-hidden="true" />
                          <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Back to Home CTA */}
        <motion.div {...getFadeMotion(0.2)} className="pt-8 text-center border-t border-[var(--border-subtle)]">
          <RouterLink
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{t('caseStudies.backToHome')}</span>
          </RouterLink>
        </motion.div>
      </div>
    </div>
  );
};

export default CaseStudyList;
