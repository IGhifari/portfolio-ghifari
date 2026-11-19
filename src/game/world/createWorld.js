import * as THREE from 'three';
import { WORLD_BOUNDS, PLAYER_CONFIG, BUILDINGS } from '../logic/worldConfig.js';
import { stepPlayer, findNearestBuilding } from '../logic/physics.js';
import { createBuildings } from './createBuildings.js';
import { createPlayer } from './createPlayer.js';
import { createProps } from './createProps.js';

/**
 * Generates a radial ground gradient texture fading smoothly from the lifted dark plaza
 * tone (#1a1c24) in the center out to #08090c before reaching the fog boundary,
 * eliminating any hard floor edge.
 */
const createGroundGradientTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 12, 256, 256, 240);
    grad.addColorStop(0, '#1b1d26');
    grad.addColorStop(0.24, '#15171e');
    grad.addColorStop(0.52, '#0e1015');
    grad.addColorStop(1, '#08090c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Initializes the Three.js exploration world inside `container`.
 * Returns `{ dispose, setVisitedSet, setPaused }` or `null` if WebGL is unavailable.
 */
export const createWorld = (
  container,
  {
    isMobile = false,
    reducedMotion = false,
    getInput = () => ({ x: 0, z: 0 }),
    onNearestChange = () => {},
    onLabelsUpdate = () => {},
  } = {}
) => {
  if (!container) return null;

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
  renderer.setClearColor(0x08090c, 1);
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
  scene.background = new THREE.Color(0x08090c);
  scene.fog = new THREE.Fog(0x08090c, 22, 54);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 180);
  let camDistScale = 1;

  // Lighting: Soft Hemisphere + Key Directional + Cool Rim Light on buildings
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x09090b, 0.75);
  hemiLight.position.set(0, 25, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xf8fafc, 1.35);
  dirLight.position.set(16, 26, 18);
  if (!isMobile) {
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 65;
    const d = 22;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
  }
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.65);
  rimLight.position.set(-18, 12, -16);
  scene.add(rimLight);

  // Extended Horizon Ground Plane (240x240) blending seamlessly into fog with zero hard edge
  const groundGradientTex = createGroundGradientTexture();
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundGradientTex,
    roughness: 0.92,
    metalness: 0.06,
  });
  const groundGeo = new THREE.PlaneGeometry(240, 240);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = !isMobile;
  scene.add(groundMesh);

  // Extended subtle grid (180x180) so its outer edges dissolve completely inside the fog
  const gridHelper = new THREE.GridHelper(180, 90, 0x222530, 0x161820);
  gridHelper.position.y = 0.006;
  if (Array.isArray(gridHelper.material)) {
    gridHelper.material.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.35;
    });
  } else if (gridHelper.material) {
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
  }
  scene.add(gridHelper);

  const buildingsCtrl = createBuildings(scene, { isMobile });
  const propsCtrl = createProps(scene, { isMobile });
  const playerCtrl = createPlayer(scene, { isMobile });

  let playerState = {
    x: PLAYER_CONFIG.startX,
    z: PLAYER_CONFIG.startZ,
    angle: Math.PI,
    isMoving: false,
  };
  let visitedSet = new Set();
  let lastNearestId = null;
  let paused = false;
  let alive = true;
  let rafId = 0;
  let lastTime = performance.now();

  // Compute desired camera position & target maintaining ~37 deg pitch (between 35-40 deg)
  const getDesiredCamera = (pState) => {
    const basePullZ = 16.8 * camDistScale;
    const baseHeightY = 12.6 * camDistScale; // atan(12.6 / 16.8) = 36.87 deg pitch
    const followWeight = camDistScale > 1.3 ? 0.28 : 0.55;

    const targetX = pState.x * followWeight;
    const targetZ = pState.z * 0.42 - 1.8;
    return {
      camX: targetX,
      camY: baseHeightY + 0.85,
      camZ: targetZ + basePullZ,
      targetX,
      targetY: 0.85,
      targetZ,
    };
  };

  const camTarget = new THREE.Vector3(0, 0.85, 1.35);
  const projVec = new THREE.Vector3();
  const boxMinVec = new THREE.Vector3();

  const resize = () => {
    if (!alive || !container) return;
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    const aspect = w / h;

    camera.aspect = aspect;
    camera.fov = aspect < 0.85 ? 52 : 46;
    // Keep camera framing so all 5 buildings fit comfortably at 390px and 1280px
    camDistScale =
      aspect < 1.15
        ? Math.min(3.15, Math.max(1.04, 1.38 / Math.max(aspect, 0.4)))
        : 1.04;

    scene.fog.near = 21 * camDistScale;
    scene.fog.far = 52 * camDistScale;

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
      buildings: BUILDINGS,
    });

    playerCtrl.update(playerState, dt, { reducedMotion });
    propsCtrl.update(dt, { reducedMotion });

    const nearest = findNearestBuilding(playerState, BUILDINGS);
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
    dispose: () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      groundGradientTex.dispose();
      buildingsCtrl.dispose?.();

      scene.traverse((obj) => {
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

      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
  };
};
