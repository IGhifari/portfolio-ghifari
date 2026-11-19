import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle,
  FiFolder,
  FiUsers,
  FiActivity,
  FiCalendar,
  FiZap,
} from 'react-icons/fi';
import { SiGithub } from 'react-icons/si';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchGithubData,
  clearGithubCache,
  formatRepoDate,
  calculateContributionStats,
  GITHUB_PROFILE_URL,
} from '../services/githubService';
import { initialContributionsData } from '../data/githubContributions';
import { siteConfig } from '../config/site';

const GITHUB_AVATAR_URL = `https://avatars.githubusercontent.com/${siteConfig.author.githubUsername}?v=4`;

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
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [profile?.avatarUrl]);

  // Roving TabIndex for keyboard accessibility (CRIT-01)
  const gridCellsRef = useRef([]);
  const [focusedDayIndex, setFocusedDayIndex] = useState(() => (
    contributions?.days?.length > 0 ? contributions.days.length - 1 : 0
  ));

  useEffect(() => {
    if (contributions?.days?.length > 0) {
      setFocusedDayIndex((prev) => {
        if (prev < 0 || prev >= contributions.days.length) {
          return contributions.days.length - 1;
        }
        return prev;
      });
    }
  }, [contributions?.days]);

  const handleCellKeyDown = (e, index) => {
    const total = contributions?.days?.length || 0;
    if (total === 0) return;

    let targetIndex = null;

    switch (e.key) {
      case 'ArrowDown':
        // Down 1 day in the week column
        targetIndex = Math.min(total - 1, index + 1);
        break;
      case 'ArrowUp':
        // Up 1 day in the week column
        targetIndex = Math.max(0, index - 1);
        break;
      case 'ArrowRight':
        // Next week (+7 days)
        targetIndex = Math.min(total - 1, index + 7);
        break;
      case 'ArrowLeft':
        // Previous week (-7 days)
        targetIndex = Math.max(0, index - 7);
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = total - 1;
        break;
      default:
        return;
    }

    if (targetIndex !== null && targetIndex !== index) {
      e.preventDefault();
      setFocusedDayIndex(targetIndex);
      const targetDay = contributions.days[targetIndex];
      setHoveredDay(targetDay);
      gridCellsRef.current[targetIndex]?.focus();
    }
  };

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

  // Derived contribution activity & streak metrics
  const stats = useMemo(() => {
    return calculateContributionStats(contributions?.days);
  }, [contributions?.days]);

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
        <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('github.loading')}>
          {/* Overview Bento Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-alt)]" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-[var(--surface-alt)] rounded" />
                  <div className="h-3 w-28 bg-[var(--surface-alt)] rounded" />
                </div>
              </div>
              <div className="h-10 bg-[var(--surface-alt)] rounded w-full mt-4" />
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-5 h-28" />
              <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-5 h-28" />
              <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-5 h-28" />
              <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-5 h-28" />
            </div>
          </div>

          {/* Calendar Skeleton */}
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-xl p-6 sm:p-8 h-64" />
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
              aria-label={`${t('github.viewProfileAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-mono text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <SiGithub size={14} aria-hidden="true" />
              <span>{t('github.visitDirectly')}</span>
              <FiExternalLink size={13} aria-hidden="true" />
              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
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
              1. Profile & Metric Highlights Bento Grid
              ============================================== */}
          <motion.div {...getFadeMotion(0.1)} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Developer Profile Bento Card (7 cols) */}
            <div className="lg:col-span-7 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-sm group">
              {/* Subtle ambient radial glow */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-60"
                aria-hidden="true"
              />

              <div>
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Avatar with Status Ring (strictly from GitHub API / GitHub Avatar CDN) */}
                  <div className="relative shrink-0">
                    {!avatarFailed ? (
                      <img
                        src={profile?.avatarUrl || GITHUB_AVATAR_URL}
                        alt={profile?.name || siteConfig.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--border)] object-cover shadow-sm bg-[var(--surface-alt)]"
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src !== GITHUB_AVATAR_URL) {
                            e.currentTarget.src = GITHUB_AVATAR_URL;
                          } else {
                            setAvatarFailed(true);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-center shadow-sm"
                        aria-label={profile?.name || siteConfig.name}
                      >
                        <SiGithub size={28} className="text-[var(--text-secondary)]" aria-hidden="true" />
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--surface-muted)] ring-1 ring-emerald-400/40"
                      title={t('github.verifiedBadge')}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Profile Name, Username, Badges */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-grotesk font-black text-xl sm:text-2xl text-[var(--text-primary)]">
                        {profile?.name || siteConfig.name}
                      </span>
                      <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                        @{profile?.login || siteConfig.author.githubUsername}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[var(--text-secondary)] px-2.5 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border-subtle)] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                        {t('github.verifiedBadge')}
                      </span>

                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[var(--text-muted)] px-2.5 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border-subtle)] font-medium">
                        {fromCache ? t('github.cachedBadge') : t('github.liveBadge')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio / Summary */}
                <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-4">
                  {profile?.bio ||
                    (language === 'id'
                      ? 'Pengembang Full-Stack yang aktif membangun aplikasi web modern, performan tinggi, dan antarmuka digital yang mudah diakses.'
                      : 'Full-Stack Developer actively building modern, high-performance web systems and accessible digital experiences.')}
                </p>
              </div>

              {/* Actions: Direct GitHub Profile & Refresh Button */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <a
                  href={profile?.profileUrl || GITHUB_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('github.viewProfileAria')} (${t('nav.opensNewTab') || 'opens in a new tab'})`}
                  data-cursor-label="Profile"
                  className="cursor-target inline-flex items-center gap-2.5 px-5 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--accent)] font-mono text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <SiGithub size={14} aria-hidden="true" />
                  <span>{t('github.viewProfile')}</span>
                  <FiExternalLink size={13} aria-hidden="true" />
                  <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                </a>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  title={t('github.refreshAria')}
                  aria-label={t('github.refreshAria')}
                  data-cursor-label="Refresh"
                  className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                  <FiRefreshCw
                    size={13}
                    className={refreshing ? 'animate-spin text-[var(--accent)]' : ''}
                    aria-hidden="true"
                  />
                  <span>{t('github.refresh')}</span>
                </button>
              </div>
            </div>

            {/* Metric Highlights 2x2 Bento Grid (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              {/* Metric 1: Annual Contributions */}
              <div className="bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {t('github.stats.contributions')}
                  </span>
                  <FiActivity size={15} className="text-emerald-400" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-emerald-400 tracking-tight">
                    {contributions?.total ?? initialContributionsData.total}
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 truncate">
                    {t('github.totalContributionsLabel')}
                  </p>
                </div>
              </div>

              {/* Metric 2: Live Active Streak & Longest Streak */}
              <div className="bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {t('github.stats.currentStreak')}
                  </span>
                  <FiZap size={15} className={stats.currentStreak > 0 ? 'text-amber-400 animate-pulse' : 'text-[var(--text-muted)]'} aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
                    {stats.currentStreak}{' '}
                    <span className="text-xs font-mono font-normal text-[var(--text-muted)]">
                      {t('github.stats.daysLabel')}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 truncate">
                    {language === 'id'
                      ? `Terpanjang: ${stats.longestStreak} ${t('github.stats.daysLabel')} · ${stats.activeDays} aktif`
                      : `Longest: ${stats.longestStreak} ${t('github.stats.daysLabel')} · ${stats.activeDays} active`}
                  </p>
                </div>
              </div>

              {/* Metric 3: Public Repositories */}
              <div className="bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {t('github.stats.repos')}
                  </span>
                  <FiFolder size={15} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
                    {profile?.publicRepos != null ? profile.publicRepos : '22'}
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 truncate">
                    {t('github.stats.reposSub')}
                  </p>
                </div>
              </div>

              {/* Metric 4: Followers / Network */}
              <div className="bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {t('github.stats.followers')}
                  </span>
                  <FiUsers size={15} className="text-sky-400" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <div className="font-grotesk font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
                    {profile?.followers != null ? profile.followers : '22'}
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 truncate">
                    {profile?.following != null
                      ? `${profile.following} ${t('github.stats.following')}`
                      : '23 following'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ==============================================
              2. GitHub Contribution Calendar Heatmap Bento Window
              ============================================== */}
          <motion.div
            {...getFadeMotion(0.15)}
            className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm"
          >
            {/* macOS Window Header Frame */}
            <div className="px-4 py-3 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[var(--text-muted)] tracking-wider">
                  git log --graph --oneline // {siteConfig.author.githubUsername.toLowerCase()}/contributions
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border-subtle)] font-mono text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>
                  {contributions?.total || initialContributionsData.total} {t('github.totalContributionsLabel')}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
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
                      aria-label={
                        language === 'id'
                          ? `Kalender kontribusi GitHub untuk ${siteConfig.author.githubUsername} (${contributions?.total || initialContributionsData.total} kontribusi). Gunakan tombol panah untuk berpindah hari.`
                          : `GitHub contribution heatmap for ${siteConfig.author.githubUsername} (${contributions?.total || initialContributionsData.total} contributions). Use arrow keys to navigate days.`
                      }
                    >
                      {contributions.days.map((day, idx) => {
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
                            className={`w-[11px] h-[11px] rounded-[2px] hover:scale-125 hover:z-20 transition-all duration-150 cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:z-10 ${getCellClass(
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)] font-mono text-xs">
                {/* Active hover info badge */}
                <div className="min-h-[2rem] flex items-center">
                  {hoveredDay ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs font-semibold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                      <span>{formatDayTooltip(hoveredDay)}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-alt)]/60 border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono text-[11px]">
                      <FiCalendar size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
                      <span>
                        {language === 'id'
                          ? 'Arahkan kursor atau navigasi dengan tombol panah untuk inspeksi komit harian.'
                          : 'Hover over squares or use arrow keys to inspect daily commits.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Legend: Less -> More */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px]">
                  <span className="text-[var(--text-muted)]">{t('github.legendLess')}</span>
                  <div
                    className="flex items-center gap-1.5 p-1 rounded-md bg-[var(--surface-alt)] border border-[var(--border-subtle)]"
                    aria-hidden="true"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-[2px] bg-[var(--surface-alt)] border border-[var(--border-subtle)]"
                      title="Level 0: No contributions"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-[2px] bg-[#0e4429] border border-[#006d32]/40"
                      title="Level 1: 1-3 contributions"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-[2px] bg-[#006d32] border border-[#26a641]/50"
                      title="Level 2: 4-9 contributions"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-[2px] bg-[#26a641] border border-[#39d353]/60"
                      title="Level 3: 10-19 contributions"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353] border border-[#39d353]"
                      title="Level 4: 20+ contributions"
                    />
                  </div>
                  <span className="text-[var(--text-muted)]">{t('github.legendMore')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GithubActivity;
