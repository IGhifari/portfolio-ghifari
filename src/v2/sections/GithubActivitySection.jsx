import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { FiAlertCircle, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';

import {
  GITHUB_PROFILE_URL,
  calculateContributionStats,
  clearGithubCache,
  fetchGithubData,
  formatRepoDate,
} from '../../services/githubService';
import { initialContributionsData } from '../../data/githubContributions';
import { siteConfig } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import MaskedDisplayHeading from '../components/ui/MaskedDisplayHeading';
import RolloverLabel from '../components/ui/RolloverLabel';
import CountUpMetricCell from '../components/ui/CountUpMetricCell';

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
 * Dedicated wrapper so `useInView` always binds to a mounted DOM grid after initial load.
 */
function GithubMetricsStrip({ cards, shouldReduceMotion }) {
  const gridRef = useRef(null);
  const isInView = useInView(gridRef, { once: true, amount: 0.2 });

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 items-stretch"
    >
      {cards.map((card, idx) => (
        <CountUpMetricCell
          key={card.id}
          target={card.target}
          suffix={card.suffix}
          label={card.label}
          sub={card.sub}
          locale={card.locale}
          index={idx}
          isTriggered={isInView}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  );
}

GithubMetricsStrip.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      target: PropTypes.number.isRequired,
      suffix: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sub: PropTypes.string.isRequired,
      locale: PropTypes.string,
    })
  ).isRequired,
  shouldReduceMotion: PropTypes.bool,
};

/**
 * Portfolio V2 Architectural GitHub Activity Section
 * Open-canvas Nakula editorial layout: zero Bento cards, hairline 12-column ledger,
 * live interactive big-numeral inspection readout on the left, frameless 53-week matrix on the right.
 */
