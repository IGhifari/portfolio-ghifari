import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { markV2OpeningCompleted } from './v2OpeningState';

// Piecewise organic progress keyframes [normalizedTime, progressValue]
// Mirrors the reference video's cadence (smooth pauses near 34%, 71%, 97% -> 100%)
const PROGRESS_KEYFRAMES = [
  [0.0, 0.0],
  [0.16, 0.14],
  [0.23, 0.16],
  [0.34, 0.34],
  [0.4, 0.36],
  [0.54, 0.58],
  [0.64, 0.71],
  [0.71, 0.73],
  [0.83, 0.9],
  [0.92, 0.97],
  [0.97, 0.985],
  [1.0, 1.0],
];

function sampleOrganicProgress(t) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < PROGRESS_KEYFRAMES.length - 1; i += 1) {
    const [t0, p0] = PROGRESS_KEYFRAMES[i];
    const [t1, p1] = PROGRESS_KEYFRAMES[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const local = (clamped - t0) / Math.max(0.0001, t1 - t0);
      // Smoothstep interpolation between keyframes
      const smooth = local * local * (3 - 2 * local);
      return p0 + (p1 - p0) * smooth;
    }
  }
  return 1;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutCubic(t) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Deterministic ambient particles so SSR/hydration and canvas redraws are clean
const AMBIENT_PARTICLES = Array.from({ length: 38 }, (_, i) => {
  const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const seed2 = Math.sin(i * 45.164 + 19.123) * 24634.6345;
  return {
    nx: seed1 - Math.floor(seed1),
    ny: seed2 - Math.floor(seed2),
    r: i % 5 === 0 ? 1.35 : 0.85,
    alpha: 0.1 + (i % 4) * 0.06,
    drift: (i % 2 === 0 ? 1 : -1) * (4 + (i % 5) * 2),
  };
});

/**
 * Architectural Orbital Telemetry Opening Sequence (`000% -> 100%` + Luminous Reveal)
 * Plays once before entering Portfolio V2 on initial load / refresh.
 */
