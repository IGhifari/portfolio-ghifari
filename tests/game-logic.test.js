import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  WORLD_BOUNDS,
  PLAYER_CONFIG,
  BUILDINGS,
  getBuildingById,
} from '../src/game/logic/worldConfig.js';
import {
  normalizeInput,
  integrateMovement,
  clampToWorldBounds,
  resolveSingleBuildingCollision,
  resolveBuildingCollisions,
  stepPlayer,
  findNearestBuilding,
} from '../src/game/logic/physics.js';
import { parseLocation } from '../src/utils/router.js';
import { executeTerminalCommand } from '../src/utils/terminalCommands.js';
import { translations } from '../src/data/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('3D Exploration Game Logic, Physics & Routing Test Suite', () => {
  it('1. Defines 5 valid portfolio buildings in a symmetric arc at equal distance from spawn', () => {
    assert.equal(BUILDINGS.length, 5);
    const ids = BUILDINGS.map((b) => b.id);
    assert.deepEqual(ids, ['projects', 'about', 'stack', 'experience', 'contact']);

    const expectedDist = Math.hypot(
      BUILDINGS[0].x - PLAYER_CONFIG.startX,
      BUILDINGS[0].z - PLAYER_CONFIG.startZ
    );

    for (const b of BUILDINGS) {
      assert.equal(typeof b.x, 'number');
      assert.equal(typeof b.z, 'number');
      assert.ok(b.halfW > 0 && b.halfD > 0);
      assert.ok(b.labelY >= b.height + 1.2, `Building ${b.id} labelY must be anchored well above top height`);
      assert.ok(b.interactRadius > Math.max(b.halfW, b.halfD));
      assert.ok(b.interactRadius <= 2.75, `Building ${b.id} interactRadius must be tight around building perimeter`);
      assert.ok(b.sectionHref.startsWith('/#'));
      assert.equal(getBuildingById(b.id)?.id, b.id);

      const dist = Math.hypot(b.x - PLAYER_CONFIG.startX, b.z - PLAYER_CONFIG.startZ);
      assert.ok(
        Math.abs(dist - expectedDist) < 0.05,
        `Building ${b.id} distance (${dist.toFixed(2)}) must match arc radius (${expectedDist.toFixed(2)})`
      );
    }
    assert.equal(getBuildingById('nonexistent'), null);
  });

  it('2. Normalizes input vectors and integrates movement deterministically', () => {
    const zero = normalizeInput(0, 0);
    assert.equal(zero.x, 0);
    assert.equal(zero.z, 0);
    assert.equal(zero.magnitude, 0);

    // Diagonal keyboard input (1, 1) must clamp magnitude to 1
    const diag = normalizeInput(1, 1);
    assert.ok(Math.abs(Math.hypot(diag.x, diag.z) - 1) < 1e-6);
    assert.equal(diag.magnitude, 1);

    // Partial analog touch input (0.5, 0) stays 0.5
    const analog = normalizeInput(0.5, 0);
    assert.ok(Math.abs(analog.x - 0.5) < 1e-6);
    assert.ok(Math.abs(analog.magnitude - 0.5) < 1e-6);

    const start = { x: 0, z: 10, angle: Math.PI };
    const stepped = integrateMovement(start, { x: 0, z: -1 }, 8, 0.05);
    assert.ok(Math.abs(stepped.z - 9.6) < 1e-6);
    assert.equal(stepped.isMoving, true);
  });

  it('3. Clamps player position strictly inside world bounds accounting for radius', () => {
    const r = PLAYER_CONFIG.radius;
    const farLeft = clampToWorldBounds({ x: -999, z: 0 }, r, WORLD_BOUNDS);
    assert.equal(farLeft.x, WORLD_BOUNDS.minX + r);

    const farRight = clampToWorldBounds({ x: 999, z: 0 }, r, WORLD_BOUNDS);
    assert.equal(farRight.x, WORLD_BOUNDS.maxX - r);

    const farNorth = clampToWorldBounds({ x: 0, z: -999 }, r, WORLD_BOUNDS);
    assert.equal(farNorth.z, WORLD_BOUNDS.minZ + r);

    const farSouth = clampToWorldBounds({ x: 0, z: 999 }, r, WORLD_BOUNDS);
    assert.equal(farSouth.z, WORLD_BOUNDS.maxZ - r);
  });

  it('4. Resolves circle-vs-AABB collisions against all 5 buildings', () => {
    const r = PLAYER_CONFIG.radius;

    for (const b of BUILDINGS) {
      // Approach from +Z front edge into the building box
      const overlappingFront = {
        x: b.x,
        z: b.z + b.halfD + r * 0.25,
      };
      const pushedFront = resolveSingleBuildingCollision(overlappingFront, r, b);
      assert.ok(
        pushedFront.z >= b.z + b.halfD + r - 1e-5,
        `Player overlapping front of ${b.id} must be pushed outside +Z edge`
      );

      // Center placed directly inside building AABB must be pushed outside
      const insideCenter = { x: b.x + 0.1, z: b.z };
      const pushedOut = resolveBuildingCollisions(insideCenter, r, BUILDINGS);
      const outsideX =
        pushedOut.x <= b.x - b.halfW - r + 1e-5 ||
        pushedOut.x >= b.x + b.halfW + r - 1e-5;
      const outsideZ =
        pushedOut.z <= b.z - b.halfD - r + 1e-5 ||
        pushedOut.z >= b.z + b.halfD + r - 1e-5;
      assert.ok(
        outsideX || outsideZ,
        `Player inside ${b.id} must be ejected outside AABB + radius`
      );
    }

    // Full stepPlayer integration prevents walking through Projects building
    const projects = getBuildingById('projects');
    let state = {
      x: projects.x,
      z: projects.z + projects.halfD + r + 0.1,
      angle: Math.PI,
    };
    for (let i = 0; i < 30; i++) {
      state = stepPlayer(state, { x: 0, z: -1 }, 0.05);
    }
    assert.ok(
      state.z >= projects.z + projects.halfD + r - 1e-5,
      'Repeated stepPlayer into building must halt at collision boundary'
    );
  });

  it('5. Player at spawn returns null for all 5 buildings, and standing near each building triggers only that building', () => {
    const spawnPos = {
      x: PLAYER_CONFIG.startX,
      z: PLAYER_CONFIG.startZ,
    };

    // Collective check at spawn (and default no-arg check)
    assert.equal(findNearestBuilding(spawnPos, BUILDINGS), null);
    assert.equal(findNearestBuilding(), null);

    // Individual check at spawn against each of the 5 buildings
    for (const b of BUILDINGS) {
      assert.equal(
        findNearestBuilding(spawnPos, [b]),
        null,
        `Player at spawn (${spawnPos.x}, ${spawnPos.z}) must return null for building ${b.id}`
      );
      const distFromSpawn = Math.hypot(spawnPos.x - b.x, spawnPos.z - b.z);
      assert.ok(
        distFromSpawn > b.interactRadius + 7,
        `Spawn distance to ${b.id} (${distFromSpawn.toFixed(2)}) must be far outside interactRadius (${b.interactRadius})`
      );
    }

    // Standing right in front of each building triggers proximity detection ONLY for that building
    for (const b of BUILDINGS) {
      const nearPos = {
        x: b.x,
        z: b.z + b.halfD + 0.7,
      };
      const detected = findNearestBuilding(nearPos, BUILDINGS);
      assert.ok(detected, `Expected proximity match near ${b.id}`);
      assert.equal(detected.building.id, b.id);
      assert.ok(detected.distance <= b.interactRadius);
    }
  });

  it('6. Parses /play and /en/play routes and respects enable3dGame feature flag', () => {
    const playId = parseLocation({ pathname: '/play', search: '', hash: '' });
    assert.equal(playId.route.type, 'play');
    assert.equal(playId.cleanPath, '/play');
    assert.equal(playId.langPrefix, null);

    const playTrailing = parseLocation({ pathname: '/play/', search: '', hash: '' });
    assert.equal(playTrailing.route.type, 'play');

    const playEn = parseLocation({ pathname: '/en/play', search: '', hash: '' });
    assert.equal(playEn.route.type, 'play');
    assert.equal(playEn.cleanPath, '/play');
    assert.equal(playEn.langPrefix, 'en');

    // When disabled via feature flag, /play and /en/play fall back to not-found
    const disabledPlay = parseLocation(
      { pathname: '/play', search: '', hash: '' },
      { enable3dGame: false }
    );
    assert.equal(disabledPlay.route.type, 'not-found');
  });

  it('7. Supports terminal "play" and "open play" commands and bilingual game.* keys', () => {
    let navigatedUrl = null;
    const resPlay = executeTerminalCommand('play', {
      language: 'id',
      onNavigate: (url) => {
        navigatedUrl = url;
      },
    });
    assert.equal(resPlay.type, 'navigate');
    assert.equal(resPlay.url, '/play');
    assert.equal(navigatedUrl, '/play');

    const resOpenPlay = executeTerminalCommand('open play', { language: 'en' });
    assert.equal(resOpenPlay.type, 'navigate');
    assert.equal(resOpenPlay.url, '/play');

    const idGameKeys = Object.keys(translations.id.game).sort();
    const enGameKeys = Object.keys(translations.en.game).sort();
    assert.deepEqual(idGameKeys, enGameKeys);
  });

  it('8. Configures Cloudflare _redirects, disables TargetCursor on /play, and verifies 3D world constraints', () => {
    const redirects = fs.readFileSync(path.join(rootDir, 'public', '_redirects'), 'utf-8');
    assert.match(redirects, /^\/play\s+\/index\.html\s+200$/m);
    assert.match(redirects, /^\/play\/\s+\/index\.html\s+200$/m);
    assert.match(redirects, /^\/en\/play\s+\/index\.html\s+200$/m);

    const appSource = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf-8');
    assert.ok(
      appSource.includes('{!isPlayMode && <TargetCursor'),
      'TargetCursor must be disabled on /play* routes'
    );

    const hudSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'ui', 'GameHUD.jsx'), 'utf-8');
    assert.ok(!hudSource.includes('AMBIENT_TRACKS'), 'GameHUD must not define a separate ambient track');
    assert.ok(hudSource.includes('useAudioPlayer()'), 'GameHUD must use shared useAudioPlayer() state');
    assert.ok(hudSource.includes('z-[60]'), 'Top HUD bar with Exit button must stay above modal overlays');
    assert.ok(hudSource.includes('safe-area-inset'), 'GameHUD must respect mobile safe-area insets');
    // Ensure Press E is only shown in one place (the bottom prompt card)
    const pressEMatches = hudSource.match(/game\.pressE/g) || [];
    assert.equal(pressEMatches.length, 1, 'GameHUD must render game.pressE in only one place (bottom prompt card)');

    const infoPanelSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'ui', 'InfoPanel.jsx'), 'utf-8');
    assert.ok(!infoPanelSource.includes('exp.responsibilities'), 'InfoPanel must stay compact without full responsibility lists');

    const propsSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'world', 'createProps.js'), 'utf-8');
    assert.ok(propsSource.includes('THREE.InstancedMesh'), 'World props must use THREE.InstancedMesh');
    assert.ok(propsSource.includes('THREE.Points'), 'World props must include subtle floating dust particles');

    const playerSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'world', 'createPlayer.js'), 'utf-8');
    assert.ok(playerSource.includes('leftArmPivot') && playerSource.includes('leftLegPivot'), 'Player must have articulated arms and legs');
    assert.ok(playerSource.includes('bodyRig.scale.setScalar(1.42)'), 'Player must be scaled ~40% larger');
    assert.ok(playerSource.includes('playerState.isMoving ? 0.68 : 0'), 'Player blue ring must appear only while moving');

    const worldSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'world', 'createWorld.js'), 'utf-8');
    assert.ok(worldSource.includes('THREE.HemisphereLight'), 'World must include HemisphereLight');
    assert.ok(worldSource.includes('PlaneGeometry(240, 240)'), 'Ground plane must extend beyond fog to eliminate hard floor edge');

    const buildingsSource = fs.readFileSync(path.join(rootDir, 'src', 'game', 'world', 'createBuildings.js'), 'utf-8');
    assert.ok(buildingsSource.includes('buildSectionSignage'), 'Buildings must include 3D section signage');
    assert.ok(buildingsSource.includes('createProximityGlowTexture'), 'Buildings must include soft proximity ground glow');
  });
});
