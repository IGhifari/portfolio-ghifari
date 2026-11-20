/**
 * Centralized Major Seasonal Events Configuration (6 Event Groups + Default Theme)
 * Active months: Jan (1), Feb (2), Apr (4), Jun (6), Oct (10), Dec (12).
 * Inactive months (3, 5, 7, 8, 9, 11) keep the original portfolio theme untouched.
 * Pure module (zero React or DOM side effects) — 100% unit-testable in Node.js.
 */

export const SEASON_PREVIEW_STORAGE_KEY = 'portfolio:season:preview';

const MONTH_NAME_MAP = {
  jan: 1, january: 1, januari: 1,
  feb: 2, february: 2, februari: 2,
  mar: 3, march: 3, maret: 3,
  apr: 4, april: 4,
  may: 5, mei: 5,
  jun: 6, june: 6, juni: 6,
  jul: 7, july: 7, juli: 7,
  aug: 8, august: 8, agustus: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, oktober: 10,
  nov: 11, november: 11,
  dec: 12, december: 12, desember: 12,
};

/**
 * Only these 6 single-month seasonal events apply custom palettes and ambient effects.
 * Months not listed (3, 5, 7, 8, 9, 11) keep the original portfolio theme untouched.
 */
export const SEASONAL_EVENT_GROUPS = {
  newYear: {
    id: 'january-new-year',
    months: [1],
    name: { en: 'New Year Midnight', id: 'Malam Tahun Baru' },
    defaultMode: 'dark',
    intensity: 'moderate',
    effect: {
      type: 'fireworks',
      count: 10,
      burstCount: 3,
      primaryColor: '#FBBF24',
      secondaryColor: '#CBD5E1',
      speedMultiplier: 1.0,
    },
    threadsColor: [0.58, 0.72, 0.96],
    darkPalette: {
      bgPrimary: '#050811',
      bgSecondary: '#0A1020',
      surface: '#0F172A',
      surfaceMuted: '#0C1322',
      surfaceAlt: '#152038',
      surfaceHover: '#1B2947',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#7C8BA1',
      border: '#1E293B',
      borderSubtle: '#141D30',
      borderHover: '#334155',
      accent: '#FBBF24',
      accentHover: '#F59E0B',
      accentContrast: '#060A14',
      accentMuted: 'rgba(251, 191, 36, 0.14)',
      tagBg: '#131D33',
      tagBorder: '#243454',
      tagText: '#E2E8F0',
      heroGlow:
        'radial-gradient(ellipse 80% 44% at 50% 0%, rgba(56, 189, 248, 0.08) 0%, rgba(251, 191, 36, 0.05) 45%, transparent 74%)',
    },
    lightAccent: { accent: '#B45309', accentHover: '#92400E', threads: [0.70, 0.32, 0.04] },
  },

  valentines: {
    id: 'february-valentines',
    months: [2],
    name: { en: "Valentine's", id: 'Valentine' },
    defaultMode: 'dark',
    intensity: 'subtle',
    effect: {
      type: 'hearts',
      count: 9,
      primaryColor: '#FB7185',
      secondaryColor: '#FDA4AF',
      speedMultiplier: 0.9,
    },
    threadsColor: [0.96, 0.44, 0.52],
    darkPalette: {
      bgPrimary: '#0B0709',
      bgSecondary: '#120B0E',
      surface: '#171014',
      surfaceMuted: '#140D11',
      surfaceAlt: '#1D1419',
      surfaceHover: '#24181F',
      textPrimary: '#FAF5F7',
      textSecondary: '#C4B5BC',
      textMuted: '#998791',
      border: '#2F1D26',
      borderSubtle: '#22151C',
      borderHover: '#4A2B3B',
      accent: '#FB7185',
      accentHover: '#F43F5E',
      accentContrast: '#14060A',
      accentMuted: 'rgba(251, 113, 133, 0.14)',
      tagBg: '#1D1419',
      tagBorder: '#321F29',
      tagText: '#E2CFD6',
      heroGlow:
        'radial-gradient(ellipse 75% 40% at 50% 0%, rgba(251, 113, 133, 0.09) 0%, transparent 72%)',
    },
    lightAccent: { accent: '#BE123C', accentHover: '#9F1239', threads: [0.75, 0.07, 0.24] },
  },

  easter: {
    id: 'april-easter',
    months: [4],
    name: { en: 'Easter', id: 'Paskah' },
    defaultMode: 'dark',
    intensity: 'subtle',
    effect: {
      type: 'easter',
      count: 10,
      primaryColor: '#C4B5FD',
      secondaryColor: '#F9A8D4',
      tertiaryColor: '#A7F3D0',
      speedMultiplier: 0.85,
    },
    threadsColor: [0.77, 0.71, 0.99],
    darkPalette: {
      bgPrimary: '#08070D',
      bgSecondary: '#0E0C17',
      surface: '#141120',
      surfaceMuted: '#100E1B',
      surfaceAlt: '#1A1629',
      surfaceHover: '#221D35',
      textPrimary: '#F7F5FC',
      textSecondary: '#BCB3D4',
      textMuted: '#8F85AB',
      border: '#27223B',
      borderSubtle: '#1B1729',
      borderHover: '#3C345A',
      accent: '#C4B5FD',
      accentHover: '#A78BFA',
      accentContrast: '#100921',
      accentMuted: 'rgba(196, 181, 253, 0.14)',
      tagBg: '#191628',
      tagBorder: '#2C2644',
      tagText: '#E2DCF5',
      heroGlow:
        'radial-gradient(ellipse 82% 44% at 50% 0%, rgba(196, 181, 253, 0.11) 0%, rgba(249, 168, 212, 0.05) 52%, transparent 74%)',
    },
    lightAccent: { accent: '#6D28D9', accentHover: '#5B21B6', threads: [0.43, 0.16, 0.85] },
  },

  summer: {
    id: 'june-summer',
    months: [6],
    name: { en: 'Summer', id: 'Musim Panas' },
    defaultMode: 'dark',
    intensity: 'subtle',
    effect: {
      type: 'warmLight',
      count: 10,
      primaryColor: '#22D3EE',
      secondaryColor: '#38BDF8',
      speedMultiplier: 0.9,
      hasSunshine: true,
    },
    threadsColor: [0.13, 0.83, 0.93],
    darkPalette: {
      bgPrimary: '#060B11',
      bgSecondary: '#0A131C',
      surface: '#101C26',
      surfaceMuted: '#0D1720',
      surfaceAlt: '#152431',
      surfaceHover: '#1B2D3D',
      textPrimary: '#F0F9FF',
      textSecondary: '#98BACB',
      textMuted: '#7596A8',
      border: '#1B2F40',
      borderSubtle: '#12212E',
      borderHover: '#2B4A64',
      accent: '#22D3EE',
      accentHover: '#06B6D4',
      accentContrast: '#041A21',
      accentMuted: 'rgba(34, 211, 238, 0.15)',
      tagBg: '#14222D',
      tagBorder: '#1E3445',
      tagText: '#BAE6FD',
      heroGlow:
        'radial-gradient(ellipse 88% 50% at 50% 0%, rgba(56, 189, 248, 0.16) 0%, rgba(253, 224, 71, 0.06) 44%, transparent 76%)',
    },
    lightAccent: { accent: '#0E7490', accentHover: '#155E75', threads: [0.05, 0.45, 0.56] },
  },

  halloween: {
    id: 'october-halloween',
    months: [10],
    name: { en: 'Halloween', id: 'Halloween' },
    defaultMode: 'dark',
    intensity: 'moderate',
    effect: {
      type: 'halloween',
      count: 6,
      primaryColor: '#F97316',
      secondaryColor: '#A855F7',
      speedMultiplier: 0.9,
      hasFog: true,
      hasPumpkins: true,
    },
    threadsColor: [0.95, 0.45, 0.12],
    darkPalette: {
      bgPrimary: '#08060B',
      bgSecondary: '#100B16',
      surface: '#150F1E',
      surfaceMuted: '#120C1A',
      surfaceAlt: '#1D1429',
      surfaceHover: '#251A34',
      textPrimary: '#F5F3FA',
      textSecondary: '#B4ACC4',
      textMuted: '#8B829E',
      border: '#2B1F3A',
      borderSubtle: '#1E1529',
      borderHover: '#44315C',
      accent: '#F97316',
      accentHover: '#EA580C',
      accentContrast: '#140802',
      accentMuted: 'rgba(249, 115, 22, 0.15)',
      tagBg: '#1C1427',
      tagBorder: '#322345',
      tagText: '#D9D0E8',
      heroGlow:
        'radial-gradient(ellipse 85% 45% at 50% 0%, rgba(168, 85, 247, 0.11) 0%, rgba(249, 115, 22, 0.05) 48%, transparent 76%)',
    },
    lightAccent: { accent: '#C2410C', accentHover: '#9A3412', threads: [0.76, 0.25, 0.05] },
  },

  winter: {
    id: 'december-winter',
    months: [12],
    name: { en: 'Winter', id: 'Musim Salju' },
    defaultMode: 'light',
    forceLightDefault: true,
    intensity: 'moderate',
    effect: {
      type: 'winter',
      count: 16,
      primaryColor: '#0369A1',
      secondaryColor: '#94A3B8',
      speedMultiplier: 1.0,
      hasLights: true,
    },
    threadsColor: [0.01, 0.41, 0.63],
    lightPalette: {
      bgPrimary: '#F8FAFC',
      bgSecondary: '#F1F5F9',
      surface: '#FFFFFF',
      surfaceMuted: '#FFFFFF',
      surfaceAlt: '#F1F5F9',
      surfaceHover: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
      border: '#CBD5E1',
      borderSubtle: '#E2E8F0',
      borderHover: '#94A3B8',
      accent: '#0369A1',
      accentHover: '#075985',
      accentContrast: '#FFFFFF',
      accentMuted: 'rgba(3, 105, 161, 0.12)',
      navBg: 'rgba(248, 250, 252, 0.90)',
      inputBg: '#FFFFFF',
      modalBackdrop: 'rgba(15, 23, 42, 0.46)',
      tagBg: '#E2E8F0',
      tagBorder: '#CBD5E1',
      tagText: '#334155',
      cardShadow: '0 10px 28px -8px rgba(15, 23, 42, 0.08)',
      cardShadowHover: '0 18px 36px -12px rgba(15, 23, 42, 0.14)',
      terminalBg: '#F8FAFC',
      terminalHeader: '#F1F5F9',
      terminalSurface: '#FFFFFF',
      terminalBorder: '#CBD5E1',
      terminalText: '#0F172A',
      terminalMuted: '#475569',
      heroGlow:
        'radial-gradient(ellipse 85% 45% at 50% 0%, rgba(186, 230, 253, 0.35) 0%, transparent 74%)',
    },
    darkPalette: {
      bgPrimary: '#070A0F',
      bgSecondary: '#0C1119',
      surface: '#111824',
      surfaceMuted: '#0E141E',
      surfaceAlt: '#161F2E',
      surfaceHover: '#1C273A',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#7C8BA1',
      border: '#1E293B',
      borderSubtle: '#151E2B',
      borderHover: '#334155',
      accent: '#38BDF8',
      accentHover: '#0EA5E9',
      accentContrast: '#06101B',
      accentMuted: 'rgba(56, 189, 248, 0.15)',
      tagBg: '#161F2E',
      tagBorder: '#243247',
      tagText: '#E2E8F0',
      heroGlow:
        'radial-gradient(ellipse 80% 42% at 50% 0%, rgba(56, 189, 248, 0.10) 0%, transparent 72%)',
    },
  },
};

