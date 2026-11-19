import * as THREE from 'three';
import {
  STACK_CONFIG,
  extractTechLabels,
  formatTechLabel,
  fitLabelToBlock,
  createSlidingBlock,
  stepSlidingBlock,
  computePlacement,
} from '../logic/stackLogic.js';
import { DEFAULT_GAME_THEME } from '../../shared/seasonalGameTheme.js';
import { createSeasonalAtmosphere } from '../../shared/createSeasonalAtmosphere.js';

/**
 * Creates a cached 2D CanvasTexture for a block's top face with its tech name fitted
 * to the block's exact (width x depth) dimensions so it never overflows on narrow blocks.
 */
const createBlockTopTexture = (
  labelText,
  {
    isAccent = false,
    width = STACK_CONFIG.initialWidth,
    depth = STACK_CONFIG.initialDepth,
    theme = DEFAULT_GAME_THEME,
  } = {}
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = isAccent ? theme.blockAccentFillHex : theme.blockFaceFillHex;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = isAccent ? theme.blockAccentBorderHex : theme.blockFaceBorderHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 240, 240);

    const fitted = fitLabelToBlock(labelText, width, depth, STACK_CONFIG);
    if (fitted.text) {
      ctx.save();
      ctx.translate(128, 128);

      // Counter-scale for non-square block aspect ratio so glyphs stay proportional
      const safeW = Math.max(0.25, width);
      const safeD = Math.max(0.25, depth);
      if (fitted.rotate90) {
        ctx.rotate(Math.PI / 2);
        ctx.scale(1, safeW / safeD);
      } else {
        ctx.scale(1, safeD / safeW);
      }

      let fontPx = Math.max(12, Math.round(26 * fitted.fontScale));
      ctx.font = `bold ${fontPx}px monospace`;
      const maxAllowedPx = 196;
      const measured = ctx.measureText(fitted.text).width;
      if (measured > maxAllowedPx && measured > 0) {
        fontPx = Math.max(10, Math.floor((fontPx * maxAllowedPx) / measured));
        ctx.font = `bold ${fontPx}px monospace`;
      }

      ctx.fillStyle = theme.blockTextHex;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fitted.text, 0, 0);
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Initializes the Three.js Orthographic scene for "Deploy Stack" inside `container`.
 */
