/**
 * Pure game logic for "Stack Runner" (/play/runner).
 * Zero Three.js, React, or DOM imports — 100% deterministic and Node-testable.
 */

import {
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  readBestScoreByKey,
  writeBestScoreByKey,
  extractTechLabels,
  formatTechLabel,
} from '../../shared/gameUtils.js';

export {
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  extractTechLabels,
  formatTechLabel,
};

export const GAME_STATES = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

export const OBSTACLE_SPECS = {
  bug: {
    type: 'bug',
    height: 0.85,
    depth: 0.95,
    clearableByJump: true,
    clearHeight: 0.72,
  },
  lowGate: {
    type: 'lowGate',
    height: 0.92,
    depth: 0.75,
    clearableByJump: true,
    clearHeight: 0.88,
  },
  firewall: {
    type: 'firewall',
    height: 3.2,
    depth: 0.9,
    clearableByJump: false,
    clearHeight: Infinity,
  },
};

export const RUNNER_CONFIG = {
  laneCount: 3,
  minLane: 0,
  maxLane: 2,
  defaultLane: 1,
  laneWidth: 2.5,
  playerDepthRadius: 0.32,
  startSpeed: 12,
  maxSpeed: 24,
  speedPerMeter: 0.012,
  gravity: 38,
  jumpVelocity: 12.6,
  maxDeltaSec: 0.05,
  chunkLength: 24,
  chunkPoolSize: 6,
  initialLives: 3,
  invulnDurationSec: 1.5,
  blinkIntervalSec: 0.1,
  tokenBaseScore: 10,
  streakPerMultiplier: 3,
  maxMultiplier: 4,
  milestoneIntervalMeters: 500,
  countdownSeconds: 3,
  maxTokenLabelTextures: 16,
  maxLabelLength: 14,
  inputLockMs: 400,
  storageKey: 'portfolio:runner:best',
};

/**
 * Clamps frame delta time to prevent physics spikes after tab switching or frame stalls.
 */
export const clampDeltaTime = (dt, maxDt = RUNNER_CONFIG.maxDeltaSec) => {
  const num = Number(dt);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(num, maxDt);
};

/**
 * Gradual, strictly capped speed progression curve based on forward distance traveled.
 */
export const computeSpeedForDistance = (distance, config = RUNNER_CONFIG) => {
  const d = Math.max(0, Number(distance) || 0);
  return Math.min(config.maxSpeed, config.startSpeed + d * config.speedPerMeter);
};

/**
 * Analytical jump metrics derived from velocity and gravity.
 */
export const getJumpMetrics = (config = RUNNER_CONFIG) => {
  const v = config.jumpVelocity;
  const g = config.gravity;
  return {
    apexHeight: (v * v) / (2 * g),
    airtimeSec: (2 * v) / g,
  };
};

/**
 * Clamps lane index strictly within [0, 2].
 */
export const clampLane = (lane, config = RUNNER_CONFIG) => {
  const n = Math.round(Number(lane));
  if (!Number.isFinite(n)) return config.defaultLane;
  return Math.max(config.minLane, Math.min(config.maxLane, n));
};

/**
 * Steps lane index left (-1) or right (+1) cleanly without skipping.
 */
export const switchLane = (currentLane, delta, config = RUNNER_CONFIG) => {
  const step = delta < 0 ? -1 : delta > 0 ? 1 : 0;
  return clampLane(clampLane(currentLane, config) + step, config);
};

/**
 * Initiates a jump only when grounded (prevents unintended double jumps).
 */
export const initiateJump = (jumpState, config = RUNNER_CONFIG) => {
  if (!jumpState.isGrounded) {
    return { ...jumpState, triggered: false };
  }
  return {
    y: 0,
    vy: config.jumpVelocity,
    isGrounded: false,
    triggered: true,
  };
};

/**
 * Exact quadratic Verlet step for frame-rate independent jump trajectories across 60Hz and 120Hz.
 */
export const stepJumpPhysics = (jumpState, dt, config = RUNNER_CONFIG) => {
  const safeDt = clampDeltaTime(dt, config.maxDeltaSec);
  if (jumpState.isGrounded || safeDt <= 0) {
    return {
      y: Math.max(0, jumpState.y || 0),
      vy: jumpState.isGrounded ? 0 : jumpState.vy,
      isGrounded: Boolean(jumpState.isGrounded),
      landed: false,
    };
  }

  const g = config.gravity;
  const nextY = jumpState.y + jumpState.vy * safeDt - 0.5 * g * safeDt * safeDt;
  const nextVy = jumpState.vy - g * safeDt;

  if (nextY <= 0) {
    return {
      y: 0,
      vy: 0,
      isGrounded: true,
      landed: true,
    };
  }

  return {
    y: nextY,
    vy: nextVy,
    isGrounded: false,
    landed: false,
  };
};

