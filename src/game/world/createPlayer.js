import * as THREE from 'three';
import { PLAYER_CONFIG } from '../logic/worldConfig.js';

/**
 * Shortest angular difference between two angles in radians.
 */
const shortestAngleDelta = (from, to) => {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
};

/**
 * Creates a ~40% larger, clearly readable low-poly explorer character (torso, head,
 * two arms, two legs, backpack, wrap-around blue visor) with a visible walk cycle,
 * idle breathing, and a soft blue ground ring that appears only while moving.
 */
export const createPlayer = (scene, { isMobile = false } = {}) => {
  const castShadow = !isMobile;

  const root = new THREE.Group();
  root.position.set(PLAYER_CONFIG.startX, 0, PLAYER_CONFIG.startZ);
  root.rotation.y = Math.PI;

  const bodyRig = new THREE.Group();
  // ~40% larger than original character for clear readability at camera distance
  bodyRig.scale.setScalar(1.42);
  root.add(bodyRig);

  const upperBody = new THREE.Group();
  bodyRig.add(upperBody);

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.4,
    metalness: 0.1,
  });
  const torsoMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.6,
    metalness: 0.18,
  });
  const limbMat = new THREE.MeshStandardMaterial({
    color: 0x2d2d35,
    roughness: 0.65,
    metalness: 0.15,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.78,
    roughness: 0.25,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x3f3f46,
    transparent: true,
    opacity: 0.85,
  });

  // Torso + subtle edge line + blue collar/back accent
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.54, 0.28), torsoMat);
  torso.position.y = 0.76;
  torso.castShadow = castShadow;
  torso.add(new THREE.LineSegments(new THREE.EdgesGeometry(torso.geometry), edgeMat));
  upperBody.add(torso);

  const collarAccent = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.31), visorMat);
  collarAccent.position.set(0, 1.02, 0);
  upperBody.add(collarAccent);

  // Backpack module with blue status strip
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.15), limbMat);
  pack.position.set(0, 0.78, -0.2);
  pack.castShadow = castShadow;
  pack.add(new THREE.LineSegments(new THREE.EdgesGeometry(pack.geometry), edgeMat));
  upperBody.add(pack);

  const packStrip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.04), visorMat);
  packStrip.position.set(0, 0.84, -0.27);
  upperBody.add(packStrip);

  // Head + Wrap-Around Blue Visor (+Z forward and side temples visible from 3rd-person camera)
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.28;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.42), lightMat);
  head.castShadow = castShadow;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.24), visorMat);
  visor.position.set(0, 0.02, 0.11);
  headGroup.add(head, visor);
  upperBody.add(headGroup);

  // Two Arms (pivoted at shoulders)
  const buildArm = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.33, 0.98, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.38, 0.15), limbMat);
    arm.position.y = -0.17;
    arm.castShadow = castShadow;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.13), lightMat);
    hand.position.y = -0.4;
    pivot.add(arm, hand);
    return pivot;
  };
  const leftArmPivot = buildArm(-1);
  const rightArmPivot = buildArm(1);
  upperBody.add(leftArmPivot, rightArmPivot);

  // Two Legs (pivoted at hips)
  const buildLeg = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.14, 0.49, 0);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), limbMat);
    leg.position.y = -0.19;
    leg.castShadow = castShadow;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.11, 0.22), lightMat);
    boot.position.set(0, -0.43, 0.02);
    pivot.add(leg, boot);
    return pivot;
  };
  const leftLegPivot = buildLeg(-1);
  const rightLegPivot = buildLeg(1);
  bodyRig.add(leftLegPivot, rightLegPivot);

  // Soft blue ground ring — visible ONLY while moving
  const ringGeo = new THREE.RingGeometry(0.54, 0.7, 28);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const baseRing = new THREE.Mesh(ringGeo, ringMat);
  baseRing.position.y = 0.025;
  baseRing.visible = false;
  root.add(baseRing);

  scene.add(root);

  let walkPhase = 0;
  let idlePhase = 0;
  let ringAlpha = 0;

  const update = (playerState, dt, { reducedMotion = false } = {}) => {
    root.position.x = playerState.x;
    root.position.z = playerState.z;

    // Fade soft blue ring in only while moving, fade out to 0 when stopped
    const targetRingAlpha = playerState.isMoving ? 0.68 : 0;
    ringAlpha += (targetRingAlpha - ringAlpha) * Math.min(1, dt * 12);
    ringMat.opacity = ringAlpha;
    baseRing.visible = ringAlpha > 0.01;

    const targetAngle = playerState.angle ?? root.rotation.y;
    if (reducedMotion) {
      root.rotation.y = targetAngle;
      upperBody.position.y = 0;
      upperBody.rotation.y = 0;
      leftArmPivot.rotation.set(0, 0, 0);
      rightArmPivot.rotation.set(0, 0, 0);
      leftLegPivot.rotation.set(0, 0, 0);
      rightLegPivot.rotation.set(0, 0, 0);
      return;
    }

    const delta = shortestAngleDelta(root.rotation.y, targetAngle);
    root.rotation.y += delta * Math.min(1, dt * 14);

    if (playerState.isMoving) {
      walkPhase += dt * 12.5;
      const swing = Math.sin(walkPhase);
      leftLegPivot.rotation.x = swing * 0.72;
      rightLegPivot.rotation.x = -swing * 0.72;
      leftArmPivot.rotation.x = -swing * 0.62;
      rightArmPivot.rotation.x = swing * 0.62;
      leftArmPivot.rotation.z = 0.08;
      rightArmPivot.rotation.z = -0.08;
      upperBody.rotation.y = swing * 0.1;
      upperBody.position.y = Math.abs(swing) * 0.075;
    } else {
      walkPhase = 0;
      idlePhase += dt * 2.4;
      const breath = Math.sin(idlePhase);
      leftLegPivot.rotation.x *= 0.82;
      rightLegPivot.rotation.x *= 0.82;
      leftArmPivot.rotation.x *= 0.82;
      rightArmPivot.rotation.x *= 0.82;
      upperBody.rotation.y *= 0.82;
      leftArmPivot.rotation.z = 0.07 + breath * 0.025;
      rightArmPivot.rotation.z = -0.07 - breath * 0.025;
      upperBody.position.y = (breath + 1) * 0.02;
    }
  };

  return {
    mesh: root,
    update,
  };
};