export default function V2OpeningSequence({ isEn = true, onComplete, onRevealStart }) {
  const canvasRef = useRef(null);
  const completedRef = useRef(false);
  const revealFiredRef = useRef(false);

  const [percent, setPercent] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [flashPhase, setFlashPhase] = useState('idle'); // 'idle' | 'flash' | 'dissolve'

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

  const triggerLuminousExit = useCallback(() => {
    if (completedRef.current) return;
    setFlashPhase((prev) => {
      if (prev !== 'idle') return prev;
      setTimeout(() => {
        setFlashPhase('dissolve');
        if (!revealFiredRef.current && typeof onRevealStart === 'function') {
          revealFiredRef.current = true;
          onRevealStart();
        }
      }, 220);
      setTimeout(() => {
        finishSequence();
      }, 1060);
      return 'flash';
    });
  }, [finishSequence, onRevealStart]);

  const handleSkip = useCallback(() => {
    if (completedRef.current) return;
    markV2OpeningCompleted();
    setFlashPhase('dissolve');
    if (!revealFiredRef.current && typeof onRevealStart === 'function') {
      revealFiredRef.current = true;
      onRevealStart();
    }
    setTimeout(() => {
      finishSequence();
    }, 420);
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

  // 60fps High-DPI Canvas Orbital Telemetry Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
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

    const DURATION_MS = 5600;
    const startTime = performance.now();
    let rafId = null;
    let lastPct = -1;
    let lastStage = -1;
    let exitTriggered = false;

    const drawCross = (x, y, size, alpha, rotate45 = false) => {
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

    const drawSectorWedge = (cx, cy, radius, startAngle, sweepAngle, alphaPeak) => {
      const steps = 22;
      for (let i = 0; i < steps; i += 1) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const a0 = startAngle - sweepAngle * (1 - f0);
        const a1 = startAngle - sweepAngle * (1 - f1) + 0.008;
        const sliceAlpha = alphaPeak * Math.pow(f1, 1.75);
        ctx.fillStyle = `rgba(210, 225, 250, ${sliceAlpha})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawNode = (x, y, radius = 5.5, alpha = 1) => {
      // Subtle electric-blue outer aura
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.4);
      glow.addColorStop(0, `rgba(59, 130, 246, ${0.38 * alpha})`);
      glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.4, 0, Math.PI * 2);
      ctx.fill();

      // Crisp white telemetry dot
      ctx.fillStyle = `rgba(244, 246, 250, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderFrame = (now) => {
      const elapsed = now - startTime;
      const rawT = clamp01(elapsed / DURATION_MS);
      const p = sampleOrganicProgress(rawT);
      const pctInt = Math.min(100, Math.round(p * 100));

      if (pctInt !== lastPct) {
        lastPct = pctInt;
        setPercent(pctInt);
      }

      const stage = p < 0.22 ? 0 : p < 0.56 ? 1 : p < 0.78 ? 2 : 3;
      if (stage !== lastStage) {
        lastStage = stage;
        setPhaseIndex(stage);
      }

      if (rawT >= 1 && !exitTriggered) {
        exitTriggered = true;
        triggerLuminousExit();
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Base architectural dark slate-obsidian fill
      ctx.fillStyle = '#0b0c0f';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const unit = Math.min(width, height);
      const scale = Math.max(0.62, Math.min(1.15, unit / 920));

      // 2. Subtle architectural drafting grid (`96px` cell spacing)
      const gridStep = Math.round(96 * scale);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.024)';
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

      // 3. Concentric stepped matte radial elevation halos
      const haloRadii = [430, 330, 235, 148].map((r) => r * scale);
      const haloAlphas = [0.014, 0.018, 0.022, 0.026];
      haloRadii.forEach((hr, idx) => {
        ctx.fillStyle = `rgba(226, 234, 248, ${haloAlphas[idx]})`;
        ctx.beginPath();
        ctx.arc(cx, cy, hr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Ambient drifting telemetry dust & outer fiducial markers
      const driftSec = elapsed * 0.001;
      AMBIENT_PARTICLES.forEach((pt) => {
        const px = (pt.nx * width + driftSec * pt.drift + width) % width;
        const py = (pt.ny * height - driftSec * pt.drift * 0.5 + height) % height;
        ctx.fillStyle = `rgba(226, 232, 240, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });

      drawCross(cx - 295 * scale, cy + 255 * scale, 5, 0.2, false);
      drawCross(cx + 285 * scale, cy + 195 * scale, 5, 0.18, false);
      drawCross(cx - 245 * scale, cy - 195 * scale, 5, 0.16, true);
      drawCross(cx + 205 * scale, cy - 165 * scale, 5, 0.18, true);
      drawCross(cx - 90 * scale, cy + 390 * scale, 5, 0.18, false);

      // ======================================================================
      // 5. CENTRAL 5-ACT GEOMETRIC ORBITAL CHOREOGRAPHY
      // ======================================================================

      if (p < 0.28) {
        // ACT 1: Radar Sweep & Concentric Contraction (`0% -> 28%`)
        const local = p / 0.28;
        const shrink = local > 0.68 ? easeInOutCubic((local - 0.68) / 0.32) : 0;

        const rOuter = lerp(172, 68, shrink) * scale;
        const rInner = lerp(108, 22, shrink) * scale;
        const angle = -Math.PI * 0.65 + local * Math.PI * 2.15;

        // Radar sector wedge (fades smoothly during final contraction)
        const wedgeAlpha = (1 - shrink) * 0.17;
        if (wedgeAlpha > 0.005) {
          drawSectorWedge(cx, cy, rOuter, angle, Math.PI * 0.32, wedgeAlpha);
        }

        // Long lower-left radial vector ray
        if (shrink < 0.85) {
          const rayAlpha = (1 - shrink / 0.85) * 0.22;
          const rayAngle = Math.PI * 0.82;
          ctx.strokeStyle = `rgba(226, 232, 240, ${rayAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rayAngle) * rOuter, cy + Math.sin(rayAngle) * rOuter);
          ctx.lineTo(cx + Math.cos(rayAngle) * unit * 0.9, cy + Math.sin(rayAngle) * unit * 0.9);
          ctx.stroke();
        }

        // Concentric rings
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.48)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.24)';
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
        ctx.stroke();

        // Extra harmonic ripple ring mid-sweep
        if (local > 0.25 && local < 0.72) {
          const midAlpha = Math.sin(((local - 0.25) / 0.47) * Math.PI) * 0.22;
          ctx.strokeStyle = `rgba(147, 197, 253, ${midAlpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, lerp(rInner, rOuter, 0.55), 0, Math.PI * 2);
          ctx.stroke();
        }

        drawCross(cx, cy, 5, 0.32, true);

        // Node pulls smoothly from outer orbit into exact `(cx, cy)`
        const nodeDist = lerp(rOuter, 0, easeInOutCubic(clamp01((local - 0.62) / 0.38)));
        const nx = cx + Math.cos(angle) * nodeDist;
        const ny = cy + Math.sin(angle) * nodeDist;
        drawNode(nx, ny, 5.5 * scale, 1);
      } else if (p < 0.56) {
        // ACT 2: Horizontal Beam Projection & Satellite Orbit (`28% -> 56%`)
        const local = (p - 0.28) / 0.28;
        const extend =
          local < 0.45
            ? easeOutCubic(local / 0.45)
            : local > 0.8
            ? 1 - easeInOutCubic((local - 0.8) / 0.2)
            : 1;

        const baseRadius = lerp(68, 128, easeOutCubic(clamp01(local / 0.35))) * scale;
        const innerReticleR = 23 * scale;
        const beamX = cx + lerp(0, 215 * scale, extend);
        const coneHalfH = 38 * scale * extend;

        // Horizontal projection light cone
        if (extend > 0.04) {
          const coneGrad = ctx.createLinearGradient(cx, cy, beamX, cy);
          coneGrad.addColorStop(0, 'rgba(226, 232, 240, 0.03)');
          coneGrad.addColorStop(0.7, 'rgba(191, 219, 254, 0.14)');
          coneGrad.addColorStop(1, 'rgba(226, 232, 240, 0.24)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(beamX, cy - coneHalfH);
          ctx.lineTo(beamX, cy + coneHalfH);
          ctx.closePath();
          ctx.fill();

          // Horizontal axis line extending past node to fiducial `+`
          const axisEnd = cx + 285 * scale * extend;
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.24)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - innerReticleR, cy);
          ctx.lineTo(axisEnd, cy);
          ctx.stroke();
          drawCross(axisEnd, cy, 4.5, 0.32 * extend, false);
        }

        // Primary circle & inner star reticle
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.34)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.38)';
        ctx.beginPath();
        ctx.arc(cx, cy, innerReticleR, 0, Math.PI * 2);
        ctx.stroke();
        drawCross(cx, cy, 8 * scale, 0.45, false);
        drawCross(cx, cy, 5 * scale, 0.3, true);

        // Dashed satellite target ring around projected node
        if (local > 0.32 && local < 0.92) {
          const satAlpha = Math.sin(((local - 0.32) / 0.6) * Math.PI) * 0.28;
          ctx.save();
          ctx.setLineDash([4, 5]);
          ctx.strokeStyle = `rgba(226, 232, 240, ${satAlpha})`;
          ctx.beginPath();
          ctx.arc(beamX, cy, 52 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        drawNode(beamX, cy, 6.2 * scale, 1);
      } else if (p < 0.77) {
        // ACT 3: Viewfinder Target Lock -> Twin Intersecting Vesica Circles (`56% -> 77%`)
        const local = (p - 0.56) / 0.21;

        if (local < 0.58) {
          const sub = local / 0.58;
          const fade = sub < 0.2 ? sub / 0.2 : sub > 0.8 ? (1 - sub) / 0.2 : 1;
          const dashR = 76 * scale;

          // Dashed outer lock circle
          ctx.save();
          ctx.setLineDash([5, 7]);
          ctx.strokeStyle = `rgba(226, 232, 240, ${0.32 * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, dashR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // 4 precision L-corner viewfinder brackets
          const box = 42 * scale;
          const arm = 13 * scale;
          ctx.strokeStyle = `rgba(226, 232, 240, ${0.55 * fade})`;
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          // Top-left
          ctx.moveTo(cx - box, cy - box + arm);
          ctx.lineTo(cx - box, cy - box);
          ctx.lineTo(cx - box + arm, cy - box);
          // Top-right
          ctx.moveTo(cx + box - arm, cy - box);
          ctx.lineTo(cx + box, cy - box);
          ctx.lineTo(cx + box, cy - box + arm);
          // Bottom-left
          ctx.moveTo(cx - box, cy + box - arm);
          ctx.lineTo(cx - box, cy + box);
          ctx.lineTo(cx - box + arm, cy + box);
          // Bottom-right
          ctx.moveTo(cx + box - arm, cy + box);
          ctx.lineTo(cx + box, cy + box);
          ctx.lineTo(cx + box, cy + box - arm);
          ctx.stroke();

          // Floating micro telemetry squares (exact `o_07.png` detail)
          ctx.fillStyle = `rgba(226, 232, 240, ${0.26 * fade})`;
          ctx.fillRect(cx - 39 * scale, cy - 39 * scale, 19 * scale, 19 * scale);
          ctx.strokeStyle = `rgba(226, 232, 240, ${0.36 * fade})`;
          ctx.strokeRect(cx - 58 * scale, cy - 14 * scale, 11 * scale, 11 * scale);

          // Twin sweeping telemetry rays downward-right
          const ray1 = Math.PI * 0.18 + sub * 0.24;
          const ray2 = Math.PI * 0.39 + sub * 0.18;
          ctx.strokeStyle = `rgba(226, 232, 240, ${0.22 * fade})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ray1) * 230 * scale, cy + Math.sin(ray1) * 230 * scale);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ray2) * 320 * scale, cy + Math.sin(ray2) * 320 * scale);
          ctx.stroke();

          drawNode(cx, cy, 7 * scale, 1);
        } else {
          // Twin large vertical intersecting Vesica circles (`#09` & `#10`)
          const sub = (local - 0.58) / 0.42;
          const expand = easeInOutCubic(sub);
          const vRadius = lerp(90, 235, expand) * scale;
          const vOffset = lerp(45, 165, expand) * scale;
          const alpha = Math.sin(sub * Math.PI) * 0.24 + 0.08;

          ctx.strokeStyle = `rgba(226, 232, 240, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy - vOffset, vRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, cy + vOffset, vRadius, 0, Math.PI * 2);
          ctx.stroke();

          drawNode(cx, cy, lerp(6, 2.5, expand) * scale, 0.9);
        }
      } else if (p < 0.95) {
        // ACT 4: Precision 48-Tick Calibrated Dial & High-Speed Orbit (`77% -> 95%`, `o_11.png`)
        const local = (p - 0.77) / 0.18;
        const intro = easeOutCubic(clamp01(local / 0.25));
        const outro = local > 0.8 ? easeInOutCubic((local - 0.8) / 0.2) : 0;

        const coreR = lerp(18, 72, intro) * (1 - outro * 0.55) * scale;
        const innerRingR = coreR * 0.52;
        const tickInnerR = lerp(70, 96, intro) * (1 - outro * 0.45) * scale;
        const midRingR = lerp(95, 134, intro) * (1 - outro * 0.55) * scale;
        const outerOrbitR = lerp(130, 206, intro) * (1 - outro * 0.65) * scale;

        // Vertical North meridian line
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.22 * (1 - outro)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - coreR);
        ctx.lineTo(cx, cy - 330 * scale);
        ctx.stroke();

        // Orbiting radar sector wedge (appears in second half of Act 4 like `#12`)
        const orbitAngle = Math.PI * 0.38 + local * Math.PI * 2.4;
        if (local > 0.35 && outro < 0.8) {
          drawSectorWedge(
            cx,
            cy,
            outerOrbitR,
            orbitAngle,
            Math.PI * 0.14,
            0.22 * (1 - outro)
          );
        }

        // Solid matte architectural disc + inner crosshair (`o_11.png`)
        ctx.fillStyle = `rgba(203, 213, 225, ${0.58 * intro * (1 - outro * 0.85)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(15, 23, 42, ${0.42 * intro * (1 - outro)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, innerRingR, 0, Math.PI * 2);
        ctx.moveTo(cx - 10 * scale, cy);
        ctx.lineTo(cx + 10 * scale, cy);
        ctx.moveTo(cx, cy - 10 * scale);
        ctx.lineTo(cx, cy + 10 * scale);
        ctx.stroke();

        // 48-tick radial compass dial
        const tickAlpha = 0.28 * intro * (1 - outro);
        if (tickAlpha > 0.01) {
          ctx.strokeStyle = `rgba(226, 232, 240, ${tickAlpha})`;
          ctx.beginPath();
          for (let i = 0; i < 48; i += 1) {
            const ta = (i / 48) * Math.PI * 2;
            const len = (i % 4 === 0 ? 13 : 7) * scale;
            ctx.moveTo(cx + Math.cos(ta) * tickInnerR, cy + Math.sin(ta) * tickInnerR);
            ctx.lineTo(
              cx + Math.cos(ta) * (tickInnerR + len),
              cy + Math.sin(ta) * (tickInnerR + len)
            );
          }
          ctx.stroke();
        }

        // Middle & outer orbital rings
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.26 * (1 - outro * 0.5)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, midRingR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.48)';
        ctx.beginPath();
        ctx.arc(cx, cy, outerOrbitR, 0, Math.PI * 2);
        ctx.stroke();

        const nx = cx + Math.cos(orbitAngle) * outerOrbitR;
        const ny = cy + Math.sin(orbitAngle) * outerOrbitR;
        drawNode(nx, ny, 5.5 * scale, 1);
      } else {
        // ACT 5: Tight Final Iris Lock at `95% -> 100%` (`exit_sheet.png` 7.70s -> 7.90s)
        const local = clamp01((p - 0.95) / 0.05);
        const rOuter = lerp(68, 46, easeOutCubic(local)) * scale;
        const rInner = lerp(34, 24, easeOutCubic(local)) * scale;
        const angle = lerp(-Math.PI * 1.15, -Math.PI * 0.5, easeInOutCubic(local));

        drawSectorWedge(cx, cy, rOuter, angle, Math.PI * 0.45, 0.16 * (1 - local * 0.5));

        // Lower-left diagonal lock line
        const rayAngle = Math.PI * 0.82;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.24 * (1 - local * 0.35)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rayAngle) * rOuter, cy + Math.sin(rayAngle) * rOuter);
        ctx.lineTo(
          cx + Math.cos(rayAngle) * lerp(360, 180, local) * scale,
          cy + Math.sin(rayAngle) * lerp(360, 180, local) * scale
        );
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.48)';
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.28)';
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
        ctx.stroke();

        drawCross(cx, cy, 3.5, 0.35, true);

        const nx = cx + Math.cos(angle) * rOuter;
        const ny = cy + Math.sin(angle) * rOuter;
        drawNode(nx, ny, 4.5 * scale, 1);
      }

      ctx.restore();

      if (!completedRef.current && rawT < 1) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [triggerLuminousExit]);

  const captions = isEn
    ? ['', 'From idea', 'Through engineering', 'To real impact']
    : ['', 'Dari gagasan', 'Melalui rekayasa', 'Menjadi solusi nyata'];

  const activeCaption = captions[phaseIndex] || '';
  const paddedPercent = String(percent).padStart(3, '0');
  const isDissolving = flashPhase === 'dissolve';

  return (
    <motion.div
      key="v2-orbital-opening"
      data-v2-opening="active"
      initial={{ opacity: 1 }}
      animate={{ opacity: isDissolving ? 0 : 1 }}
      transition={{ duration: isDissolving ? 0.84 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[180] select-none overflow-hidden ${
        isDissolving ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* 60fps Orbital Telemetry Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full" />

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

      {/* Bottom-Center Stage Caption (`From idea` -> `Through engineering` -> `To real impact`) */}
      <div className="pointer-events-none absolute bottom-12 sm:bottom-14 inset-x-0 flex justify-center">
        <AnimatePresence mode="wait">
          {activeCaption && (
            <motion.p
              key={activeCaption}
              initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[11px] sm:text-[13px] tracking-[0.16em] text-white/38"
            >
              {activeCaption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-Right Oversized 3-Digit Tabular Percentage (`000% -> 100%`) */}
      <div className="pointer-events-none absolute bottom-4 right-5 sm:bottom-5 sm:right-7 text-right">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.36em] text-white/45">
          LOADING
        </p>
        <div className="flex items-baseline justify-end leading-none text-[#f4f4f5] tabular-nums">
          <span className="text-[54px] sm:text-[78px] font-light tracking-[-0.03em]">
            {paddedPercent}
          </span>
          <span className="ml-1.5 text-[20px] sm:text-[26px] font-light text-white/50">
            %
          </span>
        </div>
      </div>

      {/* Bottom-Edge Hairline Progress Bar */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.06]">
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-[#3b82f6] via-[#93c5fd] to-[#f8fafc] shadow-[0_0_12px_rgba(59,130,246,0.75)] transition-[width] duration-100 ease-out"
        />
      </div>

      {/* Luminous 100% Flash Veil (`exit_sheet.png` 8.10s -> 8.60s smooth white-icy reveal) */}
      <AnimatePresence>
        {flashPhase !== 'idle' && (
          <motion.div
            key="v2-luminous-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 bg-[#f1f5f9]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

V2OpeningSequence.propTypes = {
  isEn: PropTypes.bool,
  onComplete: PropTypes.func,
  onRevealStart: PropTypes.func,
};
