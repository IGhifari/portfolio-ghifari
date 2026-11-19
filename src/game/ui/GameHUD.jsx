import PropTypes from 'prop-types';
import { FiArrowLeft, FiVolume2, FiVolumeX, FiCheck, FiCornerDownLeft } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { RouterLink } from '../../context/RouterContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { BUILDINGS } from '../logic/worldConfig';

const GameHUD = ({
  nearestBuilding,
  visitedIds,
  labelCoords,
  isTouch,
  isPanelOpen = false,
  onInteract,
  exitHref = '/',
}) => {
  const { t } = useLanguage();
  // Mute toggle strictly controls existing shared player state (default off, no new ambient track)
  const { isPlaying, togglePlayback } = useAudioPlayer();

  const visitedCount = visitedIds ? visitedIds.length : 0;

  return (
    <>
      {/* Faint horizon glow at top + subtle radial edge vignette toward the #080808 fog */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse 90% 34% at 50% 8%, rgba(59, 130, 246, 0.14) 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 56%, rgba(8, 8, 8, 0.72) 100%)',
        }}
      />

      {/* Top HUD Bar — z-[60] with safe-area insets so Exit button is ALWAYS visible */}
      <div
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="pointer-events-none fixed top-0 left-0 right-0 sm:pt-6 sm:px-6 z-[60] flex items-center justify-between gap-3 select-none"
      >
        <RouterLink
          to={exitHref}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#141414]/95 hover:bg-[#1c1c1f] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs font-bold text-[#F5F5F5] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label={t('game.exitAria')}
        >
          <FiArrowLeft size={14} className="text-[#3B82F6]" aria-hidden="true" />
          <span>{t('game.exitBtn')}</span>
        </RouterLink>

        <div className="flex items-center gap-2">
          {/* Visited Progress Pill */}
          <div
            className="px-3 py-1.5 rounded-md bg-[#141414]/95 border border-[#27272A] font-mono text-xs text-[#A1A1AA] flex items-center gap-2 shadow-md"
            aria-label={`${t('game.exploredLabel')}: ${visitedCount} / ${BUILDINGS.length}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
            <span className="hidden sm:inline">{t('game.exploredLabel')}:</span>
            <span className="text-[#F5F5F5] font-bold">
              {visitedCount}/{BUILDINGS.length}
            </span>
          </div>

          {/* Sound / Mute Toggle (Controls existing player state, off by default) */}
          <button
            type="button"
            onClick={togglePlayback}
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

      {/* World HUD Layer: Viewport-Clamped 3D Building Labels & Bottom Prompt */}
      <div
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-end sm:p-6 select-none"
      >
        {/* Floating 3D-Projected Building Labels (highlights when nearest; no duplicate Press E chip) */}
        {!isPanelOpen && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
            {BUILDINGS.map((b) => {
              const coord = labelCoords?.[b.id];
              if (!coord || !coord.visible) return null;
              const isNearest = nearestBuilding?.id === b.id;
              const isVisited = visitedIds?.includes(b.id);
              const labelOpacity = coord.opacity ?? 1;

              return (
                <div
                  key={b.id}
                  style={{
                    transform: `translate3d(${Math.round(coord.x)}px, ${Math.round(coord.y)}px, 0) translate(-50%, -100%)`,
                    opacity: labelOpacity,
                  }}
                  className="absolute top-0 left-0 transition-opacity duration-150"
                >
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] tracking-wider uppercase whitespace-nowrap shadow-md ${
                      isNearest
                        ? 'bg-[#141414] border-[#3B82F6] text-[#F5F5F5] font-bold'
                        : 'bg-[#080808]/90 border-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    <span className="text-[#3B82F6] font-bold">{b.number}</span>
                    <span>{t(b.labelKey)}</span>
                    {isVisited && (
                      <span
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400"
                        title={t('game.visitedBadge')}
                      >
                        <FiCheck size={9} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Bar: Single "Press E" / "Open" Proximity Prompt Card & Controls Hint */}
        {!isPanelOpen && (
          <div className="relative z-10 flex flex-col items-center gap-3">
            {nearestBuilding && (
              <div
                role="status"
                aria-live="polite"
                className={`pointer-events-auto flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#141414]/95 border border-[#3B82F6] shadow-lg ${
                  isTouch ? 'self-end ml-28 max-w-[235px]' : 'self-center'
                }`}
              >
                <div className="text-left min-w-0">
                  <span className="block font-mono text-[10px] text-[#3B82F6] uppercase tracking-wider font-semibold truncate">
                    {nearestBuilding.number} {'//'} {t(nearestBuilding.subtitleKey)}
                  </span>
                  <span className="block font-grotesk font-bold text-xs sm:text-sm text-[#F5F5F5] truncate">
                    {t(nearestBuilding.labelKey)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onInteract(nearestBuilding)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#3B82F6] hover:opacity-90 text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`${t('game.openAction')}: ${t(nearestBuilding.labelKey)}`}
                >
                  {isTouch ? (
                    <span>{t('game.openBtn')}</span>
                  ) : (
                    <>
                      <span>{t('game.pressE')}</span>
                      <FiCornerDownLeft size={12} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Controls Hint Pill */}
            <div className="px-3.5 py-1.5 rounded-md bg-[#080808]/90 border border-[#27272A] font-mono text-[11px] text-[#A1A1AA]">
              {isTouch ? t('game.controlsHintTouch') : t('game.controlsHintDesktop')}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

GameHUD.propTypes = {
  nearestBuilding: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    subtitleKey: PropTypes.string.isRequired,
  }),
  visitedIds: PropTypes.arrayOf(PropTypes.string),
  labelCoords: PropTypes.object,
  isTouch: PropTypes.bool,
  isPanelOpen: PropTypes.bool,
  onInteract: PropTypes.func.isRequired,
  exitHref: PropTypes.string,
};

export default GameHUD;
