import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiRotateCcw,
  FiX,
} from 'react-icons/fi';

import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from '@/context/RouterContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { siteConfig } from '@/config/site';
import RolloverLabel from '../ui/RolloverLabel';

const NAKULA_EASE = [0.22, 1, 0.36, 1];
const MAX_INPUT_CHARS = 500;
const MAX_HISTORY_TURNS = 6;

const V1_TO_V2_SECTION_MAP = {
  '#top': '#v2-top',
  '#home': '#v2-top',
  '#profile': '#v2-about',
  '#about': '#v2-about',
  '#projects': '#v2-work',
  '#work': '#v2-work',
  '#skills': '#v2-stack',
  '#stack': '#v2-stack',
  '#experience': '#v2-experience',
  '#education': '#v2-experience',
  '#academic': '#v2-experience',
  '#github': '#v2-github',
  '#certificates': '#v2-certificates',
  '#faq': '#v2-faq',
  '#contact': '#v2-contact',
  '#contact2': '#v2-contact',
};

/**
 * Portfolio V2 Editorial AI Concierge
 * Connects to the verified `/api/chat` strict knowledge engine with Portfolio V2's
 * Nakula aesthetic: hairline prompt list, open editorial dialogue, V2 pill citations,
 * `data-lenis-prevent` scroll isolation, and full `useFocusTrap` accessibility.
 */
