import * as THREE from 'three';
import {
  BUILDINGS,
  PLAYER_CONFIG,
  ARCADE_KIOSK,
  FOOTBALL_FIELD,
  SIGNPOST_COLLIDER,
  PARK_BENCHES,
} from '../logic/worldConfig.js';
import { DEFAULT_GAME_THEME } from '../shared/seasonalGameTheme.js';

// Asymmetric curated tree groves inside & bordering the 72x54 park (balanced silhouettes & unclipped edges)
const PINE_TREE_COORDS = [
  // North-West bluff grove
  { x: -26.2, z: -18.5, s: 1.24 },
  { x: -23.0, z: -21.0, s: 1.02 },
  { x: -29.0, z: -14.8, s: 1.08 },
  // North behind portfolio promenade
  { x: -16.2, z: -22.5, s: 1.2 },
  { x: -12.6, z: -23.8, s: 0.96 },
  { x: -5.4, z: -23.8, s: 1.28 },
  { x: -2.4, z: -25.0, s: 1.02 },
  { x: 6.2, z: -23.8, s: 1.24 },
  { x: 15.8, z: -22.6, s: 1.16 },
  { x: 19.0, z: -23.4, s: 0.94 },
  // North-East ridge above Football Zone
  { x: 24.8, z: -19.0, s: 1.26 },
  { x: 28.0, z: -16.4, s: 1.04 },
  { x: 31.2, z: -12.4, s: 1.14 },
  // East windbreak behind Football Right Goal (safely outside x:28.8 runoff)
  { x: 32.6, z: -2.4, s: 1.12 },
  { x: 33.8, z: 2.4, s: 0.96 },
  { x: 33.0, z: 12.8, s: 1.14 },
  { x: 31.4, z: 17.8, s: 0.98 },
  // South & West woodland margin (restrained heights near bottom screen edges)
  { x: -30.2, z: -4.2, s: 1.12 },
  { x: -31.8, z: 1.4, s: 0.96 },
  { x: -29.6, z: 10.6, s: 1.14 },
  { x: -27.2, z: 17.2, s: 0.98 },
  { x: -22.8, z: 21.0, s: 1.06 },
  { x: -15.4, z: 21.8, s: 0.92 },
  { x: -5.6, z: 22.2, s: 1.02 },
  { x: 4.8, z: 22.4, s: 1.06 },
  { x: 14.5, z: 22.0, s: 0.95 },
  { x: 25.8, z: 21.6, s: 1.04 },
];

// Broad-leaf oak trees with varied canopy scale & asymmetrical natural pairing
const OAK_TREE_COORDS = [
  { x: -21.4, z: -12.8, s: 1.12 },
  { x: -24.4, z: 3.4, s: 1.0 },
  { x: -19.8, z: 12.6, s: 1.12 },
  { x: -17.6, z: 16.8, s: 0.9 },
  { x: -3.2, z: 16.4, s: 1.08 },
  { x: 0.6, z: 18.8, s: 0.92 },
  { x: 20.6, z: -14.4, s: 1.14 },
  { x: 25.0, z: -7.8, s: 1.02 },
  { x: 28.6, z: -5.4, s: 1.06 },
  { x: 9.8, z: 20.0, s: 1.04 },
  { x: 20.8, z: 19.6, s: 0.96 },
  { x: -10.8, z: -21.0, s: 1.06 },
  { x: 10.8, z: -21.0, s: 1.04 },
];

// Varied low-poly shrubs placed in landscaped corners (hub planters, promenade flanks, arcade garden, pitch sidelines)
const BUSH_COORDS = [
  { x: -5.2, z: -0.5, s: 1.04 },
  { x: -5.8, z: 0.4, s: 0.72 },
  { x: 5.2, z: -0.6, s: 1.02 },
  { x: 2.8, z: 5.1, s: 1.08 },
  { x: 3.6, z: 5.6, s: 0.74 },
  { x: -2.8, z: 5.1, s: 0.96 },
  // Arcade Pavilion garden corners
  { x: -8.2, z: 11.4, s: 1.12 },
  { x: -13.4, z: 10.6, s: 1.18 },
  { x: -14.1, z: 9.8, s: 0.78 },
  // East Football pitch entrance & spectator framing (outside pitch play corridor)
  { x: 8.6, z: 3.4, s: 0.96 },
  { x: 8.6, z: 11.6, s: 0.98 },
  { x: 26.8, z: 1.4, s: 1.04 },
  { x: 26.8, z: 13.8, s: 0.98 },
  // North Promenade green dividers between buildings
  { x: -4.2, z: -15.6, s: 1.15 },
  { x: 4.2, z: -15.6, s: 1.15 },
  { x: -12.6, z: -11.4, s: 0.92 },
  { x: 12.6, z: -11.4, s: 0.92 },
  { x: -19.2, z: -5.6, s: 1.06 },
  { x: 19.6, z: -5.4, s: 1.08 },
];

// Dedicated curated flower-bed centers (selective blooming clusters rather than everywhere)
const FLOWER_BED_CENTERS = [
  { x: -5.1, z: -0.3, r: 0.75, count: 6 },
  { x: 2.8, z: 5.0, r: 0.75, count: 6 },
  { x: -8.2, z: 11.2, r: 0.85, count: 7 },
  { x: -13.3, z: 10.5, r: 0.82, count: 7 },
  { x: -3.9, z: -15.3, r: 0.85, count: 6 },
  { x: 3.9, z: -15.3, r: 0.85, count: 6 },
  { x: 13.3, z: 0.6, r: 0.72, count: 5 },
  { x: 21.7, z: 14.4, r: 0.72, count: 5 },
];

