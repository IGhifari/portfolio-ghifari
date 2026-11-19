/**
 * Pure game logic for "Bug Hunter" (/play/bugs).
 * Zero Three.js or DOM imports — 100% unit-testable in Node.js.
 */

import {
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  readBestScoreByKey,
  writeBestScoreByKey,
} from '../../shared/gameUtils.js';

export { createInputLockUntil, isInputLocked, parseBestScore };

export const BUGS_CONFIG = {
  arenaRadius: 7.0,
  serverRadius: 1.05,
  maxServerHp: 5,
  maxAliveBugs: 18,
  maxRegularAlive: 17, // Reserves 1 slot for the Boss in the 18-slot main budget
  maxBossMinionsAlive: 6, // Separate small budget for Boss-spawned crawlers
  poolCapacity: 24, // 17 regular + 1 boss + 6 boss minions
  restDurationSec: 1.5,
  bannerWaveInterval: 2,
  bossWaveInterval: 5,
  comboWindowMs: 1500,
  comboBonusStep: 5,
  maxComboBonus: 5,
  minHitboxDiameterPx: 44,
  minHitboxRadiusPx: 22,
  inputLockMs: 400,
  storageKey: 'portfolio:bugs:best',
};

export const BUG_TYPES = {
  crawler: {
    type: 'crawler',
    hp: 1,
    baseSpeed: 1.8,
    baseScore: 1,
    serverDamage: 1,
    serverHealOnKill: 0,
    scale: 1.3,
  },
  sprinter: {
    type: 'sprinter',
    hp: 1,
    baseSpeed: 2.85,
    baseScore: 1,
    serverDamage: 1,
    serverHealOnKill: 0,
    scale: 1.02,
  },
  tank: {
    type: 'tank',
    hp: 3,
    baseSpeed: 1.15,
    baseScore: 3,
    serverDamage: 1,
    serverHealOnKill: 0,
    scale: 1.74,
  },
  boss: {
    type: 'boss',
    hp: 15,
    hpStepPerBoss: 4,
    baseSpeed: 0.64,
    baseScore: 15,
    serverDamage: 2,
    serverHealOnKill: 1,
    minionSpawnIntervalSec: 2.5,
    scale: 2.65,
  },
};

/**
 * Computes scaled Boss HP for a given wave (every 5th wave: 15, 19, 23, ...).
 */
export const computeBossHp = (wave = 5) => {
  const bossIdx = Math.max(1, Math.floor(Math.max(1, Number(wave) || 5) / BUGS_CONFIG.bossWaveInterval));
  return BUG_TYPES.boss.hp + (bossIdx - 1) * BUG_TYPES.boss.hpStepPerBoss;
};

/**
 * Computes difficulty curve for `wave` with strict caps on spawn rate, speed, and count.
 */
export const computeWaveConfig = (wave = 1, config = BUGS_CONFIG) => {
  const w = Math.max(1, Math.floor(Number(wave) || 1));
  const isBossWave = w % config.bossWaveInterval === 0;
  const totalRegularBugs = Math.min(26, 5 + (w - 1) * 2);
  const spawnIntervalSec = Math.max(0.42, 1.28 - (w - 1) * 0.065);
  const speedMultiplier = Math.min(1.75, 1 + (w - 1) * 0.055);
  const bossHp = isBossWave ? computeBossHp(w) : 0;

  return {
    wave: w,
    isBossWave,
    totalRegularBugs,
    spawnIntervalSec,
    speedMultiplier,
    bossHp,
  };
};

/**
 * Deterministic bug archetype picker using an injectable RNG (`() => [0, 1)`).
 */
export const pickBugType = (wave = 1, rng = Math.random) => {
  const w = Math.max(1, Math.floor(Number(wave) || 1));
  const roll = Math.min(0.999999, Math.max(0, Number(rng()) || 0));

  if (w === 1) return 'crawler';
  if (w === 2) return roll < 0.72 ? 'crawler' : 'sprinter';

  const tankChance = Math.min(0.28, 0.14 + (w - 3) * 0.02);
  const sprinterChance = Math.min(0.36, 0.24 + (w - 2) * 0.02);

  if (roll < tankChance) return 'tank';
  if (roll < tankChance + sprinterChance) return 'sprinter';
  return 'crawler';
};