export default function V2ChatAssistant() {
  const { language, t } = useLanguage();
  const { navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const launcherBtnRef = useRef(null);

  const rawSuggestions = t('chatbot.suggestions', []);
  const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  useFocusTrap({
    isOpen,
    containerRef: panelRef,
    initialFocusRef:
      typeof window !== 'undefined' && window.innerWidth >= 640 ? inputRef : closeBtnRef,
    triggerRef: launcherBtnRef,
    fallbackSelector: '#v2-chatbot-launcher-btn',
    onClose: () => setIsOpen(false),
  });

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleNavigateToSource = useCallback(
    (sectionId) => {
      if (!sectionId || typeof sectionId !== 'string') return;

      // Route path (e.g. `/study-case/akseskita`)
      if (sectionId.startsWith('/')) {
        setIsOpen(false);
        navigate(sectionId);
        return;
      }

      const normalized = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
      const mappedHash = V1_TO_V2_SECTION_MAP[normalized.toLowerCase()] || normalized;

      const targetEl =
        document.querySelector(mappedHash) ||
        (mappedHash === '#v2-contact' ? document.querySelector('#v2-subpage-contact') : null) ||
        document.querySelector(normalized);

      if (targetEl) {
        const y = targetEl.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
        if (window.innerWidth < 640) {
          setIsOpen(false);
        }
        return;
      }

      // If currently on a V2 subpage (`/study-case/...`), jump back to Home anchor
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        setIsOpen(false);
        navigate(`/${mappedHash}`);
      }
    },
    [navigate, shouldReduceMotion]
  );

  const sendMessage = useCallback(
    async (rawText, { isRetry = false } = {}) => {
      const trimmed = String(rawText || '').trim();
      if (!trimmed || isLoading) return;

      const cleanQuery = trimmed.slice(0, MAX_INPUT_CHARS);

      const cleanMessages = messages.filter(
        (m) =>
          !m.isError &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      );

      const eligibleMessages =
        isRetry &&
        cleanMessages.length > 0 &&
        cleanMessages[cleanMessages.length - 1].role === 'user'
          ? cleanMessages.slice(0, -1)
          : cleanMessages;

      const validPairs = [];
      for (let i = 0; i < eligibleMessages.length - 1; i += 2) {
        if (
          eligibleMessages[i]?.role === 'user' &&
          eligibleMessages[i + 1]?.role === 'assistant'
        ) {
          validPairs.push(
            {
              role: 'user',
              content: eligibleMessages[i].content.trim().slice(0, MAX_INPUT_CHARS),
            },
            {
              role: 'assistant',
              content: eligibleMessages[i + 1].content.trim().slice(0, MAX_INPUT_CHARS),
            }
          );
        }
      }
      const priorHistory = validPairs.slice(-MAX_HISTORY_TURNS);
      const userMsgId = `v2-user-${Date.now()}`;

      setMessages((prev) => {
        const base = isRetry ? prev.filter((m) => !m.isError) : prev;
        if (isRetry) return base;
        return [
          ...base,
          {
            id: userMsgId,
            role: 'user',
            content: cleanQuery,
          },
        ];
      });

      if (!isRetry) {
        setInput('');
      }
      setIsLoading(true);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanQuery,
            lang: language,
            history: priorHistory,
          }),
          signal: controller.signal,
        });

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok || !data?.ok) {
          const errMessage = data?.error?.message || t('chatbot.networkError');
          setMessages((prev) => [
            ...prev,
            {
              id: `v2-err-${Date.now()}`,
              role: 'assistant',
              content: errMessage,
              sources: [],
              isError: true,
              retryQuery: cleanQuery,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `v2-bot-${Date.now()}`,
            role: 'assistant',
            content: data.answer,
            sources: Array.isArray(data.sources) ? data.sources : [],
            meta: data.meta || {},
            isError: false,
          },
        ]);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setMessages((prev) => [
          ...prev,
          {
            id: `v2-err-${Date.now()}`,
            role: 'assistant',
            content: t('chatbot.networkError'),
            sources: [],
            isError: true,
            retryQuery: cleanQuery,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, language, messages, t]
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearChat = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages([]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-[115]">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="v2-chat-launcher"
            ref={launcherBtnRef}
            type="button"
            id="v2-chatbot-launcher-btn"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-label={t('chatbot.openAria')}
            onClick={() => setIsOpen(true)}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.32, ease: NAKULA_EASE }}
            className="v2-pill-btn v2-nav-talk-btn !h-[48px] !px-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--v2-accent)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--v2-accent)]" />
            </span>
            <RolloverLabel text={t('v2.chat.askAi')} />
          </motion.button>
        ) : (
          <motion.section
            key="v2-chat-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('chatbot.title')}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.44, ease: NAKULA_EASE }}
            className="w-[calc(100vw-2rem)] sm:w-[430px] h-[min(620px,calc(100dvh-6rem))] flex flex-col rounded-[16px] overflow-hidden border border-[var(--v2-border-strong)] bg-[var(--v2-bg)] shadow-[0_28px_80px_rgba(0,0,0,0.68)] will-change-transform"
          >
            {/* Editorial Header (Matches V2 Menu Drawer Header) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--v2-border-strong)] bg-[var(--v2-bg)] select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="inline-block h-1.5 w-1.5 bg-[var(--v2-accent)] shrink-0"
                  aria-hidden="true"
                />
                <span
                  role="heading"
                  aria-level="2"
                  className="text-[13px] font-semibold uppercase tracking-[-0.02em] text-[var(--v2-text)] truncate"
                >
                  {siteConfig.bot?.name || 'GHIFARI AI'}
                </span>
                <span className="text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)] shrink-0">
                  ({t('v2.chat.conciergeBadge')})
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    aria-label={t('chatbot.clearChatAria')}
                    title={t('chatbot.clearChatAria')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors relative after:content-[''] after:absolute after:-inset-1 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                  >
                    <FiRotateCcw size={13} aria-hidden="true" />
                  </button>
                )}

                <button
                  ref={closeBtnRef}
                  type="button"
                  id="v2-chatbot-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label={t('chatbot.closeAria')}
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] text-[var(--v2-text)] hover:border-[var(--v2-text-dim)] hover:text-[var(--v2-text-bright)] transition-colors relative after:content-[''] after:absolute after:-inset-1 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <FiX
                    size={16}
                    className="transition-transform duration-300 group-hover:rotate-90"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {/* Scrollable Dialogue Feed (`data-lenis-prevent` isolates wheel scrolling from page!) */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-5 py-6 space-y-6 v2-gh-scroll"
            >
              {/* Empty State: Editorial Intro + Numbered Hairline Prompts */}
              {messages.length === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <p className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.045em] leading-[1.12] text-[var(--v2-text)]">
                      {t('v2.chat.emptyHeadline')}
                    </p>
                    <p className="text-[14px] leading-[1.45] tracking-[-0.015em] text-[var(--v2-text-dim)]">
                      {t('chatbot.welcomeBody')}
                    </p>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[12px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                        ({t('v2.chat.suggestedInquiries')})
                      </p>

                      <div className="border-t border-[var(--v2-border-strong)] divide-y divide-[var(--v2-border)]">
                        {suggestions.map((question, idx) => (
                          <button
                            key={question}
                            type="button"
                            disabled={isLoading}
                            onClick={() => sendMessage(question)}
                            className="group w-full py-3.5 text-left flex items-start justify-between gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                          >
                            <div className="flex items-baseline gap-3 min-w-0">
                              <span
                                className="text-[12px] font-semibold tracking-[-0.03em] text-[var(--v2-text-dim)] tabular-nums shrink-0"
                                aria-hidden="true"
                              >
                                {String(idx + 1).padStart(2, '0')}
                                <span className="text-[var(--v2-accent)]">.</span>
                              </span>
                              <span className="text-[14px] font-medium tracking-[-0.02em] leading-[1.35] text-[var(--v2-text-muted)] group-hover:text-[var(--v2-text-bright)] transition-colors">
                                {question}
                              </span>
                            </div>

                            <FiArrowUpRight
                              size={15}
                              className="mt-0.5 shrink-0 text-[var(--v2-text-dim)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--v2-accent)]"
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Messages */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-2 text-[11px] uppercase tracking-[-0.02em] ${
                        isUser ? 'justify-end text-[var(--v2-text-dim)]' : 'justify-start text-[var(--v2-text-dim)]'
                      }`}
                    >
                      {!isUser && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)]"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        ({isUser ? t('v2.chat.youLabel') : siteConfig.bot?.name || 'GHIFARI AI'})
                      </span>
                    </div>

                    {isUser ? (
                      <div className="flex justify-end">
                        <div className="max-w-[88%] rounded-[12px] border border-[var(--v2-border-strong)] bg-[var(--v2-surface)] px-4 py-3 text-[14px] font-medium tracking-[-0.015em] leading-[1.45] text-[var(--v2-text-bright)] whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`pl-3.5 border-l space-y-3 ${
                          msg.isError
                            ? 'border-rose-500/70'
                            : 'border-[var(--v2-border-strong)]'
                        }`}
                      >
                        {msg.meta?.refused && (
                          <span className="inline-block rounded-full border border-[var(--v2-border-strong)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[-0.01em] text-[var(--v2-text-muted)]">
                            {t('chatbot.strictGuardBadge')}
                          </span>
                        )}

                        {msg.isError && (
                          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-400">
                            <FiAlertCircle size={13} aria-hidden="true" />
                            <span>{t('v2.chat.connectionNotice')}</span>
                          </div>
                        )}

                        <p className="text-[14px] leading-[1.58] tracking-[-0.01em] text-[var(--v2-text)] whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>

                        {msg.isError && msg.retryQuery && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => sendMessage(msg.retryQuery, { isRetry: true })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--v2-border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[-0.02em] text-[var(--v2-text)] hover:border-[var(--v2-accent)] transition-colors"
                          >
                            <FiRotateCcw size={11} aria-hidden="true" />
                            <span>{t('chatbot.retryBtn')}</span>
                          </button>
                        )}

                        {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                          <div className="pt-1 space-y-2">
                            <span className="block text-[11px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                              ({t('chatbot.sourcesLabel')})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src) => (
                                <button
                                  key={src.id}
                                  type="button"
                                  onClick={() => handleNavigateToSource(src.sectionId)}
                                  title={`${t('chatbot.jumpToSection')} ${src.sectionId}`}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--v2-border-strong)] px-3 py-1 text-[11px] font-medium tracking-[-0.01em] text-[var(--v2-text-muted)] hover:border-[var(--v2-accent)] hover:text-[var(--v2-text-bright)] transition-colors"
                                >
                                  <span className="truncate max-w-[190px]">{src.title}</span>
                                  {src.sectionId && (
                                    <FiArrowUpRight
                                      size={11}
                                      className="text-[var(--v2-accent)] shrink-0"
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Minimal Editorial Thinking State */}
              {isLoading && (
                <div className="space-y-2" role="status" aria-live="polite">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[-0.02em] text-[var(--v2-text-dim)]">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] animate-pulse"
                      aria-hidden="true"
                    />
                    <span>({siteConfig.bot?.name || 'GHIFARI AI'})</span>
                  </div>
                  <div className="pl-3.5 border-l border-[var(--v2-accent)] py-0.5 flex items-center gap-2.5 text-[14px] tracking-[-0.02em] text-[var(--v2-text-muted)]">
                    <span>{t('chatbot.thinking', t('v2.chat.thinkingFallback'))}</span>
                    <span className="inline-flex items-center gap-1" aria-hidden="true">
                      <span className="h-1 w-1 rounded-full bg-[var(--v2-accent)] animate-bounce [animation-delay:-0.24s]" />
                      <span className="h-1 w-1 rounded-full bg-[var(--v2-accent)] animate-bounce [animation-delay:-0.12s]" />
                      <span className="h-1 w-1 rounded-full bg-[var(--v2-accent)] animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Frameless Editorial Input Footer */}
            <form
              onSubmit={handleFormSubmit}
              className="px-5 py-3.5 border-t border-[var(--v2-border-strong)] bg-[var(--v2-bg)] space-y-2 select-none"
            >
              <div className="v2-inquiry-row !py-2 flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={MAX_INPUT_CHARS}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
                  disabled={isLoading}
                  placeholder={t('chatbot.inputPlaceholder')}
                  aria-label={t('chatbot.inputPlaceholder')}
                  className="v2-inquiry-input !text-[15px] !font-normal flex-1 min-w-0 bg-transparent border-0 p-0 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  aria-label={t('chatbot.sendAria')}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--v2-accent)] text-[var(--v2-accent-ink)] hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-opacity relative after:content-[''] after:absolute after:-inset-1 after:min-w-[44px] after:min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]"
                >
                  <FiArrowUpRight size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] tracking-[-0.01em] text-[var(--v2-text-dim)]">
                <span className="truncate">{t('chatbot.subtitle')}</span>
                {input.length > 350 && (
                  <span className="tabular-nums shrink-0 ml-2">
                    {input.length}/{MAX_INPUT_CHARS}
                  </span>
                )}
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