// Natural low-poly park boulders tucked along groves & outer corners (clear of walkways/destinations)
const ROCK_CLUSTERS = [
  { x: -20.2, z: -13.5, sx: 1.1, sy: 0.75, sz: 0.9, ry: 0.4 },
  { x: -19.4, z: -13.9, sx: 0.65, sy: 0.5, sz: 0.65, ry: 1.2 },
  { x: -24.5, z: -17.4, sx: 1.25, sy: 0.82, sz: 1.05, ry: 2.1 },
  { x: -23.4, z: 4.2, sx: 0.95, sy: 0.62, sz: 0.85, ry: 0.9 },
  { x: -18.8, z: 13.2, sx: 1.05, sy: 0.68, sz: 0.92, ry: 1.8 },
  { x: -14.8, z: 17.8, sx: 0.78, sy: 0.52, sz: 0.7, ry: 0.3 },
  { x: -4.4, z: 16.2, sx: 0.98, sy: 0.62, sz: 0.88, ry: 2.4 },
  { x: 21.5, z: -14.8, sx: 1.18, sy: 0.74, sz: 1.0, ry: 1.1 },
  { x: 22.4, z: -14.1, sx: 0.7, sy: 0.48, sz: 0.66, ry: 0.2 },
  { x: 29.8, z: -4.2, sx: 1.08, sy: 0.7, sz: 0.94, ry: 2.6 },
  { x: 30.6, z: 16.5, sx: 1.2, sy: 0.78, sz: 1.02, ry: 0.7 },
  { x: 29.9, z: 17.3, sx: 0.72, sy: 0.46, sz: 0.68, ry: 1.9 },
  { x: -5.4, z: -21.8, sx: 1.15, sy: 0.72, sz: 0.96, ry: 1.5 },
  { x: 6.4, z: -21.9, sx: 1.02, sy: 0.66, sz: 0.9, ry: 2.8 },
];

// Gentle undulating hills outside the 72x54 playable area so world feels expansive with no cliff edge
const OUTER_HILLS = [
  // Northern horizon ridge behind buildings
  { x: -38, z: -38, sx: 14, sy: 4.2, sz: 10 },
  { x: -18, z: -42, sx: 16, sy: 5.4, sz: 11 },
  { x: 6, z: -44, sx: 18, sy: 6.2, sz: 12 },
  { x: 28, z: -41, sx: 15, sy: 4.8, sz: 10 },
  // Eastern rolling slopes behind Football zone
  { x: 49, z: -20, sx: 13, sy: 4.5, sz: 14 },
  { x: 52, z: 6, sx: 14, sy: 5.2, sz: 16 },
  { x: 48, z: 26, sx: 13, sy: 4.0, sz: 12 },
  // Western woodland hills
  { x: -50, z: -18, sx: 13, sy: 4.6, sz: 14 },
  { x: -52, z: 8, sx: 14, sy: 5.0, sz: 16 },
  { x: -46, z: 28, sx: 13, sy: 3.8, sz: 12 },
  // Southern background swells
  { x: -24, z: 39, sx: 16, sy: 3.6, sz: 11 },
  { x: 4, z: 41, sx: 18, sy: 4.1, sz: 11 },
  { x: 28, z: 39, sx: 15, sy: 3.7, sz: 10 },
];

// Selective low-poly bollard light placements (plaza intersections, promenade, arcade & pitch corners)
const BOLLARD_LIGHTS = [
  { x: -1.35, z: -4.95, ry: 0.18 }, // Central Plaza NW intersection toward 01 Projects
  { x: 4.62, z: 2.33, ry: 0.78 },   // Central Plaza East junction toward Football Pitch
  { x: 1.45, z: -11.4, ry: 0.0 },   // Portfolio Promenade mid-approach
  { x: -8.85, z: 6.35, ry: -0.65 }, // Southwest Arcade Pavilion entrance corner
  { x: 8.2, z: 4.8, ry: 0.2 },      // East Football Field NW gateway shoulder
  { x: -1.6, z: 4.85, ry: 0.35 },   // South Plaza rim curve
];

/**
 * Generates straight warm flagstone walkways branching smoothly from Central Hub (0,0)
 * to each portfolio building, the Arcade Pavilion, and the East Football Pitch entrance.
 */
const buildParkPaths = () => {
  const ox = PLAYER_CONFIG.startX;
  const oz = PLAYER_CONFIG.startZ;
  const tiles = [];

  const addWalkway = (destX, destZ, startR, endMargin) => {
    const dx = destX - ox;
    const dz = destZ - oz;
    const dist = Math.hypot(dx, dz);
    if (dist < 1) return;
    const ux = dx / dist;
    const uz = dz / dist;
    const nx = -uz;
    const nz = ux;
    const rotY = Math.atan2(ux, uz);
    const endR = dist - endMargin;

    let stepIdx = 0;
    for (let r = startR; r <= endR; r += 0.72) {
      const alt = stepIdx % 2 === 0 ? 1 : -1;
      tiles.push({
        x: ox + ux * r + nx * alt * 0.03,
        z: oz + uz * r + nz * alt * 0.03,
        rotY: rotY + alt * 0.025,
        sx: stepIdx % 3 === 0 ? 1.06 : 0.96,
        sz: stepIdx % 2 === 0 ? 1.04 : 0.95,
        toneIdx: stepIdx % 4,
      });
      stepIdx += 1;
    }
  };

  for (const b of BUILDINGS) {
    addWalkway(b.x, b.z, 4.45, Math.max(b.halfW, b.halfD) + 0.95);
  }

  addWalkway(ARCADE_KIOSK.x, ARCADE_KIOSK.z, 4.45, ARCADE_KIOSK.halfW + 1.0);
  addWalkway(FOOTBALL_FIELD.minX - 0.8, FOOTBALL_FIELD.centerZ, 4.45, 0.2);

  return tiles;
};

/**
 * Populates refined low-poly outdoor park landscaping, zone pads, multi-tier groves,
 * rolling outer hills, distant woodland skyline, slow sky clouds, and ambient sunlight motes.
 */
