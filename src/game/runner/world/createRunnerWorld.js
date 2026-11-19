import * as THREE from 'three';
import {
  GAME_STATES,
  RUNNER_CONFIG,
  clampDeltaTime,
  extractTechLabels,
  switchLane,
  initiateJump,
  checkObstacleCollision,
  checkTokenCollision,
  applyDamageToRunner,
  applyTokenCollection,
  createRunnerState,
  stepRunnerCountdown,
  stepRunnerSimulation,
} from '../logic/runnerLogic.js';
import {
  createChunkPoolState,
  stepChunkRecycling,
} from '../logic/runnerGenerator.js';
import { createRunnerAssets } from './createRunnerAssets.js';
import { DEFAULT_GAME_THEME } from '../../shared/seasonalGameTheme.js';
import { createSeasonalAtmosphere } from '../../shared/createSeasonalAtmosphere.js';

/**
 * Initializes the Three.js 3-lane endless runner scene for "Stack Runner".
 * Pools track chunks, obstacles, and tech tokens with cached CanvasTextures.
 */
export const createRunnerWorld = (
  container,
  {
    isMobile = false,
    reducedMotion = false,
    seasonalTheme = DEFAULT_GAME_THEME,
    seed = Date.now(),
    onStateChange = () => {},
    onMilestone = () => {},
    onFeedback = () => {},
    onGameOver = () => {},
  } = {}
) => {
  if (!container) return null;
  const theme = seasonalTheme || DEFAULT_GAME_THEME;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  const maxDpr = isMobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setClearColor(theme.sceneBg, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const canvas = renderer.domElement;
  canvas.className = 'block w-full h-full select-none touch-none';
  canvas.setAttribute('aria-label', 'Stack Runner 3D Mini-Game Canvas');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme.sceneBg);
  scene.fog = new THREE.Fog(
    theme.sceneBg,
    36 * theme.fogNearMult,
    98 * theme.fogFarMult
  );

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 140);

  // Lighting balanced for readable player silhouette, obstacles, and track depth
  const hemiLight = new THREE.HemisphereLight(
    theme.hemiSky,
    theme.hemiGround,
    Math.max(0.88, theme.hemiIntensity)
  );
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(theme.dirLight, theme.dirIntensity);
  dirLight.position.set(8, 18, 14);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(theme.rimColor, Math.max(0.7, theme.rimIntensity));
  rimLight.position.set(-10, 10, -18);
  scene.add(rimLight);

  const assets = createRunnerAssets({ isMobile, seasonalTheme: theme });
  scene.add(assets.runner.root);
  scene.add(assets.runner.shadowMesh);
  scene.add(assets.runner.shieldRing);
  for (const chunkMesh of assets.chunkPool) scene.add(chunkMesh);
  for (const obsSlot of assets.obstaclePool) scene.add(obsSlot.group);
  for (const tokSlot of assets.tokenPool) scene.add(tokSlot.group);

  const seasonalAtmosphere = createSeasonalAtmosphere(scene, theme, {
    isMobile,
    reducedMotion,
    spanX: 16,
    spanY: 8,
    spanZ: 56,
    baseY: 0.4,
    scrollAxisZ: true,
  });

  const techLabels = extractTechLabels();
  let state = createRunnerState(GAME_STATES.READY);
  let poolState = createChunkPoolState({ seed, techLabels });
  let pausedFromState = GAME_STATES.PLAYING;
  let visualLaneX = 0;
  let runClock = 0;
  let worldClock = 0;
  let alive = true;
  let rafId = 0;
  let lastFrameMs = performance.now();
  let stateEmitAccum = 0;

  const emitHudState = () => {
    onStateChange({
      gameState: state.gameState,
      countdownValue: state.countdownValue,
      score: state.score,
      distance: Math.floor(state.distance),
      lives: state.lives,
      multiplier: state.multiplier,
      streak: state.streak,
      tokensCollected: state.tokensCollected,
      invulnActive: state.invulnRemainingSec > 0,
      speed: state.speed,
    });
  };

  const syncSceneToState = (dt) => {
    // 1. Runner visual position & grounding shadow / invuln shield (never 0% invisible)
    const targetX = (state.lane - 1) * RUNNER_CONFIG.laneWidth;
    if (reducedMotion) {
      visualLaneX = targetX;
    } else {
      const alpha = 1 - Math.exp(-16 * Math.max(dt, 0.001));
      visualLaneX += (targetX - visualLaneX) * alpha;
    }

    const r = assets.runner;
    r.root.position.set(visualLaneX, state.y, 0);
    r.shadowMesh.position.set(visualLaneX, 0.025, 0);
    r.shadowMesh.scale.setScalar(Math.max(0.45, 1 - state.y * 0.24));

    const invulnActive = state.invulnRemainingSec > 0;
    r.shieldRing.visible = invulnActive;
    r.shieldRing.position.set(visualLaneX, 0.035, 0);
    if (invulnActive) {
      r.setOpacity(reducedMotion ? 0.78 : state.isVisibleBlink ? 1.0 : 0.42);
    } else {
      r.setOpacity(1.0);
    }

    // 2. Run cycle animation (freezes cleanly when paused or game over)
    if (state.gameState === GAME_STATES.PLAYING && !reducedMotion) {
      worldClock += dt;
      if (state.isGrounded) {
        runClock += dt * state.speed * 0.92;
        const swing = Math.sin(runClock) * 0.68;
        r.leftLeg.rotation.x = swing;
        r.rightLeg.rotation.x = -swing;
        r.leftArm.rotation.x = -swing * 0.82;
        r.rightArm.rotation.x = swing * 0.82;
        r.rig.position.y = Math.abs(Math.sin(runClock)) * 0.06;
      } else {
        // Crisp mid-air jump tuck pose
        r.leftLeg.rotation.x = 0.38;
        r.rightLeg.rotation.x = -0.24;
        r.leftArm.rotation.x = -0.5;
        r.rightArm.rotation.x = -0.5;
        r.rig.position.y = 0;
      }
    } else if (state.gameState === GAME_STATES.READY && !reducedMotion) {
      worldClock += dt * 0.6;
      r.leftLeg.rotation.x = 0;
      r.rightLeg.rotation.x = 0;
      r.leftArm.rotation.x = 0;
      r.rightArm.rotation.x = 0;
      r.rig.position.y = 0;
    } else {
      r.leftLeg.rotation.x = 0;
      r.rightLeg.rotation.x = 0;
      r.leftArm.rotation.x = 0;
      r.rightArm.rotation.x = 0;
      r.rig.position.y = 0;
    }

    // 3. Position pooled track chunks seamlessly along player distance
    const chunks = poolState.chunks;
    for (let i = 0; i < chunks.length && i < assets.chunkPool.length; i++) {
      const ch = chunks[i];
      const chunkCenterDist = ch.startDist + RUNNER_CONFIG.chunkLength * 0.5;
      assets.chunkPool[i].position.set(0, 0, -(chunkCenterDist - state.distance));
    }

    // 4. Sync pooled obstacles (zero object allocations)
    for (let i = 0; i < assets.obstaclePool.length; i++) {
      assets.obstaclePool[i].group.visible = false;
    }
    let obsSlotIdx = 0;
    for (let c = 0; c < chunks.length; c++) {
      const obsList = chunks[c].obstacles;
      for (let o = 0; o < obsList.length; o++) {
        if (obsSlotIdx >= assets.obstaclePool.length) break;
        const obs = obsList[o];
        const slot = assets.obstaclePool[obsSlotIdx++];
        slot.group.visible = true;
        slot.group.position.set((obs.lane - 1) * RUNNER_CONFIG.laneWidth, 0, -(obs.dist - state.distance));
        slot.bugGroup.visible = obs.type === 'bug';
        slot.gateGroup.visible = obs.type === 'lowGate';
        slot.firewallGroup.visible = obs.type === 'firewall';
      }
    }

    // 5. Sync pooled tech tokens with cached label sprites
    for (let i = 0; i < assets.tokenPool.length; i++) {
      assets.tokenPool[i].group.visible = false;
    }
    let tokSlotIdx = 0;
    const hoverPhase = reducedMotion ? 0 : Math.sin(worldClock * 4.5) * 0.08;
    const spinActive = state.gameState === GAME_STATES.PLAYING || state.gameState === GAME_STATES.READY;
    for (let c = 0; c < chunks.length; c++) {
      const tokList = chunks[c].tokens;
      for (let t = 0; t < tokList.length; t++) {
        if (tokSlotIdx >= assets.tokenPool.length) break;
        const tok = tokList[t];
        if (tok.collected) continue;
        const slot = assets.tokenPool[tokSlotIdx++];
        slot.group.visible = true;
        slot.group.position.set(
          (tok.lane - 1) * RUNNER_CONFIG.laneWidth,
          tok.y + hoverPhase,
          -(tok.dist - state.distance)
        );
        if (!reducedMotion && spinActive) {
          slot.core.rotation.y += dt * 2.2;
        }
        const matIdx = tok.labelIndex % assets.tokenLabelMaterials.length;
        if (slot.labelSprite.material !== assets.tokenLabelMaterials[matIdx]) {
          slot.labelSprite.material = assets.tokenLabelMaterials[matIdx];
        }
      }
    }

    // 6. Steady, well-framed camera keeping all 3 foreground lanes inside 390px & 1280px
    const aspect = camera.aspect || 1.6;
    const narrow = aspect < 0.85;
    const camFollowX = visualLaneX * (narrow ? 0.25 : 0.35);
    camera.position.set(camFollowX, narrow ? 6.2 : 4.5, narrow ? 13.6 : 7.6);
    camera.lookAt(camFollowX * 0.4, narrow ? 0.3 : 0.55, -14);
  };

  const evaluateCollisions = () => {
    const playerSnapshot = {
      lane: state.lane,
      distance: state.distance,
      y: state.y,
    };

    const chunks = poolState.chunks;
    for (let c = 0; c < chunks.length; c++) {
      const ch = chunks[c];

      // Tokens
      for (let t = 0; t < ch.tokens.length; t++) {
        const tok = ch.tokens[t];
        if (!tok.collected && checkTokenCollision(playerSnapshot, tok)) {
          tok.collected = true;
          const res = applyTokenCollection(state);
          state = res.state;
          onFeedback({
            type: 'token',
            label: tok.label,
            points: res.pointsAdded,
            multiplier: state.multiplier,
          });
          emitHudState();
        }
      }

      // Obstacles
      for (let o = 0; o < ch.obstacles.length; o++) {
        const obs = ch.obstacles[o];
        if (checkObstacleCollision(playerSnapshot, obs)) {
          obs.hitRegistered = true;
          const res = applyDamageToRunner(state);
          state = res.state;
          if (res.damaged) {
            onFeedback({ type: 'hit', lives: state.lives });
            emitHudState();
            if (res.gameOver) {
              onGameOver({
                score: state.score,
                distance: Math.floor(state.distance),
                tokensCollected: state.tokensCollected,
              });
              return;
            }
          }
        }
      }
    }
  };

  const handleResize = () => {
    if (!alive || !container) return;
    const width = Math.max(container.clientWidth || window.innerWidth, 1);
    const height = Math.max(container.clientHeight || window.innerHeight, 1);
    const aspect = width / height;
    camera.fov = aspect < 0.85 ? 62 : 50;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const handleVisibility = () => {
    if (document.hidden && state.gameState === GAME_STATES.PLAYING) {
      pausedFromState = state.gameState;
      state = { ...state, gameState: GAME_STATES.PAUSED };
      emitHudState();
    } else if (!document.hidden) {
      lastFrameMs = performance.now();
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibility);

  const renderFrame = (nowMs) => {
    if (!alive) return;
    rafId = window.requestAnimationFrame(renderFrame);

    const dt = clampDeltaTime((nowMs - lastFrameMs) / 1000);
    lastFrameMs = nowMs;

    if (state.gameState === GAME_STATES.READY && state.countdownRemainingSec > 0 && countdownActive) {
      const prevCount = state.countdownValue;
      const stepRes = stepRunnerCountdown(state, dt);
      state = stepRes.state;
      if (stepRes.startedPlaying || state.countdownValue !== prevCount) {
        emitHudState();
      }
    } else if (state.gameState === GAME_STATES.PLAYING) {
      const simRes = stepRunnerSimulation(state, dt, reducedMotion);
      state = simRes.state;
      stepChunkRecycling(poolState, state.distance);
      evaluateCollisions();

      if (simRes.milestone) {
        onMilestone(simRes.milestone);
        emitHudState();
      } else {
        stateEmitAccum += dt;
        if (stateEmitAccum >= 0.08) {
          stateEmitAccum = 0;
          emitHudState();
        }
      }
    }

    syncSceneToState(dt);
    seasonalAtmosphere.update(
      state.gameState === GAME_STATES.PAUSED || state.gameState === GAME_STATES.GAME_OVER ? 0 : dt,
      { forwardSpeed: state.gameState === GAME_STATES.PLAYING ? state.speed : 0 }
    );
    renderer.render(scene, camera);
  };

  let countdownActive = false;
  syncSceneToState(0);
  emitHudState();
  rafId = window.requestAnimationFrame(renderFrame);

  return {
    startRun: () => {
      if (state.gameState !== GAME_STATES.READY || countdownActive) return;
      countdownActive = true;
      lastFrameMs = performance.now();
      emitHudState();
    },
    moveLane: (delta) => {
      if (state.gameState !== GAME_STATES.PLAYING) return;
      const nextLane = switchLane(state.lane, delta);
      if (nextLane !== state.lane) {
        state = { ...state, lane: nextLane };
      }
    },
    jump: () => {
      if (state.gameState !== GAME_STATES.PLAYING) return false;
      const jumpRes = initiateJump({ y: state.y, vy: state.vy, isGrounded: state.isGrounded });
      if (jumpRes.triggered) {
        state = { ...state, y: jumpRes.y, vy: jumpRes.vy, isGrounded: jumpRes.isGrounded };
        return true;
      }
      return false;
    },
    setPaused: (nextPaused) => {
      if (state.gameState === GAME_STATES.GAME_OVER) return;
      if (nextPaused && state.gameState !== GAME_STATES.PAUSED) {
        pausedFromState = state.gameState;
        state = { ...state, gameState: GAME_STATES.PAUSED };
        emitHudState();
      } else if (!nextPaused && state.gameState === GAME_STATES.PAUSED) {
        lastFrameMs = performance.now();
        state = { ...state, gameState: pausedFromState || GAME_STATES.PLAYING };
        emitHudState();
      }
    },
    restart: (nextSeed = Date.now(), autoStartCountdown = true) => {
      state = createRunnerState(GAME_STATES.READY);
      poolState = createChunkPoolState({ seed: nextSeed, techLabels });
      countdownActive = autoStartCountdown;
      visualLaneX = 0;
      runClock = 0;
      worldClock = 0;
      stateEmitAccum = 0;
      lastFrameMs = performance.now();
      syncSceneToState(0);
      emitHudState();
    },
    getState: () => ({ ...state }),
    getMemoryInfo: () => ({
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    }),
    dispose: () => {
      alive = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      seasonalAtmosphere.dispose();
      assets.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    },
  };
};
