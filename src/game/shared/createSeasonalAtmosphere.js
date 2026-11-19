import * as THREE from 'three';

/**
 * Lightweight pooled 3D seasonal particle system (single THREE.Points draw call).
 * Renders atmospheric snowfall (Dec), sparkles/fireworks (Jan), rose glow motes (Feb),
 * spring pastels (Apr), warm sunlit dust (Jun), or twilight wisps (Oct).
 * Complete no-op on inactive/default months (`!theme3D?.isActive`).
 */
export const createSeasonalAtmosphere = (
  scene,
  theme3D,
  {
    isMobile = false,
    reducedMotion = false,
    spanX = 28,
    spanY = 14,
    spanZ = 24,
    baseY = 0.4,
    scrollAxisZ = false,
  } = {}
) => {
  if (!scene || !theme3D?.isActive || !theme3D.effectType) {
    return {
      update: () => {},
      dispose: () => {},
    };
  }

  const count = isMobile ? 22 : 44;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  const c1 = new THREE.Color(theme3D.particlePrimary);
  const c2 = new THREE.Color(theme3D.particleSecondary);
  const c3 = new THREE.Color(theme3D.particleTertiary || theme3D.particlePrimary);
  const palette = [c1, c2, c3];

  for (let i = 0; i < count; i++) {
    const s1 = Math.sin(i * 12.9898) * 43758.5453;
    const s2 = Math.sin(i * 78.233) * 43758.5453;
    const s3 = Math.sin(i * 39.425) * 43758.5453;
    const rx = s1 - Math.floor(s1);
    const ry = s2 - Math.floor(s2);
    const rz = s3 - Math.floor(s3);

    positions[i * 3] = (rx - 0.5) * spanX;
    positions[i * 3 + 1] = baseY + ry * spanY;
    positions[i * 3 + 2] = (rz - 0.5) * spanZ;

    const chosen = palette[i % palette.length];
    colors[i * 3] = chosen.r;
    colors[i * 3 + 1] = chosen.g;
    colors[i * 3 + 2] = chosen.b;

    phases[i] = i * 0.93;
    speeds[i] = 0.65 + (i % 5) * 0.18;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const size =
    theme3D.effectType === 'winter'
      ? 0.14
      : theme3D.effectType === 'fireworks'
      ? 0.13
      : 0.11;
  const baseOpacity = theme3D.effectType === 'winter' && theme3D.isLight ? 0.85 : 0.45;

  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: baseOpacity,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  let elapsed = 0;

  const update = (dt, { focusY = 0, forwardSpeed = 0 } = {}) => {
    if (reducedMotion || dt <= 0) {
      points.position.y = focusY;
      return;
    }

    elapsed += dt;
    points.position.y = focusY;

    const posAttr = geo.getAttribute('position');
    const arr = posAttr.array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      const ph = phases[i];
      const sp = speeds[i];

      if (theme3D.effectType === 'winter') {
        // Gentle downward snowfall + subtle breeze
        arr[iy] -= dt * 1.45 * sp;
        arr[ix] += Math.sin(elapsed * 0.9 + ph) * dt * 0.35;
        if (arr[iy] < baseY) arr[iy] = baseY + spanY;
      } else if (theme3D.effectType === 'hearts' || theme3D.effectType === 'fireworks') {
        // Upward drifting celebration sparks / rose motes
        arr[iy] += dt * (theme3D.effectType === 'fireworks' ? 1.15 : 0.75) * sp;
        arr[ix] += Math.cos(elapsed * 0.8 + ph) * dt * 0.2;
        if (arr[iy] > baseY + spanY) arr[iy] = baseY;
      } else if (theme3D.effectType === 'halloween') {
        // Horizontal twilight wisps
        arr[ix] += dt * 1.1 * sp;
        arr[iy] += Math.sin(elapsed * 1.2 + ph) * dt * 0.18;
        if (arr[ix] > spanX * 0.5) arr[ix] = -spanX * 0.5;
      } else {
        // Easter / Summer gentle levitation sway
        arr[iy] += Math.sin(elapsed * 0.85 + ph) * dt * 0.25;
        arr[ix] += Math.cos(elapsed * 0.65 + ph) * dt * 0.2;
      }

      if (scrollAxisZ && forwardSpeed > 0) {
        arr[iz] += forwardSpeed * dt * 0.65;
        if (arr[iz] > spanZ * 0.35) {
          arr[iz] -= spanZ;
        }
      }
    }

    posAttr.needsUpdate = true;
  };

  return {
    update,
    dispose: () => {
      scene.remove(points);
      geo.dispose();
      mat.dispose();
    },
  };
};
