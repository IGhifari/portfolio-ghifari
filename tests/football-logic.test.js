import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WORLD_BOUNDS,
  PLAYER_CONFIG,
  BUILDINGS,
  FOOTBALL_FIELD,
  getWorldColliders,
} from '../src/game/logic/worldConfig.js';
import {
  FOOTBALL_PHYSICS,
  createFootballState,
  resetFootballPosition,
  isPlayerInFootballZone,
  canPlayerKickBall,
  kickFootball,
  stepFootball,
} from '../src/game/logic/footballPhysics.js';

describe('Explore Football Pitch & Ball Physics Suite', () => {
  it('1. Spawns ball at center of East Football Field completely clear of buildings and bounds', () => {
    const ball = createFootballState(FOOTBALL_FIELD);
    assert.equal(ball.x, FOOTBALL_FIELD.centerX);
    assert.equal(ball.z, FOOTBALL_FIELD.centerZ);
    assert.equal(ball.y, FOOTBALL_PHYSICS.ballRadius);
    assert.equal(ball.score, 0);
    assert.equal(ball.goalResetTimer, 0);

    // Pitch stays safely inside expanded 72x54 world bounds
    assert.ok(FOOTBALL_FIELD.minX - FOOTBALL_FIELD.goalDepth > WORLD_BOUNDS.minX);
    assert.ok(FOOTBALL_FIELD.maxX + FOOTBALL_FIELD.goalDepth < WORLD_BOUNDS.maxX);
    assert.ok(FOOTBALL_FIELD.minZ > WORLD_BOUNDS.minZ);
    assert.ok(FOOTBALL_FIELD.maxZ < WORLD_BOUNDS.maxZ);

    // Pitch leaves comfortable clearance from all portfolio buildings and spawn (0, 0)
    assert.ok(FOOTBALL_FIELD.minX > PLAYER_CONFIG.startX + 4);
    for (const b of BUILDINGS) {
      const clearX =
        b.x + b.halfW < FOOTBALL_FIELD.minX - 1 ||
        b.x - b.halfW > FOOTBALL_FIELD.maxX + 1;
      const clearZ =
        b.z + b.halfD < FOOTBALL_FIELD.minZ - 1 ||
        b.z - b.halfD > FOOTBALL_FIELD.maxZ + 1;
      assert.ok(clearX || clearZ, `Building ${b.id} must not overlap the football pitch`);
    }
  });

  it('2. Detects player zone entry cleanly for scoped Football HUD', () => {
    assert.equal(isPlayerInFootballZone({ x: 0, z: 0 }), false);
    assert.equal(isPlayerInFootballZone({ x: FOOTBALL_FIELD.centerX, z: FOOTBALL_FIELD.centerZ }), true);
    assert.equal(isPlayerInFootballZone({ x: FOOTBALL_FIELD.minX - 1, z: FOOTBALL_FIELD.centerZ }), true);
    assert.equal(isPlayerInFootballZone(null), false);
  });

  it('3. Enforces kick range and cooldown and applies forward velocity + subtle hop on kick', () => {
    const ball = createFootballState();
    const farPlayer = { x: 0, z: 0, angle: Math.PI / 2, isMoving: false };
    assert.equal(canPlayerKickBall(farPlayer, ball, 1000), false);
    assert.equal(kickFootball(ball, farPlayer, 1000).kicked, false);

    // Player directly west of the ball facing east (+X, angle = Math.PI / 2)
    const striker = { x: ball.x - 1.1, z: ball.z, angle: Math.PI / 2, isMoving: true };
    assert.equal(canPlayerKickBall(striker, ball, 1000), true);

    const firstKick = kickFootball(ball, striker, 1000);
    assert.equal(firstKick.kicked, true);
    assert.ok(firstKick.ball.vx > 10, `Expected strong +X kick velocity, got ${firstKick.ball.vx}`);
    assert.ok(Math.abs(firstKick.ball.vz) < 0.05);
    assert.equal(firstKick.ball.vy, FOOTBALL_PHYSICS.kickLiftVel);

    // Cooldown prevents instant double-trigger spam
    const spamKick = kickFootball(firstKick.ball, striker, 1050);
    assert.equal(spamKick.kicked, false);
  });

  it('4. Decelerates rolling ball smoothly via exponential friction until resting', () => {
    let ball = {
      ...createFootballState(),
      vx: 10,
      vz: 0,
      vy: 2.5,
    };

    for (let i = 0; i < 180; i++) {
      ball = stepFootball(ball, null, 1 / 60).ball;
    }

    assert.equal(ball.vx, 0);
    assert.equal(ball.vz, 0);
    assert.equal(ball.vy, 0);
    assert.equal(ball.y, FOOTBALL_PHYSICS.ballRadius);
    assert.ok(ball.spinAngle > 0);
  });

  it('5. Applies gentle dribble contact push when player walks into stationary ball', () => {
    const ball = createFootballState();
    const runner = {
      x: ball.x - 0.5,
      z: ball.z,
      angle: Math.PI / 2,
      isMoving: true,
    };
    const res = stepFootball(ball, runner, 1 / 60);
    assert.ok(res.ball.x > ball.x, 'Dribbling contact must nudge ball forward');
    assert.ok(res.ball.vx >= FOOTBALL_PHYSICS.dribblePushSpeed * 0.9);
  });

  it('6. Scores Right Goal, blocks double-scoring during celebration, and auto-resets ball after delay', () => {
    let ball = {
      ...createFootballState(),
      x: FOOTBALL_FIELD.maxX - 0.1,
      z: FOOTBALL_FIELD.centerZ,
      vx: 14,
      vz: 0,
    };

    const goalStep = stepFootball(ball, null, 0.04);
    assert.equal(goalStep.scoredSide, 'right');
    assert.equal(goalStep.ball.score, 1);
    assert.equal(goalStep.ball.goalResetTimer, FOOTBALL_PHYSICS.goalResetDelaySec);
    assert.equal(goalStep.didReset, false);

    // Stepping during countdown must NOT increment score a second time
    ball = goalStep.ball;
    let didReset = false;
    for (let i = 0; i < 40; i++) {
      const next = stepFootball(ball, null, 0.05);
      assert.equal(next.scoredSide, null);
      ball = next.ball;
      if (next.didReset) {
        didReset = true;
        break;
      }
    }

    assert.equal(didReset, true);
    assert.equal(ball.score, 1);
    assert.equal(ball.x, FOOTBALL_FIELD.centerX);
    assert.equal(ball.z, FOOTBALL_FIELD.centerZ);
    assert.equal(ball.vx, 0);
    assert.equal(ball.vz, 0);
    assert.equal(ball.goalResetTimer, 0);
  });

  it('7. Scores Left Goal and preserves cumulative score across manual reset', () => {
    const ball = {
      ...createFootballState(),
      score: 2,
      x: FOOTBALL_FIELD.minX + 0.1,
      z: FOOTBALL_FIELD.centerZ,
      vx: -14,
      vz: 0,
    };

    const leftGoal = stepFootball(ball, null, 0.04);
    assert.equal(leftGoal.scoredSide, 'left');
    assert.equal(leftGoal.ball.score, 3);

    const resetBall = resetFootballPosition(leftGoal.ball, FOOTBALL_FIELD);
    assert.equal(resetBall.x, FOOTBALL_FIELD.centerX);
    assert.equal(resetBall.z, FOOTBALL_FIELD.centerZ);
    assert.equal(resetBall.score, 3);
    assert.equal(resetBall.goalResetTimer, 0);
  });

  it('8. Rebounds off goalposts and play bounds without escaping pitch runoff or blocking player movement', () => {
    // Rebound off top goal post (north right post)
    const postZ = FOOTBALL_FIELD.centerZ - FOOTBALL_FIELD.goalHalfWidth;
    const hitPost = stepFootball(
      {
        ...createFootballState(),
        x: FOOTBALL_FIELD.maxX - FOOTBALL_PHYSICS.ballRadius - FOOTBALL_FIELD.postRadius + 0.05,
        z: postZ,
        vx: 10,
        vz: 0,
      },
      null,
      1 / 60
    );
    assert.ok(hitPost.ball.vx < 0, 'Ball hitting upright post must rebound backward');
    assert.equal(hitPost.scoredSide, null);

    // Rebound off pitch side touchline runoff
    const farSouth = stepFootball(
      {
        ...createFootballState(),
        z: FOOTBALL_FIELD.maxZ + (FOOTBALL_FIELD.playMargin ?? 2.8) + 2,
        vz: 8,
      },
      null,
      1 / 60
    );
    assert.ok(farSouth.ball.vz <= 0, 'Side runoff boundary must bounce ball inward');

    // Goalposts, benches, and central signpost are registered in world colliders without boxing the pitch
    const colliders = getWorldColliders(true);
    assert.ok(colliders.some((c) => c.id === 'signpost'));
    assert.ok(colliders.some((c) => c.id?.startsWith('bench-')));
    assert.ok(
      colliders.some(
        (c) =>
          c.x === FOOTBALL_FIELD.minX &&
          c.z === FOOTBALL_FIELD.centerZ - FOOTBALL_FIELD.goalHalfWidth
      )
    );
  });
});