/**
 * Places a bug strictly on the circular arena edge at `angleRad`.
 */
export const computeEdgeSpawnPosition = (
  angleRad = 0,
  radius = BUGS_CONFIG.arenaRadius
) => {
  const a = Number(angleRad) || 0;
  const r = Math.max(0.5, Number(radius) || BUGS_CONFIG.arenaRadius);
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  const angle = Math.atan2(-x, -z);
  return { x, z, angle };
};

/**
 * Checks whether a bug of `spawnCategory` ('regular' | 'boss' | 'minion') can spawn.
 * - Regular bugs are capped at `maxRegularAlive` (17), leaving 1 reserved slot for the Boss.
 * - Boss is NEVER blocked by regular or minion caps (1 reserved slot).
 * - Boss-spawned crawlers ('minion') use a separate budget (`maxBossMinionsAlive` = 6).
 */
export const canSpawnBug = (
  activeBugs = [],
  spawnCategory = 'regular',
  config = BUGS_CONFIG
) => {
  const list = Array.isArray(activeBugs) ? activeBugs : [];
  if (spawnCategory === 'boss') {
    const bossAlive = list.filter((b) => b && b.type === 'boss').length;
    return bossAlive < 1;
  }
  if (spawnCategory === 'minion') {
    const minionsAlive = list.filter((b) => b && b.isMinion).length;
    return minionsAlive < config.maxBossMinionsAlive;
  }
  const regularAlive = list.filter((b) => b && !b.isMinion && b.type !== 'boss').length;
  return regularAlive < config.maxRegularAlive;
};

/**
 * Creates a bug entity state object.
 */
export const createBugEntity = ({
  id,
  type = 'crawler',
  wave = 1,
  angleRad = 0,
  isMinion = false,
  spawnRadius = BUGS_CONFIG.arenaRadius,
  spawnX,
  spawnZ,
  config = BUGS_CONFIG,
}) => {
  const arch = BUG_TYPES[type] || BUG_TYPES.crawler;
  const waveCfg = computeWaveConfig(wave, config);
  const pos =
    Number.isFinite(spawnX) && Number.isFinite(spawnZ)
      ? {
          x: spawnX,
          z: spawnZ,
          angle: Math.atan2(-spawnX, -spawnZ),
        }
      : computeEdgeSpawnPosition(angleRad, spawnRadius);

  const maxHp = type === 'boss' ? computeBossHp(wave) : arch.hp;
  const speed = arch.baseSpeed * (type === 'boss' ? Math.min(1.3, waveCfg.speedMultiplier) : waveCfg.speedMultiplier);

  return {
    id,
    type: arch.type,
    isMinion: Boolean(isMinion),
    hp: maxHp,
    maxHp,
    speed,
    baseScore: arch.baseScore,
    serverDamage: arch.serverDamage,
    scale: arch.scale,
    x: pos.x,
    z: pos.z,
    angle: pos.angle,
    distToServer: Math.hypot(pos.x, pos.z),
    minionTimerSec: type === 'boss' ? BUG_TYPES.boss.minionSpawnIntervalSec : 0,
  };
};

/**
 * Frame-rate independent delta-time movement toward the central server (0, 0).
 */
export const stepBugMovement = (bug, dt, config = BUGS_CONFIG) => {
  if (!bug) return null;
  const safeDt = Math.min(Math.max(Number(dt) || 0, 0), 0.08);
  const dist = Math.hypot(bug.x, bug.z);

  if (dist <= config.serverRadius) {
    return {
      ...bug,
      distToServer: dist,
      reachedServer: true,
    };
  }

  const stepDist = bug.speed * safeDt;
  const nextDist = Math.max(0, dist - stepDist);
  const ratio = dist > 1e-6 ? nextDist / dist : 0;
  const nextX = bug.x * ratio;
  const nextZ = bug.z * ratio;

  return {
    ...bug,
    x: nextX,
    z: nextZ,
    angle: Math.atan2(-bug.x, -bug.z),
    distToServer: nextDist,
    reachedServer: nextDist <= config.serverRadius,
  };
};

