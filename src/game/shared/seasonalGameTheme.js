/**
 * Pure Seasonal 3D & HUD Palette Adapter for /play and all 4 3D mini-games.
 * Zero Three.js or React imports — safely usable in GameHub, HUDs, and Node.js unit tests.
 */

const hexToNum = (hex) => {
  const clean = String(hex || '#080808').replace('#', '');
  return parseInt(clean, 16);
};

const hexToRgbTuple = (hex) => {
  const num = hexToNum(hex);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

export const DEFAULT_GAME_THEME = {
  id: 'default',
  month: null,
  isActive: false,
  isLight: false,

  // CSS tokens (matches original DESIGN.md dark gaming aesthetic)
  bgHex: '#080808',
  bgSecondaryHex: '#0c0c10',
  surfaceHex: '#141414',
  surfaceAltHex: '#101010',
  surfaceHoverHex: '#1c1c1f',
  borderHex: '#27272A',
  borderSubtleHex: '#1f1f24',
  borderHoverHex: '#3B82F6',
  textPrimaryHex: '#F5F5F5',
  textSecondaryHex: '#A1A1AA',
  textMutedHex: '#71717A',
  accentHex: '#3B82F6',
  accentHoverHex: '#2563EB',
  accentContrastHex: '#FFFFFF',
  modalBackdrop: 'rgba(0, 0, 0, 0.78)',
  vignetteBackground:
    'radial-gradient(ellipse 90% 34% at 50% 8%, rgba(59, 130, 246, 0.14) 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 56%, rgba(8, 8, 8, 0.72) 100%)',

  // 3D Scene / Fog / Lighting
  sceneBg: 0x080808,
  exploreBg: 0x08090c,
  groundCenterHex: '#1b1d26',
  groundMidHex: '#15171e',
  groundEdgeHex: '#0e1015',
  groundOuterHex: '#08090c',
  fogNearMult: 1,
  fogFarMult: 1,
  hemiSky: 0xdbeafe,
  hemiGround: 0x09090b,
  hemiIntensity: 0.78,
  dirLight: 0xf8fafc,
  dirIntensity: 1.35,
  rimColor: 0x60a5fa,
  rimIntensity: 0.65,
  gridMajor: 0x222530,
  gridMinor: 0x161820,

  // Architecture / World / Blocks / Bugs / Runner materials
  accent: 0x3b82f6,
  accentRgb: [59, 130, 246],
  visited: 0x10b981,
  surface: 0x17171c,
  surfaceAlt: 0x1e1e26,
  plinth: 0x111115,
  blockBase: 0x121217,
  blockFaceFillHex: '#16161c',
  blockFaceBorderHex: '#27272a',
  blockAccentFillHex: '#172554',
  blockAccentBorderHex: '#3b82f6',
  blockTextHex: '#f4f4f5',
  blockOverhang: 0x1e293b,
  edgeDefault: 0x3f3f46,
  edgeVisited: 0x52525b,
  ringDefault: 0x2e2e36,
  signLight: 0xf4f4f5,
  tile: 0x22222a,
  pole: 0x27272a,
  lampHead: 0x93c5fd,
  trunk: 0x6b4423,
  foliage: 0x1f6e43,
  dustColor: 0x93c5fd,

  playerTorso: 0x18181b,
  playerLimb: 0x2d2d35,
  playerLight: 0xf4f4f5,
  shadow: 0x040406,

  bugsDark: 0x18181b,
  bugsRed: 0xef4444,
  bugsFlash: 0xf4f4f5,
  arenaRing: 0x1f1f23,

  trackSurface: 0x16161c,
  trackShoulder: 0x0c0c10,
  laneMark: 0x3a3a48,
  obstacleDark: 0x1e1e26,
  obstacleRed: 0xef4444,
  edgeFirewall: 0x71717a,
  edgeAccentLine: 0x93c5fd,

  // Atmosphere particles
  effectType: null,
  particlePrimary: 0x93c5fd,
  particleSecondary: 0x3b82f6,
  particleTertiary: 0x93c5fd,
};

const SEASON_3D_OVERRIDES = {
  'january-new-year': {
    // Midnight blue + gold & silver fireworks look
    groundCenterHex: '#152038',
    groundMidHex: '#0e1629',
    groundEdgeHex: '#080d1a',
    groundOuterHex: '#050811',
    hemiSky: 0xe2e8f0,
    hemiGround: 0x050811,
    hemiIntensity: 0.85,
    rimColor: 0xfbbf24,
    rimIntensity: 0.72,
    gridMajor: 0x273552,
    gridMinor: 0x151e33,
    surface: 0x131b2c,
    surfaceAlt: 0x1c273f,
    plinth: 0x0c111d,
    blockBase: 0x0f1626,
    blockFaceFillHex: '#131b2c',
    blockFaceBorderHex: '#2d3b59',
    blockAccentFillHex: '#332507',
    blockAccentBorderHex: '#fbbf24',
    blockOverhang: 0x273552,
    edgeDefault: 0x475569,
    edgeVisited: 0x94a3b8,
    ringDefault: 0x2a354d,
    tile: 0x1e293b,
    foliage: 0x1f6e43,
    lampHead: 0xfde68a,
    trackSurface: 0x141d2e,
    trackShoulder: 0x090e1a,
    laneMark: 0x3a4d6d,
    obstacleDark: 0x1c273f,
    edgeAccentLine: 0xfde68a,
    effectType: 'fireworks',
    particlePrimary: 0xfbbf24,
    particleSecondary: 0xe2e8f0,
    particleTertiary: 0x93c5fd,
  },
  'february-valentines': {
    // Charcoal berry-rose + rose glow
    groundCenterHex: '#24141d',
    groundMidHex: '#1a0e15',
    groundEdgeHex: '#110a0f',
    groundOuterHex: '#0b0709',
    hemiSky: 0xffe4e6,
    hemiGround: 0x0b0709,
    rimColor: 0xfb7185,
    rimIntensity: 0.68,
    gridMajor: 0x3a202d,
    gridMinor: 0x22131b,
    surface: 0x1d1218,
    surfaceAlt: 0x261820,
    plinth: 0x120b0f,
    blockBase: 0x170e13,
    blockFaceFillHex: '#1c1117',
    blockFaceBorderHex: '#3a222f',
    blockAccentFillHex: '#4c0519',
    blockAccentBorderHex: '#fb7185',
    blockOverhang: 0x3b1f2b,
    edgeDefault: 0x523442,
    ringDefault: 0x3d2230,
    tile: 0x291a22,
    foliage: 0x1f6e43,
    lampHead: 0xfecdd3,
    trackSurface: 0x1e131a,
    trackShoulder: 0x0e080c,
    laneMark: 0x4c2d3d,
    obstacleDark: 0x2a1922,
    edgeAccentLine: 0xfda4af,
    effectType: 'hearts',
    particlePrimary: 0xfb7185,
    particleSecondary: 0xfda4af,
    particleTertiary: 0xf43f5e,
  },
  'april-easter': {
    // Refined dark-plum editorial with soft pastel lavender/blush/mint accents
    groundCenterHex: '#1e1930',
    groundMidHex: '#151222',
    groundEdgeHex: '#0d0b15',
    groundOuterHex: '#08070d',
    hemiSky: 0xede9fe,
    hemiGround: 0x08070d,
    hemiIntensity: 0.86,
    rimColor: 0xc4b5fd,
    rimIntensity: 0.7,
    gridMajor: 0x2e2847,
    gridMinor: 0x1c182c,
    surface: 0x171426,
    surfaceAlt: 0x201b33,
    plinth: 0x100e1b,
    blockBase: 0x141120,
    blockFaceFillHex: '#171426',
    blockFaceBorderHex: '#342d52',
    blockAccentFillHex: '#2e1065',
    blockAccentBorderHex: '#c4b5fd',
    blockOverhang: 0x312a4d,
    edgeDefault: 0x4a4170,
    ringDefault: 0x342d52,
    tile: 0x231e36,
    foliage: 0x1f6e43,
    lampHead: 0xe9d5ff,
    trackSurface: 0x191529,
    trackShoulder: 0x0c0a14,
    laneMark: 0x453b6b,
    obstacleDark: 0x241e38,
    edgeAccentLine: 0xf9a8d4,
    effectType: 'easter',
    particlePrimary: 0xc4b5fd,
    particleSecondary: 0xf9a8d4,
    particleTertiary: 0xa7f3d0,
  },
  'june-summer': {
    // Brighter sunlit oceanic twilight with sunshine glow & cyan accent
    groundCenterHex: '#122638',
    groundMidHex: '#0d1c29',
    groundEdgeHex: '#08121b',
    groundOuterHex: '#060b11',
    hemiSky: 0xfef9c3,
    hemiGround: 0x082032,
    hemiIntensity: 0.98,
    dirLight: 0xfffbeb,
    dirIntensity: 1.52,
    rimColor: 0x38bdf8,
    rimIntensity: 0.8,
    gridMajor: 0x1e3a52,
    gridMinor: 0x112433,
    surface: 0x11202e,
    surfaceAlt: 0x182c3e,
    plinth: 0x0b151f,
    blockBase: 0x0f1b26,
    blockFaceFillHex: '#122230',
    blockFaceBorderHex: '#26445e',
    blockAccentFillHex: '#083344',
    blockAccentBorderHex: '#22d3ee',
    blockOverhang: 0x1c364d,
    edgeDefault: 0x2e5473,
    ringDefault: 0x1e394f,
    tile: 0x172b3d,
    foliage: 0x1f6e43,
    lampHead: 0xa5f3fc,
    trackSurface: 0x132433,
    trackShoulder: 0x081018,
    laneMark: 0x2d506b,
    obstacleDark: 0x192d40,
    edgeAccentLine: 0x67e8f9,
    effectType: 'warmLight',
    particlePrimary: 0x22d3ee,
    particleSecondary: 0xfde047,
    particleTertiary: 0x38bdf8,
  },
  'october-halloween': {
    // Moody dark purple & orange with thicker misty fog
    groundCenterHex: '#1f152b',
    groundMidHex: '#150e1e',
    groundEdgeHex: '#0d0912',
    groundOuterHex: '#08060b',
    fogNearMult: 0.76,
    fogFarMult: 0.82,
    hemiSky: 0xd8b4fe,
    hemiGround: 0x08060b,
    hemiIntensity: 0.72,
    rimColor: 0xa855f7,
    rimIntensity: 0.78,
    gridMajor: 0x36244a,
    gridMinor: 0x1c1326,
    surface: 0x171021,
    surfaceAlt: 0x221730,
    plinth: 0x0f0a17,
    blockBase: 0x140e1c,
    blockFaceFillHex: '#171021',
    blockFaceBorderHex: '#3b2852',
    blockAccentFillHex: '#431407',
    blockAccentBorderHex: '#f97316',
    blockOverhang: 0x2e1f42,
    edgeDefault: 0x4f366e,
    ringDefault: 0x3b2654,
    tile: 0x21172e,
    foliage: 0x1f6e43,
    lampHead: 0xfdba74,
    bugsRed: 0xdc2626,
    trackSurface: 0x191224,
    trackShoulder: 0x09060d,
    laneMark: 0x422d5c,
    obstacleDark: 0x251a36,
    edgeAccentLine: 0xfdba74,
    effectType: 'halloween',
    particlePrimary: 0xf97316,
    particleSecondary: 0xa855f7,
    particleTertiary: 0xfdba74,
  },
  'december-winter-dark': {
    // Dark frost alternative if user toggles light->dark manually in December
    groundCenterHex: '#152030',
    groundMidHex: '#0f1724',
    groundEdgeHex: '#0a1019',
    groundOuterHex: '#070a0f',
    hemiSky: 0xe0f2fe,
    hemiGround: 0x070a0f,
    hemiIntensity: 0.88,
    rimColor: 0x38bdf8,
    rimIntensity: 0.75,
    gridMajor: 0x24344d,
    gridMinor: 0x141d2b,
    surface: 0x111a26,
    surfaceAlt: 0x182334,
    plinth: 0x0b101a,
    blockBase: 0x0f1621,
    blockFaceFillHex: '#111a26',
    blockFaceBorderHex: '#2a3c57',
    blockAccentFillHex: '#0c4a6e',
    blockAccentBorderHex: '#38bdf8',
    blockOverhang: 0x1e2c40,
    edgeDefault: 0x3b5273,
    ringDefault: 0x25354d,
    tile: 0x1b2738,
    foliage: 0x1f6e43,
    lampHead: 0xbae6fd,
    trackSurface: 0x141e2e,
    trackShoulder: 0x080d14,
    laneMark: 0x334b6b,
    obstacleDark: 0x1b273b,
    edgeAccentLine: 0xbae6fd,
    effectType: 'winter',
    particlePrimary: 0xf8fafc,
    particleSecondary: 0x38bdf8,
    particleTertiary: 0xbae6fd,
  },
  'december-winter-light': {
    // Full crisp Light Winter 3D Transformation!
    groundCenterHex: '#f8fafc',
    groundMidHex: '#e2e8f0',
    groundEdgeHex: '#cbd5e1',
    groundOuterHex: '#dce7f3',
    fogNearMult: 1.08,
    fogFarMult: 1.12,
    hemiSky: 0xffffff,
    hemiGround: 0xcbd5e1,
    hemiIntensity: 1.12,
    dirLight: 0xffffff,
    dirIntensity: 1.18,
    rimColor: 0x38bdf8,
    rimIntensity: 0.72,
    gridMajor: 0x94a3b8,
    gridMinor: 0xcbd5e1,
    surface: 0xf8fafc,
    surfaceAlt: 0xe2e8f0,
    plinth: 0xcbd5e1,
    blockBase: 0xcbd5e1,
    blockFaceFillHex: '#ffffff',
    blockFaceBorderHex: '#cbd5e1',
    blockAccentFillHex: '#e0f2fe',
    blockAccentBorderHex: '#0369a1',
    blockTextHex: '#0f172a',
    blockOverhang: 0x94a3b8,
    edgeDefault: 0x64748b,
    edgeVisited: 0x059669,
    ringDefault: 0x94a3b8,
    signLight: 0x1e293b,
    tile: 0xcbd5e1,
    pole: 0x475569,
    lampHead: 0x38bdf8,
    trunk: 0x784b26,
    foliage: 0x1e6b44,
    dustColor: 0x0369a1,
    playerTorso: 0x1e293b,
    playerLimb: 0x334155,
    playerLight: 0xffffff,
    shadow: 0x64748b,
    bugsDark: 0x1e293b,
    bugsRed: 0xdc2626,
    bugsFlash: 0x0f172a,
    arenaRing: 0x94a3b8,
    trackSurface: 0xcbd5e1,
    trackShoulder: 0x94a3b8,
    laneMark: 0xf8fafc,
    obstacleDark: 0x334155,
    obstacleRed: 0xdc2626,
    edgeFirewall: 0x475569,
    edgeAccentLine: 0x0369a1,
    effectType: 'winter',
    particlePrimary: 0xffffff,
    particleSecondary: 0x7dd3fc,
    particleTertiary: 0x0369a1,
  },
};

/**
 * Resolves the complete 3D + HUD theme configuration for /play and all 4 mini-games
 * from ThemeContext's resolved `season` object.
 * Inactive/default months return exact `DEFAULT_GAME_THEME`.
 */
export const getSeasonal3DTheme = (season, seasonalEnabled = true) => {
  if (!seasonalEnabled || !season || !season.isSeasonalActive) {
    return DEFAULT_GAME_THEME;
  }

  const p = season.palette;
  const isWinterLight = season.id === 'december-winter' && !season.isDark;
  const overrideKey =
    season.id === 'december-winter'
      ? isWinterLight
        ? 'december-winter-light'
        : 'december-winter-dark'
      : season.id;

  const extra = SEASON_3D_OVERRIDES[overrideKey] || {};
  const accentHex = p.accent || '#3B82F6';
  const accentRgb = hexToRgbTuple(accentHex);

  const bgHex = isWinterLight ? '#E2E8F0' : p.bgPrimary;
  const sceneBgHex = isWinterLight ? '#DCE7F3' : p.bgPrimary;
  const exploreBgHex = isWinterLight ? '#DCE7F3' : p.bgPrimary;

  const vignetteBackground = isWinterLight
    ? `radial-gradient(ellipse 90% 34% at 50% 8%, ${rgba(accentRgb, 0.14)} 0%, rgba(186, 230, 253, 0.14) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 60%, rgba(148, 163, 184, 0.28) 100%)`
    : `radial-gradient(ellipse 90% 34% at 50% 8%, ${rgba(accentRgb, 0.16)} 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 56%, rgba(4, 4, 8, 0.74) 100%)`;

  return {
    ...DEFAULT_GAME_THEME,
    id: season.id,
    month: season.month,
    isActive: true,
    isLight: isWinterLight,

    bgHex,
    bgSecondaryHex: p.bgSecondary,
    surfaceHex: p.surface,
    surfaceAltHex: p.surfaceAlt,
    surfaceHoverHex: p.surfaceHover,
    borderHex: p.border,
    borderSubtleHex: p.borderSubtle,
    borderHoverHex: p.borderHover || accentHex,
    textPrimaryHex: p.textPrimary,
    textSecondaryHex: p.textSecondary,
    textMutedHex: p.textMuted,
    accentHex,
    accentHoverHex: p.accentHover,
    accentContrastHex: p.accentContrast,
    modalBackdrop: isWinterLight ? 'rgba(15, 23, 42, 0.44)' : 'rgba(0, 0, 0, 0.78)',
    vignetteBackground,

    sceneBg: hexToNum(sceneBgHex),
    exploreBg: hexToNum(exploreBgHex),
    accent: hexToNum(accentHex),
    accentRgb,
    dustColor: hexToNum(accentHex),

    ...extra,
  };
};

/**
 * Builds inline CSS custom properties for GameHub, WebGLFallback, and all 4 game HUD roots,
 * isolating inactive months to original dark tokens even if user toggled portfolio light mode.
 */
export const buildGameCssVars = (theme3D = DEFAULT_GAME_THEME) => ({
  '--bg-primary': theme3D.bgHex,
  '--bg-secondary': theme3D.bgSecondaryHex,
  '--surface': theme3D.surfaceHex,
  '--surface-alt': theme3D.surfaceAltHex,
  '--surface-hover': theme3D.surfaceHoverHex,
  '--border': theme3D.borderHex,
  '--border-subtle': theme3D.borderSubtleHex,
  '--border-hover': theme3D.borderHoverHex,
  '--text-primary': theme3D.textPrimaryHex,
  '--text-secondary': theme3D.textSecondaryHex,
  '--text-muted': theme3D.textMutedHex,
  '--accent': theme3D.accentHex,
  '--accent-hover': theme3D.accentHoverHex,
  '--accent-contrast': theme3D.accentContrastHex,
  '--modal-backdrop': theme3D.modalBackdrop,
});

/**
 * Dedicated Outdoor Daytime Park Theme exclusively for Explore (/play/explore).
 * Strictly isolated from Deploy Stack, Bug Hunter, and Stack Runner arena themes.
 */
export const EXPLORE_DAYTIME_PARK_THEME = {
  ...DEFAULT_GAME_THEME,
  id: 'explore-daytime-park',
  month: null,
  isActive: false,
  isLight: true,

  // Crisp readable frosted park HUD tokens
  bgHex: '#BAE6FD',
  bgSecondaryHex: '#E0F2FE',
  surfaceHex: '#FFFFFF',
  surfaceAltHex: '#F1F5F9',
  surfaceHoverHex: '#E2E8F0',
  borderHex: '#CBD5E1',
  borderSubtleHex: '#E2E8F0',
  borderHoverHex: '#0E7490',
  textPrimaryHex: '#0F172A',
  textSecondaryHex: '#334155',
  textMutedHex: '#475569',
  accentHex: '#0E7490',
  accentHoverHex: '#155E75',
  accentContrastHex: '#FFFFFF',
  modalBackdrop: 'rgba(15, 23, 42, 0.44)',
  vignetteBackground:
    'radial-gradient(ellipse 95% 32% at 50% 0%, rgba(125, 211, 252, 0.24) 0%, transparent 72%), radial-gradient(circle at 50% 55%, transparent 68%, rgba(14, 116, 144, 0.10) 100%)',

  // Daytime outdoor park 3D sky, natural meadow grass & balanced daylight
  sceneBg: 0x90d7f7,
  exploreBg: 0xc2e6f9,
  groundCenterHex: '#6eb363',
  groundMidHex: '#559c54',
  groundEdgeHex: '#3f7f47',
  groundOuterHex: '#c2e6f9',
  fogNearMult: 1,
  fogFarMult: 1,
  hemiSky: 0xe8f4fd,
  hemiGround: 0x456e4b,
  hemiIntensity: 1.04,
  dirLight: 0xfff8ec,
  dirIntensity: 1.46,
  rimColor: 0x7dd3fc,
  rimIntensity: 0.5,

  // Portfolio buildings + signage + pink/cyan accents
  accent: 0x06b6d4,
  accentRgb: [6, 182, 212],
  pinkAccent: 0xec4899,
  visited: 0x10b981,
  surface: 0xf8fafc,
  surfaceAlt: 0xe2e8f0,
  plinth: 0xcbd5e1,
  edgeDefault: 0x64748b,
  edgeVisited: 0x059669,
  ringDefault: 0x94a3b8,
  signLight: 0x1e293b,

  // Warm natural limestone paths, wood, trees & vegetation
  tile: 0xd1c2a5,
  plazaStone: 0xe8ebe5,
  plazaTrim: 0x9aa5b1,
  wood: 0x854d27,
  trunk: 0x6b4423,
  foliage: 0x2f7044,
  foliageLight: 0x4b9451,
  lampHead: 0xfef08a,
  dustColor: 0xfef9c3,

  playerTorso: 0x1e293b,
  playerLimb: 0x334155,
  playerLight: 0xffffff,
};

/**
 * Resolves Explore's outdoor park theme cleanly.
 * Shifts gently to frosty winter greenery only during December Light Winter.
 */
export const getExploreParkTheme = (season, seasonalEnabled = true) => {
  if (
    seasonalEnabled &&
    season?.isSeasonalActive &&
    season.id === 'december-winter' &&
    !season.isDark
  ) {
    return {
      ...EXPLORE_DAYTIME_PARK_THEME,
      id: 'december-winter',
      month: 12,
      isActive: true,
      accentHex: '#0369A1',
      accentHoverHex: '#075985',
      bgHex: '#E2E8F0',
      sceneBg: 0xdce7f3,
      exploreBg: 0xdce7f3,
      groundCenterHex: '#f1f5f9',
      groundMidHex: '#e2e8f0',
      groundEdgeHex: '#cbd5e1',
      groundOuterHex: '#dce7f3',
      hemiSky: 0xffffff,
      hemiGround: 0xcbd5e1,
      accent: 0x0369a1,
      accentRgb: [3, 105, 161],
      tile: 0xcbd5e1,
      foliage: 0x1e6b44,
      foliageLight: 0x15803d,
      trunk: 0x784b26,
      effectType: 'winter',
      particlePrimary: 0xffffff,
      particleSecondary: 0x7dd3fc,
      particleTertiary: 0x0369a1,
    };
  }
  return EXPLORE_DAYTIME_PARK_THEME;
};
