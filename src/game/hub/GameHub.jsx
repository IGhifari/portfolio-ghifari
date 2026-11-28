import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCompass,
  FiLayers,
  FiCrosshair,
  FiFastForward,
  FiAward,
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { RouterLink, useRouter } from '@/context/RouterContext';
import { updateDocumentMetadata } from '@/utils/seo';
import {
  siteConfig,
  ENABLE_STACK_GAME,
  ENABLE_BUG_GAME,
  ENABLE_RUNNER_GAME,
} from '@/config/site';
import { readBestScoreByKey } from '../shared/gameUtils';
import { buildGameCssVars, getSeasonal3DTheme } from '../shared/seasonalGameTheme';

const GameHub = ({
  enableStackGame = ENABLE_STACK_GAME,
  enableBugGame = ENABLE_BUG_GAME,
  enableRunnerGame = ENABLE_RUNNER_GAME,
}) => {
  const { language, t } = useLanguage();
  const { season, seasonalEnabled } = useTheme();
  const { langPrefix } = useRouter();
  const [stackBest, setStackBest] = useState(0);
  const [bugsBest, setBugsBest] = useState(0);
  const [runnerBest, setRunnerBest] = useState(0);

  const theme3D = useMemo(
    () => getSeasonal3DTheme(season, seasonalEnabled),
    [season, seasonalEnabled]
  );
  const gameCssVars = useMemo(() => buildGameCssVars(theme3D), [theme3D]);

  const prefix = langPrefix === 'en' ? '/en' : '';
  const exitHref = prefix || '/';
  const exploreHref = `${prefix}/play/explore`;
  const stackHref = `${prefix}/play/stack`;
  const bugsHref = `${prefix}/play/bugs`;
  const runnerHref = `${prefix}/play/runner`;

  useEffect(() => {
    setStackBest(readBestScoreByKey('portfolio:stack:best'));
    setBugsBest(readBestScoreByKey('portfolio:bugs:best'));
    setRunnerBest(readBestScoreByKey('portfolio:runner:best'));
  }, []);

  useEffect(() => {
    const title = `${t('game.hub.pageTitle')} | ${siteConfig.name}`;
    const desc = t('game.hub.pageDesc');
    updateDocumentMetadata({
      title,
      description: desc,
      canonicalPath: '/play',
      ogTitle: title,
      ogDescription: desc,
      noindex: true,
    });
  }, [language, t]);

  const cardCount =
    1 + (enableStackGame ? 1 : 0) + (enableBugGame ? 1 : 0) + (enableRunnerGame ? 1 : 0);
  const gridColsClass =
    cardCount === 4
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
      : cardCount === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : cardCount === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 max-w-xl';

  return (
    <div
      style={gameCssVars}
      className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between p-5 sm:p-8 select-none transition-colors"
    >
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        <RouterLink
          to={exitHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label={t('game.exitAria')}
        >
          <FiArrowLeft size={14} className="text-[var(--accent)]" aria-hidden="true" />
          <span>{t('game.exitBtn')}</span>
        </RouterLink>

        <span className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          {siteConfig.brandName} {'//'} INTERACTIVE LAB
        </span>
      </div>

      {/* Main Hub Content */}
      <div className="max-w-6xl w-full mx-auto my-auto py-10 space-y-8">
        <div className="space-y-2">
          <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold block">
            {'//'} {t('game.hub.tag')}
          </span>
          <h1 className="font-grotesk font-black text-3xl sm:text-5xl text-[var(--text-primary)] uppercase tracking-tight">
            {t('game.hub.heading')}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            {t('game.hub.subtitle')}
          </p>
        </div>

        {/* Dynamic Cards Grid (no empty slots when a sub-flag is disabled) */}
        <div className={`grid gap-4 sm:gap-5 ${gridColsClass}`}>
          {/* Card 1: Explore (/play/explore) */}
          <RouterLink
            to={exploreHref}
            className="group p-6 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--accent)] font-bold uppercase tracking-wider">
                  01 {'//'} {t('game.hub.exploreBadge')}
                </span>
                <div className="w-9 h-9 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] transition-colors">
                  <FiCompass size={18} aria-hidden="true" />
                </div>
              </div>

              <h2 className="font-grotesk font-black text-2xl text-[var(--text-primary)] uppercase tracking-tight">
                {t('game.hub.exploreTitle')}
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('game.hub.exploreDesc')}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
              <span>{t('game.hub.launchExplore')}</span>
              <FiArrowRight
                size={15}
                className="transform group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </div>
          </RouterLink>

          {/* Card 2: Deploy Stack (/play/stack) */}
          {enableStackGame && (
            <RouterLink
              to={stackHref}
              className="group p-6 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--accent)] font-bold uppercase tracking-wider whitespace-nowrap">
                    02 {'//'} {t('game.hub.stackBadge')}
                  </span>
                  <div className="w-9 h-9 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] transition-colors">
                    <FiLayers size={18} aria-hidden="true" />
                  </div>
                </div>

                <h2 className="font-grotesk font-black text-2xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('game.hub.stackTitle')}
                </h2>

                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]"
                    aria-label={`${t('game.stack.bestLabel')}: ${stackBest}`}
                  >
                    <FiAward size={12} className="text-[var(--accent)]" aria-hidden="true" />
                    <span>{t('game.stack.bestLabel')}:</span>
                    <strong className="text-[var(--text-primary)]">{stackBest}</strong>
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('game.hub.stackDesc')}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
                <span>{t('game.hub.launchStack')}</span>
                <FiArrowRight
                  size={15}
                  className="transform group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </RouterLink>
          )}

          {/* Card 3: Bug Hunter (/play/bugs) */}
          {enableBugGame && (
            <RouterLink
              to={bugsHref}
              className="group p-6 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--accent)] font-bold uppercase tracking-wider whitespace-nowrap">
                    03 {'//'} {t('game.hub.bugsBadge')}
                  </span>
                  <div className="w-9 h-9 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] transition-colors">
                    <FiCrosshair size={18} aria-hidden="true" />
                  </div>
                </div>

                <h2 className="font-grotesk font-black text-2xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('game.hub.bugsTitle')}
                </h2>

                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]"
                    aria-label={`${t('game.stack.bestLabel')}: ${bugsBest}`}
                  >
                    <FiAward size={12} className="text-[var(--accent)]" aria-hidden="true" />
                    <span>{t('game.stack.bestLabel')}:</span>
                    <strong className="text-[var(--text-primary)]">{bugsBest}</strong>
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('game.hub.bugsDesc')}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
                <span>{t('game.hub.launchBugs')}</span>
                <FiArrowRight
                  size={15}
                  className="transform group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </RouterLink>
          )}

          {/* Card 4: Stack Runner (/play/runner) */}
          {enableRunnerGame && (
            <RouterLink
              to={runnerHref}
              className="group p-6 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--accent)] font-bold uppercase tracking-wider whitespace-nowrap">
                    04 {'//'} {t('game.hub.runnerBadge')}
                  </span>
                  <div className="w-9 h-9 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] transition-colors">
                    <FiFastForward size={18} aria-hidden="true" />
                  </div>
                </div>

                <h2 className="font-grotesk font-black text-2xl text-[var(--text-primary)] uppercase tracking-tight">
                  {t('game.hub.runnerTitle')}
                </h2>

                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]"
                    aria-label={`${t('game.stack.bestLabel')}: ${runnerBest}`}
                  >
                    <FiAward size={12} className="text-[var(--accent)]" aria-hidden="true" />
                    <span>{t('game.stack.bestLabel')}:</span>
                    <strong className="text-[var(--text-primary)]">{runnerBest}</strong>
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t('game.hub.runnerDesc')}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
                <span>{t('game.hub.launchRunner')}</span>
                <FiArrowRight
                  size={15}
                  className="transform group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </RouterLink>
          )}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 border-t border-[var(--border)]/60 pt-4 font-mono text-[11px] text-[var(--text-muted)]">
        <span>{t('game.hub.footerHint')}</span>
        <span className="hidden sm:inline">CTRL+J // TERMINAL</span>
      </div>
    </div>
  );
};

GameHub.propTypes = {
  enableStackGame: PropTypes.bool,
  enableBugGame: PropTypes.bool,
  enableRunnerGame: PropTypes.bool,
};

export default GameHub;
