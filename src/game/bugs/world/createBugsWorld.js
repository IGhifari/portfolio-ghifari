import * as THREE from 'three';
import {
  BUGS_CONFIG,
  BUG_TYPES,
  canSpawnBug,
  createBugEntity,
  stepBugMovement,
  applyBugHit,
  applyServerDamage,
  applyServerHeal,
  selectTargetBug,
  createWaveState,
  stepWaveState,
} from '../logic/bugsLogic.js';

const COLOR_BG = 0x080808;
const COLOR_SURFACE = 0x141418;
const COLOR_EDGE = 0x3f3f46;
const COLOR_ACCENT = 0x3b82f6;
const COLOR_BUG_RED = 0xef4444;

/**
 * Initializes the Three.js Orthographic arena for "Bug Hunter" inside `container`.
 * Uses a fixed pre-allocated object pool so zero geometries or textures are created during gameplay.
 */
export const createBugsWorld = (
  container,
  {
    isMobile = false,
    reducedMotion = false,
    onStateChange = () => {},
    onWaveCleared = () => {},
    onGameOver = () => {},
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
  renderer.setClearColor(COLOR_BG, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const canvas = renderer.domElement;
  canvas.className = 'block w-full h-full select-none touch-none';
  canvas.setAttribute('aria-label', 'Bug Hunter 3D Mini-Game Canvas');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR_BG);
  scene.fog = new THREE.Fog(COLOR_BG, 22, 54);

  // Isometric OrthographicCamera
  const camera = new THREE.OrthographicCamera(-9, 9, 9, -9, 0.1, 100);
  camera.position.set(13, 14.5, 13);
  camera.lookAt(0, 0, 0);

  // Lighting matching DESIGN.md & Deploy Stack
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x09090b, 0.78);
  hemiLight.position.set(0, 25, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xf8fafc, 1.35);
  dirLight.position.set(14, 24, 16);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
  rimLight.position.set(-16, 12, -14);
  scene.add(rimLight);

  // Shared Geometries & Materials (disposed cleanly on unmount)
  const sharedGeos = [];
  const sharedMats = [];
  const trackGeo = (g) => {
    sharedGeos.push(g);
    return g;
  };
  const trackMat = (m) => {
    sharedMats.push(m);
    return m;
  };

  const surfaceMat = trackMat(
    new THREE.MeshStandardMaterial({ color: COLOR_SURFACE, roughness: 0.75, metalness: 0.18 })
  );
  const darkMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.15 })
  );
  const accentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: COLOR_ACCENT,
      emissive: COLOR_ACCENT,
      emissiveIntensity: 0.45,
      roughness: 0.35,
    })
  );
  const bugRedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: COLOR_BUG_RED,
      emissive: COLOR_BUG_RED,
      emissiveIntensity: 0.25,
      roughness: 0.48,
    })
  );
  const bugFlashMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xf4f4f5 })
  );
  const edgeMat = trackMat(
    new THREE.LineBasicMaterial({ color: COLOR_EDGE, transparent: true, opacity: 0.85 })
  );

  // Arena Floor Grid & Perimeter Ring
  const gridHelper = new THREE.GridHelper(20, 20, 0x222530, 0x14161d);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  const arenaRingGeo = trackGeo(
    new THREE.RingGeometry(BUGS_CONFIG.arenaRadius - 0.025, BUGS_CONFIG.arenaRadius + 0.025, 64)
  );
  arenaRingGeo.rotateX(-Math.PI / 2);
  const arenaRingMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x1f1f23,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    })
  );
  const arenaRing = new THREE.Mesh(arenaRingGeo, arenaRingMat);
  arenaRing.position.y = 0.01;
  scene.add(arenaRing);

  // Central Server Monolith
  const serverGroup = new THREE.Group();
  const serverBoxGeo = trackGeo(new THREE.BoxGeometry(1.35, 1.75, 1.35));
  const serverEdgesGeo = trackGeo(new THREE.EdgesGeometry(serverBoxGeo));
  const serverMesh = new THREE.Mesh(serverBoxGeo, surfaceMat);
  serverMesh.position.y = 0.875;
  serverMesh.add(new THREE.LineSegments(serverEdgesGeo, edgeMat));
  serverGroup.add(serverMesh);

  const bladeGeo = trackGeo(new THREE.BoxGeometry(1.42, 0.1, 1.42));
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(bladeGeo, accentMat);
    blade.position.y = 0.45 + i * 0.45;
    serverGroup.add(blade);
  }

  const serverRingGeo = trackGeo(
    new THREE.RingGeometry(BUGS_CONFIG.serverRadius + 0.12, BUGS_CONFIG.serverRadius + 0.26, 32)
  );
  serverRingGeo.rotateX(-Math.PI / 2);
  const serverRingMat = trackMat(
    new THREE.MeshBasicMaterial({ color: COLOR_ACCENT, side: THREE.DoubleSide })
  );
  const serverRing = new THREE.Mesh(serverRingGeo, serverRingMat);
  serverRing.position.y = 0.02;
  serverGroup.add(serverRing);
  scene.add(serverGroup);

  // Squash Feedback Ring Pool (4 reusable rings)
  const squashRingGeo = trackGeo(new THREE.RingGeometry(0.28, 0.42, 20));
  squashRingGeo.rotateX(-Math.PI / 2);
  const squashEffects = Array.from({ length: 4 }, () => {
    const mat = trackMat(
      new THREE.MeshBasicMaterial({
        color: COLOR_BUG_RED,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    const mesh = new THREE.Mesh(squashRingGeo, mat);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, mat, timer: 0 };
  });

  // Pre-allocated Low-Poly Bug Mesh Pool (24 slots = 17 regular + 1 boss + 6 minions)
  const carapaceGeo = trackGeo(new THREE.BoxGeometry(0.56, 0.3, 0.72));
  const carapaceEdgesGeo = trackGeo(new THREE.EdgesGeometry(carapaceGeo));
  const headGeo = trackGeo(new THREE.BoxGeometry(0.36, 0.22, 0.26));
  const legBarGeo = trackGeo(new THREE.BoxGeometry(1.08, 0.08, 0.12));
  const antennaGeo = trackGeo(new THREE.BoxGeometry(0.05, 0.05, 0.26));
  const pipGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.12, 0.16));

  const poolSlots = Array.from({ length: BUGS_CONFIG.poolCapacity }, () => {
    const group = new THREE.Group();
    group.visible = false;

    const shell = new THREE.Mesh(carapaceGeo, bugRedMat);
    shell.position.y = 0.24;
    shell.add(new THREE.LineSegments(carapaceEdgesGeo, edgeMat));
    group.add(shell);

    const head = new THREE.Mesh(headGeo, darkMat);
    head.position.set(0, 0.2, 0.42);
    group.add(head);

    // Left and right low-poly antennae angled forward-outward
    const leftAntenna = new THREE.Mesh(antennaGeo, darkMat);
    leftAntenna.position.set(-0.11, 0.28, 0.58);
    leftAntenna.rotation.set(-0.24, 0.28, 0);
    group.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(antennaGeo, darkMat);
    rightAntenna.position.set(0.11, 0.28, 0.58);
    rightAntenna.rotation.set(-0.24, -0.28, 0);
    group.add(rightAntenna);

    const legs = [-0.2, 0, 0.2].map((zOff) => {
      const leg = new THREE.Mesh(legBarGeo, darkMat);
      leg.position.set(0, 0.12, zOff);
      group.add(leg);
      return leg;
    });

    // 3 floating HP pips above Tank bugs
    const pips = [-0.22, 0, 0.22].map((xOff) => {
      const pip = new THREE.Mesh(pipGeo, bugRedMat);
      pip.position.set(xOff, 0.62, 0);
      pip.visible = false;
      group.add(pip);
      return pip;
    });

    scene.add(group);
    return { group, shell, legs, pips, bugId: null, flashTimer: 0 };
  });

  let activeBugs = [];
  let waveState = createWaveState(1);
  let serverHp = BUGS_CONFIG.maxServerHp;
  let score = 0;
  let comboState = { combo: 0, lastKillMs: -Infinity };
  let nextBugId = 1;
  let isGameOver = false;
  let paused = false;
  let alive = true;
  let rafId = 0;
  let lastTime = performance.now();
  let walkClock = 0;
  const projVec = new THREE.Vector3();

  const emitState = () => {
    const boss = activeBugs.find((b) => b.type === 'boss') || null;
    onStateChange({
      score,
      combo: comboState.combo,
      wave: waveState.wave,
      serverHp,
      maxServerHp: BUGS_CONFIG.maxServerHp,
      boss: boss ? { hp: boss.hp, maxHp: boss.maxHp } : null,
    });
  };

  const syncPoolToActiveBugs = (dt) => {
    walkClock += dt * 14;
    const activeById = new Map(activeBugs.map((b) => [b.id, b]));

    // Release slots whose bug is no longer alive
    for (const slot of poolSlots) {
      if (slot.bugId !== null && !activeById.has(slot.bugId)) {
        slot.bugId = null;
        slot.group.visible = false;
        slot.flashTimer = 0;
      }
    }

    // Assign or update slots for all active bugs
    for (const bug of activeBugs) {
      let slot = poolSlots.find((s) => s.bugId === bug.id);
      if (!slot) {
        slot = poolSlots.find((s) => s.bugId === null);
        if (!slot) continue;
        slot.bugId = bug.id;
        slot.group.visible = true;
        slot.flashTimer = 0;
      }

      slot.group.position.set(bug.x, 0, bug.z);
      slot.group.rotation.y = bug.angle;
      slot.group.scale.setScalar(bug.scale);

      if (slot.flashTimer > 0) {
        slot.flashTimer = Math.max(0, slot.flashTimer - dt);
        slot.shell.material = slot.flashTimer > 0 ? bugFlashMat : bugRedMat;
      } else {
        slot.shell.material = bugRedMat;
      }

      if (!reducedMotion) {
        const wobble = Math.sin(walkClock + bug.id * 1.7) * 0.14;
        slot.legs[0].rotation.y = wobble;
        slot.legs[1].rotation.y = -wobble;
        slot.legs[2].rotation.y = wobble;
      }

      // Show remaining HP pips on Tank bugs
      const showPips = bug.type === 'tank';
      for (let i = 0; i < 3; i++) {
        slot.pips[i].visible = showPips && i < bug.hp;
      }
    }
  };

  const triggerSquashEffect = (x, z) => {
    const fx = squashEffects.find((e) => e.timer <= 0) || squashEffects[0];
    fx.timer = 0.28;
    fx.mesh.position.set(x, 0.04, z);
    fx.mesh.scale.setScalar(1);
    fx.mat.opacity = reducedMotion ? 0.45 : 0.85;
    fx.mesh.visible = true;
  };

  const resetGame = (startWave = 1) => {
    activeBugs = [];
    waveState = createWaveState(startWave);
    serverHp = BUGS_CONFIG.maxServerHp;
    score = 0;
    comboState = { combo: 0, lastKillMs: -Infinity };
    isGameOver = false;
    serverRingMat.color.setHex(COLOR_ACCENT);
    for (const slot of poolSlots) {
      slot.bugId = null;
      slot.group.visible = false;
    }
    emitState();
  };

  const handlePointerHit = (clientX, clientY) => {
    if (!alive || paused || isGameOver || activeBugs.length === 0) return false;
    const rect = container.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);

    const candidates = activeBugs.map((b) => {
      projVec.set(b.x, 0.3 * b.scale, b.z).project(camera);
      return {
        id: b.id,
        x: b.x,
        z: b.z,
        distToServer: b.distToServer,
        screenX: (projVec.x * 0.5 + 0.5) * w,
        screenY: (-projVec.y * 0.5 + 0.5) * h,
        // At least 48px diameter (>= 44px touch requirement), scaled up for Tank/Boss
        hitRadiusPx: Math.max(24, Math.round(25 * b.scale)),
      };
    });

    const target = selectTargetBug({ x: localX, y: localY }, candidates);
    if (!target) return false;

    const idx = activeBugs.findIndex((b) => b.id === target.id);
    if (idx === -1) return false;

    const hitRes = applyBugHit(activeBugs[idx], performance.now(), comboState, BUGS_CONFIG);
    comboState = hitRes.comboState;

    if (hitRes.killed) {
      const deadBug = activeBugs[idx];
      activeBugs.splice(idx, 1);
      score += hitRes.scoreDelta;
      if (hitRes.serverHeal > 0) {
        serverHp = applyServerHeal(serverHp, hitRes.serverHeal, BUGS_CONFIG);
        serverRingMat.color.setHex(serverHp <= 2 ? COLOR_BUG_RED : COLOR_ACCENT);
      }
      triggerSquashEffect(deadBug.x, deadBug.z);
    } else {
      activeBugs[idx] = hitRes.bug;
      const slot = poolSlots.find((s) => s.bugId === target.id);
      if (slot) slot.flashTimer = 0.12;
    }

    emitState();
    return true;
  };

  const updateCameraFrustum = () => {
    if (!alive || !container) return;
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    const aspect = w / h;

    const halfW = aspect < 1 ? 8.1 : 7.6 * aspect;
    const halfH = halfW / aspect;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const tick = (now) => {
    if (!alive) return;
    if (document.hidden) {
      rafId = 0;
      return;
    }

    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.08);
    lastTime = now;

    if (!paused && !isGameOver) {
      // 1. Step wave scheduler
      const waveStep = stepWaveState(
        waveState,
        activeBugs,
        dt,
        Math.random,
        () => nextBugId++,
        BUGS_CONFIG
      );
      waveState = waveStep.waveState;
      if (waveStep.newlySpawned.length > 0) {
        activeBugs.push(...waveStep.newlySpawned);
      }
      if (waveStep.waveCleared) {
        onWaveCleared(waveState.wave);
      }

      // 2. Step active bugs toward server & Boss minion spawns
      let stateChanged = waveStep.newlySpawned.length > 0 || waveStep.startedNewWave;
      const spawnedMinions = [];

      for (let i = activeBugs.length - 1; i >= 0; i--) {
        const moved = stepBugMovement(activeBugs[i], dt, BUGS_CONFIG);
        if (moved.reachedServer) {
          activeBugs.splice(i, 1);
          const dmgRes = applyServerDamage(serverHp, moved.type, BUGS_CONFIG);
          serverHp = dmgRes.hp;
          serverRingMat.color.setHex(serverHp <= 2 ? COLOR_BUG_RED : COLOR_ACCENT);
          stateChanged = true;

          if (dmgRes.gameOver) {
            isGameOver = true;
            emitState();
            onGameOver({ score, wave: waveState.wave });
            break;
          }
          continue;
        }

        // Boss spawns small crawlers while alive using separate minion budget
        if (moved.type === 'boss') {
          moved.minionTimerSec -= dt;
          if (moved.minionTimerSec <= 0) {
            moved.minionTimerSec = BUG_TYPES.boss.minionSpawnIntervalSec;
            if (canSpawnBug([...activeBugs, ...spawnedMinions], 'minion', BUGS_CONFIG)) {
              const offsetAngle = Math.atan2(moved.z, moved.x) + (Math.random() - 0.5) * 0.5;
              const r = Math.min(BUGS_CONFIG.arenaRadius, Math.max(2.2, moved.distToServer + 0.6));
              spawnedMinions.push(
                createBugEntity({
                  id: nextBugId++,
                  type: 'crawler',
                  wave: waveState.wave,
                  angleRad: offsetAngle,
                  spawnRadius: r,
                  isMinion: true,
                  config: BUGS_CONFIG,
                })
              );
              stateChanged = true;
            }
          }
        }

        activeBugs[i] = moved;
      }

      if (spawnedMinions.length > 0 && !isGameOver) {
        activeBugs.push(...spawnedMinions);
      }

      // Expire combo if window elapsed
      if (
        comboState.combo > 0 &&
        now - comboState.lastKillMs > BUGS_CONFIG.comboWindowMs
      ) {
        comboState = { combo: 0, lastKillMs: comboState.lastKillMs };
        stateChanged = true;
      }

      if (stateChanged) emitState();
    }

    // Animate squash rings
    for (const fx of squashEffects) {
      if (fx.timer > 0) {
        fx.timer = Math.max(0, fx.timer - dt);
        const p = 1 - fx.timer / 0.28;
        fx.mesh.scale.setScalar(reducedMotion ? 1.15 : 1 + p * 0.85);
        fx.mat.opacity = (1 - p) * (reducedMotion ? 0.45 : 0.85);
        if (fx.timer === 0) fx.mesh.visible = false;
      }
    }

    syncPoolToActiveBugs(dt);
    renderer.render(scene, camera);
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

  const resizeObserver = new ResizeObserver(updateCameraFrustum);
  resizeObserver.observe(container);
  document.addEventListener('visibilitychange', onVisibilityChange);

  resetGame(1);
  updateCameraFrustum();
  startLoop();

  return {
    hitAtClientPos: handlePointerHit,
    restart: () => resetGame(1),
    setWaveForTest: (w) => resetGame(w),
    getMemoryInfo: () => ({
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    }),
    setPaused: (next) => {
      paused = Boolean(next);
    },
    dispose: () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);

      sharedGeos.forEach((g) => g.dispose());
      sharedMats.forEach((m) => m.dispose());
      gridHelper.geometry?.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach((m) => m.dispose?.());
      } else {
        gridHelper.material?.dispose?.();
      }

      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
  };
};
