import * as THREE from 'three';
import { getWorldInteractables } from '../logic/worldConfig.js';
import { DEFAULT_GAME_THEME } from '../shared/seasonalGameTheme.js';

const addEdges = (mesh, edgeMat) => {
  const edgesGeo = new THREE.EdgesGeometry(mesh.geometry);
  const line = new THREE.LineSegments(edgesGeo, edgeMat);
  mesh.add(line);
};

/**
 * Generates a soft radial accent glow texture for the ground halo under a nearby building.
 */
const createProximityGlowTexture = (accentRgb = DEFAULT_GAME_THEME.accentRgb) => {
  const [r, g, b] = accentRgb;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.55)`);
    grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.22)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Creates a distinct 3D icon/signage emblem on the front (+Z) facade of each building
 * so its portfolio section is readable at a glance even without text labels.
 */
const buildSectionSignage = (id, accentMat, signMat) => {
  const signGroup = new THREE.Group();

  if (id === 'projects') {
    const barGeo = new THREE.BoxGeometry(0.11, 0.44, 0.1);
    const leftTop = new THREE.Mesh(barGeo, accentMat);
    leftTop.position.set(-0.62, 0.13, 0);
    leftTop.rotation.z = -Math.PI / 4;
    const leftBot = new THREE.Mesh(barGeo, accentMat);
    leftBot.position.set(-0.62, -0.13, 0);
    leftBot.rotation.z = Math.PI / 4;

    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.68, 0.1), signMat);
    slash.rotation.z = -0.32;

    const rightTop = new THREE.Mesh(barGeo, accentMat);
    rightTop.position.set(0.62, 0.13, 0);
    rightTop.rotation.z = Math.PI / 4;
    const rightBot = new THREE.Mesh(barGeo, accentMat);
    rightBot.position.set(0.62, -0.13, 0);
    rightBot.rotation.z = -Math.PI / 4;

    signGroup.add(leftTop, leftBot, slash, rightTop, rightBot);
    signGroup.position.set(0, 2.55, 1.05);
  } else if (id === 'about') {
    const backplate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 0.08), signMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), accentMat);
    head.position.set(0, 0.22, 0.08);
    const shoulders = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.38, 0.34, 8),
      accentMat
    );
    shoulders.position.set(0, -0.22, 0.08);
    signGroup.add(backplate, head, shoulders);
    signGroup.position.set(0, 1.55, 1.56);
  } else if (id === 'stack') {
    for (let i = 0; i < 3; i++) {
      const mat = i === 1 ? signMat : accentMat;
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.85), mat);
      plate.rotation.y = Math.PI / 4;
      plate.position.set(0, i * 0.28, 0);
      signGroup.add(plate);
    }
    signGroup.position.set(-0.15, 3.85, 0.15);
  } else if (id === 'experience') {
    const caseBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.78, 0.14), accentMat);
    const handleTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.12), signMat);
    handleTop.position.set(0, 0.49, 0);
    const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.12), signMat);
    handleL.position.set(-0.18, 0.42, 0);
    const handleR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.12), signMat);
    handleR.position.set(0.18, 0.42, 0);
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.18), signMat);
    clasp.position.set(0, 0.05, 0.02);
    signGroup.add(caseBody, handleTop, handleL, handleR, clasp);
    signGroup.position.set(-0.1, 1.55, 1.18);
  } else {
    const envBody = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.82, 0.12), signMat);
    const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.15), accentMat);
    flapL.position.set(-0.26, 0.12, 0.03);
    flapL.rotation.z = -0.52;
    const flapR = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.15), accentMat);
    flapR.position.set(0.26, 0.12, 0.03);
    flapR.rotation.z = 0.52;
    signGroup.add(envBody, flapL, flapR);
    signGroup.position.set(0, 1.45, 1.12);
  }

  return signGroup;
};

const buildArcadeKiosk = (group, bodyMat, accentMat, signMat, edgeMat, castShadow) => {
  const kioskGroup = new THREE.Group();
  kioskGroup.rotation.y = -0.45;

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.38, 0.94), bodyMat);
  cabinet.position.set(0, 0.87, 0);
  cabinet.castShadow = castShadow;
  cabinet.receiveShadow = castShadow;
  addEdges(cabinet, edgeMat);

  const marquee = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.28, 1.02), bodyMat);
  marquee.position.set(0, 1.68, 0.04);
  marquee.castShadow = castShadow;
  addEdges(marquee, edgeMat);

  const marqueeStrip = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.14, 0.08), accentMat);
  marqueeStrip.position.set(0, 1.68, 0.55);

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.68, 0.08), signMat);
  screenFrame.position.set(0, 1.04, 0.46);

  const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.56, 0.1), accentMat);
  screenGlow.position.set(0, 1.04, 0.47);

  // Joy-deck + control stick
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.14, 0.44), bodyMat);
  deck.position.set(0, 0.6, 0.58);
  addEdges(deck, edgeMat);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6), accentMat);
  stick.position.set(-0.24, 0.74, 0.62);
  const btn = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.14), accentMat);
  btn.position.set(0.2, 0.7, 0.62);

  // Hovering arcade crystal beacon above cabinet
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), accentMat);
  beacon.position.set(0, 2.28, 0);

  kioskGroup.add(cabinet, marquee, marqueeStrip, screenFrame, screenGlow, deck, stick, btn, beacon);
  group.add(kioskGroup);
  return beacon;
};

const buildArchitecture = (id, group, bodyMat, accentMat, signMat, edgeMat, castShadow) => {
  const archGroup = new THREE.Group();
  archGroup.scale.setScalar(0.75);

  if (id === 'projects') {
    const left = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.0, 1.8), bodyMat);
    left.position.set(-1.1, 2.2, 0);
    const right = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.3, 1.8), bodyMat);
    right.position.set(1.1, 1.85, 0);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 1.1), bodyMat);
    bridge.position.set(0, 2.55, 0.35);
    const accentBar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.95), accentMat);
    accentBar.position.set(0, 3.55, 0);
    [left, right, bridge].forEach((m) => {
      m.castShadow = castShadow;
      m.receiveShadow = castShadow;
      addEdges(m, edgeMat);
      archGroup.add(m);
    });
    archGroup.add(accentBar);
  } else if (id === 'about') {
    const baseOct = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 1.6, 8), bodyMat);
    baseOct.position.set(0, 1.0, 0);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3.2, 8), bodyMat);
    core.position.set(0, 1.8, 0);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.15, 8), accentMat);
    collar.position.set(0, 2.75, 0);
    [baseOct, core].forEach((m) => {
      m.castShadow = castShadow;
      m.receiveShadow = castShadow;
      addEdges(m, edgeMat);
      archGroup.add(m);
    });
    archGroup.add(collar);
  } else if (id === 'stack') {
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), bodyMat);
    tier1.position.set(0, 0.8, 0);
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.2, 1.85), bodyMat);
    tier2.position.set(0.2, 2.0, -0.15);
    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.2, 1.25), bodyMat);
    tier3.position.set(-0.15, 3.2, 0.15);
    const accentFrame = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.14, 1.98), accentMat);
    accentFrame.position.set(0.2, 2.62, -0.15);
    [tier1, tier2, tier3].forEach((m) => {
      m.castShadow = castShadow;
      m.receiveShadow = castShadow;
      addEdges(m, edgeMat);
      archGroup.add(m);
    });
    archGroup.add(accentFrame);
  } else if (id === 'experience') {
    const steps = [
      { w: 2.8, h: 1.0, d: 2.2, x: -0.3, y: 0.7 },
      { w: 2.0, h: 1.9, d: 1.8, x: 0.0, y: 1.15 },
      { w: 1.2, h: 2.9, d: 1.4, x: 0.45, y: 1.65 },
    ];
    steps.forEach((s) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), bodyMat);
      mesh.position.set(s.x, s.y, 0);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = castShadow;
      addEdges(mesh, edgeMat);
      archGroup.add(mesh);
    });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 1.5), accentMat);
    cap.position.set(0.45, 3.16, 0);
    archGroup.add(cap);
  } else {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.6, 2.1), bodyMat);
    base.position.set(0, 1.0, 0);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.5, 1.1), bodyMat);
    shaft.position.set(0, 2.05, 0);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.1, 6), accentMat);
    spire.position.set(0, 3.7, 0);
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), accentMat);
    beacon.position.set(0, 4.35, 0);
    [base, shaft].forEach((m) => {
      m.castShadow = castShadow;
      m.receiveShadow = castShadow;
      addEdges(m, edgeMat);
      archGroup.add(m);
    });
    archGroup.add(spire, beacon);
  }

  const signage = buildSectionSignage(id, accentMat, signMat);
  archGroup.add(signage);
  group.add(archGroup);
};

/**
 * Creates the 5 portfolio buildings with subtle edge highlights, 3D section icons,
 * and a soft ground glow ring under the building the player is near.
 */
export const createBuildings = (
  scene,
  { isMobile = false, includeArcade = true, seasonalTheme = DEFAULT_GAME_THEME } = {}
) => {
  const theme = seasonalTheme || DEFAULT_GAME_THEME;
  const castShadow = !isMobile;
  const glowTex = createProximityGlowTexture(theme.accentRgb);
  const interactables = getWorldInteractables(includeArcade);
  let arcadeBeacon = null;

  const plinthMat = new THREE.MeshStandardMaterial({
    color: theme.plinth,
    roughness: 0.85,
    metalness: 0.12,
  });

  const signMat = new THREE.MeshStandardMaterial({
    color: theme.signLight,
    roughness: 0.35,
    metalness: 0.1,
  });

  const entries = interactables.map((b) => {
    const group = new THREE.Group();
    group.position.set(b.x, 0, b.z);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: theme.surface,
      roughness: 0.68,
      metalness: 0.22,
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: theme.edgeDefault,
      transparent: true,
      opacity: 0.88,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: theme.accent,
      emissiveIntensity: b.isArcade ? 0.45 : 0.32,
      roughness: 0.35,
    });

    // Base plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(b.halfW * 2, 0.18, b.halfD * 2),
      plinthMat
    );
    plinth.position.y = 0.09;
    plinth.receiveShadow = castShadow;
    addEdges(plinth, edgeMat);
    group.add(plinth);

    if (b.isArcade) {
      arcadeBeacon = buildArcadeKiosk(group, bodyMat, accentMat, signMat, edgeMat, castShadow);
    } else {
      buildArchitecture(b.id, group, bodyMat, accentMat, signMat, edgeMat, castShadow);
    }

    // Soft radial ground glow halo under the building when player is near
    const glowSpan = (Math.max(b.halfW, b.halfD) + 1.55) * 2;
    const glowGeo = new THREE.PlaneGeometry(glowSpan, glowSpan);
    glowGeo.rotateX(-Math.PI / 2);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.y = 0.015;
    group.add(glowMesh);

    // Ground proximity ring
    const ringOuter = Math.max(b.halfW, b.halfD) + 0.48;
    const ringGeo = new THREE.RingGeometry(ringOuter - 0.14, ringOuter, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: theme.ringDefault,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.025;
    group.add(ringMesh);

    scene.add(group);

    return {
      data: b,
      group,
      edgeMat,
      accentMat,
      ringMat,
      glowMat,
      anchorWorld: new THREE.Vector3(b.x, b.labelY, b.z),
    };
  });

  const updateHighlights = (nearestId, visitedSet) => {
    for (const entry of entries) {
      const isNearest = entry.data.id === nearestId;
      const isVisited = visitedSet?.has(entry.data.id);

      if (isNearest) {
        entry.edgeMat.color.setHex(theme.accent);
        entry.edgeMat.opacity = 1.0;
        entry.ringMat.color.setHex(theme.accent);
        entry.ringMat.opacity = 0.96;
        entry.glowMat.opacity = 0.92;
        entry.accentMat.emissiveIntensity = 0.72;
      } else if (isVisited) {
        entry.edgeMat.color.setHex(theme.edgeVisited);
        entry.edgeMat.opacity = 0.92;
        entry.ringMat.color.setHex(theme.visited);
        entry.ringMat.opacity = 0.58;
        entry.glowMat.opacity = 0.15;
        entry.accentMat.emissiveIntensity = 0.38;
      } else {
        entry.edgeMat.color.setHex(theme.edgeDefault);
        entry.edgeMat.opacity = 0.85;
        entry.ringMat.color.setHex(theme.ringDefault);
        entry.ringMat.opacity = 0.4;
        entry.glowMat.opacity = 0;
        entry.accentMat.emissiveIntensity = 0.3;
      }
    }
  };

  let beaconClock = 0;

  const updateBeacon = (dt, { reducedMotion = false } = {}) => {
    if (!arcadeBeacon || reducedMotion) return;
    beaconClock += dt;
    arcadeBeacon.rotation.y += dt * 1.35;
    arcadeBeacon.position.y = 2.28 + Math.sin(beaconClock * 2.4) * 0.08;
  };

  return {
    entries,
    updateHighlights,
    updateBeacon,
    dispose: () => {
      glowTex.dispose();
    },
  };
};