/**
 * Explicit token multiplier progression:
 * - streak 0..2 -> x1
 * - streak 3..5 -> x2
 * - streak 6..8 -> x3
 * - streak 9+   -> x4 (capped)
 */
export const computeMultiplierFromStreak = (streak, config = RUNNER_CONFIG) => {
  const s = Math.max(0, Math.floor(Number(streak) || 0));
  return Math.min(config.maxMultiplier, 1 + Math.floor(s / config.streakPerMultiplier));
};

/**
 * Checks deterministic collision against a single obstacle using logical lane, distance, jump height, and type.
 */
export const checkObstacleCollision = (player, obstacle, config = RUNNER_CONFIG) => {
  if (!obstacle || obstacle.consumed || obstacle.hitRegistered) return false;
  if (player.lane !== obstacle.lane) return false;

  const spec = OBSTACLE_SPECS[obstacle.type];
  if (!spec) return false;

  const halfDepth = spec.depth * 0.5 + config.playerDepthRadius;
  if (Math.abs(player.distance - obstacle.dist) > halfDepth) {
    return false;
  }

  if (spec.clearableByJump && player.y >= spec.clearHeight) {
    return false;
  }

  return true;
};

/**
 * Checks deterministic collection overlap against a floating tech token.
 */
export const checkTokenCollision = (player, token) => {
  if (!token || token.collected) return false;
  if (player.lane !== token.lane) return false;
  if (Math.abs(player.distance - token.dist) > 0.9) return false;

  const playerBottom = player.y;
  const playerTop = player.y + 1.55;
  const tokenBottom = token.y - 0.5;
  const tokenTop = token.y + 0.55;

  return playerTop >= tokenBottom && playerBottom <= tokenTop;
};

/**
 * Advances invulnerability timer and returns deterministic blink/dimming visual state.
 */
export const stepInvulnerability = (invulnState, dt, reducedMotion = false, config = RUNNER_CONFIG) => {
  const safeDt = clampDeltaTime(dt, config.maxDeltaSec);
  const remaining = Math.max(0, (invulnState.invulnRemainingSec || 0) - safeDt);
  const active = remaining > 0;

  if (!active) {
    return {
      invulnRemainingSec: 0,
      isVisibleBlink: true,
      isDimmed: false,
    };
  }

  if (reducedMotion) {
    return {
      invulnRemainingSec: remaining,
      isVisibleBlink: true,
      isDimmed: true,
    };
  }

  const elapsed = config.invulnDurationSec - remaining;
  const blinkPhase = Math.floor(elapsed / config.blinkIntervalSec) % 2;
  return {
    invulnRemainingSec: remaining,
    isVisibleBlink: blinkPhase === 0,
    isDimmed: false,
  };
};

/**
 * Registers obstacle damage: deducts 1 life, resets streak/multiplier to x1, starts 1.5s invulnerability.
 */
export const applyDamageToRunner = (state, config = RUNNER_CONFIG) => {
  if (state.gameState !== GAME_STATES.PLAYING || state.invulnRemainingSec > 0) {
    return { state, damaged: false, gameOver: state.gameState === GAME_STATES.GAME_OVER };
  }

  const nextLives = Math.max(0, state.lives - 1);
  const gameOver = nextLives <= 0;

  return {
    damaged: true,
    gameOver,
    state: {
      ...state,
      lives: nextLives,
      streak: 0,
      multiplier: 1,
      invulnRemainingSec: gameOver ? 0 : config.invulnDurationSec,
      isVisibleBlink: true,
      isDimmed: false,
      gameState: gameOver ? GAME_STATES.GAME_OVER : GAME_STATES.PLAYING,
    },
  };
};

/**
 * Registers token pickup: increments streak, updates multiplier (capped at x4), adds tokenBonusScore.
 */
export const applyTokenCollection = (state, config = RUNNER_CONFIG) => {
  if (state.gameState !== GAME_STATES.PLAYING) {
    return { state, pointsAdded: 0 };
  }

  const nextStreak = state.streak + 1;
  const nextMultiplier = computeMultiplierFromStreak(nextStreak, config);
  const pointsAdded = config.tokenBaseScore * nextMultiplier;

  return {
    pointsAdded,
    state: {
      ...state,
      tokensCollected: state.tokensCollected + 1,
      streak: nextStreak,
      multiplier: nextMultiplier,
      tokenScore: state.tokenScore + pointsAdded,
      score: Math.floor(state.distance) + state.tokenScore + pointsAdded,
    },
  };
};

