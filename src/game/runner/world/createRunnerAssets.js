import * as THREE from 'three';
import {
  RUNNER_CONFIG,
  extractTechLabels,
  formatTechLabel,
} from '../logic/runnerLogic.js';

export const RUNNER_COLORS = {
  bg: 0x080808,
  surface: 0x1a1a22,
  dark: 0x1e1e26,
  edge: 0x52525b,
  firewallEdge: 0x71717a,
  accent: 0x3b82f6,
  obstacleRed: 0xef4444,
  trackSurface: 0x16161c,
  trackShoulder: 0x0c0c10,
  laneMark: 0x3a3a48,
};

/**
 * Builds shared geometries, materials, cached tech token CanvasTextures,
 * and pre-allocated object pools for Stack Runner with complete disposal tracking.
 */
export const createRunnerAssets = ({ isMobile = false } = {}) => {
  const geos = [];
  const mats = [];
  const textures = [];

  const trackGeo = (g) => {
    geos.push(g);
    return g;
  };
  const trackMat = (m) => {
    mats.push(m);
    return m;
  };
  const trackTex = (t) => {
    textures.push(t);
    return t;
  };

  // Shared Materials
  const materials = {
    track: trackMat(
      new THREE.MeshStandardMaterial({ color: RUNNER_COLORS.trackSurface, roughness: 0.86, metalness: 0.08 })
    ),
    shoulder: trackMat(
      new THREE.MeshStandardMaterial({ color: RUNNER_COLORS.trackShoulder, roughness: 0.95, metalness: 0.04 })
    ),
    surface: trackMat(
      new THREE.MeshStandardMaterial({ color: RUNNER_COLORS.surface, roughness: 0.68, metalness: 0.16 })
    ),
    dark: trackMat(
      new THREE.MeshStandardMaterial({ color: RUNNER_COLORS.dark, roughness: 0.68, metalness: 0.14 })
    ),
    laneMark: trackMat(
      new THREE.MeshBasicMaterial({ color: RUNNER_COLORS.laneMark })
    ),
    accent: trackMat(
      new THREE.MeshStandardMaterial({
        color: RUNNER_COLORS.accent,
        emissive: RUNNER_COLORS.accent,
        emissiveIntensity: 0.55,
        roughness: 0.3,
      })
    ),
    red: trackMat(
      new THREE.MeshStandardMaterial({
        color: RUNNER_COLORS.obstacleRed,
        emissive: RUNNER_COLORS.obstacleRed,
        emissiveIntensity: 0.3,
        roughness: 0.44,
      })
    ),
    edge: trackMat(
      new THREE.LineBasicMaterial({ color: RUNNER_COLORS.edge, transparent: true, opacity: 0.9 })
    ),
    firewallEdge: trackMat(
      new THREE.LineBasicMaterial({ color: RUNNER_COLORS.firewallEdge, transparent: true, opacity: 0.95 })
    ),
    accentEdge: trackMat(
      new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.85 })
    ),
    // Runner player materials (transparent enabled for soft non-disappearing invuln pulse)
    playerTorso: trackMat(
      new THREE.MeshStandardMaterial({ color: 0x262630, roughness: 0.55, metalness: 0.16, transparent: true, opacity: 1 })
    ),
    playerLimb: trackMat(
      new THREE.MeshStandardMaterial({ color: 0x363642, roughness: 0.58, metalness: 0.15, transparent: true, opacity: 1 })
    ),
    playerLight: trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 1 })
    ),
    playerAccent: trackMat(
      new THREE.MeshStandardMaterial({
        color: RUNNER_COLORS.accent,
        emissive: RUNNER_COLORS.accent,
        emissiveIntensity: 0.72,
        roughness: 0.25,
        transparent: true,
        opacity: 1,
      })
    ),
    shadow: trackMat(
      new THREE.MeshBasicMaterial({ color: 0x040406, transparent: true, opacity: 0.52 })
    ),
    shieldRing: trackMat(
      new THREE.MeshBasicMaterial({ color: RUNNER_COLORS.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    ),
  };

  // Procedural Low-Poly Runner Character (matching Explore's createPlayer visual language)
  const buildRunnerCharacter = () => {
    const root = new THREE.Group();
    const rig = new THREE.Group();
    root.add(rig);

    const torsoGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.54, 0.3));
    const torso = new THREE.Mesh(torsoGeo, materials.playerTorso);
    torso.position.y = 0.76;
    torso.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(torsoGeo)), materials.edge));
    rig.add(torso);

    // Shoulder / collar + backpack accents clearly visible from 3rd-person camera behind
    const collar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.07, 0.32)), materials.playerAccent);
    collar.position.set(0, 1.02, 0);
    rig.add(collar);

    const pack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.36, 0.14)), materials.playerLimb);
    pack.position.set(0, 0.78, 0.2);
    const packStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.08, 0.04)), materials.playerAccent);
    packStrip.position.set(0, 0.84, 0.28);
    rig.add(pack, packStrip);

    const head = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.38, 0.4)), materials.playerLight);
    head.position.y = 1.26;
    // Wrap-around visor band extending along temples and subtle rear indicator for 3rd-person clarity
    const visor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.44, 0.11, 0.32)), materials.playerAccent);
    visor.position.set(0, 1.28, -0.05);
    rig.add(head, visor);

    const armGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.36, 0.15));
    const handGeo = trackGeo(new THREE.BoxGeometry(0.13, 0.12, 0.13));
    const makeArm = (side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.33, 0.98, 0);
      const arm = new THREE.Mesh(armGeo, materials.playerLimb);
      arm.position.y = -0.16;
      const hand = new THREE.Mesh(handGeo, materials.playerLight);
      hand.position.y = -0.38;
      pivot.add(arm, hand);
      rig.add(pivot);
      return pivot;
    };
    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);

    const legGeo = trackGeo(new THREE.BoxGeometry(0.17, 0.36, 0.17));
    const bootGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.12, 0.24));
    const makeLeg = (side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.14, 0.49, 0);
      const leg = new THREE.Mesh(legGeo, materials.playerLimb);
      leg.position.y = -0.18;
      const boot = new THREE.Mesh(bootGeo, materials.playerLight);
      boot.position.set(0, -0.42, -0.02);
      pivot.add(leg, boot);
      rig.add(pivot);
      return pivot;
    };
    const leftLeg = makeLeg(-1);
    const rightLeg = makeLeg(1);

    // Track-level grounding shadow disc (stays at y = 0.025 even while jumping)
    const shadowGeo = trackGeo(new THREE.CircleGeometry(0.42, 16));
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMesh = new THREE.Mesh(shadowGeo, materials.shadow);
    shadowMesh.position.y = 0.025;

    // Invulnerability shield ring at player feet (replaces disorienting 0%-visibility flicker)
    const shieldRingGeo = trackGeo(new THREE.RingGeometry(0.56, 0.68, 24));
    shieldRingGeo.rotateX(-Math.PI / 2);
    const shieldRing = new THREE.Mesh(shieldRingGeo, materials.shieldRing);
    shieldRing.position.y = 0.035;
    shieldRing.visible = false;

    return {
      root,
      rig,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      shadowMesh,
      shieldRing,
      setOpacity: (opacity) => {
        materials.playerTorso.opacity = opacity;
        materials.playerLimb.opacity = opacity;
        materials.playerLight.opacity = opacity;
        materials.playerAccent.opacity = opacity;
      },
    };
  };

  // Cached Tech Token Label CanvasTextures (capped to maxTokenLabelTextures)
  const rawLabels = extractTechLabels().slice(0, RUNNER_CONFIG.maxTokenLabelTextures);
  const tokenLabelMaterials = rawLabels.map((label) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 256, 80);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 248, 72);

      const text = formatTechLabel(label, RUNNER_CONFIG.maxLabelLength);
      let fontPx = 28;
      ctx.font = `bold ${fontPx}px monospace`;
      const measured = ctx.measureText(text).width;
      if (measured > 220 && measured > 0) {
        fontPx = Math.max(14, Math.floor((fontPx * 220) / measured));
        ctx.font = `bold ${fontPx}px monospace`;
      }
      ctx.fillStyle = '#f4f4f5';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 41);
    }
    const tex = trackTex(new THREE.CanvasTexture(canvas));
    tex.colorSpace = THREE.SRGBColorSpace;
    return trackMat(
      new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      })
    );
  });

  // Track Chunk Pool (6 chunks x 24m)
  const trackWidth = RUNNER_CONFIG.laneWidth * 3 + 0.9;
  const shoulderWidth = trackWidth + 4.4;
  const chunkBaseGeo = trackGeo(new THREE.BoxGeometry(trackWidth, 0.3, RUNNER_CONFIG.chunkLength));
  const shoulderGeo = trackGeo(new THREE.BoxGeometry(shoulderWidth, 0.12, RUNNER_CONFIG.chunkLength));
  const railGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.24, RUNNER_CONFIG.chunkLength));
  const accentRailGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.07, RUNNER_CONFIG.chunkLength));
  const dashGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.025, 2.4));
  const pylonGeo = trackGeo(new THREE.BoxGeometry(0.24, 1.35, 0.24));
  const pylonCapGeo = trackGeo(new THREE.BoxGeometry(0.26, 0.08, 0.26));

  const chunkPool = Array.from({ length: RUNNER_CONFIG.chunkPoolSize }, () => {
    const group = new THREE.Group();

    // Subtle lowered shoulder apron for clean depth separation between track & void
    const shoulder = new THREE.Mesh(shoulderGeo, materials.shoulder);
    shoulder.position.y = -0.26;
    group.add(shoulder);

    const deck = new THREE.Mesh(chunkBaseGeo, materials.track);
    deck.position.y = -0.15;
    group.add(deck);

    // Side rails along outer track borders
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, materials.surface);
      rail.position.set(side * (trackWidth * 0.5 - 0.09), 0.12, 0);
      const accentLine = new THREE.Mesh(accentRailGeo, materials.accent);
      accentLine.position.set(side * (trackWidth * 0.5 - 0.17), 0.24, 0);
      group.add(rail, accentLine);
    }

    // Aligned high-contrast dashed dividers between lanes (-1.25 and +1.25)
    for (const divX of [-RUNNER_CONFIG.laneWidth * 0.5, RUNNER_CONFIG.laneWidth * 0.5]) {
      for (let z = -9; z <= 9; z += 6) {
        const dash = new THREE.Mesh(dashGeo, materials.laneMark);
        dash.position.set(divX, 0.015, z);
        group.add(dash);
      }
    }

    // Track-side pylons with subtle blue top indicator cap for depth cadence
    const pylonZList = isMobile ? [-6, 6] : [-8, 0, 8];
    for (const pz of pylonZList) {
      for (const side of [-1, 1]) {
        const xPos = side * (trackWidth * 0.5 + 0.55);
        const pylon = new THREE.Mesh(pylonGeo, materials.dark);
        pylon.position.set(xPos, 0.65, pz);
        const cap = new THREE.Mesh(pylonCapGeo, materials.accent);
        cap.position.set(xPos, 1.34, pz);
        group.add(pylon, cap);
      }
    }

    return group;
  });

  // Obstacle Pool (36 slots — ample capacity for 6 full slow-speed chunks)
  const bugBodyGeo = trackGeo(new THREE.BoxGeometry(0.92, 0.5, 0.94));
  const bugBodyEdgesGeo = trackGeo(new THREE.EdgesGeometry(bugBodyGeo));
  const bugHeadGeo = trackGeo(new THREE.BoxGeometry(0.56, 0.34, 0.32));
  const bugLegGeo = trackGeo(new THREE.BoxGeometry(1.48, 0.11, 0.15));
  const bugAntennaGeo = trackGeo(new THREE.BoxGeometry(0.08, 0.08, 0.36));

  const gatePostGeo = trackGeo(new THREE.BoxGeometry(0.2, 0.92, 0.2));
  const gateBarGeo = trackGeo(new THREE.BoxGeometry(1.9, 0.28, 0.26));
  const gateBarEdgesGeo = trackGeo(new THREE.EdgesGeometry(gateBarGeo));

  const firewallGeo = trackGeo(new THREE.BoxGeometry(1.92, 3.2, 0.85));
  const firewallEdgesGeo = trackGeo(new THREE.EdgesGeometry(firewallGeo));
  const firewallStripGeo = trackGeo(new THREE.BoxGeometry(1.96, 0.22, 0.89));
  const firewallCornerGeo = trackGeo(new THREE.BoxGeometry(0.1, 3.22, 0.1));

  const obstaclePoolSize = 36;
  const obstaclePool = Array.from({ length: obstaclePoolSize }, () => {
    const group = new THREE.Group();
    group.visible = false;

    // Variant 1: Bug
    const bugGroup = new THREE.Group();
    const shell = new THREE.Mesh(bugBodyGeo, materials.red);
    shell.position.y = 0.41;
    shell.add(new THREE.LineSegments(bugBodyEdgesGeo, materials.edge));
    const head = new THREE.Mesh(bugHeadGeo, materials.playerLimb);
    head.position.set(0, 0.31, 0.54);
    const antL = new THREE.Mesh(bugAntennaGeo, materials.playerLimb);
    antL.position.set(-0.16, 0.44, 0.74);
    antL.rotation.set(-0.25, 0.3, 0);
    const antR = new THREE.Mesh(bugAntennaGeo, materials.playerLimb);
    antR.position.set(0.16, 0.44, 0.74);
    antR.rotation.set(-0.25, -0.3, 0);
    const legs = [-0.26, 0, 0.26].map((lz) => {
      const l = new THREE.Mesh(bugLegGeo, materials.playerLimb);
      l.position.set(0, 0.16, lz);
      return l;
    });
    bugGroup.add(shell, head, antL, antR, ...legs);
    group.add(bugGroup);

    // Variant 2: Low Gate (top crossbar aligns 1:1 with clearHeight 0.88)
    const gateGroup = new THREE.Group();
    const postL = new THREE.Mesh(gatePostGeo, materials.playerLimb);
    postL.position.set(-0.88, 0.46, 0);
    const postR = new THREE.Mesh(gatePostGeo, materials.playerLimb);
    postR.position.set(0.88, 0.46, 0);
    const crossBar = new THREE.Mesh(gateBarGeo, materials.red);
    crossBar.position.set(0, 0.74, 0);
    crossBar.add(new THREE.LineSegments(gateBarEdgesGeo, materials.edge));
    gateGroup.add(postL, postR, crossBar);
    group.add(gateGroup);

    // Variant 3: Firewall Barrier (vertical corner warning strips + crisp outline edges)
    const firewallGroup = new THREE.Group();
    const wall = new THREE.Mesh(firewallGeo, materials.surface);
    wall.position.y = 1.6;
    wall.add(new THREE.LineSegments(firewallEdgesGeo, materials.firewallEdge));
    const beam1 = new THREE.Mesh(firewallStripGeo, materials.red);
    beam1.position.y = 0.85;
    const beam2 = new THREE.Mesh(firewallStripGeo, materials.red);
    beam2.position.y = 2.25;
    const pillarL = new THREE.Mesh(firewallCornerGeo, materials.red);
    pillarL.position.set(-0.92, 1.6, 0.4);
    const pillarR = new THREE.Mesh(firewallCornerGeo, materials.red);
    pillarR.position.set(0.92, 1.6, 0.4);
    firewallGroup.add(wall, beam1, beam2, pillarL, pillarR);
    group.add(firewallGroup);

    return { group, bugGroup, gateGroup, firewallGroup, obsId: null };
  });

  // Floating Tech Token Pool (pre-allocated slots)
  const tokenCoreGeo = trackGeo(new THREE.OctahedronGeometry(0.36, 0));
  const tokenEdgesGeo = trackGeo(new THREE.EdgesGeometry(tokenCoreGeo));
  const tokenPoolSize = 18;
  const tokenPool = Array.from({ length: tokenPoolSize }, () => {
    const group = new THREE.Group();
    group.visible = false;

    const core = new THREE.Mesh(tokenCoreGeo, materials.accent);
    core.add(new THREE.LineSegments(tokenEdgesGeo, materials.accentEdge));
    const labelSprite = new THREE.Sprite(tokenLabelMaterials[0]);
    labelSprite.scale.set(1.68, 0.52, 1);
    labelSprite.position.set(0, 0.76, 0);

    group.add(core, labelSprite);
    return { group, core, labelSprite, tokenId: null };
  });

  const dispose = () => {
    for (const g of geos) g.dispose();
    for (const t of textures) t.dispose();
    for (const m of mats) m.dispose();
  };

  return {
    runner: buildRunnerCharacter(),
    chunkPool,
    obstaclePool,
    tokenPool,
    tokenLabelMaterials,
    dispose,
  };
};
