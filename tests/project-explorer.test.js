import test from 'node:test';
import assert from 'node:assert/strict';

import { allProjects, getProjectBySlug } from '../src/data/projects.js';
import {
  normalizeTechName,
  getAvailableTechnologies,
  getAvailableCategories,
  matchesSearch,
  matchesCategory,
  matchesTechnology,
  sortProjects,
  filterProjects,
} from '../src/utils/projectExplorer.js';
import { parseLocation } from '../src/utils/router.js';
import { translations } from '../src/data/translations.js';

test('CONF-05B — Advanced Project Explorer & Case Study Filter Test Suite', async (t) => {
  await t.test('1. Technology & Category Derivation', async (t2) => {
    await t2.test('normalizes minor framework variants consistently', () => {
      assert.equal(normalizeTechName('React.js'), 'React');
      assert.equal(normalizeTechName('Express.js'), 'Express');
      assert.equal(normalizeTechName('Next.js 15'), 'Next.js');
      assert.equal(normalizeTechName('TypeScript'), 'TypeScript');
      assert.equal(normalizeTechName(''), '');
      assert.equal(normalizeTechName(null), '');
    });

    await t2.test('derives technologies dynamically strictly from existing project dataset', () => {
      const techs = getAvailableTechnologies(allProjects);
      assert.ok(Array.isArray(techs), 'Should return an array');
      assert.ok(techs.length > 0, 'Should find technologies in dataset');

      // Key technologies that must exist
      assert.ok(techs.includes('React'), 'Must include React');
      assert.ok(techs.includes('TypeScript'), 'Must include TypeScript');
      assert.ok(techs.includes('Next.js'), 'Must include Next.js');
      assert.ok(techs.includes('PostgreSQL'), 'Must include PostgreSQL');
      assert.ok(techs.includes('Prisma'), 'Must include Prisma');
      assert.ok(techs.includes('Express'), 'Must include Express');
      assert.ok(techs.includes('Laravel'), 'Must include Laravel');

      // Technologies not in dataset must not be present
      assert.ok(!techs.includes('Python'), 'Must NOT include Python as no project uses it');
      assert.ok(!techs.includes('PHP'), 'Must NOT include PHP as no project has it in tags');
      assert.ok(!techs.includes('Ruby'), 'Must NOT include Ruby');
    });

    await t2.test('derives categories dynamically with "all" as first option', () => {
      const categories = getAvailableCategories(allProjects);
      assert.equal(categories[0], 'all');
      assert.ok(categories.includes('fullstack'));
      assert.ok(categories.includes('webapp'));
      assert.ok(categories.includes('game'));
    });
  });

  await t.test('2. Search Matching Logic', async (t2) => {
    await t2.test('matches projects by name (case-insensitive & trimmed)', () => {
      const matchAkses = allProjects.filter((p) => matchesSearch(p, '  akseskita  '));
      assert.equal(matchAkses.length, 1);
      assert.equal(matchAkses[0].id, 'akseskita');

      const matchCase = allProjects.filter((p) => matchesSearch(p, 'AKSESKITA'));
      assert.equal(matchCase.length, 1);

      const matchPartial = allProjects.filter((p) => matchesSearch(p, 'management'));
      assert.ok(matchPartial.some((p) => p.id === 'project-management'));
    });

    await t2.test('matches projects by technology stack keyword', () => {
      const matchPrisma = allProjects.filter((p) => matchesSearch(p, 'prisma'));
      assert.ok(matchPrisma.length >= 4);
      assert.ok(matchPrisma.every((p) => p.tags.some((t) => t.toLowerCase().includes('prisma'))));

      const matchRedis = allProjects.filter((p) => matchesSearch(p, 'redis'));
      assert.equal(matchRedis.length, 1);
      assert.equal(matchRedis[0].id, 'studyflow');
    });

    await t2.test('matches projects by subtitle and description', () => {
      // Subtitle search
      const matchSubtitle = allProjects.filter((p) => matchesSearch(p, 'Aksesibilitas Publik'));
      assert.ok(matchSubtitle.some((p) => p.id === 'akseskita'));

      // Description search
      const matchDesc = allProjects.filter((p) => matchesSearch(p, 'kanban'));
      assert.ok(matchDesc.some((p) => p.id === 'project-management'));
    });

    await t2.test('returns true when search query is empty or whitespace', () => {
      assert.equal(matchesSearch(allProjects[0], ''), true);
      assert.equal(matchesSearch(allProjects[0], '   '), true);
      assert.equal(matchesSearch(allProjects[0], null), true);
    });
  });

  await t.test('3. Category & Technology Filtering', async (t2) => {
    await t2.test('filters projects by categoryKey', () => {
      const fullstack = allProjects.filter((p) => matchesCategory(p, 'fullstack'));
      assert.ok(fullstack.length > 0);
      assert.ok(fullstack.every((p) => p.categoryKey === 'fullstack'));

      const games = allProjects.filter((p) => matchesCategory(p, 'game'));
      assert.equal(games.length, 2);
      assert.ok(games.some((p) => p.id === 'ecovoyage'));
      assert.ok(games.some((p) => p.id === 'a-day-at-home'));

      // 'all' category returns all projects
      const all = allProjects.filter((p) => matchesCategory(p, 'all'));
      assert.equal(all.length, allProjects.length);
    });

    await t2.test('filters projects by specific technology', () => {
      const tsProjects = allProjects.filter((p) => matchesTechnology(p, 'TypeScript'));
      assert.equal(tsProjects.length, 4);
      assert.ok(tsProjects.some((p) => p.id === 'akseskita'));
      assert.ok(tsProjects.some((p) => p.id === 'project-management'));
      assert.ok(tsProjects.some((p) => p.id === 'food-ecommerce'));
      assert.ok(tsProjects.some((p) => p.id === 'studyflow'));

      const supabaseProjects = allProjects.filter((p) => matchesTechnology(p, 'Supabase'));
      assert.equal(supabaseProjects.length, 2);
      assert.ok(supabaseProjects.some((p) => p.id === 'blue-horizon'));
      assert.ok(supabaseProjects.some((p) => p.id === 'class-1ia08'));

      // 'all' technology returns all projects
      const allTech = allProjects.filter((p) => matchesTechnology(p, 'all'));
      assert.equal(allTech.length, allProjects.length);
    });
  });

  await t.test('4. Sorting Behavior', async (t2) => {
    await t2.test('sorts alphabetically A to Z (title-asc)', () => {
      const sortedAsc = sortProjects(allProjects, 'title-asc');
      assert.equal(sortedAsc.length, allProjects.length);
      for (let i = 0; i < sortedAsc.length - 1; i++) {
        assert.ok(
          sortedAsc[i].title.localeCompare(sortedAsc[i + 1].title) <= 0,
          `Expected ${sortedAsc[i].title} to come before ${sortedAsc[i + 1].title}`
        );
      }
    });

    await t2.test('sorts alphabetically Z to A (title-desc)', () => {
      const sortedDesc = sortProjects(allProjects, 'title-desc');
      assert.equal(sortedDesc.length, allProjects.length);
      for (let i = 0; i < sortedDesc.length - 1; i++) {
        assert.ok(
          sortedDesc[i].title.localeCompare(sortedDesc[i + 1].title) >= 0,
          `Expected ${sortedDesc[i].title} to come after ${sortedDesc[i + 1].title}`
        );
      }
    });

    await t2.test('featured sorting preserves original curated order', () => {
      const featured = sortProjects(allProjects, 'featured');
      assert.deepEqual(featured.map((p) => p.id), allProjects.map((p) => p.id));
    });
  });

  await t.test('5. Combined Filter Pipeline (filterProjects)', async (t2) => {
    await t2.test('applies combined search, category, technology, and sort', () => {
      // Find fullstack projects using TypeScript
      const result = filterProjects(allProjects, {
        category: 'fullstack',
        technology: 'TypeScript',
        sortBy: 'title-asc',
      });

      assert.ok(result.length > 0);
      assert.ok(result.every((p) => p.categoryKey === 'fullstack'));
      assert.ok(result.every((p) => p.tags.includes('TypeScript')));

      // Check sorting order
      for (let i = 0; i < result.length - 1; i++) {
        assert.ok(result[i].title.localeCompare(result[i + 1].title) <= 0);
      }
    });

    await t2.test('handles empty results safely with empty array', () => {
      const result = filterProjects(allProjects, {
        search: 'NonexistentProjectXYZ999',
      });
      assert.deepEqual(result, []);

      // Tech mismatch with category
      const emptyCombined = filterProjects(allProjects, {
        category: 'game',
        technology: 'PostgreSQL',
      });
      assert.deepEqual(emptyCombined, []);
    });

    await t2.test('default filter parameters return all projects in featured order', () => {
      const defaultResult = filterProjects(allProjects);
      assert.equal(defaultResult.length, allProjects.length);
      assert.deepEqual(
        defaultResult.map((p) => p.id),
        allProjects.map((p) => p.id)
      );
    });
  });

  await t.test('6. Bilingual Translation Parity for Project Explorer', async (t2) => {
    await t2.test('shares identical keys across id and en caseStudies dictionaries', () => {
      const idKeys = Object.keys(translations.id.caseStudies).sort();
      const enKeys = Object.keys(translations.en.caseStudies).sort();
      assert.deepEqual(idKeys, enKeys, 'Both languages must have identical caseStudies keys');

      // Verify specific explorer keys
      const requiredKeys = [
        'searchLabel',
        'searchPlaceholder',
        'clearSearchAria',
        'categoryLabel',
        'techLabel',
        'allTech',
        'sortLabel',
        'sortFeatured',
        'sortNameAsc',
        'sortNameDesc',
        'filterAll',
        'filterFullstack',
        'filterWebapp',
        'filterGame',
        'showingProjects',
        'activeFiltersLabel',
        'resetFilters',
        'noResultsHeading',
        'noResultsSub',
      ];

      for (const key of requiredKeys) {
        assert.ok(key in translations.id.caseStudies, `id.caseStudies must have ${key}`);
        assert.ok(key in translations.en.caseStudies, `en.caseStudies must have ${key}`);
      }
    });
  });

  await t.test('7. Routing & Slug Resolution Regressions', async (t2) => {
    await t2.test('preserves /study-case list route and /study-case/:slug detail route', () => {
      const listLoc = parseLocation({ pathname: '/study-case', search: '', hash: '' });
      assert.equal(listLoc.route.type, 'study-case-list');

      const detailLoc = parseLocation({ pathname: '/study-case/akseskita', search: '', hash: '' });
      assert.equal(detailLoc.route.type, 'study-case-detail');
      assert.equal(detailLoc.route.slug, 'akseskita');
    });

    await t2.test('every project in allProjects resolves via getProjectBySlug', () => {
      for (const project of allProjects) {
        const resolved = getProjectBySlug(project.id);
        assert.ok(resolved, `Project ${project.id} must resolve`);
        assert.equal(resolved.title, project.title);
      }
    });

    await t2.test('preserves confidentiality of internship project (PT. AMA Salam Indonesia)', () => {
      const pmProject = getProjectBySlug('project-management');
      assert.ok(pmProject);
      assert.equal(pmProject.github, null, 'Internship repo must be null/confidential');
      assert.equal(pmProject.live, null, 'Internship live demo must be null/confidential');
    });
  });
});