/**
 * Explicit combo bonus formula: +1 bonus point for every 5 combo, capped at +5.
 */
export const computeComboBonus = (combo = 0, config = BUGS_CONFIG) => {
  const c = Math.max(0, Math.floor(Number(combo) || 0));
  return Math.min(config.maxComboBonus, Math.floor(c / config.comboBonusStep));
};

/**
 * Applies 1 hit to `bug`, updating HP, combo window, score delta, and boss server heal.
 */
export const applyBugHit = (
  bug,
  nowMs = 0,
  comboState = { combo: 0, lastKillMs: -Infinity },
  config = BUGS_CONFIG
) => {
  if (!bug) return null;
  const nextHp = Math.max(0, bug.hp - 1);
  if (nextHp > 0) {
    return {
      killed: false,
      bug: { ...bug, hp: nextHp },
      comboState,
      scoreDelta: 0,
      serverHeal: 0,
    };
  }

  const withinWindow =
    Number.isFinite(comboState.lastKillMs) &&
    nowMs - comboState.lastKillMs >= 0 &&
    nowMs - comboState.lastKillMs <= config.comboWindowMs;
  const nextCombo = withinWindow ? (Number(comboState.combo) || 0) + 1 : 1;
  const comboBonus = computeComboBonus(nextCombo, config);
  const scoreDelta = (bug.baseScore || 1) + comboBonus;
  const serverHeal = bug.type === 'boss' ? BUG_TYPES.boss.serverHealOnKill : 0;

  return {
    killed: true,
    bug: { ...bug, hp: 0 },
    comboState: {
      combo: nextCombo,
      lastKillMs: nowMs,
    },
    scoreDelta,
    comboBonus,
    serverHeal,
  };
};

/**
 * Applies damage to the central server when a bug reaches it (2 HP for Boss, 1 HP for others).
 */
export const applyServerDamage = (
  currentHp,
  bugType = 'crawler',
  config = BUGS_CONFIG
) => {
  const dmg = bugType === 'boss' ? BUG_TYPES.boss.serverDamage : 1;
  const hp = Math.max(0, Math.min(config.maxServerHp, (Number(currentHp) || 0) - dmg));
  return {
    hp,
    damage: dmg,
    gameOver: hp <= 0,
  };
};

/**
 * Restores server HP (e.g. +1 when killing a Boss), capped strictly at `maxServerHp` (5).
 */
export const applyServerHeal = (
  currentHp,
  healAmount = 1,
  config = BUGS_CONFIG
) =>
  Math.min(
    config.maxServerHp,
    Math.max(0, (Number(currentHp) || 0) + Math.max(0, Number(healAmount) || 0))
  );

/**
 * Pure overlapping-hitbox selector:
 * Picks the single bug within its screen hitbox radius whose projected center
 * (screenX, screenY) is closest to (pointer.x, pointer.y).
 * Ties are broken by picking the bug nearest the server (`Math.hypot(x, z)`).
 * Ensures one click hits at most one bug.
 */
