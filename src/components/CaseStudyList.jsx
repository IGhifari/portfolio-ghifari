import { useState, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiSearch,
  FiArrowLeft,
  FiBriefcase,
  FiLayers,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { RouterLink } from '../context/RouterContext';
import { allProjects } from '../data/projects';
import { updateDocumentMetadata } from '../utils/seo';

const CaseStudyList = () => {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
        ? 'Studi Kasus Rekayasa Perangkat Lunak | M. Ghifari Bima Khadafi'
        : 'Engineering Case Studies | M. Ghifari Bima Khadafi';
    const description =
      language === 'id'
        ? 'Bedah arsitektur teknis, analisis permasalahan, dan implementasi rekayasa perangkat lunak pada proyek-proyek pilihan M. Ghifari Bima Khadafi.'
        : 'In-depth technical architecture breakdowns, problem evaluations, and software engineering implementations by M. Ghifari Bima Khadafi.';

    updateDocumentMetadata({
      title,
      description,
      canonicalPath: '/study-case',
      ogTitle: title,
      ogDescription: description,
      ogImage: '/portfolio.png',
    });
  }, [language]);

  // Filtered case studies
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Category filter
      if (selectedFilter === 'fullstack' && project.categoryKey !== 'fullstack') return false;
      if (selectedFilter === 'webapp' && project.categoryKey !== 'webapp') return false;
      if (selectedFilter === 'internship' && project.id !== 'project-management' && project.id !== 'internship-journal') {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = project.title.toLowerCase().includes(query);
        const descMatch = (project.description[language] || project.description.en || '').toLowerCase().includes(query);
        const tagsMatch = project.tags.some((t) => t.toLowerCase().includes(query));
        return titleMatch || descMatch || tagsMatch;
      }

      return true;
    });
  }, [language, searchQuery, selectedFilter]);

  return (
    <div className="w-full min-h-screen text-[var(--text-primary)] pt-24 pb-20 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Breadcrumb / Back Button */}
        <motion.div {...getFadeMotion(0)} className="flex items-center justify-between">
          <RouterLink
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <FiArrowLeft size={14} aria-hidden="true" />
            <span>{t('caseStudies.backToHome')}</span>
          </RouterLink>

          <span className="font-mono text-xs text-[var(--text-muted)]">
            {filteredProjects.length} {language === 'id' ? 'Proyek' : 'Projects'}
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
            {t('caseStudies.heading')}<span className="text-[var(--accent)]">.</span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {t('caseStudies.intro')}
          </p>
        </motion.header>

        {/* Search & Filter Toolbar */}
        <motion.div
          {...getFadeMotion(0.1)}
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)]"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={16}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('caseStudies.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface-alt)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-md font-mono text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" role="tablist">
            {[
              { key: 'all', label: t('caseStudies.filterAll') },
              { key: 'fullstack', label: t('caseStudies.filterFullstack') },
              { key: 'webapp', label: t('caseStudies.filterWebapp') },
              { key: 'internship', label: t('caseStudies.filterInternship') },
            ].map(({ key, label }) => {
              const active = selectedFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedFilter(key)}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                      : 'bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Case Studies Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] space-y-4">
            <p className="font-mono text-sm text-[var(--text-secondary)]">
              {t('caseStudies.noResults')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--accent)] transition-colors cursor-pointer"
            >
              <span>{t('caseStudies.viewAll')}</span>
            </button>
          </div>
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
                  {...getFadeMotion(0.08 * (idx % 6))}
                  className="group bg-[var(--surface-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300"
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
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[var(--accent)] border border-[var(--border)] tracking-wider uppercase">
                          {categoryLabel}
                        </span>
                        {isInternship && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/80 backdrop-blur-sm text-blue-300 border border-blue-800 tracking-wider flex items-center gap-1">
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
                          <p className="font-mono text-xs text-[var(--text-muted)] mt-1">
                            {subtitleText}
                          </p>
                        )}
                      </div>

                      <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {descriptionText}
                      </p>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 5 && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 text-[var(--text-muted)]">
                            +{project.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card CTA Footer */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                    <RouterLink
                      to={`/study-case/${project.id}`}
                      className="inline-flex items-center justify-between w-full py-2 font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors"
                    >
                      <span>{t('caseStudies.readCaseStudy')}</span>
                      <FiArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </RouterLink>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer"
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
