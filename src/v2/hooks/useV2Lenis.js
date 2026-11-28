import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Enables viewport-level `position: sticky` (`html.v2-scroll-root`) and attaches
 * a scoped Lenis smooth-scroll instance while mounted inside Portfolio V2.
 */
export function useV2Lenis(shouldReduceMotion = false) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const htmlEl = document.documentElement;
    htmlEl.classList.add('v2-scroll-root');
    return () => {
      htmlEl.classList.remove('v2-scroll-root');
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [shouldReduceMotion]);

  return lenisRef;
}
