import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCpu,
  FiHeart,
  FiLayers,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { RouterLink } from '../../../context/RouterContext';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { GAME_STATES } from '../logic/runnerLogic';

const stopEvent = (e) => {
  e.stopPropagation();
};

const RunnerHUD = ({
  gameState,
  countdownStarted,
  countdownValue,
  showGoFlash,
  score,
  distance,
  lives,
  maxLives = 3,
  multiplier,
  tokensCollected,
  bestScore,
  invulnActive,
  milestoneBanner,
  tokenToast,
  isTouch,
  reducedMotion = false,
  vignetteBackground,
  onStartRun,
  onTogglePause,
  onRestart,
  menuHref = '/play',
  stackSectionHref = '/#stack',
}) => {
  const { t } = useLanguage();

  const isPaused = gameState === GAME_STATES.PAUSED;
  const isGameOver = gameState === GAME_STATES.GAME_OVER;
  const isReady = gameState === GAME_STATES.READY;
  const isPlayable = gameState === GAME_STATES.PLAYING;

  // Focus trap strictly reserved for Pause & Game Over modals (never normal gameplay or READY)
  const modalRef = useRef(null);
  const primaryBtnRef = useRef(null);
  useFocusTrap({
    isOpen: Boolean(isPaused || isGameOver),
    containerRef: modalRef,
    initialFocusRef: primaryBtnRef,
    onClose: isPaused && !isGameOver ? onTogglePause : undefined,
  });

  // Fade out bottom controls hint after ~5 seconds during PLAYING
  const [hintVisible, setHintVisible] = useState(true);
  useEffect(() => {
    if (!isPlayable) return undefined;
    setHintVisible(true);
    const timer = setTimeout(() => setHintVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [isPlayable, isGameOver]);

  const hearts = Array.from({ length: maxLives }, (_, idx) => idx < lives);

  return (
    <>
      {/* Subtle horizon glow & edge vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            vignetteBackground ||
            'radial-gradient(ellipse 90% 34% at 50% 8%, rgba(59, 130, 246, 0.14) 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 58%, rgba(8, 8, 8, 0.72) 100%)',
        }}
      />

      {/* Top HUD Bar */}
      <div
        onPointerDown={stopEvent}
        onClick={stopEvent}
        style={{
          paddingTop: 'max(0.85rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="pointer-events-none fixed top-0 left-0 right-0 sm:pt-6 sm:px-6 z-[60] flex items-center justify-between gap-2 select-none"
      >
        <RouterLink
          to={menuHref}
          onPointerDown={stopEvent}
          onClick={stopEvent}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label={t('game.stack.backToMenuAria')}
        >
          <FiArrowLeft size={14} className="text-[var(--accent)]" aria-hidden="true" />
          <span>{t('game.stack.backToMenu')}</span>
        </RouterLink>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="hidden sm:flex px-3 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] items-center gap-1.5 shadow-md"
            aria-label={`${t('game.stack.bestLabel')}: ${bestScore}`}
          >
            <span className="text-[var(--accent)] font-bold uppercase">
              {t('game.stack.bestLabel')}:
            </span>
            <span className="text-[var(--text-primary)] font-bold">{bestScore}</span>
          </div>

          {isPlayable || isPaused ? (
            <button
              type="button"
              onPointerDown={stopEvent}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              aria-pressed={isPaused}
              aria-label={isPaused ? t('game.stack.resumeAria') : t('game.stack.pauseAria')}
              title={isPaused ? t('game.stack.resumeAria') : t('game.stack.pauseAria')}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {isPaused ? (
                <FiPlay size={14} className="text-[var(--accent)]" aria-hidden="true" />
              ) : (
                <FiPause size={14} aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {isPaused ? t('game.stack.resumeBtn') : t('game.stack.pauseBtn')}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Live Scoreboard & Status Strip — compact at top so track obstacles remain crystal clear */}
      {!isReady && (
        <div className="pointer-events-none fixed top-14 sm:top-16 left-0 right-0 z-20 flex flex-col items-center gap-1.5 px-3 select-none">
          <div
            className="font-grotesk font-black text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight drop-shadow-md"
            aria-live="off"
            aria-label={`${t('game.stack.scoreLabel')}: ${score}`}
          >
            {score}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {/* 3 Hearts (Color + Numeric for accessibility) */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface)]/95 border border-[var(--border)]"
              aria-label={`${t('game.runner.livesLabel')}: ${lives}/${maxLives}`}
            >
              {hearts.map((alive, idx) => (
                <FiHeart
                  key={idx}
                  size={13}
                  className={alive ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[var(--text-muted)]'}
                  aria-hidden="true"
                />
              ))}
              <span className="font-mono text-[10px] font-bold text-[var(--text-secondary)] ml-0.5">
                {lives}/{maxLives}
              </span>
            </div>

            {/* Distance */}
            <div className="px-2.5 py-1 rounded bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">{distance}m</strong>
            </div>

            {/* Multiplier */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[11px] font-bold border ${
                multiplier > 1
                  ? 'bg-[var(--surface)]/95 border-[var(--accent)] text-[var(--text-primary)]'
                  : 'bg-[var(--surface)]/95 border-[var(--border)] text-[var(--text-secondary)]'
              }`}
            >
              <FiZap size={11} className="text-[var(--accent)]" aria-hidden="true" />
              <span>×{multiplier}</span>
            </div>

            {/* Tokens Collected */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]"
              aria-label={`${t('game.runner.tokensLabel')}: ${tokensCollected}`}
            >
              <FiCpu size={11} className="text-[var(--accent)]" aria-hidden="true" />
              <span className="text-[var(--text-primary)] font-bold">{tokensCollected}</span>
            </div>
          </div>

          {/* Non-blocking status toasts (Invuln Shield / Token pickup / Milestone) */}
          <div className="flex flex-col items-center gap-1 mt-0.5">
            {invulnActive && !isGameOver && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[var(--surface)]/95 border border-[var(--accent)] font-mono text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                <FiShield size={10} aria-hidden="true" />
                <span>{t('game.runner.invulnTag')}</span>
              </span>
            )}

            {tokenToast && !isGameOver && (
              <span className="px-2.5 py-0.5 rounded bg-[var(--surface)]/95 border border-[var(--accent)] font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                +{tokenToast.points} {tokenToast.label}
              </span>
            )}

            {milestoneBanner && !isGameOver && (
              <div
                role="status"
                aria-live="polite"
                className="px-3.5 py-1 rounded-md bg-[var(--surface)]/95 border border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider shadow-lg"
              >
                {'//'} {milestoneBanner}m — {t('game.runner.milestoneTag')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* READY Intro Overlay (pre-countdown) */}
      {isReady && !countdownStarted && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          className="fixed inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-[2px] select-none"
          style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.55))' }}
        >
          <div className="w-full max-w-sm p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl space-y-5 text-center">
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider font-semibold">
                {'//'} {t('game.runner.startTag')}
              </span>
              <h1 className="font-grotesk font-black text-3xl uppercase tracking-tight">
                {t('game.runner.startTitle')}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isTouch ? t('game.runner.controlsIntroTouch') : t('game.runner.controlsIntroDesktop')}
              </p>
            </div>

            <button
              type="button"
              onPointerDown={stopEvent}
              onClick={(e) => {
                e.stopPropagation();
                onStartRun();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
            >
              <FiPlay size={14} aria-hidden="true" />
              <span>{t('game.runner.startBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3, 2, 1, GO! Countdown Display */}
      {((isReady && countdownStarted && countdownValue > 0) || showGoFlash) && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center select-none">
          <div
            role="status"
            aria-live="assertive"
            className="font-grotesk font-black text-6xl sm:text-7xl text-[var(--text-primary)] tracking-tight drop-shadow-lg"
          >
            {isReady && countdownValue > 0 ? countdownValue : t('game.runner.countdownGo')}
          </div>
        </div>
      )}

      {/* Bottom Controls Hint (fades out after ~5s during PLAYING; instant for reduced-motion) */}
      {isPlayable && (reducedMotion ? hintVisible : true) && (
        <div
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
          className={`pointer-events-none fixed bottom-0 left-0 right-0 z-20 flex justify-center px-4 select-none ${
            reducedMotion
              ? hintVisible ? 'opacity-100' : 'opacity-0'
              : `transition-opacity duration-700 ease-out ${hintVisible ? 'opacity-100' : 'opacity-0'}`
          }`}
          aria-hidden={!hintVisible}
        >
          <div className="px-3.5 py-1.5 rounded-md bg-[var(--surface)]/90 border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)] text-center">
            {isTouch ? t('game.runner.controlsHintTouch') : t('game.runner.controlsHintDesktop')}
          </div>
        </div>
      )}

      {/* Focus-Trapped Pause Overlay */}
      {isPaused && !isGameOver && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="runner-pause-title"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm select-none"
          style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.75))' }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl space-y-5 text-center"
          >
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider font-semibold">
                {'//'} {t('game.stack.pausedTag')}
              </span>
              <h2 id="runner-pause-title" className="font-grotesk font-black text-2xl uppercase">
                {t('game.runner.pausedTitle')}
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                ref={primaryBtnRef}
                type="button"
                onPointerDown={stopEvent}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePause();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
              >
                <FiPlay size={13} aria-hidden="true" />
                <span>{t('game.stack.resumeBtn')}</span>
              </button>

              <RouterLink
                to={menuHref}
                onPointerDown={stopEvent}
                onClick={stopEvent}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <FiArrowLeft size={13} aria-hidden="true" />
                <span>{t('game.stack.backToMenu')}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      )}

      {/* Focus-Trapped Game Over Modal Card */}
      {isGameOver && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="runner-gameover-title"
          className="fixed inset-0 z-40 flex items-center justify-center pt-16 pb-4 px-4 backdrop-blur-sm select-none"
          style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.75))' }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl space-y-5"
          >
            <div>
              <span className="font-mono text-[11px] text-[#EF4444] uppercase tracking-wider font-semibold">
                04 {'//'} {t('game.runner.gameOverTag')}
              </span>
              <h2 id="runner-gameover-title" className="font-grotesk font-black text-2xl sm:text-3xl uppercase mt-1">
                {t('game.runner.gameOverTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  {t('game.stack.scoreLabel')}
                </div>
                <div className="font-grotesk font-black text-xl text-[var(--text-primary)] mt-0.5">{score}</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  {t('game.runner.distanceLabel')}
                </div>
                <div className="font-grotesk font-black text-xl text-[var(--text-primary)] mt-0.5">{distance}m</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  {t('game.runner.tokensLabel')}
                </div>
                <div className="font-grotesk font-black text-xl text-[var(--accent)] mt-0.5">{tokensCollected}</div>
              </div>
              <div className="p-2.5 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  {t('game.stack.bestLabel')}
                </div>
                <div className="font-grotesk font-black text-xl text-[var(--accent)] mt-0.5">{bestScore}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                ref={primaryBtnRef}
                type="button"
                onPointerDown={stopEvent}
                onClick={(e) => {
                  e.stopPropagation();
                  onRestart();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
              >
                <FiRotateCcw size={13} aria-hidden="true" />
                <span>{t('game.stack.playAgain')}</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <RouterLink
                  to={stackSectionHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <FiLayers size={13} className="text-[var(--accent)]" aria-hidden="true" />
                  <span>{t('game.stack.viewTechStack')}</span>
                  <FiArrowUpRight size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
                </RouterLink>

                <RouterLink
                  to={menuHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <FiArrowLeft size={13} aria-hidden="true" />
                  <span>{t('game.stack.backToMenu')}</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

RunnerHUD.propTypes = {
  gameState: PropTypes.string.isRequired,
  countdownStarted: PropTypes.bool.isRequired,
  countdownValue: PropTypes.number.isRequired,
  showGoFlash: PropTypes.bool.isRequired,
  score: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
  lives: PropTypes.number.isRequired,
  maxLives: PropTypes.number,
  multiplier: PropTypes.number.isRequired,
  tokensCollected: PropTypes.number.isRequired,
  bestScore: PropTypes.number.isRequired,
  invulnActive: PropTypes.bool,
  milestoneBanner: PropTypes.number,
  tokenToast: PropTypes.shape({
    label: PropTypes.string.isRequired,
    points: PropTypes.number.isRequired,
  }),
  isTouch: PropTypes.bool,
  reducedMotion: PropTypes.bool,
  vignetteBackground: PropTypes.string,
  onStartRun: PropTypes.func.isRequired,
  onTogglePause: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  menuHref: PropTypes.string,
  stackSectionHref: PropTypes.string,
};

export default RunnerHUD;
