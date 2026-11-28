import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from '@/context/RouterContext';
import { updateDocumentMetadata } from '@/utils/seo';
import { siteConfig } from '@/config/site';
import {
  GAME_STATES,
  RUNNER_CONFIG,
  createInputLockUntil,
  isInputLocked,
  detectSwipeAction,
  readRunnerBestScore,
  writeRunnerBestScore,
} from './logic/runnerLogic';
import { buildGameCssVars, getSeasonal3DTheme } from '../shared/seasonalGameTheme';
import { createRunnerWorld } from './world/createRunnerWorld';
import RunnerHUD from './ui/RunnerHUD';
import WebGLFallback from '../ui/WebGLFallback';

const detectTouchOrSmallScreen = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (navigator?.maxTouchPoints || 0) > 0
  );
};

const RunnerPage = () => {
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
  const gameStateRef = useRef(GAME_STATES.READY);
  const pointerGestureRef = useRef(null);
  const milestoneTimerRef = useRef(null);
  const tokenToastTimerRef = useRef(null);
  const goFlashTimerRef = useRef(null);

  const [webglSupported, setWebglSupported] = useState(true);
  const [isTouch, setIsTouch] = useState(detectTouchOrSmallScreen);
  const [gameState, setGameState] = useState(GAME_STATES.READY);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [countdownValue, setCountdownValue] = useState(RUNNER_CONFIG.countdownSeconds);
  const [showGoFlash, setShowGoFlash] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(RUNNER_CONFIG.initialLives);
  const [multiplier, setMultiplier] = useState(1);
  const [tokensCollected, setTokensCollected] = useState(0);
  const [bestScore, setBestScore] = useState(() => readRunnerBestScore());
  const [invulnActive, setInvulnActive] = useState(false);
  const [milestoneBanner, setMilestoneBanner] = useState(null);
  const [tokenToast, setTokenToast] = useState(null);

  const menuHref = langPrefix === 'en' ? '/en/play/explore' : '/play/explore';
  const stackSectionHref = langPrefix === 'en' ? '/en#stack' : '/#stack';

  useEffect(() => {
    const title = `${t('game.runner.pageTitle')} | ${siteConfig.name}`;
    const desc = t('game.runner.pageDesc');
    updateDocumentMetadata({
      title,
      description: desc,
      canonicalPath: '/play/runner',
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

  const handleStartRun = useCallback(() => {
    if (gameStateRef.current !== GAME_STATES.READY) return;
    setCountdownStarted(true);
    worldRef.current?.startRun();
  }, []);

  const handleTogglePause = useCallback(() => {
    const cur = gameStateRef.current;
    if (cur === GAME_STATES.GAME_OVER || cur === GAME_STATES.READY) return;
    const nextPaused = cur !== GAME_STATES.PAUSED;
    worldRef.current?.setPaused(nextPaused);
    if (!nextPaused) {
      applyInputLock();
    }
  }, [applyInputLock]);

  const handleRestart = useCallback(() => {
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;
    setMilestoneBanner(null);
    setTokenToast(null);
    setShowGoFlash(false);
    setCountdownStarted(true);
    applyInputLock();
    worldRef.current?.restart(Date.now(), true);
  }, [applyInputLock]);

  // Keyboard controls (Arrows / WASD / Space, P / Esc for pause)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const cur = gameStateRef.current;

      if (e.code === 'KeyP' || (e.code === 'Escape' && cur !== GAME_STATES.GAME_OVER)) {
        if (cur === GAME_STATES.READY) return;
        e.preventDefault();
        handleTogglePause();
        return;
      }

      if (e.target?.closest?.('[role="dialog"]') || e.target?.tagName === 'BUTTON' || e.target?.tagName === 'A') {
        return;
      }

      if (cur !== GAME_STATES.PLAYING) return;
      if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        worldRef.current?.moveLane(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        worldRef.current?.moveLane(1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        worldRef.current?.jump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTogglePause]);

  // Mount Three.js Stack Runner World
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const mobileMode = detectTouchOrSmallScreen();
    const world = createRunnerWorld(container, {
      isMobile: mobileMode,
      reducedMotion: Boolean(shouldReduceMotion),
      seasonalTheme: theme3D,
      onStateChange: (snap) => {
        const prev = gameStateRef.current;
        gameStateRef.current = snap.gameState;
        setGameState(snap.gameState);
        setCountdownValue(snap.countdownValue);
        setScore(snap.score);
        setDistance(snap.distance);
        setLives(snap.lives);
        setMultiplier(snap.multiplier);
        setTokensCollected(snap.tokensCollected);
        setInvulnActive(snap.invulnActive);

        if (prev === GAME_STATES.READY && snap.gameState === GAME_STATES.PLAYING) {
          setShowGoFlash(true);
          if (goFlashTimerRef.current) clearTimeout(goFlashTimerRef.current);
          goFlashTimerRef.current = setTimeout(() => setShowGoFlash(false), 600);
        }

        if (snap.score > 0) {
          setBestScore(writeRunnerBestScore(snap.score));
        }
      },
      onMilestone: (meters) => {
        setMilestoneBanner(meters);
        if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
        milestoneTimerRef.current = setTimeout(() => setMilestoneBanner(null), 2200);
      },
      onFeedback: (evt) => {
        if (evt.type === 'token') {
          setTokenToast({ label: evt.label, points: evt.points });
          if (tokenToastTimerRef.current) clearTimeout(tokenToastTimerRef.current);
          tokenToastTimerRef.current = setTimeout(() => setTokenToast(null), 1100);
        }
      },
      onGameOver: ({ score: finalScore }) => {
        applyInputLock();
        if (finalScore > 0) {
          setBestScore(writeRunnerBestScore(finalScore));
        }
      },
    });

    if (!world) {
      setWebglSupported(false);
      return undefined;
    }

    worldRef.current = world;
    if (typeof window !== 'undefined') {
      window.__runnerWorld = world;
    }

    return () => {
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
      if (tokenToastTimerRef.current) clearTimeout(tokenToastTimerRef.current);
      if (goFlashTimerRef.current) clearTimeout(goFlashTimerRef.current);
      if (typeof window !== 'undefined' && window.__runnerWorld === world) {
        delete window.__runnerWorld;
      }
      world.dispose();
      worldRef.current = null;
    };
  }, [applyInputLock, shouldReduceMotion, theme3D]);

  // Pointer swipe & tap input handlers (scoped strictly to gameplay surface)
  const triggerAction = (action) => {
    if (gameStateRef.current !== GAME_STATES.PLAYING) return;
    if (isInputLocked(performance.now(), inputLockUntilRef.current)) return;

    if (action === 'left') {
      worldRef.current?.moveLane(-1);
    } else if (action === 'right') {
      worldRef.current?.moveLane(1);
    } else if (action === 'up' || action === 'tap') {
      worldRef.current?.jump();
    }
  };

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    if (gameStateRef.current !== GAME_STATES.PLAYING) return;
    if (e.target?.closest?.('button, a, [role="dialog"]')) return;
    pointerGestureRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      triggered: false,
    };
  };

  const handlePointerMove = (e) => {
    const g = pointerGestureRef.current;
    if (!g || g.id !== e.pointerId || g.triggered) return;
    const action = detectSwipeAction(
      { x: g.x, y: g.y },
      { x: e.clientX, y: e.clientY },
      typeof window !== 'undefined' ? window.innerWidth : 390
    );
    if (action && action !== 'tap') {
      g.triggered = true;
      triggerAction(action);
    }
  };

  const handlePointerUp = (e) => {
    const g = pointerGestureRef.current;
    if (!g || g.id !== e.pointerId) return;
    pointerGestureRef.current = null;
    if (g.triggered) return;

    const action = detectSwipeAction(
      { x: g.x, y: g.y },
      { x: e.clientX, y: e.clientY },
      typeof window !== 'undefined' ? window.innerWidth : 390
    );
    if (action) {
      triggerAction(action);
    }
  };

  const handlePointerCancel = () => {
    pointerGestureRef.current = null;
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] touch-none select-none"
    >
      <div ref={containerRef} className="w-full h-full" />

      <RunnerHUD
        gameState={gameState}
        countdownStarted={countdownStarted}
        countdownValue={countdownValue}
        showGoFlash={showGoFlash}
        score={score}
        distance={distance}
        lives={lives}
        maxLives={RUNNER_CONFIG.initialLives}
        multiplier={multiplier}
        tokensCollected={tokensCollected}
        bestScore={bestScore}
        invulnActive={invulnActive}
        milestoneBanner={milestoneBanner}
        tokenToast={tokenToast}
        isTouch={isTouch}
        reducedMotion={Boolean(shouldReduceMotion)}
        vignetteBackground={theme3D.vignetteBackground}
        onStartRun={handleStartRun}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        menuHref={menuHref}
        stackSectionHref={stackSectionHref}
      />
    </div>
  );
};

export default RunnerPage;