export const createStackWorld = (
  container,
  {
    isMobile = false,
    reducedMotion = false,
    seasonalTheme = DEFAULT_GAME_THEME,
    onScoreChange = () => {},
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
  canvas.setAttribute('aria-label', 'Deploy Stack 3D Mini-Game Canvas');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme.sceneBg);
  scene.fog = new THREE.Fog(
    theme.sceneBg,
    18 * theme.fogNearMult,
    46 * theme.fogFarMult
  );

  // OrthographicCamera for crisp isometric geometry and stable block size at any aspect ratio
  const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);

  // Lighting matching DESIGN.md & seasonal atmosphere
  const hemiLight = new THREE.HemisphereLight(
    theme.hemiSky,
    theme.hemiGround,
    theme.hemiIntensity
  );
  hemiLight.position.set(0, 25, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(theme.dirLight, theme.dirIntensity);
  dirLight.position.set(14, 24, 16);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(theme.rimColor, theme.rimIntensity);
  rimLight.position.set(-16, 14, -14);
  scene.add(rimLight);

  // Shared geometries & materials
  const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  const unitEdgesGeo = new THREE.EdgesGeometry(unitBoxGeo);
  const sideMat = new THREE.MeshStandardMaterial({
    color: theme.surface,
    roughness: 0.68,
    metalness: 0.2,
  });
  const baseMat = new THREE.MeshStandardMaterial({
    color: theme.blockBase,
    roughness: 0.85,
    metalness: 0.12,
  });
  const overhangMat = new THREE.MeshStandardMaterial({
    color: theme.blockOverhang,
    roughness: 0.7,
    metalness: 0.15,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: theme.edgeDefault,
    transparent: true,
    opacity: 0.88,
  });
  const accentEdgeMat = new THREE.LineBasicMaterial({
    color: theme.accent,
    transparent: true,
    opacity: 0.96,
  });

  // Perfect-drop flash ring
  const flashRingGeo = new THREE.RingGeometry(0.48, 0.56, 32);
  flashRingGeo.rotateX(-Math.PI / 2);
  const flashRingMat = new THREE.MeshBasicMaterial({
    color: theme.accent,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const flashRingMesh = new THREE.Mesh(flashRingGeo, flashRingMat);
  flashRingMesh.visible = false;
  scene.add(flashRingMesh);

  // Subtle floor grid directly beneath the base block
  const gridHelper = new THREE.GridHelper(32, 16, theme.gridMajor, theme.gridMinor);
  gridHelper.position.y = -STACK_CONFIG.blockHeight * 0.5;
  scene.add(gridHelper);

  const seasonalAtmosphere = createSeasonalAtmosphere(scene, theme, {
    isMobile,
    reducedMotion,
    spanX: 16,
    spanY: 14,
    spanZ: 16,
    baseY: -4,
  });

  const techLabels = extractTechLabels();
  const textureCache = new Map();
  const topMaterialCache = new Map();

  const getTopMaterial = (label, isAccent = false, width = STACK_CONFIG.initialWidth, depth = STACK_CONFIG.initialDepth) => {
    const clean = formatTechLabel(label);
    const wKey = Math.round(width * 10);
    const dKey = Math.round(depth * 10);
    const cacheKey = `${clean}:${isAccent ? '1' : '0'}:${wKey}x${dKey}`;
    if (topMaterialCache.has(cacheKey)) {
      return topMaterialCache.get(cacheKey);
    }
    let tex = textureCache.get(cacheKey);
    if (!tex) {
      tex = createBlockTopTexture(clean, { isAccent, width, depth, theme });
      textureCache.set(cacheKey, tex);
    }
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.58,
      metalness: 0.15,
    });
    topMaterialCache.set(cacheKey, mat);
    return mat;
  };

  const buildBlockMesh = ({ x, y, z, width, depth, label, isAccent = false, isBase = false }) => {
    const topMat = getTopMaterial(label, isAccent, width, depth);
    const bodySide = isBase ? baseMat : sideMat;
    const materials = [bodySide, bodySide, topMat, bodySide, bodySide, bodySide];
    const mesh = new THREE.Mesh(unitBoxGeo, materials);
    mesh.position.set(x, y, z);
    mesh.scale.set(width, STACK_CONFIG.blockHeight, depth);

    const edges = new THREE.LineSegments(
      unitEdgesGeo,
      isAccent ? accentEdgeMat : edgeMat
    );
    mesh.add(edges);
    scene.add(mesh);
    return mesh;
  };

  let towerBlocks = [];
  let towerMeshes = [];
  let fallingPieces = [];
  let slidingState = null;
  let slidingMesh = null;
  let score = 0;
  let combo = 0;
  let isGameOver = false;
  let paused = false;
  let alive = true;
  let rafId = 0;
  let lastTime = performance.now();
  let camFocusY = 0;
  let flashTimer = 0;
  let flashSpan = 3.2;

  const clearSceneBlocks = () => {
    for (const m of towerMeshes) scene.remove(m);
    for (const fp of fallingPieces) scene.remove(fp.mesh);
    if (slidingMesh) scene.remove(slidingMesh);
    towerMeshes = [];
    fallingPieces = [];
    slidingMesh = null;
  };

  const spawnNextSliding = () => {
    const topBlock = towerBlocks[towerBlocks.length - 1];
    const nextLevel = towerBlocks.length;
    slidingState = createSlidingBlock(nextLevel, topBlock, techLabels, STACK_CONFIG);
    slidingMesh = buildBlockMesh({
      ...slidingState,
      isAccent: true,
    });
  };

  // Keeps the active top block in the upper-middle of the screen, well below the top Score HUD
  const getTargetCamFocusY = () => {
    const activeTopY = towerBlocks.length * STACK_CONFIG.blockHeight;
    return activeTopY - 0.35;
  };

  const resetGame = () => {
    clearSceneBlocks();
    score = 0;
    combo = 0;
    isGameOver = false;
    flashTimer = 0;
    flashRingMesh.visible = false;

    // Level 0 base block — same height as all other blocks (no tall pillar)
    const baseBlock = {
      level: 0,
      label: formatTechLabel(techLabels[0]),
      x: 0,
      y: 0,
      z: 0,
      width: STACK_CONFIG.initialWidth,
      depth: STACK_CONFIG.initialDepth,
    };
    towerBlocks = [baseBlock];
    const baseMesh = buildBlockMesh({ ...baseBlock, isBase: true });
    towerMeshes.push(baseMesh);

    camFocusY = getTargetCamFocusY();
    spawnNextSliding();
    onScoreChange({ score: 0, combo: 0, currentLabel: slidingState.label, isPerfect: false });
  };

  const dropCurrentBlock = () => {
    if (!alive || paused || isGameOver || !slidingState) return false;

    const topBlock = towerBlocks[towerBlocks.length - 1];
    const result = computePlacement(slidingState, topBlock, combo, STACK_CONFIG);

    scene.remove(slidingMesh);
    slidingMesh = null;

    if (result.overhangPiece) {
      const op = result.overhangPiece;
      const pieceMesh = new THREE.Mesh(unitBoxGeo, overhangMat);
      pieceMesh.position.set(op.x, op.y, op.z);
      pieceMesh.scale.set(op.width, STACK_CONFIG.blockHeight, op.depth);
      pieceMesh.add(new THREE.LineSegments(unitEdgesGeo, edgeMat));
      scene.add(pieceMesh);
      fallingPieces.push({
        mesh: pieceMesh,
        vy: -1.5,
        axis: op.axis,
        dir: op.direction,
      });
    }

    if (result.gameOver) {
      isGameOver = true;
      slidingState = null;
      onGameOver({ score, combo: 0 });
      return false;
    }

    const placed = result.placedBlock;
    towerBlocks.push(placed);
    const placedMesh = buildBlockMesh({
      ...placed,
      isAccent: result.isPerfect,
    });
    towerMeshes.push(placedMesh);

    // Prune meshes far below camera view to keep scene lightweight
    while (towerMeshes.length > 26) {
      const oldMesh = towerMeshes.shift();
      if (oldMesh) scene.remove(oldMesh);
    }

    if (result.isPerfect) {
      flashTimer = 0.42;
      flashSpan = Math.max(placed.width, placed.depth) * 1.15;
      flashRingMesh.position.set(
        placed.x,
        placed.y + STACK_CONFIG.blockHeight * 0.52,
        placed.z
      );
      flashRingMesh.scale.set(flashSpan, 1, flashSpan);
      flashRingMat.opacity = reducedMotion ? 0.45 : 0.85;
      flashRingMesh.visible = true;
    }

    score += 1;
    combo = result.combo;
    spawnNextSliding();

    onScoreChange({
      score,
      combo,
      currentLabel: slidingState.label,
      isPerfect: result.isPerfect,
      widened: result.widened,
    });
    return true;
  };

  const updateCameraFrustum = () => {
    if (!alive || !container) return;
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    const aspect = w / h;

    // Ensure horizontal world span >= 10.6 units even on 390px portrait screens
    const halfW = aspect < 1 ? 5.35 : 5.0 * aspect;
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

    if (!paused && !isGameOver && slidingState && slidingMesh) {
      slidingState = stepSlidingBlock(slidingState, dt, STACK_CONFIG);
      slidingMesh.position.set(slidingState.x, slidingState.y, slidingState.z);
    }

    // Animate falling overhang pieces
    for (let i = fallingPieces.length - 1; i >= 0; i--) {
      const fp = fallingPieces[i];
      fp.vy -= 18 * dt;
      fp.mesh.position.y += fp.vy * dt;
      if (fp.axis === 'x') {
        fp.mesh.position.x += fp.dir * 1.4 * dt;
        if (!reducedMotion) fp.mesh.rotation.z -= fp.dir * 2.8 * dt;
      } else {
        fp.mesh.position.z += fp.dir * 1.4 * dt;
        if (!reducedMotion) fp.mesh.rotation.x += fp.dir * 2.8 * dt;
      }
      if (fp.mesh.position.y < camFocusY - 12) {
        scene.remove(fp.mesh);
        fallingPieces.splice(i, 1);
      }
    }

    // Perfect-drop flash ring animation
    if (flashTimer > 0) {
      flashTimer = Math.max(0, flashTimer - dt);
      const progress = 1 - flashTimer / 0.42;
      const scale = reducedMotion ? flashSpan * 1.15 : flashSpan * (1 + progress * 0.65);
      flashRingMesh.scale.set(scale, 1, scale);
      flashRingMat.opacity = (1 - progress) * (reducedMotion ? 0.45 : 0.85);
      if (flashTimer === 0) flashRingMesh.visible = false;
    }

    // Smoothly follow tower upward so the top block stays below the Score HUD
    const targetY = getTargetCamFocusY();
    const lerp = reducedMotion ? 1 : Math.min(1, dt * 7.5);
    camFocusY += (targetY - camFocusY) * lerp;

    camera.position.set(11.5, camFocusY + 10.5, 11.5);
    camera.lookAt(0, camFocusY, 0);

    seasonalAtmosphere.update(paused || isGameOver ? 0 : dt, { focusY: camFocusY });

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

  resetGame();
  updateCameraFrustum();
  startLoop();

  return {
    drop: dropCurrentBlock,
    restart: resetGame,
    setPaused: (next) => {
      paused = Boolean(next);
    },
    dispose: () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearSceneBlocks();

      unitBoxGeo.dispose();
      unitEdgesGeo.dispose();
      flashRingGeo.dispose();
      sideMat.dispose();
      baseMat.dispose();
      overhangMat.dispose();
      edgeMat.dispose();
      accentEdgeMat.dispose();
      flashRingMat.dispose();
      gridHelper.geometry?.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach((m) => m.dispose?.());
      } else {
        gridHelper.material?.dispose?.();
      }

      topMaterialCache.forEach((mat) => mat.dispose());
      topMaterialCache.clear();
      textureCache.forEach((tex) => tex.dispose());
      textureCache.clear();
      seasonalAtmosphere.dispose();

      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
  };
};
