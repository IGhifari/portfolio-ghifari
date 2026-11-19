import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiArrowLeft, FiArrowRight, FiCompass, FiLayers, FiAward } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { RouterLink, useRouter } from '../../context/RouterContext';
import { updateDocumentMetadata } from '../../utils/seo';
import { siteConfig, ENABLE_STACK_GAME } from '../../config/site';
import { readBestScore } from '../stack/logic/stackLogic';

const GameHub = ({ enableStackGame = ENABLE_STACK_GAME }) => {
  const { language, t } = useLanguage();
  const { langPrefix } = useRouter();
  const [bestScore, setBestScore] = useState(0);

  const prefix = langPrefix === 'en' ? '/en' : '';
  const exitHref = prefix || '/';
  const exploreHref = `${prefix}/play/explore`;
  const stackHref = `${prefix}/play/stack`;

  useEffect(() => {
    setBestScore(readBestScore());
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

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#F5F5F5] flex flex-col justify-between p-5 sm:p-8 select-none">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4">
        <RouterLink
          to={exitHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#141414] hover:bg-[#1c1c1f] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs font-bold text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label={t('game.exitAria')}
        >
          <FiArrowLeft size={14} className="text-[#3B82F6]" aria-hidden="true" />
          <span>{t('game.exitBtn')}</span>
        </RouterLink>

        <span className="font-mono text-[11px] text-[#71717A] uppercase tracking-wider">
          {siteConfig.brandName} {'//'} INTERACTIVE LAB
        </span>
      </div>

      {/* Main Hub Content */}
      <div className="max-w-4xl w-full mx-auto my-auto py-10 space-y-8">
        <div className="space-y-2">
          <span className="font-mono text-xs text-[#3B82F6] uppercase tracking-wider font-semibold block">
            {'//'} {t('game.hub.tag')}
          </span>
          <h1 className="font-grotesk font-black text-3xl sm:text-5xl text-[#F5F5F5] uppercase tracking-tight">
            {t('game.hub.heading')}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#A1A1AA] max-w-2xl">
            {t('game.hub.subtitle')}
          </p>
        </div>

        {/* Cards Grid: 2 columns when Stack is enabled, single full-width card when disabled */}
        <div
          className={`grid gap-4 sm:gap-5 ${
            enableStackGame ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl'
          }`}
        >
          {/* Card 1: Explore (/play/explore) */}
          <RouterLink
            to={exploreHref}
            className="group p-6 rounded-lg bg-[#141414] hover:bg-[#18181d] border border-[#27272A] hover:border-[#3B82F6] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#3B82F6] font-bold uppercase tracking-wider">
                  01 {'//'} {t('game.hub.exploreBadge')}
                </span>
                <div className="w-9 h-9 rounded-md bg-[#101010] border border-[#27272A] group-hover:border-[#3B82F6] flex items-center justify-center text-[#3B82F6] transition-colors">
                  <FiCompass size={18} aria-hidden="true" />
                </div>
              </div>

              <h2 className="font-grotesk font-black text-2xl text-[#F5F5F5] uppercase tracking-tight">
                {t('game.hub.exploreTitle')}
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                {t('game.hub.exploreDesc')}
              </p>
            </div>

            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between font-mono text-xs font-bold text-[#F5F5F5] group-hover:text-[#3B82F6] uppercase tracking-wider transition-colors">
              <span>{t('game.hub.launchExplore')}</span>
              <FiArrowRight
                size={15}
                className="transform group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </div>
          </RouterLink>

          {/* Card 2: Deploy Stack (/play/stack) — only rendered when ENABLE_STACK_GAME is true */}
          {enableStackGame && (
            <RouterLink
              to={stackHref}
              className="group p-6 rounded-lg bg-[#141414] hover:bg-[#18181d] border border-[#27272A] hover:border-[#3B82F6] flex flex-col justify-between gap-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#3B82F6] font-bold uppercase tracking-wider">
                    02 {'//'} {t('game.hub.stackBadge')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101010] border border-[#27272A] font-mono text-[11px] text-[#A1A1AA]"
                      aria-label={`${t('game.stack.bestLabel')}: ${bestScore}`}
                    >
                      <FiAward size={12} className="text-[#3B82F6]" aria-hidden="true" />
                      <span>{t('game.stack.bestLabel')}:</span>
                      <strong className="text-[#F5F5F5]">{bestScore}</strong>
                    </span>
                    <div className="w-9 h-9 rounded-md bg-[#101010] border border-[#27272A] group-hover:border-[#3B82F6] flex items-center justify-center text-[#3B82F6] transition-colors">
                      <FiLayers size={18} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <h2 className="font-grotesk font-black text-2xl text-[#F5F5F5] uppercase tracking-tight">
                  {t('game.hub.stackTitle')}
                </h2>

                <p className="font-sans text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  {t('game.hub.stackDesc')}
                </p>
              </div>

              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between font-mono text-xs font-bold text-[#F5F5F5] group-hover:text-[#3B82F6] uppercase tracking-wider transition-colors">
                <span>{t('game.hub.launchStack')}</span>
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
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 border-t border-[#27272A]/60 pt-4 font-mono text-[11px] text-[#71717A]">
        <span>{t('game.hub.footerHint')}</span>
        <span className="hidden sm:inline">CTRL+J // TERMINAL</span>
      </div>
    </div>
  );
};

GameHub.propTypes = {
  enableStackGame: PropTypes.bool,
};

export default GameHub;