/**
 * Triggers milestone banner strictly once per 500m threshold.
 */
export const checkMilestoneReached = (distance, lastMilestoneTriggered, config = RUNNER_CONFIG) => {
  const step = config.milestoneIntervalMeters;
  const crossed = Math.floor(Math.max(0, distance) / step) * step;
  if (crossed >= step && crossed > lastMilestoneTriggered) {
    return crossed;
  }
  return null;
};

/**
 * Detects touch/pointer swipe direction or tap with threshold scaled to viewport width.
 */
export const detectSwipeAction = (startPos, endPos, viewportWidth = 390) => {
  if (!startPos || !endPos) return null;
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 10) {
    return 'tap';
  }

  const vw = Math.max(280, Number(viewportWidth) || 390);
  const swipeThreshold = Math.max(24, Math.min(56, vw * 0.065));

  if (dist < swipeThreshold) {
    return null;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? 'left' : 'right';
  }
  if (dy < 0) {
    return 'up';
  }
  return null;
};

/**
 * Creates a clean initial state for a Stack Runner session.
 */
export const createRunnerState = (initialState = GAME_STATES.READY, config = RUNNER_CONFIG) => ({
  gameState: initialState,
  countdownRemainingSec: config.countdownSeconds,
  countdownValue: config.countdownSeconds,
  lane: config.defaultLane,
  y: 0,
  vy: 0,
  isGrounded: true,
  distance: 0,
  speed: config.startSpeed,
  lives: config.initialLives,
  invulnRemainingSec: 0,
  isVisibleBlink: true,
  isDimmed: false,
  tokensCollected: 0,
  streak: 0,
  multiplier: 1,
  tokenScore: 0,
  score: 0,
  lastMilestoneTriggered: 0,
});

/**
 * Steps the 3, 2, 1, GO! countdown and transitions to PLAYING upon completion.
 */
export const stepRunnerCountdown = (state, dt) => {
  if (state.gameState !== GAME_STATES.READY || state.countdownRemainingSec <= 0) {
    return { state, startedPlaying: false };
  }
  const safeDt = clampDeltaTime(dt);
  const nextRemaining = Math.max(0, state.countdownRemainingSec - safeDt);
  if (nextRemaining <= 0) {
    return {
      startedPlaying: true,
      state: {
        ...state,
        countdownRemainingSec: 0,
        countdownValue: 0,
        gameState: GAME_STATES.PLAYING,
      },
    };
  }
  return {
    startedPlaying: false,
    state: {
      ...state,
      countdownRemainingSec: nextRemaining,
      countdownValue: Math.max(1, Math.ceil(nextRemaining - 1e-6)),
    },
  };
};

/**
 * Advances active runner simulation (distance, speed, jump, invulnerability, score, milestone).
 * Guarantees zero progression while PAUSED, READY, or GAME_OVER.
 */
export const stepRunnerSimulation = (state, dt, reducedMotion = false, config = RUNNER_CONFIG) => {
  if (state.gameState !== GAME_STATES.PLAYING) {
    return { state, milestone: null };
  }

  const safeDt = clampDeltaTime(dt, config.maxDeltaSec);
  if (safeDt <= 0) {
    return { state, milestone: null };
  }

  const nextDistance = state.distance + state.speed * safeDt;
  const nextSpeed = computeSpeedForDistance(nextDistance, config);
  const jumpResult = stepJumpPhysics(
    { y: state.y, vy: state.vy, isGrounded: state.isGrounded },
    safeDt,
    config
  );
  const invulnResult = stepInvulnerability(
    { invulnRemainingSec: state.invulnRemainingSec },
    safeDt,
    reducedMotion,
    config
  );
  const nextScore = Math.floor(nextDistance) + state.tokenScore;
  const milestone = checkMilestoneReached(nextDistance, state.lastMilestoneTriggered, config);

  return {
    milestone,
    state: {
      ...state,
      distance: nextDistance,
      speed: nextSpeed,
      y: jumpResult.y,
      vy: jumpResult.vy,
      isGrounded: jumpResult.isGrounded,
      invulnRemainingSec: invulnResult.invulnRemainingSec,
      isVisibleBlink: invulnResult.isVisibleBlink,
      isDimmed: invulnResult.isDimmed,
      score: nextScore,
      lastMilestoneTriggered: milestone || state.lastMilestoneTriggered,
    },
  };
};

export const readRunnerBestScore = (storage) =>
  readBestScoreByKey(RUNNER_CONFIG.storageKey, storage);

export const writeRunnerBestScore = (score, storage) =>
  writeBestScoreByKey(RUNNER_CONFIG.storageKey, score, storage);
