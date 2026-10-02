import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 28;
const float u_line_width = 3.2;
const float u_line_blur = 4.5;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.35);
    float split_point = 0.08 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.75, st.x);
    float amplitude_strength = 0.42;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.22);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 0.35;
    float blur = smoothstep(split_point, split_point + 0.06, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x * 1.3 + perc) * 1.9),
        Perlin2D(vec2(time_scaled * 0.8, st.x * 1.6 + time_scaled) * 2.5) / 1.5,
        st.x * 0.35
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise * 0.38 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    // Natural bell-curve envelope for silk-ribbon consistency across threads
    float envelope = pow(sin(perc * PI), 0.75);

    return clamp((line_start - line_end) * envelope, 0.0, 1.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / iResolution.xy;
    float col = 0.0;

    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        float lineVal = lineFn(st, pixel(u_line_width, iResolution.xy), p, uMouse, iTime, uAmplitude, uDistance);
        col += lineVal;
    }

    col = clamp(col, 0.0, 1.0);
    // Use uColor with col controlling alpha to avoid double attenuation, keeping threads clearly visible yet subtle
    gl_FragColor = vec4(uColor, col * 0.52);
}
`;

const Threads = ({
  color = [0.98, 0.8, 0.08], // #FACC15
  amplitude = 1.1,
  distance = 0.36,
  enableMouseInteraction = true,
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);
  const targetMouse = useRef([0.5, 0.5]);
  const currentMouse = useRef([0.5, 0.5]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    let gl;
    try {
      renderer = new Renderer({ alpha: true, depth: false, antialias: true, premultipliedAlpha: false });
      gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
    } catch {
      // Graceful fallback if WebGL is disabled or unsupported
      return;
    }

    container.appendChild(gl.canvas);
    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.pointerEvents = 'none';

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: [container.clientWidth || 1, container.clientHeight || 1, 1] },
        uColor: { value: color },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: [0.5, 0.5] },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || isTouch);

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotionQuery.matches;

    const renderStaticFrame = () => {
      program.uniforms.iTime.value = 1.2;
      program.uniforms.uMouse.value = [0.5, 0.5];
      renderer.render({ scene: mesh });
    };

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.5);
      renderer.setSize(w * dpr, h * dpr);
      gl.canvas.style.width = `${w}px`;
      gl.canvas.style.height = `${h}px`;
      program.uniforms.iResolution.value = [w * dpr, h * dpr, 1];

      // If animation loop is not running, refresh static frame on resize
      if (isReducedMotion || isMobile) {
        renderStaticFrame();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const shouldInteract = enableMouseInteraction && !isMobile && !isReducedMotion;

    const handleMouseMove = (e) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height;
        targetMouse.current = [nx, ny];
      }
    };

    if (shouldInteract) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    let animationFrameId;
    let startTime = performance.now();

    const update = (now) => {
      const elapsed = (now - startTime) * 0.001;
      program.uniforms.iTime.value = elapsed;

      if (shouldInteract) {
        currentMouse.current[0] += (targetMouse.current[0] - currentMouse.current[0]) * 0.05;
        currentMouse.current[1] += (targetMouse.current[1] - currentMouse.current[1]) * 0.05;
        program.uniforms.uMouse.value = currentMouse.current;
      }

      renderer.render({ scene: mesh });
      animationFrameId = requestAnimationFrame(update);
    };

    const handleMotionChange = (e) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        renderStaticFrame();
      } else if (!isMobile) {
        startTime = performance.now();
        animationFrameId = requestAnimationFrame(update);
      }
    };
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // If mobile or reduced-motion, render a single lightweight static frame and do not run continuous RAF loop
    if (isMobile || isReducedMotion) {
      renderStaticFrame();
    } else {
      animationFrameId = requestAnimationFrame(update);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      if (shouldInteract) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      reducedMotionQuery.removeEventListener('change', handleMotionChange);

      if (gl?.canvas && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      const loseExt = gl?.getExtension('WEBGL_lose_context');
      if (loseExt) {
        loseExt.loseContext();
      }
    };
  }, [color, amplitude, distance, enableMouseInteraction]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ zIndex: 0, ...style }}
      aria-hidden="true"
    />
  );
};

Threads.propTypes = {
  color: PropTypes.arrayOf(PropTypes.number),
  amplitude: PropTypes.number,
  distance: PropTypes.number,
  enableMouseInteraction: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Threads;
