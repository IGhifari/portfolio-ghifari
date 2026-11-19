import PropTypes from 'prop-types';
import { FiArrowLeft, FiArrowUpRight, FiBox } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { RouterLink } from '../../context/RouterContext';
import { BUILDINGS } from '../logic/worldConfig';

const WebGLFallback = ({ exitHref = '/', onSelectBuilding }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#F5F5F5] px-5 py-16 flex items-center justify-center">
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-lg bg-[#141414] border border-[#27272A] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[#3B82F6] uppercase tracking-wider font-semibold">
            <FiBox size={15} aria-hidden="true" />
            <span>3D EXPLORER {'//'} FALLBACK</span>
          </div>

          <RouterLink
            to={exitHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101010] border border-[#27272A] hover:border-[#3B82F6] font-mono text-xs text-[#F5F5F5]"
          >
            <FiArrowLeft size={13} className="text-[#3B82F6]" aria-hidden="true" />
            <span>{t('game.exitBtn')}</span>
          </RouterLink>
        </div>

        <div className="space-y-2">
          <h1 className="font-grotesk font-black text-2xl sm:text-3xl text-[#F5F5F5] uppercase">
            {t('game.fallbackTitle')}
          </h1>
          <p className="font-sans text-sm text-[#A1A1AA] leading-relaxed">
            {t('game.fallbackDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {BUILDINGS.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-md bg-[#101010] border border-[#27272A] flex flex-col justify-between gap-3"
            >
              <div>
                <span className="font-mono text-[10px] text-[#3B82F6] font-bold uppercase tracking-wider">
                  {b.number} {'//'} {t(b.subtitleKey)}
                </span>
                <h2 className="font-grotesk font-bold text-base text-[#F5F5F5] mt-0.5">
                  {t(b.labelKey)}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {onSelectBuilding && (
                  <button
                    type="button"
                    onClick={() => onSelectBuilding(b)}
                    className="px-3 py-1.5 rounded bg-[#141414] hover:border-[#3B82F6] border border-[#27272A] font-mono text-xs text-[#F5F5F5] cursor-pointer"
                  >
                    {t('game.openBtn')}
                  </button>
                )}
                <RouterLink
                  to={b.sectionHref}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#3B82F6] text-[#F5F5F5] font-mono text-xs font-bold"
                >
                  <span>{t('game.goToSection')}</span>
                  <FiArrowUpRight size={12} aria-hidden="true" />
                </RouterLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

WebGLFallback.propTypes = {
  exitHref: PropTypes.string,
  onSelectBuilding: PropTypes.func,
};

export default WebGLFallback;
