import PropTypes from 'prop-types';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiAward, FiBox } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { RouterLink, useRouter } from '../../context/RouterContext';
import { ENABLE_STACK_GAME, ENABLE_BUG_GAME, ENABLE_RUNNER_GAME } from '../../config/site';
import { BUILDINGS } from '../logic/worldConfig';
import { getEnabledMiniGames } from '../shared/gameUtils';

const WebGLFallback = ({ exitHref = '/', onSelectBuilding }) => {
  const { t } = useLanguage();
  const { langPrefix } = useRouter();
  const prefix = langPrefix === 'en' ? '/en' : '';
  const miniGames = getEnabledMiniGames({
    prefix,
    enableStackGame: ENABLE_STACK_GAME,
    enableBugGame: ENABLE_BUG_GAME,
    enableRunnerGame: ENABLE_RUNNER_GAME,
  });

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] px-5 py-16 flex items-center justify-center">
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
            <FiBox size={15} aria-hidden="true" />
            <span>3D EXPLORER {'//'} FALLBACK</span>
          </div>

          <RouterLink
            to={exitHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs text-[var(--text-primary)]"
          >
            <FiArrowLeft size={13} className="text-[var(--accent)]" aria-hidden="true" />
            <span>{t('game.exitBtn')}</span>
          </RouterLink>
        </div>

        <div className="space-y-2">
          <h1 className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] uppercase">
            {t('game.fallbackTitle')}
          </h1>
          <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">
            {t('game.fallbackDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {BUILDINGS.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col justify-between gap-3"
            >
              <div>
                <span className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                  {b.number} {'//'} {t(b.subtitleKey)}
                </span>
                <h2 className="font-grotesk font-bold text-base text-[var(--text-primary)] mt-0.5">
                  {t(b.labelKey)}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {onSelectBuilding && (
                  <button
                    type="button"
                    onClick={() => onSelectBuilding(b)}
                    className="px-3 py-1.5 rounded bg-[var(--surface)] hover:border-[var(--accent)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)] cursor-pointer"
                  >
                    {t('game.openBtn')}
                  </button>
                )}
                <RouterLink
                  to={b.sectionHref}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] font-mono text-xs font-bold"
                >
                  <span>{t('game.goToSection')}</span>
                  <FiArrowUpRight size={12} aria-hidden="true" />
                </RouterLink>
              </div>
            </div>
          ))}
        </div>

        {miniGames.length > 0 && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            <h2 className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
              {'//'} {t('game.arcade.fallbackHeading')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {miniGames.map((g) => (
                <RouterLink
                  key={g.id}
                  to={g.href}
                  className="p-3.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-2 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase">
                      {g.number} {'//'} {t(g.badgeKey)}
                    </span>
                    <div className="font-grotesk font-bold text-sm text-[var(--text-primary)]">
                      {t(g.titleKey)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <FiAward size={11} className="text-[var(--accent)]" aria-hidden="true" />
                      {t('game.stack.bestLabel')}: {g.bestScore}
                    </span>
                    <FiArrowRight size={12} className="text-[var(--accent)]" aria-hidden="true" />
                  </div>
                </RouterLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

WebGLFallback.propTypes = {
  exitHref: PropTypes.string,
  onSelectBuilding: PropTypes.func,
};

export default WebGLFallback;
