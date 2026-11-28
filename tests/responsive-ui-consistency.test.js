import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations } from '../src/data/translations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const readSource = (...segments) =>
  fs.readFileSync(path.join(rootDir, ...segments), 'utf-8').replace(/\r\n/g, '\n');

const extractZIndex = (source, contextLabel) => {
  const match = source.match(/z-(?:\[(\d+)\]|(\d+))/);
  assert.ok(match, `Expected a z-index utility class in ${contextLabel}`);
  return Number(match[1] ?? match[2]);
};

test('Phase 8 — Responsive Polish & UI Consistency Regression Guards', async (t) => {
  await t.test('1. Developer Terminal contact output uses bilingual translation for direct email', () => {
    assert.equal(translations.id.terminal.directEmail, 'Email Langsung');
    assert.equal(translations.en.terminal.directEmail, 'Direct Email');

    const entrySource = readSource('src', 'components', 'terminal', 'TerminalOutputEntry.jsx');
    assert.ok(
      entrySource.includes("t('terminal.directEmail')"),
      'TerminalOutputEntry.jsx must render t(\'terminal.directEmail\') for the direct email link'
    );
    assert.ok(
      !entrySource.includes('>Email Langsung<'),
      'TerminalOutputEntry.jsx must not hardcode Indonesian "Email Langsung"'
    );
  });

  await t.test('2. Modal and drawer stacking stays above floating controls without root stacking trap', () => {
    const switcherSource = readSource('src', 'components', 'PortfolioSwitcher.jsx');
    const v1ChatSource = readSource('src', 'components', 'ChatAssistant.jsx');
    const v2ChatSource = readSource('src', 'v2', 'components', 'layout', 'V2ChatAssistant.jsx');
    const navbarSource = readSource('src', 'components', 'Navbar.jsx');
    const projectSource = readSource('src', 'components', 'Project.jsx');
    const v2DrawerSource = readSource('src', 'v2', 'components', 'layout', 'V2MenuDrawer.jsx');
    const terminalSource = readSource('src', 'components', 'DeveloperTerminal.jsx');
    const v2Css = readSource('src', 'v2', 'styles', 'v2.css');

    const switcherZ = extractZIndex(switcherSource, 'PortfolioSwitcher.jsx');
    const v1ChatZ = extractZIndex(v1ChatSource, 'ChatAssistant.jsx');
    const v2ChatZ = extractZIndex(v2ChatSource, 'V2ChatAssistant.jsx');
    const navbarZ = extractZIndex(navbarSource, 'Navbar.jsx');
    const projectZ = extractZIndex(projectSource, 'Project.jsx');
    const v2DrawerZ = extractZIndex(v2DrawerSource, 'V2MenuDrawer.jsx');
    const terminalZ = extractZIndex(terminalSource, 'DeveloperTerminal.jsx');

    assert.ok(navbarZ > switcherZ, `V1 Navbar (${navbarZ}) must stack above PortfolioSwitcher (${switcherZ})`);
    assert.ok(navbarZ > v1ChatZ, `V1 Navbar (${navbarZ}) must stack above V1 ChatAssistant (${v1ChatZ})`);
    assert.ok(projectZ > switcherZ, `Project modal (${projectZ}) must stack above PortfolioSwitcher (${switcherZ})`);
    assert.ok(projectZ > v1ChatZ, `Project modal (${projectZ}) must stack above V1 ChatAssistant (${v1ChatZ})`);
    assert.ok(v2DrawerZ > switcherZ, `V2MenuDrawer (${v2DrawerZ}) must stack above PortfolioSwitcher (${switcherZ})`);
    assert.ok(v2DrawerZ > v2ChatZ, `V2MenuDrawer (${v2DrawerZ}) must stack above V2ChatAssistant (${v2ChatZ})`);
    assert.ok(terminalZ > v2DrawerZ, `DeveloperTerminal (${terminalZ}) must stack above V2MenuDrawer (${v2DrawerZ})`);
    assert.ok(terminalZ > v2ChatZ, `DeveloperTerminal (${terminalZ}) must stack above V2ChatAssistant (${v2ChatZ})`);

    // Ensure .v2-portfolio-root does not trap fixed drawers/modals with isolation: isolate
    const rootBlockMatch = v2Css.match(/\.v2-portfolio-root\s*\{([\s\S]*?)\}/);
    assert.ok(rootBlockMatch, 'Expected .v2-portfolio-root rule in v2.css');
    assert.ok(
      !rootBlockMatch[1].includes('isolation: isolate'),
      '.v2-portfolio-root must not declare isolation: isolate (which traps fixed modals below sibling PortfolioSwitcher)'
    );
  });

  await t.test('3. V2 Header LET\'S TALK pill prevents text wrapping and clipping', () => {
    const v2Css = readSource('src', 'v2', 'styles', 'v2.css');
    const rolloverLineMatch = v2Css.match(/\.v2-rollover-line\s*\{([\s\S]*?)\}/);
    const navTalkMatch = v2Css.match(/\.v2-nav-talk-btn\s*\{([\s\S]*?)\}/);

    assert.ok(rolloverLineMatch && rolloverLineMatch[1].includes('white-space: nowrap'), '.v2-rollover-line must enforce white-space: nowrap');
    assert.ok(navTalkMatch && navTalkMatch[1].includes('white-space: nowrap'), '.v2-nav-talk-btn must enforce white-space: nowrap');
  });
});