export const MONTH_TO_EVENT = (() => {
  const map = {};
  for (const group of Object.values(SEASONAL_EVENT_GROUPS)) {
    for (const m of group.months) {
      map[m] = group;
    }
  }
  return map;
})();

export const SEASONAL_CSS_VAR_KEYS = [
  '--bg-primary',
  '--bg-secondary',
  '--surface',
  '--surface-muted',
  '--surface-alt',
  '--surface-hover',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--border',
  '--border-subtle',
  '--border-hover',
  '--accent',
  '--accent-hover',
  '--accent-contrast',
  '--accent-muted',
  '--nav-bg',
  '--input-bg',
  '--modal-backdrop',
  '--tag-bg',
  '--tag-border',
  '--tag-text',
  '--card-shadow',
  '--card-shadow-hover',
  '--terminal-bg',
  '--terminal-header',
  '--terminal-surface',
  '--terminal-border',
  '--terminal-text',
  '--terminal-muted',
  '--hero-ambient-glow',
  '--nb-shadow-color',
  '--github-accent',
  '--github-glow',
  '--github-level-1',
  '--github-level-1-border',
  '--github-level-2',
  '--github-level-2-border',
  '--github-level-3',
  '--github-level-3-border',
  '--github-level-4',
];

/**
 * Normalizes a month number, numeric string, or month name into an integer 1..12.
 * Falls back safely to the current local calendar month.
 */
