import * as THREE from 'three';
import { BUILDINGS, PLAYER_CONFIG } from '../logic/worldConfig.js';
import { DEFAULT_GAME_THEME } from '../shared/seasonalGameTheme.js';

const TREE_COORDS = [
  { x: -15.4, z: -9.8, s: 1.05 },
  { x: -11.5, z: -11.4, s: 0.9 },
  { x: -4.8, z: -10.8, s: 0.94 },
  { x: 4.8, z: -10.8, s: 0.98 },
  { x: 11.5, z: -11.4, s: 0.9 },
  { x: 15.4, z: -9.8, s: 1.08 },
  { x: -16.2, z: -2.2, s: 1.1 },
  { x: 16.2, z: -2.2, s: 1.04 },
  { x: -15.8, z: 6.8, s: 0.94 },
  { x: 15.8, z: 6.8, s: 0.96 },
  { x: -9.8, z: 10.6, s: 1.02 },
  { x: 9.8, z: 10.6, s: 1.0 },
  { x: -4.6, z: 11.2, s: 0.86 },
  { x: 4.6, z: 11.2, s: 0.88 },
];

/**
 * Generates clean straight radial paths of tiles directly from the spawn point
 * to each of the 5 buildings, plus lamp posts aligned parallel along those paths.
 */
const buildStraightPathsAndLamps = () => {
  const originX = PLAYER_CONFIG.startX;
  const originZ = PLAYER_CONFIG.startZ;
  const tiles = [];
  const lamps = [];

  for (const b of BUILDINGS) {
    const dx = b.x - originX;
    const dz = b.z - originZ;
    const dist = Math.hypot(dx, dz);
    const ux = dx / dist;
    const uz = dz / dist;
    // Perpendicular unit vector to the straight path
    const nx = -uz;
    const nz = ux;
    const angle = Math.atan2(ux, uz);

    const startR = 1.45;
    const endR = dist - Math.max(b.halfW, b.halfD) - 0.95;
    const step = 0.88;

    for (let r = startR; r <= endR; r += step) {
      tiles.push({
        x: originX + ux * r,
        z: originZ + uz * r,
        rotY: angle,
      });
    }

    // Align lamp posts strictly alongside each straight path
    if (b.id === 'projects') {
      lamps.push(
        { x: originX + ux * 4.2 - nx * 1.15, z: originZ + uz * 4.2 - nz * 1.15 },
        { x: originX + ux * 4.2 + nx * 1.15, z: originZ + uz * 4.2 + nz * 1.15 },
        { x: originX + ux * 7.4 - nx * 1.15, z: originZ + uz * 7.4 - nz * 1.15 },
        { x: originX + ux * 7.4 + nx * 1.15, z: originZ + uz * 7.4 + nz * 1.15 }
      );
    } else {
      const side = b.x < 0 ? -1 : 1;
      const rLamp = 5.6;
      lamps.push({
        x: originX + ux * rLamp + nx * side * 1.15,
        z: originZ + uz * rLamp + nz * side * 1.15,
      });
    }
  }

  return { tiles, lamps };
};

/**
 * Populates low-poly world props strictly using THREE.InstancedMesh (straight walkway
 * paths, path-aligned lamp posts, perimeter trees) plus subtle floating dust particles.
 */
