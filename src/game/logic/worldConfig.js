/**
 * Pure 3D Explore world configuration, zone layout, and building/football descriptors.
 * Zero Three.js or DOM imports so this module can run in Node.js unit tests.
 */

export const WORLD_BOUNDS = {
  minX: -36,
  maxX: 36,
  minZ: -27,
  maxZ: 27,
};

export const PLAYER_CONFIG = {
  startX: 0,
  startZ: 0,
  radius: 0.68,
  speed: 8.2,
};

/**
 * 5 Portfolio Section Buildings arranged in a wide symmetric North park arc (R = 15.5)
 * centered around the Central Hub spawn (0, 0) at angles -64°, -32°, 0°, +32°, +64°.
 */
export const BUILDINGS = [
  {
    id: 'projects',
    number: '01',
    x: 0,
    z: -15.5,
    halfW: 1.72,
    halfD: 1.28,
    height: 3.35,
    labelY: 4.75,
    interactRadius: 2.65,
    sectionHref: '/#projects',
    secondaryHref: '/study-case',
    labelKey: 'game.buildings.projects.title',
    subtitleKey: 'game.buildings.projects.subtitle',
  },
  {
    id: 'about',
    number: '02',
    x: -8.21,
    z: -13.14,
    halfW: 1.42,
    halfD: 1.42,
    height: 2.75,
    labelY: 4.15,
    interactRadius: 2.55,
    sectionHref: '/#about',
    secondaryHref: '/recruiter',
    labelKey: 'game.buildings.about.title',
    subtitleKey: 'game.buildings.about.subtitle',
  },
  {
    id: 'stack',
    number: '03',
    x: 8.21,
    z: -13.14,
    halfW: 1.42,
    halfD: 1.42,
    height: 3.55,
    labelY: 4.95,
    interactRadius: 2.55,
    sectionHref: '/#stack',
    secondaryHref: null,
    labelKey: 'game.buildings.stack.title',
    subtitleKey: 'game.buildings.stack.subtitle',
  },
  {
    id: 'experience',
    number: '04',
    x: -13.93,
    z: -6.79,
    halfW: 1.38,
    halfD: 1.24,
    height: 2.65,
    labelY: 4.05,
    interactRadius: 2.5,
    sectionHref: '/#experience',
    secondaryHref: '/#journey',
    labelKey: 'game.buildings.experience.title',
    subtitleKey: 'game.buildings.experience.subtitle',
  },
  {
    id: 'contact',
    number: '05',
    x: 13.93,
    z: -6.79,
    halfW: 1.32,
    halfD: 1.32,
    height: 3.6,
    labelY: 5.0,
    interactRadius: 2.5,
    sectionHref: '/#contact',
    secondaryHref: null,
    labelKey: 'game.buildings.contact.title',
    subtitleKey: 'game.buildings.contact.subtitle',
  },
];

export const ARCADE_KIOSK = {
  id: 'arcade',
  number: '06',
  x: -10.5,
  z: 9.0,
  halfW: 0.95,
  halfD: 0.95,
  height: 2.35,
  labelY: 3.35,
  interactRadius: 2.35,
  isArcade: true,
  labelKey: 'game.arcade.title',
  subtitleKey: 'game.arcade.subtitle',
};

/**
 * East Sports Zone: Playable low-poly football pitch reached along the East plaza path.
 */
export const FOOTBALL_FIELD = {
  centerX: 17.5,
  centerZ: 7.5,
  width: 16,
  depth: 10,
  minX: 9.5,
  maxX: 25.5,
  minZ: 2.5,
  maxZ: 12.5,
  goalWidth: 3.4,
  goalHalfWidth: 1.7,
  goalHeight: 1.45,
  goalDepth: 1.2,
  postRadius: 0.12,
  // Buffer around pitch before ball rebounds / auto-resets if kicked wide
  playMargin: 2.8,
  // HUD activation region when exploring the football field zone
  zoneBounds: {
    minX: 6.5,
    maxX: 28.8,
    minZ: -0.2,
    maxZ: 15.2,
  },
};

export const FOUNTAIN_COLLIDER = {
  id: 'fountain',
  x: 0,
  z: 0,
  halfW: 0.95,
  halfD: 0.95,
};

export const SIGNPOST_COLLIDER = {
  id: 'signpost',
  x: -2.6,
  z: -3.2,
  halfW: 0.35,
  halfD: 0.35,
};

export const PARK_BENCHES = [
  { id: 'bench-hub-nw', x: -5.2, z: -2.2, halfW: 0.95, halfD: 0.42, rotY: 0.35 },
  { id: 'bench-pitch-n', x: 14.5, z: 0.6, halfW: 0.95, halfD: 0.42, rotY: 0 },
  { id: 'bench-pitch-s', x: 20.5, z: 14.4, halfW: 0.95, halfD: 0.42, rotY: Math.PI },
  { id: 'bench-arcade', x: -13.6, z: 6.2, halfW: 0.95, halfD: 0.42, rotY: 0.6 },
];

export const getFootballPostColliders = (field = FOOTBALL_FIELD) => {
  const sideNetHalfW = field.goalDepth * 0.5;
  const sideNetXLeft = field.minX - sideNetHalfW;
  const sideNetXRight = field.maxX + sideNetHalfW;
  const northNetZ = field.centerZ - field.goalHalfWidth;
  const southNetZ = field.centerZ + field.goalHalfWidth;

  return [
    { x: field.minX, z: northNetZ, halfW: 0.16, halfD: 0.16 },
    { x: field.minX, z: southNetZ, halfW: 0.16, halfD: 0.16 },
    { x: field.maxX, z: northNetZ, halfW: 0.16, halfD: 0.16 },
    { x: field.maxX, z: southNetZ, halfW: 0.16, halfD: 0.16 },
    // Goal back & side net walls so player cannot walk through any part of the net
    {
      x: field.minX - field.goalDepth,
      z: field.centerZ,
      halfW: 0.12,
      halfD: field.goalHalfWidth + 0.12,
    },
    {
      x: field.maxX + field.goalDepth,
      z: field.centerZ,
      halfW: 0.12,
      halfD: field.goalHalfWidth + 0.12,
    },
    { x: sideNetXLeft, z: northNetZ, halfW: sideNetHalfW, halfD: 0.12 },
    { x: sideNetXLeft, z: southNetZ, halfW: sideNetHalfW, halfD: 0.12 },
    { x: sideNetXRight, z: northNetZ, halfW: sideNetHalfW, halfD: 0.12 },
    { x: sideNetXRight, z: southNetZ, halfW: sideNetHalfW, halfD: 0.12 },
  ];
};

export const getWorldInteractables = (includeArcade = true) =>
  includeArcade ? [...BUILDINGS, ARCADE_KIOSK] : BUILDINGS;

export const getWorldColliders = (includeArcade = true) => [
  ...getWorldInteractables(includeArcade),
  FOUNTAIN_COLLIDER,
  SIGNPOST_COLLIDER,
  ...PARK_BENCHES,
  ...getFootballPostColliders(),
];

export const getBuildingById = (id) =>
  BUILDINGS.find((b) => b.id === id) || null;
