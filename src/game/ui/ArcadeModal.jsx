import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FiArrowRight,
  FiAward,
  FiCrosshair,
  FiFastForward,
  FiGrid,
  FiLayers,
  FiX,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { RouterLink } from '../../context/RouterContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { getEnabledMiniGames } from '../shared/gameUtils';

const ICON_BY_ID = {
  stack: FiLayers,
  bugs: FiCrosshair,
  runner: FiFastForward,
};

/**
 * Overlay selector rendered inside Explore (/play/explore) via the 3D Arcade Kiosk
 * or the quick-switch HUD button, letting players launch any mini-game in 1 click.
 */
const ArcadeModal = ({
  isOpen,
  onClose,
  prefix = '',
  enableStackGame = true,
  enableBugGame = true,
  enableRunnerGame = true,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useFocusTrap({
    isOpen,
    containerRef,
    initialFocusRef: closeBtnRef,
    onClose,
  });

  const miniGames = useMemo(
    () =>
      isOpen
        ? getEnabledMiniGames({
            prefix,
            enableStackGame,
            enableBugGame,
            enableRunnerGame,
          })
        : [],
    [isOpen, prefix, enableStackGame, enableBugGame, enableRunnerGame]
  );

  if (!isOpen || miniGames.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pt-16 sm:pt-20 pb-4 px-4 sm:pb-6 sm:px-6 backdrop-blur-sm select-none"
      style={{ backgroundColor: 'var(--modal-backdrop, rgba(0, 0, 0, 0.78))' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-arcade-modal-title"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[calc(100vh-5.5rem)] flex flex-col rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider font-semibold">
              <FiGrid size={12} aria-hidden="true" />
              <span>
                06 {'//'} {t('game.arcade.subtitle')}
              </span>
            </span>
            <h2
              id="game-arcade-modal-title"
              className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight truncate"
            >
              {t('game.arcade.title')}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('game.arcade.closeAria')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <FiX size={15} aria-hidden="true" />
            <span>ESC</span>
          </button>
        </div>

        {/* Mini-Games Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)]">
            {t('game.arcade.desc')}
          </p>

          <div
            className={`grid gap-3.5 ${
              miniGames.length === 1
                ? 'grid-cols-1'
                : miniGames.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {miniGames.map((game) => {
              const IconComp = ICON_BY_ID[game.id] || FiLayers;
              return (
                <RouterLink
                  key={game.id}
                  to={game.href}
                  onClick={onClose}
                  className="group p-4 sm:p-5 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                        {game.number} {'//'} {t(game.badgeKey)}
                      </span>
                      <div className="w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] transition-colors">
                        <IconComp size={15} aria-hidden="true" />
                      </div>
                    </div>

                    <h3 className="font-grotesk font-black text-lg sm:text-xl text-[var(--text-primary)] uppercase tracking-tight">
                      {t(game.titleKey)}
                    </h3>

                    <div>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]"
                        aria-label={`${t('game.stack.bestLabel')}: ${game.bestScore}`}
                      >
                        <FiAward size={11} className="text-[var(--accent)]" aria-hidden="true" />
                        <span>{t('game.stack.bestLabel')}:</span>
                        <strong className="text-[var(--text-primary)]">{game.bestScore}</strong>
                      </span>
                    </div>

                    <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
                      {t(game.descKey)}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between font-mono text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
                    <span>{t(game.launchKey)}</span>
                    <FiArrowRight
                      size={14}
                      className="transform group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </div>
                </RouterLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

ArcadeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  prefix: PropTypes.string,
  enableStackGame: PropTypes.bool,
  enableBugGame: PropTypes.bool,
  enableRunnerGame: PropTypes.bool,
};

export default ArcadeModal;