export const parseSeasonMonth = (rawMonth, date = new Date()) => {
  if (typeof rawMonth === 'number' && Number.isInteger(rawMonth) && rawMonth >= 1 && rawMonth <= 12) {
    return rawMonth;
  }
  if (typeof rawMonth === 'string') {
    const clean = rawMonth.trim().toLowerCase();
    if (/^\d+$/.test(clean)) {
      const parsed = Number(clean);
      if (parsed >= 1 && parsed <= 12) return parsed;
    }
    if (MONTH_NAME_MAP[clean]) {
      return MONTH_NAME_MAP[clean];
    }
  }
  const calendarMonth = date instanceof Date && !Number.isNaN(date.getTime()) ? date.getMonth() + 1 : 1;
  return Math.max(1, Math.min(12, calendarMonth));
};

/**
 * Returns the active seasonal event group for `month`, or `null` if inactive (default month).
 */
export const getSeasonalEventForMonth = (month, date = new Date()) => {
  const safeMonth = parseSeasonMonth(month, date);
  return MONTH_TO_EVENT[safeMonth] || null;
};

/**
 * Resolves theme metadata and token overrides for an active event month,
 * or returns `{ isDefault: true, event: null, mode }` for default months (September & November).
 */
export const resolveSeasonalTheme = (month, requestedMode = null, date = new Date()) => {
  const safeMonth = parseSeasonMonth(month, date);
  const event = getSeasonalEventForMonth(safeMonth, date);

  if (!event) {
    const mode = requestedMode === 'light' || requestedMode === 'dark' ? requestedMode : 'dark';
    return {
      month: safeMonth,
      id: 'default',
      name: { en: 'Default Theme', id: 'Tema Bawaan' },
      isDefault: true,
      isSeasonalActive: false,
      mode,
      isDark: mode === 'dark',
      effect: null,
      threadsColor: mode === 'dark' ? [0.23, 0.51, 0.96] : [0.15, 0.39, 0.92],
      palette: null,
    };
  }

  const mode = requestedMode === 'light' || requestedMode === 'dark' ? requestedMode : event.defaultMode;

  if (mode === 'light') {
    if (event.lightPalette) {
      return {
        ...event,
        month: safeMonth,
        isDefault: false,
        isSeasonalActive: true,
        mode: 'light',
        isDark: false,
        threadsColor: event.threadsColor,
        palette: event.lightPalette,
      };
    }

    const la = event.lightAccent || { accent: '#2563EB', accentHover: '#1D4ED8', threads: [0.15, 0.39, 0.92] };
    return {
      ...event,
      month: safeMonth,
      isDefault: false,
      isSeasonalActive: true,
      mode: 'light',
      isDark: false,
      threadsColor: la.threads,
      palette: {
        bgPrimary: '#F7F7F5',
        bgSecondary: '#EFEFEB',
        surface: '#FFFFFF',
        surfaceMuted: '#FFFFFF',
        surfaceAlt: '#F2F2EE',
        surfaceHover: '#EAEAE6',
        textPrimary: '#111111',
        textSecondary: '#52525B',
        textMuted: '#71717A',
        border: '#D7D7D3',
        borderSubtle: '#E5E5E2',
        borderHover: '#A1A1AA',
        accent: la.accent,
        accentHover: la.accentHover,
        accentContrast: '#FFFFFF',
        accentMuted: 'rgba(37, 99, 235, 0.12)',
        navBg: 'rgba(247, 247, 245, 0.88)',
        inputBg: '#FFFFFF',
        modalBackdrop: 'rgba(17, 17, 17, 0.6)',
        tagBg: '#EAEAE6',
        tagBorder: '#D5D5CF',
        tagText: '#3F3F46',
        cardShadow: '0 10px 28px -8px rgba(0, 0, 0, 0.08)',
        cardShadowHover: '0 18px 36px -12px rgba(0, 0, 0, 0.14)',
        terminalBg: '#F7F7F5',
        terminalHeader: '#EFEFEB',
        terminalSurface: '#FFFFFF',
        terminalBorder: '#D7D7D3',
        terminalText: '#111111',
        terminalMuted: '#52525B',
        heroGlow: 'none',
      },
    };
  }

  const dp = event.darkPalette;
  return {
    ...event,
    month: safeMonth,
    isDefault: false,
    isSeasonalActive: true,
    mode: 'dark',
    isDark: true,
    threadsColor: event.threadsColor,
    palette: {
      ...dp,
      navBg: `${dp.bgPrimary}E0`,
      inputBg: dp.surfaceMuted,
      modalBackdrop: 'rgba(4, 4, 8, 0.86)',
      cardShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.6)',
      cardShadowHover: '0 20px 40px -14px rgba(0, 0, 0, 0.72)',
      terminalBg: dp.bgSecondary,
      terminalHeader: dp.surface,
      terminalSurface: dp.surfaceAlt,
      terminalBorder: dp.border,
      terminalText: dp.textPrimary,
      terminalMuted: dp.textSecondary,
    },
  };
};

