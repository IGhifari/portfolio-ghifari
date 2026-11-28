import PropTypes from 'prop-types';
import { FiArrowLeft, FiVolume2, FiVolumeX, FiCheck, FiCornerDownLeft, FiGrid } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { RouterLink } from '@/context/RouterContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { BUILDINGS, getWorldInteractables } from '../logic/worldConfig';

const GameHUD = ({
  nearestBuilding,
  visitedIds,
  labelCoords,
  isTouch,
  isPanelOpen = false,
  hasArcade = true,
  vignetteBackground,
  onInteract,
  onOpenArcade,
  exitHref = '/',
}) => {
  const { t } = useLanguage();
  // Mute toggle strictly controls existing shared player state (default off, no new ambient track)
  const { isPlaying, togglePlayback } = useAudioPlayer();

  const visitedCount = visitedIds ? visitedIds.length : 0;
  const labelItems = getWorldInteractables(hasArcade);

  return (
    <>
      {/* Faint horizon glow at top + subtle radial edge vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            vignetteBackground ||
            'radial-gradient(ellipse 90% 34% at 50% 8%, rgba(59, 130, 246, 0.14) 0%, rgba(17, 24, 39, 0.08) 45%, transparent 78%), radial-gradient(circle at 50% 54%, transparent 56%, rgba(8, 8, 8, 0.72) 100%)',
        }}
      />

      {/* Top HUD Bar — z-[60] with safe-area insets so Exit & Mini-Games buttons are ALWAYS visible */}
      <div
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="pointer-events-none fixed top-0 left-0 right-0 sm:pt-6 sm:px-6 z-[60] flex items-center justify-between gap-2 sm:gap-3 select-none"
      >
        <RouterLink
          to={exitHref}
          className="pointer-events-auto inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label={t('game.exitAria')}
        >
          <FiArrowLeft size={14} className="text-[var(--accent)]" aria-hidden="true" />
          <span className="hidden xs:inline sm:inline">{t('game.exitBtn')}</span>
        </RouterLink>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick-Switch Arcade Mini-Games Drawer Trigger */}
          {hasArcade && onOpenArcade && (
            <button
              type="button"
              onClick={onOpenArcade}
              aria-label={t('game.arcade.hudAria')}
              title={t('game.arcade.hudAria')}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--accent)] hover:opacity-90 font-mono text-xs font-bold text-[var(--accent-contrast)] shadow-md cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
            >
              <FiGrid size={14} aria-hidden="true" />
              <span>{t('game.arcade.hudBtn')}</span>
            </button>
          )}

          {/* Visited Progress Pill */}
          <div
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] flex items-center gap-1.5 sm:gap-2 shadow-md"
            aria-label={`${t('game.exploredLabel')}: ${visitedCount} / ${BUILDINGS.length}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            <span className="hidden md:inline">{t('game.exploredLabel')}:</span>
            <span className="text-[var(--text-primary)] font-bold">
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
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {isPlaying ? (
              <FiVolume2 size={14} className="text-[var(--accent)]" aria-hidden="true" />
            ) : (
              <FiVolumeX size={14} aria-hidden="true" />
            )}
            <span className="hidden md:inline">
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
        {/* Floating 3D-Projected Building & Arcade Kiosk Labels */}
        {!isPanelOpen && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
            {labelItems.map((b) => {
              const coord = labelCoords?.[b.id];
              if (!coord || !coord.visible) return null;
              const isNearest = nearestBuilding?.id === b.id;
              const isVisited = !b.isArcade && visitedIds?.includes(b.id);
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] tracking-wider uppercase whitespace-nowrap backdrop-blur-sm ${
                      isNearest
                        ? 'bg-[var(--surface)] border-[var(--accent)] ring-1 ring-[var(--accent)]/40 text-[var(--text-primary)] font-bold shadow-[0_6px_16px_rgba(15,23,42,0.22)]'
                        : 'bg-[var(--surface)]/95 border-[var(--text-primary)]/20 text-[var(--text-primary)] font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.16)]'
                    }`}
                  >
                    <span className="text-[var(--accent)] font-bold">{b.number}</span>
                    <span>{t(b.labelKey)}</span>
                    {isVisited && (
                      <span
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-500"
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
                className={`pointer-events-auto flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg bg-[var(--surface)]/95 border border-[var(--accent)] shadow-lg ${
                  isTouch ? 'self-end ml-28 max-w-[235px]' : 'self-center'
                }`}
              >
                <div className="text-left min-w-0">
                  <span className="block font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider font-semibold truncate">
                    {nearestBuilding.number} {'//'} {t(nearestBuilding.subtitleKey)}
                  </span>
                  <span className="block font-grotesk font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                    {t(nearestBuilding.labelKey)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onInteract(nearestBuilding)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
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
            <div className="px-3.5 py-1.5 rounded-md bg-[var(--surface)]/95 border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)] shadow-sm">
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
  hasArcade: PropTypes.bool,
  vignetteBackground: PropTypes.string,
  onInteract: PropTypes.func.isRequired,
  onOpenArcade: PropTypes.func,
  exitHref: PropTypes.string,
};

export default GameHUD;
