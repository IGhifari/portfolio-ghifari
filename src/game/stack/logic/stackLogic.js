/**
 * Pure game logic for "Deploy Stack" (/play/stack).
 * Zero Three.js or DOM imports — 100% unit-testable in Node.js.
 */

import { techCategoriesData } from '../../../data/skills.js';

export const STACK_CONFIG = {
  initialWidth: 3.2,
  initialDepth: 3.2,
  blockHeight: 0.54,
  slideBound: 4.3,
  baseSpeed: 4.2,
  speedStep: 0.14,
  maxSpeed: 9.2,
  perfectTolerance: 0.14,
  comboWidenThreshold: 5,
  widenStep: 0.32,
  minBlockSize: 0.08,
  inputLockMs: 400,
  maxLabelLength: 14,
  storageKey: 'portfolio:stack:best',
};

/**
 * Truncates and normalizes a technology label to fit cleanly on a 3D block face.
 */
export const formatTechLabel = (name, maxLen = STACK_CONFIG.maxLabelLength) => {
  if (typeof name !== 'string') return 'STACK';
  const trimmed = name.trim();
  if (!trimmed) return 'STACK';
  const upper = trimmed.toUpperCase();
  if (upper.length <= maxLen) return upper;
  if (maxLen <= 1) return upper.slice(0, 1);
  return `${upper.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
};

/**
 * Computes fitted label text, font scale, and orientation for a block face of size (width x depth)
 * so text never overflows or distorts even on narrow sliced blocks.
 */
export const fitLabelToBlock = (
  name,
  width = STACK_CONFIG.initialWidth,
  depth = STACK_CONFIG.initialDepth,
  config = STACK_CONFIG
) => {
  const w = Math.max(0, Number(width) || 0);
  const d = Math.max(0, Number(depth) || 0);
  const minDim = Math.min(w, d);
  const maxDim = Math.max(w, d);

  // If the block is sliced into an ultra-thin strip, omit label text so it never overflows borders
  if (minDim < 0.36 || maxDim < 0.6) {
    return {
      text: '',
      maxChars: 0,
      fontScale: 0,
      rotate90: false,
    };
  }

  const rotate90 = d > w * 1.15;
  const spanRatio = Math.min(1, maxDim / config.initialWidth);
  const thicknessRatio = Math.min(1, minDim / (config.initialDepth * 0.55));
  const maxChars = Math.max(
    3,
    Math.min(config.maxLabelLength, Math.floor(spanRatio * config.maxLabelLength))
  );
  const text = formatTechLabel(name, maxChars);
  const fontScale = Math.max(0.42, Math.min(1, Math.min(spanRatio, thicknessRatio)));

  return {
    text,
    maxChars,
    fontScale,
    rotate90,
  };
};

/**
 * Extracts an ordered list of technology names from `techCategoriesData` (`src/data/skills.js`).
 * Handles empty or malformed inputs safely without crashing.
 */
export const extractTechLabels = (categories = techCategoriesData) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return ['STACK'];
  }
  const seen = new Set();
  const list = [];
  for (const cat of categories) {
    if (!cat || !Array.isArray(cat.skills)) continue;
    for (const skill of cat.skills) {
      const raw = typeof skill === 'string' ? skill : skill?.name;
      if (typeof raw === 'string' && raw.trim()) {
        const clean = raw.trim();
        if (!seen.has(clean)) {
          seen.add(clean);
          list.push(clean);
        }
      }
    }
  }
  return list.length > 0 ? list : ['STACK'];
};

/**
 * Cycles through extracted tech labels in deterministic order by block level.
 */
export const getTechLabelForLevel = (labels, level = 0, maxLen = STACK_CONFIG.maxLabelLength) => {
  if (!Array.isArray(labels) || labels.length === 0) {
    return 'STACK';
  }
  const idx = Math.max(0, Math.floor(Number(level) || 0)) % labels.length;
  return formatTechLabel(labels[idx], maxLen);
};

/**
 * Alternates sliding axis ('x' on odd levels, 'z' on even levels).
 */
export const getAxisForLevel = (level = 1) =>
  Math.abs(Math.floor(Number(level) || 1)) % 2 === 1 ? 'x' : 'z';

/**
 * Computes sliding speed for a given level with gradual increase and strict upper cap.
 */
export const computeSpeed = (level = 1, config = STACK_CONFIG) => {
  const lvl = Math.max(1, Number(level) || 1);
  const raw = config.baseSpeed + (lvl - 1) * config.speedStep;
  return Math.min(config.maxSpeed, raw);
};

/**
 * Creates a new sliding block positioned at the negative bound of the active axis.
 */
export const createSlidingBlock = (
  level,
  topBlock,
  labels,
  config = STACK_CONFIG
) => {
  const axis = getAxisForLevel(level);
  const speed = computeSpeed(level, config);
  const label = getTechLabelForLevel(labels, level);
  const startOffset = -config.slideBound;

  return {
    level,
    axis,
    direction: 1,
    speed,
    label,
    x: axis === 'x' ? startOffset : topBlock.x,
    z: axis === 'z' ? startOffset : topBlock.z,
    y: level * config.blockHeight,
    width: topBlock.width,
    depth: topBlock.depth,
  };
};

/**
 * Frame-rate independent delta-time integration for the sliding block.
 * Clamps dt so tab switches or frame spikes cannot teleport the block.
 */
export const stepSlidingBlock = (movingBlock, dt, config = STACK_CONFIG) => {
  if (!movingBlock) return null;
  const safeDt = Math.min(Math.max(Number(dt) || 0, 0), 0.08);
  const axis = movingBlock.axis === 'z' ? 'z' : 'x';
  const bound = config.slideBound;

  let pos = movingBlock[axis] + movingBlock.direction * movingBlock.speed * safeDt;
  let dir = movingBlock.direction;

  if (pos >= bound) {
    pos = bound - (pos - bound);
    dir = -1;
  } else if (pos <= -bound) {
    pos = -bound + (-bound - pos);
    dir = 1;
  }

  return {
    ...movingBlock,
    [axis]: pos,
    direction: dir,
  };
};

/**
 * Evaluates dropping `movingBlock` onto `topBlock`.
 * Handles perfect-drop tolerance, combo counter, 5-combo block widening (capped at initial size),
 * overhang cutting for left/right/front/back offsets, and complete miss detection.
 */
export const computePlacement = (
  movingBlock,
  topBlock,
  currentCombo = 0,
  config = STACK_CONFIG
) => {
  const axis = movingBlock.axis === 'z' ? 'z' : 'x';
  const sizeKey = axis === 'x' ? 'width' : 'depth';

  const delta = movingBlock[axis] - topBlock[axis];
  const absDelta = Math.abs(delta);
  const currentSpan = movingBlock[sizeKey];

  // 1. Perfect drop within tolerance: no overhang cut
  if (absDelta <= config.perfectTolerance) {
    const nextCombo = (Number(currentCombo) || 0) + 1;
    const shouldWiden =
      nextCombo >= config.comboWidenThreshold &&
      nextCombo % config.comboWidenThreshold === 0;

    const maxSpan = axis === 'x' ? config.initialWidth : config.initialDepth;
    const nextSpan = shouldWiden
      ? Math.min(maxSpan, currentSpan + config.widenStep)
      : currentSpan;

    const placedBlock = {
      level: movingBlock.level,
      label: movingBlock.label,
      x: axis === 'x' ? topBlock.x : movingBlock.x,
      z: axis === 'z' ? topBlock.z : movingBlock.z,
      y: movingBlock.y,
      width: axis === 'x' ? nextSpan : movingBlock.width,
      depth: axis === 'z' ? nextSpan : movingBlock.depth,
    };

    return {
      status: 'perfect',
      gameOver: false,
      isPerfect: true,
      combo: nextCombo,
      widened: nextSpan > currentSpan,
      placedBlock,
      overhangPiece: null,
    };
  }

  // 2. Check overlap along the sliding axis
  const overlap = currentSpan - absDelta;
  if (overlap <= config.minBlockSize) {
    return {
      status: 'miss',
      gameOver: true,
      isPerfect: false,
      combo: 0,
      widened: false,
      placedBlock: null,
      overhangPiece: {
        x: movingBlock.x,
        y: movingBlock.y,
        z: movingBlock.z,
        width: movingBlock.width,
        depth: movingBlock.depth,
        axis,
        direction: delta >= 0 ? 1 : -1,
      },
    };
  }

  // 3. Partial overlap: trim placed block and spawn falling overhang piece
  const cutSize = absDelta;
  const sign = delta >= 0 ? 1 : -1;
  const placedCenter = topBlock[axis] + delta / 2;
  const overhangCenter = placedCenter + sign * (overlap / 2 + cutSize / 2);

  const placedBlock = {
    level: movingBlock.level,
    label: movingBlock.label,
    x: axis === 'x' ? placedCenter : movingBlock.x,
    z: axis === 'z' ? placedCenter : movingBlock.z,
    y: movingBlock.y,
    width: axis === 'x' ? overlap : movingBlock.width,
    depth: axis === 'z' ? overlap : movingBlock.depth,
  };

  const overhangPiece = {
    x: axis === 'x' ? overhangCenter : movingBlock.x,
    y: movingBlock.y,
    z: axis === 'z' ? overhangCenter : movingBlock.z,
    width: axis === 'x' ? cutSize : movingBlock.width,
    depth: axis === 'z' ? cutSize : movingBlock.depth,
    axis,
    direction: sign,
  };

  return {
    status: 'cut',
    gameOver: false,
    isPerfect: false,
    combo: 0,
    widened: false,
    placedBlock,
    overhangPiece,
  };
};

/**
 * Pure 400ms input lock helpers to prevent accidental drops/restarts after game over or unpause.
 */
export const createInputLockUntil = (nowMs, durationMs = STACK_CONFIG.inputLockMs) =>
  (Number(nowMs) || 0) + Math.max(0, Number(durationMs) || 0);

export const isInputLocked = (nowMs, lockUntilMs) =>
  (Number(nowMs) || 0) < (Number(lockUntilMs) || 0);

/**
 * Validates a raw best-score value from localStorage.
 * Accepts only finite non-negative integers; returns 0 for garbage/corrupted values.
 */
export const parseBestScore = (raw) => {
  if (raw === null || raw === undefined || raw === '' || typeof raw === 'boolean') {
    return 0;
  }
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0 || num > 1_000_000) {
    return 0;
  }
  return num;
};

/**
 * Safely reads best score from storage without ever throwing if localStorage is blocked.
 */
export const readBestScore = (
  storage,
  key = STACK_CONFIG.storageKey
) => {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined'
        ? window.localStorage
        : null;
    if (!targetStorage || typeof targetStorage.getItem !== 'function') {
      return 0;
    }
    return parseBestScore(targetStorage.getItem(key));
  } catch {
    return 0;
  }
};

/**
 * Safely writes a new best score if it exceeds the stored best score.
 */
export const writeBestScore = (
  score,
  storage,
  key = STACK_CONFIG.storageKey
) => {
  const validScore = parseBestScore(score);
  const currentBest = readBestScore(storage, key);
  const nextBest = Math.max(currentBest, validScore);

  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined'
        ? window.localStorage
        : null;
    if (targetStorage && typeof targetStorage.setItem === 'function' && nextBest > currentBest) {
      targetStorage.setItem(key, String(nextBest));
    }
  } catch {
    // Ignore storage quota or SecurityError in private browsing
  }

  return nextBest;
};
