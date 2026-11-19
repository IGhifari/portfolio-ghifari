/**
 * Pure deterministic track chunk generator, consecutive-row fairness validator,
 * and token placement engine for "Stack Runner" (/play/runner).
 * Zero Three.js or DOM imports — 100% Node-testable.
 */

import {
  RUNNER_CONFIG,
  OBSTACLE_SPECS,
  computeSpeedForDistance,
  getJumpMetrics,
} from './runnerLogic.js';

/**
 * Deterministic Mulberry32 PRNG factory. Accepts integer seed and returns () => [0, 1).
 */
export const createSeededRng = (seed = 1337) => {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
};

/**
 * Minimum longitudinal distance between consecutive obstacle rows, scaled with current speed.
 * Ensures full jump recovery and comfortable lane-switching time even at max speed.
 */
export const computeMinRowSpacing = (speed = RUNNER_CONFIG.startSpeed, config = RUNNER_CONFIG) => {
  const safeSpeed = Math.max(config.startSpeed, Math.min(config.maxSpeed, Number(speed) || config.startSpeed));
  const { airtimeSec } = getJumpMetrics(config);
  // Require at least jump airtime + 0.26s reaction/land buffer (~0.92s at max speed)
  const reactionTimeSec = Math.max(0.92, airtimeSec + 0.26);
  return Math.max(12.0, safeSpeed * reactionTimeSec);
};

/**
 * Computes maximum safe lane-to-lane shift distance within available transition time.
 */
export const getMaxReachableLaneDelta = (spacing, speed, config = RUNNER_CONFIG) => {
  const safeSpeed = Math.max(1, Number(speed) || config.startSpeed);
  const tAvail = spacing / safeSpeed;
  if (tAvail >= 1.05) return 2;
  if (tAvail >= 0.72) return 1;
  return 0;
};

/**
 * Summarizes passable lanes in a 3-lane row ([type0, type1, type2]).
 */
export const analyzeRowLanes = (lanes = [null, null, null]) => {
  const openLanes = [];
  const jumpableLanes = [];
  const firewallLanes = [];

  for (let i = 0; i < 3; i++) {
    const t = lanes[i];
    if (!t) {
      openLanes.push(i);
    } else if (OBSTACLE_SPECS[t]?.clearableByJump) {
      jumpableLanes.push(i);
    } else {
      firewallLanes.push(i);
    }
  }

  return {
    openLanes,
    jumpableLanes,
    firewallLanes,
    nonFirewallLanes: [...openLanes, ...jumpableLanes],
  };
};

/**
 * Validates that a single obstacle row never blocks all three lanes and retains >= 1 passable lane.
 */
export const isSingleRowValid = (lanes) => {
  if (!Array.isArray(lanes) || lanes.length !== 3) return false;
  const info = analyzeRowLanes(lanes);
  if (info.firewallLanes.length >= 3) return false;
  // Require at least one open or jump-clearable lane (and prefer at least one non-firewall lane)
  return info.nonFirewallLanes.length >= 1;
};

/**
 * Practical, deterministic validator for consecutive obstacle rows:
 * Verifies reaction spacing scales with speed, prevents jump-into-firewall traps,
 * and ensures at least one open lane in `nextRow` is reachable from `prevRow`.
 */
