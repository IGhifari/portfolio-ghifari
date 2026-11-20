/**
 * Pure 2D/2.5D casual football physics, kick mechanics, goal detection & boundary logic.
 * Zero Three.js or DOM imports — 100% deterministic & unit-testable in Node.js.
 */

import { FOOTBALL_FIELD, PLAYER_CONFIG } from './worldConfig.js';

export const FOOTBALL_PHYSICS = {
  ballRadius: 0.34,
  kickRange: 1.75,
  kickSpeed: 13.5,
  kickLiftVel: 3.1,
  kickCooldownMs: 240,
  dribblePushSpeed: 4.4,
  friction: 2.55,
  gravity: 16.5,
  bounceRestitution: 0.42,
  stopEpsilon: 0.06,
  goalResetDelaySec: 1.5,
  maxDtSec: 0.08,
};

/**
 * Initializes the casual football state centered on the pitch spot.
 */
export const createFootballState = (field = FOOTBALL_FIELD) => ({
  x: field.centerX,
  z: field.centerZ,
  y: FOOTBALL_PHYSICS.ballRadius,
  vx: 0,
  vz: 0,
  vy: 0,
  spinAxisX: 0,
  spinAxisZ: 1,
  spinAngle: 0,
  score: 0,
  lastGoalSide: null,
  goalResetTimer: 0,
  lastKickMs: -Infinity,
});

/**
 * Resets the ball position and velocity cleanly back to kickoff without erasing total score.
 */
export const resetFootballPosition = (ball, field = FOOTBALL_FIELD) => ({
  ...ball,
  x: field.centerX,
  z: field.centerZ,
  y: FOOTBALL_PHYSICS.ballRadius,
  vx: 0,
  vz: 0,
  vy: 0,
  lastGoalSide: null,
  goalResetTimer: 0,
});

export const isPlayerInFootballZone = (player, field = FOOTBALL_FIELD) => {
  if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.z)) {
    return false;
  }
  const z = field.zoneBounds;
  return player.x >= z.minX && player.x <= z.maxX && player.z >= z.minZ && player.z <= z.maxZ;
};

export const canPlayerKickBall = (
  player,
  ball,
  nowMs = 0,
  physics = FOOTBALL_PHYSICS
) => {
  if (!player || !ball || ball.goalResetTimer > 0) return false;
  if (nowMs - ball.lastKickMs < physics.kickCooldownMs) return false;
  const dist = Math.hypot(ball.x - player.x, ball.z - player.z);
  return dist <= physics.kickRange;
};

/**
 * Computes kick direction combining player facing direction & player->ball alignment
 * so straight-on and subtle off-angle approaches both shoot predictably forward.
 */
export const kickFootball = (
  ball,
  player,
  nowMs = 0,
  physics = FOOTBALL_PHYSICS
) => {
  if (!canPlayerKickBall(player, ball, nowMs, physics)) {
    return { ball, kicked: false };
  }

  const faceX = Math.sin(player.angle ?? 0);
  const faceZ = Math.cos(player.angle ?? 0);

  const dx = ball.x - player.x;
  const dz = ball.z - player.z;
  const dist = Math.hypot(dx, dz);

  let dirX = faceX;
  let dirZ = faceZ;

  if (dist > 0.05) {
    const toBallX = dx / dist;
    const toBallZ = dz / dist;
    const dot = faceX * toBallX + faceZ * toBallZ;
    if (dot > 0.15) {
      const bx = toBallX * 0.65 + faceX * 0.35;
      const bz = toBallZ * 0.65 + faceZ * 0.35;
      const bLen = Math.hypot(bx, bz) || 1;
      dirX = bx / bLen;
      dirZ = bz / bLen;
    }
  }

  return {
    kicked: true,
    ball: {
      ...ball,
      vx: dirX * physics.kickSpeed,
      vz: dirZ * physics.kickSpeed,
      vy: physics.kickLiftVel,
      lastKickMs: nowMs,
    },
  };
};

const resolveCirclePost = (x, z, vx, vz, postX, postZ, minDist) => {
  const dx = x - postX;
  const dz = z - postZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= minDist * minDist || distSq < 1e-10) {
    return { x, z, vx, vz };
  }
  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const nz = dz / dist;
  const overlap = minDist - dist;
  const nextX = x + nx * overlap;
  const nextZ = z + nz * overlap;

  const vn = vx * nx + vz * nz;
  if (vn < 0) {
    return {
      x: nextX,
      z: nextZ,
      vx: vx - 1.65 * vn * nx,
      vz: vz - 1.65 * vn * nz,
    };
  }
  return { x: nextX, z: nextZ, vx, vz };
};

