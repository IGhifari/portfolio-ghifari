import PropTypes from 'prop-types';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { V2_SEASON_OPTIONS } from './v2SeasonPalette';

/**
 * Compact Header Pill + Menu Drawer Season Switcher for Portfolio V2.
 * Variant `"pill"` sits in the top navbar next to `ID / EN` to indicate active season
 * or open the drawer; Variant `"drawer"` renders the full 8-chip selector + Light/Dark toggle.
 */
export function V2SeasonHeaderBadge({ isEn = true, onOpenDrawer }) {
  const { season, seasonalEnabled, isPreviewing } = useTheme();
  if (!seasonalEnabled) return null;

  const isActive = Boolean(season?.isSeasonalActive);
  if (!isActive && !isPreviewing) {
    return (
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label={isEn ? 'Choose seasonal theme' : 'Pilih tema musim'}
        title={isEn ? 'Seasonal themes' : 'Tema musim'}
        className="hidden sm:inline-flex h-[43px] items-center gap-2 rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-3 text-[11px] font-bold uppercase tracking-[-0.02em] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
      >
        <span
          className="h-2 w-2 rounded-full bg-[var(--v2-accent)]"
          aria-hidden="true"
        />
        <span>{isEn ? 'SEASON' : 'MUSIM'}</span>
      </button>
    );
  }

  const label = isActive
    ? isEn
      ? season.name.en
      : season.name.id
    : isEn
    ? 'Default'
    : 'Bawaan';

  return (
    <button
      type="button"
      onClick={onOpenDrawer}
      aria-label={
        isEn ? `Active season: ${label}. Open menu to change` : `Musim aktif: ${label}. Buka menu untuk ubah`
      }
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
  isEn: PropTypes.bool,
  onOpenDrawer: PropTypes.func,
};

export default function V2SeasonDrawerPicker({ isEn = true }) {
  const {
    season,
    month,
    isDark,
    toggleTheme,
    isPreviewing,
    setPreviewMonth,
    seasonalEnabled,
  } = useTheme();

  if (!seasonalEnabled) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
          ({isEn ? 'SEASONAL THEME' : 'TEMA MUSIM'})
        </p>

        {season?.isSeasonalActive && (
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark
                ? isEn
                  ? 'Switch season to light mode'
                  : 'Ubah ke mode terang'
                : isEn
                ? 'Switch season to dark mode'
                : 'Ubah ke mode gelap'
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[-0.01em] text-[var(--v2-text)] hover:border-[var(--v2-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
          >
            {isDark ? <FiSun size={12} /> : <FiMoon size={12} />}
            <span>{isDark ? (isEn ? 'Light' : 'Terang') : isEn ? 'Dark' : 'Gelap'}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {V2_SEASON_OPTIONS.map((opt) => {
          const isSelected =
            opt.month === null
              ? !isPreviewing
              : isPreviewing && month === opt.month;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPreviewMonth(opt.month)}
              aria-pressed={isSelected}
              title={isEn ? opt.label.en : opt.label.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] ${
                isSelected
                  ? 'border-[var(--v2-accent)] bg-[var(--v2-surface-elevated)] text-[var(--v2-text-bright)]'
                  : 'border-[var(--v2-border-strong)] bg-[var(--v2-bg)] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text)]'
              }`}
            >
              <span
                style={{ backgroundColor: opt.swatch }}
                className="h-1.5 w-1.5 rounded-full shrink-0"
                aria-hidden="true"
              />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

V2SeasonDrawerPicker.propTypes = {
  isEn: PropTypes.bool,
};
