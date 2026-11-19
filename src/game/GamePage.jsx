import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from '../context/RouterContext';
import { updateDocumentMetadata } from '../utils/seo';
import { siteConfig, ENABLE_STACK_GAME, ENABLE_BUG_GAME, ENABLE_RUNNER_GAME } from '../config/site';
import { buildGameCssVars, getExploreParkTheme } from './shared/seasonalGameTheme';
import { createWorld } from './world/createWorld';
import GameHUD from './ui/GameHUD';
import FootballHUD from './ui/FootballHUD';
import InfoPanel from './ui/InfoPanel';
import ArcadeModal from './ui/ArcadeModal';
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
  const { season, seasonalEnabled } = useTheme();
  const { langPrefix } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const theme3D = useMemo(
    () => getExploreParkTheme(season, seasonalEnabled),
    [season, seasonalEnabled]
  );
  const gameCssVars = useMemo(() => buildGameCssVars(theme3D), [theme3D]);

  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const keysRef = useRef(new Set());
  const touchVecRef = useRef({ x: 0, z: 0 });
  const nearestRef = useRef(null);
  const activeBuildingRef = useRef(null);
  const isArcadeOpenRef = useRef(false);
  const goalTimerRef = useRef(null);

  const [webglSupported, setWebglSupported] = useState(true);
  const [isTouch, setIsTouch] = useState(detectTouchOrSmallScreen);
  const [nearestBuilding, setNearestBuilding] = useState(null);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [visitedIds, setVisitedIds] = useState([]);
  const [labelCoords, setLabelCoords] = useState({});
  const [footballUi, setFootballUi] = useState({
    inZone: false,
    inKickRange: false,
    score: 0,
  });
  const [goalBannerSide, setGoalBannerSide] = useState(null);

  const prefix = langPrefix === 'en' ? '/en' : '';
  const exitHref = prefix || '/';
  const hasMiniGames = ENABLE_STACK_GAME || ENABLE_BUG_GAME || ENABLE_RUNNER_GAME;

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

  const openArcadePanel = useCallback(() => {
    if (!hasMiniGames) return;
    activeBuildingRef.current = null;
    setActiveBuilding(null);
    isArcadeOpenRef.current = true;
    setIsArcadeOpen(true);
    worldRef.current?.setPaused(true);
  }, [hasMiniGames]);

  const closeArcadePanel = useCallback(() => {
    isArcadeOpenRef.current = false;
    setIsArcadeOpen(false);
    worldRef.current?.setPaused(false);
  }, []);

  const openBuildingPanel = useCallback(
    (building) => {
      if (!building) return;
      if (building.isArcade || building.id === 'arcade') {
        openArcadePanel();
        return;
      }
      isArcadeOpenRef.current = false;
      setIsArcadeOpen(false);
      activeBuildingRef.current = building;
      setActiveBuilding(building);
      worldRef.current?.setPaused(true);
      setVisitedIds((prev) => {
        if (prev.includes(building.id)) return prev;
        const next = [...prev, building.id];
        worldRef.current?.setVisitedSet(new Set(next));
        return next;
      });
    },
    [openArcadePanel]
  );

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

      if (e.code === 'Escape') {
        if (isArcadeOpenRef.current) {
          e.preventDefault();
          closeArcadePanel();
          return;
        }
        if (activeBuildingRef.current) {
          e.preventDefault();
          closeBuildingPanel();
          return;
        }
      }

      if (
        e.target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
          e.target.closest?.('[role="dialog"]'))
      ) {
        return;
      }

      if (
        (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') &&
        !activeBuildingRef.current &&
        !isArcadeOpenRef.current &&
        nearestRef.current
      ) {
        e.preventDefault();
        openBuildingPanel(nearestRef.current);
        return;
      }

      if (
        e.code === 'Space' &&
        !activeBuildingRef.current &&
        !isArcadeOpenRef.current &&
        !['BUTTON', 'A'].includes(e.target?.tagName)
      ) {
        e.preventDefault();
        worldRef.current?.kickBall();
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
  }, [closeArcadePanel, closeBuildingPanel, openBuildingPanel]);

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
      includeArcade: hasMiniGames,
      seasonalTheme: theme3D,
      getInput: computeInputVector,
      onNearestChange: (b) => {
        nearestRef.current = b;
        setNearestBuilding(b);
      },
      onLabelsUpdate: (coords) => {
        setLabelCoords(coords);
      },
      onFootballChange: (nextFootball) => {
        setFootballUi(nextFootball);
      },
      onGoalScored: (side) => {
        if (goalTimerRef.current) clearTimeout(goalTimerRef.current);
        setGoalBannerSide(side);
        goalTimerRef.current = setTimeout(() => {
          setGoalBannerSide(null);
          goalTimerRef.current = null;
        }, 1600);
      },
    });

    if (!world) {
      setWebglSupported(false);
      return undefined;
    }

    worldRef.current = world;

    return () => {
      if (goalTimerRef.current) {
        clearTimeout(goalTimerRef.current);
        goalTimerRef.current = null;
      }
      world.dispose();
      worldRef.current = null;
    };
  }, [computeInputVector, hasMiniGames, shouldReduceMotion, theme3D]);

  const handleJoystickMove = useCallback((vec) => {
    touchVecRef.current = vec;
  }, []);

  const handleKickBall = useCallback(() => {
    worldRef.current?.kickBall();
  }, []);

  const handleResetBall = useCallback(() => {
    worldRef.current?.resetBall();
  }, []);

  const anyModalOpen = Boolean(activeBuilding || isArcadeOpen);

  if (!webglSupported) {
    return (
      <div style={gameCssVars}>
        <WebGLFallback
          exitHref={exitHref}
          onSelectBuilding={openBuildingPanel}
        />
        <InfoPanel building={activeBuilding} onClose={closeBuildingPanel} />
      </div>
    );
  }

  return (
    <div
      style={gameCssVars}
      className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      {/* 3D Canvas Mount Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Persistent HTML HUD (Exit & Mini-Games buttons always visible at z-[60]) */}
      <GameHUD
        nearestBuilding={nearestBuilding}
        visitedIds={visitedIds}
        labelCoords={labelCoords}
        isTouch={isTouch}
        isPanelOpen={anyModalOpen}
        hasArcade={hasMiniGames}
        vignetteBackground={theme3D.vignetteBackground}
        onInteract={openBuildingPanel}
        onOpenArcade={openArcadePanel}
        exitHref={exitHref}
      />

      {/* Zone-Scoped Football Score HUD & Touch Kick Button */}
      {!anyModalOpen && (
        <FootballHUD
          inZone={footballUi.inZone}
          inKickRange={footballUi.inKickRange}
          score={footballUi.score}
          goalBannerSide={goalBannerSide}
          isTouch={isTouch}
          onKick={handleKickBall}
          onResetBall={handleResetBall}
        />
      )}

      {/* Touch Virtual Joystick (mobile / touch viewports) */}
      {isTouch && !anyModalOpen && (
        <VirtualJoystick onMove={handleJoystickMove} />
      )}

      {/* Building Info Overlay Modal */}
      <InfoPanel building={activeBuilding} onClose={closeBuildingPanel} />

      {/* Quick Arcade Lab Mini-Games Selector Modal */}
      <ArcadeModal
        isOpen={isArcadeOpen}
        onClose={closeArcadePanel}
        prefix={prefix}
        enableStackGame={ENABLE_STACK_GAME}
        enableBugGame={ENABLE_BUG_GAME}
        enableRunnerGame={ENABLE_RUNNER_GAME}
      />
    </div>
  );
};

export default GamePage;
