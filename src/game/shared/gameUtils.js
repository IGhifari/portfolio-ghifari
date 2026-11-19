/**
 * Shared pure utilities for 3D mini-games (/play/stack, /play/bugs, /play/runner):
 * - 400ms input lock timing rule
 * - Safe localStorage best-score validation, reading, and writing
 * - Technology label extraction from src/data/skills.js
 * Zero Three.js or DOM imports — 100% Node-testable.
 */

import { techCategoriesData } from '../../data/skills.js';

export const DEFAULT_INPUT_LOCK_MS = 400;

/**
 * Pure 400ms input lock helpers to prevent accidental actions after game over or unpause.
 */
export const createInputLockUntil = (nowMs, durationMs = DEFAULT_INPUT_LOCK_MS) =>
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
export const readBestScoreByKey = (key, storage) => {
  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined'
        ? window.localStorage
        : null;
    if (!targetStorage || typeof targetStorage.getItem !== 'function' || !key) {
      return 0;
    }
    return parseBestScore(targetStorage.getItem(key));
  } catch {
    return 0;
  }
};

/**
 * Safely writes a new best score if it exceeds the stored best score for `key`.
 */
export const writeBestScoreByKey = (key, score, storage) => {
  const validScore = parseBestScore(score);
  const currentBest = readBestScoreByKey(key, storage);
  const nextBest = Math.max(currentBest, validScore);

  try {
    const targetStorage =
      storage !== undefined
        ? storage
        : typeof window !== 'undefined'
        ? window.localStorage
        : null;
    if (
      targetStorage &&
      typeof targetStorage.setItem === 'function' &&
      key &&
      nextBest > currentBest
    ) {
      targetStorage.setItem(key, String(nextBest));
    }
  } catch {
    // Ignore storage quota or SecurityError in private browsing
  }

  return nextBest;
};

/**
 * Truncates and normalizes a technology label to fit cleanly on a 3D face/badge.
 */
export const formatTechLabel = (name, maxLen = 14) => {
  if (typeof name !== 'string') return 'STACK';
  const trimmed = name.trim();
  if (!trimmed) return 'STACK';
  const upper = trimmed.toUpperCase();
  if (upper.length <= maxLen) return upper;
  if (maxLen <= 1) return upper.slice(0, 1);
  return `${upper.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
};

/**
 * Extracts an ordered list of unique technology names from `techCategoriesData` (`src/data/skills.js`).
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
