import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLocation } from '../src/utils/router.js';
import { allProjects, getProjectBySlug, selectedProjects, otherProjects } from '../src/data/projects.js';
import { translations } from '../src/data/translations.js';
import { updateDocumentMetadata } from '../src/utils/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('CONF-03 — Project Case Studies & Client-Side Routing Test Suite', async (t) => {
  await t.test('1. Client-Side Route Parsing (parseLocation)', async (t2) => {
    await t2.test('matches root / path to home route', () => {
      const parsedRoot = parseLocation({ pathname: '/', search: '', hash: '' });
      assert.equal(parsedRoot.route.type, 'home');
      assert.equal(parsedRoot.cleanPath, '/');

      const parsedTrailing = parseLocation({ pathname: '///', search: '', hash: '' });
      assert.equal(parsedTrailing.route.type, 'home');
    });

    await t2.test('matches /study-case to case study list route', () => {
      const parsedList = parseLocation({ pathname: '/study-case', search: '', hash: '' });
      assert.equal(parsedList.route.type, 'study-case-list');
      assert.equal(parsedList.cleanPath, '/study-case');

      const parsedListTrailing = parseLocation({ pathname: '/study-case/', search: '', hash: '' });
      assert.equal(parsedListTrailing.route.type, 'study-case-list');
    });

    await t2.test('matches /study-case/:slug to case study detail route with slug capture', () => {
      const parsedStudyFlow = parseLocation({ pathname: '/study-case/studyflow', search: '', hash: '' });
      assert.equal(parsedStudyFlow.route.type, 'study-case-detail');
      assert.equal(parsedStudyFlow.route.slug, 'studyflow');

      const parsedPM = parseLocation({ pathname: '/study-case/project-management', search: '', hash: '' });
      assert.equal(parsedPM.route.type, 'study-case-detail');
      assert.equal(parsedPM.route.slug, 'project-management');

      const parsedWithTrailing = parseLocation({ pathname: '/study-case/akseskita/', search: '', hash: '' });
      assert.equal(parsedWithTrailing.route.type, 'study-case-detail');
      assert.equal(parsedWithTrailing.route.slug, 'akseskita');
    });

    await t2.test('returns not-found route for arbitrary unknown paths', () => {
      const parsedUnknown = parseLocation({ pathname: '/random-page', search: '', hash: '' });
      assert.equal(parsedUnknown.route.type, 'not-found');
      assert.equal(parsedUnknown.route.requestedPath, '/random-page');

      const parsedNestedUnknown = parseLocation({ pathname: '/study-case/studyflow/deep/extra', search: '', hash: '' });
      assert.equal(parsedNestedUnknown.route.type, 'not-found');
    });

    await t2.test('preserves search query parameters and anchor hashes', () => {
      const parsed = parseLocation({ pathname: '/study-case', search: '?q=react', hash: '#filter' });
      assert.equal(parsed.search, '?q=react');
      assert.equal(parsed.hash, '#filter');
      assert.equal(parsed.route.type, 'study-case-list');
    });
  });

  await t.test('2. Project Data Resolution (getProjectBySlug & allProjects)', async (t2) => {
    await t2.test('allProjects contains all projects without duplicates', () => {
      assert.ok(Array.isArray(allProjects));
      assert.equal(allProjects.length, selectedProjects.length + otherProjects.length);

      const ids = allProjects.map((p) => p.id);
      const uniqueIds = new Set(ids);
      assert.equal(uniqueIds.size, ids.length, 'Every project ID must be unique');
    });

    await t2.test('resolves projects by slug case-insensitively', () => {
      const sf = getProjectBySlug('studyflow');
      assert.ok(sf, 'StudyFlow must be found');
      assert.equal(sf.id, 'studyflow');

      const sfUpper = getProjectBySlug('STUDYFLOW');
      assert.ok(sfUpper, 'Uppercase slug must resolve');
      assert.equal(sfUpper.id, 'studyflow');

      const ak = getProjectBySlug('akseskita');
      assert.ok(ak, 'AksesKita must be found');
      assert.equal(ak.id, 'akseskita');
    });

    await t2.test('returns null for nonexistent project slugs', () => {
      assert.equal(getProjectBySlug('non-existent-project-xyz'), null);
      assert.equal(getProjectBySlug(''), null);
      assert.equal(getProjectBySlug(null), null);
    });

    await t2.test('featured projects have enriched architectural details (problem, goals, process, learnings)', () => {
      const enrichedSlugs = ['studyflow', 'project-management', 'akseskita'];
      for (const slug of enrichedSlugs) {
        const p = getProjectBySlug(slug);
        assert.ok(p, `Project ${slug} must exist`);
        assert.ok(p.details, `Project ${slug} must have details`);
        assert.ok(p.details.problem, `Project ${slug} must have problem`);
        assert.ok(p.details.goals, `Project ${slug} must have goals`);
        assert.ok(p.details.process, `Project ${slug} must have process`);
        assert.ok(p.details.learnings, `Project ${slug} must have learnings`);
      }
    });
  });

  await t.test('3. Project Management System Internship Verification & Confidentiality', async (t2) => {
    await t2.test('verifies project-management public repository and live demo links are strictly null', () => {
      const pm = getProjectBySlug('project-management');
      assert.ok(pm, 'Project Management System must exist in projects');
      assert.equal(pm.github, null, 'github link must be strictly null to protect company private repo');
      assert.equal(pm.live, null, 'live link must be strictly null to avoid exposing internal deployment');
    });

    await t2.test('verifies project is explicitly identified with PT. AMA Salam Indonesia', () => {
      const pm = getProjectBySlug('project-management');
      const textCorpus = JSON.stringify(pm);
      assert.ok(
        textCorpus.includes('AMA Salam') || textCorpus.includes('PT AMA') || textCorpus.includes('PT. AMA'),
        'Project description or details must reference PT. AMA Salam Indonesia'
      );
    });
  });

  await t.test('4. Translation Parity for Case Studies', async (t2) => {
    await t2.test('has caseStudies dictionary in both id and en', () => {
      assert.ok(translations.id.caseStudies, 'translations.id.caseStudies must exist');
      assert.ok(translations.en.caseStudies, 'translations.en.caseStudies must exist');
    });

    await t2.test('shares identical keys across id and en caseStudies dictionaries', () => {
      const idKeys = Object.keys(translations.id.caseStudies).sort();
      const enKeys = Object.keys(translations.en.caseStudies).sort();
      assert.deepEqual(idKeys, enKeys, 'Both languages must have identical caseStudies keys');
    });

    await t2.test('has nav.caseStudies defined in both id and en', () => {
      assert.ok(translations.id.nav.caseStudies, 'id.nav.caseStudies must be defined');
      assert.ok(translations.en.nav.caseStudies, 'en.nav.caseStudies must be defined');
    });
  });

  await t.test('5. SEO Metadata Utility (updateDocumentMetadata)', async (t2) => {
    await t2.test('safely executes in DOM-less environment without throwing', () => {
      // In Node.js environment where document is not defined, it should silently return
      assert.doesNotThrow(() => {
        updateDocumentMetadata({
          title: 'Test Title',
          description: 'Test description',
          canonicalUrl: 'https://www.ighifari.my.id/study-case',
        });
      });
    });

    await t2.test('updates DOM elements when mock document is present', () => {
      const tags = {};
      const mockDoc = {
        title: '',
        querySelector: (sel) => tags[sel] || null,
        createElement: (name) => {
          const el = { tagName: name, setAttribute: (k, v) => { el[k] = v; } };
          return el;
        },
        head: {
          appendChild: (el) => {
            if (el.tagName === 'link' && el.rel === 'canonical') tags['link[rel="canonical"]'] = el;
            if (el.tagName === 'meta' && el.name) tags[`meta[name="${el.name}"]`] = el;
            if (el.tagName === 'meta' && el.property) tags[`meta[property="${el.property}"]`] = el;
          },
        },
      };

      global.document = mockDoc;
      try {
        updateDocumentMetadata({
          title: 'Custom Title',
          description: 'Custom Description',
          canonicalUrl: 'https://www.ighifari.my.id/study-case/studyflow',
          ogImage: 'https://www.ighifari.my.id/images/preview.webp',
        });

        assert.equal(mockDoc.title, 'Custom Title');
        assert.equal(tags['meta[name="description"]']?.content, 'Custom Description');
        assert.equal(tags['link[rel="canonical"]']?.href, 'https://www.ighifari.my.id/study-case/studyflow');
        assert.equal(tags['meta[property="og:title"]']?.content, 'Custom Title');
      } finally {
        delete global.document;
      }
    });
  });

  await t.test('6. Production Routing & Sitemap Integrity', async (t2) => {
    await t2.test('public/_redirects contains explicit 200 rewrites for /study-case routes', () => {
      const redirectsPath = path.join(rootDir, 'public', '_redirects');
      assert.ok(fs.existsSync(redirectsPath), '_redirects file must exist');

      const content = fs.readFileSync(redirectsPath, 'utf-8');
      assert.ok(
        /^\/study-case\s+\/index\.html\s+200/m.test(content),
        '_redirects must have /study-case -> /index.html 200'
      );
      assert.ok(
        /^\/study-case\/\*\s+\/index\.html\s+200/m.test(content),
        '_redirects must have /study-case/* -> /index.html 200'
      );
    });

    await t2.test('public/sitemap.xml contains home, listing, and project URLs', () => {
      const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
      assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');

      const xml = fs.readFileSync(sitemapPath, 'utf-8');
      assert.ok(xml.includes('<loc>https://www.ighifari.my.id/</loc>'));
      assert.ok(xml.includes('<loc>https://www.ighifari.my.id/study-case</loc>'));
      assert.ok(xml.includes('<loc>https://www.ighifari.my.id/study-case/studyflow</loc>'));
      assert.ok(xml.includes('<loc>https://www.ighifari.my.id/study-case/project-management</loc>'));
      assert.ok(xml.includes('<loc>https://www.ighifari.my.id/study-case/akseskita</loc>'));

      // Check XML well-formedness (closing tags match opening tags)
      assert.equal((xml.match(/<url>/g) || []).length, (xml.match(/<\/url>/g) || []).length);
      assert.ok(xml.endsWith('</urlset>\n') || xml.endsWith('</urlset>'));
    });
  });
});
