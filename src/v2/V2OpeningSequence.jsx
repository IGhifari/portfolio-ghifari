import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { markV2OpeningCompleted } from './v2OpeningState';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// Quintic smootherstep: zero 1st AND 2nd derivatives at endpoints -> zero jerk!
function smootherstep(t) {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Smooth bell envelope: fades 0 -> 1 over [inStart, inEnd], holds 1, fades 1 -> 0 over [outStart, outEnd]
function envelope(t, inStart, inEnd, outStart, outEnd) {
  if (t <= inStart || t >= outEnd) return 0;
  if (t < inEnd) return smootherstep((t - inStart) / Math.max(0.0001, inEnd - inStart));
  if (t > outStart) return 1 - smootherstep((t - outStart) / Math.max(0.0001, outEnd - outStart));
  return 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Continuous monotonic progress curve (strictly positive velocity everywhere — never freezes!)
function continuousOrganicProgress(t) {
  const x = clamp01(t);
  // Base linear + gentle harmonic pacing waves that slow slightly around 34%, 70%, and 94% without ever stalling
  const wave =
    0.028 * Math.sin(x * Math.PI * 2) +
    0.016 * Math.sin(x * Math.PI * 6);
  const eased = clamp01(x + wave * Math.sin(x * Math.PI));
  // Blend 85% harmonic curve + 15% smootherstep for soft start & finish
  return clamp01(eased * 0.86 + smootherstep(x) * 0.14);
}

// Multi-keyframe smooth quintic value track [[t0, val0], [t1, val1], ...]
function sampleTrack(keyframes, t) {
  if (t <= keyframes[0][0]) return keyframes[0][1];
  const last = keyframes[keyframes.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const [t0, v0] = keyframes[i];
    const [t1, v1] = keyframes[i + 1];
    if (t >= t0 && t <= t1) {
      const u = smootherstep((t - t0) / Math.max(0.0001, t1 - t0));
      return lerp(v0, v1, u);
    }
  }
  return last[1];
}

// Continuous main ring radius track (px at 1x scale) — zero discontinuities!
const MAIN_RING_TRACK = [
  [0.0, 168],
  [0.19, 168],
  [0.29, 64],
  [0.38, 128],
  [0.51, 128],
  [0.6, 78],
  [0.69, 78],
  [0.79, 204],
  [0.89, 204],
  [0.97, 46],
  [1.0, 38],
];

// Continuous inner ring radius track (px at 1x scale)
const INNER_RING_TRACK = [
  [0.0, 106],
  [0.19, 106],
  [0.29, 23],
  [0.52, 23],
  [0.62, 42],
  [0.72, 42],
  [0.8, 134],
  [0.89, 134],
  [0.97, 24],
  [1.0, 18],
];

// Deterministic ambient particles
const AMBIENT_PARTICLES = Array.from({ length: 40 }, (_, i) => {
  const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const seed2 = Math.sin(i * 45.164 + 19.123) * 24634.6345;
  return {
    nx: seed1 - Math.floor(seed1),
    ny: seed2 - Math.floor(seed2),
    r: i % 5 === 0 ? 1.3 : 0.85,
    alpha: 0.09 + (i % 4) * 0.055,
    drift: (i % 2 === 0 ? 1 : -1) * (3.2 + (i % 5) * 1.4),
  };
});

/**
 * Architectural Orbital Telemetry Opening Sequence (`000% -> 100%` + Radial Luminous Dissolve)
 * Zero React per-frame re-renders + continuous quintic overlapping geometry for 60/120fps fluidity.
 */
export default function V2OpeningSequence({ isEn = true, onComplete, onRevealStart }) {
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const progressBarRef = useRef(null);
  const completedRef = useRef(false);
  const revealFiredRef = useRef(false);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [exitState, setExitState] = useState('running'); // 'running' | 'bloom' | 'dissolve'

  const finishSequence = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markV2OpeningCompleted();
    if (!revealFiredRef.current && typeof onRevealStart === 'function') {
      revealFiredRef.current = true;
      onRevealStart();
    }
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, [onComplete, onRevealStart]);

  const handleSkip = useCallback(() => {
    if (completedRef.current) return;
    markV2OpeningCompleted();
    setExitState('dissolve');
    if (!revealFiredRef.current && typeof onRevealStart === 'function') {
      revealFiredRef.current = true;
      onRevealStart();
    }
    setTimeout(() => {
      finishSequence();
    }, 650);
  }, [finishSequence, onRevealStart]);

  // Allow Escape key to skip cleanly
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSkip]);

  // Lock document scroll while preloader is active
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Continuous 60/120fps High-DPI Canvas Orbital Choreography
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Smooth ~6.5s total sequence: 5.2s 000%->100% + 0.42s radial bloom + 0.9s silk dissolve
    const PROGRESS_DURATION_MS = 5200;
    const BLOOM_DURATION_MS = 420;
    const startTime = performance.now();

    let rafId = null;
    let lastPct = -1;
    let lastStage = -1;
    let dissolveScheduled = false;

    const drawCross = (x, y, size, alpha, rotate45 = false) => {
      if (alpha <= 0.004) return;
      ctx.save();
      ctx.translate(x, y);
      if (rotate45) ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = `rgba(226, 232, 240, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
    };

    const drawSectorWedge = (cx, cy, radius, headAngle, sweepAngle, alphaPeak) => {
      if (alphaPeak <= 0.004 || radius <= 1) return;
      const steps = 28;
      for (let i = 0; i < steps; i += 1) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const a0 = headAngle - sweepAngle * (1 - f0);
        const a1 = headAngle - sweepAngle * (1 - f1) + 0.006;
        const sliceAlpha = alphaPeak * Math.pow(f1, 1.85);
        ctx.fillStyle = `rgba(210, 226, 252, ${sliceAlpha})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawNode = (x, y, radius = 5.5, alpha = 1) => {
      if (alpha <= 0.005) return;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.8);
      glow.addColorStop(0, `rgba(59, 130, 246, ${0.42 * alpha})`);
      glow.addColorStop(0.5, `rgba(147, 197, 253, ${0.14 * alpha})`);
      glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderFrame = (now) => {
      const elapsed = now - startTime;
      const sec = elapsed * 0.001;
      const t = clamp01(elapsed / PROGRESS_DURATION_MS);
      const p = continuousOrganicProgress(t);
      const pctInt = Math.min(100, Math.round(p * 100));

      // Direct DOM updates for 0-jank 60/120fps tabular counter & bottom progress bar
      if (pctInt !== lastPct) {
        lastPct = pctInt;
        if (counterRef.current) {
          counterRef.current.textContent = String(pctInt).padStart(3, '0');
        }
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      // Update caption stage at most 3 times across the entire 8.6s run
      const stage = t < 0.25 ? 0 : t < 0.54 ? 1 : t < 0.76 ? 2 : 3;
      if (stage !== lastStage) {
        lastStage = stage;
        setPhaseIndex(stage);
      }

      // Smooth radial bloom progress once t hits 1.0
      const bloomT =
        elapsed > PROGRESS_DURATION_MS
          ? clamp01((elapsed - PROGRESS_DURATION_MS) / BLOOM_DURATION_MS)
          : 0;

      if (bloomT > 0 && !dissolveScheduled) {
        dissolveScheduled = true;
        setExitState('bloom');
        setTimeout(() => {
          setExitState('dissolve');
          if (!revealFiredRef.current && typeof onRevealStart === 'function') {
            revealFiredRef.current = true;
            onRevealStart();
          }
        }, BLOOM_DURATION_MS);
        setTimeout(() => {
          finishSequence();
        }, BLOOM_DURATION_MS + 920);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Soft entrance fade from pure black over first 0.55s
      const masterIn = smootherstep(clamp01(elapsed / 550));

      // 1. Base architectural obsidian fill
      ctx.fillStyle = '#0b0c0f';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const unit = Math.min(width, height);
      const scale = Math.max(0.64, Math.min(1.15, unit / 920));

      // 2. Fine architectural drafting grid
      const gridStep = Math.round(96 * scale);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.024 * masterIn})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const offsetX = cx % gridStep;
      const offsetY = cy % gridStep;
      for (let gx = offsetX; gx < width; gx += gridStep) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = offsetY; gy < height; gy += gridStep) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      // 3. Concentric stepped matte radial elevation halos (gently breathing)
      const breath = 1 + 0.015 * Math.sin(sec * 1.3);
      const haloRadii = [435, 332, 236, 148].map((r) => r * scale * breath);
      const haloAlphas = [0.013, 0.017, 0.021, 0.025];
      haloRadii.forEach((hr, idx) => {
        ctx.fillStyle = `rgba(226, 234, 248, ${haloAlphas[idx] * masterIn})`;
        ctx.beginPath();
        ctx.arc(cx, cy, hr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Ambient drifting telemetry particles & outer fiducial markers
      AMBIENT_PARTICLES.forEach((pt) => {
        const px = (pt.nx * width + sec * pt.drift + width) % width;
        const py = (pt.ny * height - sec * pt.drift * 0.45 + height) % height;
        ctx.fillStyle = `rgba(226, 232, 240, ${pt.alpha * masterIn})`;
        ctx.beginPath();
        ctx.arc(px, py, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });

      drawCross(cx - 295 * scale, cy + 255 * scale, 5, 0.2 * masterIn, false);
      drawCross(cx + 285 * scale, cy + 195 * scale, 5, 0.18 * masterIn, false);
      drawCross(cx - 245 * scale, cy - 195 * scale, 5, 0.16 * masterIn, true);
      drawCross(cx + 205 * scale, cy - 165 * scale, 5, 0.18 * masterIn, true);
      drawCross(cx - 90 * scale, cy + 390 * scale, 5, 0.18 * masterIn, false);

      // ======================================================================
      // 5. CONTINUOUS OVERLAPPING ORBITAL LAYERS (ZERO HARD CUTS)
      // ======================================================================

      const rMain = sampleTrack(MAIN_RING_TRACK, t) * scale;
      const rInner = sampleTrack(INNER_RING_TRACK, t) * scale;

      // Continuous uninterrupted orbital angle driven by real seconds
      const continuousOrbitAngle = -Math.PI * 0.68 + sec * 1.48;

      // --- LAYER A: Act 1 Radar Fan & Diagonal Telemetry Ray (`0.00 -> 0.28`) ---
      const envAct1 = envelope(t, 0.0, 0.06, 0.19, 0.29) * masterIn;
      if (envAct1 > 0.004) {
        drawSectorWedge(cx, cy, rMain, continuousOrbitAngle, Math.PI * 0.34, 0.17 * envAct1);

        const rayAngle = Math.PI * 0.82;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.22 * envAct1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rayAngle) * rMain, cy + Math.sin(rayAngle) * rMain);
        ctx.lineTo(cx + Math.cos(rayAngle) * unit * 0.88, cy + Math.sin(rayAngle) * unit * 0.88);
        ctx.stroke();

        // Subtle middle harmonic ring
        const midHarmonicEnv = envelope(t, 0.05, 0.12, 0.17, 0.25);
        if (midHarmonicEnv > 0.005) {
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.2 * midHarmonicEnv})`;
          ctx.beginPath();
          ctx.arc(cx, cy, lerp(rInner, rMain, 0.52), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // --- LAYER B: Act 2 Horizontal Beam Cone & Satellite Ring (`0.27 -> 0.56`) ---
      const envAct2 = envelope(t, 0.27, 0.36, 0.46, 0.56);
      const beamDisplacement = 212 * scale * envAct2;
      if (envAct2 > 0.004) {
        const beamX = cx + beamDisplacement;
        const coneHalfH = 38 * scale * envAct2;

        const coneGrad = ctx.createLinearGradient(cx, cy, beamX, cy);
        coneGrad.addColorStop(0, `rgba(226, 232, 240, ${0.02 * envAct2})`);
        coneGrad.addColorStop(0.68, `rgba(191, 219, 254, ${0.13 * envAct2})`);
        coneGrad.addColorStop(1, `rgba(226, 232, 240, ${0.23 * envAct2})`);
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(beamX, cy - coneHalfH);
        ctx.lineTo(beamX, cy + coneHalfH);
        ctx.closePath();
        ctx.fill();

        const axisEnd = cx + 286 * scale * envAct2;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.24 * envAct2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - rInner, cy);
        ctx.lineTo(axisEnd, cy);
        ctx.stroke();
        drawCross(axisEnd, cy, 4.5, 0.32 * envAct2, false);

        // Rotating dashed satellite target orbit around displaced node
        const satEnv = envelope(t, 0.32, 0.39, 0.45, 0.53);
        if (satEnv > 0.005) {
          ctx.save();
          ctx.translate(beamX, cy);
          ctx.rotate(sec * 0.45);
          ctx.setLineDash([4, 5]);
          ctx.strokeStyle = `rgba(226, 232, 240, ${0.28 * satEnv})`;
          ctx.beginPath();
          ctx.arc(0, 0, 50 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // --- LAYER C: Act 3 Viewfinder Brackets & Micro Squares (`0.51 -> 0.72`) ---
      const envAct3 = envelope(t, 0.51, 0.58, 0.64, 0.72);
      if (envAct3 > 0.004) {
        const bracketScale = lerp(1.18, 1.0, smootherstep(clamp01((t - 0.51) / 0.1)));
        const box = 42 * scale * bracketScale;
        const arm = 13 * scale;

        ctx.strokeStyle = `rgba(226, 232, 240, ${0.52 * envAct3})`;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(cx - box, cy - box + arm);
        ctx.lineTo(cx - box, cy - box);
        ctx.lineTo(cx - box + arm, cy - box);
        ctx.moveTo(cx + box - arm, cy - box);
        ctx.lineTo(cx + box, cy - box);
        ctx.lineTo(cx + box, cy - box + arm);
        ctx.moveTo(cx - box, cy + box - arm);
        ctx.lineTo(cx - box, cy + box);
        ctx.lineTo(cx - box + arm, cy + box);
        ctx.moveTo(cx + box - arm, cy + box);
        ctx.lineTo(cx + box, cy + box);
        ctx.lineTo(cx + box, cy + box - arm);
        ctx.stroke();

        // Micro telemetry squares
        ctx.fillStyle = `rgba(226, 232, 240, ${0.25 * envAct3})`;
        ctx.fillRect(cx - 39 * scale, cy - 39 * scale, 18 * scale, 18 * scale);
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.34 * envAct3})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 58 * scale, cy - 14 * scale, 11 * scale, 11 * scale);

        // Smoothly gliding twin telemetry rays
        const sweepProgress = clamp01((t - 0.51) / 0.21);
        const ray1 = Math.PI * 0.16 + sweepProgress * 0.28;
        const ray2 = Math.PI * 0.37 + sweepProgress * 0.22;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.22 * envAct3})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ray1) * 235 * scale, cy + Math.sin(ray1) * 235 * scale);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ray2) * 325 * scale, cy + Math.sin(ray2) * 325 * scale);
        ctx.stroke();
      }

      // --- LAYER D: Twin Intersecting Vertical Vesica Circles (`0.65 -> 0.81`) ---
      const envVesica = envelope(t, 0.65, 0.71, 0.75, 0.82);
      if (envVesica > 0.004) {
        const vesicaGrow = smootherstep(clamp01((t - 0.65) / 0.15));
        const vRadius = lerp(96, 238, vesicaGrow) * scale;
        const vOffset = lerp(42, 162, vesicaGrow) * scale;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.24 * envVesica})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy - vOffset, vRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + vOffset, vRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- LAYER E: Act 4 Calibrated 48-Tick Compass Dial & Matte Core (`0.74 -> 0.95`) ---
      const envAct4 = envelope(t, 0.74, 0.81, 0.89, 0.96);
      if (envAct4 > 0.004) {
        const coreR = 70 * scale * envAct4;
        const tickBaseR = lerp(74, 96, envAct4) * scale;

        // Vertical North meridian line
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.22 * envAct4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - coreR);
        ctx.lineTo(cx, cy - 330 * scale);
        ctx.stroke();

        // Outer orbit radar wedge
        drawSectorWedge(cx, cy, rMain, continuousOrbitAngle, Math.PI * 0.18, 0.2 * envAct4);

        // Matte silver-slate central disc
        ctx.fillStyle = `rgba(203, 213, 225, ${0.58 * envAct4})`;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(15, 23, 42, ${0.42 * envAct4})`;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 0.52, 0, Math.PI * 2);
        ctx.moveTo(cx - 9 * scale, cy);
        ctx.lineTo(cx + 9 * scale, cy);
        ctx.moveTo(cx, cy - 9 * scale);
        ctx.lineTo(cx, cy + 9 * scale);
        ctx.stroke();

        // Gently rotating 48-tick precision compass dial
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sec * 0.12);
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.28 * envAct4})`;
        ctx.beginPath();
        for (let i = 0; i < 48; i += 1) {
          const ta = (i / 48) * Math.PI * 2;
          const len = (i % 4 === 0 ? 13 : 7) * scale;
          ctx.moveTo(Math.cos(ta) * tickBaseR, Math.sin(ta) * tickBaseR);
          ctx.lineTo(Math.cos(ta) * (tickBaseR + len), Math.sin(ta) * (tickBaseR + len));
        }
        ctx.stroke();
        ctx.restore();
      }

      // --- LAYER F: Act 5 Final Iris Convergence (`0.91 -> 1.00`) ---
      const envAct5 = smootherstep(clamp01((t - 0.91) / 0.06));
      if (envAct5 > 0.004) {
        drawSectorWedge(cx, cy, rMain, continuousOrbitAngle, Math.PI * 0.42, 0.16 * envAct5);

        const rayAngle = Math.PI * 0.82;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.24 * envAct5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rayAngle) * rMain, cy + Math.sin(rayAngle) * rMain);
        ctx.lineTo(
          cx + Math.cos(rayAngle) * 240 * scale,
          cy + Math.sin(rayAngle) * 240 * scale
        );
        ctx.stroke();
      }

      // --- PERSISTENT PRIMARY & INNER RINGS (Never cut, smoothly morph across all 5 acts!) ---
      const dashedBlend = envelope(t, 0.53, 0.58, 0.65, 0.71);
      const solidMainAlpha = (0.44 - dashedBlend * 0.34) * masterIn;
      if (solidMainAlpha > 0.01) {
        ctx.strokeStyle = `rgba(226, 232, 240, ${solidMainAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rMain, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (dashedBlend > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-sec * 0.22);
        ctx.setLineDash([5, 7]);
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.38 * dashedBlend})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, rMain, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const innerAlpha = (1 - envelope(t, 0.56, 0.61, 0.71, 0.77) * 0.75) * 0.28 * masterIn;
      if (innerAlpha > 0.01) {
        ctx.strokeStyle = `rgba(226, 232, 240, ${innerAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center subtle reticle
      const centerReticleAlpha = (1 - envAct4) * 0.34 * masterIn;
      drawCross(cx, cy, 5 * scale, centerReticleAlpha, true);
      if (envAct2 > 0.02) {
        drawCross(cx, cy, 8 * scale, 0.4 * envAct2, false);
      }

      // --- PERSISTENT PRIMARY NODE (Continuous position across all 5 acts!) ---
      const orbitWeight =
        (1 - smootherstep(clamp01((t - 0.19) / 0.09))) +
        smootherstep(clamp01((t - 0.75) / 0.08));
      const clampedOrbitW = clamp01(orbitWeight);

      const orbitX = cx + Math.cos(continuousOrbitAngle) * rMain;
      const orbitY = cy + Math.sin(continuousOrbitAngle) * rMain;
      const centerOrBeamX = cx + beamDisplacement;
      const centerOrBeamY = cy;

      const nodeX = lerp(centerOrBeamX, orbitX, clampedOrbitW);
      const nodeY = lerp(centerOrBeamY, orbitY, clampedOrbitW);
      const nodeRadius =
        lerp(6.2, 5.4, clampedOrbitW) *
        (1 - envelope(t, 0.67, 0.71, 0.73, 0.77) * 0.45) *
        scale;

      drawNode(nodeX, nodeY, nodeRadius, masterIn);

      // --- RADIAL LUMINOUS BLOOM AT 100% (`bloomT: 0 -> 1`) ---
      if (bloomT > 0) {
        const bloomEase = smootherstep(bloomT);
        const maxDiag = Math.hypot(width, height) * 0.75;
        const bloomR = Math.max(8, bloomEase * maxDiag * 1.35);
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        radGrad.addColorStop(0, `rgba(248, 250, 252, ${clamp01(bloomEase * 1.25)})`);
        radGrad.addColorStop(0.55, `rgba(241, 245, 249, ${bloomEase * 0.92})`);
        radGrad.addColorStop(1, `rgba(241, 245, 249, ${bloomEase * bloomEase})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      if (!completedRef.current && bloomT < 1) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [finishSequence, onRevealStart]);

  const captions = isEn
    ? ['', 'From idea', 'Through engineering', 'To real impact']
    : ['', 'Dari gagasan', 'Melalui rekayasa', 'Menjadi solusi nyata'];

  const activeCaption = captions[phaseIndex] || '';
  const isDissolving = exitState === 'dissolve';

  return (
    <motion.div
      key="v2-orbital-opening"
      data-v2-opening="active"
      initial={{ opacity: 1 }}
      animate={{ opacity: isDissolving ? 0 : 1 }}
      transition={{ duration: isDissolving ? 0.9 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[180] select-none overflow-hidden bg-[#0b0c0f] ${
        isDissolving ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* 60/120fps Continuous Orbital Telemetry Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* HUD Overlay (fades gently as 100% radial light bloom expands) */}
      <div
        className={`transition-opacity duration-500 ${
          exitState !== 'running' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Top-Left HUD Label */}
        <div className="pointer-events-none absolute top-6 left-5 sm:top-7 sm:left-7 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0] shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/55">
            PAGE PRELOADER
          </span>
        </div>

        {/* Top-Right Subtle Skip Control */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-5 right-5 sm:top-6 sm:right-7 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-white/45 hover:border-[#3b82f6]/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
        >
          {isEn ? 'SKIP' : 'LEWATI'}
        </button>

        {/* Bottom-Left Sequence Stamp */}
        <div className="pointer-events-none absolute bottom-6 left-5 sm:bottom-7 sm:left-7 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-white/40">
          SEQ 001 &nbsp;—&nbsp; EST.2026
        </div>

        {/* Bottom-Center Stage Caption */}
        <div className="pointer-events-none absolute bottom-12 sm:bottom-14 inset-x-0 flex justify-center">
          <AnimatePresence mode="wait">
            {activeCaption && (
              <motion.p
                key={activeCaption}
                initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-[11px] sm:text-[13px] tracking-[0.16em] text-white/38"
              >
                {activeCaption}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom-Right Oversized 3-Digit Tabular Percentage (Direct DOM Ref = 0 React re-render jitter!) */}
        <div className="pointer-events-none absolute bottom-4 right-5 sm:bottom-5 sm:right-7 text-right">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.36em] text-white/45">
            LOADING
          </p>
          <div className="flex items-baseline justify-end leading-none text-[#f4f4f5] tabular-nums">
            <span
              ref={counterRef}
              className="text-[54px] sm:text-[78px] font-light tracking-[-0.03em]"
            >
              000
            </span>
            <span className="ml-1.5 text-[20px] sm:text-[26px] font-light text-white/50">
              %
            </span>
          </div>
        </div>

        {/* Bottom-Edge GPU `scaleX` Hairline Progress Bar */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.06] overflow-hidden">
          <div
            ref={progressBarRef}
            style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
            className="h-full w-full bg-gradient-to-r from-[#3b82f6] via-[#93c5fd] to-[#f8fafc] shadow-[0_0_12px_rgba(59,130,246,0.75)] will-change-transform"
          />
        </div>
      </div>

      {/* Silk Luminous Veil held seamlessly across dissolve */}
      {exitState === 'dissolve' && (
        <div className="pointer-events-none absolute inset-0 bg-[#f1f5f9]" />
      )}
    </motion.div>
  );
}

V2OpeningSequence.propTypes = {
  isEn: PropTypes.bool,
  onComplete: PropTypes.func,
  onRevealStart: PropTypes.func,
};
