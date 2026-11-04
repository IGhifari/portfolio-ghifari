import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations } from '../src/data/translations.js';
import { getFocusableElements } from '../src/hooks/useFocusTrap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('STAGE 8B Sprint 2 — Modal & Drawer Focus Management (HIGH-02)', async (t) => {
  // ==========================================
  // 1. Focus Trap Logic & Focusable Element Querying
  // ==========================================
  await t.test('1. Focus Trap Helper & Trapping Algorithm', async (t2) => {
    await t2.test('getFocusableElements correctly filters hidden, disabled, and negative tabindex elements', () => {
      // Mock DOM container structure
      const createMockElement = (tag, attrs = {}) => ({
        tagName: tag.toUpperCase(),
        getAttribute: (name) => attrs[name] ?? null,
        hasAttribute: (name) => name in attrs,
        tabIndex: attrs.tabindex !== undefined ? Number(attrs.tabindex) : 0,
        isConnected: true,
      });

      const button1 = createMockElement('button', { id: 'btn-1' });
      const buttonDisabled = createMockElement('button', { id: 'btn-disabled', disabled: '' });
      const buttonAriaHidden = createMockElement('button', { id: 'btn-hidden', 'aria-hidden': 'true' });
      const buttonTabMinus1 = createMockElement('button', { id: 'btn-no-tab', tabindex: '-1' });
      const link1 = createMockElement('a', { href: '#test', id: 'link-1' });
      const input1 = createMockElement('input', { type: 'text', id: 'input-1' });

      const mockContainer = {
        querySelectorAll: () => [button1, buttonDisabled, buttonAriaHidden, buttonTabMinus1, link1, input1],
      };

      const focusable = getFocusableElements(mockContainer);
      assert.equal(focusable.length, 3, 'Should only return 3 active focusable elements');
      assert.deepEqual(
        focusable.map((el) => el.getAttribute('id')),
        ['btn-1', 'link-1', 'input-1']
      );
    });

    await t2.test('getFocusableElements includes additionalElements (e.g. external close/toggle button)', () => {
      const createMockElement = (tag, attrs = {}) => ({
        tagName: tag.toUpperCase(),
        getAttribute: (name) => attrs[name] ?? null,
        hasAttribute: (name) => name in attrs,
        tabIndex: 0,
        isConnected: true,
      });

      const navLink = createMockElement('a', { href: '#about', id: 'nav-about' });
      const closeToggleBtn = createMockElement('button', { id: 'mobile-nav-toggle' });

      const mockContainer = {
        querySelectorAll: () => [navLink],
      };

      const focusable = getFocusableElements(mockContainer, [{ current: closeToggleBtn }]);
      assert.equal(focusable.length, 2);
      assert.deepEqual(
        focusable.map((el) => el.getAttribute('id')),
        ['nav-about', 'mobile-nav-toggle']
      );
    });

    await t2.test('simulates Tab and Shift+Tab wrapping behavior', () => {
      const focusable = [{ id: 'first' }, { id: 'middle' }, { id: 'last' }];

      // Trapping calculation logic matching useFocusTrap
      const getNextFocus = ({ active, shiftKey }) => {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (shiftKey) {
          // Shift + Tab: if on first or outside, wrap to last
          if (active === first || !focusable.includes(active)) {
            return last;
          }
          const currentIndex = focusable.indexOf(active);
          return focusable[currentIndex - 1];
        }

        // Tab: if on last or outside, wrap to first
        if (active === last || !focusable.includes(active)) {
          return first;
        }
        const currentIndex = focusable.indexOf(active);
        return focusable[currentIndex + 1];
      };

      // Tab forward
      assert.equal(getNextFocus({ active: focusable[0], shiftKey: false }).id, 'middle');
      assert.equal(getNextFocus({ active: focusable[1], shiftKey: false }).id, 'last');
      assert.equal(getNextFocus({ active: focusable[2], shiftKey: false }).id, 'first', 'Wraps from last to first');

      // Shift+Tab backward
      assert.equal(getNextFocus({ active: focusable[2], shiftKey: true }).id, 'middle');
      assert.equal(getNextFocus({ active: focusable[1], shiftKey: true }).id, 'first');
      assert.equal(getNextFocus({ active: focusable[0], shiftKey: true }).id, 'last', 'Wraps from first to last');

      // Stray focus outside container
      assert.equal(getNextFocus({ active: { id: 'outside' }, shiftKey: false }).id, 'first');
      assert.equal(getNextFocus({ active: { id: 'outside' }, shiftKey: true }).id, 'last');
    });
  });

  // ==========================================
  // 2. Component Audits: Certificate Modal
  // ==========================================
  await t.test('2. Certificate Modal Focus Management (src/components/Certificate.jsx)', () => {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Certificate.jsx'), 'utf-8');

    assert.ok(content.includes('useFocusTrap'), 'Certificate.jsx must import and use useFocusTrap');
    assert.ok(content.includes('role="dialog"'), 'Certificate modal must have role="dialog"');
    assert.ok(content.includes('aria-modal="true"'), 'Certificate modal must have aria-modal="true"');
    assert.ok(content.includes('aria-labelledby="cert-modal-title"'), 'Certificate modal must have aria-labelledby');
    assert.ok(content.includes('ref={modalContainerRef}'), 'Certificate modal container must have ref');
    assert.ok(content.includes('ref={closeBtnRef}'), 'Certificate modal close button must have ref for initial focus');
    assert.ok(content.includes('openModal(cert, e.currentTarget)'), 'Certificate card triggers must record trigger element');
  });

  // ==========================================
  // 3. Component Audits: Developer Terminal
  // ==========================================
  await t.test('3. Developer Terminal Focus Management (src/components/DeveloperTerminal.jsx)', () => {
    const termContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'DeveloperTerminal.jsx'), 'utf-8');
    const profContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Profile.jsx'), 'utf-8');

    assert.ok(termContent.includes('useFocusTrap'), 'DeveloperTerminal.jsx must import and use useFocusTrap');
    assert.ok(termContent.includes('role="dialog"'), 'Terminal overlay must have role="dialog"');
    assert.ok(termContent.includes('aria-modal="true"'), 'Terminal overlay must have aria-modal="true"');
    assert.ok(termContent.includes('aria-label={t(\'terminal.heading\')}'), 'Terminal overlay must have accessible name');
    assert.ok(termContent.includes('containerRef: modalWindowRef'), 'Terminal must trap focus in modalWindowRef');
    assert.ok(termContent.includes('initialFocusRef: inputRef'), 'Terminal must focus prompt input on open');
    assert.ok(termContent.includes('lastTriggerRef.current = e.detail.trigger'), 'Terminal must save trigger element from open event');
    assert.ok(profContent.includes('detail: { trigger: e.currentTarget }'), 'Profile hero button must pass trigger element in event');
  });

  // ==========================================
  // 4. Component Audits: Chat Assistant Panel
  // ==========================================
  await t.test('4. Chat Assistant Focus Management (src/components/ChatAssistant.jsx)', () => {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ChatAssistant.jsx'), 'utf-8');

    assert.ok(content.includes('useFocusTrap'), 'ChatAssistant.jsx must import and use useFocusTrap');
    assert.ok(content.includes('role="dialog"'), 'Chat panel must have role="dialog"');
    assert.ok(content.includes('aria-modal="true"'), 'Chat panel must have aria-modal="true"');
    assert.ok(content.includes('aria-label={t(\'chatbot.title\')}'), 'Chat panel must have accessible label');
    assert.ok(content.includes('ref={panelRef}'), 'Chat panel must pass containerRef');
    assert.ok(content.includes('ref={closeBtnRef}'), 'Chat panel close button must have ref');
    assert.ok(content.includes('ref={launcherBtnRef}'), 'Chat launcher button must have ref for focus restoration');
    assert.ok(content.includes('fallbackSelector: \'#chatbot-launcher-btn\''), 'Chat panel must have fallbackSelector for remounted trigger');
    assert.ok(content.includes('aria-haspopup="dialog"'), 'Chat launcher button must have aria-haspopup="dialog"');
  });

  // ==========================================
  // 5. Component Audits: Mobile Navbar Drawer
  // ==========================================
  await t.test('5. Mobile Navbar Drawer Focus Management (src/components/Navbar.jsx)', () => {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Navbar.jsx'), 'utf-8');

    assert.ok(content.includes('useFocusTrap'), 'Navbar.jsx must import and use useFocusTrap');
    assert.ok(content.includes('id="mobile-nav-drawer"'), 'Mobile drawer must have id="mobile-nav-drawer"');
    assert.ok(content.includes('role="dialog"'), 'Mobile drawer must have role="dialog"');
    assert.ok(content.includes('aria-modal="true"'), 'Mobile drawer must have aria-modal="true"');
    assert.ok(content.includes('aria-label={t(\'nav.mobileMenu\')'), 'Mobile drawer must have accessible name');
    assert.ok(content.includes('ref={mobileDrawerRef}'), 'Mobile drawer must pass containerRef');
    assert.ok(content.includes('ref={menuBtnRef}'), 'Mobile menu toggle button must have ref');
    assert.ok(content.includes('additionalElements: [menuBtnRef]'), 'Mobile menu must include toggle/close button in focus cycle');
    assert.ok(content.includes('aria-controls="mobile-nav-drawer"'), 'Mobile menu toggle button must have aria-controls');
  });

  // ==========================================
  // 6. Component Audits: Project Detail Modal
  // ==========================================
  await t.test('6. Project Case Study Detail Modal (src/components/Project.jsx)', () => {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Project.jsx'), 'utf-8');

    assert.ok(content.includes('useFocusTrap'), 'Project.jsx must import and use useFocusTrap');
    assert.ok(content.includes('role="dialog"'), 'Project modal must have role="dialog"');
    assert.ok(content.includes('aria-modal="true"'), 'Project modal must have aria-modal="true"');
    assert.ok(content.includes('aria-labelledby="project-modal-title"'), 'Project modal must have aria-labelledby');
    assert.ok(content.includes('ref={modalContainerRef}'), 'Project modal motion.div must have ref');
    assert.ok(content.includes('ref={closeBtnRef}'), 'Project modal close button must have ref');
    assert.ok(content.includes('lastTriggerRef.current = triggerEl || document.activeElement'), 'Project modal must track trigger element');
  });

  // ==========================================
  // 7. Component Audits: Experience Certificate Modal
  // ==========================================
  await t.test('7. Work Experience Certificate Modal (src/components/Experience.jsx)', () => {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Experience.jsx'), 'utf-8');

    assert.ok(content.includes('useFocusTrap'), 'Experience.jsx must import and use useFocusTrap');
    assert.ok(content.includes('role="dialog"'), 'Experience cert modal must have role="dialog"');
    assert.ok(content.includes('aria-modal="true"'), 'Experience cert modal must have aria-modal="true"');
    assert.ok(content.includes('ref={modalContainerRef}'), 'Experience modal motion.div must have ref');
    assert.ok(content.includes('ref={closeBtnRef}'), 'Experience modal close button must have ref');
    assert.ok(content.includes('openCertModal(exp.certificate, e.currentTarget)'), 'Experience certificate button must record trigger');
  });

  // ==========================================
  // 8. Translation Parity
  // ==========================================
  await t.test('8. Translation Dictionary Parity for Modal & Drawer Access', () => {
    assert.equal(typeof translations.id.nav.mobileMenu, 'string');
    assert.equal(typeof translations.en.nav.mobileMenu, 'string');
    assert.equal(translations.id.nav.mobileMenu, 'Menu navigasi seluler');
    assert.equal(translations.en.nav.mobileMenu, 'Mobile navigation menu');

    const checkObjectParity = (objId, objEn, pathPrefix = '') => {
      const keysId = Object.keys(objId).sort();
      const keysEn = Object.keys(objEn).sort();

      assert.deepEqual(keysId, keysEn, `Mismatched translation keys at ${pathPrefix || 'root'}`);

      for (const key of keysId) {
        const valId = objId[key];
        const valEn = objEn[key];

        if (typeof valId === 'object' && valId !== null && !Array.isArray(valId)) {
          assert.equal(typeof valEn, 'object', `Type mismatch at ${pathPrefix}.${key}`);
          checkObjectParity(valId, valEn, `${pathPrefix}.${key}`);
        }
      }
    };

    checkObjectParity(translations.id, translations.en);
  });
});
