import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STACK_CONFIG,
  formatTechLabel,
  fitLabelToBlock,
  extractTechLabels,
  getTechLabelForLevel,
  getAxisForLevel,
  computeSpeed,
  createSlidingBlock,
  stepSlidingBlock,
  computePlacement,
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  readBestScore,
  writeBestScore,
} from '../src/game/stack/logic/stackLogic.js';
import { parseLocation } from '../src/utils/router.js';
import { executeTerminalCommand } from '../src/utils/terminalCommands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Deploy Stack 3D Mini-Game Pure Logic & Routing Test Suite', () => {
  it('1. Calculates left, right, front, and back overhang cuts accurately', () => {
    const topBlock = { x: 0, y: 0, z: 0, width: 3.0, depth: 3.0 };

    // Right overhang (+X offset = +1.0)
    const rightMoving = { level: 1, axis: 'x', label: 'REACT', x: 1.0, y: 0.54, z: 0, width: 3.0, depth: 3.0 };
    const rightRes = computePlacement(rightMoving, topBlock, 0);
    assert.equal(rightRes.status, 'cut');
    assert.equal(rightRes.gameOver, false);
    assert.equal(rightRes.combo, 0);
    assert.ok(Math.abs(rightRes.placedBlock.width - 2.0) < 1e-6);
    assert.ok(Math.abs(rightRes.placedBlock.x - 0.5) < 1e-6);
    assert.ok(Math.abs(rightRes.overhangPiece.width - 1.0) < 1e-6);
    assert.ok(Math.abs(rightRes.overhangPiece.x - 2.0) < 1e-6);
    assert.equal(rightRes.overhangPiece.direction, 1);

    // Left overhang (-X offset = -0.8)
    const leftMoving = { level: 1, axis: 'x', label: 'REACT', x: -0.8, y: 0.54, z: 0, width: 3.0, depth: 3.0 };
    const leftRes = computePlacement(leftMoving, topBlock, 2);
    assert.equal(leftRes.status, 'cut');
    assert.equal(leftRes.combo, 0);
    assert.ok(Math.abs(leftRes.placedBlock.width - 2.2) < 1e-6);
    assert.ok(Math.abs(leftRes.placedBlock.x - -0.4) < 1e-6);
    assert.ok(Math.abs(leftRes.overhangPiece.width - 0.8) < 1e-6);
    assert.equal(leftRes.overhangPiece.direction, -1);

    // Front overhang (+Z offset = +1.2)
    const frontMoving = { level: 2, axis: 'z', label: 'NODE.JS', x: 0, y: 1.08, z: 1.2, width: 3.0, depth: 3.0 };
    const frontRes = computePlacement(frontMoving, topBlock, 0);
    assert.equal(frontRes.status, 'cut');
    assert.ok(Math.abs(frontRes.placedBlock.depth - 1.8) < 1e-6);
    assert.ok(Math.abs(frontRes.placedBlock.z - 0.6) < 1e-6);
    assert.ok(Math.abs(frontRes.overhangPiece.depth - 1.2) < 1e-6);
    assert.equal(frontRes.overhangPiece.direction, 1);

    // Back overhang (-Z offset = -0.6)
    const backMoving = { level: 2, axis: 'z', label: 'NODE.JS', x: 0, y: 1.08, z: -0.6, width: 3.0, depth: 3.0 };
    const backRes = computePlacement(backMoving, topBlock, 0);
    assert.equal(backRes.status, 'cut');
    assert.ok(Math.abs(backRes.placedBlock.depth - 2.4) < 1e-6);
    assert.ok(Math.abs(backRes.placedBlock.z - -0.3) < 1e-6);
    assert.ok(Math.abs(backRes.overhangPiece.depth - 0.6) < 1e-6);
    assert.equal(backRes.overhangPiece.direction, -1);
  });

  it('2. Handles perfect-drop tolerance, combo increments, and 5-combo widening cap', () => {
    const narrowedTop = { x: 0.2, y: 0, z: 0, width: 2.4, depth: 2.4 };
    const withinTol = {
      level: 1,
      axis: 'x',
      label: 'TYPESCRIPT',
      x: 0.2 + STACK_CONFIG.perfectTolerance * 0.8,
      y: 0.54,
      z: 0,
      width: 2.4,
      depth: 2.4,
    };

    // Combo 1..4: perfect drop snaps to topBlock center with no cut and no widen yet
    let combo = 0;
    for (let i = 1; i <= 4; i++) {
      const res = computePlacement(withinTol, narrowedTop, combo);
      assert.equal(res.status, 'perfect');
      assert.equal(res.isPerfect, true);
      assert.equal(res.overhangPiece, null);
      assert.equal(res.combo, i);
      assert.equal(res.widened, false);
      assert.equal(res.placedBlock.x, narrowedTop.x);
      assert.equal(res.placedBlock.width, 2.4);
      combo = res.combo;
    }

    // 5th consecutive perfect drop widens the block back by widenStep
    const fifthRes = computePlacement(withinTol, narrowedTop, 4);
    assert.equal(fifthRes.status, 'perfect');
    assert.equal(fifthRes.combo, 5);
    assert.equal(fifthRes.widened, true);
    assert.ok(Math.abs(fifthRes.placedBlock.width - (2.4 + STACK_CONFIG.widenStep)) < 1e-6);

    // Widening is strictly capped at STACK_CONFIG.initialWidth
    const nearFullTop = { x: 0, y: 0, z: 0, width: STACK_CONFIG.initialWidth - 0.05, depth: 3.2 };
    const nearFullMoving = { ...withinTol, x: 0.02, width: nearFullTop.width };
    const cappedRes = computePlacement(nearFullMoving, nearFullTop, 4);
    assert.equal(cappedRes.placedBlock.width, STACK_CONFIG.initialWidth);
  });

  it('3. Detects complete miss and returns game over', () => {
    const topBlock = { x: 0, y: 0, z: 0, width: 2.0, depth: 2.0 };
    const missedX = { level: 3, axis: 'x', label: 'VITE', x: 2.5, y: 1.62, z: 0, width: 2.0, depth: 2.0 };
    const res = computePlacement(missedX, topBlock, 3);
    assert.equal(res.status, 'miss');
    assert.equal(res.gameOver, true);
    assert.equal(res.combo, 0);
    assert.equal(res.placedBlock, null);
    assert.ok(res.overhangPiece);
  });

  it('4. Enforces speed curve cap, alternating axes, and frame-rate independent delta-time movement', () => {
    assert.equal(getAxisForLevel(1), 'x');
    assert.equal(getAxisForLevel(2), 'z');
    assert.equal(getAxisForLevel(3), 'x');

    const speed1 = computeSpeed(1);
    const speed10 = computeSpeed(10);
    const speed999 = computeSpeed(999);
    assert.equal(speed1, STACK_CONFIG.baseSpeed);
    assert.ok(speed10 > speed1);
    assert.equal(speed999, STACK_CONFIG.maxSpeed);

    // 60Hz (1 step of 1/60s) vs 120Hz (2 steps of 1/120s) must move the exact same distance
    const top = { x: 0, y: 0, z: 0, width: 3.2, depth: 3.2 };
    const startBlock = createSlidingBlock(1, top, ['REACT']);
    const at60Hz = stepSlidingBlock(startBlock, 1 / 60);
    const at120Hz = stepSlidingBlock(stepSlidingBlock(startBlock, 1 / 120), 1 / 120);
    assert.ok(Math.abs(at60Hz.x - at120Hz.x) < 1e-9);
  });

  it('5. Extracts, truncates, and cycles tech labels from src/data/skills.js and handles empty list safely', () => {
    const labels = extractTechLabels();
    assert.ok(labels.length >= 15);
    assert.ok(labels.includes('TypeScript'));
    assert.ok(labels.includes('React'));

    // Empty / invalid lists fall back safely to ['STACK']
    assert.deepEqual(extractTechLabels([]), ['STACK']);
    assert.deepEqual(extractTechLabels(null), ['STACK']);
    assert.equal(getTechLabelForLevel([], 0), 'STACK');

    // Truncates long names cleanly to fit block face
    const truncated = formatTechLabel('BullMQ Job Queues', 14);
    assert.ok(truncated.length <= 14);
    assert.ok(truncated.endsWith('…'));

    // Cycles deterministically in order
    const sample = ['React', 'TypeScript', 'Node.js'];
    assert.equal(getTechLabelForLevel(sample, 0), 'REACT');
    assert.equal(getTechLabelForLevel(sample, 1), 'TYPESCRIPT');
    assert.equal(getTechLabelForLevel(sample, 2), 'NODE.JS');
    assert.equal(getTechLabelForLevel(sample, 3), 'REACT');

    // Fits and scales/truncates label text to narrow block face widths without overflowing
    const fullFit = fitLabelToBlock('TypeScript', 3.2, 3.2);
    assert.equal(fullFit.text, 'TYPESCRIPT');
    assert.equal(fullFit.fontScale, 1);
    assert.equal(fullFit.rotate90, false);

    // Narrow block along both axes (1.2 x 1.2) truncates long label and scales font down
    const narrowSquare = fitLabelToBlock('Cloudflare Pages', 1.2, 1.2);
    assert.ok(narrowSquare.text.length <= narrowSquare.maxChars);
    assert.ok(narrowSquare.maxChars < STACK_CONFIG.maxLabelLength);
    assert.ok(narrowSquare.fontScale < 1 && narrowSquare.fontScale >= 0.42);

    // Rectangular block sliced narrow along X (width 0.8, depth 3.2) rotates text along longer Z axis
    const narrowRect = fitLabelToBlock('PostgreSQL', 0.8, 3.2);
    assert.equal(narrowRect.rotate90, true);
    assert.ok(narrowRect.text.length > 0);
    assert.ok(narrowRect.fontScale < 1);

    // Ultra-thin sliver (width 0.25, depth 0.25) hides text cleanly so it never overflows borders
    const sliver = fitLabelToBlock('TypeScript', 0.25, 0.25);
    assert.equal(sliver.text, '');
    assert.equal(sliver.fontScale, 0);
  });

  it('6. Enforces the 400ms input lock timing rule', () => {
    const lockUntil = createInputLockUntil(1000);
    assert.equal(lockUntil, 1400);

    assert.equal(isInputLocked(1000, lockUntil), true);
    assert.equal(isInputLocked(1250, lockUntil), true);
    assert.equal(isInputLocked(1399.9, lockUntil), true);
    assert.equal(isInputLocked(1400, lockUntil), false);
    assert.equal(isInputLocked(1600, lockUntil), false);
  });

  it('7. Validates localStorage best score values and handles blocked storage safely', () => {
    assert.equal(parseBestScore('42'), 42);
    assert.equal(parseBestScore(18), 18);
    assert.equal(parseBestScore('0'), 0);
    assert.equal(parseBestScore('-5'), 0);
    assert.equal(parseBestScore('3.14'), 0);
    assert.equal(parseBestScore('NaN'), 0);
    assert.equal(parseBestScore('{"hack":true}'), 0);
    assert.equal(parseBestScore(null), 0);
    assert.equal(parseBestScore(undefined), 0);

    // Mock storage
    const store = new Map();
    const mockStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
    };

    assert.equal(readBestScore(mockStorage), 0);
    assert.equal(writeBestScore(12, mockStorage), 12);
    assert.equal(readBestScore(mockStorage), 12);
    // Lower score does not overwrite higher best score
    assert.equal(writeBestScore(7, mockStorage), 12);
    assert.equal(readBestScore(mockStorage), 12);

    // Blocked storage that throws SecurityError must never crash
    const throwingStorage = {
      getItem: () => {
        throw new Error('SecurityError: localStorage disabled');
      },
      setItem: () => {
        throw new Error('SecurityError: localStorage disabled');
      },
    };
    assert.equal(readBestScore(throwingStorage), 0);
    assert.equal(writeBestScore(25, throwingStorage), 25);
  });

  it('8. Parses /play, /play/explore, /play/stack, /en variants, feature flags, and terminal subcommands', () => {
    assert.equal(parseLocation({ pathname: '/play' }).route.type, 'play');
    assert.equal(parseLocation({ pathname: '/en/play' }).route.type, 'play');
    assert.equal(parseLocation({ pathname: '/play/explore' }).route.type, 'play-explore');
    assert.equal(parseLocation({ pathname: '/en/play/explore' }).route.type, 'play-explore');
    assert.equal(parseLocation({ pathname: '/play/stack' }).route.type, 'play-stack');
    assert.equal(parseLocation({ pathname: '/en/play/stack' }).route.type, 'play-stack');

    // ENABLE_STACK_GAME = false disables /play/stack while keeping /play and /play/explore
    assert.equal(
      parseLocation({ pathname: '/play/stack' }, { enable3dGame: true, enableStackGame: false }).route.type,
      'not-found'
    );
    assert.equal(
      parseLocation({ pathname: '/play/explore' }, { enable3dGame: true, enableStackGame: false }).route.type,
      'play-explore'
    );

    // Master ENABLE_3D_GAME = false disables all /play* routes
    for (const p of ['/play', '/play/explore', '/play/stack', '/en/play', '/en/play/explore', '/en/play/stack']) {
      assert.equal(
        parseLocation({ pathname: p }, { enable3dGame: false, enableStackGame: true }).route.type,
        'not-found'
      );
    }

    // Terminal commands: play, play explore, play stack
    assert.equal(executeTerminalCommand('play').url, '/play');
    assert.equal(executeTerminalCommand('play explore').url, '/play/explore');
    assert.equal(executeTerminalCommand('play stack').url, '/play/stack');

    // Verify GameHub.jsx does NOT import three and createStackWorld has no tall foundation pillar
    const hubSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'hub', 'GameHub.jsx'), 'utf-8');
    assert.ok(!hubSource.includes("from 'three'"), 'GameHub.jsx must not import three.js');

    const stackWorldSource = fs.readFileSync(
      path.join(rootDir, 'src', 'game', 'stack', 'world', 'createStackWorld.js'),
      'utf-8'
    );
    assert.ok(!stackWorldSource.includes('foundationMesh'), 'Base block must be normal height without tall foundation pillar');
    assert.ok(stackWorldSource.includes('fitLabelToBlock'), 'Block top textures must fit label text to block width/depth');
  });
});
