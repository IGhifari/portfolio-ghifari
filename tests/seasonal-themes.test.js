import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SEASONAL_EVENT_GROUPS,
  SEASONAL_CSS_VAR_KEYS,
  parseSeasonMonth,
  getSeasonalEventForMonth,
  resolveSeasonalTheme,
  buildSeasonCssVariables,
} from '../src/config/seasonalEvents.js';
import {
  DEFAULT_GAME_THEME,
  getSeasonal3DTheme,
  buildGameCssVars,
} from '../src/game/shared/seasonalGameTheme.js';
import { executeTerminalCommand } from '../src/utils/terminalCommands.js';
import { ENABLE_SEASONAL_THEMES } from '../src/config/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (hexA, hexB) => {
  const l1 = luminance(hexA);
  const l2 = luminance(hexB);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

describe('Major Seasonal Events Theme System Test Suite', () => {
  it('1. Defines strictly the 6 single-month seasonal events and leaves inactive months (3, 5, 7, 8, 9, 11) untouched', () => {
    const groups = Object.values(SEASONAL_EVENT_GROUPS);
    assert.equal(groups.length, 6, 'Must implement strictly 6 seasonal event groups');

    // Active months map strictly 1:1 to the 6 requested months
    assert.equal(getSeasonalEventForMonth(1).id, 'january-new-year');
    assert.equal(getSeasonalEventForMonth(2).id, 'february-valentines');
    assert.equal(getSeasonalEventForMonth(4).id, 'april-easter');
    assert.equal(getSeasonalEventForMonth(6).id, 'june-summer');
    assert.equal(getSeasonalEventForMonth(10).id, 'october-halloween');
    assert.equal(getSeasonalEventForMonth(12).id, 'december-winter');

    // All other months (Mar, May, Jul, Aug, Sep, Nov) must remain inactive with zero overrides
    for (const inactiveMonth of [3, 5, 7, 8, 9, 11]) {
      assert.equal(getSeasonalEventForMonth(inactiveMonth), null, `Month ${inactiveMonth} must be inactive`);
      const resolved = resolveSeasonalTheme(inactiveMonth);
      assert.equal(resolved.isDefault, true);
      assert.equal(resolved.isSeasonalActive, false);
      assert.equal(resolved.id, 'default');
      assert.equal(resolved.effect, null);
      assert.deepEqual(buildSeasonCssVariables(resolved), {}, `Month ${inactiveMonth} must return 0 CSS overrides`);
    }

    // Safe fallbacks on invalid input
    assert.equal(parseSeasonMonth(99, new Date(2026, 9, 31)), 10); // October
    assert.equal(parseSeasonMonth('desember'), 12);
    assert.equal(parseSeasonMonth('nov'), 11);
    assert.equal(parseSeasonMonth('april'), 4);
  });

  it('2. Keeps January (New Year) and December (Winter) distinctly separated with April Easter & June Summer single-month accents', () => {
    const jan = resolveSeasonalTheme(1);
    const apr = resolveSeasonalTheme(4);
    const jun = resolveSeasonalTheme(6);
    const oct = resolveSeasonalTheme(10);
    const dec = resolveSeasonalTheme(12);

    assert.equal(jan.mode, 'dark');
    assert.equal(jan.isDark, true);
    assert.equal(jan.effect.type, 'fireworks');
    assert.ok(luminance(jan.palette.bgPrimary) < 0.03, 'January must be dark midnight blue');

    assert.equal(apr.effect.type, 'easter');
    assert.deepEqual(SEASONAL_EVENT_GROUPS.easter.months, [4], 'Easter must only activate in April');

    assert.equal(jun.effect.type, 'warmLight');
    assert.equal(jun.effect.hasSunshine, true);
    assert.deepEqual(SEASONAL_EVENT_GROUPS.summer.months, [6], 'Summer must only activate in June');

    assert.equal(oct.effect.hasFog, true);
    assert.equal(oct.effect.hasPumpkins, true);

    assert.equal(dec.mode, 'light');
    assert.equal(dec.isDark, false);
    assert.equal(dec.forceLightDefault, true);
    assert.equal(dec.effect.type, 'winter');
    assert.equal(dec.effect.hasLights, true);
    assert.ok(luminance(dec.palette.bgPrimary) > 0.85, 'December must be bright off-white');
    assert.ok(luminance(dec.palette.surface) > 0.9, 'December cards/surfaces must be pure frost white');
    assert.ok(luminance(dec.palette.terminalBg) > 0.85, 'December terminal must adapt to light winter');
    assert.ok(luminance(dec.palette.textPrimary) < 0.05, 'December text must be dark crisp ink');
  });

  it('3. Enforces WCAG AA/AAA text and accent contrast across all 6 active months', () => {
    for (const m of [1, 2, 4, 6, 10, 12]) {
      const theme = resolveSeasonalTheme(m);
      const p = theme.palette;
      const cssVars = buildSeasonCssVariables(theme);

      for (const key of SEASONAL_CSS_VAR_KEYS) {
        assert.ok(cssVars[key] !== undefined, `Missing token ${key} for month ${m}`);
      }

      assert.ok(contrastRatio(p.textPrimary, p.bgPrimary) >= 7, `Month ${m} primary text on bg`);
      assert.ok(contrastRatio(p.textPrimary, p.surface) >= 7, `Month ${m} primary text on surface`);
      assert.ok(contrastRatio(p.textSecondary, p.bgPrimary) >= 4.5, `Month ${m} secondary text on bg`);
      assert.ok(contrastRatio(p.textSecondary, p.surface) >= 4.5, `Month ${m} secondary text on surface`);
      assert.ok(contrastRatio(p.accent, p.accentContrast) >= 4.5, `Month ${m} button accent contrast`);
      assert.ok(contrastRatio(p.terminalText, p.terminalBg) >= 7, `Month ${m} terminal contrast`);

      // GitHub heatmap & accent must follow seasonal accent rather than static GitHub green
      assert.equal(cssVars['--github-accent'], p.accent, `Month ${m} GitHub accent`);
      assert.equal(cssVars['--github-level-4'], p.accent, `Month ${m} GitHub level 4`);
      assert.notEqual(cssVars['--github-level-1'].toLowerCase(), '#0e4429');
      assert.notEqual(cssVars['--github-level-4'].toLowerCase(), '#39d353');
    }
  });

  it('4. Ensures clean CSS override removal in default months, reduced-motion/hidden pause, and /play/* isolation', () => {
    assert.equal(ENABLE_SEASONAL_THEMES, true);

    const janCmd = executeTerminalCommand('season jan');
    assert.equal(janCmd.type, 'season');
    assert.equal(janCmd.month, 1);

    const novCmd = executeTerminalCommand('season 11');
    assert.equal(novCmd.type, 'season');
    assert.equal(novCmd.month, 11);

    const autoCmd = executeTerminalCommand('season auto');
    assert.equal(autoCmd.type, 'season');
    assert.equal(autoCmd.month, null);

    const ctxSource = fs.readFileSync(path.join(rootDir, 'src', 'context', 'ThemeContext.jsx'), 'utf-8');
    assert.ok(ctxSource.includes('removeProperty'), 'Default months must strip seasonal inline overrides');

    const fxSource = fs.readFileSync(path.join(rootDir, 'src', 'components', 'SeasonalEffects.jsx'), 'utf-8');
    assert.ok(fxSource.includes('!season?.isSeasonalActive'), 'Effects must render null in default months');

    const fxCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'SeasonalEffects.css'), 'utf-8');
    assert.ok(fxCss.includes('prefers-reduced-motion: reduce'));
    assert.ok(fxCss.includes('animation-play-state: paused !important'));
    assert.ok(fxCss.includes('pointer-events: none'));

    const appSource = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf-8');
    assert.ok(appSource.includes('!isPlayMode && ENABLE_SEASONAL_THEMES'));
  });

  it('5. Adapts 3D game palettes and atmosphere cleanly while keeping GameHub free of Three.js', () => {
    // Inactive months keep exact default dark 3D look regardless of portfolio light mode toggle
    for (const inactive of [3, 5, 7, 8, 9, 11]) {
      const sLight = resolveSeasonalTheme(inactive, 'light');
      const gTheme = getSeasonal3DTheme(sLight, true);
      assert.equal(gTheme, DEFAULT_GAME_THEME);
      assert.equal(gTheme.isActive, false);
      assert.equal(gTheme.effectType, null);
      assert.equal(buildGameCssVars(gTheme)['--accent'], '#3B82F6');
    }

    // Active 6 seasonal 3D themes
    const expectedEffects = {
      1: 'fireworks',
      2: 'hearts',
      4: 'easter',
      6: 'warmLight',
      10: 'halloween',
      12: 'winter',
    };
    for (const [mStr, expectedType] of Object.entries(expectedEffects)) {
      const m = Number(mStr);
      const season = resolveSeasonalTheme(m);
      const gTheme = getSeasonal3DTheme(season, true);
      assert.equal(gTheme.isActive, true, `Month ${m} must activate 3D theme`);
      assert.equal(gTheme.effectType, expectedType, `Month ${m} 3D effect type`);
      const css = buildGameCssVars(gTheme);
      assert.ok(
        contrastRatio(css['--text-primary'], css['--surface']) >= 7,
        `Month ${m} HUD contrast`
      );
      assert.ok(
        contrastRatio(css['--accent'], css['--accent-contrast']) >= 4.5,
        `Month ${m} HUD button contrast`
      );
    }

    // December Light Winter transforms 3D sky/track & HUD into frost light mode
    const decGame = getSeasonal3DTheme(resolveSeasonalTheme(12), true);
    assert.equal(decGame.isLight, true);
    assert.ok(decGame.sceneBg !== DEFAULT_GAME_THEME.sceneBg);
    assert.equal(buildGameCssVars(decGame)['--accent'], '#0369A1');

    // GameHub must never import three directly
    const hubSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'hub', 'GameHub.jsx'), 'utf-8');
    assert.ok(!hubSource.includes("from 'three'") && !hubSource.includes('from "three"'));
  });
});
