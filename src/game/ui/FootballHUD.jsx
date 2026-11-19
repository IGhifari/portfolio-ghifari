import PropTypes from 'prop-types';
import { FiRotateCcw, FiTarget } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Unobtrusive zone-scoped HUD overlay shown strictly when exploring the East Football Field.
 * Provides live score, Goal notification toast, manual ball reset, and mobile touch Kick button.
 */
const FootballHUD = ({
  inZone,
  inKickRange,
  score,
  goalBannerSide,
  isTouch,
  onKick,
  onResetBall,
}) => {
  const { t } = useLanguage();

  if (!inZone && !goalBannerSide) return null;

  return (
    <>
      {/* Top-Center Scoped Football Pill (keeps away from top-left Exit & top-right HUD bars) */}
      {inZone && (
        <div className="pointer-events-none fixed top-16 sm:top-20 left-0 right-0 z-30 flex flex-col items-center gap-2 px-4 select-none">
          <div className="pointer-events-auto inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[var(--surface)]/95 border border-[var(--border)] shadow-lg">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
              <FiTarget size={13} aria-hidden="true" />
              <span>{t('game.football.zoneTitle')}</span>
            </span>

            <span className="h-3.5 w-px bg-[var(--border)]" aria-hidden="true" />

            <span
              className="font-mono text-xs font-bold text-[var(--text-primary)]"
              aria-live="polite"
              aria-label={`${t('game.football.scoreLabel')}: ${score}`}
            >
              {t('game.football.scoreLabel')}: <strong className="text-[var(--accent)]">{score}</strong>
            </span>

            {!isTouch && (
              <>
                <span className="h-3.5 w-px bg-[var(--border)] hidden sm:inline-block" aria-hidden="true" />
                <span className="hidden sm:inline font-mono text-[11px] text-[var(--text-secondary)]">
                  {t('game.football.kickHintDesktop')}
                </span>
              </>
            )}

            <button
              type="button"
              onClick={onResetBall}
              aria-label={t('game.football.resetAria')}
              title={t('game.football.resetAria')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <FiRotateCcw size={10} aria-hidden="true" />
              <span>{t('game.football.resetBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Brief Celebratory Goal Toast */}
      {goalBannerSide && (
        <div
          role="status"
          aria-live="assertive"
          className="pointer-events-none fixed top-28 sm:top-32 left-0 right-0 z-30 flex justify-center px-4 select-none"
        >
          <div className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-grotesk font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl border border-white/25">
            {t('game.football.goalToast')}
          </div>
        </div>
      )}

      {/* Contextual Touch Kick Button (bottom-right opposite VirtualJoystick on mobile/touch) */}
      {isTouch && inZone && inKickRange && !goalBannerSide && (
        <div
          style={{
            bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))',
            right: 'max(1rem, env(safe-area-inset-right, 0px))',
          }}
          className="fixed z-30 select-none"
        >
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onKick?.();
            }}
            className="w-20 h-20 rounded-full bg-[var(--accent)] active:scale-95 text-[var(--accent-contrast)] border-2 border-white/75 font-mono text-xs font-black uppercase tracking-wider shadow-xl flex items-center justify-center cursor-pointer transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
            aria-label={t('game.football.kickAction')}
          >
            {t('game.football.kickBtn')}
          </button>
        </div>
      )}
    </>
  );
};

FootballHUD.propTypes = {
  inZone: PropTypes.bool,
  inKickRange: PropTypes.bool,
  score: PropTypes.number,
  goalBannerSide: PropTypes.string,
  isTouch: PropTypes.bool,
  onKick: PropTypes.func,
  onResetBall: PropTypes.func,
};

export default FootballHUD;