const parseHexRgb = (hex) => {
  const clean = String(hex || '').replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return [59, 130, 246];
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixHex = (hexA, hexB, weightB) => {
  const [r1, g1, b1] = parseHexRgb(hexA);
  const [r2, g2, b2] = parseHexRgb(hexB);
  const t = Math.max(0, Math.min(1, weightB));
  const lerp = (a, b) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${lerp(r1, r2)}${lerp(g1, g2)}${lerp(b1, b2)}`.toUpperCase();
};

const hexToRgba = (hex, alpha) => {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildGithubTokens = (palette, isLight) => {
  const baseHex = isLight ? palette.surface : palette.bgPrimary;
  const weights = isLight ? [0.22, 0.44, 0.70] : [0.25, 0.50, 0.75];
  const level1 = mixHex(baseHex, palette.accent, weights[0]);
  const level2 = mixHex(baseHex, palette.accent, weights[1]);
  const level3 = mixHex(baseHex, palette.accent, weights[2]);
  const level4 = palette.accent;

  return {
    '--github-accent': palette.accent,
    '--github-glow': hexToRgba(palette.accent, isLight ? 0.14 : 0.12),
    '--github-level-1': level1,
    '--github-level-1-border': hexToRgba(level2, isLight ? 0.45 : 0.4),
    '--github-level-2': level2,
    '--github-level-2-border': hexToRgba(level3, 0.5),
    '--github-level-3': level3,
    '--github-level-3-border': hexToRgba(level4, 0.6),
    '--github-level-4': level4,
  };
};

/**
 * Converts an active seasonal theme into a CSS variable map, or returns `{}` for default months
 * so the original CSS stylesheet tokens in `Index.css` stay completely untouched.
 */
export const buildSeasonCssVariables = (resolvedTheme) => {
  if (!resolvedTheme || resolvedTheme.isDefault || !resolvedTheme.palette) {
    return {};
  }
  const p = resolvedTheme.palette;
  const isLight = resolvedTheme.mode === 'light';

  return {
    '--bg-primary': p.bgPrimary,
    '--bg-secondary': p.bgSecondary,
    '--surface': p.surface,
    '--surface-muted': p.surfaceMuted,
    '--surface-alt': p.surfaceAlt,
    '--surface-hover': p.surfaceHover,
    '--text-primary': p.textPrimary,
    '--text-secondary': p.textSecondary,
    '--text-muted': p.textMuted,
    '--border': p.border,
    '--border-subtle': p.borderSubtle,
    '--border-hover': p.borderHover,
    '--accent': p.accent,
    '--accent-hover': p.accentHover,
    '--accent-contrast': p.accentContrast,
    '--accent-muted': p.accentMuted,
    '--nav-bg': p.navBg || (isLight ? 'rgba(248, 250, 252, 0.88)' : 'rgba(8, 8, 8, 0.88)'),
    '--input-bg': p.inputBg || p.surfaceMuted,
    '--modal-backdrop': p.modalBackdrop || (isLight ? 'rgba(15, 23, 42, 0.48)' : 'rgba(4, 4, 6, 0.88)'),
    '--tag-bg': p.tagBg,
    '--tag-border': p.tagBorder,
    '--tag-text': p.tagText,
    '--card-shadow': p.cardShadow,
    '--card-shadow-hover': p.cardShadowHover,
    '--terminal-bg': p.terminalBg || p.bgSecondary,
    '--terminal-header': p.terminalHeader || p.surface,
    '--terminal-surface': p.terminalSurface || p.surfaceAlt,
    '--terminal-border': p.terminalBorder || p.border,
    '--terminal-text': p.terminalText || p.textPrimary,
    '--terminal-muted': p.terminalMuted || p.textSecondary,
    '--hero-ambient-glow': p.heroGlow || 'none',
    '--nb-shadow-color': p.border,
    ...buildGithubTokens(p, isLight),
  };
};
