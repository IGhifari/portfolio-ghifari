import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations } from '../src/data/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to normalize file text
const readNormalized = (relPath) =>
  fs.readFileSync(path.join(rootDir, relPath), 'utf-8').replace(/\r\n/g, '\n');

test('STAGE 8B Sprint 4 — Final Accessibility Regression & Low Findings Validation', async (t) => {
  // ==========================================
  // 1. LOW-01: Floating Utilities DOM Tab Order
  // ==========================================
  await t.test('1. LOW-01 — Floating Utilities DOM Tab Order in App.jsx', async (t2) => {
    const appContent = readNormalized('src/App.jsx');

    await t2.test('Navbar is placed before main-content and floating utilities in DOM', () => {
      const skipIndex = appContent.indexOf('href="#main-content"');
      const navbarIndex = appContent.indexOf('<Navbar');
      const mainIndex = appContent.indexOf('id="main-content"');
      const soundIndex = appContent.indexOf('<SoundButton');
      const chatIndex = appContent.indexOf('<ChatAssistant');
      const termIndex = appContent.indexOf('<DeveloperTerminal');

      // Sequential order validation
      assert.ok(skipIndex > 0, 'Skip link must exist');
      assert.ok(navbarIndex > skipIndex, 'Navbar must follow skip link');
      assert.ok(mainIndex > navbarIndex, 'Main content must follow Navbar');
      assert.ok(soundIndex > mainIndex, 'SoundButton must follow Main content');
      assert.ok(chatIndex > mainIndex, 'ChatAssistant must follow Main content');
      assert.ok(termIndex > mainIndex, 'DeveloperTerminal must follow Main content');
    });

    await t2.test('Floating utilities are housed in accessible landmark <aside>', () => {
      assert.ok(
        appContent.includes("<aside aria-label={t('nav.floatingUtilities')"),
        'App.jsx must wrap floating utilities in <aside aria-label=...>'
      );
    });
  });

  // ==========================================
  // 2. LOW-02: Screen Reader Notice for target="_blank" External Links
  // ==========================================
  await t.test('2. LOW-02 — External Link Screen Reader Notices for target="_blank"', async (t2) => {
    await t2.test('defines nav.opensNewTab translation in both dictionaries', () => {
      assert.equal(typeof translations.id.nav.opensNewTab, 'string');
      assert.equal(typeof translations.en.nav.opensNewTab, 'string');
      assert.equal(translations.id.nav.opensNewTab, 'membuka di tab baru');
      assert.equal(translations.en.nav.opensNewTab, 'opens in a new tab');
    });

    await t2.test('Profile.jsx external links provide accessible new-tab notice', () => {
      const profile = readNormalized('src/components/Profile.jsx');
      assert.ok(profile.includes("t('nav.opensNewTab')"), 'Profile.jsx must use nav.opensNewTab');
      assert.ok(profile.includes('sr-only'), 'Profile.jsx must include sr-only notice');
    });

    await t2.test('Navbar.jsx CV download provides accessible new-tab notice', () => {
      const navbar = readNormalized('src/components/Navbar.jsx');
      assert.ok(navbar.includes("t('nav.opensNewTab')"), 'Navbar.jsx must use nav.opensNewTab');
    });

    await t2.test('Project.jsx external repository and demo links provide accessible new-tab notice', () => {
      const project = readNormalized('src/components/Project.jsx');
      assert.ok(project.includes("t('nav.opensNewTab')"), 'Project.jsx must use nav.opensNewTab');
    });

    await t2.test('RecruiterMode.jsx external links provide accessible new-tab notice', () => {
      const recruiter = readNormalized('src/components/RecruiterMode.jsx');
      assert.ok(recruiter.includes("t('nav.opensNewTab')"), 'RecruiterMode.jsx must use nav.opensNewTab');
    });

    await t2.test('CaseStudyDetail.jsx and CaseStudyList.jsx include new-tab notices', () => {
      const csDetail = readNormalized('src/components/CaseStudyDetail.jsx');
      const csList = readNormalized('src/components/CaseStudyList.jsx');
      assert.ok(csDetail.includes("t('nav.opensNewTab')"), 'CaseStudyDetail.jsx must use nav.opensNewTab');
      assert.ok(csList.includes("t('nav.opensNewTab')"), 'CaseStudyList.jsx must use nav.opensNewTab');
    });

    await t2.test('DeveloperTerminal.jsx, Certificate.jsx, GithubActivity.jsx, and Footer.jsx include new-tab notices', () => {
      const term = readNormalized('src/components/DeveloperTerminal.jsx');
      const cert = readNormalized('src/components/Certificate.jsx');
      const github = readNormalized('src/components/GithubActivity.jsx');
      const footer = readNormalized('src/components/Footer.jsx');

      assert.ok(term.includes("t('nav.opensNewTab')"), 'DeveloperTerminal.jsx must use nav.opensNewTab');
      assert.ok(cert.includes("t('nav.opensNewTab')"), 'Certificate.jsx must use nav.opensNewTab');
      assert.ok(github.includes("t('nav.opensNewTab')"), 'GithubActivity.jsx must use nav.opensNewTab');
      assert.ok(footer.includes("t('nav.opensNewTab')"), 'Footer.jsx must use nav.opensNewTab');
    });
  });

  // ==========================================
  // 3. LOW-03: aria-live Search Results in CaseStudyList.jsx
  // ==========================================
  await t.test('3. LOW-03 — CaseStudyList Search Results Live Announcement', async (t2) => {
    const listContent = readNormalized('src/components/CaseStudyList.jsx');

    await t2.test('confirms role="status" and aria-live="polite" on results counter', () => {
      assert.ok(listContent.includes('role="status"'), 'CaseStudyList must have role="status"');
      assert.ok(listContent.includes('aria-live="polite"'), 'CaseStudyList must have aria-live="polite"');
      assert.ok(
        listContent.includes("t('caseStudies.showingProjects')"),
        'Live region must wrap project count string'
      );
    });
  });

  // ==========================================
  // 4. LOW-04: Chat Assistant Heading Hierarchy
  // ==========================================
  await t.test('4. LOW-04 — ChatAssistant Heading Hierarchy Isolation', async (t2) => {
    const chatContent = readNormalized('src/components/ChatAssistant.jsx');

    await t2.test('ChatAssistant does NOT render conflicting <h2> element in document flow', () => {
      assert.ok(
        !chatContent.includes('<h2'),
        'ChatAssistant must not render <h2 to avoid document outline pollution'
      );
    });

    await t2.test('ChatAssistant uses span with role="heading" aria-level="2"', () => {
      assert.ok(
        chatContent.includes('role="heading"') && chatContent.includes('aria-level="2"'),
        'ChatAssistant header must use role="heading" aria-level="2"'
      );
    });
  });

  // ==========================================
  // 5. Complete Translation Parity Verification
  // ==========================================
  await t.test('5. Complete Translation Dictionary Parity (ID vs EN)', () => {
    const checkObjectParity = (idObj, enObj, currentPath = '') => {
      const idKeys = Object.keys(idObj).sort();
      const enKeys = Object.keys(enObj).sort();

      assert.deepEqual(
        idKeys,
        enKeys,
        `Keys mismatch at "${currentPath}":\nID: ${idKeys.join(', ')}\nEN: ${enKeys.join(', ')}`
      );

      for (const key of idKeys) {
        const idVal = idObj[key];
        const enVal = enObj[key];
        const nextPath = currentPath ? `${currentPath}.${key}` : key;

        assert.equal(
          typeof idVal,
          typeof enVal,
          `Type mismatch at "${nextPath}": id is ${typeof idVal}, en is ${typeof enVal}`
        );

        if (typeof idVal === 'object' && idVal !== null) {
          checkObjectParity(idVal, enVal, nextPath);
        } else {
          assert.ok(
            typeof idVal === 'string' && idVal.length > 0,
            `Empty translation at "${nextPath}" (id)`
          );
          assert.ok(
            typeof enVal === 'string' && enVal.length > 0,
            `Empty translation at "${nextPath}" (en)`
          );
        }
      }
    };

    checkObjectParity(translations.id, translations.en);
  });
});
