import PropTypes from 'prop-types';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Compact Header Pill + Menu Drawer Dark/Light Switcher for Portfolio V2.
 * Seasonal themes activate automatically by calendar month; the UI exposes
 * only a clean Dark / Light appearance toggle (no manual month chips).
 */
export function V2SeasonHeaderBadge({ onOpenDrawer }) {
  const { season, seasonalEnabled } = useTheme();
  const { t, resolve } = useLanguage();
  if (!seasonalEnabled || !season?.isSeasonalActive) return null;

  const label = resolve(season.name);

  return (
    <button
      type="button"
      onClick={onOpenDrawer}
      aria-label={t('v2.theme.seasonBadgeAria').replace('{season}', label)}
      className="hidden sm:inline-flex h-[43px] items-center gap-2 rounded-full border border-[var(--v2-accent)] bg-[var(--v2-bg)] px-3.5 text-[11px] font-bold uppercase tracking-[-0.02em] text-[var(--v2-text)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
    >
      <span
        className="h-2 w-2 rounded-full bg-[var(--v2-accent)] animate-pulse"
        aria-hidden="true"
      />
      <span className="max-w-[96px] truncate">{label}</span>
    </button>
  );
}

V2SeasonHeaderBadge.propTypes = {
  onOpenDrawer: PropTypes.func,
};

export default function V2SeasonDrawerPicker() {
  const { season, isDark, toggleTheme } = useTheme();
  const { t, resolve } = useLanguage();

  const handleSelectMode = (targetMode) => {
    if ((targetMode === 'dark' && !isDark) || (targetMode === 'light' && isDark)) {
      toggleTheme();
    }
  };

  const seasonTag = season?.isSeasonalActive ? resolve(season.name) : null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
          ({t('v2.theme.label')})
        </p>

        {seasonTag && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--v2-accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)]" aria-hidden="true" />
            <span>{seasonTag}</span>
          </span>
        )}
      </div>

      <div
        className="inline-flex items-center gap-2"
        role="group"
        aria-label={t('v2.theme.modeAria')}
      >
        <button
          type="button"
          onClick={() => handleSelectMode('dark')}
          aria-pressed={isDark}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] ${
            isDark
              ? 'border-[var(--v2-accent)] bg-[var(--v2-surface-elevated)] text-[var(--v2-text-bright)]'
              : 'border-[var(--v2-border-strong)] bg-[var(--v2-bg)] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text)]'
          }`}
        >
          <FiMoon size={12} aria-hidden="true" />
          <span>{t('v2.theme.dark')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('light')}
          aria-pressed={!isDark}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] ${
            !isDark
              ? 'border-[var(--v2-accent)] bg-[var(--v2-surface-elevated)] text-[var(--v2-text-bright)]'
              : 'border-[var(--v2-border-strong)] bg-[var(--v2-bg)] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text)]'
          }`}
        >
          <FiSun size={12} aria-hidden="true" />
          <span>{t('v2.theme.light')}</span>
        </button>
      </div>
    </div>
  );
}
