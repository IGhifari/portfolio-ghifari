import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLocation } from '../src/utils/router.js';
import { profileData } from '../src/data/profile.js';
import { experiences } from '../src/data/experience.js';
import { educationMetadata } from '../src/data/education.js';
import { selectedProjects } from '../src/data/projects.js';
import { directEmail } from '../src/data/contact.js';
import { RESUME_URL, RESUME_FILENAME, RESUME_AVAILABLE } from '../src/data/resume.js';
import { translations } from '../src/data/translations.js';
import { generateRecruiterSchema, SITE_ORIGIN } from '../src/utils/seo.js';
import {
  NAVIGATION_TARGETS,
  executeTerminalCommand,
} from '../src/utils/terminalCommands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('CONF-06 — Recruiter Mode & Executive Overview Test Suite', async (t) => {
  await t.test('1. Recruiter Route Parsing & Direct Route Access', async (t2) => {
    await t2.test('matches clean /recruiter path to recruiter route', () => {
      const parsed = parseLocation({ pathname: '/recruiter', search: '', hash: '' });
      assert.equal(parsed.route.type, 'recruiter');
      assert.equal(parsed.cleanPath, '/recruiter');
      assert.equal(parsed.pathname, '/recruiter');
    });

    await t2.test('matches /recruiter/ with trailing slash to recruiter route', () => {
      const parsedTrailing = parseLocation({ pathname: '/recruiter/', search: '', hash: '' });
      assert.equal(parsedTrailing.route.type, 'recruiter');
      assert.equal(parsedTrailing.cleanPath, '/recruiter');
    });

    await t2.test('preserves query parameters and anchor hashes on /recruiter', () => {
      const parsedWithParams = parseLocation({
        pathname: '/recruiter',
        search: '?ref=linkedin',
        hash: '#contact',
      });
      assert.equal(parsedWithParams.route.type, 'recruiter');
      assert.equal(parsedWithParams.search, '?ref=linkedin');
      assert.equal(parsedWithParams.hash, '#contact');
    });

    await t2.test('preserves existing routes without regression', () => {
      assert.equal(parseLocation({ pathname: '/' }).route.type, 'home');
      assert.equal(parseLocation({ pathname: '/study-case' }).route.type, 'study-case-list');
      assert.equal(
        parseLocation({ pathname: '/study-case/akseskita' }).route.type,
        'study-case-detail'
      );
      assert.equal(parseLocation({ pathname: '/unknown-route' }).route.type, 'not-found');
    });
  });

  await t.test('2. Profile Information & Verified Metadata Integrity', async (t2) => {
    await t2.test('verifies developer identity matches canonical profile', () => {
      assert.equal(profileData.fullName, 'M. Ghifari Bima Khadafi');
      assert.equal(profileData.socials.github, 'https://github.com/IGhifari');
      assert.equal(profileData.socials.linkedin, 'https://www.linkedin.com/in/ighifari/');
      assert.equal(directEmail, 'ighifarii05@gmail.com');
    });

    await t2.test('verifies current higher education and vocational background', () => {
      assert.ok(educationMetadata.gunadarma, 'Gunadarma metadata exists');
      assert.equal(educationMetadata.gunadarma.institution, 'Universitas Gunadarma');
      assert.equal(educationMetadata.gunadarma.isCurrent, true);

      assert.ok(educationMetadata.smkn1Cibinong, 'SMKN 1 Cibinong metadata exists');
      assert.equal(educationMetadata.smkn1Cibinong.institution, 'SMKN 1 Cibinong');
      assert.equal(educationMetadata.smkn1Cibinong.period, '2023 — 2026');
    });

    await t2.test('verifies work experience contains PT. AMA Salam Indonesia internship', () => {
      const amaSalam = experiences.find((e) => e.id === 'ama-salam');
      assert.ok(amaSalam, 'AMA Salam internship entry exists');
      assert.equal(amaSalam.company, 'PT. AMA Salam Indonesia');
      assert.equal(amaSalam.role.en, 'Frontend Developer Intern');
      assert.equal(amaSalam.type.en, 'Industrial Internship');
      assert.equal(amaSalam.projectRef, 'project-management');
      assert.ok(Array.isArray(amaSalam.technologies));
      assert.ok(amaSalam.technologies.includes('React'));
      assert.ok(amaSalam.technologies.includes('TypeScript'));
    });
  });

  await t.test('3. Featured Projects & Corporate Confidentiality Enforcement', async (t2) => {
    await t2.test('showcases verified projects with valid case study slugs', () => {
      const projectIds = selectedProjects.map((p) => p.id);
      assert.ok(projectIds.includes('akseskita'), 'AksesKita is in selected projects');
      assert.ok(projectIds.includes('project-management'), 'Project Management is in selected projects');
      assert.ok(projectIds.includes('food-ecommerce'), 'Food E-Commerce is in selected projects');
    });

    await t2.test('strictly withholds public repository & deployment for PT. AMA Salam internal project', () => {
      const pmProject = selectedProjects.find((p) => p.id === 'project-management');
      assert.ok(pmProject, 'Project Management entry exists');
      assert.equal(pmProject.github, null, 'Internal project GitHub must be null');
      assert.equal(pmProject.live, null, 'Internal project Live demo must be null');
      assert.ok(
        pmProject.subtitle.id.includes('PT. AMA Salam Indonesia'),
        'Identified with PT. AMA Salam Indonesia'
      );
    });

    await t2.test('public showcase projects have verified links', () => {
      const akseskita = selectedProjects.find((p) => p.id === 'akseskita');
      assert.ok(akseskita.github.startsWith('https://github.com/'));
      assert.ok(akseskita.live.startsWith('https://'));
    });
  });

  await t.test('4. CV / Resume Asset Integrity', async (t2) => {
    await t2.test('CV download configuration is enabled and points to valid asset', () => {
      assert.equal(RESUME_AVAILABLE, true, 'RESUME_AVAILABLE must be true');
      assert.equal(RESUME_FILENAME, 'M.GhifariBimaKhadafi_CV.pdf');
      assert.equal(RESUME_URL, '/docs/M.GhifariBimaKhadafi_CV.pdf');
    });

    await t2.test('CV PDF file physically exists in public directory and has non-zero size', () => {
      const cvFilePath = path.join(rootDir, 'public', 'docs', 'M.GhifariBimaKhadafi_CV.pdf');
      assert.ok(fs.existsSync(cvFilePath), 'CV file must exist at public/docs/M.GhifariBimaKhadafi_CV.pdf');
      const stats = fs.statSync(cvFilePath);
      assert.ok(stats.size > 1000, `CV PDF must be non-empty (actual size: ${stats.size} bytes)`);
    });
  });

  await t.test('5. Translation Parity (ID / EN)', async (t2) => {
    await t2.test('shares identical keys across id and en recruiter dictionaries', () => {
      assert.ok(translations.id.recruiter, 'translations.id.recruiter exists');
      assert.ok(translations.en.recruiter, 'translations.en.recruiter exists');

      const idKeys = Object.keys(translations.id.recruiter).sort();
      const enKeys = Object.keys(translations.en.recruiter).sort();

      assert.deepEqual(
        idKeys,
        enKeys,
        `Recruiter translation keys must match exactly. Missing in EN: ${idKeys.filter(
          (k) => !enKeys.includes(k)
        ).join(', ')}. Missing in ID: ${enKeys.filter((k) => !idKeys.includes(k)).join(', ')}`
      );
    });

    await t2.test('has nav recruiter labels defined in both languages', () => {
      assert.equal(typeof translations.id.nav.recruiter, 'string');
      assert.equal(typeof translations.en.nav.recruiter, 'string');
      assert.equal(typeof translations.id.nav.forRecruiters, 'string');
      assert.equal(typeof translations.en.nav.forRecruiters, 'string');
    });
  });

  await t.test('6. SEO Metadata & Sitemap Indexing', async (t2) => {
    await t2.test('generateRecruiterSchema produces valid Schema.org ProfilePage', () => {
      const schema = generateRecruiterSchema();
      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'ProfilePage');
      assert.equal(schema.url, `${SITE_ORIGIN}/recruiter`);
      assert.equal(schema.mainEntity.name, 'M. Ghifari Bima Khadafi');
      assert.ok(Array.isArray(schema.mainEntity.sameAs));
      assert.ok(schema.mainEntity.sameAs.includes('https://github.com/IGhifari'));
    });

    await t2.test('sitemap.xml contains /recruiter URL with appropriate priority', () => {
      const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      assert.ok(
        sitemapContent.includes('<loc>https://www.ighifari.my.id/recruiter</loc>'),
        'sitemap.xml must list https://www.ighifari.my.id/recruiter'
      );
    });

    await t2.test('prerender script includes /recruiter generation step', () => {
      const prerenderScriptPath = path.join(rootDir, 'scripts', 'generate-static-seo.js');
      const scriptContent = fs.readFileSync(prerenderScriptPath, 'utf8');
      assert.ok(
        scriptContent.includes('/recruiter/index.html'),
        'generate-static-seo.js must generate /recruiter/index.html'
      );
    });
  });

  await t.test('7. Terminal Navigation Integration', async (t2) => {
    await t2.test('NAVIGATION_TARGETS includes recruiter destination', () => {
      assert.ok(NAVIGATION_TARGETS.recruiter);
      assert.equal(NAVIGATION_TARGETS.recruiter.type, 'route');
      assert.equal(NAVIGATION_TARGETS.recruiter.url, '/recruiter');
    });

    await t2.test('executing "recruiter" navigates to /recruiter', () => {
      let navigatedTo = null;
      const res = executeTerminalCommand('recruiter', {
        language: 'en',
        onNavigate: (url) => {
          navigatedTo = url;
        },
      });
      assert.equal(res.type, 'navigate');
      assert.equal(res.url, '/recruiter');
      assert.equal(navigatedTo, '/recruiter');
    });

    await t2.test('executing "open recruiter" navigates to /recruiter', () => {
      let navigatedTo = null;
      const res = executeTerminalCommand('open recruiter', {
        language: 'en',
        onNavigate: (url) => {
          navigatedTo = url;
        },
      });
      assert.equal(res.type, 'navigate');
      assert.equal(res.url, '/recruiter');
      assert.equal(navigatedTo, '/recruiter');
    });
  });
});
