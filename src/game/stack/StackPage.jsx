import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from '@/context/RouterContext';
import { updateDocumentMetadata } from '@/utils/seo';
import { siteConfig } from '@/config/site';
import {
  readBestScore,
  writeBestScore,
} from './logic/stackLogic';
import {
  createInputLockUntil,
  isInputLocked,
} from '../shared/gameUtils';
import { buildGameCssVars, getSeasonal3DTheme } from '../shared/seasonalGameTheme';
import { createStackWorld } from './world/createStackWorld';
import StackHUD from './ui/StackHUD';
import WebGLFallback from '../ui/WebGLFallback';

const detectTouchOrSmallScreen = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (navigator?.maxTouchPoints || 0) > 0
  );
};

const StackPage = () => {
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

  const [webglSupported, setWebglSupported] = useState(true);
  const [isTouch, setIsTouch] = useState(detectTouchOrSmallScreen);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestScore, setBestScore] = useState(() => readBestScore());
  const [currentLabel, setCurrentLabel] = useState('TYPESCRIPT');
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const menuHref = langPrefix === 'en' ? '/en/play/explore' : '/play/explore';
  const stackSectionHref = langPrefix === 'en' ? '/en#stack' : '/#stack';

  useEffect(() => {
    const title = `${t('game.stack.pageTitle')} | ${siteConfig.name}`;
    const desc = t('game.stack.pageDesc');
    updateDocumentMetadata({
      title,
      description: desc,
      canonicalPath: '/play/stack',
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
      // Lock input for 400ms after unpausing so stray clicks/keys cannot immediately drop
      applyInputLock();
    }
  }, [applyInputLock]);

  const handleRestart = useCallback(() => {
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;
    isGameOverRef.current = false;
    isPausedRef.current = false;
    setIsGameOver(false);
    setIsPaused(false);
    applyInputLock();
    worldRef.current?.setPaused(false);
    worldRef.current?.restart();
  }, [applyInputLock]);

  const handleDropAttempt = useCallback(() => {
    if (isPausedRef.current || isGameOverRef.current) return;
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;
    worldRef.current?.drop();
  }, []);

  // Keyboard controls (Space / Enter to drop, P / Escape to pause, ignore event.repeat)
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
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        if (e.target?.closest?.('[role="dialog"]') || e.target?.tagName === 'BUTTON' || e.target?.tagName === 'A') {
          return;
        }
        e.preventDefault();
        handleDropAttempt();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDropAttempt, handleTogglePause]);

  // Mount Three.js Orthographic Stack World
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    isPausedRef.current = false;
    isGameOverRef.current = false;
    setIsPaused(false);
    setIsGameOver(false);

    const mobileMode = detectTouchOrSmallScreen();
    const world = createStackWorld(container, {
      isMobile: mobileMode,
      reducedMotion: Boolean(shouldReduceMotion),
      seasonalTheme: theme3D,
      onScoreChange: ({ score: nextScore, combo: nextCombo, currentLabel: nextLabel }) => {
        setScore(nextScore);
        setCombo(nextCombo);
        if (nextLabel) setCurrentLabel(nextLabel);
        if (nextScore > 0) {
          const updatedBest = writeBestScore(nextScore);
          setBestScore(updatedBest);
        }
      },
      onGameOver: ({ score: finalScore }) => {
        isGameOverRef.current = true;
        setIsGameOver(true);
        setCombo(0);
        const updatedBest = writeBestScore(finalScore);
        setBestScore(updatedBest);
        // Lock input for 400ms after game over so held Space or stray tap cannot instantly restart
        inputLockUntilRef.current = createInputLockUntil(performance.now());
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
  }, [shouldReduceMotion, theme3D]);

  const handleCanvasPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    if (e.target?.closest?.('button, a, [role="dialog"]')) return;
    handleDropAttempt();
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
      className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] touch-none select-none"
    >
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* HTML Overlay HUD, Pause Overlay & Game Over Card */}
      <StackHUD
        score={score}
        combo={combo}
        bestScore={bestScore}
        currentLabel={currentLabel}
        isPaused={isPaused}
        isGameOver={isGameOver}
        isTouch={isTouch}
        vignetteBackground={theme3D.vignetteBackground}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        menuHref={menuHref}
        stackSectionHref={stackSectionHref}
      />
    </div>
  );
};

export default StackPage;
