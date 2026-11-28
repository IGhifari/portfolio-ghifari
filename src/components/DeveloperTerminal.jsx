import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FiCornerDownLeft,
  FiTrash2,
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
import TerminalOutputEntry from './terminal/TerminalOutputEntry';

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
          className="fixed inset-0 z-[140] bg-[var(--modal-backdrop)] backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
                  <TerminalOutputEntry
                    key={entry.id}
                    entry={entry}
                    language={language}
                    t={t}
                    opensNewTabLabel={t('nav.opensNewTab') || 'opens in a new tab'}
                    githubData={githubData}
                    copiedKey={copiedKey}
                    onRunCommand={runCommand}
                    onCopyToClipboard={copyToClipboard}
                  />
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
