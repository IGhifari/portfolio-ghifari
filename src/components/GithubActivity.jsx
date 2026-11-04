import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle,
  FiFolder,
  FiUsers,
  FiActivity,
  FiCalendar,
} from 'react-icons/fi';
import { SiGithub } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchGithubData,
  clearGithubCache,
  formatRepoDate,
  GITHUB_PROFILE_URL,
} from '../services/githubService';
import { initialContributionsData } from '../data/githubContributions';

const MONTH_LABELS = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const DAY_LABELS = {
  id: ['', 'Sen', '', 'Rab', '', 'Jum', ''],
  en: ['', 'Mon', '', 'Wed', '', 'Fri', ''],
};

const GithubActivity = () => {
  const [profile, setProfile] = useState(null);
  const [contributions, setContributions] = useState(initialContributionsData);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const { language, t } = useLanguage();

  const easeCurve = [0.16, 1, 0.3, 1];

  const getFadeMotion = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-50px' },
      transition: { duration: 0.5, delay, ease: easeCurve },
    };
  };

  const loadData = useCallback(async (force = false) => {
    if (force) {
      setRefreshing(true);
      clearGithubCache();
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchGithubData({ force });
      setProfile(result.data.profile);
      if (result.data.contributions?.days?.length > 0) {
        setContributions(result.data.contributions);
      }
      setFromCache(result.fromCache);
    } catch (err) {
      setError({
        code: err.code || 'UNKNOWN',
        message: err.message,
        remaining: err.remaining,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleRetry = () => {
    loadData(true);
  };

  // Group days into columns of 7 days (Sunday to Saturday)
  const weeks = useMemo(() => {
    const list = contributions.days || [];
    const grouped = [];
    for (let i = 0; i < list.length; i += 7) {
      grouped.push(list.slice(i, i + 7));
    }
    return grouped;
  }, [contributions.days]);

  // Compute month position headers
  const monthHeaders = useMemo(() => {
    const headers = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      for (const day of week) {
        if (!day?.date) continue;
        const m = new Date(day.date).getUTCMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const monthName = (MONTH_LABELS[language] || MONTH_LABELS.id)[m];
          headers.push({ colIdx, label: monthName });
          break;
        }
      }
    });
    return headers;
  }, [weeks, language]);

  // GitHub official contribution levels
  const getCellClass = (level = 0) => {
    switch (level) {
      case 1:
        return 'bg-[#0e4429] border border-[#006d32]/40 hover:border-[#39d353]';
      case 2:
        return 'bg-[#006d32] border border-[#26a641]/50 hover:border-[#39d353]';
      case 3:
        return 'bg-[#26a641] border border-[#39d353]/60 hover:border-[#39d353]';
      case 4:
        return 'bg-[#39d353] border border-[#39d353] hover:ring-1 hover:ring-[#39d353]';
      default:
        return 'bg-[var(--surface-alt)] border border-[var(--border-subtle)] hover:border-[var(--border)]';
    }
  };

  const formatDayTooltip = (day) => {
    if (!day) return '';
    const dateFormatted = formatRepoDate(day.date, language);
    if (day.count > 0) {
      return language === 'id'
        ? `${day.count} kontribusi pada ${dateFormatted}`
        : `${day.count} contribution${day.count > 1 ? 's' : ''} on ${dateFormatted}`;
    }
    return language === 'id'
      ? `Tidak ada kontribusi pada ${dateFormatted}`
      : `No contributions on ${dateFormatted}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 text-[var(--text-primary)]">
      {/* ==================================================
          SECTION HEADER: 06 / GITHUB ACTIVITY
          ================================================== */}
      <motion.header {...getFadeMotion(0)} className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent)] uppercase">
            {t('github.sectionTag')}
          </span>
          <span className="h-px w-8 bg-[var(--border)]" aria-hidden="true" />
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
            {t('github.subTag')}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <h2 className="font-grotesk font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] uppercase leading-none">
            {t('github.heading')}
            <span className="text-[var(--accent)]">.</span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {t('github.intro')}
          </p>
        </div>
      </motion.header>

      {/* ==================================================
          LOADING SKELETON STATE
          ================================================== */}
      {loading && !profile && (
        <div className="space-y-8 animate-pulse" aria-busy="true" aria-label={t('github.loading')}>
          {/* Overview Banner Skeleton */}
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-alt)]" />
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-[var(--surface-alt)] rounded" />
                  <div className="h-3 w-24 bg-[var(--surface-alt)] rounded" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-10 w-20 bg-[var(--surface-alt)] rounded" />
                <div className="h-10 w-20 bg-[var(--surface-alt)] rounded" />
                <div className="h-10 w-20 bg-[var(--surface-alt)] rounded" />
                <div className="h-10 w-20 bg-[var(--surface-alt)] rounded" />
              </div>
            </div>
          </div>

          {/* Calendar Skeleton */}
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8 h-64" />
        </div>
      )}

      {/* ==================================================
          ERROR / RATE-LIMIT STATE
          ================================================== */}
      {!loading && error && (
        <motion.div
          {...getFadeMotion(0.1)}
          className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-6 sm:p-8 space-y-6"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-md bg-[var(--surface-alt)] text-[var(--accent)] border border-[var(--border-subtle)] shrink-0">
              <FiAlertCircle size={24} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] uppercase">
                  {error.code === 'RATE_LIMIT' ? 'HTTP 403 // RATE LIMIT' : 'API DISPATCH ERROR'}
                </span>
              </div>
              <h3 className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)]">
                {error.code === 'RATE_LIMIT'
                  ? t('github.rateLimitHeading')
                  : t('github.errorHeading')}
              </h3>
              <p className="font-sans text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {error.code === 'RATE_LIMIT'
                  ? t('github.rateLimitMessage')
                  : t('github.errorMessage')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleRetry}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <FiRefreshCw
                size={14}
                className={refreshing ? 'animate-spin text-[var(--accent)]' : ''}
                aria-hidden="true"
              />
              <span>{t('github.retry')}</span>
            </button>

            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('github.viewProfileAria')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-mono text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <SiGithub size={14} aria-hidden="true" />
              <span>{t('github.visitDirectly')}</span>
              <FiExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      )}

      {/* ==================================================
          MAIN CONTENT (SUCCESS STATE)
          ================================================== */}
      {(!loading || profile) && !error && (
        <div className="space-y-8 md:space-y-10">
          {/* ==============================================
              1. Profile & Statistics Banner
              ============================================== */}
          <motion.div
            {...getFadeMotion(0.1)}
            className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile Bio & Handle */}
              <div className="flex items-center gap-4 sm:gap-5">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.login}
                    width={64}
                    height={64}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[var(--border)] object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--surface-alt)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0">
                    <SiGithub size={28} aria-hidden="true" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)]">
                      {profile?.name || 'M. Ghifari Bima Khadafi'}
                    </span>
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                      @{profile?.login || 'IGhifari'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                      {t('github.verifiedBadge')}
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)]">
                      {fromCache ? t('github.cachedBadge') : t('github.liveBadge')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Counters & Actions */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)]">
                {/* Verified Contributions */}
                <div className="space-y-0.5 min-w-[70px]">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-emerald-400">
                    {contributions?.total ? `${contributions.total}+` : '869+'}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <FiActivity size={11} className="text-emerald-400" aria-hidden="true" />
                    <span>{t('github.stats.contributions')}</span>
                  </div>
                </div>

                {/* Repos Count */}
                <div className="space-y-0.5 min-w-[70px]">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                    {profile?.publicRepos != null ? profile.publicRepos : '22'}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <FiFolder size={11} aria-hidden="true" />
                    <span>{t('github.stats.repos')}</span>
                  </div>
                </div>

                {/* Followers Count */}
                <div className="space-y-0.5 min-w-[70px]">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                    {profile?.followers != null ? profile.followers : '22'}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <FiUsers size={11} aria-hidden="true" />
                    <span>{t('github.stats.followers')}</span>
                  </div>
                </div>

                {/* Following Count */}
                <div className="space-y-0.5 min-w-[70px]">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                    {profile?.following != null ? profile.following : '23'}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                    <FiUsers size={11} aria-hidden="true" />
                    <span>{t('github.stats.following')}</span>
                  </div>
                </div>

                {/* Profile Link Button & Refresh */}
                <div className="flex items-center gap-2 ml-auto lg:ml-2">
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    title={t('github.refreshAria')}
                    aria-label={t('github.refreshAria')}
                    data-cursor-label="Refresh"
                    className="cursor-target h-9 w-9 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    <FiRefreshCw
                      size={14}
                      className={refreshing ? 'animate-spin text-[var(--accent)]' : ''}
                      aria-hidden="true"
                    />
                  </button>

                  <a
                    href={profile?.profileUrl || GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('github.viewProfileAria')}
                    data-cursor-label="Profile"
                    className="cursor-target inline-flex items-center gap-2 h-9 px-3.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  >
                    <SiGithub size={14} aria-hidden="true" />
                    <span>{t('github.viewProfile')}</span>
                    <FiExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ==============================================
              2. GitHub Contribution Calendar Heatmap
              ============================================== */}
          <motion.div
            {...getFadeMotion(0.15)}
            className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-emerald-400" size={16} aria-hidden="true" />
                  <h3 className="font-grotesk font-black text-xl text-[var(--text-primary)] uppercase tracking-tight">
                    {t('github.calendarHeading')}
                  </h3>
                </div>
                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t('github.calendarSub')}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--surface-alt)] border border-[var(--border-subtle)] font-mono text-xs text-emerald-400 font-semibold self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>
                  {contributions?.total || 869} {t('github.totalContributionsLabel')}
                </span>
              </div>
            </div>

            {/* Heatmap Grid Container with Horizontal Scroll */}
            <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
              <div className="min-w-[760px] inline-block">
                {/* Month labels row */}
                <div className="flex items-center ml-8 mb-2 font-mono text-[10px] text-[var(--text-muted)] select-none h-4 relative">
                  {monthHeaders.map((m, idx) => (
                    <span
                      key={`${m.label}-${idx}`}
                      className="absolute"
                      style={{ left: `${m.colIdx * 14}px` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* Day labels + Week columns matrix */}
                <div className="flex gap-2">
                  {/* Day of week labels (Sun..Sat, showing Mon, Wed, Fri) */}
                  <div className="flex flex-col justify-between py-[1px] font-mono text-[9px] text-[var(--text-muted)] select-none w-6 shrink-0 leading-none h-[98px]">
                    {(DAY_LABELS[language] || DAY_LABELS.id).map((dayLabel, idx) => (
                      <span key={idx} className="h-3 flex items-center">
                        {dayLabel}
                      </span>
                    ))}
                  </div>

                  {/* 53 Columns of 7 days (Sunday = row 0, Saturday = row 6) */}
                  <div
                    className="grid grid-rows-7 grid-flow-col gap-[3px]"
                    role="grid"
                    aria-label={`GitHub contribution heatmap for IGhifari (${contributions?.total || 869} contributions)`}
                  >
                    {contributions.days.map((day, idx) => {
                      const tooltipText = formatDayTooltip(day);
                      return (
                        <div
                          key={day.date || idx}
                          role="gridcell"
                          tabIndex={0}
                          title={tooltipText}
                          aria-label={tooltipText}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          onFocus={() => setHoveredDay(day)}
                          onBlur={() => setHoveredDay(null)}
                          className={`w-[11px] h-[11px] rounded-[2px] transition-transform duration-100 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${getCellClass(
                            day.level
                          )}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover preview bar + Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-muted)]">
              {/* Active hover info badge */}
              <div className="min-h-[1.5rem] flex items-center">
                {hoveredDay ? (
                  <span className="text-[var(--text-primary)] font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                    {formatDayTooltip(hoveredDay)}
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)] text-[11px]">
                    {language === 'id'
                      ? 'Arahkan kursor pada kotak untuk melihat detail komit per hari.'
                      : 'Hover over squares to inspect daily commit activity.'}
                  </span>
                )}
              </div>

              {/* Legend: Less -> More */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px]">
                <span>{t('github.legendLess')}</span>
                <div className="flex items-center gap-1" aria-hidden="true">
                  <div
                    className="w-3 h-3 rounded-[2px] bg-[var(--surface-alt)] border border-[var(--border-subtle)]"
                    title="Level 0: No contributions"
                  />
                  <div
                    className="w-3 h-3 rounded-[2px] bg-[#0e4429] border border-[#006d32]/40"
                    title="Level 1: 1-3 contributions"
                  />
                  <div
                    className="w-3 h-3 rounded-[2px] bg-[#006d32] border border-[#26a641]/50"
                    title="Level 2: 4-9 contributions"
                  />
                  <div
                    className="w-3 h-3 rounded-[2px] bg-[#26a641] border border-[#39d353]/60"
                    title="Level 3: 10-19 contributions"
                  />
                  <div
                    className="w-3 h-3 rounded-[2px] bg-[#39d353] border border-[#39d353]"
                    title="Level 4: 20+ contributions"
                  />
                </div>
                <span>{t('github.legendMore')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GithubActivity;
