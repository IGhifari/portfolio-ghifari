import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiLayers,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiVolume2,
  FiVolumeX,
  FiZap,
} from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { RouterLink } from '../../../context/RouterContext';
import { useAudioPlayer } from '../../../hooks/useAudioPlayer';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const stopEvent = (e) => {
  e.stopPropagation();
};

const StackHUD = ({
  score,
  combo,
  bestScore,
  currentLabel,
  isPaused,
  isGameOver,
  isTouch,
  onTogglePause,
  onRestart,
  menuHref = '/play',
  stackSectionHref = '/#stack',
}) => {
  const { t } = useLanguage();
  const { isPlaying, togglePlayback } = useAudioPlayer();

  const modalRef = useRef(null);
  const primaryBtnRef = useRef(null);

  useFocusTrap({
    isOpen: Boolean(isGameOver || isPaused),
    containerRef: modalRef,
    initialFocusRef: primaryBtnRef,
    onClose: isPaused && !isGameOver ? onTogglePause : undefined,
  });

  return (
    <>
      {/* Subtle horizon glow & edge vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
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
        className="pointer-events-none fixed top-0 left-0 right-0 sm:pt-6 sm:px-6 z-[60] flex items-center justify-between gap-2 sm:gap-3 select-none"
      >
        <RouterLink
          to={menuHref}
          onPointerDown={stopEvent}
          onClick={stopEvent}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#141414]/95 hover:bg-[#1c1c1f] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs font-bold text-[#F5F5F5] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label={t('game.stack.backToMenuAria')}
        >
          <FiArrowLeft size={14} className="text-[#3B82F6]" aria-hidden="true" />
          <span>{t('game.stack.backToMenu')}</span>
        </RouterLink>

        <div className="flex items-center gap-2">
          {/* Best Score Pill */}
          <div
            className="px-3 py-1.5 rounded-md bg-[#141414]/95 border border-[#27272A] font-mono text-xs text-[#A1A1AA] flex items-center gap-1.5 shadow-md"
            aria-label={`${t('game.stack.bestLabel')}: ${bestScore}`}
          >
            <span className="text-[#3B82F6] font-bold uppercase">
              {t('game.stack.bestLabel')}:
            </span>
            <span className="text-[#F5F5F5] font-bold">{bestScore}</span>
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
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#141414]/95 hover:bg-[#1c1c1f] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs text-[#A1A1AA] hover:text-[#F5F5F5] shadow-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              {isPaused ? (
                <FiPlay size={14} className="text-[#3B82F6]" aria-hidden="true" />
              ) : (
                <FiPause size={14} aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {isPaused ? t('game.stack.resumeBtn') : t('game.stack.pauseBtn')}
              </span>
            </button>
          )}

          {/* Mute Toggle (Shared audio state, off by default) */}
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
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#141414]/95 hover:bg-[#1c1c1f] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs text-[#A1A1AA] hover:text-[#F5F5F5] shadow-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            {isPlaying ? (
              <FiVolume2 size={14} className="text-[#3B82F6]" aria-hidden="true" />
            ) : (
              <FiVolumeX size={14} aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isPlaying ? t('game.soundOn') : t('game.soundOff')}
            </span>
          </button>
        </div>
      </div>

      {/* Live Score & Current Tech Pill */}
      <div className="pointer-events-none fixed top-20 left-0 right-0 z-20 flex flex-col items-center gap-1.5 select-none">
        <div
          className="font-grotesk font-black text-5xl sm:text-6xl text-[#F5F5F5] tracking-tight drop-shadow-md"
          aria-live="polite"
          aria-label={`${t('game.stack.scoreLabel')}: ${score}`}
        >
          {score}
        </div>

        <div className="flex items-center gap-2">
          {currentLabel && !isGameOver && (
            <span className="px-2.5 py-0.5 rounded bg-[#141414]/90 border border-[#27272A] font-mono text-[11px] text-[#3B82F6] font-bold tracking-wider uppercase">
              {currentLabel}
            </span>
          )}

          {combo > 0 && !isGameOver && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#3B82F6]/20 border border-[#3B82F6] font-mono text-[11px] text-[#F5F5F5] font-bold uppercase">
              <FiZap size={11} className="text-[#3B82F6]" aria-hidden="true" />
              <span>
                {t('game.stack.comboLabel')} ×{combo}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls Hint */}
      {!isGameOver && !isPaused && (
        <div
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 flex justify-center px-4 select-none"
        >
          <div className="px-3.5 py-1.5 rounded-md bg-[#080808]/90 border border-[#27272A] font-mono text-[11px] text-[#A1A1AA]">
            {isTouch ? t('game.stack.controlsHintTouch') : t('game.stack.controlsHintDesktop')}
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
          aria-labelledby="stack-pause-title"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm p-6 rounded-lg bg-[#141414] border border-[#27272A] text-[#F5F5F5] shadow-2xl space-y-5 text-center"
          >
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-[#3B82F6] uppercase tracking-wider font-semibold">
                {'//'} {t('game.stack.pausedTag')}
              </span>
              <h2
                id="stack-pause-title"
                className="font-grotesk font-black text-2xl uppercase"
              >
                {t('game.stack.pausedTitle')}
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#3B82F6] hover:opacity-90 text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <FiPlay size={13} aria-hidden="true" />
                <span>{t('game.stack.resumeBtn')}</span>
              </button>

              <RouterLink
                to={menuHref}
                onPointerDown={stopEvent}
                onClick={stopEvent}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#101010] hover:bg-[#1a1a1f] border border-[#27272A] hover:border-[#3B82F6] text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
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
          aria-labelledby="stack-gameover-title"
          className="fixed inset-0 z-40 flex items-center justify-center pt-16 pb-4 px-4 bg-black/75 backdrop-blur-sm select-none"
        >
          <div
            ref={modalRef}
            className="w-full max-w-md p-6 rounded-lg bg-[#141414] border border-[#27272A] text-[#F5F5F5] shadow-2xl space-y-5"
          >
            <div>
              <span className="font-mono text-[11px] text-[#3B82F6] uppercase tracking-wider font-semibold">
                02 {'//'} {t('game.stack.gameOverTag')}
              </span>
              <h2
                id="stack-gameover-title"
                className="font-grotesk font-black text-2xl sm:text-3xl uppercase tracking-tight mt-0.5"
              >
                {t('game.stack.gameOverTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-md bg-[#101010] border border-[#27272A]">
                <span className="block font-mono text-[10px] text-[#A1A1AA] uppercase">
                  {t('game.stack.scoreLabel')}
                </span>
                <span className="font-grotesk font-black text-3xl text-[#F5F5F5]">
                  {score}
                </span>
              </div>

              <div className="p-3.5 rounded-md bg-[#101010] border border-[#27272A]">
                <span className="block font-mono text-[10px] text-[#3B82F6] uppercase font-semibold">
                  {t('game.stack.bestLabel')}
                </span>
                <span className="font-grotesk font-black text-3xl text-[#3B82F6]">
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#3B82F6] hover:opacity-90 text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <FiRotateCcw size={13} aria-hidden="true" />
                <span>{t('game.stack.playAgain')}</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <RouterLink
                  to={stackSectionHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded bg-[#101010] hover:bg-[#1a1a1f] border border-[#27272A] hover:border-[#3B82F6] text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <FiLayers size={13} className="text-[#3B82F6]" aria-hidden="true" />
                  <span>{t('game.stack.viewTechStack')}</span>
                  <FiArrowUpRight size={13} aria-hidden="true" />
                </RouterLink>

                <RouterLink
                  to={menuHref}
                  onPointerDown={stopEvent}
                  onClick={stopEvent}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded bg-[#101010] hover:bg-[#1a1a1f] border border-[#27272A] hover:border-[#3B82F6] text-[#A1A1AA] hover:text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider transition-colors"
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

StackHUD.propTypes = {
  score: PropTypes.number.isRequired,
  combo: PropTypes.number.isRequired,
  bestScore: PropTypes.number.isRequired,
  currentLabel: PropTypes.string,
  isPaused: PropTypes.bool,
  isGameOver: PropTypes.bool,
  isTouch: PropTypes.bool,
  onTogglePause: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  menuHref: PropTypes.string,
  stackSectionHref: PropTypes.string,
};

export default StackHUD;
