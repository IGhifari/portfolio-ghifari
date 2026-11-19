/**
 * Pure 2D movement, collision resolution, and proximity math for the 3D world.
 * Zero Three.js or DOM imports — 100% unit-testable in Node.js.
 */

import { WORLD_BOUNDS, PLAYER_CONFIG, BUILDINGS } from './worldConfig.js';

/**
 * Normalizes a 2D input vector (x, z) so diagonal movement does not exceed length 1.
 * Allows analog joystick magnitudes < 1 to remain proportional.
 */
export const normalizeInput = (x = 0, z = 0) => {
  const numX = Number(x) || 0;
  const numZ = Number(z) || 0;
  const len = Math.hypot(numX, numZ);
  if (len < 1e-5) {
    return { x: 0, z: 0, magnitude: 0 };
  }
  const scale = len > 1 ? 1 / len : 1;
  return {
    x: numX * scale,
    z: numZ * scale,
    magnitude: Math.min(len, 1),
  };
};

/**
 * Integrates player position and facing angle over delta time `dt` (in seconds).
 */
export const integrateMovement = (
  pos = { x: 0, z: 0, angle: 0 },
  input = { x: 0, z: 0 },
  speed = PLAYER_CONFIG.speed,
  dt = 1 / 60
) => {
  const safeDt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
  const norm = normalizeInput(input.x, input.z);

  const nextX = pos.x + norm.x * speed * safeDt;
  const nextZ = pos.z + norm.z * speed * safeDt;
  const nextAngle =
    norm.magnitude > 0.01 ? Math.atan2(norm.x, norm.z) : pos.angle ?? 0;

  return {
    x: nextX,
    z: nextZ,
    angle: nextAngle,
    isMoving: norm.magnitude > 0.01,
  };
};

/**
 * Clamps player position inside the rectangular island world bounds, accounting for player radius.
 */
export const clampToWorldBounds = (
  pos = { x: 0, z: 0 },
  radius = PLAYER_CONFIG.radius,
  bounds = WORLD_BOUNDS
) => {
  const r = Math.max(Number(radius) || 0, 0);
  const minX = bounds.minX + r;
  const maxX = bounds.maxX - r;
  const minZ = bounds.minZ + r;
  const maxZ = bounds.maxZ - r;

  return {
    ...pos,
    x: Math.min(Math.max(pos.x, minX), maxX),
    z: Math.min(Math.max(pos.z, minZ), maxZ),
  };
};

/**
 * Resolves circle-vs-AABB collision for a single building box centered at (b.x, b.z)
 * with half-extents (b.halfW, b.halfD).
 */
export const resolveSingleBuildingCollision = (pos, radius, building) => {
  const minX = building.x - building.halfW;
  const maxX = building.x + building.halfW;
  const minZ = building.z - building.halfD;
  const maxZ = building.z + building.halfD;

  const closestX = Math.min(Math.max(pos.x, minX), maxX);
  const closestZ = Math.min(Math.max(pos.z, minZ), maxZ);

  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= radius * radius) {
    return pos;
  }

  // Player center is outside the box but circle overlaps edge/corner
  if (distSq > 1e-8) {
    const dist = Math.sqrt(distSq);
    const overlap = radius - dist;
    return {
      ...pos,
      x: pos.x + (dx / dist) * overlap,
      z: pos.z + (dz / dist) * overlap,
    };
  }

  // Player center is inside the AABB: push out along the shallowest axis
  const overlapLeft = Math.abs(pos.x - minX);
  const overlapRight = Math.abs(maxX - pos.x);
  const overlapTop = Math.abs(pos.z - minZ);
  const overlapBottom = Math.abs(maxZ - pos.z);
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (minOverlap === overlapLeft) return { ...pos, x: minX - radius };
  if (minOverlap === overlapRight) return { ...pos, x: maxX + radius };
  if (minOverlap === overlapTop) return { ...pos, z: minZ - radius };
  return { ...pos, z: maxZ + radius };
};

/**
 * Resolves collisions against all buildings in the world.
 */
export const resolveBuildingCollisions = (
  pos,
  radius = PLAYER_CONFIG.radius,
  buildings = BUILDINGS
) => {
  let resolved = { ...pos };
  for (const b of buildings) {
    resolved = resolveSingleBuildingCollision(resolved, radius, b);
  }
  return resolved;
};

/**
 * Full simulation step for the player: integrate -> collide buildings -> clamp bounds.
 */
export const stepPlayer = (
  state = { x: PLAYER_CONFIG.startX, z: PLAYER_CONFIG.startZ, angle: Math.PI },
  input = { x: 0, z: 0 },
  dt = 1 / 60,
  config = {}
) => {
  const speed = config.speed ?? PLAYER_CONFIG.speed;
  const radius = config.radius ?? PLAYER_CONFIG.radius;
  const bounds = config.bounds ?? WORLD_BOUNDS;
  const buildings = config.buildings ?? BUILDINGS;

  const moved = integrateMovement(state, input, speed, dt);
  const afterBuildings = resolveBuildingCollisions(moved, radius, buildings);
  return clampToWorldBounds(afterBuildings, radius, bounds);
};

/**
 * Finds the nearest building within its `interactRadius`.
 * Returns `{ building, distance }` or `null` if no building is within interaction range.
 */
export const findNearestBuilding = (
  pos = { x: PLAYER_CONFIG.startX, z: PLAYER_CONFIG.startZ },
  buildings = BUILDINGS
) => {
  if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.z)) {
    return null;
  }

  let nearest = null;
  let bestDist = Infinity;

  for (const b of buildings) {
    const dist = Math.hypot(pos.x - b.x, pos.z - b.z);
    const maxRadius = b.interactRadius ?? 2.5;
    if (dist <= maxRadius && dist < bestDist) {
      bestDist = dist;
      nearest = { building: b, distance: dist };
    }
  }

  return nearest;
};