function GithubActivitySection({ isEn: isEnProp }) {
  const { language, t } = useLanguage();
  const isEn = typeof isEnProp === 'boolean' ? isEnProp : language !== 'id';
  const shouldReduceMotion = useReducedMotion();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
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
        target: Number(totalContributions) || 0,
        locale: isEn ? 'en-US' : 'id-ID',
        suffix: '+',
        label: isEn ? 'Annual Contributions' : 'Kontribusi Tahunan',
        sub: isEn
          ? `${stats.activeDays} active days`
          : `${stats.activeDays} hari aktif`,
      },
      {
        id: 'streak',
        target: Number(stats.currentStreak) || 0,
        suffix: isEn ? 'd' : 'h',
        label: isEn ? 'Current Streak' : 'Streak Saat Ini',
        sub: isEn
          ? `Best: ${stats.longestStreak} days`
          : `Terpanjang: ${stats.longestStreak} hari`,
      },
      {
        id: 'repos',
        target: Number(profile?.publicRepos ?? 24) || 0,
        suffix: '.',
        label: isEn ? 'Public Repositories' : 'Repositori Publik',
        sub: `@${username}`,
      },
      {
        id: 'followers',
        target: Number(profile?.followers ?? 11) || 0,
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
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.7, ease: NAKULA_EASE },
      };

  const inspectedDateLabel = hoveredDay
    ? formatRepoDate(`${hoveredDay.date}T00:00:00`, language)
    : '';

  return (
    <section
      id="v2-github"
      aria-labelledby="v2-github-heading"
      className="relative z-[2] bg-[var(--v2-bg)] py-28 sm:py-[150px] border-t border-[var(--v2-border)]"
    >
      <div className="v2-container space-y-16 sm:space-y-24">
        {/* ------------------------------------------------------------------
            1. Nakula Editorial Header (1:1 Match with "NUMBERS DON'T LIE")
            ------------------------------------------------------------------ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <p className="v2-section-tag mb-4 md:mb-0 md:absolute md:top-2 md:left-0">
              ({isEn ? 'OPEN SOURCE' : 'KODE TERBUKA'})
            </p>
            <div id="v2-github-heading">
              <MaskedDisplayHeading
                as="h2"
                lines={isEn ? ['GITHUB', 'ACTIVITY'] : ['AKTIVITAS', 'GITHUB']}
                lineClassNames={['md:pl-36 lg:pl-44', '']}
                className="v2-section-heading"
                shouldReduceMotion={Boolean(shouldReduceMotion)}
              />
            </div>
          </div>

          <p className="max-w-[360px] text-[20px] sm:text-[24px] font-medium tracking-[-0.045em] leading-[1.12] text-[var(--v2-text-muted)] lg:pb-2">
            {isEn
              ? 'Consistent engineering output, public TypeScript tooling, and 53 weeks of verified commit history.'
              : 'Konsistensi rekayasa perangkat lunak, paket TypeScript publik, dan riwayat komit 53 minggu terakhir.'}
          </p>
        </div>

        {/* ------------------------------------------------------------------
            Loading State (Open Architectural Hairlines — Zero Boxed Cards)
            ------------------------------------------------------------------ */}
        {loading && !data && (
          <div className="space-y-16" aria-busy="true" aria-live="polite">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="v2-metric-cell">
                  <div className="v2-metric-ticks" aria-hidden="true" />
                  <div className="h-16 w-28 rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
                  <div className="mt-12 h-4 w-32 rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
                </div>
              ))}
            </div>

            <div className="border-t border-b border-[var(--v2-border-strong)] py-12">
              <div className="h-[140px] w-full rounded bg-[var(--v2-surface)] motion-safe:animate-pulse" />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            Error State (Minimal Open Hairline Strip)
            ------------------------------------------------------------------ */}
        {error && !data && !loading && (
          <div className="border-t border-b border-[var(--v2-border-strong)] py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[-0.02em] text-[var(--v2-accent)]">
                <FiAlertCircle size={16} aria-hidden="true" />
                <span>{error.isRateLimit ? t('github.rateLimitTitle') : t('github.errorTitle')}</span>
              </div>
              <p className="text-[17px] leading-[1.4] tracking-[-0.02em] text-[var(--v2-text-muted)]">
                {error.isRateLimit ? t('github.rateLimitDesc') : t('github.errorDesc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => loadData({ force: true })}
                className="v2-pill-btn !py-3.5 !px-6 !text-[13px]"
              >
                <FiRefreshCw size={14} className="text-[var(--v2-accent)]" aria-hidden="true" />
                <span>{t('github.retry')}</span>
              </button>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-pill-btn v2-pill-btn--accent !py-3.5 !px-6 !text-[13px]"
              >
                <RolloverLabel text={isEn ? 'OPEN GITHUB' : 'BUKA GITHUB'} />
                <FiArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            Live Content: 4-Column Metric Strip + Open Architectural Ledger
            ------------------------------------------------------------------ */}
        {(!loading || data) && (
          <div className="space-y-16 sm:space-y-24">
            {/* 2. 4-Column Metric Strip */}
            <GithubMetricsStrip
              cards={metricCards}
              shouldReduceMotion={Boolean(shouldReduceMotion)}
            />

            {/* 3. Open-Canvas Architectural Contribution Ledger (Zero Bento Box!) */}
            <motion.div
              {...fadeInProps}
              className="border-t border-b border-[var(--v2-border-strong)] py-10 sm:py-14"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column (4 cols): Live Inspection Readout / Studio Profile + Actions */}
                <div className="lg:col-span-4 lg:border-r lg:border-[var(--v2-border-strong)] lg:pr-10 flex flex-col justify-between gap-8">
                  <div
                    role="status"
                    aria-live="polite"
                    className="min-h-[108px] flex flex-col justify-between"
                  >
                    {hoveredDay ? (
                      <div className="space-y-2">
                        <p className="text-[13px] uppercase tracking-[-0.02em] text-[var(--v2-accent)] font-medium">
                          ({inspectedDateLabel})
                        </p>
                        <div className="flex items-baseline gap-2 tabular-nums">
                          <span className="text-[44px] sm:text-[52px] font-semibold tracking-[-0.06em] leading-none text-[var(--v2-text-bright)]">
                            {hoveredDay.count}
                          </span>
                          <span className="text-[18px] font-medium tracking-[-0.03em] text-[var(--v2-text-muted)]">
                            {hoveredDay.count === 1
                              ? isEn
                                ? 'contribution'
                                : 'kontribusi'
                              : isEn
                                ? 'contributions'
                                : 'kontribusi'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[13px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                          ({isEn ? 'DEVELOPER PROFILE' : 'PROFIL PENGEMBANG'})
                        </p>
                        <div className="flex items-center gap-3.5">
                          <img
                            src={avatarSrc}
                            alt={`${profile?.name || siteConfig.author.name} GitHub avatar`}
                            width={44}
                            height={44}
                            loading="lazy"
                            decoding="async"
                            className="h-11 w-11 rounded-full object-cover border border-[var(--v2-border-strong)] shrink-0 bg-[var(--v2-surface)]"
                          />
                          <div className="min-w-0">
                            <p className="text-[18px] font-semibold tracking-[-0.035em] leading-[1.15] text-[var(--v2-text)] truncate">
                              {profile?.name || siteConfig.author.name}
                            </p>
                            <p className="text-[14px] tracking-[-0.02em] text-[var(--v2-text-dim)] truncate">
                              @{username}
                              {profile?.bio ? ` — ${profile.bio}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Strip: Nakula Rollover Pill + Subtle Circular Sync */}
                  <div className="flex items-center gap-2">
                    <a
                      href={profile?.htmlUrl || GITHUB_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="v2-pill-btn !h-[48px] !px-6 !text-[13px]"
                    >
                      <RolloverLabel text={isEn ? 'GITHUB PROFILE' : 'PROFIL GITHUB'} />
                      <FiArrowUpRight size={15} className="text-[var(--v2-accent)]" aria-hidden="true" />
                    </a>

                    <button
                      type="button"
                      onClick={() => loadData({ force: true })}
                      disabled={loading || refreshing}
                      aria-label={t('github.refresh')}
                      title={t('github.refresh')}
                      className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                    >
                      <FiRefreshCw
                        size={15}
                        className={refreshing ? 'animate-spin text-[var(--v2-accent)]' : ''}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Right Column (8 cols): Frameless 53-Week Matrix Directly on Canvas */}
                <div className="lg:col-span-8 flex flex-col justify-between gap-6 min-w-0">
                  {/* Minimal Editorial Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                      ({isEn ? '53-WEEK CADENCE' : 'RITME 53 MINGGU'})
                    </p>

                    <div className="flex items-center gap-2 text-[12px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
                      <span>{t('github.legendLess')}</span>
                      <div className="flex items-center gap-1" aria-hidden="true">
                        {GITHUB_LEVEL_CLASSES.map((cls, levelIdx) => (
                          <span
                            key={cls}
                            className={`block h-2.5 w-2.5 rounded-[2px] ${cls}`}
                            title={`Level ${levelIdx}`}
                          />
                        ))}
                      </div>
                      <span>{t('github.legendMore')}</span>
                    </div>
                  </div>

                  {/* Compact Frameless Heatmap Grid */}
                  <div className="overflow-x-auto pb-1 v2-gh-scroll">
                    <div className="min-w-[640px] max-w-[840px] w-full">
                      {/* Month Headers */}
                      <div className="flex items-center gap-2 mb-2 select-none">
                        <div className="w-6 shrink-0" aria-hidden="true" />
                        <div
                          className="grid flex-1 gap-[3px] text-[11px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-dim)]"
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
                      <div className="flex items-stretch gap-2">
                        <div className="grid grid-rows-7 gap-[3px] w-6 shrink-0 text-[10px] font-medium text-[var(--v2-text-dim)] select-none">
                          {(DAY_LABELS[language] || DAY_LABELS.en).map((dayLabel, idx) => (
                            <span key={idx} className="flex items-center leading-none">
                              {dayLabel}
                            </span>
                          ))}
                        </div>

                        <div
                          className="grid flex-1 grid-rows-7 grid-flow-col gap-[3px]"
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
                                className={`v2-gh-cell aspect-square w-full rounded-[2px] cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] focus-visible:z-10 ${getCellClass(
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
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

GithubActivitySection.propTypes = {
  isEn: PropTypes.bool,
};

export default GithubActivitySection;
