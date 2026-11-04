import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations } from '../src/data/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('STAGE 8B Sprint 3 — Touch Targets, Reduced Motion, Contrast & Semantic Controls', async (t) => {
  // ==========================================
  // 1. MED-01: Touch Target Expansion
  // ==========================================
  await t.test('1. MED-01 — Touch Target Expansion (>= 44x44px Hit Target)', async (t2) => {
    await t2.test('DeveloperTerminal macOS action dots and controls have expanded touch targets', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'DeveloperTerminal.jsx'), 'utf-8');

      // Action dots must have touch manipulation and hit area >= 44px
      assert.ok(content.includes('after:min-w-[44px] after:min-h-[44px]'), 'Terminal action dots must expand hit area to >= 44x44px');
      assert.ok(content.includes('touch-manipulation'), 'Terminal dots must have touch-manipulation optimization');

      // Right window controls (maximize, clear, close) must also expand hit area
      assert.ok(content.includes('after:absolute after:-inset-1.5 after:min-w-[44px] after:min-h-[44px]'), 'Terminal window controls must expand hit area to >= 44px');
    });

    await t2.test('SoundButton mobile toggle and player controls meet touch target standards', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'SoundButton.jsx'), 'utf-8');

      // Mini mobile button must be at least 44x44px
      assert.ok(content.includes('min-w-[44px] min-h-[44px]'), 'SoundButton mobile toggle must be at least 44x44px');

      // Close button must have expanded hit area >= 44px
      assert.ok(content.includes('id="sound-button-close"'), 'SoundButton close button exists');
      assert.ok(content.includes('after:min-w-[44px] after:min-h-[44px]'), 'SoundButton controls must have expanded hit area >= 44px');

      // Playback buttons (prev, next, play/pause)
      assert.ok(content.includes('id="sound-play-pause"'), 'Play/pause button exists');
      assert.ok(content.includes('id="sound-prev"'), 'Prev button exists');
      assert.ok(content.includes('id="sound-next"'), 'Next button exists');
    });

    await t2.test('ChatAssistant controls have expanded touch targets', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ChatAssistant.jsx'), 'utf-8');

      assert.ok(content.includes('id="chatbot-close-btn"'), 'Chat close button exists');
      assert.ok(content.includes('after:min-w-[44px] after:min-h-[44px]'), 'ChatAssistant close/send buttons must expand hit area to >= 44px');
    });

    await t2.test('Profile social channels provide comfortable touch targets', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Profile.jsx'), 'utf-8');

      assert.ok(content.includes('min-w-[40px] min-h-[40px]'), 'Profile social links must have minimum dimension >= 40px');
      assert.ok(content.includes('after:min-w-[44px] after:min-h-[44px]'), 'Profile social links must have pseudo hit area >= 44px');
    });
  });

  // ==========================================
  // 2. MED-02: Reduced Motion Support
  // ==========================================
  await t.test('2. MED-02 — Reduced Motion Support across Components', async (t2) => {
    await t2.test('AcademicBackground respects prefers-reduced-motion via useReducedMotion', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'AcademicBackground.jsx'), 'utf-8');

      assert.ok(content.includes('useReducedMotion'), 'AcademicBackground must import and call useReducedMotion');
      assert.ok(content.includes('shouldReduceMotion'), 'AcademicBackground must branch motion props based on shouldReduceMotion');
      assert.ok(content.includes('getFadeMotion'), 'AcademicBackground must use getFadeMotion helper');
    });

    await t2.test('Certificate respects prefers-reduced-motion for headers, cards, and modal', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Certificate.jsx'), 'utf-8');

      assert.ok(content.includes('useReducedMotion'), 'Certificate must import and call useReducedMotion');
      assert.ok(content.includes('shouldReduceMotion'), 'Certificate must branch motion props based on shouldReduceMotion');
      assert.ok(content.includes('shouldReduceMotion ? { opacity: 1 }'), 'Certificate modal must disable scale when motion is reduced');
    });

    await t2.test('DeveloperTerminal suppresses 3D scaling and coordinate offsets when motion is reduced', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'DeveloperTerminal.jsx'), 'utf-8');

      assert.ok(content.includes('useReducedMotion'), 'DeveloperTerminal must import and call useReducedMotion');
      assert.ok(content.includes('shouldReduceMotion ? { opacity: 1 }'), 'DeveloperTerminal modal window must disable scale and y-shift when reduced');
    });

    await t2.test('SoundButton equalizer stops animations when prefers-reduced-motion is active', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'SoundButton.jsx'), 'utf-8');

      assert.ok(content.includes('motion-reduce:animate-none'), 'Equalizer bars must have motion-reduce:animate-none');
      assert.ok(content.includes('@media (prefers-reduced-motion: reduce)'), 'Style block must include prefers-reduced-motion media query');
    });

    await t2.test('Threads WebGL canvas listens to reduced motion and halts continuous animation loop', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'reactbits', 'Threads.jsx'), 'utf-8');

      assert.ok(content.includes('(prefers-reduced-motion: reduce)'), 'Threads must check prefers-reduced-motion query');
      assert.ok(content.includes('renderStaticFrame'), 'Threads must render a static frame instead of running loop when motion is reduced');
    });
  });

  // ==========================================
  // 3. MED-03: Terminal Status Bar Contrast
  // ==========================================
  await t.test('3. MED-03 — Developer Terminal Status Bar Contrast', async (t2) => {
    await t2.test('verifies terminal status bar uses text-neutral-400 (>= 6:1 contrast ratio)', () => {
      const content = fs.readFileSync(path.join(rootDir, 'src', 'components', 'DeveloperTerminal.jsx'), 'utf-8');

      // Must not use low-contrast text-neutral-500 in footer status bar
      assert.ok(!content.includes('text-neutral-500 select-none shrink-0'), 'Terminal footer must not use text-neutral-500');
      // Must use text-neutral-400
      assert.ok(content.includes('text-neutral-400 select-none shrink-0'), 'Terminal footer must use text-neutral-400');
    });

    await t2.test('calculates relative luminance and WCAG AA contrast ratio of neutral-400 on #161b22', () => {
      // Background: #161b22 -> RGB(22, 27, 34)
      // Foreground: neutral-400: #a3a3a3 -> RGB(163, 163, 163)
      const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };

      const lumBg = 0.2126 * toLinear(22) + 0.7152 * toLinear(27) + 0.0722 * toLinear(34);
      const lumFg = 0.2126 * toLinear(163) + 0.7152 * toLinear(163) + 0.0722 * toLinear(163);

      const ratio = (lumFg + 0.05) / (lumBg + 0.05);

      // Must exceed WCAG 2.2 AA minimum threshold of 4.5:1
      assert.ok(ratio >= 4.5, `Contrast ratio ${ratio.toFixed(2)} must be >= 4.5:1`);
      assert.ok(ratio >= 6.0, `Contrast ratio ${ratio.toFixed(2)} should be around 6.7:1`);
    });
  });

  // ==========================================
  // 4. MED-04: Semantic Interactive Controls
  // ==========================================
  await t.test('4. MED-04 — Semantic Interactive Controls (Elimination of div[role="button"])', async (t2) => {
    await t2.test('Project.jsx uses semantic <button type="button"> for preview cards', () => {
      const rawContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Project.jsx'), 'utf-8');
      const content = rawContent.replace(/\r\n/g, '\n');

      // No role="button" in Project.jsx
      assert.ok(!content.includes('role="button"'), 'Project.jsx must not contain any role="button"');
      // Must use native button for featured and other cards
      assert.ok(content.includes('<button\n                        type="button"\n                        onClick={(e) => openModal(project, e.currentTarget)'), 'Featured project preview must use button');
      assert.ok(content.includes('<button\n                  type="button"\n                  onClick={(e) => openModal(project, e.currentTarget)'), 'Other project preview must use button');
    });

    await t2.test('Certificate.jsx uses semantic <button type="button"> for preview cards', () => {
      const rawContent = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Certificate.jsx'), 'utf-8');
      const content = rawContent.replace(/\r\n/g, '\n');

      // No role="button" in Certificate.jsx
      assert.ok(!content.includes('role="button"'), 'Certificate.jsx must not contain any role="button"');
      assert.ok(content.includes('<button\n              type="button"\n              data-cursor-label="Preview"'), 'Certificate preview container must use button');
    });

    await t2.test('confirms zero occurrences of role="button" in all src/components JSX files', () => {
      const compDir = path.join(rootDir, 'src', 'components');
      const files = fs.readdirSync(compDir).filter((f) => f.endsWith('.jsx'));

      const offendingFiles = [];
      for (const file of files) {
        const filePath = path.join(compDir, file);
        const text = fs.readFileSync(filePath, 'utf-8');
        if (text.includes('role="button"') || text.includes("role='button'")) {
          offendingFiles.push(file);
        }
      }

      assert.deepEqual(offendingFiles, [], `No component should use role="button". Found in: ${offendingFiles.join(', ')}`);
    });
  });

  // ==========================================
  // 5. Translation Dictionary Parity
  // ==========================================
  await t.test('5. Translation Dictionary Key Parity Verification', () => {
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
