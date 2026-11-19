import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiFolder,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiShield,
  FiVolume2,
  FiVolumeX,
  FiZap,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { RouterLink } from '../../../context/RouterContext';
import { useAudioPlayer } from '../../../hooks/useAudioPlayer';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const stopEvent = (e) => {
  e.stopPropagation();
};

const BugsHUD = ({
  score,
  combo,
  wave,
  serverHp,
  maxServerHp = 5,
  bestScore,
  boss,
  waveBanner,
  isPaused,
  isGameOver,
  isTouch,
  reducedMotion = false,
  vignetteBackground,
  onTogglePause,
  onRestart,
  menuHref = '/play',
  projectsSectionHref = '/#projects',
}) => {
  const { t } = useLanguage();
  const { isPlaying, togglePlayback } = useAudioPlayer();

  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    setHintVisible(true);
    const timer = setTimeout(() => {
      setHintVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isGameOver]);

  const modalRef = useRef(null);
  const primaryBtnRef = useRef(null);

  useFocusTrap({
    isOpen: Boolean(isGameOver || isPaused),
    containerRef: modalRef,
    initialFocusRef: primaryBtnRef,
    onClose: isPaused && !isGameOver ? onTogglePause : undefined,
  });

  const hpSegments = Array.from({ length: maxServerHp }, (_, idx) => idx < serverHp);
  const isCriticalHp = serverHp <= 2;

  return (
    <>
      {/* Subtle horizon glow & edge vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            vignetteBackground ||
            'radial-gradient(ellipse 90% 34% at 50% 8%, rgba(59, 130, 246, 0.14) 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 56%, rgba(8, 8, 8, 0.72) 100%)',
        }}
      />

      {/* Top HUD Bar — z-[60] with safe-area insets */}
      <div
        onPointerDown={stopEvent}
        onClick={stopEvent}
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
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
          {/* Wave Badge */}
          <div
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] flex items-center gap-1.5 shadow-md"
            aria-label={`${t('game.bugs.waveLabel')}: ${wave}`}
          >
            <span className="text-[var(--accent)] font-bold uppercase">
              {t('game.bugs.waveLabel')}:
            </span>
            <span className="text-[var(--text-primary)] font-bold">{wave}</span>
          </div>

          {/* Best Score Pill */}
          <div
            className="hidden sm:flex px-3 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] items-center gap-1.5 shadow-md"
            aria-label={`${t('game.stack.bestLabel')}: ${bestScore}`}
          >
            <span className="text-[var(--accent)] font-bold uppercase">
              {t('game.stack.bestLabel')}:
            </span>
            <span className="text-[var(--text-primary)] font-bold">{bestScore}</span>
          </div>

          {/* Pause / Resume Toggle */}
          {!isGameOver && (
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
          )}

          {/* Mute Toggle */}
          <button
            type="button"
            onPointerDown={stopEvent}
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? t('game.muteAria') : t('game.unmuteAria')}
            title={isPlaying ? t('game.muteAria') : t('game.unmuteAria')}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {isPlaying ? (
              <FiVolume2 size={14} className="text-[var(--accent)]" aria-hidden="true" />
            ) : (
              <FiVolumeX size={14} aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isPlaying ? t('game.soundOn') : t('game.soundOff')}
            </span>
          </button>
        </div>
      </div>

      {/* Live Score, Server HP Bar & Boss HP Bar */}
      <div className="pointer-events-none fixed top-16 sm:top-20 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 select-none">
        <div
          className="font-grotesk font-black text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight drop-shadow-md"
          aria-live="polite"
          aria-label={`${t('game.stack.scoreLabel')}: ${score}`}
        >
          {score}
        </div>

        {/* Central Server HP Bar */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] shadow-md"
          aria-label={`${t('game.bugs.serverHpLabel')}: ${serverHp} / ${maxServerHp}`}
        >
          <FiShield
            size={12}
            className={isCriticalHp ? 'text-[#EF4444]' : 'text-[var(--accent)]'}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
            {t('game.bugs.serverHpLabel')}
          </span>
          <div className="flex items-center gap-1">
            {hpSegments.map((filled, idx) => (
              <span
                key={idx}
                className={`w-3.5 h-2 rounded-xs transition-colors ${
                  filled
                    ? isCriticalHp
                      ? 'bg-[#EF4444]'
                      : 'bg-[var(--accent)]'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] font-bold text-[var(--text-primary)]">
            {serverHp}/{maxServerHp}
          </span>
        </div>

        {/* Combo & Boss Status Row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {combo > 1 && !isGameOver && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[var(--surface)]/95 border border-[var(--accent)] font-mono text-[11px] text-[var(--text-primary)] font-bold uppercase">
              <FiZap size={11} className="text-[var(--accent)]" aria-hidden="true" />
              <span>
                {t('game.stack.comboLabel')} ×{combo}
              </span>
            </span>
          )}

          {boss && !isGameOver && (
            <div
              role="status"
              className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--surface)]/95 border border-[#EF4444] shadow-lg"
            >
              <FiAlertTriangle size={12} className="text-[#EF4444]" aria-hidden="true" />
              <span className="font-mono text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
                {t('game.bugs.bossName')}
              </span>
              <div className="w-24 h-2 rounded bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full bg-[#EF4444] transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-[var(--text-primary)] font-bold">
                {boss.hp}/{boss.maxHp}
              </span>
            </div>
          )}
        </div>

        {/* Non-blocking "Wave Cleared" Banner every 2 waves */}
        {waveBanner && !isGameOver && (
          <div
            role="status"
            aria-live="polite"
            className="mt-1 px-4 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider shadow-lg"
          >
            {'//'} {t('game.bugs.waveCleared')} — {t('game.bugs.waveLabel')} {waveBanner}
          </div>
        )}
      </div>

      {/* Bottom Controls Hint (fades out after ~5s; instant unmount for reduced-motion) */}
      {!isGameOver && !isPaused && (reducedMotion ? hintVisible : true) && (
        <div
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
          className={`pointer-events-none fixed bottom-0 left-0 right-0 z-20 flex justify-center px-4 select-none ${
            reducedMotion
              ? (hintVisible ? 'opacity-100' : 'opacity-0')
              : `transition-opacity duration-700 ease-out ${hintVisible ? 'opacity-100' : 'opacity-0'}`
          }`}
          aria-hidden={!hintVisible}
        >
          <div className="px-3.5 py-1.5 rounded-md bg-[var(--surface)]/90 border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]">
            {isTouch ? t('game.bugs.controlsHintTouch') : t('game.bugs.controlsHintDesktop')}
          </div>
        </div>
      )}

      {/* Pause Overlay Modal */}
      {isPaused && !isGameOver && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bugs-pause-title"
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
              <h2
                id="bugs-pause-title"
                className="font-grotesk font-black text-2xl uppercase"
              >
                {t('game.bugs.pausedTitle')}
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

      {/* Game Over Modal Card */}
      {isGameOver && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bugs-gameover-title"
          className="fixed inset-0 z-40 flex items-center justify-center pt-16 pb-4 px-4 backdrop-blur-sm select-none"
          style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.75))' }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl space-y-5"
          >
            <div>
              <span className="font-mono text-[11px] text-[#EF4444] uppercase tracking-wider font-semibold">
                03 {'//'} {t('game.bugs.gameOverTag')}
              </span>
              <h2
                id="bugs-gameover-title"
                className="font-grotesk font-black text-2xl sm:text-3xl uppercase tracking-tight mt-0.5"
              >
                {t('game.bugs.gameOverTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-md bg-[var(--surface-alt)] border border-[var(--border)]">
                <span className="block font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                  {t('game.stack.scoreLabel')}
                </span>
                <span className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                  {score}
                </span>
              </div>

              <div className="p-3 rounded-md bg-[var(--surface-alt)] border border-[var(--border)]">
                <span className="block font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                  {t('game.bugs.waveLabel')}
                </span>
                <span className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                  {wave}
                </span>
              </div>

              <div className="p-3 rounded-md bg-[var(--surface-alt)] border border-[var(--border)]">
                <span className="block font-mono text-[10px] text-[var(--accent)] uppercase font-semibold">
                  {t('game.stack.bestLabel')}
                </span>
                <span className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--accent)]">
                  {bestScore}
                </span>
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
                  to={projectsSectionHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <FiFolder size={13} className="text-[var(--accent)]" aria-hidden="true" />
                  <span>{t('game.bugs.viewProjects')}</span>
                  <FiArrowUpRight size={13} aria-hidden="true" />
                </RouterLink>

                <RouterLink
                  to={menuHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
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

BugsHUD.propTypes = {
  score: PropTypes.number.isRequired,
  combo: PropTypes.number.isRequired,
  wave: PropTypes.number.isRequired,
  serverHp: PropTypes.number.isRequired,
  maxServerHp: PropTypes.number,
  bestScore: PropTypes.number.isRequired,
  boss: PropTypes.shape({
    hp: PropTypes.number.isRequired,
    maxHp: PropTypes.number.isRequired,
  }),
  waveBanner: PropTypes.number,
  isPaused: PropTypes.bool,
  isGameOver: PropTypes.bool,
  isTouch: PropTypes.bool,
  reducedMotion: PropTypes.bool,
  vignetteBackground: PropTypes.string,
  onTogglePause: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  menuHref: PropTypes.string,
  projectsSectionHref: PropTypes.string,
};

export default BugsHUD;