export const createProps = (scene, { isMobile = false, seasonalTheme = DEFAULT_GAME_THEME } = {}) => {
  const theme = seasonalTheme || DEFAULT_GAME_THEME;
  const dummy = new THREE.Object3D();
  const { tiles: tileTransforms, lamps: lampCoords } = buildStraightPathsAndLamps();

  // 1. Clean Straight Walkway Tiles (InstancedMesh)
  const tileGeo = new THREE.BoxGeometry(0.92, 0.036, 0.68);
  const tileMat = new THREE.MeshStandardMaterial({
    color: theme.tile,
    roughness: 0.82,
    metalness: 0.12,
  });
  const tileInstanced = new THREE.InstancedMesh(tileGeo, tileMat, tileTransforms.length);
  tileInstanced.receiveShadow = !isMobile;

  tileTransforms.forEach((t, idx) => {
    dummy.position.set(t.x, 0.018, t.z);
    dummy.rotation.set(0, t.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    tileInstanced.setMatrixAt(idx, dummy.matrix);
  });
  tileInstanced.instanceMatrix.needsUpdate = true;
  scene.add(tileInstanced);

  // 2. Path-Aligned Low-Poly Lamp Posts: Poles + Luminaire Caps (2 InstancedMeshes)
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.85, 6);
  const poleMat = new THREE.MeshStandardMaterial({
    color: theme.pole,
    roughness: 0.6,
    metalness: 0.35,
  });
  const lampHeadGeo = new THREE.BoxGeometry(0.24, 0.1, 0.24);
  const lampHeadMat = new THREE.MeshStandardMaterial({
    color: theme.lampHead,
    emissive: theme.accent,
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });

  const poleInstanced = new THREE.InstancedMesh(poleGeo, poleMat, lampCoords.length);
  const headInstanced = new THREE.InstancedMesh(lampHeadGeo, lampHeadMat, lampCoords.length);
  poleInstanced.castShadow = !isMobile;

  lampCoords.forEach((c, idx) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(c.x, 0.925, c.z);
    dummy.updateMatrix();
    poleInstanced.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(c.x, 1.88, c.z);
    dummy.updateMatrix();
    headInstanced.setMatrixAt(idx, dummy.matrix);
  });
  poleInstanced.instanceMatrix.needsUpdate = true;
  headInstanced.instanceMatrix.needsUpdate = true;
  scene.add(poleInstanced, headInstanced);

  // 3. Low-Poly Perimeter Trees taller than player (Brown Trunks + 2-Tier Green Foliage Cones)
  const trunkGeo = new THREE.CylinderGeometry(0.13, 0.2, 1.25, 6);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: theme.trunk,
    roughness: 0.9,
  });
  const foliageLowerGeo = new THREE.ConeGeometry(0.84, 1.55, 6);
  const foliageUpperGeo = new THREE.ConeGeometry(0.6, 1.4, 6);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: theme.foliage,
    roughness: 0.78,
    metalness: 0.08,
  });

  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, TREE_COORDS.length);
  const foliageLowerInstanced = new THREE.InstancedMesh(foliageLowerGeo, foliageMat, TREE_COORDS.length);
  const foliageUpperInstanced = new THREE.InstancedMesh(foliageUpperGeo, foliageMat, TREE_COORDS.length);
  trunkInstanced.castShadow = !isMobile;
  foliageLowerInstanced.castShadow = !isMobile;
  foliageUpperInstanced.castShadow = !isMobile;

  TREE_COORDS.forEach((c, idx) => {
    const s = c.s;
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(s, s, s);
    dummy.position.set(c.x, 0.625 * s, c.z);
    dummy.updateMatrix();
    trunkInstanced.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(c.x, 1.82 * s, c.z);
    dummy.updateMatrix();
    foliageLowerInstanced.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(c.x, 2.82 * s, c.z);
    dummy.updateMatrix();
    foliageUpperInstanced.setMatrixAt(idx, dummy.matrix);
  });
  trunkInstanced.instanceMatrix.needsUpdate = true;
  foliageLowerInstanced.instanceMatrix.needsUpdate = true;
  foliageUpperInstanced.instanceMatrix.needsUpdate = true;
  scene.add(trunkInstanced, foliageLowerInstanced, foliageUpperInstanced);

  // 4. Subtle Floating Dust Particles on default months (seasonal events render createSeasonalAtmosphere)
  if (theme.isActive) {
    return {
      update: () => {},
    };
  }

  const dustCount = isMobile ? 26 : 44;
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

    positions[i * 3] = (rx - 0.5) * 28;
    baseY[i] = 0.65 + ry * 3.8;
    positions[i * 3 + 1] = baseY[i];
    positions[i * 3 + 2] = (rz - 0.5) * 22;
    phases[i] = i * 0.85;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: theme.dustColor,
    size: 0.085,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  let elapsed = 0;

  const update = (dt, { reducedMotion = false } = {}) => {
    if (reducedMotion) return;
    elapsed += dt;
    const posAttr = dustGeo.getAttribute('position');
    for (let i = 0; i < dustCount; i++) {
      posAttr.array[i * 3 + 1] = baseY[i] + Math.sin(elapsed * 0.75 + phases[i]) * 0.16;
    }
    posAttr.needsUpdate = true;
  };

  return {
    update,
  };
};
