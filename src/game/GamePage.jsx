import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from '../context/RouterContext';
import { updateDocumentMetadata } from '../utils/seo';
import { siteConfig } from '../config/site';
import { createWorld } from './world/createWorld';
import GameHUD from './ui/GameHUD';
import InfoPanel from './ui/InfoPanel';
import VirtualJoystick from './ui/VirtualJoystick';
import WebGLFallback from './ui/WebGLFallback';

const detectTouchOrSmallScreen = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (navigator?.maxTouchPoints || 0) > 0
  );
};

const GamePage = () => {
  const { language, t } = useLanguage();
  const { langPrefix } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const keysRef = useRef(new Set());
  const touchVecRef = useRef({ x: 0, z: 0 });
  const nearestRef = useRef(null);
  const activeBuildingRef = useRef(null);

  const [webglSupported, setWebglSupported] = useState(true);
  const [isTouch, setIsTouch] = useState(detectTouchOrSmallScreen);
  const [nearestBuilding, setNearestBuilding] = useState(null);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [visitedIds, setVisitedIds] = useState([]);
  const [labelCoords, setLabelCoords] = useState({});

  const exitHref = langPrefix === 'en' ? '/en/play' : '/play';

  // Set noindex SEO metadata for /play/explore
  useEffect(() => {
    const title = `${t('game.pageTitle')} | ${siteConfig.name}`;
    const desc = t('game.pageDesc');
    updateDocumentMetadata({
      title,
      description: desc,
      canonicalPath: '/play/explore',
      ogTitle: title,
      ogDescription: desc,
      noindex: true,
    });
  }, [language, t]);

  // Responsive touch/mobile viewport check
  useEffect(() => {
    const onResize = () => {
      setIsTouch(detectTouchOrSmallScreen());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const openBuildingPanel = useCallback((building) => {
    if (!building) return;
    activeBuildingRef.current = building;
    setActiveBuilding(building);
    worldRef.current?.setPaused(true);
    setVisitedIds((prev) => {
      if (prev.includes(building.id)) return prev;
      const next = [...prev, building.id];
      worldRef.current?.setVisitedSet(new Set(next));
      return next;
    });
  }, []);

  const closeBuildingPanel = useCallback(() => {
    activeBuildingRef.current = null;
    setActiveBuilding(null);
    worldRef.current?.setPaused(false);
  }, []);

  const computeInputVector = useCallback(() => {
    const keys = keysRef.current;
    let kx = 0;
    let kz = 0;

    if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) kz -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) kz += 1;

    const tx = touchVecRef.current.x;
    const tz = touchVecRef.current.z;

    return {
      x: Math.abs(tx) > 0.01 ? tx : kx,
      z: Math.abs(tz) > 0.01 ? tz : kz,
    };
  }, []);

  // Keyboard listeners (WASD / Arrows / E / Escape)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        keysRef.current.clear();
        return;
      }

      if (
        e.target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
          e.target.closest?.('[role="dialog"]'))
      ) {
        return;
      }

      if (e.code === 'Escape' && activeBuildingRef.current) {
        e.preventDefault();
        closeBuildingPanel();
        return;
      }

      if (
        (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') &&
        !activeBuildingRef.current &&
        nearestRef.current
      ) {
        e.preventDefault();
        openBuildingPanel(nearestRef.current);
        return;
      }

      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.code)
      ) {
        keysRef.current.add(e.code);
      }
    };

    const onKeyUp = (e) => {
      keysRef.current.delete(e.code);
    };

    const onBlur = () => {
      keysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [closeBuildingPanel, openBuildingPanel]);

  // Mount Three.js world and dispose everything on unmount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    nearestRef.current = null;
    setNearestBuilding(null);

    const mobileMode = detectTouchOrSmallScreen();
    const world = createWorld(container, {
      isMobile: mobileMode,
      reducedMotion: Boolean(shouldReduceMotion),
      getInput: computeInputVector,
      onNearestChange: (b) => {
        nearestRef.current = b;
        setNearestBuilding(b);
      },
      onLabelsUpdate: (coords) => {
        setLabelCoords(coords);
      },
    });

    if (!world) {
      setWebglSupported(false);
      return undefined;
    }

    worldRef.current = world;

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, [computeInputVector, shouldReduceMotion]);

  const handleJoystickMove = useCallback((vec) => {
    touchVecRef.current = vec;
  }, []);

  if (!webglSupported) {
    return (
      <>
        <WebGLFallback
          exitHref={exitHref}
          onSelectBuilding={openBuildingPanel}
        />
        <InfoPanel building={activeBuilding} onClose={closeBuildingPanel} />
      </>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080808] text-[#F5F5F5]">
      {/* 3D Canvas Mount Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Persistent HTML HUD (Exit button always visible at z-[60]) */}
      <GameHUD
        nearestBuilding={nearestBuilding}
        visitedIds={visitedIds}
        labelCoords={labelCoords}
        isTouch={isTouch}
        isPanelOpen={Boolean(activeBuilding)}
        onInteract={openBuildingPanel}
        exitHref={exitHref}
      />

      {/* Touch Virtual Joystick (mobile / touch viewports) */}
      {isTouch && !activeBuilding && (
        <VirtualJoystick onMove={handleJoystickMove} />
      )}

      {/* Building Info Overlay Modal */}
      <InfoPanel building={activeBuilding} onClose={closeBuildingPanel} />
    </div>
  );
};

export default GamePage;
