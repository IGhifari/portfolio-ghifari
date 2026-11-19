import * as THREE from 'three';
import { FOOTBALL_FIELD } from '../logic/worldConfig.js';
import { FOOTBALL_PHYSICS } from '../logic/footballPhysics.js';

/**
 * Generates a crisp low-poly 16x10 football pitch CanvasTexture (mowed stripes + white markings).
 */
const createPitchTexture = () => {
  const w = 512;
  const h = 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Mowed natural grass stripes
    const stripes = 8;
    const stripeW = w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2b9248' : '#35a654';
      ctx.fillRect(i * stripeW, 0, stripeW + 1, h);
    }

    // Crisp white chalk pitch lines
    ctx.strokeStyle = '#f8fafc';
    ctx.fillStyle = '#f8fafc';
    ctx.lineWidth = 4;

    const pad = 12;
    const pw = w - pad * 2;
    const ph = h - pad * 2;

    // Outer boundary & halfway line
    ctx.strokeRect(pad, pad, pw, ph);
    ctx.beginPath();
    ctx.moveTo(w / 2, pad);
    ctx.lineTo(w / 2, h - pad);
    ctx.stroke();

    // Center circle & spot
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Left & Right Penalty + Goal boxes
    const penW = 72;
    const penH = 166;
    const goalW = 28;
    const goalH = 104;
    ctx.strokeRect(pad, (h - penH) / 2, penW, penH);
    ctx.strokeRect(pad, (h - goalH) / 2, goalW, goalH);
    ctx.strokeRect(w - pad - penW, (h - penH) / 2, penW, penH);
    ctx.strokeRect(w - pad - goalW, (h - goalH) / 2, goalW, goalH);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Generates a subtle translucent square grid net CanvasTexture for goal pockets.
 */
const createNetTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
    ctx.lineWidth = 3;
    const step = 16;
    for (let i = 0; i <= 128; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
};

/**
 * Generates a crisp low-poly patterned soccer ball texture.
 */
const createBallTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#1e293b';
    const spots = [
      [16, 16], [48, 16], [80, 16], [112, 16],
      [32, 42], [64, 42], [96, 42],
    ];
    for (const [cx, cy] of spots) {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/**
 * Creates the East Sports Zone playable low-poly football field, goals with nets,
 * soccer ball + ground shadow + kick indicator ring, and pooled goal celebration particles.
 */
export const createFootballField = (
  scene,
  { isMobile = false, field = FOOTBALL_FIELD } = {}
) => {
  const group = new THREE.Group();
  const textures = [];
  const trackTex = (t) => {
    textures.push(t);
    return t;
  };

  // Soft grass-to-pitch transition apron with clean vertical step separation above y=0 ground
  const outerApronGeo = new THREE.BoxGeometry(field.width + 2.2, 0.024, field.depth + 2.2);
  const outerApronMat = new THREE.MeshStandardMaterial({
    color: 0x4b8e4f,
    roughness: 0.96,
    metalness: 0.01,
  });
  const outerApronMesh = new THREE.Mesh(outerApronGeo, outerApronMat);
  outerApronMesh.position.set(field.centerX, 0.006, field.centerZ);
  outerApronMesh.receiveShadow = !isMobile;

  const apronGeo = new THREE.BoxGeometry(field.width + 0.9, 0.028, field.depth + 0.9);
  const apronMat = new THREE.MeshStandardMaterial({
    color: 0x2c8a47,
    roughness: 0.94,
    metalness: 0.02,
  });
  const apronMesh = new THREE.Mesh(apronGeo, apronMat);
  apronMesh.position.set(field.centerX, 0.016, field.centerZ);
  apronMesh.receiveShadow = !isMobile;
  group.add(outerApronMesh, apronMesh);

  // 1. Mowed Grass Pitch Slab (top = 0.065, cleanly above apronMesh top 0.030)
  const pitchTex = trackTex(createPitchTexture());
  const pitchGeo = new THREE.BoxGeometry(field.width, 0.07, field.depth);
  const pitchMat = new THREE.MeshStandardMaterial({
    map: pitchTex,
    roughness: 0.88,
    metalness: 0.04,
  });
  const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
  pitchMesh.position.set(field.centerX, 0.03, field.centerZ);
  pitchMesh.receiveShadow = !isMobile;
  group.add(pitchMesh);

  // Subtle corner flag poles at all 4 pitch corners
  const flagPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.72, 5);
  const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const flagClothGeo = new THREE.BoxGeometry(0.24, 0.16, 0.03);
  const flagClothMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.6 });
  for (const cx of [field.minX, field.maxX]) {
    for (const cz of [field.minZ, field.maxZ]) {
      const pole = new THREE.Mesh(flagPoleGeo, flagPoleMat);
      pole.position.set(cx, 0.38, cz);
      const cloth = new THREE.Mesh(flagClothGeo, flagClothMat);
      cloth.position.set(cx + (cx === field.minX ? 0.12 : -0.12), 0.66, cz);
      group.add(pole, cloth);
    }
  }

  // 2. Two Low-Poly Goals (posts + crossbar + translucent grid net)
  const netTex = trackTex(createNetTexture());
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.15,
  });
  const netMat = new THREE.MeshBasicMaterial({
    map: netTex,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const pr = field.postRadius;
  const gw = field.goalWidth;
  const gh = field.goalHeight;
  const gd = field.goalDepth;
  const halfGW = field.goalHalfWidth;

  const vPostGeo = new THREE.CylinderGeometry(pr, pr, gh, 6);
  const barGeo = new THREE.CylinderGeometry(pr, pr, gw + pr * 2, 6);
  barGeo.rotateX(Math.PI / 2);
  const backSupportGeo = new THREE.BoxGeometry(gd, pr * 1.1, pr * 1.1);
  const backNetGeo = new THREE.PlaneGeometry(gw, gh);
  backNetGeo.rotateY(Math.PI / 2);
  const sideNetGeo = new THREE.PlaneGeometry(gd, gh);
  const topNetGeo = new THREE.PlaneGeometry(gd, gw);
  topNetGeo.rotateX(-Math.PI / 2);

  const buildGoal = (edgeX, outwardDir) => {
    const gGroup = new THREE.Group();
    gGroup.position.set(edgeX, 0.04, field.centerZ);

    const postN = new THREE.Mesh(vPostGeo, postMat);
    postN.position.set(0, gh * 0.5, -halfGW);
    postN.castShadow = !isMobile;

    const postS = new THREE.Mesh(vPostGeo, postMat);
    postS.position.set(0, gh * 0.5, halfGW);
    postS.castShadow = !isMobile;

    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.position.set(0, gh, 0);
    crossbar.castShadow = !isMobile;

    const backX = outwardDir * gd;
    const backPostN = new THREE.Mesh(vPostGeo, postMat);
    backPostN.position.set(backX, gh * 0.5, -halfGW);
    const backPostS = new THREE.Mesh(vPostGeo, postMat);
    backPostS.position.set(backX, gh * 0.5, halfGW);

    const topN = new THREE.Mesh(backSupportGeo, postMat);
    topN.position.set(backX * 0.5, gh, -halfGW);
    const topS = new THREE.Mesh(backSupportGeo, postMat);
    topS.position.set(backX * 0.5, gh, halfGW);

    // Nets
    const backNet = new THREE.Mesh(backNetGeo, netMat);
    backNet.position.set(backX, gh * 0.5, 0);
    const sideNetN = new THREE.Mesh(sideNetGeo, netMat);
    sideNetN.position.set(backX * 0.5, gh * 0.5, -halfGW);
    const sideNetS = new THREE.Mesh(sideNetGeo, netMat);
    sideNetS.position.set(backX * 0.5, gh * 0.5, halfGW);
    const topNet = new THREE.Mesh(topNetGeo, netMat);
    topNet.position.set(backX * 0.5, gh, 0);

    gGroup.add(
      postN,
      postS,
      crossbar,
      backPostN,
      backPostS,
      topN,
      topS,
      backNet,
      sideNetN,
      sideNetS,
      topNet
    );
    group.add(gGroup);
  };

  buildGoal(field.minX, -1); // Left goal extends outward toward -X
  buildGoal(field.maxX, 1);  // Right goal extends outward toward +X

  // 3. Soccer Ball, Contact Shadow & Contextual Kick Ring
  const ballTex = trackTex(createBallTexture());
  const ballGeo = new THREE.IcosahedronGeometry(FOOTBALL_PHYSICS.ballRadius, 1);
  const ballMat = new THREE.MeshStandardMaterial({
    map: ballTex,
    roughness: 0.48,
    metalness: 0.08,
  });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  ballMesh.castShadow = !isMobile;
  ballMesh.position.set(field.centerX, FOOTBALL_PHYSICS.ballRadius, field.centerZ);
  group.add(ballMesh);

  const ballShadowGeo = new THREE.CircleGeometry(FOOTBALL_PHYSICS.ballRadius * 1.15, 16);
  ballShadowGeo.rotateX(-Math.PI / 2);
  const ballShadowMat = new THREE.MeshBasicMaterial({
    color: 0x052e16,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const ballShadow = new THREE.Mesh(ballShadowGeo, ballShadowMat);
  ballShadow.position.set(field.centerX, 0.06, field.centerZ);
  group.add(ballShadow);

  const kickRingGeo = new THREE.RingGeometry(0.5, 0.64, 24);
  kickRingGeo.rotateX(-Math.PI / 2);
  const kickRingMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const kickRing = new THREE.Mesh(kickRingGeo, kickRingMat);
  kickRing.position.set(field.centerX, 0.07, field.centerZ);
  group.add(kickRing);

  // 4. Pooled Subtle Goal Celebration Burst (pre-allocated, 0 runtime allocations)
  const sparkCount = 18;
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVel = Array.from({ length: sparkCount }, (_, i) => {
    const a = (i / sparkCount) * Math.PI * 2;
    return {
      vx: Math.cos(a) * (1.8 + (i % 3) * 0.6),
      vy: 3.4 + (i % 4) * 0.85,
      vz: Math.sin(a) * (1.8 + (i % 3) * 0.6),
    };
  });
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xfacc15,
    size: 0.22,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.visible = false;
  group.add(sparkPoints);

  let sparkTimer = 0;
  let sparkOriginX = field.centerX;
  let sparkOriginZ = field.centerZ;
  const spinAxisVec = new THREE.Vector3(0, 0, 1);
  const spinQuat = new THREE.Quaternion();

  const triggerGoalBurst = (side) => {
    sparkOriginX = side === 'left' ? field.minX : field.maxX;
    sparkOriginZ = field.centerZ;
    sparkTimer = 0.95;
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = sparkOriginX;
      sparkPos[i * 3 + 1] = 1.25;
      sparkPos[i * 3 + 2] = sparkOriginZ;
    }
    sparkGeo.getAttribute('position').needsUpdate = true;
    sparkPoints.visible = true;
    sparkMat.opacity = 0.95;
  };

  scene.add(group);

  let ringAlpha = 0;

  const update = (ballState, dt, { inKickRange = false, reducedMotion = false } = {}) => {
    ballMesh.position.set(ballState.x, ballState.y + 0.04, ballState.z);

    // Subtle rolling spin
    spinAxisVec.set(ballState.spinAxisX || 0, 0, ballState.spinAxisZ || 1).normalize();
    spinQuat.setFromAxisAngle(spinAxisVec, ballState.spinAngle || 0);
    ballMesh.quaternion.copy(spinQuat);

    // Ground contact shadow & hop scaling
    const hopHeight = Math.max(0, ballState.y - FOOTBALL_PHYSICS.ballRadius);
    ballShadow.position.set(ballState.x, 0.058, ballState.z);
    ballShadow.scale.setScalar(Math.max(0.55, 1 - hopHeight * 0.25));

    // Contextual kick ring under ball when in kick range
    const targetAlpha = inKickRange && ballState.goalResetTimer <= 0 ? 0.78 : 0;
    ringAlpha += (targetAlpha - ringAlpha) * Math.min(1, dt * 14);
    kickRing.position.set(ballState.x, 0.065, ballState.z);
    kickRingMat.opacity = ringAlpha;
    kickRing.visible = ringAlpha > 0.02;

    // Goal celebration burst
    if (sparkTimer > 0 && !reducedMotion) {
      sparkTimer = Math.max(0, sparkTimer - dt);
      const tElapsed = 0.95 - sparkTimer;
      const arr = sparkGeo.getAttribute('position').array;
      for (let i = 0; i < sparkCount; i++) {
        const v = sparkVel[i];
        arr[i * 3] = sparkOriginX + v.vx * tElapsed;
        arr[i * 3 + 1] = Math.max(0.1, 1.25 + v.vy * tElapsed - 0.5 * 9.8 * tElapsed * tElapsed);
        arr[i * 3 + 2] = sparkOriginZ + v.vz * tElapsed;
      }
      sparkGeo.getAttribute('position').needsUpdate = true;
      sparkMat.opacity = sparkTimer / 0.95;
      if (sparkTimer === 0) sparkPoints.visible = false;
    } else if (reducedMotion && sparkPoints.visible) {
      sparkPoints.visible = false;
      sparkTimer = 0;
    }
  };

  return {
    triggerGoalBurst,
    update,
    dispose: () => {
      textures.forEach((t) => t.dispose());
    },
  };
};
