import { useState, useRef, useEffect, useCallback } from 'react';
import { IoClose, IoSend, IoSparklesSharp } from 'react-icons/io5';
import {
  FiMessageSquare,
  FiRotateCcw,
  FiArrowUpRight,
  FiShield,
  FiAlertCircle,
  FiCornerDownRight,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const MAX_INPUT_CHARS = 500;
const MAX_HISTORY_TURNS = 6;

const SECTION_FALLBACK_MAP = {
  '#skills': '#stack',
  '#academic': '#education',
  '#contact2': '#contact',
};

const ChatAssistant = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const suggestions = t('chatbot.suggestions', []);
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Focus input when opened on desktop
  useEffect(() => {
    if (isOpen && window.innerWidth >= 640) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Cleanup any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleNavigateToSection = (sectionId) => {
    if (!sectionId || typeof sectionId !== 'string') return;

    // Trigger lazy DeferredSection mount if not yet rendered
    window.dispatchEvent(new Event('scroll'));

    const normalizedHash = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
    const fallbackHash = SECTION_FALLBACK_MAP[normalizedHash] || normalizedHash;

    setTimeout(() => {
      const targetEl =
        document.querySelector(normalizedHash) ||
        document.querySelector(fallbackHash);

      if (targetEl) {
        const yOffset = -72;
        const y =
          targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }

      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }, 60);
  };

  const sendMessage = async (rawText, { isRetry = false } = {}) => {
    const trimmed = String(rawText || '').trim();
    if (!trimmed || isLoading) return;

    const cleanQuery = trimmed.slice(0, MAX_INPUT_CHARS);

    // Build history from valid prior turns before adding current message
    const priorHistory = messages
      .filter(
        (m) =>
          !m.isError &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, MAX_INPUT_CHARS),
      }));

    const userMsgId = `user-${Date.now()}`;

    setMessages((prev) => {
      const base = isRetry ? prev.filter((m) => !m.isError) : prev;
      if (isRetry) {
        return base;
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        const errMessage =
          data?.error?.message || t('chatbot.networkError');
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
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
          id: `bot-${Date.now()}`,
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
          id: `err-${Date.now()}`,
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
  };

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
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Floating Trigger Button (Shown when closed) */}
      {!isOpen && (
        <button
          type="button"
          id="chatbot-launcher-btn"
          onClick={() => setIsOpen(true)}
          aria-label={t('chatbot.openAria')}
          className="group flex items-center gap-2.5 h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] shadow-2xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] transition-transform duration-200 group-hover:scale-105">
            <IoSparklesSharp size={14} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[var(--surface)]" />
          </span>

          <span className="font-mono font-bold text-xs tracking-wider uppercase text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {t('chatbot.launcherLabel')}
          </span>
        </button>
      )}

      {/* Chat Assistant Panel */}
      {isOpen && (
        <section
          role="dialog"
          aria-label={t('chatbot.title')}
          className="w-[calc(100vw-2rem)] sm:w-[400px] md:w-[420px] h-[min(580px,calc(100vh-6.5rem))] flex flex-col rounded-xl overflow-hidden bg-[var(--surface)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-2xl animate-fadeIn select-text"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/90">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                <IoSparklesSharp size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--accent)] truncate">
                    {t('chatbot.badge')}
                  </span>
                </div>
                <h2 className="font-grotesk font-bold text-sm text-[var(--text-primary)] truncate">
                  {t('chatbot.title')}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  aria-label={t('chatbot.clearChatAria')}
                  title={t('chatbot.clearChatAria')}
                  className="h-7 px-2 rounded flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer focus-visible:outline-none"
                >
                  <FiRotateCcw size={11} />
                  <span className="hidden sm:inline">{t('chatbot.clearChat')}</span>
                </button>
              )}

              <button
                type="button"
                id="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label={t('chatbot.closeAria')}
                className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer focus-visible:outline-none"
              >
                <IoClose size={18} />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Welcome Card & Quick Starter Suggestions */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
                    <FiShield size={12} />
                    <span>STRICT KNOWLEDGE MODE</span>
                  </div>
                  <p className="font-grotesk font-semibold text-xs sm:text-sm text-[var(--text-primary)] leading-snug">
                    {t('chatbot.welcomeTitle')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t('chatbot.welcomeBody')}
                  </p>
                </div>

                {safeSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-0.5">
                      {t('chatbot.suggestedLabel')}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {safeSuggestions.map((question, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => sendMessage(question)}
                          className="group w-full text-left px-3 py-2.5 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-150 flex items-start gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        >
                          <FiCornerDownRight
                            size={13}
                            className="mt-0.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] flex-shrink-0 transition-colors"
                          />
                          <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-snug transition-colors">
                            {question}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Role Mini Label */}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1 px-1">
                    {isUser ? (language === 'en' ? 'YOU' : 'ANDA') : 'GHIFARI AI'}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-medium rounded-br-xs'
                        : msg.isError
                        ? 'bg-red-500/10 border border-red-500/30 text-[var(--text-primary)] rounded-bl-xs'
                        : 'bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-xs'
                    }`}
                  >
                    {/* Strict Refusal / Guard Badge */}
                    {!isUser && msg.meta?.refused && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-2 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                        <FiShield size={10} className="text-[var(--accent)]" />
                        <span>{t('chatbot.strictGuardBadge')}</span>
                      </div>
                    )}

                    {/* Error Indicator */}
                    {msg.isError && (
                      <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[10px] uppercase tracking-wider text-red-400">
                        <FiAlertCircle size={12} />
                        <span>ERROR</span>
                      </div>
                    )}

                    <div>{msg.content}</div>

                    {/* Retry Button for Failed Request */}
                    {msg.isError && msg.retryQuery && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          sendMessage(msg.retryQuery, { isRetry: true })
                        }
                        className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <FiRotateCcw size={11} />
                        <span>{t('chatbot.retryBtn')}</span>
                      </button>
                    )}

                    {/* Verified Source References */}
                    {!isUser &&
                      Array.isArray(msg.sources) &&
                      msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] space-y-1.5">
                          <span className="block font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                            {t('chatbot.sourcesLabel')}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src) => (
                              <button
                                key={src.id}
                                type="button"
                                onClick={() =>
                                  handleNavigateToSection(src.sectionId)
                                }
                                title={`${t('chatbot.jumpToSection')} ${src.sectionId}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--tag-bg)] hover:bg-[var(--surface-hover)] border border-[var(--tag-border)] hover:border-[var(--accent)] font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                              >
                                <span className="truncate max-w-[190px]">
                                  {src.title}
                                </span>
                                {src.sectionId && (
                                  <FiArrowUpRight
                                    size={10}
                                    className="flex-shrink-0"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1 px-1">
                  GHIFARI AI
                </span>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl rounded-bl-xs bg-[var(--surface-alt)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse delay-150" />
                  </div>
                  <span>{t('chatbot.thinking')}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-[var(--border)] bg-[var(--surface-muted)]/95 space-y-2"
          >
            <div className="flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                maxLength={MAX_INPUT_CHARS}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
                disabled={isLoading}
                placeholder={t('chatbot.inputPlaceholder')}
                aria-label={t('chatbot.inputPlaceholder')}
                className="flex-1 min-w-0 h-7 bg-transparent border-0 text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />

              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                aria-label={t('chatbot.sendAria')}
                className="w-8 h-8 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-35 disabled:pointer-events-none text-[var(--accent-contrast)] flex items-center justify-center transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                <IoSend size={13} className="translate-x-[0.5px]" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1 font-mono text-[10px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5 truncate">
                <FiMessageSquare size={10} className="flex-shrink-0" />
                <span className="truncate">{t('chatbot.subtitle')}</span>
              </span>
              <span className="flex-shrink-0 ml-2">
                {input.length}/{MAX_INPUT_CHARS}
              </span>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default ChatAssistant;