export const isConsecutiveRowPairFair = (
  prevRow,
  nextRow,
  speed = RUNNER_CONFIG.startSpeed,
  config = RUNNER_CONFIG
) => {
  if (!nextRow || !isSingleRowValid(nextRow.lanes)) return false;

  const minSpacing = computeMinRowSpacing(speed, config);
  if (!prevRow) {
    return analyzeRowLanes(nextRow.lanes).openLanes.length >= 1;
  }

  const spacing = nextRow.dist - prevRow.dist;
  if (spacing < minSpacing - 1e-6) return false;

  const prevInfo = analyzeRowLanes(prevRow.lanes);
  const nextInfo = analyzeRowLanes(nextRow.lanes);
  if (nextInfo.openLanes.length === 0) {
    // Allow jump-only row only if previous row had an open lane and spacing exceeds jump + reaction margin
    if (prevInfo.openLanes.length === 0) return false;
  }

  const maxDelta = getMaxReachableLaneDelta(spacing, speed, config);
  const { airtimeSec } = getJumpMetrics(config);
  const tAvail = spacing / Math.max(1, speed);

  // If previous row forced a jump (0 open lanes), require full jump airtime + ground landing buffer
  if (prevInfo.openLanes.length === 0 && tAvail < airtimeSec + 0.25) {
    return false;
  }

  // Must have a reachable open (or jumpable when open exits exist) lane within maxDelta
  const exitLanes = prevInfo.openLanes.length > 0 ? prevInfo.openLanes : prevInfo.jumpableLanes;
  const entryLanes = nextInfo.openLanes.length > 0 ? nextInfo.openLanes : nextInfo.jumpableLanes;

  for (const prevLane of exitLanes) {
    for (const nextLane of entryLanes) {
      if (Math.abs(nextLane - prevLane) <= maxDelta) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Guaranteed-safe fallback row aligned with the previous row's safest open lane.
 */
export const buildSafeFallbackRow = (prevRow, dist) => {
  const lanes = [null, null, null];
  const prevInfo = prevRow ? analyzeRowLanes(prevRow.lanes) : { openLanes: [1] };
  const safeLane = prevInfo.openLanes[0] ?? prevInfo.jumpableLanes?.[0] ?? 1;
  // Place a single bug only on a lane different from safeLane
  const bugLane = (safeLane + 1) % 3;
  lanes[bugLane] = 'bug';
  return { dist, lanes };
};

const ROW_PRESETS = [
  // Mild rows (1 obstacle)
  ['bug', null, null],
  [null, 'bug', null],
  [null, null, 'bug'],
  ['lowGate', null, null],
  [null, 'lowGate', null],
  [null, null, 'lowGate'],
  [null, 'firewall', null],
  ['firewall', null, null],
  [null, null, 'firewall'],
  // Medium rows (2 obstacles, always 1 open lane)
  ['firewall', 'bug', null],
  [null, 'bug', 'firewall'],
  ['bug', null, 'lowGate'],
  ['lowGate', null, 'bug'],
  ['firewall', null, 'firewall'],
  ['firewall', 'firewall', null],
  [null, 'firewall', 'firewall'],
  // Jump-challenge row (all low obstacles, strictly guarded by validator)
  ['bug', 'bug', 'bug'],
];

/**
 * Generates obstacles for a single row and guarantees fairness against `prevRow`.
 */
export const generateFairObstacleRow = (
  dist,
  prevRow,
  speed,
  rng = Math.random,
  config = RUNNER_CONFIG
) => {
  // Progressive difficulty pool: early low speed avoids double-firewall presets
  const maxPresetIdx = speed < 15 ? 12 : ROW_PRESETS.length;

  for (let attempt = 0; attempt < 8; attempt++) {
    const idx = Math.floor(rng() * maxPresetIdx);
    const candidate = { dist, lanes: [...ROW_PRESETS[idx]] };
    if (isConsecutiveRowPairFair(prevRow, candidate, speed, config)) {
      return candidate;
    }
  }

  return buildSafeFallbackRow(prevRow, dist);
};

/**
 * Checks whether a candidate token at `(lane, dist, y)` overlaps any obstacle hitbox or traps the player.
 */
export const isTokenPlacementFair = (candidate, obstacles) => {
  if (!candidate) return false;
  for (const obs of obstacles) {
    if (obs.lane !== candidate.lane) continue;

    const spec = OBSTACLE_SPECS[obs.type];
    if (!spec) continue;

    const longMargin = spec.depth * 0.5 + 2.2;
    const withinZ = Math.abs(candidate.dist - obs.dist) < longMargin;
    if (!withinZ) continue;

    // Never place near a firewall in the same lane within tight distance
    if (!spec.clearableByJump) {
      return false;
    }

    // Check vertical bounding box: obstacle [0, spec.height] vs token [y - 0.45, y + 0.45]
    if (candidate.y - 0.45 <= spec.height + 0.2) {
      return false;
    }
  }
  return true;
};

/**
 * Generates fair obstacles and tech tokens for a specific chunk index.
 * Chunk 0 acts as a safe warm-up runway.
 */
export const generateChunkContent = ({
  chunkIndex,
  lastObstacleRow = null,
  nextIdCounter = { obs: 1, token: 1, labelCursor: 0 },
  techLabels = ['TypeScript'],
  rng = Math.random,
  config = RUNNER_CONFIG,
}) => {
  const startDist = chunkIndex * config.chunkLength;
  const endDist = startDist + config.chunkLength;
  const obstacles = [];
  const tokens = [];
  let currentLastRow = lastObstacleRow;

  const poolLabels = techLabels.slice(0, Math.max(1, config.maxTokenLabelTextures));
  const nextLabelIndex = () => {
    const idx = nextIdCounter.labelCursor % poolLabels.length;
    nextIdCounter.labelCursor += 1;
    return idx;
  };

  if (chunkIndex === 0) {
    // Chunk 0: obstacle-free runway + 2 starter tokens in center/adjacent lane
    for (const d of [10, 17]) {
      const lIdx = nextLabelIndex();
      tokens.push({
        id: nextIdCounter.token++,
        lane: 1,
        dist: startDist + d,
        y: 0.78,
        labelIndex: lIdx,
        label: poolLabels[lIdx],
        collected: false,
      });
    }
    return { chunkIndex, startDist, endDist, obstacles, tokens, lastObstacleRow: currentLastRow };
  }

  // Advance row positions strictly obeying speed-scaled minSpacing
  const chunkSpeed = computeSpeedForDistance(startDist, config);
  const minSpacing = computeMinRowSpacing(chunkSpeed, config);
  let cursorDist = currentLastRow
    ? Math.max(startDist + 2, currentLastRow.dist + minSpacing)
    : startDist + 4;

  const chunkRows = [];
  while (cursorDist <= endDist - 2.5) {
    const rowSpeed = computeSpeedForDistance(cursorDist, config);
    const row = generateFairObstacleRow(cursorDist, currentLastRow, rowSpeed, rng, config);
    chunkRows.push(row);
    currentLastRow = row;

    for (let lane = 0; lane < 3; lane++) {
      const type = row.lanes[lane];
      if (!type) continue;
      const spec = OBSTACLE_SPECS[type];
      obstacles.push({
        id: nextIdCounter.obs++,
        lane,
        dist: row.dist,
        type,
        height: spec.height,
        depth: spec.depth,
        hitRegistered: false,
      });
    }

    const extraSlack = rng() * 3.5;
    cursorDist += computeMinRowSpacing(rowSpeed, config) + extraSlack;
  }

  // Place 1-2 fair tokens inside open lanes or midpoints between rows
  const tokenAnchors = chunkRows.length > 0
    ? chunkRows.map((row) => ({ dist: row.dist, row }))
    : [{ dist: startDist + config.chunkLength * 0.5, row: null }];

  for (const anchor of tokenAnchors) {
    if (rng() > 0.72) continue;
    const openLanes = anchor.row ? analyzeRowLanes(anchor.row.lanes).openLanes : [0, 1, 2];
    if (openLanes.length === 0) continue;

    const chosenLane = openLanes[Math.floor(rng() * openLanes.length)];
    const candidate = {
      dist: anchor.dist,
      lane: chosenLane,
      y: 0.78,
    };

    if (isTokenPlacementFair(candidate, obstacles)) {
      const lIdx = nextLabelIndex();
      tokens.push({
        id: nextIdCounter.token++,
        lane: candidate.lane,
        dist: candidate.dist,
        y: candidate.y,
        labelIndex: lIdx,
        label: poolLabels[lIdx],
        collected: false,
      });
    }
  }

  return {
    chunkIndex,
    startDist,
    endDist,
    obstacles,
    tokens,
    lastObstacleRow: currentLastRow,
  };
};

/**
 * Initializes a pooled track chunk manager guaranteeing continuous chunk ordering and zero gaps.
 */
export const createChunkPoolState = ({
  seed = 42,
  techLabels = ['TypeScript'],
  config = RUNNER_CONFIG,
} = {}) => {
  const rng = createSeededRng(seed);
  const idCounter = { obs: 1, token: 1, labelCursor: 0 };
  const chunks = [];
  let lastObstacleRow = null;

  for (let i = 0; i < config.chunkPoolSize; i++) {
    const chunk = generateChunkContent({
      chunkIndex: i,
      lastObstacleRow,
      nextIdCounter: idCounter,
      techLabels,
      rng,
      config,
    });
    lastObstacleRow = chunk.lastObstacleRow;
    chunks.push(chunk);
  }

  return {
    chunks,
    lastObstacleRow,
    idCounter,
    techLabels,
    rng,
  };
};

/**
 * Progresses chunk recycling deterministically based on player forward distance.
 * Recycles any passed chunk behind `baseIndex` seamlessly to the leading edge.
 */
export const stepChunkRecycling = (poolState, distance, config = RUNNER_CONFIG) => {
  const baseIndex = Math.max(0, Math.floor(Math.max(0, distance) / config.chunkLength) - 1);
  let recycled = false;

  // Find current highest chunk index
  let maxIdx = -1;
  for (const ch of poolState.chunks) {
    if (ch.chunkIndex > maxIdx) maxIdx = ch.chunkIndex;
  }

  for (let i = 0; i < poolState.chunks.length; i++) {
    const chunk = poolState.chunks[i];
    if (chunk.chunkIndex < baseIndex) {
      const nextIndex = maxIdx + 1;
      maxIdx = nextIndex;
      const fresh = generateChunkContent({
        chunkIndex: nextIndex,
        lastObstacleRow: poolState.lastObstacleRow,
        nextIdCounter: poolState.idCounter,
        techLabels: poolState.techLabels,
        rng: poolState.rng,
        config,
      });
      poolState.lastObstacleRow = fresh.lastObstacleRow;
      poolState.chunks[i] = fresh;
      recycled = true;
    }
  }

  if (recycled) {
    poolState.chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  return { recycled, chunks: poolState.chunks };
};