export const createProps = (
  scene,
  { isMobile = false, seasonalTheme = DEFAULT_GAME_THEME } = {}
) => {
  const theme = seasonalTheme || DEFAULT_GAME_THEME;
  const isWinterPark = Boolean(theme.isActive && theme.id === 'december-winter');
  const dummy = new THREE.Object3D();
  const disposables = [];
  const track = (obj) => {
    disposables.push(obj);
    return obj;
  };

  const tileTransforms = buildParkPaths();

  // 1. Stepped Stone Central Hub Plaza at (0, 0) + Central Low-Poly Water Fountain Landmark
  // Carefully layered vertical clearances (>= 18mm separation) prevent all Z-fighting:
  // Ground: 0.000 | Outer Curb Top: 0.036 | Plaza Stone Top: 0.062 | Spoke Joints Top: 0.068
  // Mosaic Rings: y = 0.082 (with polygonOffset + depthWrite:false, clear of all spoke segments)
  const hubOuterGeo = track(new THREE.CylinderGeometry(4.65, 4.85, 0.04, 32));
  const hubOuterMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.plazaTrim || 0x9aa5b1,
      roughness: 0.9,
      metalness: 0.05,
    })
  );
  const hubOuterMesh = new THREE.Mesh(hubOuterGeo, hubOuterMat);
  hubOuterMesh.position.set(0, 0.016, 0);
  hubOuterMesh.receiveShadow = !isMobile;

  const hubGeo = track(new THREE.CylinderGeometry(4.2, 4.35, 0.056, 28));
  const hubMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.plazaStone || 0xe8ebe5,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  const hubMesh = new THREE.Mesh(hubGeo, hubMat);
  hubMesh.position.set(0, 0.034, 0);
  hubMesh.receiveShadow = !isMobile;

  // Radial stonework paver joints segmented cleanly outside mosaic rings (zero intersection)
  const innerSpokeGeo = track(new THREE.BoxGeometry(0.07, 0.012, 1.12));
  const outerSpokeGeo = track(new THREE.BoxGeometry(0.07, 0.012, 1.05));
  const spokeJointGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const innerJoint = new THREE.Mesh(innerSpokeGeo, hubOuterMat);
    innerJoint.position.set(Math.sin(ang) * 2.02, 0.062, Math.cos(ang) * 2.02);
    innerJoint.rotation.y = ang;
    const outerJoint = new THREE.Mesh(outerSpokeGeo, hubOuterMat);
    outerJoint.position.set(Math.sin(ang) * 3.55, 0.062, Math.cos(ang) * 3.55);
    outerJoint.rotation.y = ang;
    spokeJointGroup.add(innerJoint, outerJoint);
  }

  const hubRingGeo = track(new THREE.RingGeometry(2.74, 2.92, 32));
  hubRingGeo.rotateX(-Math.PI / 2);
  const hubRingMat = track(
    new THREE.MeshBasicMaterial({
      color: theme.accent,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  const hubRing = new THREE.Mesh(hubRingGeo, hubRingMat);
  hubRing.position.set(0, 0.082, 0);
  hubRing.renderOrder = 2;

  const hubInnerRingGeo = track(new THREE.RingGeometry(1.24, 1.38, 24));
  hubInnerRingGeo.rotateX(-Math.PI / 2);
  const hubInnerRingMat = track(
    new THREE.MeshBasicMaterial({
      color: theme.pinkAccent || theme.accent,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  const hubInnerRing = new THREE.Mesh(hubInnerRingGeo, hubInnerRingMat);
  hubInnerRing.position.set(0, 0.082, 0);
  hubInnerRing.renderOrder = 2;
  scene.add(hubOuterMesh, hubMesh, spokeJointGroup, hubRing, hubInnerRing);

  // Decorative Low-Poly Tiered Stone & Cyan Water Fountain at exact Hub Center (0, 0)
  // Strict vertical stacking (zero coplanar/overlapping stone vs water planes):
  // fBase top: 0.20 | fRim top: 0.37 | Basin Curb Lip: 0.43 | Basin Water top: 0.42 | Upper Bowl top: 1.04 | Upper Water top: 1.08
  const fountainGroup = new THREE.Group();
  const fBaseGeo = track(new THREE.CylinderGeometry(1.06, 1.15, 0.14, 12));
  const fBase = new THREE.Mesh(fBaseGeo, hubOuterMat);
  fBase.position.y = 0.13;
  fBase.castShadow = !isMobile;

  const fRimGeo = track(new THREE.CylinderGeometry(0.98, 1.04, 0.17, 12));
  const fRim = new THREE.Mesh(fRimGeo, hubMat);
  fRim.position.y = 0.285;
  fRim.castShadow = !isMobile;

  // Raised stone basin lip ring framing the water cleanly so water never clips the rim wall
  const fCurbLipGeo = track(new THREE.TorusGeometry(0.94, 0.072, 6, 12));
  fCurbLipGeo.rotateX(Math.PI / 2);
  const fCurbLip = new THREE.Mesh(fCurbLipGeo, hubMat);
  fCurbLip.position.y = 0.415;
  fCurbLip.castShadow = !isMobile;

  const waterColor = isWinterPark ? 0x7dd3fc : 0x38bdf8;
  // Crisp non-transparent glossy water disc eliminates camera-angle transparency sorting shimmer
  const fWaterMat = track(
    new THREE.MeshStandardMaterial({
      color: waterColor,
      emissive: theme.accent,
      emissiveIntensity: 0.18,
      roughness: 0.16,
      metalness: 0.14,
    })
  );
  const fBasinWaterGeo = track(new THREE.CylinderGeometry(0.89, 0.89, 0.04, 12));
  const fBasinWater = new THREE.Mesh(fBasinWaterGeo, fWaterMat);
  fBasinWater.position.y = 0.4;

  const fPedestalGeo = track(new THREE.CylinderGeometry(0.2, 0.28, 0.52, 8));
  const fPedestal = new THREE.Mesh(fPedestalGeo, hubOuterMat);
  fPedestal.position.y = 0.68;
  fPedestal.castShadow = !isMobile;

  const fUpperBowlGeo = track(new THREE.CylinderGeometry(0.48, 0.24, 0.12, 10));
  const fUpperBowl = new THREE.Mesh(fUpperBowlGeo, hubMat);
  fUpperBowl.position.y = 0.98;
  fUpperBowl.castShadow = !isMobile;

  const fUpperLipGeo = track(new THREE.TorusGeometry(0.45, 0.045, 6, 10));
  fUpperLipGeo.rotateX(Math.PI / 2);
  const fUpperLip = new THREE.Mesh(fUpperLipGeo, hubMat);
  fUpperLip.position.y = 1.055;

  const fUpperWaterGeo = track(new THREE.CylinderGeometry(0.42, 0.42, 0.032, 10));
  const fUpperWater = new THREE.Mesh(fUpperWaterGeo, fWaterMat);
  fUpperWater.position.y = 1.058;

  const fNozzleGeo = track(new THREE.CylinderGeometry(0.06, 0.12, 0.18, 8));
  const fNozzle = new THREE.Mesh(fNozzleGeo, hubOuterMat);
  fNozzle.position.y = 1.165;

  const fFinialMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: theme.accent,
      emissiveIntensity: 0.42,
      roughness: 0.25,
    })
  );
  const fFinialGeo = track(new THREE.OctahedronGeometry(0.11, 0));
  const fFinial = new THREE.Mesh(fFinialGeo, fFinialMat);
  fFinial.position.y = 1.36;

  // 4 subtle translucent cyan water stream droplets falling from upper saucer into lower basin
  const fStreamMat = track(
    new THREE.MeshStandardMaterial({
      color: waterColor,
      emissive: theme.accent,
      emissiveIntensity: 0.22,
      roughness: 0.15,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    })
  );
  const streamArcGeo = track(new THREE.CylinderGeometry(0.022, 0.032, 0.5, 5));
  for (let sIdx = 0; sIdx < 4; sIdx++) {
    const ang = (sIdx / 4) * Math.PI * 2 + Math.PI / 4;
    const stream = new THREE.Mesh(streamArcGeo, fStreamMat);
    stream.position.set(Math.cos(ang) * 0.45, 0.74, Math.sin(ang) * 0.45);
    stream.rotation.order = 'YXZ';
    stream.rotation.y = -ang;
    stream.rotation.z = 0.36;
    stream.renderOrder = 3;
    fountainGroup.add(stream);
  }

  fountainGroup.add(
    fBase,
    fRim,
    fCurbLip,
    fBasinWater,
    fPedestal,
    fUpperBowl,
    fUpperLip,
    fUpperWater,
    fNozzle,
    fFinial
  );
  scene.add(fountainGroup);

  // Lightweight pooled water splash particles gently arching above upper saucer
  const splashCount = isMobile ? 16 : 26;
  const splashPos = new Float32Array(splashCount * 3);
  const splashPhase = new Float32Array(splashCount);
  const splashAngle = new Float32Array(splashCount);
  for (let i = 0; i < splashCount; i++) {
    splashPhase[i] = (i / splashCount) * 1.0;
    splashAngle[i] = i * 2.399;
    splashPos[i * 3] = Math.cos(splashAngle[i]) * 0.14;
    splashPos[i * 3 + 1] = 1.12 + (i % 3) * 0.12;
    splashPos[i * 3 + 2] = Math.sin(splashAngle[i]) * 0.14;
  }
  const splashGeo = track(new THREE.BufferGeometry());
  splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
  const splashMat = track(
    new THREE.PointsMaterial({
      color: isWinterPark ? 0xe0f2fe : 0x7dd3fc,
      size: 0.085,
      transparent: true,
      opacity: 0.76,
      depthWrite: false,
    })
  );
  const splashPoints = new THREE.Points(splashGeo, splashMat);
  splashPoints.renderOrder = 4;
  scene.add(splashPoints);

  // Subtle Zone Identity Pads: Arcade Pavilion stone plaza + Promenade doorstep mats + Pitch bench pads
  const zonePadGroup = new THREE.Group();
  const arcadePadGeo = track(new THREE.CylinderGeometry(2.1, 2.24, 0.04, 8));
  const arcadePadMesh = new THREE.Mesh(arcadePadGeo, hubOuterMat);
  arcadePadMesh.position.set(ARCADE_KIOSK.x, 0.02, ARCADE_KIOSK.z);
  arcadePadMesh.rotation.y = Math.PI / 8;
  arcadePadMesh.receiveShadow = !isMobile;

  const arcadeRingGeo = track(new THREE.RingGeometry(1.78, 1.92, 8));
  arcadeRingGeo.rotateX(-Math.PI / 2);
  const arcadeRingMesh = new THREE.Mesh(arcadeRingGeo, hubInnerRingMat);
  arcadeRingMesh.position.set(ARCADE_KIOSK.x, 0.056, ARCADE_KIOSK.z);
  arcadeRingMesh.rotation.y = Math.PI / 8;
  arcadeRingMesh.renderOrder = 2;
  zonePadGroup.add(arcadePadMesh, arcadeRingMesh);

  // Welcoming flush stone aprons connecting path tips to each portfolio building
  const apronStepGeo = track(new THREE.BoxGeometry(1.85, 0.03, 1.05));
  for (const b of BUILDINGS) {
    const dirX = -b.x;
    const dirZ = -b.z;
    const len = Math.hypot(dirX, dirZ) || 1;
    const stepMesh = new THREE.Mesh(apronStepGeo, hubOuterMat);
    stepMesh.position.set(
      b.x + (dirX / len) * (Math.max(b.halfW, b.halfD) + 0.35),
      0.015,
      b.z + (dirZ / len) * (Math.max(b.halfW, b.halfD) + 0.35)
    );
    stepMesh.rotation.y = Math.atan2(dirX, dirZ);
    stepMesh.receiveShadow = !isMobile;
    zonePadGroup.add(stepMesh);
  }

  // Spectator timber/stone pads neatly under Football North & South sidelines benches
  const benchPadGeo = track(new THREE.BoxGeometry(2.6, 0.025, 1.25));
  for (const b of PARK_BENCHES) {
    if (b.id.startsWith('bench-pitch-')) {
      const bPad = new THREE.Mesh(benchPadGeo, hubOuterMat);
      bPad.position.set(b.x, 0.012, b.z);
      bPad.receiveShadow = !isMobile;
      zonePadGroup.add(bPad);
    }
  }
  scene.add(zonePadGroup);

  // 2. Directional Wooden Park Signpost near Central Hub edge
  const signGroup = new THREE.Group();
  signGroup.position.set(SIGNPOST_COLLIDER.x, 0, SIGNPOST_COLLIDER.z);
  const woodMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.wood || 0x854d27,
      roughness: 0.85,
    })
  );
  const signPostGeo = track(new THREE.CylinderGeometry(0.08, 0.1, 1.9, 6));
  const signPostMesh = new THREE.Mesh(signPostGeo, woodMat);
  signPostMesh.position.y = 0.95;
  signPostMesh.castShadow = !isMobile;

  const boardGeo = track(new THREE.BoxGeometry(0.92, 0.24, 0.08));
  const boardNMat = track(
    new THREE.MeshStandardMaterial({ color: theme.accent, roughness: 0.55 })
  );
  const boardN = new THREE.Mesh(boardGeo, boardNMat);
  boardN.position.set(0, 1.62, 0.05);

  const boardEMat = track(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 }));
  const boardE = new THREE.Mesh(boardGeo, boardEMat);
  boardE.position.set(0.18, 1.32, 0);
  boardE.rotation.y = Math.PI / 2;

  const boardSWMat = track(
    new THREE.MeshStandardMaterial({ color: theme.pinkAccent || 0xec4899, roughness: 0.55 })
  );
  const boardSW = new THREE.Mesh(boardGeo, boardSWMat);
  boardSW.position.set(-0.12, 1.04, 0);
  boardSW.rotation.y = -0.65;
  signGroup.add(signPostMesh, boardN, boardE, boardSW);
  scene.add(signGroup);

  // 3. Soft Limestone Flagstone Walkway Tiles + Natural Path-Edge Pebble Accents
  const tileGeo = track(new THREE.BoxGeometry(1.16, 0.032, 0.82));
  const tileMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.91,
      metalness: 0.02,
    })
  );
  const tileBaseColor = new THREE.Color(theme.tile || 0xd1c2a5);
  const tileShades = [
    tileBaseColor.clone().offsetHSL(0, -0.02, 0.035),
    tileBaseColor.clone(),
    tileBaseColor.clone().offsetHSL(0.01, -0.04, -0.03),
    tileBaseColor.clone().offsetHSL(-0.01, 0.01, 0.02),
  ];
  const tileInstanced = new THREE.InstancedMesh(tileGeo, tileMat, tileTransforms.length);
  tileInstanced.receiveShadow = !isMobile;
  tileTransforms.forEach((t, idx) => {
    // Raise tiles slightly (top=0.044) above hubOuterMesh (top=0.036) so hub-edge spokes never Z-fight
    dummy.position.set(t.x, 0.028, t.z);
    dummy.rotation.set(0, t.rotY, 0);
    dummy.scale.set(t.sx, 1, t.sz);
    dummy.updateMatrix();
    tileInstanced.setMatrixAt(idx, dummy.matrix);
    tileInstanced.setColorAt(idx, tileShades[t.toneIdx % tileShades.length]);
  });
  tileInstanced.instanceMatrix.needsUpdate = true;
  if (tileInstanced.instanceColor) tileInstanced.instanceColor.needsUpdate = true;
  scene.add(tileInstanced);

  // Minimal natural curb pebble accents spaced subtly along path borders
  const pathPebbleGeo = track(new THREE.DodecahedronGeometry(0.11, 0));
  const pathPebbleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
    })
  );
  const pebbleCoords = tileTransforms
    .filter((_, idx) => idx % 6 === 2)
    .slice(0, 24);
  if (pebbleCoords.length > 0) {
    const pebbleInst = new THREE.InstancedMesh(pathPebbleGeo, pathPebbleMat, pebbleCoords.length);
    const pebbleShade = new THREE.Color(0x94a3b8);
    pebbleCoords.forEach((t, idx) => {
      const side = idx % 2 === 0 ? 1 : -1;
      const nx = Math.cos(t.rotY);
      const nz = -Math.sin(t.rotY);
      dummy.position.set(t.x + nx * side * 0.72, 0.035, t.z + nz * side * 0.72);
      dummy.rotation.set(0.2, idx * 1.1, 0.15);
      dummy.scale.set(1.15, 0.6, 0.95);
      dummy.updateMatrix();
      pebbleInst.setMatrixAt(idx, dummy.matrix);
      pebbleInst.setColorAt(
        idx,
        idx % 3 === 0 ? tileShades[2] : pebbleShade
      );
    });
    pebbleInst.instanceMatrix.needsUpdate = true;
    if (pebbleInst.instanceColor) pebbleInst.instanceColor.needsUpdate = true;
    scene.add(pebbleInst);
  }

  // 4. Minimalist Modern Low-Poly Park Bollard Lights (~0.82m tall, dark charcoal + soft warm-white glow)
  const poleMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.pole || 0x334155,
      roughness: 0.65,
      metalness: 0.35,
    })
  );
  const bollardBodyMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x3b424c,
      roughness: 0.72,
      metalness: 0.24,
    })
  );
  const bollardLensMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf9f3e5,
      emissive: 0xffe6bd,
      emissiveIntensity: 0.34,
      roughness: 0.28,
    })
  );

  const bollardBaseGeo = track(new THREE.BoxGeometry(0.26, 0.08, 0.26));
  const bollardShaftGeo = track(new THREE.BoxGeometry(0.16, 0.52, 0.16));
  const bollardLensGeo = track(new THREE.BoxGeometry(0.145, 0.14, 0.145));
  const bollardCapGeo = track(new THREE.BoxGeometry(0.22, 0.075, 0.22));

  const bollardCount = BOLLARD_LIGHTS.length;
  const bollardBaseInst = new THREE.InstancedMesh(bollardBaseGeo, bollardBodyMat, bollardCount);
  const bollardShaftInst = new THREE.InstancedMesh(bollardShaftGeo, bollardBodyMat, bollardCount);
  const bollardLensInst = new THREE.InstancedMesh(bollardLensGeo, bollardLensMat, bollardCount);
  const bollardCapInst = new THREE.InstancedMesh(bollardCapGeo, bollardBodyMat, bollardCount);

  BOLLARD_LIGHTS.forEach((b, idx) => {
    dummy.rotation.set(0, b.ry, 0);
    dummy.scale.set(1, 1, 1);

    dummy.position.set(b.x, 0.04, b.z);
    dummy.updateMatrix();
    bollardBaseInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x, 0.34, b.z);
    dummy.updateMatrix();
    bollardShaftInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x, 0.67, b.z);
    dummy.updateMatrix();
    bollardLensInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x, 0.78, b.z);
    dummy.updateMatrix();
    bollardCapInst.setMatrixAt(idx, dummy.matrix);
  });

  [bollardBaseInst, bollardShaftInst, bollardLensInst, bollardCapInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
  });
  scene.add(bollardBaseInst, bollardShaftInst, bollardLensInst, bollardCapInst);

  // 5. Layered Multi-Tier Pine Groves & Multi-Crowned Oak Trees (taller brown trunks, varied greens)
  const trunkGeo = track(new THREE.CylinderGeometry(0.14, 0.22, 1.45, 6));
  const trunkMat = track(
    new THREE.MeshStandardMaterial({
      color: theme.trunk,
      roughness: 0.9,
    })
  );
  const pineLowerGeo = track(new THREE.ConeGeometry(0.95, 1.65, 6));
  const pineMidGeo = track(new THREE.ConeGeometry(0.74, 1.45, 6));
  const pineTopGeo = track(new THREE.ConeGeometry(0.48, 1.15, 6));
  const pineMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.04,
    })
  );

  const pineBaseColor = new THREE.Color(theme.foliage || 0x15803d);
  const pineShades = [
    pineBaseColor.clone(),
    pineBaseColor.clone().offsetHSL(0.02, 0.04, -0.05),
    pineBaseColor.clone().offsetHSL(-0.02, -0.04, 0.04),
  ];

  const allTrunks = [...PINE_TREE_COORDS, ...OAK_TREE_COORDS];
  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, allTrunks.length);
  const pineLowerInst = new THREE.InstancedMesh(pineLowerGeo, pineMat, PINE_TREE_COORDS.length);
  const pineMidInst = new THREE.InstancedMesh(pineMidGeo, pineMat, PINE_TREE_COORDS.length);
  const pineTopInst = new THREE.InstancedMesh(pineTopGeo, pineMat, PINE_TREE_COORDS.length);
  trunkInstanced.castShadow = !isMobile;
  pineLowerInst.castShadow = !isMobile;
  pineMidInst.castShadow = !isMobile;
  pineTopInst.castShadow = !isMobile;

  allTrunks.forEach((c, idx) => {
    const s = c.s;
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(s, s, s);
    dummy.position.set(c.x, 0.725 * s, c.z);
    dummy.updateMatrix();
    trunkInstanced.setMatrixAt(idx, dummy.matrix);
  });

  PINE_TREE_COORDS.forEach((c, idx) => {
    const s = c.s;
    const shade = pineShades[idx % pineShades.length];
    dummy.rotation.set(0, idx * 0.85, 0);
    dummy.scale.set(s, s, s);

    dummy.position.set(c.x, 1.98 * s, c.z);
    dummy.updateMatrix();
    pineLowerInst.setMatrixAt(idx, dummy.matrix);
    pineLowerInst.setColorAt(idx, shade);

    dummy.rotation.set(0, idx * 0.85 + 0.4, 0);
    dummy.position.set(c.x, 2.86 * s, c.z);
    dummy.updateMatrix();
    pineMidInst.setMatrixAt(idx, dummy.matrix);
    pineMidInst.setColorAt(idx, shade);

    dummy.rotation.set(0, idx * 0.85 + 0.8, 0);
    dummy.position.set(c.x, 3.65 * s, c.z);
    dummy.updateMatrix();
    pineTopInst.setMatrixAt(idx, dummy.matrix);
    pineTopInst.setColorAt(idx, shade);
  });

  const oakCrownGeo = track(new THREE.DodecahedronGeometry(1.02, 0));
  const oakCrownMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.04,
    })
  );
  const oakBaseColor = new THREE.Color(theme.foliageLight || 0x29a853);
  const oakShades = [
    oakBaseColor.clone(),
    oakBaseColor.clone().offsetHSL(-0.02, 0.05, 0.05),
    oakBaseColor.clone().offsetHSL(0.02, -0.05, -0.04),
  ];

  // Primary oak crown + secondary off-center shoulder puff so silhouettes look sculpted
  const oakInstanced = new THREE.InstancedMesh(oakCrownGeo, oakCrownMat, OAK_TREE_COORDS.length * 2);
  oakInstanced.castShadow = !isMobile;
  OAK_TREE_COORDS.forEach((c, idx) => {
    const s = c.s;
    const shade = oakShades[idx % oakShades.length];

    dummy.rotation.set(0.2, idx * 1.1, 0);
    dummy.scale.set(s * 1.08, s * 1.12, s * 1.04);
    dummy.position.set(c.x, 2.25 * s, c.z);
    dummy.updateMatrix();
    oakInstanced.setMatrixAt(idx * 2, dummy.matrix);
    oakInstanced.setColorAt(idx * 2, shade);

    const ang = idx * 1.7;
    dummy.rotation.set(0.1, idx * 0.6, 0.2);
    dummy.scale.set(s * 0.72, s * 0.68, s * 0.72);
    dummy.position.set(
      c.x + Math.cos(ang) * 0.45 * s,
      2.65 * s,
      c.z + Math.sin(ang) * 0.45 * s
    );
    dummy.updateMatrix();
    oakInstanced.setMatrixAt(idx * 2 + 1, dummy.matrix);
    oakInstanced.setColorAt(idx * 2 + 1, shade.clone().offsetHSL(0, 0, 0.04));
  });

  [trunkInstanced, pineLowerInst, pineMidInst, pineTopInst, oakInstanced].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });
  scene.add(trunkInstanced, pineLowerInst, pineMidInst, pineTopInst, oakInstanced);

  // 6. Natural Park Boulders, Shrubs, Curated Flower Beds & Sparse Grass Tufts (InstancedMesh)
  const rockGeo = track(new THREE.DodecahedronGeometry(0.46, 0));
  const rockMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.04,
    })
  );
  const rockShades = [
    new THREE.Color(isWinterPark ? 0xcbd5e1 : 0x94a3b8),
    new THREE.Color(isWinterPark ? 0x94a3b8 : 0x64748b),
    new THREE.Color(isWinterPark ? 0xe2e8f0 : 0xa1a1aa),
  ];
  const rockInstanced = new THREE.InstancedMesh(rockGeo, rockMat, ROCK_CLUSTERS.length);
  rockInstanced.castShadow = !isMobile;
  rockInstanced.receiveShadow = !isMobile;
  ROCK_CLUSTERS.forEach((r, idx) => {
    dummy.position.set(r.x, r.sy * 0.24, r.z);
    dummy.rotation.set(0.15, r.ry, 0.1);
    dummy.scale.set(r.sx, r.sy, r.sz);
    dummy.updateMatrix();
    rockInstanced.setMatrixAt(idx, dummy.matrix);
    rockInstanced.setColorAt(idx, rockShades[idx % rockShades.length]);
  });
  rockInstanced.instanceMatrix.needsUpdate = true;
  if (rockInstanced.instanceColor) rockInstanced.instanceColor.needsUpdate = true;
  scene.add(rockInstanced);

  const bushGeo = track(new THREE.DodecahedronGeometry(0.46, 0));
  const bushInstanced = new THREE.InstancedMesh(bushGeo, oakCrownMat, BUSH_COORDS.length);
  bushInstanced.castShadow = !isMobile;
  BUSH_COORDS.forEach((b, idx) => {
    dummy.rotation.set(0, idx * 0.8, 0);
    dummy.scale.set(b.s, b.s * 0.78, b.s);
    dummy.position.set(b.x, 0.27 * b.s, b.z);
    dummy.updateMatrix();
    bushInstanced.setMatrixAt(idx, dummy.matrix);
    bushInstanced.setColorAt(idx, oakShades[idx % oakShades.length]);
  });
  bushInstanced.instanceMatrix.needsUpdate = true;
  if (bushInstanced.instanceColor) bushInstanced.instanceColor.needsUpdate = true;
  scene.add(bushInstanced);

  // Targeted Flower Beds (pink/cyan/gold/white blossoms in chosen landscaped spots)
  const totalFlowers = FLOWER_BED_CENTERS.reduce((sum, bed) => sum + bed.count, 0);
  const flowerGeo = track(new THREE.BoxGeometry(0.12, 0.12, 0.12));
  const flowerMat = track(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  const flowerInstanced = new THREE.InstancedMesh(flowerGeo, flowerMat, totalFlowers);
  const flowerPalette = [
    new THREE.Color(theme.pinkAccent || 0xec4899),
    new THREE.Color(0xfacc15),
    new THREE.Color(0x22d3ee),
    new THREE.Color(0xffffff),
  ];
  let flowerIdx = 0;
  FLOWER_BED_CENTERS.forEach((bed, bIdx) => {
    for (let f = 0; f < bed.count; f++) {
      const ang = (f / bed.count) * Math.PI * 2 + bIdx * 0.6;
      const dist = bed.r * (0.55 + ((f % 2) * 0.35));
      dummy.rotation.set(0.2, ang, 0.15);
      dummy.scale.set(1, 1, 1);
      dummy.position.set(bed.x + Math.cos(ang) * dist, 0.08, bed.z + Math.sin(ang) * dist);
      dummy.updateMatrix();
      flowerInstanced.setMatrixAt(flowerIdx, dummy.matrix);
      flowerInstanced.setColorAt(flowerIdx, flowerPalette[(bIdx + f) % flowerPalette.length]);
      flowerIdx += 1;
    }
  });
  flowerInstanced.instanceMatrix.needsUpdate = true;
  if (flowerInstanced.instanceColor) flowerInstanced.instanceColor.needsUpdate = true;
  scene.add(flowerInstanced);

  // Sparse Subtle Meadow Grass Tufts clustered near rocks & outer park edges (1 draw call)
  if (!isWinterPark) {
    const tuftTargets = [...ROCK_CLUSTERS.slice(0, 10), ...OAK_TREE_COORDS.slice(0, 8)];
    const tuftBladesPerAnchor = 3;
    const tuftGeo = track(new THREE.ConeGeometry(0.065, 0.24, 4));
    const tuftInst = new THREE.InstancedMesh(
      tuftGeo,
      oakCrownMat,
      tuftTargets.length * tuftBladesPerAnchor
    );
    let tIdx = 0;
    tuftTargets.forEach((anchor, aIdx) => {
      for (let k = 0; k < tuftBladesPerAnchor; k++) {
        const ang = aIdx * 1.3 + k * 2.1;
        const dist = 0.65 + k * 0.22;
        dummy.position.set(anchor.x + Math.cos(ang) * dist, 0.1, anchor.z + Math.sin(ang) * dist);
        dummy.rotation.set(0.18 * (k - 1), ang, 0.14);
        dummy.scale.set(1, 0.85 + k * 0.2, 1);
        dummy.updateMatrix();
        tuftInst.setMatrixAt(tIdx, dummy.matrix);
        tuftInst.setColorAt(tIdx, oakShades[(aIdx + k) % oakShades.length]);
        tIdx += 1;
      }
    });
    tuftInst.instanceMatrix.needsUpdate = true;
    if (tuftInst.instanceColor) tuftInst.instanceColor.needsUpdate = true;
    scene.add(tuftInst);
  }

  // 7. Static Decorative Park Benches (InstancedMesh slats + legs)
  const benchSeatGeo = track(new THREE.BoxGeometry(1.75, 0.1, 0.56));
  const benchBackGeo = track(new THREE.BoxGeometry(1.75, 0.32, 0.08));
  const benchLegGeo = track(new THREE.BoxGeometry(0.14, 0.38, 0.52));
  const benchSeats = new THREE.InstancedMesh(benchSeatGeo, woodMat, PARK_BENCHES.length);
  const benchBacks = new THREE.InstancedMesh(benchBackGeo, woodMat, PARK_BENCHES.length);
  const benchLegs = new THREE.InstancedMesh(benchLegGeo, poleMat, PARK_BENCHES.length * 2);
  benchSeats.castShadow = !isMobile;
  benchBacks.castShadow = !isMobile;

  PARK_BENCHES.forEach((b, idx) => {
    const cosR = Math.cos(b.rotY);
    const sinR = Math.sin(b.rotY);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(b.x, 0.42, b.z);
    dummy.updateMatrix();
    benchSeats.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x - sinR * 0.24, 0.66, b.z - cosR * 0.24);
    dummy.updateMatrix();
    benchBacks.setMatrixAt(idx, dummy.matrix);

    [-0.68, 0.68].forEach((off, sideIdx) => {
      dummy.position.set(b.x + cosR * off, 0.19, b.z - sinR * off);
      dummy.updateMatrix();
      benchLegs.setMatrixAt(idx * 2 + sideIdx, dummy.matrix);
    });
  });
  benchSeats.instanceMatrix.needsUpdate = true;
  benchBacks.instanceMatrix.needsUpdate = true;
  benchLegs.instanceMatrix.needsUpdate = true;
  scene.add(benchSeats, benchBacks, benchLegs);

  // 8. World Depth & Background Scenery Beyond Playable Area (hills, distant tree skyline & clouds)
  // Notice: replaces old rectangular perimeter fence with layered terrain & woodland framing!
  const hillGeo = track(new THREE.SphereGeometry(1, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.52));
  const hillMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.96,
      metalness: 0.01,
    })
  );
  const hillInstanced = new THREE.InstancedMesh(hillGeo, hillMat, OUTER_HILLS.length);
  const hillPalette = isWinterPark
    ? [new THREE.Color(0xe2e8f0), new THREE.Color(0xcbd5e1)]
    : [new THREE.Color(0x4c8c50), new THREE.Color(0x417e49), new THREE.Color(0x57965b)];
  OUTER_HILLS.forEach((h, idx) => {
    dummy.position.set(h.x, -0.35, h.z);
    dummy.rotation.set(0, idx * 0.6, 0);
    dummy.scale.set(h.sx, h.sy, h.sz);
    dummy.updateMatrix();
    hillInstanced.setMatrixAt(idx, dummy.matrix);
    hillInstanced.setColorAt(idx, hillPalette[idx % hillPalette.length]);
  });
  hillInstanced.instanceMatrix.needsUpdate = true;
  if (hillInstanced.instanceColor) hillInstanced.instanceColor.needsUpdate = true;
  scene.add(hillInstanced);

  // Distant atmospheric background woodland cones crowning the outer perimeter ridges
  const distantTreeCoords = [];
  for (let i = 0; i < 34; i++) {
    const ang = (i / 34) * Math.PI * 2 + 0.14;
    const rx = 41.0 + (i % 3) * 5.2;
    const rz = 31.0 + ((i + 1) % 3) * 4.4;
    const southAtten = Math.sin(ang) > 0.35 ? 0.78 : 1.0;
    const s = (1.18 + (i % 4) * 0.24) * southAtten;
    distantTreeCoords.push({
      x: Math.cos(ang) * rx,
      z: Math.sin(ang) * rz,
      s,
    });
  }
  const distantPineGeo = track(new THREE.ConeGeometry(1.12, 3.5, 6));
  const distantPineMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.02,
    })
  );
  const distantPineInst = new THREE.InstancedMesh(
    distantPineGeo,
    distantPineMat,
    distantTreeCoords.length
  );
  const distantColors = isWinterPark
    ? [new THREE.Color(0x475569), new THREE.Color(0x64748b)]
    : [new THREE.Color(0x366a42), new THREE.Color(0x3f794d), new THREE.Color(0x4a865b)];
  distantTreeCoords.forEach((dtItem, idx) => {
    dummy.position.set(dtItem.x, dtItem.s * 1.85, dtItem.z);
    dummy.rotation.set(0, idx * 0.9, 0);
    dummy.scale.set(dtItem.s, dtItem.s, dtItem.s);
    dummy.updateMatrix();
    distantPineInst.setMatrixAt(idx, dummy.matrix);
    distantPineInst.setColorAt(idx, distantColors[idx % distantColors.length]);
  });
  distantPineInst.instanceMatrix.needsUpdate = true;
  if (distantPineInst.instanceColor) distantPineInst.instanceColor.needsUpdate = true;
  scene.add(distantPineInst);

  // Soft slow-drifting low-poly clouds along the upper sky horizon (6 clusters, zero shadows)
  const cloudAnchorDefs = [
    { x: -38, y: 22, z: -56, s: 1.2 },
    { x: -12, y: 25, z: -68, s: 1.45 },
    { x: 22, y: 23, z: -60, s: 1.3 },
    { x: 48, y: 24, z: -52, s: 1.1 },
    { x: -48, y: 21, z: -34, s: 1.0 },
    { x: 36, y: 22, z: -32, s: 1.15 },
  ];
  const cloudPuffGeo = track(new THREE.BoxGeometry(3.2, 1.35, 2.2));
  const cloudMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.86,
    })
  );
  const cloudInst = new THREE.InstancedMesh(cloudPuffGeo, cloudMat, cloudAnchorDefs.length * 3);
  const syncClouds = (shiftX) => {
    let idx = 0;
    cloudAnchorDefs.forEach((c) => {
      const wrappedX = ((((c.x + shiftX + 75) % 150) + 150) % 150) - 75;
      const puffs = [
        [0, 0, 0, 1.0],
        [-1.8 * c.s, -0.25, 0.25, 0.72],
        [1.7 * c.s, -0.2, -0.2, 0.78],
      ];
      puffs.forEach(([ox, oy, oz, ps]) => {
        dummy.position.set(wrappedX + ox, c.y + oy, c.z + oz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(c.s * ps, c.s * ps, c.s * ps);
        dummy.updateMatrix();
        cloudInst.setMatrixAt(idx, dummy.matrix);
        idx += 1;
      });
    });
    cloudInst.instanceMatrix.needsUpdate = true;
  };
  syncClouds(0);
  scene.add(cloudInst);

  // 9. Subtle Floating Sunlight Park Motes on default outdoor park (Winter uses seasonal snowfall)
  let dustGeo = null;
  if (!theme.isActive) {
    const dustCount = isMobile ? 28 : 48;
    const positions = new Float32Array(dustCount * 3);
    const baseY = new Float32Array(dustCount);
    const phases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 39.425) * 43758.5453;
      const rx = seed1 - Math.floor(seed1);
      const ry = seed2 - Math.floor(seed2);
      const rz = seed3 - Math.floor(seed3);

      positions[i * 3] = (rx - 0.5) * 56;
      baseY[i] = 0.8 + ry * 4.2;
      positions[i * 3 + 1] = baseY[i];
      positions[i * 3 + 2] = (rz - 0.5) * 42;
      phases[i] = i * 0.85;
    }

    dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = track(
      new THREE.PointsMaterial({
        color: theme.dustColor,
        size: 0.11,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      })
    );
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    dustGeo.userData = { dustCount, baseY, phases };
  }

  let elapsed = 0;
  let cloudShift = 0;
  const update = (dt, { reducedMotion = false } = {}) => {
    if (reducedMotion) return;
    elapsed += dt;
    cloudShift += dt * 0.45;
    syncClouds(cloudShift);

    // Subtle fountain water shimmer, finial spin, and pooled splash arc particles (zero scale clipping)
    fFinial.rotation.y += dt * 0.95;
    fWaterMat.emissiveIntensity = 0.16 + Math.sin(elapsed * 2.8) * 0.05;

    const splashAttr = splashGeo.getAttribute('position');
    for (let i = 0; i < splashCount; i++) {
      const cycle = (elapsed * 1.15 + splashPhase[i]) % 1;
      const rad = 0.08 + cycle * 0.62;
      const yArc = 1.2 + Math.sin(cycle * Math.PI) * 0.38 - cycle * 0.72;
      const ang = splashAngle[i] + elapsed * 0.15;
      splashAttr.array[i * 3] = Math.cos(ang) * rad;
      splashAttr.array[i * 3 + 1] = Math.max(0.45, yArc);
      splashAttr.array[i * 3 + 2] = Math.sin(ang) * rad;
    }
    splashAttr.needsUpdate = true;

    if (dustGeo) {
      const { dustCount, baseY, phases } = dustGeo.userData;
      const posAttr = dustGeo.getAttribute('position');
      for (let i = 0; i < dustCount; i++) {
        posAttr.array[i * 3 + 1] = baseY[i] + Math.sin(elapsed * 0.75 + phases[i]) * 0.16;
      }
      posAttr.needsUpdate = true;
    }
  };

  const dispose = () => {
    disposables.forEach((item) => item.dispose?.());
  };

  return { update, dispose };
};
