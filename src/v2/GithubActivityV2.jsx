import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';

import {
  GITHUB_PROFILE_URL,
  calculateContributionStats,
  clearGithubCache,
  fetchGithubData,
  formatRepoDate,
} from '../services/githubService';
import { initialContributionsData } from '../data/githubContributions';
import { siteConfig } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { V2MaskedHeading, V2RolloverLabel } from './V2Chrome';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

const MONTH_NAMES = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const DAY_LABELS = {
  id: ['', 'Sen', '', 'Rab', '', 'Jum', ''],
  en: ['', 'Mon', '', 'Wed', '', 'Fri', ''],
};

const GITHUB_LEVEL_CLASSES = [
  'v2-gh-cell-0',
  'v2-gh-cell-1',
  'v2-gh-cell-2',
  'v2-gh-cell-3',
  'v2-gh-cell-4',
];

function getCellClass(level) {
  return GITHUB_LEVEL_CLASSES[level] || GITHUB_LEVEL_CLASSES[0];
}

/**
 * Portfolio V2 GitHub Activity Section
 * Reuses the live GitHub data/cache pipeline (`githubService.js`) with Nakula-inspired
 * editorial typography, hairline metric ticks, and season-adaptive heatmap cells.
 */
function GithubActivityV2({ isEn: isEnProp }) {
  const { language, t } = useLanguage();
  const isEn = typeof isEnProp === 'boolean' ? isEnProp : language !== 'id';
  const shouldReduceMotion = useReducedMotion();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [focusedDayIndex, setFocusedDayIndex] = useState(0);
  const gridCellsRef = useRef([]);

  const loadData = useCallback(async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true);
        clearGithubCache();
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchGithubData({ force });
      setData(result.data);
      setFromCache(result.fromCache);
    } catch (err) {
      setError({
        message: err.message,
        isRateLimit: err.isRateLimit || false,
        resetTime: err.resetTime || null,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData({ force: false });
  }, [loadData]);

  const profile = data?.profile;
  const contributions = data?.contributions || initialContributionsData;
  const days = useMemo(() => contributions?.days || [], [contributions?.days]);

  const stats = useMemo(() => calculateContributionStats(days), [days]);

  const numWeeks = useMemo(() => Math.max(1, Math.ceil(days.length / 7)), [days.length]);

  const monthHeaders = useMemo(() => {
    if (!days.length) return [];

    const names = MONTH_NAMES[language] || MONTH_NAMES.en;
    const headers = [];
    let lastMonth = -1;

    for (let colIdx = 0; colIdx < numWeeks; colIdx += 1) {
      const dayIdx = colIdx * 7;
      const firstDay = days[dayIdx];
      if (!firstDay?.date) continue;

      const parsed = new Date(`${firstDay.date}T00:00:00`);
      const monthIdx = parsed.getMonth();

      if (monthIdx !== lastMonth) {
        const lastHeader = headers[headers.length - 1];
        if (!lastHeader || colIdx - lastHeader.colIdx >= 3) {
          headers.push({
            label: names[monthIdx],
            colIdx,
          });
        }
        lastMonth = monthIdx;
      }
    }

    return headers;
  }, [days, language, numWeeks]);

  const formatDayTooltip = useCallback(
    (day) => {
      if (!day) return '';
      const dateStr = formatRepoDate(`${day.date}T00:00:00`, language);
      if (day.count === 0) {
        return isEn ? `No contributions · ${dateStr}` : `Belum ada kontribusi · ${dateStr}`;
      }
      if (isEn) {
        return `${day.count} contribution${day.count > 1 ? 's' : ''} · ${dateStr}`;
      }
      return `${day.count} kontribusi · ${dateStr}`;
    },
    [isEn, language]
  );

  const handleCellKeyDown = useCallback(
    (e, idx) => {
      const total = days.length;
      if (!total) return;

      let nextIdx = idx;
      switch (e.key) {
        case 'ArrowRight':
          nextIdx = Math.min(total - 1, idx + 7);
          break;
        case 'ArrowLeft':
          nextIdx = Math.max(0, idx - 7);
          break;
        case 'ArrowDown':
          nextIdx = Math.min(total - 1, idx + 1);
          break;
        case 'ArrowUp':
          nextIdx = Math.max(0, idx - 1);
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = total - 1;
          break;
        default:
          return;
      }

      if (nextIdx !== idx) {
        e.preventDefault();
        setFocusedDayIndex(nextIdx);
        setHoveredDay(days[nextIdx]);
        gridCellsRef.current[nextIdx]?.focus();
      }
    },
    [days]
  );

  const totalContributions = contributions?.total ?? initialContributionsData.total;
  const username = profile?.login || siteConfig.author.githubUsername;
  const avatarSrc =
    profile?.avatarUrl ||
    `https://avatars.githubusercontent.com/${siteConfig.author.githubUsername}?v=4`;

  const metricCards = useMemo(
    () => [
      {
        id: 'contributions',
        value: totalContributions.toLocaleString(isEn ? 'en-US' : 'id-ID'),
        suffix: '+',
        label: isEn ? 'Annual Contributions' : 'Kontribusi Tahunan',
        sub: isEn
          ? `${stats.activeDays} active coding days`
          : `${stats.activeDays} hari aktif berkode`,
      },
      {
        id: 'streak',
        value: String(stats.currentStreak),
        suffix: isEn ? 'd' : 'h',
        label: isEn ? 'Current Streak' : 'Streak Saat Ini',
        sub: isEn
          ? `Longest streak: ${stats.longestStreak} days`
          : `Streak terpanjang: ${stats.longestStreak} hari`,
      },
      {
        id: 'repos',
        value: String(profile?.publicRepos ?? 24),
        suffix: '.',
        label: isEn ? 'Public Repositories' : 'Repositori Publik',
        sub: `@${username}`,
      },
      {
        id: 'followers',
        value: String(profile?.followers ?? 11),
        suffix: '.',
        label: isEn ? 'GitHub Followers' : 'Pengikut GitHub',
        sub: isEn
          ? `${profile?.following ?? 23} following`
          : `${profile?.following ?? 23} mengikuti`,
      },
    ],
    [
      isEn,
      profile?.followers,
      profile?.following,
      profile?.publicRepos,
      stats.activeDays,
      stats.currentStreak,
      stats.longestStreak,
      totalContributions,
      username,
    ]
  );

  const fadeInProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.65, ease: NAKULA_EASE },
      };

  return (
    <section
      id="v2-github"
      aria-labelledby="v2-github-heading"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
    >
      <div className="v2-container space-y-14 sm:space-y-20">
        {/* ------------------------------------------------------------------
            Editorial Header (Matches V2 Metrics / Insights Composition)
            ------------------------------------------------------------------ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({isEn ? 'OPEN SOURCE' : 'KODE TERBUKA'})
            </p>
            <div id="v2-github-heading">
              <V2MaskedHeading
                as="h2"
                lines={isEn ? ['GITHUB', 'ACTIVITY'] : ['AKTIVITAS', 'GITHUB']}
                className="v2-section-heading md:[&>span:first-child]:pl-32 lg:[&>span:first-child]:pl-40"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-5 max-w-[440px]">
            <div className="flex items-center gap-2.5 text-[12px] font-mono uppercase tracking-[0.08em] text-[var(--v2-text-muted)]">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[var(--v2-accent)] motion-safe:animate-pulse"
                aria-hidden="true"
              />
              <span>
                {loading
                  ? isEn
                    ? 'SYNCING TELEMETRY...'
                    : 'MENYINKRONKAN DATA...'
                  : fromCache
                    ? isEn
                      ? `CACHED · @${username}`
                      : `TERSINGGAH · @${username}`
                    : isEn
                      ? `LIVE API · @${username}`
                      : `API LANGSUNG · @${username}`}
              </span>
            </div>

            <p className="text-[17px] sm:text-[19px] font-medium tracking-[-0.03em] leading-[1.28] text-[var(--v2-text-muted)] lg:text-right">
              {isEn
                ? 'Real-time open-source cadence, commit consistency, and 53-week contribution telemetry.'
                : 'Ritme open-source real-time, konsistensi komit, dan telemetri kontribusi 53 minggu terakhir.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadData({ force: true })}
                disabled={loading || refreshing}
                aria-label={t('github.refresh')}
                className="v2-pill-btn !py-3 !px-5 !text-[13px] disabled:opacity-50"
              >
                <FiRefreshCw
                  size={14}
                  className={refreshing ? 'animate-spin text-[var(--v2-accent)]' : 'text-[var(--v2-accent)]'}
                  aria-hidden="true"
                />
                <span>{refreshing ? (isEn ? 'SYNCING' : 'MEMUAT') : isEn ? 'REFRESH' : 'PERBARUI'}</span>
              </button>

              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-pill-btn v2-pill-btn--accent !py-3 !px-6 !text-[13px]"
              >
                <V2RolloverLabel text={isEn ? 'VIEW GITHUB' : 'LIHAT GITHUB'} />
                <FiArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            Loading State
            ------------------------------------------------------------------ */}
        {loading && !data && (
          <div className="space-y-10" aria-busy="true" aria-live="polite">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="v2-metric-cell !min-h-[184px]">
                  <div className="v2-metric-ticks" aria-hidden="true" />
                  <div className="h-14 w-28 rounded bg-[var(--v2-surface-elevated)] motion-safe:animate-pulse" />
                  <div className="mt-8 space-y-2">
                    <div className="h-4 w-32 rounded bg-[var(--v2-surface-elevated)] motion-safe:animate-pulse" />
                    <div className="h-3 w-24 rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg-elevated)] p-6 sm:p-8">
              <div className="h-[150px] w-full rounded-[8px] bg-[var(--v2-surface)] motion-safe:animate-pulse" />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            Error State (only when no data is available)
            ------------------------------------------------------------------ */}
        {error && !data && !loading && (
          <div className="rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg-elevated)] p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-[var(--v2-accent)]">
                <FiAlertCircle size={15} aria-hidden="true" />
                <span>{error.isRateLimit ? t('github.rateLimitTitle') : t('github.errorTitle')}</span>
              </div>
              <p className="text-[16px] leading-[1.45] text-[var(--v2-text-muted)]">
                {error.isRateLimit ? t('github.rateLimitDesc') : t('github.errorDesc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => loadData({ force: true })}
                className="v2-pill-btn !py-3 !px-6 !text-[13px]"
              >
                <FiRefreshCw size={14} className="text-[var(--v2-accent)]" aria-hidden="true" />
                <span>{t('github.retry')}</span>
              </button>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-pill-btn v2-pill-btn--accent !py-3 !px-6 !text-[13px]"
              >
                <V2RolloverLabel text={isEn ? 'OPEN GITHUB' : 'BUKA GITHUB'} />
                <FiArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            Live Content: 4-Column Hairline Telemetry + Editorial Heatmap
            ------------------------------------------------------------------ */}
        {(!loading || data) && (
          <motion.div {...fadeInProps} className="space-y-12 sm:space-y-16">
            {/* 1. 4-Column Metric Strip (Matches V2 `.v2-metric-cell` DNA) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 items-stretch">
              {metricCards.map((card) => (
                <div
                  key={card.id}
                  className="v2-metric-cell !min-h-[184px] sm:!min-h-[210px]"
                >
                  <div className="v2-metric-ticks" aria-hidden="true" />

                  <div className="flex items-baseline">
                    <span className="text-[44px] sm:text-[62px] xl:text-[70px] font-semibold tracking-[-0.06em] leading-none text-[var(--v2-text)]">
                      {card.value}
                    </span>
                    <span className="text-[34px] sm:text-[50px] xl:text-[56px] font-semibold tracking-[-0.05em] leading-none text-[var(--v2-accent)]">
                      {card.suffix}
                    </span>
                  </div>

                  <div className="mt-10 space-y-1">
                    <p className="text-[15px] sm:text-[16px] font-medium tracking-[-0.02em] leading-[1.25] text-[var(--v2-text)]">
                      {card.label}
                    </p>
                    <p className="font-mono text-[12px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
                      {card.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Contribution Heatmap Surface */}
            <div className="rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-bg-elevated)] overflow-hidden">
              {/* Top Identity & Cadence Bar */}
              <div className="px-5 sm:px-7 py-4 border-b border-[var(--v2-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={avatarSrc}
                    alt={`${profile?.name || siteConfig.author.name} GitHub avatar`}
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 rounded-full object-cover border border-[var(--v2-border-strong)] shrink-0 bg-[var(--v2-surface)]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={profile?.htmlUrl || GITHUB_PROFILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] sm:text-[15px] font-semibold tracking-[-0.02em] text-[var(--v2-text)] hover:text-[var(--v2-accent)] transition-colors truncate"
                      >
                        {profile?.name || siteConfig.author.name}
                      </a>
                      <span className="font-mono text-[11px] text-[var(--v2-text-dim)] shrink-0">
                        @{username}
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-[var(--v2-text-muted)] truncate max-w-[520px]">
                      {profile?.bio ||
                        (isEn
                          ? 'Frontend Engineer · React, Next.js & Scalable UI Systems'
                          : 'Frontend Engineer · React, Next.js & Sistem UI Skalabel')}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--v2-text)] shrink-0">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)]"
                    aria-hidden="true"
                  />
                  <span>
                    {totalContributions.toLocaleString(isEn ? 'en-US' : 'id-ID')}{' '}
                    {isEn ? 'CONTRIBUTIONS / 12M' : 'KONTRIBUSI / 12B'}
                  </span>
                </div>
              </div>

              {/* Responsive 53-Week Matrix */}
              <div className="px-5 sm:px-7 py-6 sm:py-8">
                <div className="overflow-x-auto pb-2 v2-gh-scroll">
                  <div className="min-w-[740px] w-full">
                    {/* Month Headers Aligned to Week Columns */}
                    <div className="flex items-center gap-2.5 mb-2.5 select-none">
                      <div className="w-7 shrink-0" aria-hidden="true" />
                      <div
                        className="grid flex-1 gap-[3px] xl:gap-[4px] font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--v2-text-dim)]"
                        style={{
                          gridTemplateColumns: `repeat(${numWeeks}, minmax(0, 1fr))`,
                        }}
                      >
                        {monthHeaders.map((month, idx) => (
                          <span
                            key={`${month.label}-${idx}`}
                            className="whitespace-nowrap overflow-visible"
                            style={{ gridColumnStart: month.colIdx + 1 }}
                          >
                            {month.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Weekday Labels + 7-Row Grid */}
                    <div className="flex items-stretch gap-2.5">
                      <div className="grid grid-rows-7 gap-[3px] xl:gap-[4px] w-7 shrink-0 font-mono text-[10px] text-[var(--v2-text-dim)] select-none">
                        {(DAY_LABELS[language] || DAY_LABELS.en).map((dayLabel, idx) => (
                          <span key={idx} className="flex items-center leading-none">
                            {dayLabel}
                          </span>
                        ))}
                      </div>

                      <div
                        className="grid flex-1 grid-rows-7 grid-flow-col gap-[3px] xl:gap-[4px]"
                        style={{
                          gridTemplateColumns: `repeat(${numWeeks}, minmax(0, 1fr))`,
                        }}
                        role="grid"
                        aria-label={
                          isEn
                            ? `GitHub contribution heatmap for ${username} (${totalContributions} contributions). Use arrow keys to navigate days.`
                            : `Kalender kontribusi GitHub untuk ${username} (${totalContributions} kontribusi). Gunakan tombol panah untuk berpindah hari.`
                        }
                      >
                        {days.map((day, idx) => {
                          const tooltipText = formatDayTooltip(day);
                          const isFocused = idx === focusedDayIndex;
                          return (
                            <div
                              key={day.date || idx}
                              ref={(el) => {
                                gridCellsRef.current[idx] = el;
                              }}
                              role="gridcell"
                              tabIndex={isFocused ? 0 : -1}
                              title={tooltipText}
                              aria-label={tooltipText}
                              aria-selected={isFocused}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                              onFocus={() => {
                                setFocusedDayIndex(idx);
                                setHoveredDay(day);
                              }}
                              onBlur={() => setHoveredDay(null)}
                              onKeyDown={(e) => handleCellKeyDown(e, idx)}
                              className={`v2-gh-cell aspect-square w-full rounded-[2px] sm:rounded-[3px] cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] focus-visible:z-10 ${getCellClass(
                                day.level
                              )}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Readout + Seasonal Scale Legend */}
              <div className="px-5 sm:px-7 py-4 border-t border-[var(--v2-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  role="status"
                  aria-live="polite"
                  className="min-h-[1.75rem] flex items-center font-mono text-[12px]"
                >
                  {hoveredDay ? (
                    <span className="inline-flex items-center gap-2 text-[var(--v2-text-bright)] font-medium">
                      <span
                        className="h-2 w-2 rounded-full bg-[var(--v2-accent)] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{formatDayTooltip(hoveredDay)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[var(--v2-text-muted)]">
                      <FiCalendar size={13} className="text-[var(--v2-text-dim)] shrink-0" aria-hidden="true" />
                      <span>
                        {isEn
                          ? 'Hover squares or use arrow keys to inspect daily commits.'
                          : 'Arahkan kursor atau tombol panah untuk inspeksi komit harian.'}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--v2-text-dim)]">
                  <span>{t('github.legendLess')}</span>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    {GITHUB_LEVEL_CLASSES.map((cls, levelIdx) => (
                      <span
                        key={cls}
                        className={`block h-3 w-3 rounded-[2px] ${cls}`}
                        title={`Level ${levelIdx}`}
                      />
                    ))}
                  </div>
                  <span>{t('github.legendMore')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

GithubActivityV2.propTypes = {
  isEn: PropTypes.bool,
};

export default GithubActivityV2;
