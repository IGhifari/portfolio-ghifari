import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FiCornerDownLeft,
  FiTrash2,
  FiExternalLink,
  FiCheck,
  FiCopy,
  FiCode,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiMail,
  FiCompass,
  FiX,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useRouter } from '../context/RouterContext';
import { siteConfig } from '../config/site';
import {
  executeTerminalCommand,
  parseCommandLine,
} from '../utils/terminalCommands';
import { getCachedGithubData, fetchGithubData } from '../services/githubService';

const QUICK_COMMAND_CHIPS = [
  'help',
  'projects',
  'skills',
  'experience',
  'github',
  'contact',
  'whoami',
  'clear',
  'exit',
];

const DeveloperTerminal = () => {
  const { language, t } = useLanguage();
  const { setPreviewMonth } = useTheme();
  const { route, navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [outputList, setOutputList] = useState(() => [
    {
      id: 'initial-welcome',
      type: 'welcome',
    },
  ]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [githubData, setGithubData] = useState(() => getCachedGithubData());

  useEffect(() => {
    const cached = getCachedGithubData();
    if (cached) {
      setGithubData(cached);
    } else {
      fetchGithubData()
        .then((res) => {
          if (res?.data) {
            setGithubData(res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const savedDraftRef = useRef('');
  const outputContainerRef = useRef(null);
  const inputRef = useRef(null);
  const modalWindowRef = useRef(null);
  const lastTriggerRef = useRef(null);

  const easeCurve = [0.16, 1, 0.3, 1];

  // Safe navigation handler for in-page anchors and SPA routes
  const handleTerminalNavigate = useCallback(
    (url, dest) => {
      if (!url) return;

      if (dest?.type === 'route' || url.startsWith('/')) {
        navigate(url);
        setIsOpen(false);
        return;
      }

      if (url.startsWith('#')) {
        const anchorId = url.replace(/^#/, '');
        setIsOpen(false);
        if (route?.type !== 'home') {
          navigate(`/${url}`);
        } else {
          setTimeout(() => {
            const el = document.getElementById(anchorId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              try {
                window.history.replaceState(null, '', url);
              } catch {
                // Ignore replaceState issues in restricted contexts
              }
            }
          }, 120);
        }
      }
    },
    [navigate, route?.type]
  );

  // Trap focus inside terminal window, manage initial focus, Escape key, and restore focus on close
  useFocusTrap({
    isOpen,
    containerRef: modalWindowRef,
    initialFocusRef: inputRef,
    triggerRef: lastTriggerRef,
    onClose: () => setIsOpen(false),
  });

  // Global shortcut handler (Ctrl+J / Cmd+J) and custom event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        if (!isOpen && typeof document !== 'undefined' && document.activeElement && document.activeElement !== document.body) {
          lastTriggerRef.current = document.activeElement;
        }
        setIsOpen((prev) => !prev);
      }
    };

    const handleOpenEvent = (e) => {
      if (e?.detail?.trigger) {
        lastTriggerRef.current = e.detail.trigger;
      } else if (typeof document !== 'undefined' && document.activeElement && document.activeElement !== document.body) {
        lastTriggerRef.current = document.activeElement;
      }
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('open-developer-terminal', handleOpenEvent);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-developer-terminal', handleOpenEvent);
    };
  }, [isOpen]);

  // Lock body scroll and manage focus when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Auto-scroll output container on new logs
  useEffect(() => {
    if (isOpen) {
      const el = outputContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [outputList, isOpen]);

  // Command execution dispatcher
  const runCommand = useCallback(
    (commandString) => {
      const trimmed = (commandString || '').trim();
      if (!trimmed) return;

      const { command } = parseCommandLine(trimmed);

      // Add to command history
      setHistory((prev) => {
        if (prev[prev.length - 1] === trimmed) return prev;
        return [...prev, trimmed];
      });
      setHistoryIndex(-1);
      savedDraftRef.current = '';

      if (command === 'exit') {
        setIsOpen(false);
        setInputVal('');
        return;
      }

      if (command === 'clear') {
        setOutputList([
          {
            id: `cleared-${Date.now()}`,
            type: 'system',
            message: t('terminal.emptyHistoryNotice'),
          },
        ]);
        setInputVal('');
        return;
      }

      const currentGithub = githubData || getCachedGithubData();
      const result = executeTerminalCommand(trimmed, {
        language,
        t,
        onNavigate: handleTerminalNavigate,
        githubData: currentGithub,
      });

      if (result.type === 'season') {
        setPreviewMonth(result.month);
      }

      setOutputList((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          rawInput: trimmed,
          ...result,
        },
      ]);

      setInputVal('');
    },
    [handleTerminalNavigate, language, t, githubData, setPreviewMonth]
  );

  // Keyboard navigation for command history (Up / Down) and Enter execution
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(inputVal);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      if (historyIndex === -1) {
        savedDraftRef.current = inputVal;
        const newIdx = history.length - 1;
        setHistoryIndex(newIdx);
        setInputVal(history[newIdx]);
      } else if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInputVal(history[newIdx]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      if (historyIndex < history.length - 1) {
        const newIdx = historyIndex + 1;
        setHistoryIndex(newIdx);
        setInputVal(history[newIdx]);
      } else {
        setHistoryIndex(-1);
        setInputVal(savedDraftRef.current || '');
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setOutputList([
      {
        id: `cleared-${Date.now()}`,
        type: 'system',
        message: t('terminal.emptyHistoryNotice'),
      },
    ]);
  };

  const copyToClipboard = (text, key) => {
    if (!navigator?.clipboard?.writeText) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch(() => {});
  };

  const handleBackdropClick = (e) => {
    if (modalWindowRef.current && !modalWindowRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-[var(--modal-backdrop)] backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t('terminal.heading')}
        >
          <motion.div
              ref={modalWindowRef}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 14 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: easeCurve }}
              className={`rounded-2xl border border-[var(--terminal-border)] ring-1 ring-black/40 bg-[var(--terminal-bg)] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.75)] overflow-hidden font-mono text-xs sm:text-sm flex flex-col transition-all duration-200 ${
                isMaximized ? 'w-full h-[90vh]' : 'w-full max-w-2xl max-h-[85vh]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (
                  document.activeElement?.tagName !== 'INPUT' &&
                  document.activeElement?.tagName !== 'BUTTON' &&
                  document.activeElement?.tagName !== 'A'
                ) {
                  inputRef.current?.focus();
                }
              }}
            >
              {/* Terminal Window Bar (macOS Dots Style) */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--terminal-header)] border-b border-[var(--terminal-border)] select-none shrink-0">
                {/* Mac-style Window Action Dots with expanded touch targets (MED-01) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    data-cursor-label="Close"
                    className="cursor-target group relative w-7 h-7 sm:w-6 sm:h-6 -m-1 rounded-md flex items-center justify-center hover:bg-white/5 cursor-pointer touch-manipulation after:content-[''] after:absolute after:-inset-2 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5f56]"
                    title="Close (Esc)"
                    aria-label="Close terminal window"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e] group-hover:brightness-110 pointer-events-none" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="group relative w-7 h-7 sm:w-6 sm:h-6 -m-1 rounded-md flex items-center justify-center hover:bg-white/5 cursor-pointer touch-manipulation after:content-[''] after:absolute after:-inset-2 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbd2e]"
                    title="Minimize"
                    aria-label="Minimize terminal window"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123] group-hover:brightness-110 pointer-events-none" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMaximized((prev) => !prev)}
                    className="group relative w-7 h-7 sm:w-6 sm:h-6 -m-1 rounded-md flex items-center justify-center hover:bg-white/5 cursor-pointer touch-manipulation after:content-[''] after:absolute after:-inset-2 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#27c93f]"
                    title={isMaximized ? 'Restore size' : 'Maximize size'}
                    aria-label="Toggle terminal full size"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29] group-hover:brightness-110 pointer-events-none" aria-hidden="true" />
                  </button>
                </div>

                {/* Window Title matching Image 2 */}
                <div className="flex items-center gap-2 min-w-0 px-2.5 py-1 rounded-md bg-[var(--terminal-bg)] border border-[var(--terminal-border)]">
                  <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[var(--terminal-muted)] font-mono text-[11px] font-semibold truncate">
                    {siteConfig.terminal.user}@{siteConfig.terminal.host}: ~
                  </span>
                  <span className="hidden sm:inline text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--terminal-muted)] px-1.5 py-px rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)] shrink-0">
                    zsh
                  </span>
                </div>

                {/* Window Controls with expanded touch targets (MED-01) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsMaximized((prev) => !prev)}
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--terminal-text)] transition-colors rounded relative after:content-[''] after:absolute after:-inset-1.5 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                    title={isMaximized ? 'Restore' : 'Maximize'}
                    aria-label={isMaximized ? 'Restore window size' : 'Maximize window size'}
                  >
                    {isMaximized ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    data-cursor-label="Clear"
                    className="cursor-target w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-rose-400 transition-colors rounded relative after:content-[''] after:absolute after:-inset-1.5 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                    title={t('terminal.clearAria')}
                    aria-label={t('terminal.clearAria')}
                  >
                    <FiTrash2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--terminal-text)] transition-colors rounded relative after:content-[''] after:absolute after:-inset-1.5 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    title={t('terminal.closeTerminal')}
                    aria-label={t('terminal.closeTerminal')}
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </div>

              {/* Terminal Output Area */}
              <div
                ref={outputContainerRef}
                role="region"
                aria-live="polite"
                aria-atomic="false"
                aria-label="Terminal output log"
                tabIndex={0}
                className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 text-[var(--terminal-text)] scroll-smooth focus-visible:outline-none min-h-[240px]"
              >
                {outputList.map((entry) => (
                  <div key={entry.id} className="space-y-2">
                    {/* Echo prompt for command execution matching Image 2 (→ ~ cmd) */}
                    {entry.rawInput && (
                      <div className="flex items-center gap-2 font-mono pt-1 text-xs sm:text-sm">
                        <span className="text-[#ff5f56] font-bold">→</span>
                        <span className="text-[var(--accent)] font-semibold">~</span>
                        <span className="text-[var(--terminal-text)] font-normal ml-0.5">{entry.rawInput}</span>
                      </div>
                    )}

                    {/* Welcome Banner matching Image 2 */}
                    {entry.type === 'welcome' && (
                      <div className="space-y-1 py-1 text-xs sm:text-sm font-mono text-[var(--terminal-muted)]">
                        <div className="font-semibold text-[var(--terminal-text)]">Welcome to {siteConfig.terminal.osName} {siteConfig.terminal.version}</div>
                        <div className="text-[var(--terminal-muted)]">
                          {language === 'id' ? "Ketik 'help' untuk melihat daftar perintah." : "Type 'help' for a list of commands."}
                        </div>
                      </div>
                    )}

                    {entry.type === 'system' && (
                      <div className="text-xs text-[var(--text-muted)] italic py-1 font-mono">
                        {`# ${entry.message}`}
                      </div>
                    )}

                    {entry.type === 'help' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          {`// ${language === 'id' ? 'Daftar Perintah Tersedia' : 'Available Commands'}`}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {entry.commands.map((c) => (
                            <button
                              key={c.cmd}
                              type="button"
                              onClick={() => runCommand(c.cmd.split(' ')[0])}
                              className="flex items-start gap-2.5 p-2 rounded bg-[var(--terminal-surface)]/70 hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] hover:border-[var(--accent)] text-left transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                            >
                              <span className="font-bold text-[var(--accent)] group-hover:underline shrink-0">
                                {c.cmd}
                              </span>
                              <span className="text-[var(--text-secondary)] text-[11px] leading-tight">
                                {c.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                        {entry.note && (
                          <div className="text-[11px] text-[var(--text-muted)] pt-1">
                            {entry.note}
                          </div>
                        )}
                      </div>
                    )}

                    {entry.type === 'about' && (
                      <div className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-2.5 text-xs">
                        <div className="flex items-center gap-2 text-[var(--terminal-text)] font-bold text-sm">
                          <FiUser className="text-[var(--accent)]" aria-hidden="true" />
                          <span>{entry.name}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[var(--text-muted)]">{language === 'id' ? 'Peran:' : 'Role:'} </span>
                            <span className="text-[var(--accent)] font-semibold">{entry.role}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">{language === 'id' ? 'Lokasi:' : 'Location:'} </span>
                            <span className="text-[var(--terminal-text)]">{entry.location}</span>
                          </div>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {entry.summary}
                        </p>
                        <div className="pt-2 border-t border-[var(--terminal-border)] space-y-1">
                          <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                            {language === 'id' ? 'Fokus Keahlian:' : 'Core Engineering Focus:'}
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-0.5">
                            {entry.focus.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {entry.type === 'projects' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--accent)] uppercase tracking-wider">
                            {`// ${language === 'id' ? 'Proyek Terverifikasi' : 'Verified Projects'} (${entry.count})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => runCommand('open study-case')}
                            className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          >
                            <span>{t('terminal.viewCaseStudyCta')}</span>
                            <FiExternalLink size={10} aria-hidden="true" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {entry.projects.map((p) => (
                            <div
                              key={p.id}
                              className="p-3 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-2 hover:border-[var(--terminal-border)] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => runCommand(`project ${p.id}`)}
                                  className="font-bold text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                >
                                  {p.title}
                                </button>
                                <span className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] font-mono shrink-0">
                                  {p.id}
                                </span>
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                {p.category}
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                {p.summary}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {p.tags.map((tTag) => (
                                  <span
                                    key={tTag}
                                    className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px]"
                                  >
                                    {tTag}
                                  </span>
                                ))}
                              </div>
                              <div className="pt-1 flex items-center gap-3 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => runCommand(`project ${p.id}`)}
                                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                >
                                  <span>project {p.id}</span>
                                </button>
                                <span className="text-neutral-700">|</span>
                                <button
                                  type="button"
                                  onClick={() => runCommand(`open ${p.id}`)}
                                  className="text-[var(--terminal-muted)] hover:text-[var(--terminal-text)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                >
                                  <span>open {p.id}</span>
                                  <FiCompass size={10} aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] pt-1 italic">
                          {entry.tip}
                        </div>
                      </div>
                    )}

                    {entry.type === 'project-detail' && (
                      <div className="p-4 rounded-xl bg-white/[0.025] border border-[var(--terminal-border)] space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-3 pb-2 border-b border-[var(--terminal-border)]">
                          <div>
                            <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                              {entry.category}
                            </div>
                            <h3 className="text-base font-bold text-[var(--terminal-text)] mt-0.5">
                              {entry.title}
                            </h3>
                            {entry.subtitle && (
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {entry.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[11px] text-[var(--accent)] font-mono shrink-0">
                            slug: {entry.slug}
                          </span>
                        </div>

                        {entry.description && (
                          <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                            {entry.description}
                          </p>
                        )}

                        <div className="space-y-2 text-xs">
                          {entry.problem && (
                            <div>
                              <span className="text-[var(--accent)] font-bold">{language === 'id' ? 'Tantangan: ' : 'Problem: '}</span>
                              <span className="text-[var(--text-secondary)]">{entry.problem}</span>
                            </div>
                          )}
                          {entry.solution && (
                            <div>
                              <span className="text-emerald-400 font-bold">{language === 'id' ? 'Solusi: ' : 'Solution: '}</span>
                              <span className="text-[var(--text-secondary)]">{entry.solution}</span>
                            </div>
                          )}
                          {entry.architecture && (
                            <div>
                              <span className="text-cyan-400 font-bold">{language === 'id' ? 'Arsitektur: ' : 'Architecture: '}</span>
                              <span className="text-[var(--text-secondary)]">{entry.architecture}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.technologies.map((tTag) => (
                            <span
                              key={tTag}
                              className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)]"
                            >
                              {tTag}
                            </span>
                          ))}
                        </div>

                        {entry.isConfidential ? (
                          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                            ⚠ {entry.confidentialNotice}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                            {entry.github && (
                              <a
                                href={entry.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                              >
                                <FiCode size={12} aria-hidden="true" />
                                <span>GitHub</span>
                                <FiExternalLink size={10} aria-hidden="true" />
                                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                              </a>
                            )}
                            {entry.live && (
                              <a
                                href={entry.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                              >
                                <FiExternalLink size={12} aria-hidden="true" />
                                <span>Live Demo</span>
                                <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-[var(--terminal-border)] flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-muted)] italic">{entry.openPrompt}</span>
                          <button
                            type="button"
                            onClick={() => runCommand(`open ${entry.slug}`)}
                            className="px-2 py-1 rounded bg-[var(--terminal-surface)] hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          >
                            <span>{t('terminal.viewCaseStudyCta')}</span>
                            <FiCompass size={11} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}

                    {entry.type === 'skills' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          {`// ${language === 'id' ? 'Kategori Keahlian Teknik' : 'Technical Engineering Skills'}`}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                          {entry.categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="p-3 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[var(--terminal-text)] uppercase tracking-wider">
                                  {cat.title}
                                </span>
                                <span className="text-[var(--accent)] font-mono text-[10px]">
                                  {cat.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                                {cat.description}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {cat.skills.map((skillName) => (
                                  <span
                                    key={skillName}
                                    className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)] font-mono"
                                  >
                                    {skillName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {entry.note && (
                          <div className="text-[11px] text-[var(--text-muted)] italic pt-1">
                            {entry.note}
                          </div>
                        )}
                      </div>
                    )}

                    {entry.type === 'experience' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          {`// ${language === 'id' ? 'Pengalaman Kerja Terverifikasi' : 'Verified Work Experience'}`}
                        </div>
                        {entry.experiences.map((exp) => (
                          <div
                            key={exp.id}
                            className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[var(--terminal-border)]">
                              <div>
                                <div className="text-sm font-bold text-[var(--terminal-text)] flex items-center gap-2">
                                  <FiBriefcase className="text-[var(--accent)]" aria-hidden="true" />
                                  <span>{exp.role}</span>
                                </div>
                                <div className="text-xs text-[var(--accent)] font-semibold mt-0.5">
                                  {exp.company}
                                </div>
                              </div>
                              <div className="text-right sm:text-right font-mono text-[11px] text-[var(--text-muted)]">
                                <div>{exp.period}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{exp.location} · {exp.type}</div>
                              </div>
                            </div>

                            <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                              {exp.description}
                            </p>

                            <div className="space-y-1">
                              <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                                {language === 'id' ? 'Tanggung Jawab & Kontribusi Terverifikasi:' : 'Verified Responsibilities & Contributions:'}
                              </div>
                              <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-1 leading-relaxed">
                                {exp.responsibilities.map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {exp.technologies.map((tTag) => (
                                <span
                                  key={tTag}
                                  className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--terminal-muted)] text-[10px] border border-[var(--terminal-border)]"
                                >
                                  {tTag}
                                </span>
                              ))}
                            </div>

                            {exp.projectRef && (
                              <div className="pt-2 border-t border-[var(--terminal-border)] flex items-center justify-between text-[11px]">
                                <span className="text-[var(--text-muted)]">
                                  {language === 'id' ? 'Proyek terkait: Project Management System' : 'Related project: Project Management System'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => runCommand(`project ${exp.projectRef}`)}
                                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                >
                                  <span>project {exp.projectRef}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.type === 'education' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          {`// ${language === 'id' ? 'Riwayat Pendidikan Formal' : 'Formal Academic History'}`}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {entry.items.map((item) => (
                            <div
                              key={item.institution}
                              className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[var(--terminal-text)] text-xs flex items-center gap-1.5">
                                  <FiBookOpen className="text-[var(--accent)]" aria-hidden="true" />
                                  <span>{item.institution}</span>
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] font-mono">
                                  {item.status}
                                </span>
                              </div>
                              <div className="text-xs text-[var(--accent)] font-semibold">
                                {item.major}
                              </div>
                              {item.faculty && (
                                <div className="text-[11px] text-[var(--text-muted)]">
                                  {item.faculty}
                                </div>
                              )}
                              <div className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--terminal-border)] flex items-center justify-between">
                                <span>{item.degree}</span>
                                <span>{item.period}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.type === 'github' && (
                      <div className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--terminal-border)]">
                          <div className="flex items-center gap-2 text-[var(--terminal-text)] font-bold text-sm">
                            <FiCode className="text-emerald-400" size={15} aria-hidden="true" />
                            <span>{entry.username}</span>
                          </div>
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-md bg-[var(--terminal-surface)] hover:bg-[var(--surface-hover)] border border-[var(--terminal-border)] text-[var(--terminal-muted)] hover:text-[var(--terminal-text)] inline-flex items-center gap-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                          >
                            <span>{entry.actionLabel}</span>
                            <FiExternalLink size={11} aria-hidden="true" />
                            <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                          </a>
                        </div>

                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {language === 'id'
                            ? `${githubData?.contributions?.total ?? entry.stats.contributions} kontribusi dalam 1 tahun terakhir, ${githubData?.profile?.publicRepos ?? entry.stats.publicRepos} repositori publik.`
                            : `${githubData?.contributions?.total ?? entry.stats.contributions} annual contributions across ${githubData?.profile?.publicRepos ?? entry.stats.publicRepos} verified public repositories.`}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
                          <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
                            <div className="text-sm font-bold text-emerald-400">{githubData?.contributions?.total ?? entry.stats.contributions}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{language === 'id' ? 'Kontribusi' : 'Contributions'}</div>
                          </div>
                          <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
                            <div className="text-sm font-bold text-[var(--terminal-text)]">{githubData?.profile?.publicRepos ?? entry.stats.publicRepos}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{language === 'id' ? 'Repositori' : 'Public Repos'}</div>
                          </div>
                          <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
                            <div className="text-sm font-bold text-[var(--terminal-text)]">{githubData?.profile?.followers ?? entry.stats.followers}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{language === 'id' ? 'Pengikut' : 'Followers'}</div>
                          </div>
                          <div className="p-2 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)]">
                            <div className="text-sm font-bold text-[var(--terminal-text)]">{githubData?.profile?.following ?? entry.stats.following}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{language === 'id' ? 'Mengikuti' : 'Following'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.type === 'contact' && (
                      <div className="p-4 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--terminal-border)]">
                          <span className="font-bold text-[var(--terminal-text)] text-xs uppercase tracking-wider">
                            {`// ${language === 'id' ? 'Saluran Kontak Resmi' : 'Verified Contact Channels'}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(entry.email, 'email')}
                            className="px-2 py-0.5 rounded bg-[var(--terminal-surface)] text-[10px] text-[var(--accent)] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          >
                            {copiedKey === 'email' ? (
                              <>
                                <FiCheck size={10} aria-hidden="true" />
                                <span>{t('terminal.copiedCta')}</span>
                              </>
                            ) : (
                              <>
                                <FiCopy size={10} aria-hidden="true" />
                                <span>{t('terminal.copyCta')} {entry.email}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <a
                            href={`mailto:${entry.email}`}
                            className="p-2 rounded bg-[var(--terminal-surface)] hover:bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[11px] flex items-center justify-between text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                          >
                            <span className="flex items-center gap-2">
                              <FiMail className="text-[var(--accent)]" aria-hidden="true" />
                              <span>Email Langsung</span>
                            </span>
                            <span className="text-[var(--text-muted)] text-[10px]">{entry.email}</span>
                          </a>

                          {entry.channels.map((ch) => (
                            <a
                              key={ch.key}
                              href={ch.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded bg-[var(--terminal-surface)] hover:bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[11px] flex items-center justify-between text-[var(--terminal-text)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                            >
                              <span className="font-semibold">{ch.name}</span>
                              <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1">
                                <span>{ch.handle}</span>
                                <FiExternalLink size={9} aria-hidden="true" />
                              </span>
                              <span className="sr-only"> ({t('nav.opensNewTab') || 'opens in a new tab'})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.type === 'whoami' && (
                      <div className="p-3.5 rounded-xl bg-[var(--terminal-surface)] border border-[var(--terminal-border)] space-y-1.5 text-xs font-mono">
                        <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
                          <FiUser size={13} aria-hidden="true" />
                          <span>{entry.user}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">{language === 'id' ? 'Peran: ' : 'Role: '}</span>
                          <span className="text-[var(--terminal-text)] font-semibold">{entry.role}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">{language === 'id' ? 'Sesi: ' : 'Session: '}</span>
                          <span>{entry.session}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">{language === 'id' ? 'Host: ' : 'Host: '}</span>
                          <span className="text-[var(--accent)]">{entry.host}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--terminal-border)]">
                          {entry.shell}
                        </div>
                      </div>
                    )}

                    {entry.type === 'date' && (
                      <div className="p-2.5 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-xs font-mono text-[var(--accent)] flex items-center gap-2">
                        <span className="text-[var(--text-muted)]">UTC/Local:</span>
                        <span className="text-[var(--terminal-text)] font-semibold">{entry.timestamp}</span>
                      </div>
                    )}

                    {entry.type === 'navigate' && (
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 font-mono">
                        <FiCompass size={13} className="animate-spin" aria-hidden="true" />
                        <span>{entry.message}</span>
                      </div>
                    )}

                    {entry.type === 'season' && (
                      <div className="p-2.5 rounded bg-[var(--accent-muted)] border border-[var(--accent)]/40 text-[var(--accent)] text-xs flex items-center gap-2 font-mono font-semibold">
                        <span>{entry.message}</span>
                      </div>
                    )}

                    {entry.type === 'easter-egg' && (
                      <div className="p-2.5 rounded bg-[var(--accent-muted)] border border-[var(--accent)]/40 text-[var(--accent)] text-xs font-mono">
                        {entry.message}
                      </div>
                    )}

                    {entry.type === 'error' && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-[#EF4444] text-xs font-mono space-y-1">
                        <div>⚠ {entry.message}</div>
                        {entry.hint && (
                          <div className="text-[11px] text-[var(--text-muted)]">{entry.hint}</div>
                        )}
                        {entry.availableSlugs && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {entry.availableSlugs.map((slug) => (
                              <button
                                key={slug}
                                type="button"
                                onClick={() => runCommand(`project ${slug}`)}
                                className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] text-[var(--accent)] text-[10px] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                              >
                                {slug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-4 py-2.5 bg-[var(--terminal-header)] border-t border-[var(--terminal-border)] flex items-center gap-2.5 overflow-x-auto select-none shrink-0">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider shrink-0 hidden sm:inline">
                  {t('terminal.chipsLabel')}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {QUICK_COMMAND_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => runCommand(chip)}
                      className="px-2.5 py-1 rounded-md bg-[var(--terminal-surface)] hover:bg-[var(--terminal-surface)] border border-[var(--terminal-border)] hover:border-[var(--accent)] text-[var(--terminal-muted)] hover:text-[var(--terminal-text)] font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Command Line Input (Prompt matching Image 2: → ~ |) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runCommand(inputVal);
                }}
                className="flex items-center gap-2 mx-3 my-3 pl-3.5 pr-1.5 py-1.5 rounded-xl bg-[var(--terminal-header)] border border-[var(--terminal-border)] focus-within:border-[var(--accent)] transition-colors shadow-inner shrink-0"
              >
                {/* Prompt prefix: arrow + tilde */}
                <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs font-semibold select-none">
                  <span className="text-[#ff5f56] font-bold">→</span>
                  <span className="text-[var(--accent)] font-semibold">~</span>
                </div>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  placeholder={t('terminal.placeholder')}
                  aria-label={t('terminal.inputAria')}
                  className="flex-1 bg-transparent text-[var(--terminal-text)] placeholder-[var(--text-muted)] font-mono text-xs sm:text-sm outline-none border-none focus:ring-0 p-0"
                />

                {/* Submit / Execute Button */}
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[var(--terminal-surface)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:pointer-events-none border border-[var(--terminal-border)] text-[var(--terminal-text)] text-[11px] font-mono font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  aria-label={t('terminal.submitAria')}
                >
                  <span className="hidden sm:inline">Enter</span>
                  <FiCornerDownLeft size={12} aria-hidden="true" />
                </button>
              </form>

              {/* Terminal Footer info */}
              <div className="px-4 py-1.5 bg-[var(--terminal-header)] border-t border-[var(--terminal-border)] flex items-center justify-between gap-3 text-[10px] font-mono text-[var(--terminal-muted)] dark:text-neutral-400 select-none shrink-0">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('terminal.historyNavHint')}</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
                  <kbd className="px-1.5 py-px rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] text-[var(--terminal-muted)]">ESC</kbd>
                  <span>/ exit</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
};

export default DeveloperTerminal;
