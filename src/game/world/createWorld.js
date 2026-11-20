import * as THREE from 'three';
import {
  WORLD_BOUNDS,
  PLAYER_CONFIG,
  FOOTBALL_FIELD,
  getWorldInteractables,
  getWorldColliders,
} from '../logic/worldConfig.js';
import { stepPlayer, findNearestBuilding } from '../logic/physics.js';
import {
  createFootballState,
  stepFootball,
  kickFootball,
  resetFootballPosition,
  isPlayerInFootballZone,
} from '../logic/footballPhysics.js';
import { DEFAULT_GAME_THEME } from '../shared/seasonalGameTheme.js';
import { createSeasonalAtmosphere } from '../shared/createSeasonalAtmosphere.js';
import { createBuildings } from './createBuildings.js';
import { createPlayer } from './createPlayer.js';
import { createProps } from './createProps.js';
import { createFootballField } from './createFootballField.js';

/**
 * Generates a natural layered low-poly meadow canvas texture (multi-shade grass clearings,
 * shaded perimeter woodland washes, curated lawn aprons, and smooth horizon mist fade).
 */
const createGroundGradientTexture = (theme = DEFAULT_GAME_THEME) => {
  const size = 1024;
  const worldSpan = 340;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;
    const baseGrad = ctx.createRadialGradient(cx, cy, 24, cx, cy, size * 0.48);
    baseGrad.addColorStop(0, theme.groundCenterHex);
    baseGrad.addColorStop(0.24, theme.groundMidHex);
    baseGrad.addColorStop(0.56, theme.groundEdgeHex);
    baseGrad.addColorStop(1, theme.groundOuterHex);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    const toPx = (worldVal) => (worldVal / worldSpan + 0.5) * size;
    const toScale = (meters) => (meters / worldSpan) * size;

    const paintGlade = (wx, wz, radiusM, innerColor, outerColor, alpha = 0.28) => {
      const px = toPx(wx);
      const py = toPx(wz);
      const r = toScale(radiusM);
      const g = ctx.createRadialGradient(px, py, r * 0.12, px, py, r);
      g.addColorStop(0, innerColor);
      g.addColorStop(1, outerColor);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (!(theme.isActive && theme.id === 'december-winter')) {
      // Balanced sunlit sage-meadow clearings around Central Hub & North Promenade
      paintGlade(0, -4, 15.5, '#86be69', 'rgba(134, 190, 105, 0)', 0.24);
      paintGlade(0, -15.5, 11.5, '#7cb665', 'rgba(124, 182, 101, 0)', 0.2);
      paintGlade(-11, -10, 9.5, '#7bb465', 'rgba(123, 180, 101, 0)', 0.16);
      paintGlade(11, -10, 9.5, '#7bb465', 'rgba(123, 180, 101, 0)', 0.16);

      // Gentle shaded woodland washes beneath perimeter groves
      paintGlade(-23, -17, 15.5, '#356b3e', 'rgba(53, 107, 62, 0)', 0.24);
      paintGlade(22, -17, 15.5, '#356b3e', 'rgba(53, 107, 62, 0)', 0.24);
      paintGlade(0, -24, 17, '#397343', 'rgba(57, 115, 67, 0)', 0.22);
      paintGlade(-28, 3, 16, '#397343', 'rgba(57, 115, 67, 0)', 0.22);
      paintGlade(32, 8, 16, '#376f40', 'rgba(55, 111, 64, 0)', 0.22);
      paintGlade(-8, 22, 16, '#397343', 'rgba(57, 115, 67, 0)', 0.2);
      paintGlade(16, 22, 16, '#397343', 'rgba(57, 115, 67, 0)', 0.2);

      // Subtle grass transition apron around East Football Field & cool moss pad under Arcade
      paintGlade(17.5, 7.5, 14.5, '#43894c', 'rgba(67, 137, 76, 0)', 0.26);
      paintGlade(-10.5, 9.0, 8.0, '#4a8e53', 'rgba(74, 142, 83, 0)', 0.18);
    } else {
      // Soft frosty snowdrift variation for December Light Winter
      paintGlade(0, -4, 16, '#ffffff', 'rgba(255, 255, 255, 0)', 0.32);
      paintGlade(-22, -16, 15, '#cbd5e1', 'rgba(203, 213, 225, 0)', 0.24);
      paintGlade(24, 10, 15, '#cbd5e1', 'rgba(203, 213, 225, 0)', 0.22);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Initializes the Three.js expanded park world & playable football field inside `container`.
 */
export const createWorld = (
  container,
  {
    isMobile = false,
    reducedMotion = false,
    includeArcade = true,
    seasonalTheme = DEFAULT_GAME_THEME,
    getInput = () => ({ x: 0, z: 0 }),
    onNearestChange = () => {},
    onLabelsUpdate = () => {},
    onFootballChange = () => {},
    onGoalScored = () => {},
  } = {}
) => {
  if (!container) return null;
  const theme = seasonalTheme || DEFAULT_GAME_THEME;
  const interactables = getWorldInteractables(includeArcade);
  const worldColliders = getWorldColliders(includeArcade);

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
  renderer.setClearColor(theme.exploreBg, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !isMobile;
  if (!isMobile) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const canvas = renderer.domElement;
  canvas.className = 'block w-full h-full select-none';
  canvas.setAttribute('aria-label', '3D Portfolio Exploration Canvas');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme.exploreBg);
  scene.fog = new THREE.Fog(
    theme.exploreBg,
    22 * theme.fogNearMult,
    54 * theme.fogFarMult
  );

  const camera = new THREE.PerspectiveCamera(45, 1, 1.0, 220);
  let camDistScale = 1;

  // Lighting: Natural Daytime Sky Hemisphere + Texel-Snapped Sun Key Light + Soft Horizon Rim
  const hemiLight = new THREE.HemisphereLight(
    theme.hemiSky,
    theme.hemiGround,
    theme.hemiIntensity
  );
  hemiLight.position.set(0, 32, 0);
  scene.add(hemiLight);

  const shadowFrustumHalf = 28;
  const shadowTexelSize = (shadowFrustumHalf * 2) / 1024;
  const dirLight = new THREE.DirectionalLight(theme.dirLight, theme.dirIntensity);
  dirLight.position.set(24, 34, 20);
  if (!isMobile) {
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 6;
    dirLight.shadow.camera.far = 82;
    dirLight.shadow.camera.left = -shadowFrustumHalf;
    dirLight.shadow.camera.right = shadowFrustumHalf;
    dirLight.shadow.camera.top = shadowFrustumHalf;
    dirLight.shadow.camera.bottom = -shadowFrustumHalf;
    dirLight.shadow.bias = -0.0012;
    dirLight.shadow.normalBias = 0.035;
  }
  scene.add(dirLight);
  scene.add(dirLight.target);

  const rimLight = new THREE.DirectionalLight(theme.rimColor, theme.rimIntensity);
  rimLight.position.set(-24, 18, -22);
  scene.add(rimLight);

  // Expanded Meadow Ground Plane (340x340) blending smoothly out into bright sky horizon
  const groundGradientTex = createGroundGradientTexture(theme);
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundGradientTex,
    roughness: 0.96,
    metalness: 0.02,
  });
  const groundGeo = new THREE.PlaneGeometry(340, 340);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = !isMobile;
  scene.add(groundMesh);

  const buildingsCtrl = createBuildings(scene, {
    isMobile,
    includeArcade,
    seasonalTheme: theme,
  });
  const propsCtrl = createProps(scene, { isMobile, seasonalTheme: theme });
  const footballCtrl = createFootballField(scene, { isMobile });
  const playerCtrl = createPlayer(scene, { isMobile, seasonalTheme: theme });
  const seasonalAtmosphere = createSeasonalAtmosphere(scene, theme, {
    isMobile,
    reducedMotion,
    spanX: 68,
    spanY: 11,
    spanZ: 50,
    baseY: 0.4,
  });

  let playerState = {
    x: PLAYER_CONFIG.startX,
    z: PLAYER_CONFIG.startZ + 2.25,
    angle: Math.PI,
    isMoving: false,
  };
  let footballState = createFootballState(FOOTBALL_FIELD);
  let lastFootballUi = { inZone: false, inKickRange: false, score: 0 };
  let visitedSet = new Set();
  let lastNearestId = null;
  let paused = false;
  let alive = true;
  let rafId = 0;
  let lastTime = performance.now();

  // Smooth third-person park camera framing around player inside the 72x54 world
  const getDesiredCamera = (pState) => {
    const basePullZ = 16.4 * camDistScale;
    const baseHeightY = 12.2 * camDistScale; // ~36.6 deg pitch
    const followWeightX = camDistScale > 1.3 ? 0.72 : 0.82;
    const followWeightZ = camDistScale > 1.3 ? 0.7 : 0.78;

    const targetX = pState.x * followWeightX;
    const targetZ = pState.z * followWeightZ - 1.2;
    return {
      camX: targetX,
      camY: baseHeightY + 0.85,
      camZ: targetZ + basePullZ,
      targetX,
      targetY: 0.85,
      targetZ,
    };
  };

  const camTarget = new THREE.Vector3(0, 0.85, -1.2);
  const projVec = new THREE.Vector3();
  const boxMinVec = new THREE.Vector3();

  const resize = () => {
    if (!alive || !container) return;
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    const aspect = w / h;

    camera.aspect = aspect;
    camera.fov = aspect < 0.85 ? 52 : 46;
    camDistScale =
      aspect < 1.15
        ? Math.min(2.6, Math.max(1.02, 1.32 / Math.max(aspect, 0.45)))
        : 1.02;

    scene.fog.near = 34 * camDistScale * theme.fogNearMult;
    scene.fog.far = 96 * camDistScale * theme.fogFarMult;

    const initCam = getDesiredCamera(playerState);
    camera.position.set(initCam.camX, initCam.camY, initCam.camZ);
    camTarget.set(initCam.targetX, initCam.targetY, initCam.targetZ);
    camera.lookAt(camTarget);

    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const projectLabels = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    const padX = isMobile ? 52 : 76;
    const padTop = isMobile ? 76 : 80;
    const padBottom = isMobile ? 124 : 92;
    const topRightHudLeft = w - (isMobile ? 165 : 275);
    const topLeftHudRight = isMobile ? 175 : 215;
    const halfLabelW = isMobile ? 54 : 70;
    const labelH = 28;

    // 1. Project each building's top anchor and 2D screen roof top
    const items = buildingsCtrl.entries.map((entry) => {
      const b = entry.data;
      projVec.set(b.x, b.labelY, b.z).project(camera);
      const inFrustum = projVec.z < 1 && projVec.z > -1;
      const rawX = (projVec.x * 0.5 + 0.5) * w;
      const rawY = (-projVec.y * 0.5 + 0.5) * h - 8;

      boxMinVec.set(b.x, b.height, b.z).project(camera);
      const roofTopY = (-boxMinVec.y * 0.5 + 0.5) * h;

      return {
        id: b.id,
        worldZ: b.z,
        x: Math.min(Math.max(rawX, padX), w - padX),
        y: Math.min(rawY, roofTopY - 10),
        rawY,
        roofTopY,
        visible: inFrustum,
      };
    });

    // 2. Collision avoidance: prevent pairwise label-vs-label overlap while preserving north-south order
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          const minDx = halfLabelW * 2 + 6;
          const minDy = labelH + 6;
          if (dx < minDx && dy < minDy) {
            const north = a.worldZ <= b.worldZ ? a : b;
            const south = a.worldZ <= b.worldZ ? b : a;
            const overlapY = minDy - Math.max(0, south.y - north.y);
            if (overlapY > 0) {
              north.y -= overlapY * 0.6;
              south.y = Math.min(south.roofTopY - 6, south.y + overlapY * 0.4);
            }
          }
        }
      }
    }

    // 3. Clamp inside viewport padding and avoid top-left / top-right HUD bars
    const coords = {};
    for (const item of items) {
      let x = Math.min(Math.max(item.x, padX), w - padX);
      let y = Math.min(Math.max(item.y, padTop), h - padBottom);
      let opacity = 1;

      const collidesTopHud =
        y < 96 && (x > topRightHudLeft || x < topLeftHudRight);
      if (collidesTopHud) {
        y = Math.max(y, 102);
        opacity = item.rawY < 68 ? 0.25 : 0.65;
      }

      coords[item.id] = {
        x,
        y,
        opacity,
        visible: item.visible,
      };
    }

    onLabelsUpdate(coords);
  };

  const tick = (now) => {
    if (!alive) return;
    if (document.hidden) {
      rafId = 0;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;

    const rawInput = paused ? { x: 0, z: 0 } : getInput();
    playerState = stepPlayer(playerState, rawInput, dt, {
      speed: PLAYER_CONFIG.speed,
      radius: PLAYER_CONFIG.radius,
      bounds: WORLD_BOUNDS,
      buildings: worldColliders,
    });

    const fbStep = paused
      ? {
          ball: footballState,
          scoredSide: null,
          didReset: false,
          inKickRange: false,
        }
      : stepFootball(footballState, playerState, dt, {
          field: FOOTBALL_FIELD,
          playerRadius: PLAYER_CONFIG.radius,
        });
    footballState = fbStep.ball;

    if (fbStep.scoredSide) {
      footballCtrl.triggerGoalBurst(fbStep.scoredSide);
      onGoalScored(fbStep.scoredSide, footballState.score);
    }

    const inZone = isPlayerInFootballZone(playerState, FOOTBALL_FIELD);
    if (
      inZone !== lastFootballUi.inZone ||
      fbStep.inKickRange !== lastFootballUi.inKickRange ||
      footballState.score !== lastFootballUi.score
    ) {
      lastFootballUi = {
        inZone,
        inKickRange: fbStep.inKickRange,
        score: footballState.score,
      };
      onFootballChange(lastFootballUi);
    }

    playerCtrl.update(playerState, dt, { reducedMotion });
    propsCtrl.update(dt, { reducedMotion });
    footballCtrl.update(footballState, dt, {
      inKickRange: fbStep.inKickRange && !paused,
      reducedMotion,
    });
    buildingsCtrl.updateBeacon(dt, { reducedMotion });
    seasonalAtmosphere.update(dt, { focusY: 0 });

    if (!isMobile) {
      // Snap light target to world shadow-map texel grid to prevent shadow swimming while walking
      const snapX = Math.round(playerState.x / shadowTexelSize) * shadowTexelSize;
      const snapZ = Math.round(playerState.z / shadowTexelSize) * shadowTexelSize;
      dirLight.target.position.set(snapX, 0, snapZ);
      dirLight.position.set(snapX + 24, 34, snapZ + 20);
    }

    const nearest = findNearestBuilding(playerState, interactables);
    const nearestId = nearest ? nearest.building.id : null;
    if (nearestId !== lastNearestId) {
      lastNearestId = nearestId;
      onNearestChange(nearest ? nearest.building : null);
    }

    buildingsCtrl.updateHighlights(nearestId, visitedSet);

    // Smooth camera follow at ~37 deg pitch
    const desired = getDesiredCamera(playerState);
    const lerpFactor = reducedMotion ? 1 : Math.min(1, dt * 6.5);

    camera.position.x += (desired.camX - camera.position.x) * lerpFactor;
    camera.position.y += (desired.camY - camera.position.y) * lerpFactor;
    camera.position.z += (desired.camZ - camera.position.z) * lerpFactor;

    camTarget.x += (desired.targetX - camTarget.x) * lerpFactor;
    camTarget.y += (desired.targetY - camTarget.y) * lerpFactor;
    camTarget.z += (desired.targetZ - camTarget.z) * lerpFactor;
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
    projectLabels();

    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!alive || rafId || document.hidden) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else {
      startLoop();
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  document.addEventListener('visibilitychange', onVisibilityChange);

  resize();
  startLoop();

  return {
    setVisitedSet: (nextSet) => {
      visitedSet = nextSet instanceof Set ? nextSet : new Set(nextSet);
    },
    setPaused: (nextPaused) => {
      paused = Boolean(nextPaused);
    },
    kickBall: () => {
      if (paused) return false;
      const res = kickFootball(footballState, playerState, performance.now());
      footballState = res.ball;
      return res.kicked;
    },
    resetBall: () => {
      footballState = resetFootballPosition(footballState, FOOTBALL_FIELD);
      const nextUi = {
        inZone: isPlayerInFootballZone(playerState, FOOTBALL_FIELD),
        inKickRange: false,
        score: footballState.score,
      };
      lastFootballUi = nextUi;
      onFootballChange(nextUi);
    },
    dispose: () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      groundGradientTex.dispose();
      playerCtrl.dispose?.();
      propsCtrl.dispose?.();
      footballCtrl.dispose?.();
      buildingsCtrl.dispose?.();
      seasonalAtmosphere.dispose();

      scene.traverse((obj) => {
        if (obj.isInstancedMesh) {
          obj.dispose?.();
        }
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose?.());
          } else {
            obj.material.dispose?.();
          }
        }
      });

      scene.clear();
      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
  };
};
