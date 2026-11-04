import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations } from '../src/data/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('STAGE 8B Sprint 1 — Critical & Keyboard Navigation Accessibility Fixes', async (t) => {
  // ==========================================
  // 1. HIGH-01: Skip Navigation Link
  // ==========================================
  await t.test('1. Skip Navigation Link & Semantic Focus Target', async (t2) => {
    await t2.test('defines nav.skipToContent translation in both id and en dictionaries', () => {
      assert.equal(typeof translations.id.nav.skipToContent, 'string');
      assert.equal(typeof translations.en.nav.skipToContent, 'string');
      assert.equal(translations.id.nav.skipToContent, 'Lewati ke konten utama');
      assert.equal(translations.en.nav.skipToContent, 'Skip to main content');
    });

    await t2.test('App.jsx renders Skip Link targeting #main-content as first interactive element', () => {
      const appContent = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf-8');

      // Must have skip link pointing to #main-content
      assert.ok(appContent.includes('href="#main-content"'), 'App.jsx must have href="#main-content" skip link');
      assert.ok(appContent.includes('sr-only focus:not-sr-only'), 'Skip link must be visually hidden until keyboard focus');
      assert.ok(appContent.includes('focus:fixed'), 'Skip link must pop into viewport when focused');
      assert.ok(appContent.includes("t('nav.skipToContent')"), 'Skip link must use bilingual translation key');

      // Skip link must appear before Navbar and floating utilities in DOM
      const skipIndex = appContent.indexOf('href="#main-content"');
      const navbarIndex = appContent.indexOf('<Navbar');
      assert.ok(skipIndex > 0 && skipIndex < navbarIndex, 'Skip link must be placed before Navbar in DOM');

      // Main content container must have tabIndex={-1} for focus retention
      assert.ok(appContent.includes('id="main-content" tabIndex={-1}'), 'Main element must have tabIndex={-1} for keyboard focus');
    });
  });

  // ==========================================
  // 2. CRIT-01: GitHub Activity Heatmap Roving TabIndex
  // ==========================================
  await t.test('2. CRIT-01 — GitHub Heatmap Roving TabIndex & Keyboard Traversal', async (t2) => {
    const githubContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'GithubActivity.jsx'), 'utf-8');

    await t2.test('ensures day cells use roving tabIndex (isFocused ? 0 : -1)', () => {
      // Must not have hardcoded tabIndex={0}
      assert.ok(!githubContent.includes('tabIndex={0}'), 'Day cells must NOT have hardcoded tabIndex={0}');
      // Must use dynamic roving condition
      assert.ok(githubContent.includes('tabIndex={isFocused ? 0 : -1}'), 'Day cells must use tabIndex={isFocused ? 0 : -1}');
    });

    await t2.test('supports full 2D arrow key and Home/End navigation', () => {
      assert.ok(githubContent.includes('handleCellKeyDown'), 'GithubActivity must implement handleCellKeyDown');
      assert.ok(githubContent.includes('ArrowDown'), 'Must handle ArrowDown key');
      assert.ok(githubContent.includes('ArrowUp'), 'Must handle ArrowUp key');
      assert.ok(githubContent.includes('ArrowRight'), 'Must handle ArrowRight key');
      assert.ok(githubContent.includes('ArrowLeft'), 'Must handle ArrowLeft key');
      assert.ok(githubContent.includes('Home'), 'Must handle Home key');
      assert.ok(githubContent.includes('End'), 'Must handle End key');
    });

    await t2.test('simulates roving tabIndex math for 53-week grid columns', () => {
      const totalDays = 371; // 53 weeks * 7 days

      // Helper function simulating handleCellKeyDown logic
      const simulateKey = (key, current) => {
        switch (key) {
          case 'ArrowDown':
            return Math.min(totalDays - 1, current + 1);
          case 'ArrowUp':
            return Math.max(0, current - 1);
          case 'ArrowRight':
            return Math.min(totalDays - 1, current + 7);
          case 'ArrowLeft':
            return Math.max(0, current - 7);
          case 'Home':
            return 0;
          case 'End':
            return totalDays - 1;
          default:
            return current;
        }
      };

      // Test bounds & stepping
      assert.equal(simulateKey('ArrowDown', 370), 370, 'ArrowDown at boundary should stay at boundary');
      assert.equal(simulateKey('ArrowUp', 370), 369, 'ArrowUp should move 1 day back');
      assert.equal(simulateKey('ArrowLeft', 370), 363, 'ArrowLeft should jump 1 week back (-7 days)');
      assert.equal(simulateKey('ArrowRight', 363), 370, 'ArrowRight should jump 1 week forward (+7 days)');
      assert.equal(simulateKey('Home', 370), 0, 'Home should jump to day 0');
      assert.equal(simulateKey('ArrowUp', 0), 0, 'ArrowUp at index 0 should stay at 0');
      assert.equal(simulateKey('End', 0), 370, 'End should jump to day 370');
    });

    await t2.test('provides accessible grid label and aria-selected on active cell', () => {
      assert.ok(githubContent.includes('aria-selected={isFocused}'), 'Day cells must communicate selected state via aria-selected');
      assert.ok(githubContent.includes('role="gridcell"'), 'Day cells must retain role="gridcell"');
    });
  });

  // ==========================================
  // 3. HIGH-03: Focus Indicators
  // ==========================================
  await t.test('3. HIGH-03 — Visible Focus Indicators across Interactive Elements', async (t2) => {
    const componentFiles = [
      'src/components/Navbar.jsx',
      'src/components/ChatAssistant.jsx',
      'src/components/SoundButton.jsx',
      'src/components/Contact.jsx',
      'src/components/Profile.jsx',
      'src/components/Project.jsx',
      'src/components/RecruiterMode.jsx',
    ];

    for (const relPath of componentFiles) {
      await t2.test(`verifies ${relPath} has no unhandled focus-visible:outline-none without focus rings`, () => {
        const fullPath = path.join(rootDir, relPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        const unhandled = [];
        lines.forEach((line, idx) => {
          if (
            line.includes('focus-visible:outline-none') &&
            !line.includes('focus-visible:ring') &&
            !line.includes('focus-visible:border') &&
            !line.includes('focus:ring')
          ) {
            unhandled.push({ line: idx + 1, text: line.trim() });
          }
        });

        assert.equal(
          unhandled.length,
          0,
          `Found ${unhandled.length} unhandled focus-visible:outline-none in ${relPath}: ${JSON.stringify(unhandled)}`
        );
      });
    }
  });
});