export const selectTargetBug = (
  pointer = { x: 0, y: 0 },
  candidates = [],
  minRadiusPx = BUGS_CONFIG.minHitboxRadiusPx
) => {
  if (!pointer || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  let best = null;
  let bestScreenDist = Infinity;
  let bestServerDist = Infinity;

  for (const c of candidates) {
    if (!c) continue;
    const hitRadius = Math.max(minRadiusPx, Number(c.hitRadiusPx) || minRadiusPx);
    const screenDist = Math.hypot(pointer.x - c.screenX, pointer.y - c.screenY);
    if (screenDist > hitRadius) continue;

    const serverDist = Number.isFinite(c.distToServer)
      ? c.distToServer
      : Math.hypot(c.x || 0, c.z || 0);

    const isCloserToPointer = screenDist < bestScreenDist - 1e-4;
    const isTieCloserToServer =
      Math.abs(screenDist - bestScreenDist) <= 1e-4 && serverDist < bestServerDist;

    if (isCloserToPointer || isTieCloserToServer) {
      best = c;
      bestScreenDist = screenDist;
      bestServerDist = serverDist;
    }
  }

  return best;
};

/**
 * Initializes wave state for `wave`.
 */
export const createWaveState = (wave = 1, config = BUGS_CONFIG) => {
  const cfg = computeWaveConfig(wave, config);
  return {
    wave: cfg.wave,
    isBossWave: cfg.isBossWave,
    totalRegularToSpawn: cfg.totalRegularBugs,
    regularSpawned: 0,
    bossSpawned: !cfg.isBossWave,
    spawnIntervalSec: cfg.spawnIntervalSec,
    spawnTimerSec: 0.25,
    status: 'spawning', // 'spawning' | 'resting'
    restTimerSec: 0,
  };
};

/**
 * Advances wave spawning and wave-end / rest transitions.
 * A wave ends ONLY when all its regular bugs (and Boss on boss waves) have spawned
 * AND `activeBugs.length === 0`, then rests for `restDurationSec` (1.5s) before starting `wave + 1`.
 */
export const stepWaveState = (
  waveState,
  activeBugs = [],
  dt = 1 / 60,
  rng = Math.random,
  nextIdFn = () => 1,
  config = BUGS_CONFIG
) => {
  const safeDt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
  const state = { ...waveState };
  const newlySpawned = [];

  if (state.status === 'resting') {
    state.restTimerSec = Math.max(0, state.restTimerSec - safeDt);
    if (state.restTimerSec <= 0) {
      return {
        waveState: createWaveState(state.wave + 1, config),
        newlySpawned,
        waveCleared: false,
        startedNewWave: true,
      };
    }
    return {
      waveState: state,
      newlySpawned,
      waveCleared: false,
      startedNewWave: false,
    };
  }

  // 1. On boss waves, spawn the Boss using its reserved slot as soon as possible
  if (state.isBossWave && !state.bossSpawned) {
    if (canSpawnBug(activeBugs, 'boss', config)) {
      const angle = (Number(rng()) || 0) * Math.PI * 2;
      const bossBug = createBugEntity({
        id: nextIdFn(),
        type: 'boss',
        wave: state.wave,
        angleRad: angle,
        isMinion: false,
        config,
      });
      newlySpawned.push(bossBug);
      state.bossSpawned = true;
    }
  }

  // 2. Spawn regular wave bugs on timer when regular budget has space
  if (state.regularSpawned < state.totalRegularToSpawn) {
    state.spawnTimerSec -= safeDt;
    if (
      state.spawnTimerSec <= 0 &&
      canSpawnBug([...activeBugs, ...newlySpawned], 'regular', config)
    ) {
      const angle = (Number(rng()) || 0) * Math.PI * 2;
      const bugType = pickBugType(state.wave, rng);
      const bug = createBugEntity({
        id: nextIdFn(),
        type: bugType,
        wave: state.wave,
        angleRad: angle,
        isMinion: false,
        config,
      });
      newlySpawned.push(bug);
      state.regularSpawned += 1;
      state.spawnTimerSec = state.spawnIntervalSec;
    }
  }

  // 3. Check if wave is completely cleared (all scheduled bugs spawned + none alive)
  const allScheduledSpawned =
    state.regularSpawned >= state.totalRegularToSpawn && state.bossSpawned;
  const totalAliveNow = activeBugs.length + newlySpawned.length;

  if (allScheduledSpawned && totalAliveNow === 0) {
    state.status = 'resting';
    state.restTimerSec = config.restDurationSec;
    return {
      waveState: state,
      newlySpawned,
      waveCleared: true,
      startedNewWave: false,
    };
  }

  return {
    waveState: state,
    newlySpawned,
    waveCleared: false,
    startedNewWave: false,
  };
};

/**
 * Storage helpers for Bug Hunter best score (`portfolio:bugs:best`).
 */
export const readBugsBestScore = (
  storage,
  key = BUGS_CONFIG.storageKey
) => readBestScoreByKey(key, storage);

export const writeBugsBestScore = (
  score,
  storage,
  key = BUGS_CONFIG.storageKey
) => writeBestScoreByKey(key, score, storage);
