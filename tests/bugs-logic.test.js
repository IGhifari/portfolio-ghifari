import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BUGS_CONFIG,
  BUG_TYPES,
  computeBossHp,
  computeWaveConfig,
  pickBugType,
  computeEdgeSpawnPosition,
  canSpawnBug,
  createBugEntity,
  stepBugMovement,
  computeComboBonus,
  applyBugHit,
  applyServerDamage,
  applyServerHeal,
  selectTargetBug,
  createWaveState,
  stepWaveState,
  createInputLockUntil,
  isInputLocked,
  parseBestScore,
  readBugsBestScore,
  writeBugsBestScore,
} from '../src/game/bugs/logic/bugsLogic.js';
import { parseLocation } from '../src/utils/router.js';
import { executeTerminalCommand } from '../src/utils/terminalCommands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Deterministic Linear Congruential Generator for seeded RNG tests
const createSeededRng = (seed = 42) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe('Bug Hunter 3D Mini-Game Pure Logic & Routing Test Suite', () => {
  it('1. Enforces difficulty curve caps and Boss every 5th wave with HP scaling', () => {
    const w1 = computeWaveConfig(1);
    const w5 = computeWaveConfig(5);
    const w10 = computeWaveConfig(10);
    const w100 = computeWaveConfig(100);

    assert.equal(w1.isBossWave, false);
    assert.equal(w1.bossHp, 0);

    assert.equal(w5.isBossWave, true);
    assert.equal(w5.bossHp, 15);
    assert.equal(computeBossHp(5), 15);

    assert.equal(w10.isBossWave, true);
    assert.equal(w10.bossHp, 19);
    assert.equal(computeBossHp(15), 23);

    // Caps hold at high waves
    assert.equal(w100.totalRegularBugs, 26);
    assert.equal(w100.spawnIntervalSec, 0.42);
    assert.equal(w100.speedMultiplier, 1.75);
  });

  it('2. Places spawns strictly on the arena edge and selects bug types deterministically with seeded RNG', () => {
    for (const deg of [0, 45, 90, 180, 270, 315]) {
      const rad = (deg * Math.PI) / 180;
      const pos = computeEdgeSpawnPosition(rad, BUGS_CONFIG.arenaRadius);
      const dist = Math.hypot(pos.x, pos.z);
      assert.ok(
        Math.abs(dist - BUGS_CONFIG.arenaRadius) < 1e-9,
        `Spawn at ${deg} deg must lie on arenaRadius (${BUGS_CONFIG.arenaRadius})`
      );
    }

    const rngA = createSeededRng(1337);
    const rngB = createSeededRng(1337);
    const seqA = Array.from({ length: 12 }, () => pickBugType(6, rngA));
    const seqB = Array.from({ length: 12 }, () => pickBugType(6, rngB));
    assert.deepEqual(seqA, seqB, 'Identical RNG seeds must produce identical bug type sequences');
    assert.ok(seqA.includes('crawler') && (seqA.includes('sprinter') || seqA.includes('tank')));
  });

  it('3. Integrates delta-time movement toward the server in expected time across frame rates', () => {
    const bug60 = createBugEntity({ id: 1, type: 'crawler', wave: 1, angleRad: 0 });
    const bug120 = createBugEntity({ id: 2, type: 'crawler', wave: 1, angleRad: 0 });

    const travelDistance = BUGS_CONFIG.arenaRadius - BUGS_CONFIG.serverRadius;
    const expectedTimeSec = travelDistance / bug60.speed;

    // Step for half the expected time at 60Hz vs 120Hz
    let b60 = bug60;
    let b120 = bug120;
    for (let i = 0; i < 60; i++) b60 = stepBugMovement(b60, 1 / 60);
    for (let i = 0; i < 120; i++) b120 = stepBugMovement(b120, 1 / 120);
    assert.ok(Math.abs(b60.distToServer - b120.distToServer) < 1e-9);
    assert.equal(b60.reachedServer, false);

    // Step across full expected travel time -> reaches server
    let runner = bug60;
    let elapsed = 0;
    const dt = 0.05;
    while (!runner.reachedServer && elapsed < expectedTimeSec + 1) {
      runner = stepBugMovement(runner, dt);
      elapsed += dt;
    }
    assert.equal(runner.reachedServer, true);
    assert.ok(Math.abs(elapsed - expectedTimeSec) <= dt * 1.1);
  });

  it('4. Enforces damage, multi-hit Tank, Boss 2-HP server damage, and Boss kill heal capped at max HP', () => {
    // Crawler: 1 hit kills
    const crawler = createBugEntity({ id: 1, type: 'crawler', wave: 1, angleRad: 0 });
    const hitCrawler = applyBugHit(crawler, 1000, { combo: 0, lastKillMs: -Infinity });
    assert.equal(hitCrawler.killed, true);
    assert.equal(hitCrawler.scoreDelta, 1);

    // Tank: 3 hits required
    let tank = createBugEntity({ id: 2, type: 'tank', wave: 3, angleRad: 0 });
    assert.equal(tank.hp, 3);
    const tankHit1 = applyBugHit(tank, 1100, hitCrawler.comboState);
    assert.equal(tankHit1.killed, false);
    assert.equal(tankHit1.bug.hp, 2);

    const tankHit2 = applyBugHit(tankHit1.bug, 1200, tankHit1.comboState);
    assert.equal(tankHit2.killed, false);
    assert.equal(tankHit2.bug.hp, 1);

    const tankHit3 = applyBugHit(tankHit2.bug, 1300, tankHit2.comboState);
    assert.equal(tankHit3.killed, true);
    assert.equal(tankHit3.bug.hp, 0);
    assert.equal(tankHit3.scoreDelta, BUG_TYPES.tank.baseScore);

    // Boss: 15 hits at wave 5, heals server +1 on kill (capped at maxServerHp = 5)
    let boss = createBugEntity({ id: 3, type: 'boss', wave: 5, angleRad: 0 });
    assert.equal(boss.hp, 15);
    let comboState = { combo: 0, lastKillMs: -Infinity };
    let bossRes = null;
    for (let i = 0; i < 15; i++) {
      bossRes = applyBugHit(boss, 2000 + i * 50, comboState);
      boss = bossRes.bug;
      comboState = bossRes.comboState;
    }
    assert.equal(bossRes.killed, true);
    assert.equal(bossRes.serverHeal, 1);
    assert.equal(applyServerHeal(4, bossRes.serverHeal), 5);
    assert.equal(applyServerHeal(5, bossRes.serverHeal), 5, 'Heal must cap at maxServerHp (5)');

    // Server damage rules: normal/tank = 1 HP, boss = 2 HP
    assert.deepEqual(applyServerDamage(5, 'crawler'), { hp: 4, damage: 1, gameOver: false });
    assert.deepEqual(applyServerDamage(5, 'tank'), { hp: 4, damage: 1, gameOver: false });
    assert.deepEqual(applyServerDamage(5, 'boss'), { hp: 3, damage: 2, gameOver: false });
    assert.deepEqual(applyServerDamage(2, 'boss'), { hp: 0, damage: 2, gameOver: true });
  });

  it('5. Applies explicit combo bonus formula (+1 per 5 combo, capped at +5) and 1500ms window', () => {
    assert.equal(computeComboBonus(0), 0);
    assert.equal(computeComboBonus(4), 0);
    assert.equal(computeComboBonus(5), 1);
    assert.equal(computeComboBonus(9), 1);
    assert.equal(computeComboBonus(10), 2);
    assert.equal(computeComboBonus(25), 5);
    assert.equal(computeComboBonus(99), 5);

    let state = { combo: 4, lastKillMs: 1000 };
    const bugA = createBugEntity({ id: 10, type: 'crawler', wave: 1, angleRad: 0 });
    // Kill within 1500ms -> combo becomes 5 -> +1 combo bonus (total scoreDelta = 1 + 1 = 2)
    const resWithin = applyBugHit(bugA, 2200, state);
    assert.equal(resWithin.comboState.combo, 5);
    assert.equal(resWithin.comboBonus, 1);
    assert.equal(resWithin.scoreDelta, 2);

    // Kill after > 1500ms -> combo resets to 1 -> +0 combo bonus
    const bugB = createBugEntity({ id: 11, type: 'crawler', wave: 1, angleRad: 0 });
    const resExpired = applyBugHit(bugB, 4000, resWithin.comboState);
    assert.equal(resExpired.comboState.combo, 1);
    assert.equal(resExpired.comboBonus, 0);
    assert.equal(resExpired.scoreDelta, 1);
  });

  it('6. Reserves 1 slot for Boss and a separate budget for Boss minions so they are never blocked by the regular cap', () => {
    // Fill all 17 regular bug slots
    const fullRegular = Array.from({ length: BUGS_CONFIG.maxRegularAlive }, (_, i) => ({
      id: i + 1,
      type: 'crawler',
      isMinion: false,
    }));

    // Regular spawn is now blocked at 17
    assert.equal(canSpawnBug(fullRegular, 'regular'), false);

    // Boss is NOT blocked when regular cap (17) is full
    assert.equal(canSpawnBug(fullRegular, 'boss'), true);

    // Boss-spawned crawler minions are NOT blocked when regular cap (17) + Boss (1) = 18 are alive
    const withBoss = [...fullRegular, { id: 99, type: 'boss', isMinion: false }];
    assert.equal(canSpawnBug(withBoss, 'boss'), false, 'Only 1 Boss alive at once');
    assert.equal(canSpawnBug(withBoss, 'minion'), true, 'Minion uses separate 6-slot budget');

    // Fill all 6 minion slots -> minion budget reaches cap (6)
    const fullMinions = Array.from({ length: BUGS_CONFIG.maxBossMinionsAlive }, (_, i) => ({
      id: 200 + i,
      type: 'crawler',
      isMinion: true,
    }));
    assert.equal(canSpawnBug([...withBoss, ...fullMinions], 'minion'), false);
    // And minions never block regular spawns when regular count < 17
    assert.equal(canSpawnBug(fullMinions, 'regular'), true);
  });

  it('7. Completes waves with 1.5s rest between waves and guarantees a stalled wave is impossible', () => {
    const rng = createSeededRng(99);
    let nextId = 1;

    // Simulate Wave 5 (Boss wave) even when arena starts full of regular bugs
    let waveState = createWaveState(5);
    let activeBugs = Array.from({ length: BUGS_CONFIG.maxRegularAlive }, (_, i) =>
      createBugEntity({ id: nextId++, type: 'crawler', wave: 5, angleRad: i * 0.3 })
    );

    // Step 1: even though regular cap (17) is full, Boss immediately spawns into its reserved slot!
    const step1 = stepWaveState(waveState, activeBugs, 0.05, rng, () => nextId++);
    waveState = step1.waveState;
    activeBugs.push(...step1.newlySpawned);
    assert.equal(waveState.bossSpawned, true, 'Boss must spawn even when regular slots are full');
    assert.ok(activeBugs.some((b) => b.type === 'boss'));

    // Simulate players killing / clearing bugs until all scheduled wave 5 bugs spawn and die
    let safetyTicks = 0;
    let waveClearedTriggered = false;
    while (waveState.status !== 'resting' && safetyTicks < 500) {
      safetyTicks += 1;
      // Remove 1 active bug every few ticks to simulate kills/impacts
      if (activeBugs.length > 0 && safetyTicks % 2 === 0) {
        activeBugs.shift();
      }
      const res = stepWaveState(waveState, activeBugs, 0.25, rng, () => nextId++);
      waveState = res.waveState;
      activeBugs.push(...res.newlySpawned);
      if (res.waveCleared) waveClearedTriggered = true;
    }

    assert.equal(waveClearedTriggered, true, 'Wave 5 must complete without stalling');
    assert.equal(waveState.status, 'resting');
    assert.equal(waveState.restTimerSec, BUGS_CONFIG.restDurationSec);

    // Step through the 1.5s rest period -> transitions cleanly to Wave 6
    const duringRest = stepWaveState(waveState, [], 0.08, rng, () => nextId++);
    assert.equal(duringRest.waveState.status, 'resting');

    let restState = waveState;
    for (let i = 0; i < 20; i++) {
      const rStep = stepWaveState(restState, [], 0.1, rng, () => nextId++);
      restState = rStep.waveState;
      if (rStep.startedNewWave) break;
    }
    assert.equal(restState.wave, 6);
    assert.equal(restState.status, 'spawning');
  });

  it('8. Resolves overlapping hitboxes by closest projected center to pointer, breaking ties by closest to server', () => {
    const candidates = [
      { id: 'farFromPointer', screenX: 118, screenY: 100, hitRadiusPx: 26, distToServer: 2.0 },
      { id: 'closeToPointer', screenX: 104, screenY: 100, hitRadiusPx: 26, distToServer: 5.0 },
    ];
    // Both hitboxes overlap pointer (100, 100), but 'closeToPointer' is 4px away vs 18px
    const picked = selectTargetBug({ x: 100, y: 100 }, candidates);
    assert.equal(picked?.id, 'closeToPointer');

    // Exact screen-distance tie: picks the bug nearest the server
    const tiedCandidates = [
      { id: 'outerBug', screenX: 105, screenY: 100, hitRadiusPx: 26, distToServer: 4.5 },
      { id: 'innerBug', screenX: 95, screenY: 100, hitRadiusPx: 26, distToServer: 2.1 },
    ];
    const tiePicked = selectTargetBug({ x: 100, y: 100 }, tiedCandidates);
    assert.equal(tiePicked?.id, 'innerBug');

    // Click outside all hitboxes returns null
    assert.equal(selectTargetBug({ x: 500, y: 500 }, candidates), null);
  });

  it('9. Validates 400ms input lock, localStorage best score, /play/bugs routes, and shared helpers', () => {
    const lockUntil = createInputLockUntil(2000);
    assert.equal(lockUntil, 2400);
    assert.equal(isInputLocked(2200, lockUntil), true);
    assert.equal(isInputLocked(2400, lockUntil), false);

    assert.equal(parseBestScore('55'), 55);
    assert.equal(parseBestScore('-8'), 0);
    assert.equal(parseBestScore('invalid'), 0);

    const store = new Map();
    const mockStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
    };
    assert.equal(readBugsBestScore(mockStorage), 0);
    assert.equal(writeBugsBestScore(34, mockStorage), 34);
    assert.equal(readBugsBestScore(mockStorage), 34);
    assert.equal(writeBugsBestScore(12, mockStorage), 34);

    // Routing for /play/bugs and /en/play/bugs
    assert.equal(parseLocation({ pathname: '/play/bugs' }).route.type, 'play-bugs');
    assert.equal(parseLocation({ pathname: '/en/play/bugs' }).route.type, 'play-bugs');
    assert.equal(
      parseLocation({ pathname: '/play/bugs' }, { enable3dGame: true, enableBugGame: false }).route.type,
      'not-found'
    );
    assert.equal(
      parseLocation({ pathname: '/play/bugs' }, { enable3dGame: false, enableBugGame: true }).route.type,
      'not-found'
    );

    // Terminal commands: play bugs, open bugs
    assert.equal(executeTerminalCommand('play bugs').url, '/play/bugs');
    assert.equal(executeTerminalCommand('open bugs').url, '/play/bugs');

    // GameHub remains free of three.js imports
    const hubSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'hub', 'GameHub.jsx'), 'utf-8');
    assert.ok(!hubSource.includes("from 'three'"), 'GameHub.jsx must not import three.js');
  });

  it('10. Confirms polish pass: enlarged readable bug scales, thinned arena ring, and sound muted by default', async () => {
    // 1. Bug scales ~30% larger, sprinters smaller than crawlers
    assert.equal(BUG_TYPES.crawler.scale, 1.3);
    assert.equal(BUG_TYPES.sprinter.scale, 1.02);
    assert.equal(BUG_TYPES.tank.scale, 1.74);
    assert.equal(BUG_TYPES.boss.scale, 2.65);
    assert.ok(
      BUG_TYPES.sprinter.scale < BUG_TYPES.crawler.scale,
      'Sprinters must remain smaller than crawlers'
    );
    assert.ok(
      BUG_TYPES.sprinter.scale >= 1.0,
      'Sprinters must be >= 1.0 scale to remain readable on 390px screens'
    );

    // 2. Thinned and dimmed arena ring in createBugsWorld.js
    const worldSource = fs.readFileSync(
      path.join(rootDir, 'src', 'game', 'bugs', 'world', 'createBugsWorld.js'),
      'utf-8'
    );
    assert.ok(
      worldSource.includes('BUGS_CONFIG.arenaRadius - 0.025, BUGS_CONFIG.arenaRadius + 0.025'),
      'Arena ring must be thin (0.05 total width)'
    );
    assert.ok(
      worldSource.includes('opacity: 0.4'),
      'Arena ring must be dimmed with subtle opacity'
    );
    assert.ok(
      worldSource.includes('antennaGeo'),
      'Bug pool must include low-poly antennae for readability'
    );

    // 3. 5-second fadeout for bottom hint in BugsHUD.jsx
    const hudSource = fs.readFileSync(
      path.join(rootDir, 'src', 'game', 'bugs', 'ui', 'BugsHUD.jsx'),
      'utf-8'
    );
    assert.ok(
      hudSource.includes('5000'),
      'Controls hint must fade out after 5000ms'
    );
    assert.ok(
      hudSource.includes('reducedMotion') &&
        hudSource.includes("hintVisible ? 'opacity-100' : 'opacity-0'") &&
        hudSource.includes('transition-opacity duration-700'),
      'Reduced motion must hide hint without CSS transition animation'
    );

    // 4. Default sound state verification: muted by default on first load
    const { getSharedAudioSnapshot } = await import('../src/hooks/useAudioPlayer.js');
    const audioSnapshot = getSharedAudioSnapshot();
    assert.equal(audioSnapshot.isPlaying, false, 'Audio player MUST be muted (isPlaying: false) on initial load');
    assert.equal(
      audioSnapshot.hasAudioElement,
      false,
      'No Audio element may be allocated prior to explicit user unmuting'
    );
  });
});
