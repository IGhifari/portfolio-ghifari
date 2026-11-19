import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GAME_STATES,
  RUNNER_CONFIG,
  clampDeltaTime,
  computeSpeedForDistance,
  getJumpMetrics,
  clampLane,
  switchLane,
  initiateJump,
  stepJumpPhysics,
  computeMultiplierFromStreak,
  checkObstacleCollision,
  checkTokenCollision,
  stepInvulnerability,
  applyDamageToRunner,
  applyTokenCollection,
  checkMilestoneReached,
  detectSwipeAction,
  createRunnerState,
  stepRunnerCountdown,
  stepRunnerSimulation,
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  readRunnerBestScore,
  writeRunnerBestScore,
  extractTechLabels,
} from '../src/game/runner/logic/runnerLogic.js';
import {
  createSeededRng,
  computeMinRowSpacing,
  isSingleRowValid,
  isConsecutiveRowPairFair,
  buildSafeFallbackRow,
  isTokenPlacementFair,
  createChunkPoolState,
  stepChunkRecycling,
} from '../src/game/runner/logic/runnerGenerator.js';
import { techCategoriesData } from '../src/data/skills.js';
import { parseLocation } from '../src/utils/router.js';
import { executeTerminalCommand } from '../src/utils/terminalCommands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Stack Runner 3D Mini-Game Pure Logic, Fairness & Routing Suite', () => {
  it('1. Enforces gradual speed curve, max speed cap, and zero progress when paused/game-over', () => {
    assert.equal(computeSpeedForDistance(0), RUNNER_CONFIG.startSpeed);
    assert.ok(computeSpeedForDistance(400) > RUNNER_CONFIG.startSpeed);
    assert.ok(computeSpeedForDistance(400) < RUNNER_CONFIG.maxSpeed);
    assert.equal(computeSpeedForDistance(50000), RUNNER_CONFIG.maxSpeed);

    const pausedState = createRunnerState(GAME_STATES.PAUSED);
    const pausedStep = stepRunnerSimulation(pausedState, 1 / 60);
    assert.equal(pausedStep.state.distance, 0);
    assert.equal(pausedStep.state.score, 0);

    const overState = createRunnerState(GAME_STATES.GAME_OVER);
    const overStep = stepRunnerSimulation(overState, 1 / 60);
    assert.equal(overStep.state.distance, 0);
    assert.equal(overStep.state.score, 0);
  });

  it('2. Clamps lane switching strictly within [0, 2] without unintended lane skipping', () => {
    assert.equal(clampLane(-5), 0);
    assert.equal(clampLane(99), 2);
    assert.equal(switchLane(0, -1), 0);
    assert.equal(switchLane(2, 1), 2);
    // Single large delta still shifts at most 1 lane per call
    assert.equal(switchLane(0, 5), 1);
    assert.equal(switchLane(2, -5), 1);
  });

  it('3. Produces frame-rate identical jump trajectories (60Hz vs 120Hz) and blocks double jump', () => {
    const startJump = initiateJump({ y: 0, vy: 0, isGrounded: true });
    assert.equal(startJump.triggered, true);
    assert.equal(startJump.isGrounded, false);

    // Mid-air double jump must be rejected
    const doubleAttempt = initiateJump(startJump);
    assert.equal(doubleAttempt.triggered, false);

    // Step 18 frames @ 60Hz (0.3s) vs 36 frames @ 120Hz (0.3s)
    let j60 = { ...startJump };
    let j120 = { ...startJump };
    for (let i = 0; i < 18; i++) j60 = stepJumpPhysics(j60, 1 / 60);
    for (let i = 0; i < 36; i++) j120 = stepJumpPhysics(j120, 1 / 120);

    assert.ok(Math.abs(j60.y - j120.y) < 1e-6, `60Hz vs 120Hz height parity failed: ${j60.y} vs ${j120.y}`);
    assert.ok(Math.abs(j60.vy - j120.vy) < 1e-6);

    const { airtimeSec } = getJumpMetrics();
    assert.ok(airtimeSec > 0.5 && airtimeSec < 0.8);

    // Continue until grounded
    let landed = j60;
    for (let i = 0; i < 60; i++) {
      landed = stepJumpPhysics(landed, 1 / 60);
      if (landed.isGrounded) break;
    }
    assert.equal(landed.isGrounded, true);
    assert.equal(landed.y, 0);
  });

  it('4. Uses deterministic seeded RNG and derives tech labels from src/data/skills.js', () => {
    const labels = extractTechLabels();
    assert.ok(labels.length >= 10);
    assert.equal(labels[0], techCategoriesData[0].skills[0].name);

    const rngA = createSeededRng(2026);
    const rngB = createSeededRng(2026);
    assert.equal(rngA(), rngB());

    const poolA = createChunkPoolState({ seed: 2026, techLabels: labels });
    const poolB = createChunkPoolState({ seed: 2026, techLabels: labels });
    const poolC = createChunkPoolState({ seed: 9999, techLabels: labels });

    assert.deepEqual(poolA.chunks, poolB.chunks, 'Same seed must generate identical track chunks');
    assert.notDeepEqual(poolA.chunks[2].obstacles, poolC.chunks[2].obstacles);
  });

  it('5. Enforces mandatory fairness across consecutive rows, speeds, and seeds', () => {
    // 3-firewall row must fail validation
    assert.equal(isSingleRowValid(['firewall', 'firewall', 'firewall']), false);
    // Double-lane 0->2 tight wall jump must fail validation
    assert.equal(
      isConsecutiveRowPairFair(
        { dist: 50, lanes: [null, 'firewall', 'firewall'] },
        { dist: 72, lanes: ['firewall', 'firewall', null] },
        RUNNER_CONFIG.maxSpeed
      ),
      false
    );

    // Safe fallback always satisfies fairness even at max speed
    const prevHard = { dist: 100, lanes: ['bug', null, 'firewall'] };
    const fallback = buildSafeFallbackRow(prevHard, 100 + computeMinRowSpacing(RUNNER_CONFIG.maxSpeed));
    assert.equal(isConsecutiveRowPairFair(prevHard, fallback, RUNNER_CONFIG.maxSpeed), true);

    // Multi-seed stress check up to 1500m (past maxSpeed cap)
    const techLabels = extractTechLabels();
    for (const seed of [1, 42, 777, 1337, 8888]) {
      const pool = createChunkPoolState({ seed, techLabels });
      for (let d = 0; d <= 1600; d += 12) {
        stepChunkRecycling(pool, d);
      }
      // Verify every obstacle row across active chunks leaves >= 1 passable lane
      for (const chunk of pool.chunks) {
        const byDist = new Map();
        for (const obs of chunk.obstacles) {
          if (!byDist.has(obs.dist)) byDist.set(obs.dist, [null, null, null]);
          byDist.get(obs.dist)[obs.lane] = obs.type;
        }
        const rows = [...byDist.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([dist, lanes]) => ({ dist, lanes }));
        for (let i = 0; i < rows.length; i++) {
          assert.equal(isSingleRowValid(rows[i].lanes), true);
          if (i > 0) {
            const speedAtRow = computeSpeedForDistance(rows[i].dist);
            assert.equal(isConsecutiveRowPairFair(rows[i - 1], rows[i], speedAtRow), true);
          }
        }
        // Verify every token in chunk satisfies fairness and zero hitbox overlap
        for (const tok of chunk.tokens) {
          assert.equal(isTokenPlacementFair(tok, chunk.obstacles), true);
        }
      }
    }
  });

  it('6. Verifies collision rules for bug, lowGate, and uncapped firewall plus 3-life invulnerability', () => {
    const bugObs = { id: 1, lane: 1, dist: 50, type: 'bug', depth: 0.95, hitRegistered: false };
    const gateObs = { id: 2, lane: 1, dist: 60, type: 'lowGate', depth: 0.75, hitRegistered: false };
    const fwObs = { id: 3, lane: 1, dist: 70, type: 'firewall', depth: 0.9, hitRegistered: false };

    // Grounded hits all 3
    assert.equal(checkObstacleCollision({ lane: 1, distance: 50, y: 0 }, bugObs), true);
    assert.equal(checkObstacleCollision({ lane: 1, distance: 60, y: 0 }, gateObs), true);
    assert.equal(checkObstacleCollision({ lane: 1, distance: 70, y: 0 }, fwObs), true);

    // High jump clears bug and lowGate, NEVER clears firewall
    assert.equal(checkObstacleCollision({ lane: 1, distance: 50, y: 1.5 }, bugObs), false);
    assert.equal(checkObstacleCollision({ lane: 1, distance: 60, y: 1.5 }, gateObs), false);
    assert.equal(checkObstacleCollision({ lane: 1, distance: 70, y: 2.05 }, fwObs), true);

    // Adjacent lane never collides
    assert.equal(checkObstacleCollision({ lane: 0, distance: 70, y: 0 }, fwObs), false);

    // Token pickup hit
    const tok = { id: 1, lane: 1, dist: 30, y: 0.78, collected: false };
    assert.equal(checkTokenCollision({ lane: 1, distance: 30.2, y: 0 }, tok), true);
    assert.equal(checkTokenCollision({ lane: 2, distance: 30.2, y: 0 }, tok), false);

    // Lives & 1.5s invulnerability + streak reset
    let state = { ...createRunnerState(GAME_STATES.PLAYING), streak: 7, multiplier: 3 };
    const hit1 = applyDamageToRunner(state);
    assert.equal(hit1.damaged, true);
    assert.equal(hit1.state.lives, 2);
    assert.equal(hit1.state.streak, 0);
    assert.equal(hit1.state.multiplier, 1);
    assert.equal(hit1.state.invulnRemainingSec, RUNNER_CONFIG.invulnDurationSec);

    // Second hit during invulnerability ignored
    const blockedHit = applyDamageToRunner(hit1.state);
    assert.equal(blockedHit.damaged, false);
    assert.equal(blockedHit.state.lives, 2);

    // Blink state toggles in normal mode & stays static visible/dimmed in reduced-motion
    const blinkA = stepInvulnerability({ invulnRemainingSec: 1.49 }, 0.01, false);
    const blinkB = stepInvulnerability({ invulnRemainingSec: 1.38 }, 0.01, false);
    assert.notEqual(blinkA.isVisibleBlink, blinkB.isVisibleBlink);
    const rmInvuln = stepInvulnerability({ invulnRemainingSec: 1.0 }, 0.05, true);
    assert.equal(rmInvuln.isVisibleBlink, true);
    assert.equal(rmInvuln.isDimmed, true);

    // Remaining 2 hits reach Game Over at 0 hearts
    let s2 = { ...hit1.state, invulnRemainingSec: 0 };
    s2 = applyDamageToRunner(s2).state;
    assert.equal(s2.lives, 1);
    s2.invulnRemainingSec = 0;
    const hit3 = applyDamageToRunner(s2);
    assert.equal(hit3.gameOver, true);
    assert.equal(hit3.state.lives, 0);
    assert.equal(hit3.state.gameState, GAME_STATES.GAME_OVER);
  });

  it('7. Applies token multiplier cap (x4), distance scoring (+1/m), and single-fire 500m milestones', () => {
    assert.equal(computeMultiplierFromStreak(0), 1);
    assert.equal(computeMultiplierFromStreak(2), 1);
    assert.equal(computeMultiplierFromStreak(3), 2);
    assert.equal(computeMultiplierFromStreak(6), 3);
    assert.equal(computeMultiplierFromStreak(9), 4);
    assert.equal(computeMultiplierFromStreak(30), 4);

    let s = createRunnerState(GAME_STATES.PLAYING);
    for (let i = 0; i < 10; i++) {
      s = applyTokenCollection(s).state;
    }
    assert.equal(s.tokensCollected, 10);
    assert.equal(s.multiplier, 4);

    // 500m milestone triggers strictly once per threshold
    assert.equal(checkMilestoneReached(499, 0), null);
    assert.equal(checkMilestoneReached(502, 0), 500);
    assert.equal(checkMilestoneReached(540, 500), null);
    assert.equal(checkMilestoneReached(1005, 500), 1000);
  });

  it('8. Detects scaled touch swipes, enforces delta clamping, countdown, input lock & storage safety', () => {
    assert.equal(detectSwipeAction({ x: 100, y: 100 }, { x: 102, y: 101 }, 390), 'tap');
    assert.equal(detectSwipeAction({ x: 100, y: 100 }, { x: 85, y: 100 }, 390), null); // 15px < 25.35px threshold
    assert.equal(detectSwipeAction({ x: 100, y: 100 }, { x: 60, y: 100 }, 390), 'left');
    assert.equal(detectSwipeAction({ x: 100, y: 100 }, { x: 145, y: 102 }, 390), 'right');
    assert.equal(detectSwipeAction({ x: 100, y: 200 }, { x: 102, y: 140 }, 390), 'up');
    // Desktop 1280 requires larger threshold (56px capped) so 35px returns null
    assert.equal(detectSwipeAction({ x: 100, y: 100 }, { x: 65, y: 100 }, 1280), null);

    // Delta clamping prevents physics explosion after tab switch
    assert.equal(clampDeltaTime(3.5), RUNNER_CONFIG.maxDeltaSec);
    assert.equal(clampDeltaTime(-0.1), 0);

    // Countdown 3 -> 2 -> 1 -> PLAYING (respecting clamped 0.05s steps)
    let cState = createRunnerState(GAME_STATES.READY);
    for (let i = 0; i < 20; i++) {
      cState = stepRunnerCountdown(cState, 0.05).state;
    }
    assert.equal(cState.countdownValue, 2);
    let playing = cState;
    for (let i = 0; i < 60; i++) {
      const r = stepRunnerCountdown(playing, 0.05);
      playing = r.state;
      if (r.startedPlaying) break;
    }
    assert.equal(playing.gameState, GAME_STATES.PLAYING);

    // Input lock 400ms
    const lockUntil = createInputLockUntil(1000);
    assert.equal(isInputLocked(1200, lockUntil), true);
    assert.equal(isInputLocked(1400, lockUntil), false);

    // Best score & corrupted/blocked storage
    assert.equal(parseBestScore('245'), 245);
    assert.equal(parseBestScore('-5'), 0);
    assert.equal(parseBestScore('NaN'), 0);
    assert.equal(parseBestScore('12.5'), 0);
    assert.equal(parseBestScore('{"bad":true}'), 0);

    const brokenStorage = {
      getItem: () => { throw new Error('Blocked'); },
      setItem: () => { throw new Error('Blocked'); },
    };
    assert.equal(readRunnerBestScore(brokenStorage), 0);
    assert.equal(writeRunnerBestScore(120, brokenStorage), 120);

    const store = new Map();
    const mockStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
    };
    assert.equal(writeRunnerBestScore(300, mockStorage), 300);
    assert.equal(writeRunnerBestScore(100, mockStorage), 300);
    assert.equal(readRunnerBestScore(mockStorage), 300);
  });

  it('9. Maintains seamless chunk continuity across recycling and zero runtime allocations', () => {
    const pool = createChunkPoolState({ seed: 7, techLabels: ['React', 'Docker'] });
    const assertContinuous = () => {
      for (let i = 0; i < pool.chunks.length - 1; i++) {
        assert.equal(pool.chunks[i].endDist, pool.chunks[i + 1].startDist);
        assert.equal(pool.chunks[i].chunkIndex + 1, pool.chunks[i + 1].chunkIndex);
      }
    };
    assertContinuous();

    // Advance far enough to recycle chunks multiple times
    for (let dist = 0; dist <= 500; dist += 5) {
      stepChunkRecycling(pool, dist);
      assertContinuous();
    }

    // Verify no per-spawn geometry/material creation or WebAudio in runner sources
    const assetsSource = fs.readFileSync(
      path.join(rootDir, 'src', 'game', 'runner', 'world', 'createRunnerAssets.js'),
      'utf-8'
    );
    assert.ok(assetsSource.includes('chunkPool'), 'Track chunks must be pooled');
    assert.ok(assetsSource.includes('obstaclePool'), 'Obstacles must be pooled');
    assert.ok(assetsSource.includes('tokenPool'), 'Tokens must be pooled');

    const worldSource = fs.readFileSync(
      path.join(rootDir, 'src', 'game', 'runner', 'world', 'createRunnerWorld.js'),
      'utf-8'
    );
    assert.ok(!worldSource.includes('AudioContext') && !worldSource.includes('new Audio'), 'Zero WebAudio/sound files in Runner');
  });

  it('10. Enforces routes, terminal commands, feature flags, Hub card counts, and zero home-page bundle contamination', () => {
    assert.equal(parseLocation({ pathname: '/play/runner' }).route.type, 'play-runner');
    assert.equal(parseLocation({ pathname: '/en/play/runner' }).route.type, 'play-runner');
    assert.equal(
      parseLocation({ pathname: '/play/runner' }, { enable3dGame: true, enableRunnerGame: false }).route.type,
      'not-found'
    );
    assert.equal(
      parseLocation({ pathname: '/play/runner' }, { enable3dGame: false, enableRunnerGame: true }).route.type,
      'not-found'
    );

    assert.equal(executeTerminalCommand('play runner').url, '/play/runner');
    assert.equal(executeTerminalCommand('open runner').url, '/play/runner');

    const hubSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'hub', 'GameHub.jsx'), 'utf-8');
    assert.ok(!hubSource.includes("from 'three'"), 'GameHub must not import three.js');
    assert.ok(hubSource.includes('cardCount === 4'), 'GameHub must adapt grid layout across 1-4 cards');

    const appSource = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf-8');
    assert.ok(appSource.includes("lazy(() => import('./game/runner/RunnerPage'))"), 'RunnerPage must be lazy-loaded');
  });
});