/**
 * Advances casual football simulation by `dt` seconds:
 * momentum, exponential ground friction, subtle hop, dribble contact, goalposts/nets,
 * pitch boundary keep-in, goal scoring, and auto-reset timer.
 */
export const stepFootball = (
  ball,
  player,
  dt = 1 / 60,
  {
    field = FOOTBALL_FIELD,
    physics = FOOTBALL_PHYSICS,
    playerRadius = PLAYER_CONFIG.radius,
  } = {}
) => {
  const safeDt = Math.min(Math.max(Number(dt) || 0, 0), physics.maxDtSec);
  if (safeDt <= 0) {
    return { ball, scoredSide: null, didReset: false, inKickRange: canPlayerKickBall(player, ball, Infinity, physics) };
  }

  // Handle post-goal reset countdown while letting ball settle softly inside net
  if (ball.goalResetTimer > 0) {
    const nextTimer = ball.goalResetTimer - safeDt;
    if (nextTimer <= 0) {
      return {
        ball: resetFootballPosition(ball, field),
        scoredSide: null,
        didReset: true,
        inKickRange: false,
      };
    }

    const damp = Math.exp(-5.5 * safeDt);
    let nx = ball.x + ball.vx * safeDt;
    let nz = ball.z + ball.vz * safeDt;
    const minNetZ = field.centerZ - field.goalHalfWidth + physics.ballRadius;
    const maxNetZ = field.centerZ + field.goalHalfWidth - physics.ballRadius;
    nz = Math.min(Math.max(nz, minNetZ), maxNetZ);

    if (ball.lastGoalSide === 'left') {
      const backNetX = field.minX - field.goalDepth + physics.ballRadius;
      nx = Math.min(Math.max(nx, backNetX), field.minX - physics.ballRadius * 0.25);
    } else {
      const backNetX = field.maxX + field.goalDepth - physics.ballRadius;
      nx = Math.max(Math.min(nx, backNetX), field.maxX + physics.ballRadius * 0.25);
    }

    return {
      ball: {
        ...ball,
        x: nx,
        z: nz,
        y: physics.ballRadius,
        vx: ball.vx * damp,
        vz: ball.vz * damp,
        vy: 0,
        goalResetTimer: nextTimer,
      },
      scoredSide: null,
      didReset: false,
      inKickRange: false,
    };
  }

  let { x, z, y, vx, vz, vy, spinAngle, spinAxisX, spinAxisZ } = ball;
  const r = physics.ballRadius;

  // 1. Player gentle dribble push when walking closely into the ball
  if (player && Number.isFinite(player.x) && Number.isFinite(player.z)) {
    const dx = x - player.x;
    const dz = z - player.z;
    const dist = Math.hypot(dx, dz);
    const minContact = playerRadius + r;
    if (dist < minContact && dist > 1e-6) {
      const nx = dx / dist;
      const nz = dz / dist;
      x = player.x + nx * minContact;
      z = player.z + nz * minContact;
      const pushSpeed = player.isMoving ? physics.dribblePushSpeed : 1.8;
      if (vx * nx + vz * nz < pushSpeed) {
        vx = nx * pushSpeed;
        vz = nz * pushSpeed;
      }
    }
  }

  // 2. Integrate horizontal position & rolling angle
  x += vx * safeDt;
  z += vz * safeDt;

  const groundSpeed = Math.hypot(vx, vz);
  if (groundSpeed > physics.stopEpsilon) {
    spinAngle = (spinAngle + (groundSpeed * safeDt) / r) % (Math.PI * 2);
    spinAxisX = vz / groundSpeed;
    spinAxisZ = -vx / groundSpeed;
  }

  // 3. Vertical bounce / hop
  vy -= physics.gravity * safeDt;
  y += vy * safeDt;
  if (y <= r) {
    y = r;
    if (vy < -1.1) {
      vy = -vy * physics.bounceRestitution;
    } else {
      vy = 0;
    }
  }

  // 4. Exponential friction damping
  const drag = Math.exp(-physics.friction * safeDt);
  vx *= drag;
  vz *= drag;
  if (Math.hypot(vx, vz) < physics.stopEpsilon) {
    vx = 0;
    vz = 0;
  }

  // 5. Check goal mouth crossing BEFORE outer field boundary checks
  const insideGoalWidth =
    Math.abs(z - field.centerZ) <= field.goalHalfWidth - r * 0.45 &&
    y <= field.goalHeight + r * 0.25;
  const wasWithinMouthWidth = Math.abs(ball.z - field.centerZ) <= field.goalHalfWidth;

  const isLeftGoal =
    insideGoalWidth &&
    x < field.minX - r * 0.35 &&
    x >= field.minX - field.goalDepth - 1.2 &&
    ball.x >= field.minX - r * 0.6 &&
    (ball.x >= field.minX || wasWithinMouthWidth);

  const isRightGoal =
    insideGoalWidth &&
    x > field.maxX + r * 0.35 &&
    x <= field.maxX + field.goalDepth + 1.2 &&
    ball.x <= field.maxX + r * 0.6 &&
    (ball.x <= field.maxX || wasWithinMouthWidth);

  if (isLeftGoal || isRightGoal) {
    const scoredSide = isLeftGoal ? 'left' : 'right';
    return {
      ball: {
        ...ball,
        x,
        z,
        y: r,
        vx: vx * 0.35,
        vz: vz * 0.35,
        vy: 0,
        spinAngle,
        spinAxisX,
        spinAxisZ,
        score: ball.score + 1,
        lastGoalSide: scoredSide,
        goalResetTimer: physics.goalResetDelaySec,
      },
      scoredSide,
      didReset: false,
      inKickRange: false,
    };
  }

  // 6. Collide with the 4 vertical goalposts
  const postMinDist = r + field.postRadius;
  const posts = [
    [field.minX, field.centerZ - field.goalHalfWidth],
    [field.minX, field.centerZ + field.goalHalfWidth],
    [field.maxX, field.centerZ - field.goalHalfWidth],
    [field.maxX, field.centerZ + field.goalHalfWidth],
  ];
  for (const [px, pz] of posts) {
    const res = resolveCirclePost(x, z, vx, vz, px, pz, postMinDist);
    x = res.x;
    z = res.z;
    vx = res.vx;
    vz = res.vz;
  }

  // 7. Prevent ball entering goal pockets through exterior back or side nets
  const northNetZ = field.centerZ - field.goalHalfWidth;
  const southNetZ = field.centerZ + field.goalHalfWidth;
  const sideNetHalfThick = 0.06;
  const netBounce = 0.55;
  if (y <= field.goalHeight + r * 0.25) {
    const goalPockets = [
      { dir: -1, lineX: field.minX, backX: field.minX - field.goalDepth },
      { dir: 1, lineX: field.maxX, backX: field.maxX + field.goalDepth },
    ];
    for (const { dir, lineX, backX } of goalPockets) {
      if (z > northNetZ - r * 0.6 && z < southNetZ + r * 0.6) {
        const backLimit = backX + dir * r;
        const hitBackNet =
          dir < 0
            ? x < lineX && x >= backLimit && ball.x <= backX
            : x > lineX && x <= backLimit && ball.x >= backX;
        if (hitBackNet) {
          x = backLimit;
          vx = vx === 0 ? 0 : dir * Math.abs(vx) * netBounce;
        }
      }
      const inGoalDepth =
        dir < 0 ? x >= backX - r * 0.5 && x < lineX : x > lineX && x <= backX + r * 0.5;
      if (inGoalDepth) {
        if (ball.z <= northNetZ && z > northNetZ - sideNetHalfThick - r) {
          z = northNetZ - sideNetHalfThick - r;
          vz = vz === 0 ? 0 : -Math.abs(vz) * netBounce;
        }
        if (ball.z >= southNetZ && z < southNetZ + sideNetHalfThick + r) {
          z = southNetZ + sideNetHalfThick + r;
          vz = vz === 0 ? 0 : Math.abs(vz) * netBounce;
        }
      }
    }
  }

  // 8. Rebound cleanly at the football play area runoff bounds so ball never escapes the pitch zone
  const margin = field.playMargin ?? 2.8;
  const minBoundX = field.minX - margin + r;
  const maxBoundX = field.maxX + margin - r;
  const minBoundZ = field.minZ - margin + r;
  const maxBoundZ = field.maxZ + margin - r;

  if (x < minBoundX) {
    x = minBoundX;
    vx = Math.abs(vx) * 0.62;
  } else if (x > maxBoundX) {
    x = maxBoundX;
    vx = -Math.abs(vx) * 0.62;
  }

  if (z < minBoundZ) {
    z = minBoundZ;
    vz = Math.abs(vz) * 0.62;
  } else if (z > maxBoundZ) {
    z = maxBoundZ;
    vz = -Math.abs(vz) * 0.62;
  }

  const nextBall = {
    ...ball,
    x,
    z,
    y,
    vx,
    vz,
    vy,
    spinAngle,
    spinAxisX,
    spinAxisZ,
  };

  return {
    ball: nextBall,
    scoredSide: null,
    didReset: false,
    inKickRange: player
      ? Math.hypot(nextBall.x - player.x, nextBall.z - player.z) <= physics.kickRange
      : false,
  };
};
