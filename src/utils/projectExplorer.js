/**
 * Project Explorer Utility Module
 *
 * Provides shared search, multi-criteria filtering (category, tech stack),
 * and sorting logic for the portfolio Project Explorer and Case Study views.
 */

export const DEFAULT_CATEGORY = 'all';
export const DEFAULT_TECH = 'all';
export const DEFAULT_SORT = 'featured';

export const SORT_OPTIONS = [
  { key: 'featured', label: { id: 'Unggulan / Relevansi', en: 'Featured / Relevance' } },
  { key: 'title-asc', label: { id: 'Nama (A–Z)', en: 'Name (A–Z)' } },
  { key: 'title-desc', label: { id: 'Nama (Z–A)', en: 'Name (Z–A)' } },
];

/**
 * Normalizes minor framework or library naming variations.
 * E.g., 'React.js' -> 'React', 'Express.js' -> 'Express', 'Next.js 15' -> 'Next.js'.
 */
export const normalizeTechName = (tech = '') => {
  if (!tech || typeof tech !== 'string') return '';
  const trimmed = tech.trim();
  if (trimmed === 'React.js') return 'React';
  if (trimmed === 'Express.js') return 'Express';
  if (trimmed === 'Next.js 15') return 'Next.js';
  return trimmed;
};

/**
 * Derives unique, sorted list of technologies strictly present in the project dataset.
 * Guarantees no phantom technologies are displayed.
 */
export const getAvailableTechnologies = (projects = []) => {
  if (!Array.isArray(projects)) return [];
  const techSet = new Set();

  projects.forEach((project) => {
    (project?.tags || []).forEach((tag) => {
      const normalized = normalizeTechName(tag);
      if (normalized) {
        techSet.add(normalized);
      }
    });
  });

  return Array.from(techSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Derives unique category keys present in the project dataset.
 * Always includes 'all' as the default first option.
 */
export const getAvailableCategories = (projects = []) => {
  if (!Array.isArray(projects)) return [DEFAULT_CATEGORY];
  const categorySet = new Set();

  projects.forEach((project) => {
    if (project?.categoryKey) {
      categorySet.add(project.categoryKey);
    }
  });

  return [DEFAULT_CATEGORY, ...Array.from(categorySet)];
};

/**
 * Evaluates whether a project matches a search query across:
 * - Project title
 * - Subtitle (Indonesian & English)
 * - Description (Indonesian & English)
 * - Technologies / tags (raw and normalized)
 * - Category names (Indonesian, English, and categoryKey)
 * - Project ID
 */
export const matchesSearch = (project, query = '') => {
  if (!query || typeof query !== 'string') return true;
  const term = query.trim().toLowerCase();
  if (!term) return true;
  if (!project) return false;

  // Title & ID
  if (project.title?.toLowerCase().includes(term)) return true;
  if (project.id?.toLowerCase().includes(term)) return true;

  // Subtitle
  const subId = (project.subtitle?.id || '').toLowerCase();
  const subEn = (project.subtitle?.en || '').toLowerCase();
  if (subId.includes(term) || subEn.includes(term)) return true;

  // Description
  const descId = (project.description?.id || '').toLowerCase();
  const descEn = (project.description?.en || '').toLowerCase();
  if (descId.includes(term) || descEn.includes(term)) return true;

  // Category
  const catKey = (project.categoryKey || '').toLowerCase();
  const catId = (project.category?.id || '').toLowerCase();
  const catEn = (project.category?.en || '').toLowerCase();
  if (catKey.includes(term) || catId.includes(term) || catEn.includes(term)) return true;

  // Tags
  const tagsMatch = (project.tags || []).some((tag) => {
    const rawTag = tag.toLowerCase();
    const normTag = normalizeTechName(tag).toLowerCase();
    return rawTag.includes(term) || normTag.includes(term);
  });
  if (tagsMatch) return true;

  return false;
};

/**
 * Evaluates whether a project matches a category key.
 */
export const matchesCategory = (project, categoryKey = DEFAULT_CATEGORY) => {
  if (!categoryKey || categoryKey === DEFAULT_CATEGORY) return true;
  return project?.categoryKey === categoryKey;
};

/**
 * Evaluates whether a project contains the selected technology.
 */
export const matchesTechnology = (project, selectedTech = DEFAULT_TECH) => {
  if (!selectedTech || selectedTech === DEFAULT_TECH) return true;
  const target = selectedTech.trim().toLowerCase();

  return (project?.tags || []).some((tag) => {
    const normalized = normalizeTechName(tag).toLowerCase();
    const raw = tag.toLowerCase();
    return normalized === target || raw === target;
  });
};

/**
 * Sorts project array by specified criteria.
 * Returns a new array without mutating the input.
 */
export const sortProjects = (projects = [], sortBy = DEFAULT_SORT) => {
  if (!Array.isArray(projects)) return [];
  const copy = [...projects];

  switch (sortBy) {
    case 'title-asc':
      return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'title-desc':
      return copy.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'featured':
    default:
      // Preserves original curated order (featured selected projects first)
      return copy;
  }
};

/**
 * Comprehensive project filter pipeline combining search, category, technology, and sorting.
 */
export const filterProjects = (
  projects = [],
  {
    search = '',
    category = DEFAULT_CATEGORY,
    technology = DEFAULT_TECH,
    sortBy = DEFAULT_SORT,
  } = {}
) => {
  if (!Array.isArray(projects)) return [];

  const filtered = projects.filter((project) => {
    return (
      matchesCategory(project, category) &&
      matchesTechnology(project, technology) &&
      matchesSearch(project, search)
    );
  });

  return sortProjects(filtered, sortBy);
};
