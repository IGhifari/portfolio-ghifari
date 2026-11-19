/**
 * Pure 3D world configuration and building descriptors.
 * Zero Three.js or DOM imports so this module can run in Node.js unit tests.
 */

export const WORLD_BOUNDS = {
  minX: -18,
  maxX: 18,
  minZ: -14,
  maxZ: 14,
};

export const PLAYER_CONFIG = {
  startX: 0,
  startZ: 7.2,
  radius: 0.68,
  speed: 7.5,
};

/**
 * 5 Portfolio Section Buildings arranged in a symmetric circular arc facing the camera,
 * each at an equal radial distance (R = 11.2 units) from the player spawn point (0, 7.2)
 * at angles 0°, ±33°, and ±66°.
 * `interactRadius` is tight around each building's perimeter ring so prompts only
 * appear when the player walks right up to that building.
 */
export const BUILDINGS = [
  {
    id: 'projects',
    number: '01',
    x: 0,
    z: -4.0,
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
    x: -6.1,
    z: -2.19,
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
    x: 6.1,
    z: -2.19,
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
    x: -10.23,
    z: 2.64,
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
    x: 10.23,
    z: 2.64,
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
  x: 5.2,
  z: 6.4,
  halfW: 0.95,
  halfD: 0.95,
  height: 2.35,
  labelY: 3.35,
  interactRadius: 2.35,
  isArcade: true,
  labelKey: 'game.arcade.title',
  subtitleKey: 'game.arcade.subtitle',
};

export const getWorldInteractables = (includeArcade = true) =>
  includeArcade ? [...BUILDINGS, ARCADE_KIOSK] : BUILDINGS;

export const getBuildingById = (id) =>
  BUILDINGS.find((b) => b.id === id) || null;
