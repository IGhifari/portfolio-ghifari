import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from '../../context/RouterContext';
import { updateDocumentMetadata } from '../../utils/seo';
import { siteConfig } from '../../config/site';
import {
  BUGS_CONFIG,
  readBugsBestScore,
  writeBugsBestScore,
} from './logic/bugsLogic';
import {
  createInputLockUntil,
  isInputLocked,
} from '../shared/gameUtils';
import { buildGameCssVars, getSeasonal3DTheme } from '../shared/seasonalGameTheme';
import { createBugsWorld } from './world/createBugsWorld';
import BugsHUD from './ui/BugsHUD';
import WebGLFallback from '../ui/WebGLFallback';

const detectTouchOrSmallScreen = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (navigator?.maxTouchPoints || 0) > 0
  );
};

const BugsPage = () => {
  const { language, t } = useLanguage();
  const { season, seasonalEnabled } = useTheme();
  const { langPrefix } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const theme3D = useMemo(
    () => getSeasonal3DTheme(season, seasonalEnabled),
    [season, seasonalEnabled]
  );
  const gameCssVars = useMemo(() => buildGameCssVars(theme3D), [theme3D]);

  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const inputLockUntilRef = useRef(0);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const bannerTimerRef = useRef(null);

  const [webglSupported, setWebglSupported] = useState(true);
  const [isTouch, setIsTouch] = useState(detectTouchOrSmallScreen);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [serverHp, setServerHp] = useState(BUGS_CONFIG.maxServerHp);
  const [bestScore, setBestScore] = useState(() => readBugsBestScore());
  const [boss, setBoss] = useState(null);
  const [waveBanner, setWaveBanner] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const menuHref = langPrefix === 'en' ? '/en/play/explore' : '/play/explore';
  const projectsSectionHref = langPrefix === 'en' ? '/en#projects' : '/#projects';

  useEffect(() => {
    const title = `${t('game.bugs.pageTitle')} | ${siteConfig.name}`;
    const desc = t('game.bugs.pageDesc');
    updateDocumentMetadata({
      title,
      description: desc,
      canonicalPath: '/play/bugs',
      ogTitle: title,
      ogDescription: desc,
      noindex: true,
    });
  }, [language, t]);

  useEffect(() => {
    const onResize = () => setIsTouch(detectTouchOrSmallScreen());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const applyInputLock = useCallback(() => {
    inputLockUntilRef.current = createInputLockUntil(performance.now());
  }, []);

  const handleTogglePause = useCallback(() => {
    if (isGameOverRef.current) return;
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setIsPaused(next);
    worldRef.current?.setPaused(next);
    if (!next) {
      applyInputLock();
    }
  }, [applyInputLock]);

  const handleRestart = useCallback(() => {
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;
    isGameOverRef.current = false;
    isPausedRef.current = false;
    setIsGameOver(false);
    setIsPaused(false);
    setWaveBanner(null);
    applyInputLock();
    worldRef.current?.setPaused(false);
    worldRef.current?.restart();
  }, [applyInputLock]);

  // Keyboard controls (P / Escape to pause, ignore event.repeat)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.code === 'KeyP' || (e.code === 'Escape' && !isGameOverRef.current)) {
        if (e.target?.closest?.('[role="dialog"]') && !isPausedRef.current) {
          return;
        }
        e.preventDefault();
        handleTogglePause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTogglePause]);

  // Mount Three.js Orthographic Bug Hunter Arena
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    isPausedRef.current = false;
    isGameOverRef.current = false;
    setIsPaused(false);
    setIsGameOver(false);

    const mobileMode = detectTouchOrSmallScreen();
    const world = createBugsWorld(container, {
      isMobile: mobileMode,
      reducedMotion: Boolean(shouldReduceMotion),
      seasonalTheme: theme3D,
      onStateChange: (next) => {
        setScore(next.score);
        setCombo(next.combo);
        setWave(next.wave);
        setServerHp(next.serverHp);
        setBoss(next.boss);
        if (next.score > 0) {
          const updatedBest = writeBugsBestScore(next.score);
          setBestScore(updatedBest);
        }
      },
      onWaveCleared: (clearedWave) => {
        if (clearedWave % BUGS_CONFIG.bannerWaveInterval === 0) {
          setWaveBanner(clearedWave);
          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
          bannerTimerRef.current = setTimeout(() => {
            setWaveBanner(null);
          }, 1800);
        }
      },
      onGameOver: ({ score: finalScore, wave: finalWave }) => {
        isGameOverRef.current = true;
        setIsGameOver(true);
        setCombo(0);
        setWave(finalWave);
        const updatedBest = writeBugsBestScore(finalScore);
        setBestScore(updatedBest);
        inputLockUntilRef.current = createInputLockUntil(performance.now());
      },
    });

    if (!world) {
      setWebglSupported(false);
      return undefined;
    }

    worldRef.current = world;
    if (typeof window !== 'undefined') {
      window.__bugsWorld = world;
    }

    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (typeof window !== 'undefined' && window.__bugsWorld === world) {
        delete window.__bugsWorld;
      }
      world.dispose();
      worldRef.current = null;
    };
  }, [shouldReduceMotion, theme3D]);

  const handleCanvasPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    if (isPausedRef.current || isGameOverRef.current) return;
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;
    if (e.target?.closest?.('button, a, [role="dialog"]')) return;
    worldRef.current?.hitAtClientPos(e.clientX, e.clientY);
  };

  if (!webglSupported) {
    return (
      <div style={gameCssVars}>
        <WebGLFallback exitHref={menuHref} />
      </div>
    );
  }

  return (
    <div
      style={gameCssVars}
      onPointerDown={handleCanvasPointerDown}
      className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] touch-none select-none cursor-crosshair"
    >
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* HTML Overlay HUD, Wave Banner, Pause Overlay & Game Over Card */}
      <BugsHUD
        score={score}
        combo={combo}
        wave={wave}
        serverHp={serverHp}
        maxServerHp={BUGS_CONFIG.maxServerHp}
        bestScore={bestScore}
        boss={boss}
        waveBanner={waveBanner}
        isPaused={isPaused}
        isGameOver={isGameOver}
        isTouch={isTouch}
        reducedMotion={Boolean(shouldReduceMotion)}
        vignetteBackground={theme3D.vignetteBackground}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        menuHref={menuHref}
        projectsSectionHref={projectsSectionHref}
      />
    </div>
  );
};

export default BugsPage;
