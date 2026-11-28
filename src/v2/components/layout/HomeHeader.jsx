import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import { siteConfig } from '@/config/site';
import { useLanguage } from '@/context/LanguageContext';
import { V2SeasonHeaderBadge } from '../../theme/ThemeControls';
import RolloverLabel from '../ui/RolloverLabel';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Fixed Editorial Top Header for Portfolio V2 Home (Nakula-inspired):
 * - Desktop Big -> Small wordmark variant switch at scrollY > 48px
 * - Availability, Jakarta clock, seasonal badge, ID/EN switcher, LET'S TALK + menu trigger
 */
export default function HomeHeader({
  isDark,
  jakartaTime,
  heroIntroComplete,
  isWordmarkCompact,
  isMenuOpen,
  shouldReduceMotion,
  onScrollToSection,
  onSwitchLanguage,
  onOpenMenu,
}) {
  const { language, t } = useLanguage();
  const nextLanguage = language === 'en' ? 'id' : 'en';

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, filter: 'blur(8px)' }}
      animate={
        heroIntroComplete || shouldReduceMotion
          ? { opacity: 1, filter: 'blur(0px)' }
          : { opacity: 0, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.82, delay: 0.04, ease: NAKULA_EASE }}
      className="v2-nav-scrim fixed top-0 left-0 right-0 h-[75px] md:h-[88px] z-[40] pointer-events-none"
    >
      <div className="v2-container flex items-start justify-between pt-4 md:pt-6">
        {/* Desktop Wordmark: Editorial Big -> Small variant switch at scrollY > 48px */}
        <motion.a
          href="#v2-top"
          onClick={(e) => {
            e.preventDefault();
            onScrollToSection('v2-top');
          }}
          initial={false}
          animate={{
            scale: shouldReduceMotion || isWordmarkCompact ? 0.2 : 1,
          }}
          transition={{ duration: 0.48, ease: NAKULA_EASE }}
          style={{ transformOrigin: 'top left' }}
          className="hidden md:inline-block pointer-events-auto v2-display-heading text-[clamp(5.5rem,14.8vw,13.5rem)] leading-[0.80] text-[var(--v2-text)] hover:text-[var(--v2-text-bright)] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] rounded-sm will-change-transform"
        >
          {siteConfig.brandName}
          <span className="text-[0.26em] align-top ml-1.5 font-sans font-normal text-[var(--v2-text)]">
            ®
          </span>
        </motion.a>

        {/* Mobile Compact Wordmark */}
        <a
          href="#v2-top"
          onClick={(e) => {
            e.preventDefault();
            onScrollToSection('v2-top');
          }}
          className="md:hidden pointer-events-auto v2-display-heading text-[36px] leading-[0.88] text-[var(--v2-text)] select-none focus-visible:outline-none"
        >
          {siteConfig.brandName}
          <span className="text-[0.34em] align-top ml-0.5 font-sans font-normal text-[var(--v2-text)]">
            ®
          </span>
        </a>

        {/* Right Cluster (`mix-blend-difference` in dark mode; direct contrast in Light Winter) */}
        <div
          className={`pointer-events-auto flex items-center gap-3 lg:gap-10 shrink-0 ${
            isDark ? 'mix-blend-difference' : ''
          }`}
        >
          <div className="hidden lg:flex flex-col text-left leading-[1.22] whitespace-nowrap">
            <div className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
              <span className="h-2 w-2 rounded-full bg-[#47c554]" aria-hidden="true" />
              <span>{t('v2.common.availableForProject')}</span>
            </div>
            <span className="pl-4 text-[13px] font-normal uppercase tracking-[-0.03em] text-[var(--v2-text-muted)]">
              {t('v2.common.openForRoles')}
            </span>
          </div>

          <div className="hidden lg:flex flex-col text-left leading-[1.22] whitespace-nowrap">
            <span className="text-[15px] font-bold tracking-[-0.04em] text-[var(--v2-text)]">
              {jakartaTime}
            </span>
            <span className="text-[13px] font-normal tracking-[-0.03em] text-[var(--v2-text-muted)]">
              (GMT+7)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <V2SeasonHeaderBadge onOpenDrawer={onOpenMenu} />

            <button
              type="button"
              onClick={() => onSwitchLanguage(nextLanguage)}
              aria-label={t('v2.common.switchLangAria')}
              className="inline-flex h-[40px] sm:h-[43px] shrink-0 items-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-2.5 sm:px-3 text-[11px] sm:text-[12px] font-bold uppercase tracking-[-0.02em] text-[var(--v2-text)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
            >
              <span className={language === 'id' ? 'text-[var(--v2-accent)]' : 'text-[var(--v2-text-dim)]'}>ID</span>
              <span className="mx-1 text-[#444444]">/</span>
              <span className={language === 'en' ? 'text-[var(--v2-accent)]' : 'text-[var(--v2-text-dim)]'}>EN</span>
            </button>

            <div className="flex items-center gap-1">
              <a
                href="#v2-contact"
                onClick={(e) => {
                  e.preventDefault();
                  onScrollToSection('v2-contact');
                }}
                className="v2-pill-btn v2-nav-talk-btn"
              >
                <RolloverLabel text={t('v2.common.letsTalk')} />
              </a>

              <button
                type="button"
                onClick={onOpenMenu}
                aria-label={t('v2.common.openMenuAria')}
                aria-expanded={isMenuOpen}
                className="v2-nav-menu-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
              >
                <span className="v2-nav-menu-bars" aria-hidden="true">
                  <span className="v2-nav-menu-bar v2-nav-menu-bar--top" />
                  <span className="v2-nav-menu-bar v2-nav-menu-bar--bottom" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

HomeHeader.propTypes = {
  isDark: PropTypes.bool.isRequired,
  jakartaTime: PropTypes.string.isRequired,
  heroIntroComplete: PropTypes.bool.isRequired,
  isWordmarkCompact: PropTypes.bool.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  shouldReduceMotion: PropTypes.bool.isRequired,
  onScrollToSection: PropTypes.func.isRequired,
  onSwitchLanguage: PropTypes.func.isRequired,
  onOpenMenu: PropTypes.func.isRequired,
};
