/**
 * Portfolio V2 Seasonal Palette & Token Resolver
 * Adapts the 6 single-month seasonal events from `seasonalEvents.js` to Portfolio V2's
 * Nakula-inspired editorial design tokens while keeping inactive months (3, 5, 7, 8, 9, 11)
 * 100% identical to V2's signature Obsidian + Electric Blue (#3b82f6) aesthetic.
 */

import { ENABLE_SEASONAL_THEMES } from '../config/site.js';

export const V2_SEASON_OPTIONS = [
  {
    key: 'auto',
    month: null,
    shortLabel: 'AUTO',
    label: { en: 'Auto', id: 'Otomatis' },
    swatch: '#3b82f6',
  },
  {
    key: 'default',
    month: 11,
    shortLabel: 'BLUE',
    label: { en: 'Default Blue', id: 'Biru Bawaan' },
    swatch: '#3b82f6',
  },
  {
    key: 'jan',
    month: 1,
    shortLabel: 'JAN',
    label: { en: 'New Year', id: 'Tahun Baru' },
    swatch: '#FBBF24',
  },
  {
    key: 'feb',
    month: 2,
    shortLabel: 'FEB',
    label: { en: "Valentine's", id: 'Valentine' },
    swatch: '#FB7185',
  },
  {
    key: 'apr',
    month: 4,
    shortLabel: 'APR',
    label: { en: 'Easter', id: 'Paskah' },
    swatch: '#C4B5FD',
  },
  {
    key: 'jun',
    month: 6,
    shortLabel: 'JUN',
    label: { en: 'Summer', id: 'Musim Panas' },
    swatch: '#22D3EE',
  },
  {
    key: 'oct',
    month: 10,
    shortLabel: 'OCT',
    label: { en: 'Halloween', id: 'Halloween' },
    swatch: '#F97316',
  },
  {
    key: 'dec',
    month: 12,
    shortLabel: 'DEC',
    label: { en: 'Winter', id: 'Musim Salju' },
    swatch: '#38BDF8',
  },
];

function hexToRgbTuple(hex, fallback = [59, 130, 246]) {
  const clean = String(hex || '').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const V2_DEFAULT_TOKENS = {
  '--v2-bg': '#0a0a0a',
  '--v2-bg-elevated': '#0e0e0e',
  '--v2-surface': '#141414',
  '--v2-surface-elevated': '#161616',
  '--v2-border': '#262626',
  '--v2-border-strong': '#333333',
  '--v2-text': '#cacaca',
  '--v2-text-bright': '#ffffff',
  '--v2-text-muted': '#858585',
  '--v2-text-dim': '#555555',
  '--v2-about-unlit': '#2a2a2a',
  '--v2-big-num': '#2b2b2b',
  '--v2-accent': '#3b82f6',
  '--v2-accent-hover': '#2563eb',
  '--v2-accent-ink': '#0a0a0a',
  '--v2-glow-rgb': '59, 130, 246',
  '--v2-nav-scrim':
    'linear-gradient(180deg, #0a0a0a 0%, rgba(10, 10, 10, 0.7) 57.22%, rgba(10, 10, 10, 0) 100%)',
};

/**
 * Computes Portfolio V2 CSS custom property map for a resolved `season` from `ThemeContext`.
 * Returns exact `V2_DEFAULT_TOKENS` during default/inactive months (3, 5, 7, 8, 9, 11).
 */
export function buildV2SeasonTokens(season, seasonalEnabled = ENABLE_SEASONAL_THEMES) {
  if (!seasonalEnabled || !season || !season.isSeasonalActive || !season.palette) {
    return V2_DEFAULT_TOKENS;
  }

  const p = season.palette;
  const isLight = season.mode === 'light';
  const [accR, accG, accB] = hexToRgbTuple(p.accent, [59, 130, 246]);
  const [bgR, bgG, bgB] = hexToRgbTuple(p.bgPrimary, isLight ? [248, 250, 252] : [10, 10, 10]);

  return {
    '--v2-bg': p.bgPrimary,
    '--v2-bg-elevated': p.bgSecondary,
    '--v2-surface': p.surface,
    '--v2-surface-elevated': p.surfaceAlt,
    '--v2-border': p.borderSubtle,
    '--v2-border-strong': p.border,
    '--v2-text': isLight ? p.textPrimary : '#dce3ee',
    '--v2-text-bright': isLight ? '#020617' : '#ffffff',
    '--v2-text-muted': p.textSecondary,
    '--v2-text-dim': p.textMuted,
    '--v2-about-unlit': isLight ? '#cbd5e1' : p.border,
    '--v2-big-num': isLight ? '#e2e8f0' : p.surfaceHover,
    '--v2-accent': p.accent,
    '--v2-accent-hover': p.accentHover,
    '--v2-accent-ink': p.accentContrast,
    '--v2-glow-rgb': `${accR}, ${accG}, ${accB}`,
    '--v2-nav-scrim': `linear-gradient(180deg, ${p.bgPrimary} 0%, rgba(${bgR}, ${bgG}, ${bgB}, ${
      isLight ? 0.86 : 0.72
    }) 57.22%, rgba(${bgR}, ${bgG}, ${bgB}, 0) 100%)`,
  };
}
